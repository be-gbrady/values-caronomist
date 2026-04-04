"use client";

/**
 * PortfolioForm — Add a vehicle to the user's portfolio tracker
 *
 * Allows the user to select a model from the Caronomist universe,
 * enter a purchase price, year, and optional notes, then save to
 * localStorage (persisted until Neon DB is wired in T-132).
 *
 * Tier limits enforced:
 *   - none / free : 3 cars max
 *   - pro         : 10 cars max
 *   - pro+        : unlimited
 *
 * Neon-ready: all data structures match the portfolio_entries schema
 * that will be created during T-131/T-132 Memberstack + Neon setup.
 */

import { useState } from "react";
import { OVERALL_RANKING } from "../lib/rankingData";
import type { PortfolioEntry } from "./PortfolioList";

interface PortfolioFormProps {
  entries: PortfolioEntry[];
  tierLimit: number; // max entries allowed for this tier (-1 = unlimited)
  onAdd: (entry: PortfolioEntry) => void;
}

export function PortfolioForm({ entries, tierLimit, onAdd }: PortfolioFormProps) {
  const [modelCode, setModelCode] = useState("");
  const [year, setYear] = useState("");
  const [purchasePrice, setPurchasePrice] = useState("");
  const [mileage, setMileage] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");

  const atLimit = tierLimit !== -1 && entries.length >= tierLimit;
  const selectedModel = OVERALL_RANKING.find((r) => r.modelCode === modelCode);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!modelCode) return setError("Please select a vehicle model.");
    if (!year || isNaN(Number(year)) || Number(year) < 1970 || Number(year) > 2030) {
      return setError("Enter a valid model year (1970–2030).");
    }
    if (!purchasePrice || isNaN(Number(purchasePrice.replace(/,/g, ""))) || Number(purchasePrice.replace(/,/g, "")) <= 0) {
      return setError("Enter a valid purchase price.");
    }

    const entry: PortfolioEntry = {
      id: `portfolio-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      modelCode,
      year: Number(year),
      purchasePrice: Number(purchasePrice.replace(/,/g, "")),
      mileage: mileage ? Number(mileage.replace(/,/g, "")) : undefined,
      notes: notes.trim() || undefined,
      addedAt: new Date().toISOString(),
    };

    onAdd(entry);
    setModelCode("");
    setYear("");
    setPurchasePrice("");
    setMileage("");
    setNotes("");
  }

  return (
    <form onSubmit={handleSubmit} className="portfolio-form">
      <h3 style={{ color: "var(--yellow)", marginBottom: "1rem", fontSize: "1rem", fontWeight: 600 }}>
        Add a Vehicle
      </h3>

      {atLimit && (
        <div className="limit-banner">
          <span>🔒</span>
          <span>
            You&apos;ve reached your {tierLimit}-car limit.{" "}
            <a href="/checkout/pro" style={{ color: "var(--yellow)", textDecoration: "underline" }}>
              Upgrade to Pro
            </a>{" "}
            for up to 10 cars.
          </span>
        </div>
      )}

      <div className="form-grid">
        {/* Model select */}
        <div className="form-group form-group--full">
          <label htmlFor="pf-model">Vehicle Model *</label>
          <select
            id="pf-model"
            value={modelCode}
            onChange={(e) => setModelCode(e.target.value)}
            disabled={atLimit}
            className="form-select"
          >
            <option value="">— Select a model —</option>
            {OVERALL_RANKING.map((r) => (
              <option key={r.modelCode} value={r.modelCode}>
                {r.make} {r.model} {r.generation} ({r.yearRange})
              </option>
            ))}
          </select>
        </div>

        {/* Year */}
        <div className="form-group">
          <label htmlFor="pf-year">Model Year *</label>
          <input
            id="pf-year"
            type="number"
            placeholder="e.g. 2006"
            min={1970}
            max={2030}
            value={year}
            onChange={(e) => setYear(e.target.value)}
            disabled={atLimit}
            className="form-input"
          />
        </div>

        {/* Purchase price */}
        <div className="form-group">
          <label htmlFor="pf-price">Purchase Price (USD) *</label>
          <input
            id="pf-price"
            type="text"
            placeholder="e.g. 18500"
            value={purchasePrice}
            onChange={(e) => setPurchasePrice(e.target.value)}
            disabled={atLimit}
            className="form-input"
          />
        </div>

        {/* Mileage */}
        <div className="form-group">
          <label htmlFor="pf-mileage">Mileage (optional)</label>
          <input
            id="pf-mileage"
            type="text"
            placeholder="e.g. 72000"
            value={mileage}
            onChange={(e) => setMileage(e.target.value)}
            disabled={atLimit}
            className="form-input"
          />
        </div>

        {/* Notes */}
        <div className="form-group form-group--full">
          <label htmlFor="pf-notes">Notes (optional)</label>
          <textarea
            id="pf-notes"
            placeholder="Condition notes, spec details, purchase source..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            disabled={atLimit}
            rows={2}
            className="form-textarea"
          />
        </div>
      </div>

      {selectedModel && (
        <div className="model-preview">
          <span className="preview-label">Current market value:</span>
          <span className="preview-value">
            ${selectedModel.marketValue.weighted_official.toLocaleString()}
          </span>
          <span
            className="preview-trend"
            style={{
              color:
                selectedModel.marketValue.trend_12mo_pct > 0
                  ? "#4ade80"
                  : selectedModel.marketValue.trend_12mo_pct < 0
                  ? "#f87171"
                  : "#94a3b8",
            }}
          >
            {selectedModel.marketValue.trend_12mo_pct > 0 ? "▲" : selectedModel.marketValue.trend_12mo_pct < 0 ? "▼" : "—"}{" "}
            {Math.abs(selectedModel.marketValue.trend_12mo_pct)}% (12mo)
          </span>
        </div>
      )}

      {error && <p className="form-error">{error}</p>}

      <button type="submit" disabled={atLimit} className="add-btn">
        + Add to Portfolio
      </button>
    </form>
  );
}
