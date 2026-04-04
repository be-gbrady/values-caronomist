// Caronomist Values — Postmark Email Automation
// Implements 6 campaign templates + transactional send helper
// Postmark API: https://postmarkapp.com/developer/api/overview
// Env vars required: POSTMARK_SERVER_TOKEN, POSTMARK_FROM_EMAIL

export type EmailTemplate =
  | "welcome"
  | "day7-upsell"
  | "day30-upsell"
  | "pro-upgrade"
  | "monthly-newsletter"
  | "churn-risk";

export interface EmailContext {
  toEmail: string;
  toName?: string;
  // Optional personalization
  vehicleModel?: string;
  vehicleCount?: number;
  rankingHighlight?: string;
  couponCode?: string;
  couponExpiry?: string;
}

export interface PostmarkMessage {
  From: string;
  To: string;
  Subject: string;
  HtmlBody: string;
  TextBody: string;
  ReplyTo?: string;
  Tag: string;
  MessageStream: string;
  TrackOpens?: boolean;
  TrackLinks?: "None" | "HtmlAndText" | "HtmlOnly" | "TextOnly";
  Metadata?: Record<string, string>;
}

export interface SendResult {
  ok: boolean;
  messageId?: string;
  error?: string;
  provider: "postmark" | "local-fallback";
}

// ─── Config ────────────────────────────────────────────────────────────────
const POSTMARK_SERVER_TOKEN = process.env.POSTMARK_SERVER_TOKEN ?? "";
const FROM_EMAIL = process.env.POSTMARK_FROM_EMAIL ?? "hello@caronomist.com";
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "https://values.caronomist.com";
const UNSUBSCRIBE_URL = `${BASE_URL}/unsubscribe`;
const PRO_UPGRADE_URL = `${BASE_URL}/upgrade`;

