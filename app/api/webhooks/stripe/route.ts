/**
 * Stripe Webhook Handler — values.caronomist.com
 *
 * Handles 6 Stripe events per pro-paywall-spec-2026-04-02.md §7:
 *   1. customer.subscription.created
 *   2. customer.subscription.updated
 *   3. customer.subscription.deleted
 *   4. invoice.payment_failed
 *   5. invoice.payment_succeeded
 *   6. charge.dispute.created  (chargeback)
 *
 * Architecture:
 *   - Signature verification on every request (Stripe-Signature header)
 *   - Idempotency via webhook_events table (duplicate event_id = skip)
 *   - All DB writes are env-var gated (DATABASE_URL required)
 *   - File-based audit log fallback when DATABASE_URL not configured
 *   - Zero hard dependencies beyond stripe SDK + Node built-ins
 *
 * Setup:
 *   1. stripe listen --forward-to localhost:3000/api/webhooks/stripe  (dev)
 *   2. Add webhook endpoint in Stripe Dashboard → Developers → Webhooks
 *      URL: https://values.caronomist.com/api/webhooks/stripe
 *      Events: customer.subscription.*, invoice.payment_*, charge.dispute.created
 *   3. Copy signing secret → STRIPE_WEBHOOK_SECRET env var
 */

import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { isBillingEnabled } from "@/lib/billing";
import { writeFile, readFile, appendFile } from "fs/promises";
import path from "path";

// ─── Config ────────────────────────────────────────────────────────────────

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY ?? "";
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET ?? "";
const DATABASE_URL = process.env.DATABASE_URL ?? "";

// Stripe price ID → member tier mapping
// Populate these with Stripe price IDs when billing is enabled (T-131)
const PRICE_TIER_MAP: Record<string, { tier: "pro" | "pro_plus"; interval: "monthly" | "yearly" }> = {
  [process.env.STRIPE_PRICE_PRO_MONTHLY ?? "price_pro_monthly"]: { tier: "pro", interval: "monthly" },
  [process.env.STRIPE_PRICE_PRO_YEARLY ?? "price_pro_yearly"]: { tier: "pro", interval: "yearly" },
  [process.env.STRIPE_PRICE_PRO_PLUS_MONTHLY ?? "price_pro_plus_monthly"]: { tier: "pro_plus", interval: "monthly" },
  [process.env.STRIPE_PRICE_PRO_PLUS_YEARLY ?? "price_pro_plus_yearly"]: { tier: "pro_plus", interval: "yearly" },
};

// Audit log file (file-based fallback when DB not connected)
const AUDIT_LOG_PATH = path.join(process.cwd(), "data", "webhook-audit.jsonl");

// ─── Stripe client ──────────────────────────────────────────────────────────

function getStripe(): Stripe {
  if (!STRIPE_SECRET_KEY) {
    throw new Error("STRIPE_SECRET_KEY not configured");
  }
  return new Stripe(STRIPE_SECRET_KEY, { apiVersion: "2025-01-27.acacia" });
}

// ─── Database helpers (env-var gated) ──────────────────────────────────────

type DbClient = {
  query: (sql: string, params?: unknown[]) => Promise<{ rows: unknown[] }>;
  end: () => Promise<void>;
};

async function getDbClient(): Promise<DbClient | null> {
  if (!DATABASE_URL) return null;
  // Dynamic import — avoids hard dependency when pg not installed.
  // Use eval to prevent static analysis from trying to bundle 'pg'.
  try {
    // eslint-disable-next-line no-eval
    const pgModule = await eval('import("pg")') as { default: { Client: new (opts: { connectionString: string }) => DbClient } };
    const { Client } = pgModule.default;
    const client = new Client({ connectionString: DATABASE_URL });
    await (client as unknown as { connect: () => Promise<void> }).connect();
    return client;
  } catch {
    console.error("[webhook] pg not available, falling back to file log");
    return null;
  }
}

