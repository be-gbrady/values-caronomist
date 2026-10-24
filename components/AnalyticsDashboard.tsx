"use client";

import { useState, useEffect } from "react";
import { isBillingEnabled } from "@/lib/billing";

interface FunnelData {
  visitors: number;
  emailCaptured: number;
  upgradeClick: number;
  proConversions: number;
}

interface TopModel {
  modelCode: string;
  views: number;
}

interface AnalyticsEvent {
  id: string;
  ts: string;
  event: string;
  tier?: string;
  model?: string;
  meta?: Record<string, string | number | boolean>;
}

interface DashboardMetrics {
  totalPageViews: number;
  uniqueUsers: number;
  emailCaptures: number;
  upgradeClicks: number;
  exportEvents: number;
  alertsCreated: number;
  funnel: FunnelData;
  topModels: TopModel[];
  recentEvents: AnalyticsEvent[];
  lastUpdated: string;
  eventCount: number;
}

const METRIC_CARD_DEFS = [
  { key: "totalPageViews", label: "Page Views", icon: "👁️", color: "#F7C948" },
  { key: "uniqueUsers", label: "Unique Users", icon: "👤", color: "#60a5fa" },
  { key: "emailCaptures", label: "Email Captures", icon: "📧", color: "#34d399" },
  { key: "upgradeClicks", label: "Upgrade Clicks", icon: "⬆️", color: "#a78bfa" },
  { key: "exportEvents", label: "Exports", icon: "📤", color: "#fb923c" },
  { key: "alertsCreated", label: "Alerts Created", icon: "🔔", color: "#f472b6" },
] as const;