// ─── Shared layout helpers ──────────────────────────────────────────────────
function htmlWrapper(title: string, body: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #0f0f0f; color: #e5e5e5; margin: 0; padding: 0; }
    .wrapper { max-width: 600px; margin: 32px auto; background: #1a1a1a; border-radius: 8px; border: 1px solid #2a2a2a; overflow: hidden; }
    .header { background: #111; border-bottom: 1px solid #2a2a2a; padding: 24px 32px; }
    .logo { font-size: 20px; font-weight: 700; color: #e5e5e5; letter-spacing: -0.5px; }
    .logo span { color: #f59e0b; }
    .content { padding: 32px; }
    h1 { font-size: 22px; font-weight: 700; color: #fff; margin: 0 0 16px; line-height: 1.3; }
    p { font-size: 15px; line-height: 1.7; color: #b0b0b0; margin: 0 0 16px; }
    .highlight { background: #1f2937; border-left: 3px solid #f59e0b; padding: 16px 20px; border-radius: 4px; margin: 24px 0; }
    .highlight p { color: #e5e5e5; margin: 0; font-size: 14px; }
    .cta { display: inline-block; background: #f59e0b; color: #0f0f0f; font-weight: 700; font-size: 15px; padding: 14px 28px; border-radius: 6px; text-decoration: none; margin: 8px 0 24px; }
    .cta:hover { background: #d97706; }
    .secondary-cta { display: inline-block; color: #f59e0b; font-size: 14px; text-decoration: underline; margin-top: 8px; }
    .footer { background: #111; border-top: 1px solid #2a2a2a; padding: 20px 32px; text-align: center; }
    .footer p { font-size: 12px; color: #555; margin: 0; }
    .footer a { color: #777; text-decoration: none; }
    ul { padding-left: 20px; margin: 0 0 16px; }
    li { font-size: 15px; color: #b0b0b0; margin-bottom: 8px; line-height: 1.5; }
    li strong { color: #e5e5e5; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <div class="logo">Caron<span>omist</span></div>
    </div>
    <div class="content">
      ${body}
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} Caronomist · <a href="${UNSUBSCRIBE_URL}">Unsubscribe</a> · <a href="${BASE_URL}/privacy">Privacy</a></p>
    </div>
  </div>
</body>
</html>`;
}

function footer(): string {
  return `\n\n---\nCaronomist | ${BASE_URL}\nUnsubscribe: ${UNSUBSCRIBE_URL} | Privacy: ${BASE_URL}/privacy`;
}

// ─── Email Templates ────────────────────────────────────────────────────────

function welcomeEmail(ctx: EmailContext): PostmarkMessage {
  const name = ctx.toName ? `, ${ctx.toName}` : "";
  const subject = "You've unlocked the Caronomist ranking";

  const html = htmlWrapper(
    subject,
    `<h1>The full ranking is yours${name}</h1>
    <p>Welcome to Caronomist — the collector car data platform that puts hard numbers behind the cars people actually want.</p>
    <div class="highlight">
      <p><strong>What you've unlocked:</strong> All 21 ranked models, BaT median values, Caronomist Score breakdown, and collector demand signals — free, no credit card required.</p>
    </div>
    <p>A few things worth exploring right away:</p>
    <ul>
      <li><strong>Rankings</strong> — see where your car lands in the collector hierarchy</li>
      <li><strong>Model pages</strong> — deep-dive specs, appreciation trajectory, and what drives value</li>
      <li><strong>Price data</strong> — auction medians sourced from real BaT transactions</li>
    </ul>
    <a class="cta" href="${BASE_URL}/ranking">Explore the Full Ranking →</a>
    <p>Pro tip: bookmark a few models you own or want to own. We'll tell you when the market moves.</p>`
  );

  const text = `Welcome to Caronomist${name}

You've unlocked the full ranking — all 21 models with BaT medians, Caronomist Scores, and collector demand signals.

Explore now: ${BASE_URL}/ranking

Pro tip: bookmark models you're tracking. We'll surface price movements and market shifts.${footer()}`;

  return {
    From: FROM_EMAIL,
    To: ctx.toEmail,
    Subject: subject,
    HtmlBody: html,
    TextBody: text,
    Tag: "welcome",
    MessageStream: "outbound",
    TrackOpens: true,
    TrackLinks: "HtmlAndText",
    Metadata: { template: "welcome", version: "1.0" },
  };
}

function day7UpsellEmail(ctx: EmailContext): PostmarkMessage {
  const name = ctx.toName ? `, ${ctx.toName}` : "";
  const subject = "What Pro members see that you don't (yet)";

  const html = htmlWrapper(
    subject,
    `<h1>There's more behind the data${name}</h1>
    <p>It's been a week since you unlocked the Caronomist ranking. You've seen the top-level picture — here's what Pro members access that you don't:</p>
    <ul>
      <li><strong>Sub-scores</strong> — Rarity, Motorsport DNA, Condition Sensitivity broken out individually per model</li>
      <li><strong>Unofficial values</strong> — Private-party pricing from FB Marketplace, Craigslist, and dealer lots (not just BaT)</li>
      <li><strong>Owner playbooks</strong> — Maintenance cost forecasts, known failure points, pre-purchase checklists</li>
      <li><strong>Price alerts</strong> — Notify me when a model crosses a threshold (up to 10/month)</li>
    </ul>
    <div class="highlight">
      <p>Pro starts at <strong>$12/month</strong>. Cancel anytime. Most members recoup the cost on their first negotiation.</p>
    </div>
    <a class="cta" href="${PRO_UPGRADE_URL}">See Pro Features →</a>
    <p>If you have questions, just reply to this email — I read every one.</p>`
  );

  const text = `What Pro members see that you don't (yet)${name}

It's been a week since you unlocked the ranking. Pro members access:
- Sub-scores (Rarity, Motorsport DNA, Condition Sensitivity broken out)
- Unofficial values (private-party + dealer, not just BaT)
- Owner playbooks (maintenance cost forecasts, failure points, pre-purchase checklists)
- Price alerts (up to 10/month, threshold-based)

Pro starts at $12/month. Cancel anytime.

Upgrade: ${PRO_UPGRADE_URL}${footer()}`;

  return {
    From: FROM_EMAIL,
    To: ctx.toEmail,
    Subject: subject,
    HtmlBody: html,
    TextBody: text,
    Tag: "day7-upsell",
    MessageStream: "outbound",
    TrackOpens: true,
    TrackLinks: "HtmlAndText",
    Metadata: { template: "day7-upsell", version: "1.0" },
  };
}

function day30UpsellEmail(ctx: EmailContext): PostmarkMessage {
  const name = ctx.toName ? `, ${ctx.toName}` : "";
  const subject = "30 days of data. Ready to see the full picture?";

  const rankHighlight = ctx.rankingHighlight
    ? `\n    <div class="highlight"><p>${ctx.rankingHighlight}</p></div>`
    : "";

  const html = htmlWrapper(
    subject,
    `<h1>One month in${name}. Here's what Pro unlocks.</h1>
    <p>You've been tracking the Caronomist ranking for 30 days. The market has moved since you first looked. Pro members have been watching it with better tools:</p>
    ${rankHighlight}
    <ul>
      <li><strong>Appreciation forecasts</strong> — model-by-model trajectories based on supply constraints, cultural momentum, and auction velocity</li>
      <li><strong>Quarterly white papers</strong> (Pro+) — "Top 5 moves this quarter" — the analyst-grade take, not the listicle</li>
      <li><strong>Portfolio tracker</strong> — track every car you own, mark your acquisition prices, see real-time gain/loss</li>
      <li><strong>Data exports</strong> — download full valuation datasets as CSV or JSON</li>
    </ul>
    <div class="highlight">
      <p>If you're serious about the collector market, the cost of one missed negotiation dwarfs a year of Pro.</p>
    </div>
    <a class="cta" href="${PRO_UPGRADE_URL}">Upgrade to Pro — $12/mo →</a>
    <a class="secondary-cta" href="${BASE_URL}/pro-plus">See Pro+ for the full research tier</a>`
  );

  const text = `30 days of data. Ready to see the full picture?${name}

One month in. Pro members have been watching with better tools:
- Appreciation forecasts (model-by-model trajectories)
- Quarterly white papers (Pro+) — analyst-grade market takes
- Portfolio tracker — acquisition prices + real-time gain/loss
- Data exports (CSV/JSON)

If you're serious about the collector market, one missed negotiation dwarfs a year of Pro.

Upgrade to Pro ($12/mo): ${PRO_UPGRADE_URL}
See Pro+: ${BASE_URL}/pro-plus${footer()}`;

  return {
    From: FROM_EMAIL,
    To: ctx.toEmail,
    Subject: subject,
    HtmlBody: html,
    TextBody: text,
    Tag: "day30-upsell",
    MessageStream: "outbound",
    TrackOpens: true,
    TrackLinks: "HtmlAndText",
    Metadata: { template: "day30-upsell", version: "1.0" },
  };
}

function proUpgradeEmail(ctx: EmailContext): PostmarkMessage {
  const name = ctx.toName ? `, ${ctx.toName}` : "";
  const subject = "Pro is live — here's where to start";

  const html = htmlWrapper(
    subject,
    `<h1>Welcome to Pro${name}</h1>
    <p>Your Pro membership is active. Here's what you can access right now:</p>
    <ul>
      <li><strong>Full sub-scores</strong> — Rarity, Motorsport DNA, Condition Sensitivity, Cultural Gravity for every ranked model</li>
      <li><strong>Unofficial valuations</strong> — Private-party and dealer pricing layers alongside BaT auction data</li>
      <li><strong>Owner playbooks</strong> — The pre-purchase checklist and maintenance cost forecast for each model</li>
      <li><strong>Price alerts</strong> — Set up to 10 threshold alerts. We email you when a model's value crosses your trigger.</li>
      <li><strong>Portfolio tracker</strong> — Add your vehicles, set acquisition prices, track appreciation in real time</li>
    </ul>
    <a class="cta" href="${BASE_URL}/pro">Go to Pro Dashboard →</a>
    <div class="highlight">
      <p><strong>Recommended first move:</strong> Set a price alert on the model you're watching most closely. You'll thank yourself in 30 days.</p>
    </div>
    <p>Questions or feedback? Reply directly to this email — I read everything.</p>`
  );

  const text = `Welcome to Pro${name}

Your Pro membership is active. What you can access now:
- Full sub-scores (Rarity, Motorsport DNA, Condition Sensitivity, Cultural Gravity)
- Unofficial valuations (private-party + dealer pricing)
- Owner playbooks (pre-purchase checklists + maintenance cost forecasts)
- Price alerts (up to 10 threshold alerts/month)
- Portfolio tracker (acquisition prices + real-time appreciation)

Pro dashboard: ${BASE_URL}/pro

Recommended first move: Set a price alert on the model you're watching. Reply to this email with any questions.${footer()}`;

  return {
    From: FROM_EMAIL,
    To: ctx.toEmail,
    Subject: subject,
    HtmlBody: html,
    TextBody: text,
    Tag: "pro-upgrade",
    MessageStream: "outbound",
    TrackOpens: true,
    TrackLinks: "HtmlAndText",
    Metadata: { template: "pro-upgrade", version: "1.0" },
  };
}

function monthlyNewsletterEmail(ctx: EmailContext): PostmarkMessage {
  const name = ctx.toName ? `, ${ctx.toName}` : "";
  const month = new Date().toLocaleString("en-US", { month: "long", year: "numeric" });
  const subject = `Caronomist | ${month} — Market Shifts, Movers, and What's Next`;

  const vehicleModel = ctx.vehicleModel ?? "E46 M3";
  const html = htmlWrapper(
    subject,
    `<h1>The ${month} Take${name}</h1>
    <p>The collector market is moving. Here's what changed this month, what it means, and where the smart money is looking:</p>
    <div class="highlight">
      <p><strong>Featured model this month:</strong> ${vehicleModel} — appreciation trajectory, current supply constraints, and the case for (or against) buying now.</p>
    </div>
    <p>Inside this month's briefing:</p>
    <ul>
      <li><strong>Market Movers</strong> — the 3 models with the most meaningful price movement this month and what drove it</li>
      <li><strong>The Floor Watch</strong> — models approaching structural support levels (historically the best entry windows)</li>
      <li><strong>Demand Signal Update</strong> — BaT sell-through rates and days-to-sell trends across the 21 tracked models</li>
      <li><strong>The Caronomist Take</strong> — one model, deep-dive, no hedging</li>
    </ul>
    <a class="cta" href="${BASE_URL}/newsletter/${month.toLowerCase().replace(" ", "-")}">Read the Full Briefing →</a>
    <p>This is your monthly Pro briefing. If you want quarterly white papers and deeper research, <a href="${BASE_URL}/pro-plus" style="color:#f59e0b;">Pro+ includes both</a>.</p>`
  );

  const text = `Caronomist | ${month} — Market Shifts, Movers, and What's Next${name}

Featured model: ${vehicleModel} — appreciation trajectory, supply constraints, and the buy/wait case.

Inside this month:
- Market Movers: 3 models with meaningful price shifts and the drivers behind them
- The Floor Watch: models near structural support (historically best entry windows)
- Demand Signal Update: BaT sell-through rates + days-to-sell across 21 models
- The Caronomist Take: one model, deep-dive, no hedging

Read the full briefing: ${BASE_URL}/newsletter/${month.toLowerCase().replace(" ", "-")}

Want quarterly white papers? Upgrade to Pro+: ${BASE_URL}/pro-plus${footer()}`;

  return {
    From: FROM_EMAIL,
    To: ctx.toEmail,
    Subject: subject,
    HtmlBody: html,
    TextBody: text,
    Tag: "monthly-newsletter",
    MessageStream: "broadcast",
    TrackOpens: true,
    TrackLinks: "HtmlAndText",
    Metadata: { template: "monthly-newsletter", version: "1.0" },
  };
}

function churnRiskEmail(ctx: EmailContext): PostmarkMessage {
  const name = ctx.toName ? `, ${ctx.toName}` : "";
  const coupon = ctx.couponCode ?? "STAY5";
  const expiry = ctx.couponExpiry ?? "7 days";
  const subject = "We noticed you haven't been around — here's $5 off";

  const html = htmlWrapper(
    subject,
    `<h1>Been a while${name}</h1>
    <p>You haven't logged into Caronomist in 30+ days, and your Pro membership is coming up for renewal. We'd rather keep you than lose you.</p>
    <div class="highlight">
      <p><strong>Use code <code style="color:#f59e0b;background:#111;padding:2px 6px;border-radius:3px;">${coupon}</code> for $5 off your next billing cycle.</strong> Expires in ${expiry}. Applied automatically at checkout.</p>
    </div>
    <p>What you've missed while you were out:</p>
    <ul>
      <li>New BaT transaction data across 8 models</li>
      <li>Updated appreciation forecasts (two models reclassified)</li>
      <li>Price alert system improvements — now supports percentage thresholds</li>
    </ul>
    <a class="cta" href="${BASE_URL}/pro?coupon=${encodeURIComponent(coupon)}">Apply ${coupon} — Come Back →</a>
    <p>If Pro isn't right for you right now, you can <a href="${BASE_URL}/downgrade" style="color:#f59e0b;">downgrade to free</a> and keep your price alert history. No hard feelings.</p>`
  );

  const text = `Been a while${name}

You haven't logged in for 30+ days. We'd rather keep you than lose you.

Use code ${coupon} for $5 off your next billing cycle. Expires in ${expiry}.

What you missed:
- New BaT transaction data across 8 models
- Updated appreciation forecasts (two models reclassified)
- Price alert improvements (now supports percentage thresholds)

Apply coupon + return: ${BASE_URL}/pro?coupon=${encodeURIComponent(coupon)}

Want to downgrade to free instead? ${BASE_URL}/downgrade — your price alert history stays intact.${footer()}`;

  return {
    From: FROM_EMAIL,
    To: ctx.toEmail,
    Subject: subject,
    HtmlBody: html,
    TextBody: text,
    Tag: "churn-risk",
    MessageStream: "outbound",
    TrackOpens: true,
    TrackLinks: "HtmlAndText",
    Metadata: { template: "churn-risk", version: "1.0" },
  };
}

// ─── Template factory ────────────────────────────────────────────────────────
export function buildEmailMessage(
  template: EmailTemplate,
  ctx: EmailContext
): PostmarkMessage {
  switch (template) {
    case "welcome":
      return welcomeEmail(ctx);
    case "day7-upsell":
      return day7UpsellEmail(ctx);
    case "day30-upsell":
      return day30UpsellEmail(ctx);
    case "pro-upgrade":
      return proUpgradeEmail(ctx);
    case "monthly-newsletter":
      return monthlyNewsletterEmail(ctx);
    case "churn-risk":
      return churnRiskEmail(ctx);
    default: {
      const _exhaustive: never = template;
      throw new Error(`Unknown email template: ${_exhaustive}`);
    }
  }
}

// ─── Postmark send ───────────────────────────────────────────────────────────
export async function sendEmail(
  template: EmailTemplate,
  ctx: EmailContext
): Promise<SendResult> {
  const message = buildEmailMessage(template, ctx);

  if (!POSTMARK_SERVER_TOKEN) {
    // Dev/test fallback — log to console
    console.log("[email] POSTMARK_SERVER_TOKEN not set. Would send:", {
      to: message.To,
      subject: message.Subject,
      tag: message.Tag,
    });
    return { ok: true, provider: "local-fallback", messageId: `dev-${Date.now()}` };
  }

  const res = await fetch("https://api.postmarkapp.com/email", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "X-Postmark-Server-Token": POSTMARK_SERVER_TOKEN,
    },
    body: JSON.stringify(message),
  });

  const body = await res.json().catch(() => ({}));

  if (!res.ok) {
    return {
      ok: false,
      error: `Postmark ${res.status}: ${body?.Message ?? "unknown error"}`,
      provider: "postmark",
    };
  }

  return {
    ok: true,
    messageId: body?.MessageID as string | undefined,
    provider: "postmark",
  };
}

// ─── Batch send (monthly newsletter, Pro+ campaigns) ─────────────────────────
export async function sendBatchEmail(
  template: EmailTemplate,
  recipients: EmailContext[]
): Promise<{ sent: number; failed: number; errors: string[] }> {
  if (!POSTMARK_SERVER_TOKEN) {
    console.log(`[email] Batch send ${recipients.length} to ${template} (dev mode)`);
    return { sent: recipients.length, failed: 0, errors: [] };
  }

  const messages = recipients.map((ctx) => buildEmailMessage(template, ctx));

  // Postmark batch limit: 500 messages per request
  const BATCH_SIZE = 500;
  let sent = 0;
  let failed = 0;
  const errors: string[] = [];

  for (let i = 0; i < messages.length; i += BATCH_SIZE) {
    const batch = messages.slice(i, i + BATCH_SIZE);
    const res = await fetch("https://api.postmarkapp.com/email/batch", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "X-Postmark-Server-Token": POSTMARK_SERVER_TOKEN,
      },
      body: JSON.stringify(batch),
    });

    if (!res.ok) {
      failed += batch.length;
      errors.push(`Batch ${i}–${i + batch.length}: HTTP ${res.status}`);
      continue;
    }

    const results = (await res.json()) as Array<{ ErrorCode: number; Message: string }>;
    for (const r of results) {
      if (r.ErrorCode === 0) sent++;
      else {
        failed++;
        errors.push(r.Message);
      }
    }
  }

  return { sent, failed, errors };
}