async function logEventToDb(
  db: DbClient,
  eventId: string,
  eventType: string,
  customerId: string | null,
  subscriptionId: string | null,
  payload: Stripe.Event
): Promise<boolean> {
  // Check idempotency — already processed?
  const existing = await db.query(
    "SELECT id FROM webhook_events WHERE stripe_event_id = $1",
    [eventId]
  );
  if ((existing.rows as unknown[]).length > 0) {
    console.log(`[webhook] duplicate event ${eventId} — skipping`);
    return false; // already handled
  }

  await db.query(
    `INSERT INTO webhook_events
       (stripe_event_id, event_type, stripe_customer_id, stripe_subscription_id, raw_payload, received_at)
     VALUES ($1, $2, $3, $4, $5, NOW())`,
    [eventId, eventType, customerId, subscriptionId, JSON.stringify(payload)]
  );
  return true; // new event, proceed
}

async function markEventProcessed(db: DbClient, eventId: string, error?: string): Promise<void> {
  await db.query(
    `UPDATE webhook_events
     SET processed = $1, processing_error = $2, processed_at = NOW()
     WHERE stripe_event_id = $3`,
    [!error, error ?? null, eventId]
  );
}

async function upsertMember(
  db: DbClient,
  email: string,
  customerId: string,
  updates: Partial<{
    stripe_subscription_id: string | null;
    tier: string;
    tier_source: string;
    subscription_status: string | null;
    subscription_started_at: string | null;
    subscription_renewed_at: string | null;
    subscription_cancelled_at: string | null;
    subscription_ends_at: string | null;
    billing_interval: string | null;
    amount_cents: number | null;
    is_flagged: boolean;
    flag_reason: string | null;
  }>
): Promise<void> {
  const fields = Object.keys(updates);
  if (fields.length === 0) return;

  const setClauses = fields.map((f, i) => `${f} = $${i + 3}`).join(", ");
  const values = [email, customerId, ...Object.values(updates)];

  await db.query(
    `INSERT INTO members (email, stripe_customer_id, ${fields.join(", ")}, created_at, updated_at)
     VALUES ($1, $2, ${fields.map((_, i) => `$${i + 3}`).join(", ")}, NOW(), NOW())
     ON CONFLICT (email) DO UPDATE SET
       stripe_customer_id = EXCLUDED.stripe_customer_id,
       ${setClauses},
       updated_at = NOW()`,
    values
  );
}

// ─── File-based audit fallback ──────────────────────────────────────────────

async function appendAuditLog(entry: Record<string, unknown>): Promise<void> {
  try {
    await appendFile(AUDIT_LOG_PATH, JSON.stringify({ ...entry, ts: new Date().toISOString() }) + "\n");
  } catch {
    console.error("[webhook] audit log write failed", entry);
  }
}

// ─── Event handler helpers ──────────────────────────────────────────────────

function getTierFromSubscription(subscription: Stripe.Subscription): {
  tier: "pro" | "pro_plus" | "free";
  interval: "monthly" | "yearly" | null;
  amountCents: number | null;
} {
  const priceId = subscription.items?.data?.[0]?.price?.id ?? "";
  const mapped = PRICE_TIER_MAP[priceId];
  if (!mapped) {
    console.warn(`[webhook] unknown price ID ${priceId} — defaulting to pro`);
    return { tier: "pro", interval: "monthly", amountCents: null };
  }
  const amountCents = subscription.items?.data?.[0]?.price?.unit_amount ?? null;
  return { tier: mapped.tier, interval: mapped.interval, amountCents };
}

async function resolveCustomerEmail(stripe: Stripe, customerId: string): Promise<string | null> {
  try {
    const customer = await stripe.customers.retrieve(customerId);
    if (customer.deleted) return null;
    return (customer as Stripe.Customer).email ?? null;
  } catch {
    return null;
  }
}

// ─── Event Handlers ─────────────────────────────────────────────────────────

/**
 * customer.subscription.created
 * Member has subscribed (Pro or Pro+). Upsert member record with tier.
 */
