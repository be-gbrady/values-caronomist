"use client";

/**
 * TierGate — Content access control component
 *
 * Wraps any child content and renders it gated behind the user's current
 * access tier. Supports three access levels:
 *   - "free"   : email-captured, full ranking visible, sub-scores locked
 *   - "pro"    : $12/mo — full sub-scores, deep dives, portfolio tracker
 *   - "pro+"   : $29/mo — CSV export, alerts, quarterly white paper
 *
 * Memberstack-ready: when NEXT_PUBLIC_MEMBERSTACK_KEY is configured, TierGate
 * reads the plan from the Memberstack member object. Without it, tier is
 * derived from localStorage (set by EmailCaptureGate + a future
 * /api/checkout/success webhook).
 *
 * Usage:
 *   <TierGate requiredTier="pro" upsellVariant="radar-chart">
 *     <SixDRadarChart ... />
 *   </TierGate>
 *
 * Props:
 *   requiredTier    - minimum tier to view children ("free" | "pro" | "pro+")
 *   upsellVariant   - which upsell message/CTA to show when locked
 *   children        - content to render when access is granted
 *   blurFallback    - if true, render children blurred instead of hidden (default: false)
 */

import { useEffect, useState } from "react";
import { UpsellCTA, UpsellVariant } from "./UpsellCTA";

export type AccessTier = "none" | "free" | "pro" | "pro+";

export interface TierGateProps {
  requiredTier: "free" | "pro" | "pro+";
  upsellVariant?: UpsellVariant;
  children: React.ReactNode;
  blurFallback?: boolean;
  /** Override: skip tier check and always show (for SSR/preview) */
  alwaysShow?: boolean;
}

const TIER_ORDER: Record<AccessTier, number> = {
  none: 0,
  free: 1,
  pro: 2,
  "pro+": 3,
};

const REQUIRED_ORDER: Record<"free" | "pro" | "pro+", number> = {
  free: 1,
  pro: 2,
  "pro+": 3,
};

// ---------------------------------------------------------------------------
// Tier detection helpers
// ---------------------------------------------------------------------------

const FREE_STORAGE_KEY = "caronomist_free_email";
const PRO_STORAGE_KEY = "caronomist_plan"; // "pro" | "pro+"

/**
 * Synchronously derive tier from localStorage.
 * When Memberstack is loaded, call detectMemberstackTier() instead.
 */
function detectLocalTier(): AccessTier {
  if (typeof window === "undefined") return "none";
  const plan = localStorage.getItem(PRO_STORAGE_KEY);
  if (plan === "pro+") return "pro+";
  if (plan === "pro") return "pro";
  if (localStorage.getItem(FREE_STORAGE_KEY)) return "free";
  return "none";
}

/** Set local tier after a successful Stripe checkout callback */
export function setLocalTier(tier: "pro" | "pro+"): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(PRO_STORAGE_KEY, tier);
}

/** Clear tier on sign-out */
export function clearLocalTier(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(PRO_STORAGE_KEY);
  localStorage.removeItem(FREE_STORAGE_KEY);
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function TierGate({
  requiredTier,
  upsellVariant = "generic",
  children,
  blurFallback = false,
  alwaysShow = false,
}: TierGateProps) {
  const [userTier, setUserTier] = useState<AccessTier>("none");
  const [resolved, setResolved] = useState(false);

  useEffect(() => {
    async function resolve() {
      // Try Memberstack first (if loaded)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const ms = (window as any).$memberstackDom;
      if (ms && process.env.NEXT_PUBLIC_MEMBERSTACK_KEY) {
        try {
          const member = await ms.getCurrentMember();
          if (member?.data) {
            // Map Memberstack plan IDs to internal tiers
            // Adjust plan IDs when Memberstack is configured
            const planIds: string[] =
              member.data.planConnections?.map(
                (c: { planId: string }) => c.planId
              ) ?? [];
            if (
              planIds.some((id) =>
                ["pro-plus-monthly", "pro-plus-yearly", "lifetime"].includes(id)
              )
            ) {
              setUserTier("pro+");
            } else if (
              planIds.some((id) =>
                ["pro-monthly", "pro-yearly"].includes(id)
              )
            ) {
              setUserTier("pro");
            } else if (member.data.id) {
              setUserTier("free");
            } else {
              setUserTier("none");
            }
          } else {
            setUserTier(detectLocalTier());
          }
        } catch {
          setUserTier(detectLocalTier());
        }
      } else {
        setUserTier(detectLocalTier());
      }
      setResolved(true);
    }
    resolve();
  }, []);

  // During SSR / before hydration: don't show locked content (avoids flash)
  if (!resolved && !alwaysShow) {
    return null;
  }

  const hasAccess =
    alwaysShow ||
    TIER_ORDER[userTier] >= REQUIRED_ORDER[requiredTier];

  if (hasAccess) {
    return <>{children}</>;
  }

  if (blurFallback) {
    return (
      <div className="relative">
        <div style={{ filter: "blur(4px)", userSelect: "none", pointerEvents: "none" }}>
          {children}
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <UpsellCTA variant={upsellVariant} requiredTier={requiredTier} compact />
        </div>
      </div>
    );
  }

  return <UpsellCTA variant={upsellVariant} requiredTier={requiredTier} />;
}
