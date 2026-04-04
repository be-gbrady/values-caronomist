import { NextRequest, NextResponse } from "next/server";
import { writeFile, readFile } from "fs/promises";
import path from "path";

// ─── Config ────────────────────────────────────────────────────────────────
const CONVERTKIT_API_KEY = process.env.CONVERTKIT_API_KEY ?? "";
const CONVERTKIT_FORM_ID = process.env.CONVERTKIT_FORM_ID ?? "";
const SUBSCRIBERS_PATH = path.join(process.cwd(), "data", "subscribers.json");

// Basic RFC-5322-ish email check (fast, no deps)
function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim().toLowerCase());
}

// ─── ConvertKit helper ──────────────────────────────────────────────────────
async function subscribeToConvertKit(email: string): Promise<{ ok: boolean; error?: string }> {
  if (!CONVERTKIT_API_KEY || !CONVERTKIT_FORM_ID) {
    return { ok: false, error: "ConvertKit not configured" };
  }

  const res = await fetch(
    `https://api.convertkit.com/v3/forms/${CONVERTKIT_FORM_ID}/subscribe`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key: CONVERTKIT_API_KEY,
        email: email.trim().toLowerCase(),
        tags: ["caronomist-free-tier"],
      }),
    }
  );

  if (!res.ok) {
    const body = await res.text();
    return { ok: false, error: `ConvertKit error ${res.status}: ${body}` };
  }

  return { ok: true };
}

// ─── File-based fallback subscriber store ──────────────────────────────────
async function saveToFile(email: string): Promise<void> {
  let list: { email: string; ts: string }[] = [];
  try {
    const raw = await readFile(SUBSCRIBERS_PATH, "utf8");
    list = JSON.parse(raw);
  } catch {
    // file doesn't exist yet — start fresh
  }

  // De-dupe
  if (list.some((s) => s.email === email.trim().toLowerCase())) return;

  list.push({ email: email.trim().toLowerCase(), ts: new Date().toISOString() });

  // Ensure data/ dir exists (Next.js project root/data/)
  const { mkdir } = await import("fs/promises");
  await mkdir(path.dirname(SUBSCRIBERS_PATH), { recursive: true });
  await writeFile(SUBSCRIBERS_PATH, JSON.stringify(list, null, 2));
}

// ─── Route handler ─────────────────────────────────────────────────────────
export async function POST(req: NextRequest): Promise<NextResponse> {
  // Rate limit hint via header (actual enforcement needs edge middleware / Redis)
  const responseHeaders = {
    "X-RateLimit-Policy": "60;w=60",
  };

  let body: { email?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid JSON body" },
      { status: 400, headers: responseHeaders }
    );
  }

  const { email } = body;

  if (!email || !isValidEmail(email)) {
    return NextResponse.json(
      { success: false, error: "A valid email address is required." },
      { status: 422, headers: responseHeaders }
    );
  }

  // 1) Try ConvertKit (primary)
  const ckResult = await subscribeToConvertKit(email);

  // 2) Always save to local file as backup / bootstrap list
  try {
    await saveToFile(email);
  } catch (err) {
    // Non-fatal — log server-side only
    console.error("[subscribe] file fallback error:", err);
  }

  if (!ckResult.ok && CONVERTKIT_API_KEY) {
    // ConvertKit was configured but returned an error — surface it
    return NextResponse.json(
      { success: false, error: "Could not subscribe. Please try again." },
      { status: 502, headers: responseHeaders }
    );
  }

  return NextResponse.json(
    {
      success: true,
      message: "You're on the list! Full rankings unlocked.",
      provider: CONVERTKIT_API_KEY ? "convertkit" : "local",
    },
    { status: 200, headers: responseHeaders }
  );
}

// GET → method not allowed
export async function GET(): Promise<NextResponse> {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}