async function handleSubscriptionCreated(
  stripe: Stripe,
  subscription: Stripe.Subscription,
  db: DbClient | null
): Promise<void> {
  const customerId = subscription.customer as string;
  const email = await resolveCustomerEmail(stripe, customerId);
  const { tier, interval, amountCents } = getTierFromSubscription(subscription);

  // cancel_at = explicit future cancel date; ended_at = date it ended if already done
  const endsAt = subscription.cancel_at
    ? new Date(subscription.cancel_at * 1000).toISOString()
    : subscription.ended_at
    ? new Date(subscription.ended_at * 1000).toISOString()
    : null;

  const memberUpdate = {
    stripe_subscription_id: subscription.id,
    tier,
    tier_source: "stripe",
    subscription_status: subscription.status,
    subscription_started_at: new Date(subscription.start_date * 1000).toISOString(),
    subscription_renewed_at: null as string | null,
    subscription_cancelled_at: null as string | null,
    subscription_ends_at: endsAt,
    billing_interval: interval,
    amount_cents: amountCents,
  };

  if (db && email) {
    await upsertMember(db, email, customerId, memberUpdate);
  }

  await appendAuditLog({
    event: "subscription.created",
    customerId,
    subscriptionId: subscription.id,
    email,
    tier,
    interval,
  });

  console.log(`[webhook] subscription.created — ${email ?? customerId} → ${tier} (${interval})`);
}

/**
 * customer.subscription.updated
 * Member upgraded (Pro → Pro+) or downgraded, or status changed.
 */
async function handleSubscriptionUpdated(
  stripe: Stripe,
  subscription: Stripe.Subscription,
  db: DbClient | null
): Promise<void> {
  const customerId = subscription.customer as string;
  const email = await resolveCustomerEmail(stripe, customerId);
  const { tier, interval, amountCents } = getTierFromSubscription(subscription);

  const isCancelling = subscription.cancel_at_period_end;
  const endsAtUpdated = subscription.cancel_at
    ? new Date(subscription.cancel_at * 1000).toISOString()
    : subscription.ended_at
    ? new Date(subscription.ended_at * 1000).toISOString()
    : null;

  const memberUpdate = {
    stripe_subscription_id: subscription.id,
    tier: isCancelling ? (subscription.status === "active" ? tier : "free") : tier,
    tier_source: "stripe",
    subscription_status: subscription.status,
    subscription_ends_at: endsAtUpdated,
    billing_interval: interval,
    amount_cents: amountCents,
    subscription_cancelled_at: isCancelling ? new Date().toISOString() : null as string | null,
  };

  if (db && email) {
    await upsertMember(db, email, customerId, memberUpdate);
  }

  await appendAuditLog({
    event: "subscription.updated",
    customerId,
    subscriptionId: subscription.id,
    email,
    tier,
    status: subscription.status,
    cancelAtPeriodEnd: isCancelling,
  });

  console.log(
    `[webhook] subscription.updated — ${email ?? customerId} → ${tier} (status: ${subscription.status}, cancelAtEnd: ${isCancelling})`
  );
}

/**
 * customer.subscription.deleted
 * Subscription cancelled (period ended or immediate). Downgrade to free.
 */
async function handleSubscriptionDeleted(
  stripe: Stripe,
  subscription: Stripe.Subscription,
  db: DbClient | null
): Promise<void> {
  const customerId = subscription.customer as string;
  const email = await resolveCustomerEmail(stripe, customerId);

  const memberUpdate = {
    stripe_subscription_id: null as string | null,
    tier: "free",
    tier_source: "stripe",
    subscription_status: "cancelled",
    subscription_cancelled_at: new Date().toISOString(),
    subscription_ends_at: null as string | null,
  };

  if (db && email) {
    await upsertMember(db, email, customerId, memberUpdate);
  }

  await appendAuditLog({
    event: "subscription.deleted",
    customerId,
    subscriptionId: subscription.id,
    email,
  });

  console.log(`[webhook] subscription.deleted — ${email ?? customerId} downgraded to free`);
}

/**
 * invoice.payment_failed
 * Payment failed (expired card, insufficient funds, etc.).
 * Mark subscription as past_due. Stripe will retry automatically.
 */
