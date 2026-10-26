"use client";

/**
 * EmailCaptureGate — Free tier email capture overlay
 *
 * Renders an overlay gradient over locked table rows, prompting the user to
 * enter their email in exchange for full-table access (Free tier unlock).
 *
 * Memberstack-ready: when NEXT_PUBLIC_MEMBERSTACK_KEY is set in env, on submit
 * this component will call window.$memberstackDom?.signupMemberEmailOnly()
 * (injected by the Memberstack script tag in layout.tsx). Until that env var
 * is configured, the component stores the email in localStorage and fires
 * onUnlock — this keeps the site fully functional pre-Memberstack.
 *
 * Props:
 *   onUnlock        - called when the user successfully submits an email
 *   lockedFromRow   - row index (0-based) at which blur starts (default 5)
 *   topOffset       - CSS top value for gradient start (default "56%")
 */

import { useState } from "react";
import { isBillingEnabled } from "@/lib/billing";

interface EmailCaptureGateProps {
  onUnlock: (email: string) => void;
  lockedFromRow?: number;
  topOffset?: string;
}

const STORAGE_KEY = "caronomist_free_email";

export function EmailCaptureGate({
  onUnlock,
  topOffset = "56%",
}: EmailCaptureGateProps) {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const trimmed = email.trim();
    if (!trimmed.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }

    setSubmitting(true);

    try {
      // Memberstack path (activated when env var is set + script loaded)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const ms = (window as any).$memberstackDom;
      if (ms && process.env.NEXT_PUBLIC_MEMBERSTACK_KEY) {
        await ms.signupMemberEmailOnly({ email: trimmed });
      } else {
        // Fallback: store locally for now; Mailchimp/ConvertKit webhook can
        // be wired here later via a simple POST to /api/subscribe
        localStorage.setItem(STORAGE_KEY, trimmed);
        // Optional: fire-and-forget to a future API route
        fetch("/api/subscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: trimmed, tier: "free" }),
        }).catch(() => {
          // Silently ignore — endpoint may not exist yet
        });
      }

      onUnlock(trimmed);
    } catch (err) {
      console.error("Email capture error:", err);
      // If Memberstack fails, fall back to localStorage unlock so UX is never
      // broken for the user
      localStorage.setItem(STORAGE_KEY, trimmed);
      onUnlock(trimmed);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="absolute inset-x-0 z-10 flex flex-col items-center justify-center px-4 py-12"
      style={{
        background:
          "linear-gradient(to bottom, transparent 0%, #0B1F3B 30%, #0B1F3B 100%)",
        top: topOffset,
      }}
    >
      <div
        className="w-full max-w-md rounded-2xl p-8 text-center shadow-2xl"
        style={{
          background: "#122848",
          border: "1px solid rgba(247,201,72,0.25)",
        }}
      >
        {/* Badge */}
        <div className="mb-2 text-sm font-semibold uppercase tracking-widest text-yellow-400">
          Free Access
        </div>

        {/* Headline */}
        <h3 className="mb-2 text-xl font-bold text-white">
          See all 21 vehicles ranked
        </h3>

        {/* Sub-copy */}
        <p className="mb-6 text-sm text-slate-400">
          Enter your email for free access to the complete ranking, trend
          signals, and market values.
          {isBillingEnabled() ? " No credit card required." : ""}
        </p>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-3 sm:flex-row"
        >
          <label htmlFor="gate-email" className="sr-only">
            Email address
          </label>
          <input
            id="gate-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            autoComplete="email"
            disabled={submitting}
            className="flex-1 rounded-lg px-4 py-3 text-sm text-white outline-none disabled:opacity-60"
            style={{
              background: "#0B1F3B",
              border: "1px solid rgba(247,201,72,0.3)",
            }}
          />
          <button
            type="submit"
            disabled={submitting}
            className="rounded-lg px-6 py-3 text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-60"
            style={{ background: "#F7C948", color: "#0B1F3B" }}
          >
            {submitting ? "Unlocking…" : "Unlock"}
          </button>
        </form>

        {/* Error message */}
        {error && (
          <p className="mt-2 text-xs text-red-400">{error}</p>
        )}

        {/* Fine print */}
        <p className="mt-3 text-xs text-slate-600">
          No spam. Unsubscribe anytime.
          {isBillingEnabled() ? " Pro plan unlocks sub-scores and alerts." : ""}
        </p>
      </div>
    </div>
  );
}

/**
 * Utility: check if user has already unlocked Free tier
 * (either via Memberstack or localStorage fallback)
 */
export function getFreeEmailFromStorage(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(STORAGE_KEY);
}
