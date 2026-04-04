"use client";

/**
 * PriceAlertForm — Create and manage custom price alerts (Pro+ feature)
 *
 * Allows users to set alerts for specific vehicle models when the tracked
 * market value crosses a user-defined price threshold (above or below).
 *
 * Pro+ gated via TierGate. Alerts stored in localStorage (pre-backend) with
 * full API-ready schema for future /api/alerts integration.
 *
 * Alert types:
 *   - "above"  : fire when market value exceeds threshold (good time to sell)
 *   - "below"  : fire when market value drops below threshold (buy signal)
 *   - "change" : fire when 12-month trend changes direction
 */

import { useState } from "react";
import { OVERALL_RANKING, RankedModel, formatCurrency } from "../lib/rankingData";

export type AlertType = "above" | "below" | "change";
export type AlertStatus = "active" | "triggered" | "paused" | "deleted";

export interface PriceAlert {
  id: string;
  modelCode: string;
  make: string;
  model: string;
  generation: string;
  alertType: AlertType;
  threshold: number | null; // null for "change" type
  email: string;
  status: AlertStatus;
  createdAt: string; // ISO
  lastChecked: string | null; // ISO
  triggeredAt: string | null; // ISO
  notes: string;
}

const ALERTS_KEY = "caronomist_price_alerts";

