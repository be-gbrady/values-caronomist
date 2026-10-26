// Vehicle Detail Page — values.caronomist.com/vehicles/[modelCode]
// Static generation: all 21 ranked models
// Generated: 2026-04-02 by Kion Sprint Wave 32

import { notFound } from "next/navigation";
import Link from "next/link";
import { JsonLd } from "@/components/JsonLd";
import {
  formatUtcDate,
  modelLabel,
  rankingAsOfDate,
  SITE_PUBLISHED_DATE,
  vehicleStructuredData,
} from "@/lib/readerCopy";
import { publicSiteUrl } from "@/lib/site";
import {
  getVehicleDetail,
  getAllVehicleDetails,
  modelCodeToSlug,
  slugToModelCode,
} from "@/lib/vehicleData";

// ─── Static Generation ────────────────────────────────────────────────────────

export async function generateStaticParams() {
  const vehicles = getAllVehicleDetails();
  return vehicles.map((v) => ({
    modelCode: modelCodeToSlug(v.modelCode),
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ modelCode: string }>;
}) {
  const { modelCode } = await params;
  const vehicle = getVehicleDetail(slugToModelCode(modelCode));
  if (!vehicle) return { title: "Vehicle Not Found — Caronomist" };
  const slug = modelCodeToSlug(vehicle.modelCode);
  const title = `${vehicle.make} ${vehicle.model} (${vehicle.generation}) — Caronomist Values`;
  const description = `Collector car valuation, price bands, buyer's guide, and ranking for the ${vehicle.yearRange} ${vehicle.make} ${vehicle.model} ${vehicle.generation}. Ranked #${vehicle.ranking.rank} of 21.`;
  return {
    title,
    description,
    alternates: { canonical: `/vehicles/${slug}` },
    openGraph: {
      title,
      description,
      url: `/vehicles/${slug}`,
    },
  };
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatCurrency(n: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
}

function trendBadge(pct: number, signal: string) {
  const color =
    signal === "RISING"
      ? "bg-green-900 text-green-300"
      : signal === "FALLING"
      ? "bg-red-900 text-red-300"
      : "bg-slate-700 text-slate-300";
  const arrow = signal === "RISING" ? "↑" : signal === "FALLING" ? "↓" : "→";
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-semibold ${color}`}>
      {arrow} {pct > 0 ? "+" : ""}
      {pct}% 12mo
    </span>
  );
}

function ScoreBar({
  label,
  score,
  max = 100,
}: {
  label: string;
  score: number;
  max?: number;
}) {
  const pct = Math.round((score / max) * 100);
  return (
    <div>
      <div className="flex justify-between text-xs text-slate-400 mb-1">
        <span>{label}</span>
        <span>{score}</span>
      </div>
      <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
        <div
          className="h-full bg-yellow-400 rounded-full"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function StarRating({ value, max = 10 }: { value: number; max?: number }) {
  return (
    <span className="text-yellow-400 text-sm">
      {"●".repeat(value)}
      {"○".repeat(max - value)}
    </span>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function VehicleDetailPage({
  params,
}: {
  params: Promise<{ modelCode: string }>;
}) {
  const { modelCode } = await params;
  const vehicle = getVehicleDetail(slugToModelCode(modelCode));
  if (!vehicle) notFound();

  const { ranking, officialValue, price_bands, price_range } = vehicle;
  const mv = officialValue.weighted_official;

  const asOf = officialValue.as_of || rankingAsOfDate();
  const vehicleName = modelLabel(vehicle);
  const worthAnswer = `As of ${formatUtcDate(asOf)}, the tracked price range for the ${vehicleName} is ${formatCurrency(price_range.low)} to ${formatCurrency(price_range.high)}.`;

  return (
    <div className="min-h-screen bg-[#0B1F3B] text-white">
      <JsonLd data={vehicleStructuredData(publicSiteUrl(), vehicle)} />
      <header>
        <nav aria-label="Primary" className="border-b border-slate-700 px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-yellow-400 font-bold text-lg tracking-tight">
            CARONOMIST VALUES
          </Link>
          <div className="flex gap-6 text-sm text-slate-400">
            <Link href="/" className="hover:text-white transition-colors">
              Rankings
            </Link>
            <Link href="/methodology" className="hover:text-white transition-colors">
              Methodology
            </Link>
            <Link href="/privacy" className="hover:text-white transition-colors">
              Privacy
            </Link>
          </div>
        </nav>
      </header>

      <main>
      <div className="max-w-4xl mx-auto px-6 py-10 space-y-10">

        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-slate-400 text-sm">
                #{ranking.rank} of 21 Overall
              </span>
              {ranking.homologation && (
                <span className="bg-yellow-400 text-[#0B1F3B] text-xs font-bold px-2 py-0.5 rounded">
                  HOMOLOGATION
                </span>
              )}
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white">
              {`${vehicleName} value and buyer's guide`}
            </h1>
            <p className="text-xl text-slate-300 mt-1">
              {vehicle.yearRange}
            </p>
            <p className="text-slate-400 text-sm mt-3 max-w-xl leading-relaxed">
              {vehicle.notes}
            </p>
          </div>
          <div className="text-right shrink-0">
            <div className="text-3xl font-bold text-yellow-400">
              {formatCurrency(mv)}
            </div>
            <div className="text-sm text-slate-400 mt-1">weighted market value</div>
            <div className="mt-2">
              {trendBadge(officialValue.trend_12mo_pct, officialValue.trend_signal)}
            </div>
            <div className="mt-3 text-xs text-slate-500">
              Overall Score: <span className="text-white font-semibold">{ranking.overallScore}</span>/100
              {" · "}
              Updated <time dateTime={asOf}>{formatUtcDate(asOf)}</time>
            </div>
          </div>
        </div>

        <section>
          <h2 className="text-lg font-semibold text-yellow-400 mb-3">
            What is a {vehicleName} worth today?
          </h2>
          <p className="text-slate-200">{worthAnswer}</p>
          <p className="text-xs text-slate-500 mt-2">
            Published <time dateTime={SITE_PUBLISHED_DATE}>{formatUtcDate(SITE_PUBLISHED_DATE)}</time>
          </p>
        </section>

        {/* ── Price Bands ── */}
        <section>
          <h2 className="text-lg font-semibold text-yellow-400 mb-4">Price Bands</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {(["excellent", "good", "fair", "project"] as const).map((tier) => {
              const band = price_bands[tier];
              const colors: Record<string, string> = {
                excellent: "border-green-600",
                good: "border-blue-600",
                fair: "border-yellow-600",
                project: "border-slate-600",
              };
              return (
                <div
                  key={tier}
                  className={`bg-slate-800 border ${colors[tier]} rounded-lg p-4`}
                >
                  <div className="text-xs text-slate-400 uppercase tracking-wider mb-2">
                    {tier}
                  </div>
                  <div className="text-white font-semibold">
                    {formatCurrency(band.median)}
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    {formatCurrency(band.low)} – {formatCurrency(band.high)}
                  </div>
                </div>
              );
            })}
          </div>
          <p className="text-xs text-slate-500 mt-3">
            Range: {formatCurrency(price_range.low)} – {formatCurrency(price_range.high)} · As of{" "}
            <time dateTime={asOf}>{formatUtcDate(asOf)}</time>
          </p>
        </section>

        {/* ── Dimension Scores ── */}
        <section>
          <h2 className="text-lg font-semibold text-yellow-400 mb-4">
            Caronomist Ranking Scores
          </h2>
          <p className="text-xs text-slate-500 mb-4">
            Scores as of <time dateTime={rankingAsOfDate()}>{formatUtcDate(rankingAsOfDate())}</time>
          </p>
          <div className="bg-slate-800 rounded-lg p-5 grid sm:grid-cols-2 gap-4">
            <ScoreBar label="Appreciation Potential" score={ranking.dimensionScores.appreciation} />
            <ScoreBar label="Heritage & Provenance" score={ranking.dimensionScores.heritage} />
            <ScoreBar label="Liquidity" score={ranking.dimensionScores.liquidity} />
            <ScoreBar label="Cost of Ownership" score={ranking.dimensionScores.coo} />
            <ScoreBar label="Performance" score={ranking.dimensionScores.performance} />
            <ScoreBar label="Upgradability" score={ranking.dimensionScores.upgradability} />
          </div>
        </section>

        {/* ── Specs ── */}
        <section>
          <h2 className="text-lg font-semibold text-yellow-400 mb-4">Specifications</h2>
          <div className="bg-slate-800 rounded-lg p-5">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-4 gap-x-6 text-sm">
              <div>
                <div className="text-slate-400 text-xs mb-1">Engine(s)</div>
                <div className="text-white space-y-1">
                  {vehicle.engines.map((e) => (
                    <div key={e}>{e}</div>
                  ))}
                </div>
              </div>
              {vehicle.transmissions && (
                <div>
                  <div className="text-slate-400 text-xs mb-1">Transmission</div>
                  <div className="text-white space-y-1">
                    {vehicle.transmissions.map((t) => (
                      <div key={t}>{t}</div>
                    ))}
                  </div>
                </div>
              )}
              <div>
                <div className="text-slate-400 text-xs mb-1">Drivetrain</div>
                <div className="text-white">{vehicle.drivetrain}</div>
              </div>
              <div>
                <div className="text-slate-400 text-xs mb-1">Power (stock)</div>
                <div className="text-white">{vehicle.hp_stock} hp</div>
              </div>
              {vehicle.torque_stock && (
                <div>
                  <div className="text-slate-400 text-xs mb-1">Torque (stock)</div>
                  <div className="text-white">{vehicle.torque_stock} lb-ft</div>
                </div>
              )}
              {vehicle.curb_weight_lbs && (
                <div>
                  <div className="text-slate-400 text-xs mb-1">Curb Weight</div>
                  <div className="text-white">{vehicle.curb_weight_lbs.toLocaleString()} lbs</div>
                </div>
              )}
              {vehicle.zero_to_60 && (
                <div>
                  <div className="text-slate-400 text-xs mb-1">0–60 mph</div>
                  <div className="text-white">{vehicle.zero_to_60}s</div>
                </div>
              )}
              <div>
                <div className="text-slate-400 text-xs mb-1">Production Count</div>
                <div className="text-white">{vehicle.production_count.toLocaleString()}</div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Ownership Ratings ── */}
        <section>
          <h2 className="text-lg font-semibold text-yellow-400 mb-4">Ownership Profile</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-slate-800 rounded-lg p-4 text-center">
              <div className="text-xs text-slate-400 mb-2">Mod Ecosystem</div>
              <StarRating value={vehicle.mod_ecosystem_strength} />
            </div>
            <div className="bg-slate-800 rounded-lg p-4 text-center">
              <div className="text-xs text-slate-400 mb-2">Community Heat</div>
              <StarRating value={vehicle.community_heat} />
            </div>
            <div className="bg-slate-800 rounded-lg p-4 text-center">
              <div className="text-xs text-slate-400 mb-2">Parts Availability</div>
              <StarRating value={vehicle.parts_availability} />
            </div>
            <div className="bg-slate-800 rounded-lg p-4 text-center">
              <div className="text-xs text-slate-400 mb-2">Daily Ability</div>
              <StarRating value={vehicle.daily_ability} />
            </div>
          </div>
        </section>

        {/* ── Known Failures ── */}
        <section>
          <h2 className="text-lg font-semibold text-yellow-400 mb-4">Known Failure Points</h2>
          <div className="bg-slate-800 rounded-lg p-5">
            <ul className="space-y-2">
              {vehicle.known_failures.map((f) => (
                <li key={f} className="flex gap-3 text-sm">
                  <span className="text-red-400 mt-0.5 shrink-0">⚠</span>
                  <span className="text-slate-300">{f}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ── Essential Maintenance ── */}
        <section>
          <h2 className="text-lg font-semibold text-yellow-400 mb-4">Essential Maintenance</h2>
          <div className="bg-slate-800 rounded-lg p-5">
            <ul className="space-y-2">
              {vehicle.essential_maintenance.map((m) => (
                <li key={m} className="flex gap-3 text-sm">
                  <span className="text-green-400 mt-0.5 shrink-0">✓</span>
                  <span className="text-slate-300">{m}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ── Motorsport ── */}
        {vehicle.motorsport_creds.length > 0 && (
          <section>
            <h2 className="text-lg font-semibold text-yellow-400 mb-4">
              Motorsport Heritage
            </h2>
            <div className="bg-slate-800 rounded-lg p-5">
              <ul className="space-y-2">
                {vehicle.motorsport_creds.map((c) => (
                  <li key={c} className="flex gap-3 text-sm">
                    <span className="text-yellow-400 mt-0.5 shrink-0">🏁</span>
                    <span className="text-slate-300">{c}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}

        {/* ── Notable Options ── */}
        {vehicle.notable_options && vehicle.notable_options.length > 0 && (
          <section>
            <h2 className="text-lg font-semibold text-yellow-400 mb-4">
              Notable Options & Variants
            </h2>
            <div className="bg-slate-800 rounded-lg p-5">
              <ul className="space-y-2">
                {vehicle.notable_options.map((o) => (
                  <li key={o} className="flex gap-3 text-sm">
                    <span className="text-blue-400 mt-0.5 shrink-0">◆</span>
                    <span className="text-slate-300">{o}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}

        {/* ── Data Sources ── */}
        {vehicle.spec_source && (
          <p className="text-xs text-slate-600">
            <span className="font-semibold">Sources:</span> {vehicle.spec_source} ·{" "}
            <span className="font-semibold">Confidence:</span>{" "}
            <span
              className={
                vehicle.spec_confidence === "HIGH"
                  ? "text-green-500"
                  : "text-yellow-500"
              }
            >
              {vehicle.spec_confidence}
            </span>
          </p>
        )}

        {/* ── CTA ── */}
        <div className="bg-slate-800 border border-yellow-400/30 rounded-xl p-6 text-center">
          <h3 className="text-lg font-semibold text-white mb-2">
            Track {vehicle.make} {vehicle.model} in Your Portfolio
          </h3>
          <p className="text-slate-400 text-sm mb-4">
            Get price alerts, portfolio P&amp;L tracking, and export for all 21 ranked models.
          </p>
          <div className="flex gap-3 justify-center">
            <Link
              href="/pro/portfolio"
              className="px-5 py-2.5 bg-yellow-400 text-[#0B1F3B] font-semibold rounded-lg text-sm hover:bg-yellow-300 transition-colors"
            >
              Add to Portfolio
            </Link>
            <Link
              href="/pro/alerts"
              className="px-5 py-2.5 border border-slate-600 text-slate-300 font-semibold rounded-lg text-sm hover:border-slate-400 transition-colors"
            >
              Set Price Alert
            </Link>
          </div>
        </div>

        {/* ── Back ── */}
        <div className="text-center">
          <Link href="/" className="text-slate-400 hover:text-white text-sm transition-colors">
            ← Back to Full Rankings
          </Link>
        </div>
      </div>
      </main>
      <footer className="border-t border-slate-700 px-6 py-8 text-xs text-slate-500">
        <div className="max-w-4xl mx-auto flex flex-wrap gap-4">
          <span>© 2026 Caronomist</span>
          <Link href="/" className="hover:text-white">Rankings</Link>
          <Link href="/methodology" className="hover:text-white">Methodology</Link>
          <Link href="/privacy" className="hover:text-white">Privacy</Link>
        </div>
      </footer>
    </div>
  );
}
