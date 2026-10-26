/**
 * Public site origin for canonical links, the sitemap, and robots.txt.
 *
 * Set NEXT_PUBLIC_SITE_URL to an absolute origin (for example
 * https://values.caronomist.com) only after that host resolves in DNS and is
 * attached to the deployment. Until then, leave it unset.
 *
 * Resolution order:
 * 1. NEXT_PUBLIC_SITE_URL
 * 2. NEXT_PUBLIC_BASE_URL (older email setting, if present)
 * 3. The incoming public Host, when this runs during a request
 * 4. https://values-caronomist.vercel.app — the host that resolves today
 *
 * Local hosts are ignored so a dev server never becomes the canonical origin.
 */

export const DEFAULT_SITE_URL = "https://values-caronomist.vercel.app";

const PRIVATE_PATHS = ["/admin", "/api", "/checkout"] as const;

export const ROBOTS_DISALLOW = [...PRIVATE_PATHS];

function normalizeOrigin(value: string | undefined): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  try {
    const url = new URL(withProtocol);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    if (!url.hostname) return null;
    return url.origin;
  } catch {
    return null;
  }
}

function configuredOrigin(): string | null {
  return (
    normalizeOrigin(process.env.NEXT_PUBLIC_SITE_URL) ??
    normalizeOrigin(process.env.NEXT_PUBLIC_BASE_URL)
  );
}

function isLocalHost(host: string): boolean {
  const name = host.split(":")[0]?.toLowerCase() ?? "";
  return (
    name === "localhost" ||
    name === "127.0.0.1" ||
    name === "0.0.0.0" ||
    name === "[::1]" ||
    name.endsWith(".local")
  );
}

/** Build-time origin: env override, otherwise the live Vercel host. */
export function publicSiteUrl(): string {
  return configuredOrigin() ?? DEFAULT_SITE_URL;
}

/**
 * Origin for a live request. Uses the public Host header when no env override
 * is set, so crawlers that fetch the working host get URLs on that host.
 */
export async function resolvePublicSiteUrl(): Promise<string> {
  const configured = configuredOrigin();
  if (configured) return configured;

  try {
    const { headers } = await import("next/headers");
    const headerList = await headers();
    const host = (headerList.get("x-forwarded-host") ?? headerList.get("host") ?? "")
      .split(",")[0]
      ?.trim();
    if (host && !isLocalHost(host)) {
      const proto =
        (headerList.get("x-forwarded-proto") ?? "https").split(",")[0]?.trim() || "https";
      const origin = normalizeOrigin(`${proto}://${host}`);
      if (origin) return origin;
    }
  } catch {
    // Static generation has no request headers.
  }

  return DEFAULT_SITE_URL;
}

export const CANONICAL_ORIGIN = publicSiteUrl();

export function canonicalUrl(path = "/", origin = CANONICAL_ORIGIN): string {
  if (path === "/" || path === "") return origin;
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${origin}${normalized}`;
}
