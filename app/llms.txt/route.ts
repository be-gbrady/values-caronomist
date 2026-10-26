import { META } from "@/lib/rankingData";
import {
  buyerAnswer,
  formatUtcDate,
  rankingAsOfDate,
  READER_QUESTION,
  siteDefinition,
  SITE_PUBLISHED_DATE,
} from "@/lib/readerCopy";
import { publicSiteUrl } from "@/lib/site";
import { getAllVehicleDetails, modelCodeToSlug } from "@/lib/vehicleData";

export function GET() {
  const origin = publicSiteUrl();
  const vehicles = getAllVehicleDetails()
    .map((vehicle) => `- ${vehicle.make} ${vehicle.model} (${vehicle.generation}): ${origin}/vehicles/${modelCodeToSlug(vehicle.modelCode)}`)
    .join("\n");
  const body = `# Caronomist Values

${siteDefinition()}

${READER_QUESTION}
${buyerAnswer()}

The ranking snapshot is dated ${formatUtcDate(rankingAsOfDate())} (${rankingAsOfDate()}). Scoring version ${META.scoring_version}. The ranking file was first committed on ${formatUtcDate(SITE_PUBLISHED_DATE)} (${SITE_PUBLISHED_DATE}).

Official value medians cited on the site come from Hagerty, Bring a Trailer, and Classic.com.

Sitemap: ${origin}/sitemap.xml
Rankings: ${origin}/
Methodology: ${origin}/methodology
Privacy: ${origin}/privacy

## Ranked vehicles

${vehicles}
`;
  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
