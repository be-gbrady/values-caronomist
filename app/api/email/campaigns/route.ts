// POST /api/email/campaigns — Campaign trigger webhook
// Called by: Memberstack webhook, Stripe webhook (post-upgrade), cron jobs
// Purpose: trigger the correct drip email based on event type + member state
//
// Supported events:
//   member.signup       → send "welcome" immediately
//   member.day7         → send "day7-upsell" (cron-triggered, 7 days after signup)
//   member.day30        → send "day30-upsell" (cron-triggered, 30 days after signup)
//   member.upgraded.pro → send "pro-upgrade"
//   member.churn_risk   → send "churn-risk" (cron, 30d inactivity on Pro)
//   newsletter.monthly  → send "monthly-newsletter" (batch, Pro + Pro+ audience)
//
// Auth: Bearer INTERNAL_API_SECRET
// Idempotency: event_id deduplication via email_events table (file fallback available)

import { NextRequest, NextResponse } from "next/server";
import { sendEmail, EmailContext } from "@/lib/email";
import { writeFile, readFile } from "fs/promises";
import { mkdir } from "fs/promises";
import path from "path";

type CampaignEvent =
  | "member.signup"
  | "member.day7"
  | "member.day30"
  | "member.upgraded.pro"
  | "member.churn_risk"
  | "newsletter.monthly";

interface CampaignRequest {
  event: CampaignEvent;
  eventId?: string;  // idempotency key
  member: {
    email: string;
    name?: string;
    tier?: "free" | "pro" | "pro-plus";
    vehicleModel?: string;
    couponCode?: string;
    couponExpiry?: string;
  };
}

const INTERNAL_API_SECRET = process.env.INTERNAL_API_SECRET ?? "";
const EMAIL_EVENTS_PATH = path.join(
  process.cwd(),
  "data",
  "email-events.json"
);

// ─── Event ID deduplication (file-based fallback when DB not connected) ─────
async function hasEventBeenSent(eventId: string): Promise<boolean> {
  if (!eventId) return false;
  try {
    const raw = await readFile(EMAIL_EVENTS_PATH, "utf8");
    const events: { eventId: string; ts: string }[] = JSON.parse(raw);
    return events.some((e) => e.eventId === eventId);
  } catch {
    return false;
  }
}

async function recordEventSent(
  eventId: string,
  event: CampaignEvent,
  toEmail: string
): Promise<void> {
  if (!eventId) return;
  let events: { eventId: string; event: string; to: string; ts: string }[] = [];
  try {
    const raw = await readFile(EMAIL_EVENTS_PATH, "utf8");
    events = JSON.parse(raw);
  } catch {
    // file doesn't exist yet
  }
  events.push({ eventId, event, to: toEmail, ts: new Date().toISOString() });
  await mkdir(path.dirname(EMAIL_EVENTS_PATH), { recursive: true });
  await writeFile(EMAIL_EVENTS_PATH, JSON.stringify(events, null, 2));
}

// ─── DB-backed deduplication (when DATABASE_URL is set) ─────────────────────
// Using any to avoid requiring @types/pg at compile time (pg loaded at runtime only)
async function dbHasEventBeenSent(eventId: string): Promise<boolean> {
  const DATABASE_URL = process.env.DATABASE_URL;
  if (!DATABASE_URL || !eventId) return false;
  try {
    // Dynamic import to avoid Turbopack static analysis
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const pg: any = await eval('import("pg")');
    const Pool = pg.Pool ?? pg.default?.Pool;
    const pool = new Pool({ connectionString: DATABASE_URL, ssl: { rejectUnauthorized: false } });
    const result = await pool.query(
      "SELECT 1 FROM email_events WHERE event_id = $1 LIMIT 1",
      [eventId]
    );
    await pool.end();
    return (result.rowCount ?? 0) > 0;
  } catch {
    return false; // fall through to file-based check
  }
}

async function dbRecordEventSent(
  eventId: string,
  event: CampaignEvent,
  toEmail: string
): Promise<void> {
  const DATABASE_URL = process.env.DATABASE_URL;
  if (!DATABASE_URL || !eventId) return;
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const pg: any = await eval('import("pg")');
    const Pool = pg.Pool ?? pg.default?.Pool;
    const pool = new Pool({ connectionString: DATABASE_URL, ssl: { rejectUnauthorized: false } });
    await pool.query(
      `INSERT INTO email_events (event_id, event_type, to_email, sent_at)
       VALUES ($1, $2, $3, NOW())
       ON CONFLICT (event_id) DO NOTHING`,
      [eventId, event, toEmail]
    );
    await pool.end();
  } catch {
    // Non-fatal: file fallback handles it
  }
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  // Auth
  if (INTERNAL_API_SECRET) {
    const authHeader = req.headers.get("authorization") ?? "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
    if (token !== INTERNAL_API_SECRET) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
  }

  let body: CampaignRequest;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ success: false, error: "Invalid JSON" }, { status: 400 });
  }

  const { event, eventId, member } = body;

  if (!event || !member?.email) {
    return NextResponse.json(
      { success: false, error: "event and member.email are required" },
      { status: 422 }
    );
  }

  // Idempotency check — prefer DB, fallback to file
  if (eventId) {
    const alreadySent =
      (await dbHasEventBeenSent(eventId)) || (await hasEventBeenSent(eventId));
    if (alreadySent) {
      return NextResponse.json({
        success: true,
        skipped: true,
        reason: "duplicate event_id",
        eventId,
      });
    }
  }

  // Map event → template
  const templateMap: Record<CampaignEvent, Parameters<typeof sendEmail>[0]> = {
    "member.signup": "welcome",
    "member.day7": "day7-upsell",
    "member.day30": "day30-upsell",
    "member.upgraded.pro": "pro-upgrade",
    "member.churn_risk": "churn-risk",
    "newsletter.monthly": "monthly-newsletter",
  };

  const template = templateMap[event];
  if (!template) {
    return NextResponse.json(
      { success: false, error: `Unknown event: ${event}` },
      { status: 422 }
    );
  }

  const ctx: EmailContext = {
    toEmail: member.email.trim().toLowerCase(),
    toName: member.name,
    vehicleModel: member.vehicleModel,
    couponCode: member.couponCode,
    couponExpiry: member.couponExpiry,
  };

  const result = await sendEmail(template, ctx);

  if (!result.ok) {
    console.error(`[campaigns] Failed to send ${template} to ${ctx.toEmail}:`, result.error);
    return NextResponse.json(
      { success: false, error: result.error ?? "Send failed" },
      { status: 502 }
    );
  }

  // Record sent (DB-first, file fallback)
  if (eventId) {
    await dbRecordEventSent(eventId, event, ctx.toEmail);
    await recordEventSent(eventId, event, ctx.toEmail);
  }

  return NextResponse.json({
    success: true,
    messageId: result.messageId,
    provider: result.provider,
    event,
    template,
    to: ctx.toEmail,
  });
}

export async function GET(): Promise<NextResponse> {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}
