"use client";
import { useState } from "react";

export type ExportFormat = "csv" | "json";
export type ExportDataset = "rankings" | "portfolio" | "alerts";

interface ExportOption {
  dataset: ExportDataset;
  label: string;
  description: string;
  requiresTier: "free" | "pro" | "pro+";
}

const EXPORT_OPTIONS: ExportOption[] = [
  {
    dataset: "rankings",
    label: "Master Rankings",
    description: "All 21 models with composite scores, dimension scores, market values, and trend signals.",
    requiresTier: "pro",
  },
  {
    dataset: "portfolio",
    label: "My Portfolio",
    description: "Your saved vehicles with cost basis, current market value, and unrealized P&L.",
    requiresTier: "pro",
  },
  {
    dataset: "alerts",
    label: "Price Alerts",
    description: "All configured price alerts with thresholds, current values, and trigger status.",
    requiresTier: "pro+",
  },
];

interface ExportPanelProps {
  userTier?: "none" | "free" | "pro" | "pro+";
  userEmail?: string;
}

const tierRank: Record<string, number> = { none: 0, free: 1, pro: 2, "pro+": 3 };

export function ExportPanel({ userTier = "none", userEmail = "" }: ExportPanelProps) {
  const [selectedDataset, setSelectedDataset] = useState<ExportDataset>("rankings");
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>("csv");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastExport, setLastExport] = useState<{ dataset: string; format: string; timestamp: string } | null>(null);

  const canExport = (option: ExportOption): boolean => {
    return tierRank[userTier] >= tierRank[option.requiresTier];
  };

  const handleExport = async () => {
    const option = EXPORT_OPTIONS.find((o) => o.dataset === selectedDataset);
    if (!option) return;
    if (!canExport(option)) {
      setError(`This export requires ${option.requiresTier} tier. Upgrade to access.`);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        dataset: selectedDataset,
        format: selectedFormat,
        ...(userEmail ? { email: userEmail } : {}),
      });

      const res = await fetch(`/api/export?${params.toString()}`);
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `Export failed: ${res.status}`);
      }

      // Trigger browser download
      const blob = await res.blob();
      const contentDisposition = res.headers.get("Content-Disposition") || "";
      const filenameMatch = contentDisposition.match(/filename="?([^";\n]+)"?/);
      const filename =
        filenameMatch?.[1] ||
        `caronomist-${selectedDataset}-${new Date().toISOString().split("T")[0]}.${selectedFormat}`;

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);

      setLastExport({
        dataset: option.label,
        format: selectedFormat.toUpperCase(),
        timestamp: new Date().toLocaleString(),
      });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Export failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Dataset selector */}
      <div>
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-3">
          Select Dataset
        </h2>
        <div className="grid gap-3">
          {EXPORT_OPTIONS.map((option) => {
            const accessible = canExport(option);
            const selected = selectedDataset === option.dataset;
            return (
              <button
                key={option.dataset}
                onClick={() => accessible && setSelectedDataset(option.dataset)}
                className={`text-left p-4 rounded-lg border transition-all ${
                  selected && accessible
                    ? "border-yellow-400 bg-yellow-400/10"
                    : accessible
                    ? "border-white/10 bg-white/5 hover:border-white/30"
                    : "border-white/5 bg-white/2 opacity-50 cursor-not-allowed"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`font-semibold ${accessible ? "text-white" : "text-gray-500"}`}>
                    {option.label}
                  </span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full border ${
                      option.requiresTier === "pro+"
                        ? "text-purple-400 border-purple-400/30 bg-purple-400/10"
                        : "text-yellow-400 border-yellow-400/30 bg-yellow-400/10"
                    }`}
                  >
                    {option.requiresTier.toUpperCase()}
                  </span>
                </div>
                <p className={`text-sm ${accessible ? "text-gray-400" : "text-gray-600"}`}>
                  {option.description}
                </p>
                {!accessible && (
                  <p className="text-xs text-purple-400 mt-1">
                    Upgrade to {option.requiresTier} to unlock →
                  </p>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Format selector */}
      <div>
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-3">
          Export Format
        </h2>
        <div className="flex gap-3">
          {(["csv", "json"] as ExportFormat[]).map((fmt) => (
            <button
              key={fmt}
              onClick={() => setSelectedFormat(fmt)}
              className={`flex-1 py-3 rounded-lg border font-semibold text-sm uppercase tracking-wider transition-all ${
                selectedFormat === fmt
                  ? "border-yellow-400 bg-yellow-400/10 text-yellow-400"
                  : "border-white/10 bg-white/5 text-gray-400 hover:border-white/30"
              }`}
            >
              {fmt === "csv" ? "📊 CSV" : "🗂️ JSON"}
              <span className="block text-xs font-normal text-gray-500 mt-0.5 normal-case tracking-normal">
                {fmt === "csv" ? "Excel / Sheets" : "Developers / API"}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Error display */}
      {error && (
        <div className="bg-red-900/30 border border-red-500/40 rounded-lg px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* Last export success */}
      {lastExport && (
        <div className="bg-green-900/20 border border-green-500/30 rounded-lg px-4 py-3 text-sm text-green-400">
          ✓ Exported <strong>{lastExport.dataset}</strong> as <strong>{lastExport.format}</strong>{" "}
          at {lastExport.timestamp}
        </div>
      )}

      {/* Export button */}
      <button
        onClick={handleExport}
        disabled={loading}
        className="w-full py-4 bg-yellow-400 text-gray-900 font-bold rounded-lg hover:bg-yellow-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm uppercase tracking-widest"
      >
        {loading ? "Preparing export…" : `Download ${selectedFormat.toUpperCase()}`}
      </button>

      {/* Format notes */}
      <div className="text-xs text-gray-500 space-y-1">
        <p>
          <strong className="text-gray-400">CSV:</strong> Opens in Excel, Google Sheets, or any
          spreadsheet. Best for analysis and sharing.
        </p>
        <p>
          <strong className="text-gray-400">JSON:</strong> Structured data with full schema. Best for
          developers, APIs, or importing into other tools.
        </p>
        <p className="text-gray-600 pt-1">
          Exports are point-in-time snapshots. Data reflects current SPI values.
        </p>
      </div>
    </div>
  );
}
