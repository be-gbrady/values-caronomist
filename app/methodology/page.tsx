import type { Metadata } from "next";
import Link from "next/link";
import { META, OVERALL_RANKING } from "@/lib/rankingData";
import {
  formatUtcDate,
  modelLabel,
  rankingAsOfDate,
  SCORE_WEIGHT_LABELS,
  siteDefinition,
  SITE_PUBLISHED_DATE,
} from "@/lib/readerCopy";
import { modelCodeToSlug } from "@/lib/vehicleData";

export const metadata: Metadata = {
  title: "Methodology — Caronomist Values",
  description: siteDefinition(),
  alternates: { canonical: "/methodology" },
};

export default function MethodologyPage() {
  const asOf = rankingAsOfDate();
  return (
    <div className="min-h-screen" style={{ background: "#0B1F3B", color: "#f1f5f9" }}>
      <header className="border-b" style={{ borderColor: "rgba(247,201,72,0.15)", background: "#091829" }}>
        <nav aria-label="Primary" className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4 text-sm">
          <Link href="/" className="font-bold tracking-wide text-white">
            THE CARONOMIST
          </Link>
          <div className="flex gap-4 text-slate-400">
            <Link href="/" className="hover:text-white">Rankings</Link>
            <Link href="/methodology" className="text-yellow-400">Methodology</Link>
            <Link href="/privacy" className="hover:text-white">Privacy</Link>
          </div>
        </nav>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-10">
        <h1 className="text-3xl font-black tracking-tight text-white">How Caronomist Values scores cars</h1>
        <p className="mt-4 text-slate-300">{siteDefinition()}</p>
        <h2 className="mt-8 text-xl font-bold text-white">How is the 100-point score calculated?</h2>
        <p className="mt-3 text-slate-300">
          Each car receives a composite of six scores. The weights below are the ones used for scoring version {META.scoring_version}.
        </p>
        <ul className="mt-4 space-y-2 text-slate-200">
          {Object.entries(META.weights).map(([key, weight]) => (
            <li key={key}>
              {SCORE_WEIGHT_LABELS[key] ?? key}: {Math.round(weight * 100)}%
            </li>
          ))}
        </ul>
        <h2 className="mt-8 text-xl font-bold text-white">Where do the prices come from?</h2>
        <p className="mt-3 text-slate-300">
          Official values on the ranking are medians from Hagerty, Bring a Trailer, and Classic.com. The page states those sources and does not add a separate unofficial price feed.
        </p>
        <p className="mt-4 text-sm text-slate-400">
          Data as of <time dateTime={asOf}>{formatUtcDate(asOf)}</time>
          {" · "}
          Updated <time dateTime={asOf}>{formatUtcDate(asOf)}</time>
          {" · "}
          Published <time dateTime={SITE_PUBLISHED_DATE}>{formatUtcDate(SITE_PUBLISHED_DATE)}</time>
        </p>
        <h2 className="mt-8 text-xl font-bold text-white">Which cars are in the set?</h2>
        <ul className="mt-4 space-y-2">
          {OVERALL_RANKING.map((model) => (
            <li key={model.modelCode}>
              <Link
                href={`/vehicles/${modelCodeToSlug(model.modelCode)}`}
                className="text-yellow-400 hover:text-yellow-300"
              >
                {model.rank}. {modelLabel(model)}
              </Link>
              <span className="text-slate-500"> · {model.yearRange}</span>
            </li>
          ))}
        </ul>
      </main>
      <footer className="border-t py-8 text-xs text-slate-500" style={{ borderColor: "rgba(247,201,72,0.15)" }}>
        <div className="mx-auto flex max-w-3xl flex-wrap gap-4 px-4">
          <span>© 2026 Caronomist</span>
          <Link href="/" className="hover:text-white">Rankings</Link>
          <Link href="/privacy" className="hover:text-white">Privacy</Link>
        </div>
      </footer>
    </div>
  );
}