function FunnelBar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div style={{ marginBottom: "0.75rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.25rem", fontSize: "0.85rem" }}>
        <span style={{ color: "#94a3b8" }}>{label}</span>
        <span style={{ color: "#e2e8f0" }}>{value.toLocaleString()} <span style={{ color: "#64748b" }}>({pct}%)</span></span>
      </div>
      <div style={{ height: "8px", background: "#1e293b", borderRadius: "4px", overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${pct}%`, background: color, borderRadius: "4px", transition: "width 0.5s ease" }} />
      </div>
    </div>
  );
}

export default function AnalyticsDashboard() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "funnel" | "models" | "events">("overview");

  async function load() {
    try {
      const res = await fetch("/api/analytics");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: DashboardMetrics = await res.json();
      setMetrics(data);
      setError(null);
    } catch (e) {
      setError("Failed to load analytics data.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    load();
    // Auto-refresh every 60s
    const interval = setInterval(load, 60_000);
    return () => clearInterval(interval);
  }, []);

  function handleRefresh() {
    setRefreshing(true);
    load();
  }

  const TAB_STYLE = (active: boolean) => ({
    padding: "0.5rem 1rem",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "0.85rem",
    fontWeight: 600,
    background: active ? "#F7C948" : "#1e293b",
    color: active ? "#0B1F3B" : "#94a3b8",
    transition: "all 0.15s ease",
  });

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "3rem", color: "#94a3b8" }}>
        Loading analytics…
      </div>
    );
  }

  if (error || !metrics) {
    return (
      <div style={{ textAlign: "center", padding: "3rem", color: "#f87171" }}>
        {error || "No data available."}<br />
        <button onClick={handleRefresh} style={{ marginTop: "1rem", padding: "0.5rem 1rem", background: "#F7C948", border: "none", borderRadius: "6px", cursor: "pointer", color: "#0B1F3B", fontWeight: 600 }}>
          Retry
        </button>
      </div>
    );
  }

  const funnelMax = metrics.funnel.visitors || 1;

  return (
    <div style={{ fontFamily: "Inter, sans-serif", color: "#e2e8f0" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <div>
          <h1 style={{ margin: 0, fontSize: "1.5rem", color: "#F7C948" }}>Analytics Dashboard</h1>
          <p style={{ margin: "0.25rem 0 0", fontSize: "0.8rem", color: "#64748b" }}>
            Last updated: {new Date(metrics.lastUpdated).toLocaleString()} · {metrics.eventCount.toLocaleString()} total events
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          style={{
            padding: "0.5rem 1rem",
            background: refreshing ? "#334155" : "#1e293b",
            border: "1px solid #334155",
            borderRadius: "6px",
            color: "#94a3b8",
            cursor: refreshing ? "not-allowed" : "pointer",
            fontSize: "0.8rem",
          }}
        >
          {refreshing ? "Refreshing…" : "⟳ Refresh"}
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem" }}>
        {(["overview", "funnel", "models", "events"] as const).map((tab) => (
          <button key={tab} style={TAB_STYLE(activeTab === tab)} onClick={() => setActiveTab(tab)}>
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === "overview" && (
        <div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "1rem", marginBottom: "1.5rem" }}>
            {(isBillingEnabled()
              ? METRIC_CARD_DEFS
              : METRIC_CARD_DEFS.filter((card) => card.key !== "upgradeClicks")
            ).map(({ key, label, icon, color }) => (
              <div key={key} style={{
                background: "#0f172a",
                border: `1px solid ${color}33`,
                borderLeft: `3px solid ${color}`,
                borderRadius: "8px",
                padding: "1rem",
              }}>
                <div style={{ fontSize: "1.5rem", marginBottom: "0.25rem" }}>{icon}</div>
                <div style={{ fontSize: "1.8rem", fontWeight: 700, color }}>{(metrics[key as keyof DashboardMetrics] as number).toLocaleString()}</div>
                <div style={{ fontSize: "0.75rem", color: "#64748b", marginTop: "0.25rem" }}>{label}</div>
              </div>
            ))}
          </div>

          {/* Conversion rate shortcut */}
          <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: "8px", padding: "1.25rem" }}>
            <h3 style={{ margin: "0 0 1rem", fontSize: "0.9rem", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em" }}>Key Rates</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem" }}>
              <div>
                <div style={{ fontSize: "1.4rem", fontWeight: 700, color: "#34d399" }}>
                  {metrics.totalPageViews > 0 ? ((metrics.emailCaptures / metrics.totalPageViews) * 100).toFixed(1) : "0.0"}%
                </div>
                <div style={{ fontSize: "0.75rem", color: "#64748b" }}>Email capture rate</div>
              </div>
              {isBillingEnabled() && (
                <div>
                  <div style={{ fontSize: "1.4rem", fontWeight: 700, color: "#a78bfa" }}>
                    {metrics.emailCaptures > 0 ? ((metrics.upgradeClicks / metrics.emailCaptures) * 100).toFixed(1) : "0.0"}%
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "#64748b" }}>Free → upgrade click</div>
                </div>
              )}
              {isBillingEnabled() && (
                <div>
                  <div style={{ fontSize: "1.4rem", fontWeight: 700, color: "#F7C948" }}>
                    {metrics.funnel.upgradeClick > 0 ? ((metrics.funnel.proConversions / metrics.funnel.upgradeClick) * 100).toFixed(1) : "0.0"}%
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "#64748b" }}>Click → paid (needs Memberstack)</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Funnel Tab */}
      {activeTab === "funnel" && (
        <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: "8px", padding: "1.5rem" }}>
          <h3 style={{ margin: "0 0 1.25rem", fontSize: "0.9rem", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em" }}>Conversion Funnel</h3>
          <FunnelBar label="Visitors (page views)" value={metrics.funnel.visitors} max={funnelMax} color="#60a5fa" />
          <FunnelBar label="Email captured (free tier)" value={metrics.funnel.emailCaptured} max={funnelMax} color="#34d399" />
          {isBillingEnabled() && (
            <>
              <FunnelBar label="Upgrade clicked (Pro/Pro+)" value={metrics.funnel.upgradeClick} max={funnelMax} color="#a78bfa" />
              <FunnelBar label="Paid conversions (Memberstack — pending)" value={metrics.funnel.proConversions} max={funnelMax} color="#F7C948" />
              <p style={{ fontSize: "0.75rem", color: "#475569", marginTop: "1rem" }}>
                Paid conversions stay at 0 until the membership webhook is connected.
              </p>
            </>
          )}
        </div>
      )}

      {/* Top Models Tab */}
      {activeTab === "models" && (
        <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: "8px", padding: "1.5rem" }}>
          <h3 style={{ margin: "0 0 1.25rem", fontSize: "0.9rem", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em" }}>Most Viewed Models</h3>
          {metrics.topModels.length === 0 ? (
            <p style={{ color: "#475569", fontSize: "0.85rem" }}>No model view data yet. Events will appear here once the site has traffic.</p>
          ) : (
            <div>
              {metrics.topModels.map((m, i) => (
                <div key={m.modelCode} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.75rem 0", borderBottom: "1px solid #1e293b" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    <span style={{ width: "1.5rem", textAlign: "center", color: i === 0 ? "#F7C948" : "#64748b", fontWeight: 700 }}>#{i + 1}</span>
                    <span style={{ fontWeight: 600 }}>{m.modelCode}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <div style={{ height: "6px", width: `${Math.round((m.views / metrics.topModels[0].views) * 120)}px`, background: "#F7C948", borderRadius: "3px" }} />
                    <span style={{ color: "#94a3b8", fontSize: "0.85rem" }}>{m.views} views</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Recent Events Tab */}
      {activeTab === "events" && (
        <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: "8px", padding: "1.5rem" }}>
          <h3 style={{ margin: "0 0 1.25rem", fontSize: "0.9rem", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em" }}>Recent Events (last 50)</h3>
          {metrics.recentEvents.length === 0 ? (
            <p style={{ color: "#475569", fontSize: "0.85rem" }}>No events yet. Events are captured via POST /api/analytics from the frontend.</p>
          ) : (
            <div style={{ fontFamily: "monospace", fontSize: "0.8rem" }}>
              <div style={{ display: "grid", gridTemplateColumns: "160px 130px 100px 1fr", gap: "0.5rem", color: "#475569", marginBottom: "0.5rem", paddingBottom: "0.5rem", borderBottom: "1px solid #1e293b" }}>
                <span>Timestamp</span><span>Event</span><span>Tier</span><span>Model / Meta</span>
              </div>
              {metrics.recentEvents.slice(0, 50).map((ev) => (
                <div key={ev.id} style={{ display: "grid", gridTemplateColumns: "160px 130px 100px 1fr", gap: "0.5rem", padding: "0.35rem 0", borderBottom: "1px solid #0f172a", alignItems: "start" }}>
                  <span style={{ color: "#64748b" }}>{new Date(ev.ts).toLocaleString()}</span>
                  <span style={{ color: "#F7C948" }}>{ev.event}</span>
                  <span style={{ color: "#60a5fa" }}>{ev.tier || "—"}</span>
                  <span style={{ color: "#94a3b8" }}>
                    {ev.model || ""}{ev.meta ? ` ${JSON.stringify(ev.meta).slice(0, 60)}` : ""}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Footer note */}
      <p style={{ fontSize: "0.72rem", color: "#334155", marginTop: "1.5rem", textAlign: "center" }}>
        Admin access only · values.caronomist.com internal dashboard · Data stored in data/analytics-events.json · Migrate to Neon when T-131 complete
      </p>
    </div>
  );
}