export function loadAlerts(): PriceAlert[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(ALERTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveAlerts(alerts: PriceAlert[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(ALERTS_KEY, JSON.stringify(alerts));
}

export function deleteAlert(id: string): void {
  const alerts = loadAlerts().filter((a) => a.id !== id);
  saveAlerts(alerts);
}

export function toggleAlertPause(id: string): void {
  const alerts = loadAlerts().map((a) => {
    if (a.id !== id) return a;
    return {
      ...a,
      status: a.status === "paused" ? "active" : ("paused" as AlertStatus),
    };
  });
  saveAlerts(alerts);
}

interface PriceAlertFormProps {
  userEmail?: string;
  onAlertCreated?: (alert: PriceAlert) => void;
}

export default function PriceAlertForm({
  userEmail = "",
  onAlertCreated,
}: PriceAlertFormProps) {
  const [selectedModel, setSelectedModel] = useState<RankedModel | null>(null);
  const [alertType, setAlertType] = useState<AlertType>("below");
  const [threshold, setThreshold] = useState<string>("");
  const [email, setEmail] = useState<string>(userEmail);
  const [notes, setNotes] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string>("");

  const existingAlerts = loadAlerts();
  const PRO_PLUS_ALERT_LIMIT = 20;
  const atLimit = existingAlerts.filter((a) => a.status !== "deleted").length >= PRO_PLUS_ALERT_LIMIT;

  function handleModelChange(code: string) {
    const m = OVERALL_RANKING.find((r) => r.modelCode === code) || null;
    setSelectedModel(m);
    // Pre-fill threshold with current market value as suggestion
    if (m) {
      setThreshold(String(Math.round(m.marketValue.weighted_official)));
    } else {
      setThreshold("");
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!selectedModel) {
      setError("Please select a vehicle.");
      return;
    }
    if (alertType !== "change" && !threshold) {
      setError("Please enter a price threshold.");
      return;
    }
    if (!email || !email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }
    if (atLimit) {
      setError(`Pro+ alert limit (${PRO_PLUS_ALERT_LIMIT}) reached. Delete an alert to add a new one.`);
      return;
    }

    setSaving(true);

    const newAlert: PriceAlert = {
      id: `alert_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      modelCode: selectedModel.modelCode,
      make: selectedModel.make,
      model: selectedModel.model,
      generation: selectedModel.generation,
      alertType,
      threshold: alertType !== "change" ? parseFloat(threshold) : null,
      email,
      status: "active",
      createdAt: new Date().toISOString(),
      lastChecked: null,
      triggeredAt: null,
      notes,
    };

    // Persist locally
    const updated = [...loadAlerts(), newAlert];
    saveAlerts(updated);

    // POST to API (non-blocking — fails gracefully)
    try {
      await fetch("/api/alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newAlert),
      });
    } catch {
      // API not yet wired — local save is sufficient
    }

    setSaving(false);
    setSaved(true);
    onAlertCreated?.(newAlert);

    // Reset form
    setTimeout(() => {
      setSaved(false);
      setSelectedModel(null);
      setThreshold("");
      setNotes("");
    }, 2500);
  }

  const currentValue = selectedModel?.marketValue.weighted_official;
  const thresholdNum = parseFloat(threshold);
  const isBuySignal =
    alertType === "below" && thresholdNum < (currentValue ?? Infinity);
  const isSellSignal =
    alertType === "above" && thresholdNum > (currentValue ?? 0);

  return (
    <div
      style={{
        background: "#112240",
        border: "1px solid #a78bfa55",
        borderRadius: 12,
        padding: "24px",
        maxWidth: 540,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
        <span style={{ fontSize: 22 }}>🔔</span>
        <h3 style={{ margin: 0, color: "#fff", fontSize: 18 }}>
          Create Price Alert
        </h3>
        <span
          style={{
            marginLeft: "auto",
            background: "#a78bfa22",
            color: "#a78bfa",
            borderRadius: 20,
            padding: "2px 10px",
            fontSize: 12,
            fontWeight: 600,
          }}
        >
          Pro+
        </span>
      </div>

      {atLimit && (
        <div
          style={{
            background: "#f7c94820",
            border: "1px solid #f7c948",
            borderRadius: 8,
            padding: "10px 14px",
            marginBottom: 16,
            color: "#f7c948",
            fontSize: 13,
          }}
        >
          ⚠️ Alert limit reached ({PRO_PLUS_ALERT_LIMIT}/{PRO_PLUS_ALERT_LIMIT}).
          Delete an existing alert to create a new one.
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {/* Vehicle selector */}
        <div>
          <label style={{ color: "#94a3b8", fontSize: 12, fontWeight: 600, display: "block", marginBottom: 6 }}>
            VEHICLE MODEL
          </label>
          <select
            value={selectedModel?.modelCode ?? ""}
            onChange={(e) => handleModelChange(e.target.value)}
            style={{
              width: "100%",
              background: "#0B1F3B",
              border: "1px solid #334155",
              borderRadius: 8,
              color: selectedModel ? "#fff" : "#64748b",
              padding: "10px 14px",
              fontSize: 14,
            }}
            required
          >
            <option value="" disabled>
              Select a vehicle…
            </option>
            {OVERALL_RANKING.map((m) => (
              <option key={m.modelCode} value={m.modelCode}>
                #{m.rank} {m.make} {m.model} {m.generation} ({m.yearRange})
              </option>
            ))}
          </select>
          {selectedModel && (
            <div style={{ marginTop: 6, fontSize: 12, color: "#64748b" }}>
              Current value:{" "}
              <span style={{ color: "#f7c948" }}>
                {formatCurrency(selectedModel.marketValue.weighted_official)}
              </span>{" "}
              · 12mo trend:{" "}
              <span
                style={{
                  color:
                    selectedModel.marketValue.trend_12mo_pct >= 0
                      ? "#22c55e"
                      : "#ef4444",
                }}
              >
                {selectedModel.marketValue.trend_12mo_pct >= 0 ? "+" : ""}
                {selectedModel.marketValue.trend_12mo_pct.toFixed(1)}%
              </span>
            </div>
          )}
        </div>

        {/* Alert type */}
        <div>
          <label style={{ color: "#94a3b8", fontSize: 12, fontWeight: 600, display: "block", marginBottom: 8 }}>
            ALERT WHEN
          </label>
          <div style={{ display: "flex", gap: 8 }}>
            {(
              [
                { type: "below", label: "📉 Price drops below", desc: "Buy signal" },
                { type: "above", label: "📈 Price rises above", desc: "Sell signal" },
                { type: "change", label: "🔄 Trend reverses", desc: "Direction change" },
              ] as { type: AlertType; label: string; desc: string }[]
            ).map(({ type, label, desc }) => (
              <button
                key={type}
                type="button"
                onClick={() => setAlertType(type)}
                style={{
                  flex: 1,
                  background: alertType === type ? "#a78bfa22" : "#0B1F3B",
                  border: `1px solid ${alertType === type ? "#a78bfa" : "#334155"}`,
                  borderRadius: 8,
                  color: alertType === type ? "#a78bfa" : "#64748b",
                  padding: "8px 4px",
                  fontSize: 11,
                  cursor: "pointer",
                  textAlign: "center",
                  lineHeight: 1.4,
                }}
              >
                <div style={{ fontWeight: 600 }}>{label}</div>
                <div style={{ color: "#475569", fontSize: 10, marginTop: 2 }}>{desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Threshold (not shown for "change") */}
        {alertType !== "change" && (
          <div>
            <label style={{ color: "#94a3b8", fontSize: 12, fontWeight: 600, display: "block", marginBottom: 6 }}>
              PRICE THRESHOLD (USD)
            </label>
            <div style={{ position: "relative" }}>
              <span
                style={{
                  position: "absolute",
                  left: 14,
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#64748b",
                  fontSize: 14,
                }}
              >
                $
              </span>
              <input
                type="number"
                value={threshold}
                onChange={(e) => setThreshold(e.target.value)}
                min={1000}
                max={500000}
                step={500}
                placeholder="e.g. 25000"
                style={{
                  width: "100%",
                  background: "#0B1F3B",
                  border: "1px solid #334155",
                  borderRadius: 8,
                  color: "#fff",
                  padding: "10px 14px 10px 28px",
                  fontSize: 14,
                  boxSizing: "border-box",
                }}
                required={true}
              />
            </div>
            {/* Signal hint */}
            {selectedModel && threshold && !isNaN(thresholdNum) && (
              <div style={{ marginTop: 5, fontSize: 11, color: isBuySignal || isSellSignal ? "#22c55e" : "#f7c948" }}>
                {isBuySignal &&
                  `✅ Smart buy signal — threshold ${formatCurrency(thresholdNum)} is below current ${formatCurrency(currentValue!)}`}
                {isSellSignal &&
                  `✅ Smart sell signal — threshold ${formatCurrency(thresholdNum)} is above current ${formatCurrency(currentValue!)}`}
                {!isBuySignal && !isSellSignal && alertType === "below" &&
                  `⚠️ Threshold ${formatCurrency(thresholdNum)} is already above current value — alert would trigger now`}
                {!isBuySignal && !isSellSignal && alertType === "above" &&
                  `⚠️ Threshold ${formatCurrency(thresholdNum)} is already below current value — alert would trigger now`}
              </div>
            )}
          </div>
        )}

        {/* Email */}
        <div>
          <label style={{ color: "#94a3b8", fontSize: 12, fontWeight: 600, display: "block", marginBottom: 6 }}>
            NOTIFY EMAIL
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            style={{
              width: "100%",
              background: "#0B1F3B",
              border: "1px solid #334155",
              borderRadius: 8,
              color: "#fff",
              padding: "10px 14px",
              fontSize: 14,
              boxSizing: "border-box",
            }}
            required
          />
        </div>

        {/* Notes (optional) */}
        <div>
          <label style={{ color: "#94a3b8", fontSize: 12, fontWeight: 600, display: "block", marginBottom: 6 }}>
            NOTES <span style={{ color: "#475569", fontWeight: 400 }}>(optional)</span>
          </label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            maxLength={120}
            placeholder="e.g. Watching for winter dip, buying for weekend use"
            style={{
              width: "100%",
              background: "#0B1F3B",
              border: "1px solid #334155",
              borderRadius: 8,
              color: "#fff",
              padding: "10px 14px",
              fontSize: 13,
              boxSizing: "border-box",
            }}
          />
        </div>

        {error && (
          <div style={{ color: "#ef4444", fontSize: 13, padding: "6px 0" }}>
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={saving || saved || atLimit}
          style={{
            background: saved ? "#22c55e" : "#a78bfa",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            padding: "12px",
            fontWeight: 700,
            fontSize: 14,
            cursor: saving || atLimit ? "not-allowed" : "pointer",
            opacity: saving || atLimit ? 0.7 : 1,
            transition: "background 0.2s",
          }}
        >
          {saved ? "✓ Alert Created!" : saving ? "Saving…" : "Create Alert"}
        </button>
      </form>
    </div>
  );
}
