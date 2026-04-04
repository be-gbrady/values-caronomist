"use client";

import { useState, useEffect } from "react";
import {
  OVERALL_RANKING,
  SLICE_RANKINGS,
  META,
  RankedModel,
  SliceEntry,
  formatCurrency,
  trendColor,
  getModelByCode,
} from "../lib/rankingData";
import { EmailCaptureGate, getFreeEmailFromStorage } from "../components/EmailCaptureGate";
import { TierGate } from "../components/TierGate";
import { UpsellCTA } from "../components/UpsellCTA";

const SLICE_LABELS: Record<string, string> = {
  appreciation_focus: "Appreciation",
  performance_focus: "Performance",
  budget_focus: "Budget",
  preservation_focus: "Preservation",
};

const DIMENSION_LABELS: Record<string, string> = {
  appreciation: "Appreciation",
  heritage: "Heritage",
  liquidity: "Liquidity",
  coo: "Cost of Ownership",
  performance: "Performance",
  upgradability: "Upgradability",
};

function ScoreBar({ score, max = 100 }: { score: number; max?: number }) {
  const pct = Math.round((score / max) * 100);
  const color =
    pct >= 80 ? "#22c55e" : pct >= 65 ? "#F7C948" : pct >= 50 ? "#f97316" : "#ef4444";
  return (
    <div className="flex items-center gap-2">
      <div className="relative h-1.5 w-20 rounded-full bg-white/10">
        <div
          className="absolute left-0 top-0 h-full rounded-full score-bar"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
      <span className="text-xs text-slate-400">{score}</span>
    </div>
  );
}

function TrendBadge({ signal, pct }: { signal: string; pct: number }) {
  const color = trendColor(signal);
  const arrow =
    signal.includes("RISING") || signal === "EARLY-APPRECIATION" ? "↑" : "→";
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium"
      style={{ background: `${color}18`, color }}
    >
      {arrow} {pct > 0 ? `+${pct}%` : `${pct}%`}
    </span>
  );
}

function HomologationBadge() {
  return (
    <span className="ml-1.5 rounded bg-yellow-400/10 px-1 py-0.5 text-[10px] font-semibold text-yellow-400">
      HOMOL
    </span>
  );
}

function MakeIcon({ make }: { make: string }) {
  const initials =
    make === "Mercedes-Benz" ? "MB" : make === "Porsche" ? "POR" : "BMW";
  const bgMap: Record<string, string> = {
    BMW: "#1c3d6e",
    POR: "#4a1a00",
    MB: "#1a2e1a",
  };
  return (
    <span
      className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white"
      style={{ background: bgMap[initials] ?? "#1c3d6e" }}
    >
      {initials}
    </span>
  );
}

function RankRow({
  model,
  index,
  showGate,
}: {
  model: RankedModel;
  index: number;
  showGate: boolean;
}) {
  const blurred = showGate && index >= 5;

  return (
    <tr
      className="rank-row border-b border-white/5 transition-colors"
      style={blurred ? { filter: "blur(4px)", userSelect: "none", pointerEvents: "none" } : {}}
    >
      {/* Rank */}
      <td className="w-10 py-3 pl-4 pr-2 text-center">
        <span
          className={`text-sm font-bold ${
            model.rank <= 3 ? "text-yellow-400" : "text-slate-500"
          }`}
        >
          {model.rank}
        </span>
      </td>

      {/* Vehicle */}
      <td className="py-3 pr-4">
        <div className="flex items-center gap-3">
          <MakeIcon make={model.make} />
          <div>
            <div className="flex items-center text-sm font-semibold text-white">
              {model.make === "BMW"
                ? `${model.generation} ${model.model}`
                : `${model.model} (${model.generation})`}
              {model.homologation && <HomologationBadge />}
            </div>
            <div className="text-xs text-slate-500">{model.yearRange}</div>
          </div>
        </div>
      </td>

      {/* Score */}
      <td className="py-3 pr-4 text-right">
        <span
          className="text-lg font-bold"
          style={{ color: model.overallScore >= 70 ? "#F7C948" : "#94a3b8" }}
        >
          {model.overallScore.toFixed(1)}
        </span>
      </td>

      {/* Trend */}
      <td className="hidden py-3 pr-4 sm:table-cell">
        <TrendBadge
          signal={model.marketValue.trend_signal}
          pct={model.marketValue.trend_12mo_pct}
        />
      </td>

      {/* Market Value */}
      <td className="hidden py-3 pr-4 text-right text-sm text-slate-300 md:table-cell">
        {formatCurrency(model.marketValue.weighted_official)}
      </td>

      {/* Dimension bars — hidden on mobile */}
      <td className="hidden py-3 pr-4 lg:table-cell">
        <ScoreBar score={model.dimensionScores.appreciation} />
      </td>
      <td className="hidden py-3 pr-4 lg:table-cell">
        <ScoreBar score={model.dimensionScores.heritage} />
      </td>
      <td className="hidden py-3 pr-4 lg:table-cell">
        <ScoreBar score={model.dimensionScores.performance} />
      </td>
      {/* Detail link */}
      <td className="py-3 pr-4 text-right">
        {!blurred && (
          <a
            href={`/vehicles/${model.modelCode.toLowerCase()}`}
            className="text-xs text-yellow-400 hover:text-yellow-300 transition-colors font-medium"
          >
            Details →
          </a>
        )}
      </td>
    </tr>
  );
}

