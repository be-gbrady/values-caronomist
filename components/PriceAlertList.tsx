"use client";

/**
 * PriceAlertList — Display, manage, and view status of active price alerts (Pro+ feature)
 *
 * Shows all user alerts with:
 *   - Current status (active / triggered / paused)
 *   - Distance-to-trigger: how far current market value is from the alert threshold
 *   - Pause / delete controls
 *   - Visual cue when alert would trigger NOW (highlight)
 *
 * Reads from localStorage (same schema as PriceAlertForm / /api/alerts).
 */

import { useState, useEffect } from "react";
import { OVERALL_RANKING, formatCurrency } from "../lib/rankingData";
import {
  PriceAlert,
  AlertType,
  loadAlerts,
  saveAlerts,
  deleteAlert,
  toggleAlertPause,
} from "./PriceAlertForm";

function getModelCurrentValue(modelCode: string): number | null {
  const m = OVERALL_RANKING.find((r) => r.modelCode === modelCode);
  return m ? m.marketValue.weighted_official : null;
}

function alertWouldTriggerNow(alert: PriceAlert): boolean {
  if (alert.status !== "active") return false;
  const current = getModelCurrentValue(alert.modelCode);
  if (current === null) return false;
  if (alert.alertType === "below" && alert.threshold !== null)
    return current <= alert.threshold;
  if (alert.alertType === "above" && alert.threshold !== null)
    return current >= alert.threshold;
  return false;
}

function distanceToTrigger(alert: PriceAlert): { pct: number; direction: "above" | "below" } | null {
  const current = getModelCurrentValue(alert.modelCode);
  if (current === null || alert.threshold === null) return null;
  const pct = ((current - alert.threshold) / alert.threshold) * 100;
  return { pct, direction: current >= alert.threshold ? "above" : "below" };
}

function alertTypeLabel(type: AlertType): string {
  switch (type) {
    case "above": return "↑ Price above";
    case "below": return "↓ Price below";
    case "change": return "⇄ Trend reversal";
  }
}

interface PriceAlertListProps {
  refreshTrigger?: number; // increment to force refresh
}

