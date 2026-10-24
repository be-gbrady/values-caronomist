import type { MetadataRoute } from "next";
import { META, OVERALL_RANKING } from "@/lib/rankingData";
import { CANONICAL_ORIGIN } from "@/lib/site";
import { getVehicleDetail, modelCodeToSlug } from "@/lib/vehicleData";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date(META.computed_at);

  const vehicles = OVERALL_RANKING.flatMap((model) => {
    const vehicle = getVehicleDetail(model.modelCode);
    if (!vehicle) return [];
    return [
      {
        url: `${CANONICAL_ORIGIN}/vehicles/${modelCodeToSlug(vehicle.modelCode)}`,
        lastModified,
        changeFrequency: "weekly" as const,
        priority: 0.8,
      },
    ];
  });

  return [
    {
      url: CANONICAL_ORIGIN,
      lastModified,
      changeFrequency: "weekly",
      priority: 1,
    },
    ...vehicles,
  ];
}