function SliceRow({ entry, index }: { entry: SliceEntry; index: number }) {
  const model = getModelByCode(entry.modelCode);
  if (!model) return null;
  return (
    <div className="flex items-center gap-3 py-2 border-b border-white/5">
      <span className="w-5 text-center text-xs font-bold text-yellow-400">
        {entry.rank}
      </span>
      <MakeIcon make={model.make} />
      <div className="flex-1">
        <div className="text-sm font-medium text-white">
          {model.make === "BMW"
            ? `${model.generation} ${model.model}`
            : `${model.model} (${model.generation})`}
        </div>
        <div className="text-xs text-slate-500">{model.yearRange}</div>
      </div>
      <span className="text-sm font-bold" style={{ color: "#F7C948" }}>
        {entry.sliceScore.toFixed(1)}
      </span>
    </div>
  );
}

export default function Home() {
  const [activeTab, setActiveTab] = useState<string>("overall");
  const [gateOpen, setGateOpen] = useState(false);

  // On mount: check if user already unlocked free tier in a prior session
  useEffect(() => {
    if (getFreeEmailFromStorage()) {
      setGateOpen(true);
    }
  }, []);

  const isSlice = activeTab !== "overall";
  const sliceData = isSlice ? SLICE_RANKINGS[activeTab] ?? [] : [];

  return (
    <div
      className="min-h-screen"
      style={{ background: "#0B1F3B", color: "#f1f5f9" }}
    >
      {/* Header */}
      <header
        className="border-b"
        style={{ borderColor: "rgba(247,201,72,0.15)", background: "#091829" }}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <div
              className="flex h-9 w-9 items-center justify-center rounded-lg text-sm font-black"
              style={{ background: "#F7C948", color: "#0B1F3B" }}
            >
              C
            </div>
            <div>
              <div className="text-sm font-bold text-white tracking-wide">
                THE CARONOMIST
              </div>
              <div className="text-[10px] font-medium uppercase tracking-widest text-yellow-400/70">
                Enthusiast Vehicle Intelligence
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span
              className="hidden text-xs text-slate-500 sm:block"
            >
              {META.model_count} models · Phase 0 · {new Date(META.computed_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
            </span>
            <button
              className="rounded-lg px-4 py-1.5 text-xs font-semibold transition-colors"
              style={{ background: "#F7C948", color: "#0B1F3B" }}
            >
              Pro — $12/mo
            </button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <div className="mx-auto max-w-7xl px-4 pt-10 pb-6">
        <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
          Enthusiast Vehicle Rankings
        </h1>
        <p className="mt-2 max-w-2xl text-slate-400">
          A 100-point composite score across appreciation trajectory, heritage,
          liquidity, cost of ownership, performance, and community strength. 
          {" "}<span className="text-yellow-400 font-medium">Phase 0 · {META.model_count} models.</span>
        </p>

        {/* Score dimension legend */}
        <div className="mt-4 flex flex-wrap gap-3">
          {Object.entries(META.weights).map(([dim, weight]) => (
            <div
              key={dim}
              className="flex items-center gap-1.5 rounded-full px-3 py-1 text-xs"
              style={{ background: "rgba(247,201,72,0.08)", border: "1px solid rgba(247,201,72,0.15)" }}
            >
              <span className="font-semibold text-yellow-300">{DIMENSION_LABELS[dim]}</span>
              <span className="text-slate-500">{Math.round(weight * 100)}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div
        className="mx-auto max-w-7xl border-b px-4"
        style={{ borderColor: "rgba(255,255,255,0.06)" }}
      >
        <div className="flex gap-1 overflow-x-auto">
          {[
            { key: "overall", label: "Overall" },
            { key: "appreciation_focus", label: "Appreciation" },
            { key: "performance_focus", label: "Performance" },
            { key: "budget_focus", label: "Budget" },
            { key: "preservation_focus", label: "Preservation" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`shrink-0 px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === tab.key ? "tab-active" : "tab-inactive"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-7xl px-4 pb-24 pt-6">
        {activeTab === "overall" ? (
          <div className="relative">
            {/* Table */}
            <div
              className="overflow-hidden rounded-xl"
              style={{ border: "1px solid rgba(255,255,255,0.07)", background: "#0e2240" }}
            >
              <table className="w-full">
                <thead>
                  <tr
                    className="border-b text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500"
                    style={{ borderColor: "rgba(255,255,255,0.07)" }}
                  >
                    <th className="py-3 pl-4 pr-2 w-10">#</th>
                    <th className="py-3 pr-4">Vehicle</th>
                    <th className="py-3 pr-4 text-right">Score</th>
                    <th className="hidden py-3 pr-4 sm:table-cell">12-Mo Trend</th>
                    <th className="hidden py-3 pr-4 text-right md:table-cell">
                      Market Value
                    </th>
                    <th className="hidden py-3 pr-4 lg:table-cell">Apprec.</th>
                    <th className="hidden py-3 pr-4 lg:table-cell">Heritage</th>
                    <th className="hidden py-3 pr-4 lg:table-cell">Perf.</th>
                  </tr>
                </thead>
                <tbody>
                  {OVERALL_RANKING.map((model, i) => (
                    <RankRow
                      key={model.modelCode}
                      model={model}
                      index={i}
                      showGate={!gateOpen}
                    />
                  ))}
                </tbody>
              </table>
            </div>

            {/* Email gate overlay */}
            {!gateOpen && (
              <EmailCaptureGate onUnlock={() => setGateOpen(true)} />
            )}

            {/* Pro upsell — shown after email unlock, below table */}
            {gateOpen && (
              <div className="mt-6">
                <TierGate requiredTier="pro" upsellVariant="radar-chart">
                  <div className="rounded-xl p-4 text-center text-sm text-slate-500" style={{ background: "#0e2240", border: "1px solid rgba(255,255,255,0.07)" }}>
                    ✅ Pro features unlocked
                  </div>
                </TierGate>
              </div>
            )}
          </div>
        ) : (
          /* Slice view */
          <div className="grid gap-6 sm:grid-cols-1 lg:grid-cols-1">
            <div className="max-w-xl">
              <div
                className="rounded-xl p-6"
                style={{ border: "1px solid rgba(255,255,255,0.07)", background: "#0e2240" }}
              >
                <h2 className="mb-1 text-lg font-bold text-white">
                  {SLICE_LABELS[activeTab]} View
                </h2>
                <p className="mb-4 text-sm text-slate-500">
                  {activeTab === "appreciation_focus" &&
                    "Weighted 50% appreciation + 20% liquidity + 30% heritage. Best vehicles for value growth."}
                  {activeTab === "performance_focus" &&
                    "Weighted 50% performance + 20% upgradability + 30% heritage. Driver's cars first."}
                  {activeTab === "budget_focus" &&
                    "Weighted 40% COO + 30% liquidity + 30% upgradability. Best bang-per-dollar buys."}
                  {activeTab === "preservation_focus" &&
                    "Weighted 40% heritage + 30% appreciation + 30% liquidity. Buy-and-hold collector vehicles."}
                </p>
                <div className="divide-y divide-white/5">
                  {sliceData.map((entry, i) => (
                    <SliceRow key={entry.modelCode} entry={entry} index={i} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footnote */}
        <div className="mt-8 flex flex-wrap gap-4 text-xs text-slate-600">
          <span>Data as of {new Date(META.computed_at).toLocaleDateString()}</span>
          <span>·</span>
          <span>Scoring v{META.scoring_version}</span>
          <span>·</span>
          <span>
            Official values: Hagerty, BaT, Classic.com medians. Unofficial pipeline
            coming Q2 2026.
          </span>
        </div>
      </div>

      {/* Pro upsell footer */}
      <div
        className="border-t py-8"
        style={{ borderColor: "rgba(247,201,72,0.15)", background: "#091829" }}
      >
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="text-sm font-bold text-white">
                Unlock Pro — $12/month
              </div>
              <div className="text-xs text-slate-500">
                Full sub-scores · vehicle deep-dives · official vs. unofficial
                value comparison · portfolio tracker · price alerts
              </div>
            </div>
            <button
              className="self-start rounded-lg px-6 py-2.5 text-sm font-bold transition-opacity hover:opacity-90 sm:self-auto"
              style={{ background: "#F7C948", color: "#0B1F3B" }}
            >
              Start Free Trial
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
