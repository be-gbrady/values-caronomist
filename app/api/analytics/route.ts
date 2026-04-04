// POST /api/analytics — Event ingestion
// GET  /api/analytics — Dashboard metrics summary
import { NextRequest, NextResponse } from "next/server";
import { readFileSync, writeFileSync, existsSync } from "fs";
import { join } from "path";

const DATA_DIR = join(process.cwd(), "data");
const EVENTS_FILE = join(DATA_DIR, "analytics-events.json");
const SNAPSHOT_FILE = join(DATA_DIR, "analytics-snapshot.json");

export interface AnalyticsEvent {
  id: string;
  ts: string; // ISO
  event: string; // e.g. "page_view", "email_capture", "upgrade_click", "export", "alert_created"
  tier?: string; // "free" | "pro" | "pro+" | "admin"
  model?: string; // modelCode if applicable
  meta?: Record<string, string | number | boolean>;
}

export interface DashboardMetrics {
  totalPageViews: number;
  uniqueUsers: number; // approximation from unique email captures
  emailCaptures: number;
  upgradeClicks: number; // CTR to pro/pro+ checkout
  exportEvents: number;
  alertsCreated: number;
  // Cohort funnel (last 30 days, approximated from events)
  funnel: {
    visitors: number;
    emailCaptured: number;
    upgradeClick: number;
    proConversions: number; // from Memberstack — placeholder until wired
  };
  // Engagement by model
  topModels: { modelCode: string; views: number }[];
  // Event log (last 50)
  recentEvents: AnalyticsEvent[];
  // Snapshot metadata
  lastUpdated: string;
  eventCount: number;
}

function ensureDataDir() {
  const { mkdirSync } = require("fs");
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
}

function loadEvents(): AnalyticsEvent[] {
  try {
    ensureDataDir();
    if (!existsSync(EVENTS_FILE)) return [];
    return JSON.parse(readFileSync(EVENTS_FILE, "utf-8"));
  } catch {
    return [];
  }
}

function saveEvents(events: AnalyticsEvent[]) {
  ensureDataDir();
  writeFileSync(EVENTS_FILE, JSON.stringify(events, null, 2));
}

function computeMetrics(events: AnalyticsEvent[]): DashboardMetrics {
  const views = events.filter((e) => e.event === "page_view");
  const emails = events.filter((e) => e.event === "email_capture");
  const upgrades = events.filter((e) => e.event === "upgrade_click");
  const exports = events.filter((e) => e.event === "export");
  const alerts = events.filter((e) => e.event === "alert_created");

  // Unique users = unique emails captured (rough proxy)
  const uniqueEmails = new Set(
    emails.map((e) => e.meta?.email as string).filter(Boolean)
  );

  // Top models by view count
  const modelCounts: Record<string, number> = {};
  views.forEach((e) => {
    if (e.model) {
      modelCounts[e.model] = (modelCounts[e.model] || 0) + 1;
    }
  });
  const topModels = Object.entries(modelCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([modelCode, count]) => ({ modelCode, views: count }));

  // Funnel (rough — no Memberstack data yet, proConversions = 0 until wired)
  const funnel = {
    visitors: views.length,
    emailCaptured: emails.length,
    upgradeClick: upgrades.length,
    proConversions: 0, // TODO: wire Memberstack webhook → POST /api/analytics event="pro_conversion"
  };

  return {
    totalPageViews: views.length,
    uniqueUsers: uniqueEmails.size || emails.length,
    emailCaptures: emails.length,
    upgradeClicks: upgrades.length,
    exportEvents: exports.length,
    alertsCreated: alerts.length,
    funnel,
    topModels,
    recentEvents: events.slice(-50).reverse(),
    lastUpdated: new Date().toISOString(),
    eventCount: events.length,
  };
}

// POST — ingest a single analytics event
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { event, tier, model, meta } = body;

    if (!event || typeof event !== "string") {
      return NextResponse.json({ error: "event name required" }, { status: 400 });
    }

    const newEvent: AnalyticsEvent = {
      id: `evt_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      ts: new Date().toISOString(),
      event,
      tier: tier || undefined,
      model: model || undefined,
      meta: meta || undefined,
    };

    const events = loadEvents();
    // Keep last 10,000 events to prevent unbounded growth
    events.push(newEvent);
    const trimmed = events.slice(-10000);
    saveEvents(trimmed);

    // Refresh snapshot
    const metrics = computeMetrics(trimmed);
    writeFileSync(SNAPSHOT_FILE, JSON.stringify(metrics, null, 2));

    return NextResponse.json({ ok: true, id: newEvent.id });
  } catch (err) {
    return NextResponse.json({ error: "server error" }, { status: 500 });
  }
}

// GET — return dashboard metrics (admin only — caller enforces auth)
export async function GET() {
  try {
    const events = loadEvents();
    const metrics = computeMetrics(events);
    return NextResponse.json(metrics);
  } catch {
    return NextResponse.json({ error: "server error" }, { status: 500 });
  }
}
