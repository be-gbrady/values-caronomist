"use client";

/**
 * /pro/alerts — Custom Price Alerts page (Pro+ gated)
 *
 * Full-page view for creating and managing price alerts.
 * TierGate enforces Pro+ access.
 */

import { useState } from "react";
import { isBillingEnabled } from "@/lib/billing";
import { TierGate } from "../../../components/TierGate";
import PriceAlertForm from "../../../components/PriceAlertForm";
import PriceAlertList from "../../../components/PriceAlertList";

export default function AlertsPage() {
  const [refresh, setRefresh] = useState(0);

  return (
    <TierGate requiredTier="pro+" upsellVariant="alerts">
      <div
        style={{
          minHeight: "100vh",
          background: "#0B1F3B",
          color: "#fff",
          fontFamily: "Inter, sans-serif",
          padding: "32px 16px",
        }}
      >
        <div style={{ maxWidth: 640, margin: "0 auto" }}>
          {/* Page header */}
          <div style={{ marginBottom: 32 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
              <a
                href="/"
                style={{ color: "#475569", fontSize: 13, textDecoration: "none" }}
              >
                ← Back to Rankings
              </a>
            </div>
            <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800, color: "#fff" }}>
              Price Alerts
            </h1>
            <p style={{ margin: "8px 0 0", color: "#64748b", fontSize: 14 }}>
              Get notified when tracked vehicle values cross your thresholds. Powered by the
              Caronomist Street Price Index — updated weekly.
            </p>
          </div>

          {/* Create alert form */}
          <div style={{ marginBottom: 28 }}>
            <PriceAlertForm
              onAlertCreated={() => setRefresh((r) => r + 1)}
            />
          </div>

          {/* Active alerts */}
          <div>
            <h2
              style={{
                margin: "0 0 14px",
                fontSize: 16,
                fontWeight: 700,
                color: "#94a3b8",
                textTransform: "uppercase",
                letterSpacing: 1,
              }}
            >
              Your Alerts
            </h2>
            <PriceAlertList refreshTrigger={refresh} />
          </div>

          {/* How it works */}
          <div
            style={{
              marginTop: 36,
              padding: "20px",
              background: "#112240",
              borderRadius: 10,
              border: "1px solid #1e3a5f",
            }}
          >
            <h3 style={{ margin: "0 0 12px", fontSize: 14, color: "#94a3b8" }}>
              How Price Alerts Work
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                {
                  icon: "📊",
                  title: "SPI-powered data",
                  desc: "Alerts are triggered against the Caronomist Street Price Index — real sales from BaT, Cars.com, and auction houses. Updated weekly.",
                },
                {
                  icon: "📧",
                  title: "Email notification",
                  desc: "When your threshold is crossed, you receive an email with: current value, % change, recent comparable sales, and a link to the model's detail page.",
                },
                {
                  icon: "⏸",
                  title: "Pause or delete anytime",
                  desc: "Travelling or not ready to act? Pause any alert without losing it. Delete when you've made your move.",
                },
                isBillingEnabled()
                  ? {
                      icon: "🎯",
                      title: "Up to 20 alerts (Pro+)",
                      desc: "Pro+ members can track up to 20 vehicle models simultaneously. Pro members: upgrade to Pro+ for alert access.",
                    }
                  : {
                      icon: "🎯",
                      title: "Up to 20 alerts",
                      desc: "Track up to 20 vehicle models at the same time.",
                    },
              ].map(({ icon, title, desc }) => (
                <div key={title} style={{ display: "flex", gap: 12 }}>
                  <span style={{ fontSize: 18, flexShrink: 0 }}>{icon}</span>
                  <div>
                    <div style={{ color: "#e2e8f0", fontSize: 13, fontWeight: 600 }}>{title}</div>
                    <div style={{ color: "#475569", fontSize: 12, marginTop: 2 }}>{desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </TierGate>
  );
}