export default function PriceAlertList({ refreshTrigger = 0 }: PriceAlertListProps) {
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);

  useEffect(() => {
    setAlerts(loadAlerts().filter((a) => a.status !== "deleted"));
  }, [refreshTrigger]);

  function handleDelete(id: string) {
    deleteAlert(id);
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  }

  function handleTogglePause(id: string) {
    toggleAlertPause(id);
    setAlerts((prev) =>
      prev.map((a) => {
        if (a.id !== id) return a;
        return {
          ...a,
          status: a.status === "paused" ? "active" : "paused",
        } as PriceAlert;
      })
    );
  }

  if (alerts.length === 0) {
    return (
      <div
        style={{
          background: "#112240",
          border: "1px solid #a78bfa33",
          borderRadius: 12,
          padding: "32px 24px",
          textAlign: "center",
          color: "#475569",
        }}
      >
        <div style={{ fontSize: 32, marginBottom: 10 }}>🔕</div>
        <div style={{ fontSize: 15, fontWeight: 600, color: "#64748b" }}>No alerts yet</div>
        <div style={{ fontSize: 13, marginTop: 6 }}>
          Create your first alert above to get notified when prices move.
        </div>
      </div>
    );
  }

  const activeCount = alerts.filter((a) => a.status === "active").length;
  const triggeredCount = alerts.filter((a) => a.status === "triggered").length;

  return (
    <div>
      {/* Summary bar */}
      <div
        style={{
          display: "flex",
          gap: 16,
          marginBottom: 16,
          padding: "12px 16px",
          background: "#0B1F3B",
          borderRadius: 8,
          border: "1px solid #1e3a5f",
        }}
      >
        <Stat label="Total" value={alerts.length} />
        <Stat label="Active" value={activeCount} color="#22c55e" />
        <Stat label="Triggered" value={triggeredCount} color="#f7c948" />
        <Stat
          label="Paused"
          value={alerts.filter((a) => a.status === "paused").length}
          color="#64748b"
        />
      </div>

      {/* Alert cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {alerts.map((alert) => {
          const willTrigger = alertWouldTriggerNow(alert);
          const dist = distanceToTrigger(alert);
          const currentVal = getModelCurrentValue(alert.modelCode);
          const isPaused = alert.status === "paused";

          return (
            <div
              key={alert.id}
              style={{
                background: willTrigger ? "#f7c94810" : isPaused ? "#1e293b" : "#112240",
                border: `1px solid ${willTrigger ? "#f7c948" : isPaused ? "#334155" : "#a78bfa44"}`,
                borderRadius: 10,
                padding: "14px 16px",
                opacity: isPaused ? 0.65 : 1,
              }}
            >
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                {/* Left: vehicle + alert info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    <span style={{ color: "#fff", fontWeight: 700, fontSize: 14 }}>
                      {alert.make} {alert.model} {alert.generation}
                    </span>
                    <StatusBadge status={alert.status} willTrigger={willTrigger} />
                  </div>

                  <div style={{ marginTop: 6, fontSize: 12, color: "#64748b" }}>
                    <span style={{ color: "#94a3b8" }}>{alertTypeLabel(alert.alertType)}</span>
                    {alert.threshold !== null && (
                      <span style={{ color: "#a78bfa", fontWeight: 600, marginLeft: 5 }}>
                        {formatCurrency(alert.threshold)}
                      </span>
                    )}
                    {currentVal !== null && (
                      <span style={{ marginLeft: 10 }}>
                        Current:{" "}
                        <span style={{ color: "#e2e8f0" }}>{formatCurrency(currentVal)}</span>
                      </span>
                    )}
                  </div>

                  {/* Distance to trigger */}
                  {dist && alert.alertType !== "change" && (
                    <div style={{ marginTop: 4, fontSize: 11 }}>
                      <span
                        style={{
                          color: willTrigger ? "#f7c948" : Math.abs(dist.pct) < 5 ? "#f97316" : "#475569",
                        }}
                      >
                        {willTrigger
                          ? "⚡ Would trigger NOW"
                          : `${Math.abs(dist.pct).toFixed(1)}% ${dist.direction === "above" ? "above" : "below"} threshold`}
                      </span>
                    </div>
                  )}

                  {alert.notes && (
                    <div style={{ marginTop: 5, fontSize: 11, color: "#475569", fontStyle: "italic" }}>
                      "{alert.notes}"
                    </div>
                  )}

                  <div style={{ marginTop: 5, fontSize: 10, color: "#334155" }}>
                    Notify: {alert.email} · Created {new Date(alert.createdAt).toLocaleDateString()}
                  </div>
                </div>

                {/* Right: controls */}
                <div style={{ display: "flex", gap: 6, marginLeft: 12, flexShrink: 0 }}>
                  <button
                    onClick={() => handleTogglePause(alert.id)}
                    title={isPaused ? "Resume alert" : "Pause alert"}
                    style={{
                      background: "transparent",
                      border: "1px solid #334155",
                      borderRadius: 6,
                      color: "#64748b",
                      padding: "4px 8px",
                      cursor: "pointer",
                      fontSize: 12,
                    }}
                  >
                    {isPaused ? "▶ Resume" : "⏸ Pause"}
                  </button>
                  <button
                    onClick={() => handleDelete(alert.id)}
                    title="Delete alert"
                    style={{
                      background: "transparent",
                      border: "1px solid #334155",
                      borderRadius: 6,
                      color: "#ef4444",
                      padding: "4px 8px",
                      cursor: "pointer",
                      fontSize: 12,
                    }}
                  >
                    🗑
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: 10, fontSize: 11, color: "#334155", textAlign: "center" }}>
        Alerts checked against latest SPI data on each page load. Email delivery active once Postmark is configured.
      </div>
    </div>
  );
}

function Stat({ label, value, color = "#e2e8f0" }: { label: string; value: number; color?: string }) {
  return (
    <div style={{ textAlign: "center", flex: 1 }}>
      <div style={{ fontSize: 18, fontWeight: 700, color }}>{value}</div>
      <div style={{ fontSize: 10, color: "#475569", marginTop: 1 }}>{label}</div>
    </div>
  );
}

function StatusBadge({
  status,
  willTrigger,
}: {
  status: PriceAlert["status"];
  willTrigger: boolean;
}) {
  if (willTrigger) {
    return (
      <span
        style={{
          background: "#f7c94830",
          color: "#f7c948",
          borderRadius: 10,
          padding: "1px 7px",
          fontSize: 10,
          fontWeight: 700,
        }}
      >
        ⚡ TRIGGER
      </span>
    );
  }
  const map: Record<string, { bg: string; fg: string; label: string }> = {
    active: { bg: "#22c55e22", fg: "#22c55e", label: "Active" },
    triggered: { bg: "#f7c94820", fg: "#f7c948", label: "Triggered" },
    paused: { bg: "#33415520", fg: "#64748b", label: "Paused" },
    deleted: { bg: "#ef444420", fg: "#ef4444", label: "Deleted" },
  };
  const s = map[status] ?? map.active;
  return (
    <span
      style={{
        background: s.bg,
        color: s.fg,
        borderRadius: 10,
        padding: "1px 7px",
        fontSize: 10,
        fontWeight: 600,
      }}
    >
      {s.label}
    </span>
  );
}
