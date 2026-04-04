"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ExportPanel } from "@/components/ExportPanel";
import { TierGate } from "@/components/TierGate";

export default function ExportPage() {
  const [tier, setTier] = useState<"none" | "free" | "pro" | "pro+">("none");
  const [email, setEmail] = useState("");

  useEffect(() => {
    // Memberstack detection (production)
    if (typeof window !== "undefined" && (window as unknown as Record<string, unknown>).$memberstackDom) {
      const ms = (window as unknown as Record<string, unknown>).$memberstackDom as {
        getCurrentMember: () => Promise<{ data: { planConnections: { planId: string }[] } | null }>;
      };
      ms.getCurrentMember().then(({ data }) => {
        if (!data) return;
        const plans = data.planConnections?.map((p) => p.planId) ?? [];
        if (plans.includes(process.env.NEXT_PUBLIC_MEMBERSTACK_PLAN_PRO_PLUS ?? "")) {
          setTier("pro+");
        } else if (plans.includes(process.env.NEXT_PUBLIC_MEMBERSTACK_PLAN_PRO ?? "")) {
          setTier("pro");
        } else {
          setTier("free");
        }
        // Get email from Memberstack auth data
        const member = data as unknown as Record<string, unknown>;
        if (typeof member.auth === "object" && member.auth !== null) {
          const auth = member.auth as Record<string, unknown>;
          if (typeof auth.email === "string") setEmail(auth.email);
        }
      }).catch(() => {});
    } else {
      // localStorage fallback (dev / pre-Memberstack)
      const localTier = localStorage.getItem("caronomist_tier") as "none" | "free" | "pro" | "pro+" | null;
      const localEmail = localStorage.getItem("caronomist_email") ?? "";
      if (localTier) setTier(localTier);
      if (localEmail) setEmail(localEmail);
    }
  }, []);

  return (
    <div className="min-h-screen" style={{ background: "#0B1F3B", color: "#E8EAF0", fontFamily: "Inter, sans-serif" }}>
      <div className="max-w-2xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="text-sm text-gray-400 hover:text-yellow-400 transition-colors mb-4 inline-block">
            ← Rankings
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold tracking-tight">Data Export</h1>
            <span className="text-xs px-2 py-0.5 rounded-full border border-yellow-400/30 bg-yellow-400/10 text-yellow-400 uppercase tracking-wider">
              Pro+
            </span>
          </div>
          <p className="text-gray-400">
            Download your rankings, portfolio, and price alerts as CSV or JSON.
          </p>
        </div>

        {/* Tier gate — Pro required for any export */}
        <TierGate requiredTier="pro">
          <ExportPanel userTier={tier} userEmail={email} />
        </TierGate>

        {/* Navigation footer */}
        <div className="mt-10 pt-8 border-t border-white/10 flex gap-6 text-sm text-gray-500">
          <Link href="/pro/portfolio" className="hover:text-yellow-400 transition-colors">
            Portfolio Tracker
          </Link>
          <Link href="/pro/alerts" className="hover:text-yellow-400 transition-colors">
            Price Alerts
          </Link>
          <Link href="/" className="hover:text-yellow-400 transition-colors">
            Rankings
          </Link>
        </div>
      </div>
    </div>
  );
}