async function handlePaymentFailed(
  stripe: Stripe,
  invoice: Stripe.Invoice,
  db: DbClient | null
): Promise<void> {
  const customerId = invoice.customer as string;
  const email = await resolveCustomerEmail(stripe, customerId);
  // Stripe v22: subscription info moved to invoice.parent.subscription_details
  const subscriptionId =
    invoice.parent?.type === "subscription_details"
      ? (invoice.parent as unknown as { subscription_details?: { subscription?: string } })
          ?.subscription_details?.subscription ?? null
      : null;

  const memberUpdate = {
    stripe_subscription_id: subscriptionId,
    subscription_status: "past_due",
  };

  if (db && email) {
    await upsertMember(db, email, customerId, memberUpdate);
  }

  await appendAuditLog({
    event: "payment_failed",
    customerId,
    subscriptionId,
    email,
    invoiceId: invoice.id,
    amountDue: invoice.amount_due,
    attemptCount: invoice.attempt_count,
  });

  // TODO (T-134): Trigger Postmark payment-retry email to member
  console.warn(
    `[webhook] payment_failed — ${email ?? customerId} | attempt #${invoice.attempt_count} | $${(invoice.amount_due / 100).toFixed(2)}`
  );
}

/**
 * invoice.payment_succeeded
 * Successful renewal or new subscription payment.
 * Confirm tier remains active, log for MRR analytics.
 */
async function handlePaymentSucceeded(
  stripe: Stripe,
  invoice: Stripe.Invoice,
  db: DbClient | null
): Promise<void> {
  const customerId = invoice.customer as string;
  const email = await resolveCustomerEmail(stripe, customerId);
  // Stripe v22: subscription info moved to invoice.parent.subscription_details
  const subscriptionId =
    invoice.parent?.type === "subscription_details"
      ? (invoice.parent as unknown as { subscription_details?: { subscription?: string } })
          ?.subscription_details?.subscription ?? null
      : null;

  const memberUpdate = {
    stripe_subscription_id: subscriptionId,
    subscription_status: "active",
    subscription_renewed_at: new Date().toISOString(),
  };

  if (db && email) {
    await upsertMember(db, email, customerId, memberUpdate);
  }

  await appendAuditLog({
    event: "payment_succeeded",
    customerId,
    subscriptionId,
    email,
    invoiceId: invoice.id,
    amountPaid: invoice.amount_paid,
    billingReason: invoice.billing_reason,
  });

  console.log(
    `[webhook] payment_succeeded — ${email ?? customerId} | $${(invoice.amount_paid / 100).toFixed(2)} (${invoice.billing_reason})`
  );
}

/**
 * charge.dispute.created
 * Chargeback filed against a charge. Flag the member account for review.
 * High-priority — rare but needs immediate attention.
 */
async function handleChargeDispute(
  stripe: Stripe,
  dispute: Stripe.Dispute,
  db: DbClient | null
): Promise<void> {
  const chargeId = dispute.charge as string;
  let customerId: string | null = null;
  let email: string | null = null;

  try {
    const charge = await stripe.charges.retrieve(chargeId);
    customerId = charge.customer as string;
    if (customerId) {
      email = await resolveCustomerEmail(stripe, customerId);
    }
  } catch {
    console.error(`[webhook] charge.dispute — could not retrieve charge ${chargeId}`);
  }

  if (db && email && customerId) {
    await upsertMember(db, email, customerId, {
      is_flagged: true,
      flag_reason: `Chargeback dispute ${dispute.id} filed ${new Date().toISOString()} — reason: ${dispute.reason} — amount: $${(dispute.amount / 100).toFixed(2)}`,
    });
  }

  await appendAuditLog({
    event: "charge.dispute.created",
    disputeId: dispute.id,
    chargeId,
    customerId,
    email,
    amount: dispute.amount,
    reason: dispute.reason,
    status: dispute.status,
  });

  // Escalate to console (Orion monitoring will surface this)
  // TODO: Alert an operator when this fires (rare, needs immediate review)
  console.error(
    `[webhook] ⚠️ CHARGEBACK — ${email ?? customerId ?? chargeId} | dispute ${dispute.id} | $${(dispute.amount / 100).toFixed(2)} | reason: ${dispute.reason}`
  );
}

