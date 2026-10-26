import type { MetadataRoute } from "next";
import { resolvePublicSiteUrl, ROBOTS_DISALLOW } from "@/lib/site";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const origin = await resolvePublicSiteUrl();
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [...ROBOTS_DISALLOW],
    },
    sitemap: `${origin}/sitemap.xml`,
    host: origin,
  };
}
