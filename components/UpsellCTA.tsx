"use client";

import { isBillingEnabled } from "@/lib/billing";

/**
 * UpsellCTA — Contextual upsell prompt for locked content
 *
 * Renders a Pro or Pro+ upgrade CTA tailored to the specific feature the user
 * is trying to access (radar charts, price alerts, CSV export, etc.).
 *
 * Used by TierGate when content is locked.
 *
 * Props:
 *   variant       - which locked feature to describe (affects copy)
 *   requiredTier  - "pro" | "pro+" — determines button label + price shown
 *   compact       - if true, renders a condensed inline badge (for blur overlays)
 *
 * Upsell variants:
 *   "generic"          - catch-all
 *   "radar-chart"      - 6D sub-score breakdown
 *   "price-bands"      - condition-based price ranges
 *   "unofficial-value" - FBM/CL street price comparison
 *   "owner-playbook"   - known failures + service costs
 *   "portfolio"        - portfolio tracker
 *   "alerts"           - custom price alerts (Pro+)
 *   "export"           - CSV/JSON export (Pro+)
 *   "white-paper"      - quarterly research brief (Pro+)
 *   "full-ranking"     - rows 11-21 (email gate, not shown here — used as fallback)
 */

export type UpsellVariant =
  | "generic"
  | "radar-chart"
  | "price-bands"
  | "unofficial-value"
  | "owner-playbook"
  | "portfolio"
  | "alerts"
  | "export"
  | "white-paper"
  | "full-ranking";

interface UpsellCTAProps {
  variant: UpsellVariant;
  requiredTier: "free" | "pro" | "pro+";
  compact?: boolean;
}

// ---------------------------------------------------------------------------
// Copy map
// ---------------------------------------------------------------------------

interface UpsellCopy {
  label: string;
  headline: string;
  body: string;
  price: string;
  cta: string;
  checkoutPath: string;
}

const COPY: Record<UpsellVariant, Omit<UpsellCopy, "price" | "cta" | "checkoutPath">> = {
  "generic": {
    label: "Pro Feature",
    headline: "Upgrade to unlock",
    body: "This feature is available on the Pro plan.",
  },
  "radar-chart": {
    label: "Pro Feature",
    headline: "6-Dimension breakdown",
    body: "See how each vehicle scores across Appreciation, Heritage, Liquidity, Cost of Ownership, Performance, and Upgradability.",
  },
  "price-bands": {
    label: "Pro Feature",
    headline: "Condition-based price ranges",
    body: "See exact price bands — Excellent / Good / Fair / Project — updated weekly from BaT and Cars & Bids results.",
  },
  "unofficial-value": {
    label: "Pro Feature",
    headline: "Street price vs. auction delta",
    body: "Compare official auction medians against real Facebook Marketplace and Craigslist pricing. Spot the arbitrage.",
  },
  "owner-playbook": {
    label: "Pro Feature",
    headline: "Owner playbook",
    body: "Known failure points, service cost estimates, mod ecosystem, and a pre-purchase checklist — per vehicle.",
  },
  "portfolio": {
    label: "Pro Feature",
    headline: "Portfolio tracker",
    body: "Add vehicles you own or are watching. Overlay value curves, track appreciation, and model ROI scenarios.",
  },
  "alerts": {
    label: "Pro+ Feature",
    headline: "Custom price alerts",
    body: "Get notified when a model crosses your target price threshold. Up to 10 active alerts. Email delivery.",
  },
  "export": {
    label: "Pro+ Feature",
    headline: "CSV / JSON export",
    body: "Download the full ranking dataset with scores, values, and historical snapshots for your own analysis.",
  },
  "white-paper": {
    label: "Pro+ Feature",
    headline: "Quarterly research brief",
    body: "Deep-dive white papers on market movements, emerging appreciators, and editorial top picks each quarter.",
  },
  "full-ranking": {
    label: "Free Access",
    headline: "See the full ranking",
    body: "Enter your email to unlock all 21 vehicles — free forever.",
  },
};

const TIER_CONFIG: Record<"pro" | "pro+", { price: string; cta: string; checkoutPath: string; badgeColor: string }> = {
  "pro": {
    price: "$12/mo",
    cta: "Upgrade to Pro",
    checkoutPath: "/checkout/pro",
    badgeColor: "#F7C948",
  },
  "pro+": {
    price: "$29/mo",
    cta: "Upgrade to Pro+",
    checkoutPath: "/checkout/pro-plus",
    badgeColor: "#a78bfa",
  },
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function UpsellCTA({ variant, requiredTier, compact = false }: UpsellCTAProps) {
  // Paid plans are hidden until billing is explicitly enabled.
  if (!isBillingEnabled()) return null;
  // "free" tier upsell means email gate — shouldn't reach here, but handle gracefully
  if (requiredTier === "free") return null;

  const copy = COPY[variant];
  const tier = TIER_CONFIG[requiredTier];

  if (compact) {
    return (
      <div
        className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs shadow-lg"
        style={{ background: "#122848", border: `1px solid ${tier.badgeColor}30` }}
      >
        <span
          className="rounded px-1.5 py-0.5 text-[10px] font-bold"
          style={{ background: `${tier.badgeColor}18`, color: tier.badgeColor }}
        >
          {copy.label}
        </span>
        <span className="font-medium text-white">{copy.headline}</span>
        <a
          href={tier.checkoutPath}
          className="ml-auto rounded px-2 py-1 text-[10px] font-bold transition-opacity hover:opacity-80"
          style={{ background: tier.badgeColor, color: "#0B1F3B" }}
        >
          {tier.cta}
        </a>
      </div>
    );
  }

  return (
    <div
      className="my-4 rounded-xl p-6 text-center"
      style={{
        background: "#122848",
        border: `1px solid ${tier.badgeColor}30`,
      }}
    >
      {/* Badge */}
      <div
        className="mb-3 inline-block rounded-full px-3 py-1 text-xs font-bold uppercase tracking-widest"
        style={{ background: `${tier.badgeColor}18`, color: tier.badgeColor }}
      >
        {copy.label}
      </div>

      {/* Headline */}
      <h4 className="mb-2 text-lg font-bold text-white">{copy.headline}</h4>

      {/* Body */}
      <p className="mb-5 text-sm text-slate-400">{copy.body}</p>

      {/* Price + CTA */}
      <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
        <a
          href={tier.checkoutPath}
          className="w-full rounded-lg px-6 py-3 text-sm font-bold transition-opacity hover:opacity-90 sm:w-auto"
          style={{ background: tier.badgeColor, color: "#0B1F3B" }}
        >
          {tier.cta} — {tier.price}
        </a>
        <span className="text-xs text-slate-600">Cancel anytime · No lock-in</span>
      </div>
    </div>
  );
}
