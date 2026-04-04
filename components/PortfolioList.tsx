"use client";

/**
 * PortfolioList — Display user's tracked vehicles with P&L + chart
 *
 * Shows:
 *   - Each vehicle: model, year, purchase price, current market value,
 *     unrealized gain/loss, % change, trend badge
 *   - Portfolio summary: total cost basis, total market value, net P&L
 *   - Recharts bar chart: cost basis vs current value per vehicle
 *
 * Data persisted in localStorage under key "caronomist_portfolio".
 * Neon-ready: PortfolioEntry matches planned DB schema.
 */

import { useEffect, useRef, useState } from "react";
import { OVERALL_RANKING } from "../lib/rankingData";

export interface PortfolioEntry {
  id: string;
  modelCode: string;
  year: number;
  purchasePrice: number;
  mileage?: number;
  notes?: string;
  addedAt: string;
}

const STORAGE_KEY = "caronomist_portfolio";

export function loadPortfolio(): PortfolioEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function savePortfolio(entries: PortfolioEntry[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

interface PortfolioListProps {
  entries: PortfolioEntry[];
  onRemove: (id: string) => void;
}

function formatCurrency(n: number) {
  return "$" + n.toLocaleString("en-US", { maximumFractionDigits: 0 });
}

function gainColor(pct: number) {
  if (pct > 5) return "#4ade80";
  if (pct > 0) return "#86efac";
  if (pct < -5) return "#f87171";
  if (pct < 0) return "#fca5a5";
  return "#94a3b8";
}

// Lazy-loaded Recharts wrapper (avoids SSR issues)
function PortfolioChart({ entries }: { entries: PortfolioEntry[] }) {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    Legend,
    ResponsiveContainer,
  } = require("recharts");

  const data = entries.map((e) => {
    const model = OVERALL_RANKING.find((r) => r.modelCode === e.modelCode);
    const current = model?.marketValue.weighted_official ?? e.purchasePrice;
    const label = model
      ? `${model.make} ${model.generation || model.model} '${String(e.year).slice(2)}`
      : e.modelCode;
    return {
      name: label,
      "Cost Basis": e.purchasePrice,
      "Market Value": current,
    };
  });

  return (
    <div style={{ width: "100%", height: 260, marginTop: "1.5rem" }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 40 }}>
          <XAxis
            dataKey="name"
            tick={{ fill: "#94a3b8", fontSize: 11 }}
            angle={-35}
            textAnchor="end"
            interval={0}
          />
          <YAxis
            tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`}
            tick={{ fill: "#94a3b8", fontSize: 11 }}
            width={50}
          />
          <Tooltip
            formatter={(value: number) => formatCurrency(value)}
            contentStyle={{
              background: "#122848",
              border: "1px solid rgba(247,201,72,0.2)",
              borderRadius: 6,
              color: "#f1f5f9",
            }}
          />
          <Legend
            wrapperStyle={{ color: "#94a3b8", fontSize: 12, paddingTop: 8 }}
          />
          <Bar dataKey="Cost Basis" fill="#1e3a5f" radius={[3, 3, 0, 0]} />
          <Bar dataKey="Market Value" fill="#F7C948" radius={[3, 3, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function PortfolioList({ entries, onRemove }: PortfolioListProps) {
  const [chartReady, setChartReady] = useState(false);
  const chartTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Delay chart mount to avoid SSR hydration mismatch
    chartTimerRef.current = setTimeout(() => setChartReady(true), 100);
    return () => {
      if (chartTimerRef.current) clearTimeout(chartTimerRef.current);
    };
  }, []);

  if (entries.length === 0) {
    return (
      <div className="portfolio-empty">
        <p>No vehicles in your portfolio yet.</p>
        <p style={{ fontSize: "0.85rem", color: "#64748b" }}>
          Add a vehicle above to start tracking your collection value.
        </p>
      </div>
    );
  }

  let totalCost = 0;
  let totalMarket = 0;

  const rows = entries.map((e) => {
    const model = OVERALL_RANKING.find((r) => r.modelCode === e.modelCode);
    const current = model?.marketValue.weighted_official ?? e.purchasePrice;
    const gain = current - e.purchasePrice;
    const gainPct = ((gain / e.purchasePrice) * 100);
    totalCost += e.purchasePrice;
    totalMarket += current;
    return { entry: e, model, current, gain, gainPct };
  });

  const totalGain = totalMarket - totalCost;
  const totalGainPct = (totalGain / totalCost) * 100;

  return (
    <div className="portfolio-list">
      {/* Summary strip */}
      <div className="portfolio-summary">
        <div className="summary-item">
          <span className="summary-label">Cost Basis</span>
          <span className="summary-value">{formatCurrency(totalCost)}</span>
        </div>
        <div className="summary-item">
          <span className="summary-label">Market Value</span>
          <span className="summary-value" style={{ color: "var(--yellow)" }}>
            {formatCurrency(totalMarket)}
          </span>
        </div>
        <div className="summary-item">
          <span className="summary-label">Net P&amp;L</span>
          <span className="summary-value" style={{ color: gainColor(totalGainPct) }}>
            {totalGain >= 0 ? "+" : ""}
            {formatCurrency(totalGain)}
            <span style={{ fontSize: "0.8rem", marginLeft: 4 }}>
              ({totalGainPct >= 0 ? "+" : ""}
              {totalGainPct.toFixed(1)}%)
            </span>
          </span>
        </div>
        <div className="summary-item">
          <span className="summary-label">Vehicles</span>
          <span className="summary-value">{entries.length}</span>
        </div>
      </div>

      {/* Vehicle rows */}
      <div className="vehicle-rows">
        {rows.map(({ entry, model, current, gain, gainPct }) => (
          <div key={entry.id} className="vehicle-row">
            <div className="vr-info">
              <div className="vr-title">
                {model
                  ? `${model.make} ${model.model} ${model.generation}`
                  : entry.modelCode}{" "}
                <span className="vr-year">{entry.year}</span>
              </div>
              {entry.mileage && (
                <div className="vr-meta">
                  {entry.mileage.toLocaleString()} mi
                  {entry.notes ? ` · ${entry.notes}` : ""}
                </div>
              )}
              {!entry.mileage && entry.notes && (
                <div className="vr-meta">{entry.notes}</div>
              )}
            </div>

            <div className="vr-values">
              <div className="vr-col">
                <span className="col-label">Paid</span>
                <span className="col-value">{formatCurrency(entry.purchasePrice)}</span>
              </div>
              <div className="vr-col">
                <span className="col-label">Market</span>
                <span className="col-value" style={{ color: "var(--yellow)" }}>
                  {formatCurrency(current)}
                </span>
              </div>
              <div className="vr-col">
                <span className="col-label">P&amp;L</span>
                <span className="col-value" style={{ color: gainColor(gainPct) }}>
                  {gain >= 0 ? "+" : ""}
                  {formatCurrency(gain)}
                  <span style={{ fontSize: "0.75rem", marginLeft: 3 }}>
                    ({gainPct >= 0 ? "+" : ""}
                    {gainPct.toFixed(1)}%)
                  </span>
                </span>
              </div>
            </div>

            <button
              className="vr-remove"
              onClick={() => onRemove(entry.id)}
              title="Remove from portfolio"
              aria-label="Remove vehicle"
            >
              ×
            </button>
          </div>
        ))}
      </div>

      {/* Chart */}
      {chartReady && entries.length > 0 && (
        <div className="portfolio-chart-wrap">
          <h4 className="chart-title">Cost Basis vs. Market Value</h4>
          <PortfolioChart entries={entries} />
        </div>
      )}
    </div>
  );
}