// ─── Main route handler ─────────────────────────────────────────────────────

export async function POST(req: NextRequest): Promise<NextResponse> {
  if (!isBillingEnabled()) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // 1. Signature verification
  if (!STRIPE_WEBHOOK_SECRET) {
    console.error("[webhook] STRIPE_WEBHOOK_SECRET not set — rejecting all events");
    return NextResponse.json({ error: "Webhook not configured" }, { status: 500 });
  }

  const sig = req.headers.get("stripe-signature");
  if (!sig) {
    return NextResponse.json({ error: "Missing stripe-signature header" }, { status: 400 });
  }

  let event: Stripe.Event;
  const rawBody = await req.text();

  try {
    const stripe = getStripe();
    event = stripe.webhooks.constructEvent(rawBody, sig, STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    const message = err instanceof Error ? err.message : "signature verification failed";
    console.error(`[webhook] signature verification failed: ${message}`);
    return NextResponse.json({ error: `Webhook error: ${message}` }, { status: 400 });
  }

  // 2. Establish DB connection (optional)
  const db = await getDbClient();

  // 3. Idempotency check
  let isNew = true;
  if (db) {
    // Dispute doesn't have .customer directly — cast via unknown
    const customerId =
      ((event.data.object as unknown) as { customer?: string | null })?.customer ?? null;
    const subscriptionId =
      (event.data.object as Stripe.Subscription)?.id?.startsWith("sub_")
        ? (event.data.object as Stripe.Subscription).id
        : null;

    isNew = await logEventToDb(
      db,
      event.id,
      event.type,
      typeof customerId === "string" ? customerId : null,
      subscriptionId,
      event
    );
  }

  if (!isNew) {
    await db?.end();
    return NextResponse.json({ received: true, duplicate: true });
  }

  // 4. Dispatch to handler
  const stripe = getStripe();
  let processingError: string | undefined;

  try {
    switch (event.type) {
      case "customer.subscription.created":
        await handleSubscriptionCreated(stripe, event.data.object as Stripe.Subscription, db);
        break;

      case "customer.subscription.updated":
        await handleSubscriptionUpdated(stripe, event.data.object as Stripe.Subscription, db);
        break;

      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(stripe, event.data.object as Stripe.Subscription, db);
        break;

      case "invoice.payment_failed":
        await handlePaymentFailed(stripe, event.data.object as Stripe.Invoice, db);
        break;

      case "invoice.payment_succeeded":
        await handlePaymentSucceeded(stripe, event.data.object as Stripe.Invoice, db);
        break;

      case "charge.dispute.created":
        await handleChargeDispute(stripe, event.data.object as Stripe.Dispute, db);
        break;

      default:
        console.log(`[webhook] unhandled event type: ${event.type}`);
    }
  } catch (err) {
    processingError = err instanceof Error ? err.message : String(err);
    console.error(`[webhook] handler error for ${event.type}:`, processingError);
  }

  // 5. Mark processed in DB
  if (db) {
    await markEventProcessed(db, event.id, processingError);
    await db.end();
  }

  if (processingError) {
    // Return 500 so Stripe retries
    return NextResponse.json({ error: processingError }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

// ─── GET: health check ─────────────────────────────────────────────────────
export async function GET(): Promise<NextResponse> {
  return NextResponse.json({
    status: "ok",
    endpoint: "/api/webhooks/stripe",
    events_handled: [
      "customer.subscription.created",
      "customer.subscription.updated",
      "customer.subscription.deleted",
      "invoice.payment_failed",
      "invoice.payment_succeeded",
      "charge.dispute.created",
    ],
    db_connected: !!DATABASE_URL,
    stripe_configured: !!STRIPE_SECRET_KEY && !!STRIPE_WEBHOOK_SECRET,
  });
}
