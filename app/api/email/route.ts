// POST /api/email — Send a single transactional email
// Used by: Memberstack webhooks, internal cron triggers, test sends
// Auth: Bearer token (INTERNAL_API_SECRET env var)
//
// Body: {
//   template: EmailTemplate,
//   toEmail: string,
//   toName?: string,
//   vehicleModel?: string,
//   couponCode?: string,
//   couponExpiry?: string,
// }

import { NextRequest, NextResponse } from "next/server";
import { sendEmail, EmailTemplate, EmailContext } from "@/lib/email";

const VALID_TEMPLATES: EmailTemplate[] = [
  "welcome",
  "day7-upsell",
  "day30-upsell",
  "pro-upgrade",
  "monthly-newsletter",
  "churn-risk",
];

const INTERNAL_API_SECRET = process.env.INTERNAL_API_SECRET ?? "";

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim().toLowerCase());
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  // Auth check — require bearer token in production
  if (INTERNAL_API_SECRET) {
    const authHeader = req.headers.get("authorization") ?? "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
    if (token !== INTERNAL_API_SECRET) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }
  }

  let body: Partial<EmailContext & { template: string }>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  // Validate template
  const template = body.template as EmailTemplate;
  if (!template || !VALID_TEMPLATES.includes(template)) {
    return NextResponse.json(
      {
        success: false,
        error: `Invalid template. Must be one of: ${VALID_TEMPLATES.join(", ")}`,
      },
      { status: 422 }
    );
  }

  // Validate email
  const toEmail = body.toEmail ?? "";
  if (!isValidEmail(toEmail)) {
    return NextResponse.json(
      { success: false, error: "A valid toEmail is required." },
      { status: 422 }
    );
  }

  const ctx: EmailContext = {
    toEmail: toEmail.trim().toLowerCase(),
    toName: body.toName,
    vehicleModel: body.vehicleModel,
    couponCode: body.couponCode,
    couponExpiry: body.couponExpiry,
    rankingHighlight: body.rankingHighlight,
  };

  const result = await sendEmail(template, ctx);

  if (!result.ok) {
    console.error("[email/route] send failed:", result.error);
    return NextResponse.json(
      { success: false, error: result.error ?? "Email send failed" },
      { status: 502 }
    );
  }

  return NextResponse.json({
    success: true,
    messageId: result.messageId,
    provider: result.provider,
    template,
    to: ctx.toEmail,
  });
}

export async function GET(): Promise<NextResponse> {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}
