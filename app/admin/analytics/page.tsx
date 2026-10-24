"use client";

import { useState, useEffect } from "react";
import AnalyticsDashboard from "@/components/AnalyticsDashboard";

// Admin gate: reads localStorage "caronomist_admin" key
// In production, replace with Memberstack admin plan check or server session cookie
export default function AdminAnalyticsPage() {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const adminKey = process.env.NEXT_PUBLIC_ADMIN_KEY;

  useEffect(() => {
    const stored = typeof window !== "undefined" && localStorage.getItem("caronomist_admin");
    setIsAdmin(stored === "true");
  }, []);

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (adminKey && password === adminKey) {
      localStorage.setItem("caronomist_admin", "true");
      setIsAdmin(true);
      setError("");
    } else {
      setError(adminKey ? "Incorrect password." : "Admin access is not configured.");
    }
  }

  function handleLogout() {
    localStorage.removeItem("caronomist_admin");
    setIsAdmin(false);
  }

  if (isAdmin === null) {
    return (
      <div style={{ minHeight: "100vh", background: "#0B1F3B", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ color: "#94a3b8", fontFamily: "Inter, sans-serif" }}>Loading…</div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div style={{
        minHeight: "100vh",
        background: "#0B1F3B",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "Inter, sans-serif",
      }}>
        <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: "12px", padding: "2rem", width: "100%", maxWidth: "360px" }}>
          <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
            <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>🔐</div>
            <h2 style={{ margin: 0, color: "#F7C948", fontSize: "1.25rem" }}>Admin Access</h2>
            <p style={{ margin: "0.5rem 0 0", color: "#64748b", fontSize: "0.85rem" }}>values.caronomist.com · Internal Dashboard</p>
          </div>
          <form onSubmit={handleLogin}>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Admin password"
              style={{
                width: "100%",
                padding: "0.75rem",
                background: "#1e293b",
                border: "1px solid #334155",
                borderRadius: "6px",
                color: "#e2e8f0",
                fontSize: "0.9rem",
                marginBottom: "0.75rem",
                boxSizing: "border-box",
              }}
            />
            {error && <p style={{ color: "#f87171", fontSize: "0.8rem", margin: "0 0 0.75rem" }}>{error}</p>}
            <button
              type="submit"
              style={{
                width: "100%",
                padding: "0.75rem",
                background: "#F7C948",
                border: "none",
                borderRadius: "6px",
                color: "#0B1F3B",
                fontWeight: 700,
                fontSize: "0.9rem",
                cursor: "pointer",
              }}
            >
              Enter
            </button>
          </form>
          <p style={{ textAlign: "center", fontSize: "0.72rem", color: "#334155", marginTop: "1.25rem" }}>
            Admin access requires NEXT_PUBLIC_ADMIN_KEY.<br />
            Replace with a server-side session check before production use.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#0B1F3B", padding: "2rem" }}>
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "1rem" }}>
          <button
            onClick={handleLogout}
            style={{
              padding: "0.4rem 0.85rem",
              background: "transparent",
              border: "1px solid #334155",
              borderRadius: "6px",
              color: "#64748b",
              cursor: "pointer",
              fontSize: "0.8rem",
            }}
          >
            Sign out
          </button>
        </div>
        <AnalyticsDashboard />
      </div>
    </div>
  );
}
