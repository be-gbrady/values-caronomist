/**
 * /api/alerts — CRUD API for price alerts
 *
 * POST   /api/alerts   — Create a new alert (from PriceAlertForm)
 * GET    /api/alerts   — List alerts for a given email (future: auth-gated)
 * DELETE /api/alerts   — Delete an alert by id
 * PATCH  /api/alerts   — Update alert status (pause/resume/mark-triggered)
 *
 * Storage: data/alerts.json (file-based, Neon-ready schema)
 *
 * Production upgrade path:
 *   - Replace file read/write with Neon DB queries
 *   - Add Postmark integration for email delivery
 *   - Add auth check via Memberstack JWT header
 */

import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const ALERTS_FILE = path.join(process.cwd(), "data", "alerts.json");

interface AlertRecord {
  id: string;
  modelCode: string;
  make: string;
  model: string;
  generation: string;
  alertType: "above" | "below" | "change";
  threshold: number | null;
  email: string;
  status: "active" | "triggered" | "paused" | "deleted";
  createdAt: string;
  lastChecked: string | null;
  triggeredAt: string | null;
  notes: string;
}

async function readAlerts(): Promise<AlertRecord[]> {
  try {
    await fs.mkdir(path.dirname(ALERTS_FILE), { recursive: true });
    const raw = await fs.readFile(ALERTS_FILE, "utf8");
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

async function writeAlerts(alerts: AlertRecord[]): Promise<void> {
  await fs.mkdir(path.dirname(ALERTS_FILE), { recursive: true });
  await fs.writeFile(ALERTS_FILE, JSON.stringify(alerts, null, 2), "utf8");
}

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// POST — Create alert
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Validate required fields
    const { id, modelCode, make, model, generation, alertType, threshold, email, notes } = body;

    if (!id || !modelCode || !make || !model || !alertType || !email) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    if (!validateEmail(email)) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 422 });
    }
    if (!["above", "below", "change"].includes(alertType)) {
      return NextResponse.json({ error: "Invalid alertType" }, { status: 422 });
    }
    if (alertType !== "change" && (threshold === null || threshold === undefined)) {
      return NextResponse.json({ error: "threshold required for above/below alerts" }, { status: 422 });
    }

    const alerts = await readAlerts();

    // De-dupe by id
    const exists = alerts.find((a) => a.id === id);
    if (exists) {
      return NextResponse.json({ ok: true, alert: exists, note: "already_exists" });
    }

    // Limit per email (20 active alerts max for Pro+)
    const emailAlerts = alerts.filter(
      (a) => a.email === email && a.status !== "deleted"
    );
    if (emailAlerts.length >= 20) {
      return NextResponse.json(
        { error: "Alert limit reached (20). Delete an existing alert first." },
        { status: 429 }
      );
    }

    const record: AlertRecord = {
      id,
      modelCode,
      make,
      model,
      generation: generation ?? "",
      alertType,
      threshold: threshold ?? null,
      email,
      status: "active",
      createdAt: new Date().toISOString(),
      lastChecked: null,
      triggeredAt: null,
      notes: notes ?? "",
    };

    alerts.push(record);
    await writeAlerts(alerts);

    return NextResponse.json({ ok: true, alert: record }, { status: 200 });
  } catch (err) {
    console.error("[/api/alerts POST]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// GET — List alerts for email (query param)
export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get("email");
  if (!email) {
    return NextResponse.json({ error: "email query param required" }, { status: 400 });
  }
  const alerts = await readAlerts();
  const result = alerts.filter((a) => a.email === email && a.status !== "deleted");
  return NextResponse.json({ alerts: result });
}

// PATCH — Update alert status
export async function PATCH(req: NextRequest) {
  try {
    const { id, status } = await req.json();
    if (!id || !status) {
      return NextResponse.json({ error: "id and status required" }, { status: 400 });
    }
    const validStatuses = ["active", "triggered", "paused", "deleted"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 422 });
    }

    const alerts = await readAlerts();
    const idx = alerts.findIndex((a) => a.id === id);
    if (idx === -1) {
      return NextResponse.json({ error: "Alert not found" }, { status: 404 });
    }

    alerts[idx].status = status;
    if (status === "triggered") {
      alerts[idx].triggeredAt = new Date().toISOString();
    }
    alerts[idx].lastChecked = new Date().toISOString();

    await writeAlerts(alerts);
    return NextResponse.json({ ok: true, alert: alerts[idx] });
  } catch (err) {
    console.error("[/api/alerts PATCH]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE — Soft delete alert by id
export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json();
    if (!id) {
      return NextResponse.json({ error: "id required" }, { status: 400 });
    }

    const alerts = await readAlerts();
    const idx = alerts.findIndex((a) => a.id === id);
    if (idx === -1) {
      return NextResponse.json({ error: "Alert not found" }, { status: 404 });
    }

    alerts[idx].status = "deleted";
    await writeAlerts(alerts);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[/api/alerts DELETE]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
