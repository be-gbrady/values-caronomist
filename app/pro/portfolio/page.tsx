"use client";

/**
 * /pro/portfolio — Portfolio Tracker (Pro feature)
 *
 * Gated behind Pro tier (TierGate). Free and unauthenticated users see
 * the upsell CTA. Pro members can track up to 10 vehicles. Pro+ is unlimited.
 *
 * Tier limits:
 *   - none:  0 (must sign up / email gate first)
 *   - free:  3 cars (preview / incentive to upgrade)
 *   - pro:   10 cars
 *   - pro+:  unlimited (-1)
 */

import { useEffect, useState } from "react";
import { isBillingEnabled } from "@/lib/billing";
import { TierGate, type AccessTier } from "../../../components/TierGate";
import { PortfolioForm } from "../../../components/PortfolioForm";
import {
  PortfolioList,
  loadPortfolio,
  savePortfolio,
  type PortfolioEntry,
} from "../../../components/PortfolioList";

const TIER_LIMITS: Record<AccessTier, number> = {
  none: 0,
  free: 3,
  pro: 10,
  "pro+": -1, // unlimited
};

function useCurrentTier(): AccessTier {
  const [tier, setTier] = useState<AccessTier>("none");

  useEffect(() => {
    async function detect() {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const ms = (window as any).$memberstackDom;
      if (ms && process.env.NEXT_PUBLIC_MEMBERSTACK_KEY) {
        try {
          const member = await ms.getCurrentMember();
          if (member?.data) {
            const planIds: string[] =
              member.data.planConnections?.map((c: { planId: string }) => c.planId) ?? [];
            if (planIds.some((id) => ["pro-plus-monthly", "pro-plus-yearly", "lifetime"].includes(id))) {
              setTier("pro+");
            } else if (planIds.some((id) => ["pro-monthly", "pro-yearly"].includes(id))) {
              setTier("pro");
            } else if (member.data.id) {
              setTier("free");
            }
            return;
          }
        } catch { /* fall through */ }
      }
      // localStorage fallback
      const plan = localStorage.getItem("caronomist_plan");
      if (plan === "pro+") setTier("pro+");
      else if (plan === "pro") setTier("pro");
      else if (localStorage.getItem("caronomist_free_email")) setTier("free");
    }
    detect();
  }, []);

  return tier;
}

export default function PortfolioPage() {
  const [entries, setEntries] = useState<PortfolioEntry[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const tier = useCurrentTier();

  useEffect(() => {
    setEntries(loadPortfolio());
    setHydrated(true);
  }, []);

  function handleAdd(entry: PortfolioEntry) {
    const updated = [...entries, entry];
    setEntries(updated);
    savePortfolio(updated);
  }

  function handleRemove(id: string) {
    const updated = entries.filter((e) => e.id !== id);
    setEntries(updated);
    savePortfolio(updated);
  }

  if (!hydrated) return null;

  const limit = TIER_LIMITS[tier];

  return (
    <main style={{ maxWidth: 900, margin: "0 auto", padding: "2rem 1rem" }}>
      {/* Header */}
      <div style={{ marginBottom: "2rem" }}>
        <a
          href="/"
          style={{ color: "var(--yellow)", fontSize: "0.875rem", textDecoration: "none" }}
        >
          ← Back to Rankings
        </a>
        <h1
          style={{
            marginTop: "0.75rem",
            fontSize: "1.75rem",
            fontWeight: 700,
            color: "#f1f5f9",
          }}
        >
          Portfolio Tracker
          {isBillingEnabled() && (
            <span
              style={{
                fontSize: "0.75rem",
                background: "var(--yellow)",
                color: "#0B1F3B",
                padding: "2px 8px",
                borderRadius: 999,
                fontWeight: 700,
                verticalAlign: "middle",
                marginLeft: "0.5rem",
              }}
            >
              PRO
            </span>
          )}
        </h1>
        <p style={{ color: "#94a3b8", marginTop: "0.5rem", fontSize: "0.9rem" }}>
          Track your collector car collection against live market values. See your
          unrealized gains, P&amp;L, and how your portfolio compares to the market.
        </p>
      </div>

      {/* Free tier preview — allow up to 3 cars without Pro */}
      {tier === "none" ? (
        <TierGate requiredTier="free" upsellVariant="portfolio">
          <div /> {/* unreachable for none tier — upsell shown */}
        </TierGate>
      ) : (
        <div className="portfolio-page">
          {/* Tier badge */}
          <div className="tier-status-bar">
            <span>
              {tier === "free" && isBillingEnabled() && (
                <>
                  <span style={{ color: "var(--yellow)" }}>Free tier</span> — tracking up to 3 vehicles.{" "}
                  <a href="/checkout/pro" style={{ color: "var(--yellow)", textDecoration: "underline" }}>
                    Upgrade to Pro
                  </a>{" "}
                  for 10 vehicles + full score access.
                </>
              )}
              {tier === "free" && !isBillingEnabled() && <>Tracking up to 3 vehicles.</>}
              {tier === "pro" && isBillingEnabled() && (
                <>
                  <span style={{ color: "var(--yellow)" }}>Pro</span> — tracking up to 10 vehicles.{" "}
                  <a href="/checkout/pro-plus" style={{ color: "#a78bfa", textDecoration: "underline" }}>
                    Upgrade to Pro+
                  </a>{" "}
                  for unlimited tracking + custom alerts.
                </>
              )}
              {tier === "pro" && !isBillingEnabled() && <>Tracking up to 10 vehicles.</>}
              {tier === "pro+" && isBillingEnabled() && (
                <>
                  <span style={{ color: "#a78bfa" }}>Pro+</span> — unlimited vehicle tracking. Full access.
                </>
              )}
              {tier === "pro+" && !isBillingEnabled() && <>Unlimited vehicle tracking.</>}
            </span>
            <span style={{ color: "#475569", fontSize: "0.8rem" }}>
              {entries.length} / {limit === -1 ? "∞" : limit} vehicles
            </span>
          </div>

          <PortfolioForm entries={entries} tierLimit={limit} onAdd={handleAdd} />

          <div style={{ marginTop: "2rem" }}>
            <PortfolioList entries={entries} onRemove={handleRemove} />
          </div>

          {/* Data notice */}
          <p
            style={{
              marginTop: "2rem",
              color: "#475569",
              fontSize: "0.75rem",
              textAlign: "center",
            }}
          >
            Market values sourced from Caronomist SPI data (updated periodically).
            This is not financial advice. All P&amp;L figures are unrealized estimates.
          </p>
        </div>
      )}
    </main>
  );
}
