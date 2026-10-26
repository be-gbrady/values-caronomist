import type { MetadataRoute } from "next";
import { META, OVERALL_RANKING } from "@/lib/rankingData";
import { rankingAsOfDate } from "@/lib/readerCopy";
import { resolvePublicSiteUrl } from "@/lib/site";
import { getVehicleDetail, modelCodeToSlug } from "@/lib/vehicleData";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const origin = await resolvePublicSiteUrl();
  const lastModified = new Date(META.computed_at);

  const vehicles = OVERALL_RANKING.flatMap((model) => {
    const vehicle = getVehicleDetail(model.modelCode);
    if (!vehicle) return [];
    return [
      {
        url: `${origin}/vehicles/${modelCodeToSlug(vehicle.modelCode)}`,
        lastModified,
        changeFrequency: "weekly" as const,
        priority: 0.8,
      },
    ];
  });

  return [
    {
      url: origin,
      lastModified,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${origin}/methodology`,
      lastModified: new Date(rankingAsOfDate()),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${origin}/privacy`,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    ...vehicles,
  ];
}
