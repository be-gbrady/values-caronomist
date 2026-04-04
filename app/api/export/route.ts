import { NextRequest, NextResponse } from "next/server";
import { OVERALL_RANKING } from "@/lib/rankingData";
import fs from "fs";
import path from "path";

type ExportDataset = "rankings" | "portfolio" | "alerts";
type ExportFormat = "csv" | "json";

// ── Helpers ──────────────────────────────────────────────────────────────────

function escapeCSV(val: unknown): string {
  const str = val === null || val === undefined ? "" : String(val);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function toCSV(rows: Record<string, unknown>[]): string {
  if (rows.length === 0) return "";
  const headers = Object.keys(rows[0]);
  const lines = [
    headers.map(escapeCSV).join(","),
    ...rows.map((row) => headers.map((h) => escapeCSV(row[h])).join(",")),
  ];
  return lines.join("\n");
}

function loadDataFile<T>(filename: string, fallback: T): T {
  try {
    const p = path.join(process.cwd(), "data", filename);
    if (!fs.existsSync(p)) return fallback;
    return JSON.parse(fs.readFileSync(p, "utf-8")) as T;
  } catch {
    return fallback;
  }
}

// ── Dataset builders ──────────────────────────────────────────────────────────

function buildRankingsRows(): Record<string, unknown>[] {
  return OVERALL_RANKING.map((m) => ({
    rank: m.rank,
    model_code: m.modelCode,
    make: m.make,
    model: m.model,
    generation: m.generation,
    year_range: m.yearRange,
    overall_score: m.overallScore,
    score_appreciation: m.dimensionScores.appreciation,
    score_heritage: m.dimensionScores.heritage,
    score_liquidity: m.dimensionScores.liquidity,
    score_coo: m.dimensionScores.coo,
    score_performance: m.dimensionScores.performance,
    score_upgradability: m.dimensionScores.upgradability,
    market_value_usd: m.marketValue.weighted_official,
    trend_12mo_pct: m.marketValue.trend_12mo_pct,
    trend_signal: m.marketValue.trend_signal,
    hp_stock: m.hp_stock,
    production_count: m.production_count,
    community_heat: m.community_heat,
    homologation: m.homologation,
  }));
}

interface PortfolioEntry {
  id: string;
  modelCode: string;
  year: number;
  purchasePrice: number;
  mileage: number;
  notes: string;
  addedAt: string;
}

function buildPortfolioRows(email?: string): Record<string, unknown>[] {
  // Portfolio is stored per-user. For now read from data/portfolio.json if it exists.
  // (In production: query Neon by email/userId.)
  const portfolio = loadDataFile<PortfolioEntry[]>("portfolio.json", []);
  const filtered = email ? portfolio.filter((e) => (e as unknown as Record<string, unknown>).email === email) : portfolio;

  return filtered.map((entry) => {
    // Enrich with current market value from ranking data
    const ranked = OVERALL_RANKING.find((r) => r.modelCode === entry.modelCode);
    const currentValue = ranked?.marketValue.weighted_official ?? null;
    const pnl = currentValue !== null ? currentValue - entry.purchasePrice : null;
    const pnlPct = currentValue !== null && entry.purchasePrice > 0
      ? ((currentValue - entry.purchasePrice) / entry.purchasePrice) * 100
      : null;

    return {
      id: entry.id,
      model_code: entry.modelCode,
      vehicle: ranked ? `${ranked.yearRange} ${ranked.make} ${ranked.model}` : entry.modelCode,
      year: entry.year,
      purchase_price_usd: entry.purchasePrice,
      mileage: entry.mileage,
      current_market_value_usd: currentValue,
      unrealized_pnl_usd: pnl !== null ? Math.round(pnl) : null,
      unrealized_pnl_pct: pnlPct !== null ? Math.round(pnlPct * 10) / 10 : null,
      notes: entry.notes,
      added_at: entry.addedAt,
      exported_at: new Date().toISOString(),
    };
  });
}

interface AlertEntry {
  id: string;
  modelCode: string;
  alertType: string;
  threshold: number;
  email: string;
  status: string;
  createdAt: string;
  notes: string;
}

function buildAlertsRows(email?: string): Record<string, unknown>[] {
  const alerts = loadDataFile<AlertEntry[]>("alerts.json", []);
  const filtered = email ? alerts.filter((a) => a.email === email) : alerts;

  return filtered.map((alert) => {
    const ranked = OVERALL_RANKING.find((r) => r.modelCode === alert.modelCode);
    const currentValue = ranked?.marketValue.weighted_official ?? null;

    return {
      id: alert.id,
      model_code: alert.modelCode,
      vehicle: ranked ? `${ranked.yearRange} ${ranked.make} ${ranked.model}` : alert.modelCode,
      alert_type: alert.alertType,
      threshold_usd: alert.threshold,
      current_value_usd: currentValue,
      distance_to_trigger_pct:
        currentValue !== null && alert.threshold > 0
          ? Math.round(((currentValue - alert.threshold) / alert.threshold) * 1000) / 10
          : null,
      status: alert.status,
      email: alert.email,
      notes: alert.notes,
      created_at: alert.createdAt,
      exported_at: new Date().toISOString(),
    };
  });
}

// ── Route handler ─────────────────────────────────────────────────────────────

export async function GET(req: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(req.url);
  const dataset = (searchParams.get("dataset") ?? "rankings") as ExportDataset;
  const format = (searchParams.get("format") ?? "csv") as ExportFormat;
  const email = searchParams.get("email") ?? undefined;

  const validDatasets: ExportDataset[] = ["rankings", "portfolio", "alerts"];
  const validFormats: ExportFormat[] = ["csv", "json"];

  if (!validDatasets.includes(dataset)) {
    return NextResponse.json({ error: "Invalid dataset. Use: rankings | portfolio | alerts" }, { status: 400 });
  }
  if (!validFormats.includes(format)) {
    return NextResponse.json({ error: "Invalid format. Use: csv | json" }, { status: 400 });
  }

  // Build rows
  let rows: Record<string, unknown>[];
  switch (dataset) {
    case "rankings":
      rows = buildRankingsRows();
      break;
    case "portfolio":
      rows = buildPortfolioRows(email);
      break;
    case "alerts":
      rows = buildAlertsRows(email);
      break;
    default:
      rows = [];
  }

  const dateStr = new Date().toISOString().split("T")[0];
  const filename = `caronomist-${dataset}-${dateStr}.${format}`;

  if (format === "json") {
    const body = JSON.stringify(
      {
        export: {
          dataset,
          generated_at: new Date().toISOString(),
          record_count: rows.length,
          source: "values.caronomist.com",
        },
        data: rows,
      },
      null,
      2
    );
    return new NextResponse(body, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  }

  // CSV
  const body = toCSV(rows as Record<string, unknown>[]);
  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}

export async function POST(): Promise<NextResponse> {
  return NextResponse.json({ error: "Use GET with query params: dataset, format, email" }, { status: 405 });
}
