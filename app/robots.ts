import type { MetadataRoute } from "next";
import { resolvePublicSiteUrl, ROBOTS_DISALLOW } from "@/lib/site";

/**
 * A named User-agent group replaces the "*" group for that bot, so every
 * named group repeats the same Disallow list.
 */
const NAMED_AGENTS = ["meta-webindexer"] as const;

function crawlRule(userAgent: string): {
  userAgent: string;
  allow: string;
  disallow: string[];
} {
  return {
    userAgent,
    allow: "/",
    disallow: [...ROBOTS_DISALLOW],
  };
}

export default async function robots(): Promise<MetadataRoute.Robots> {
  const origin = await resolvePublicSiteUrl();
  return {
    rules: [
      ...NAMED_AGENTS.map((userAgent) => crawlRule(userAgent)),
      crawlRule("*"),
    ],
    sitemap: `${origin}/sitemap.xml`,
    host: origin,
  };
}
