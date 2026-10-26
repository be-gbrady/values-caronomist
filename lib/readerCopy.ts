import { META, OVERALL_RANKING, SLICE_RANKINGS, getModelByCode, type RankedModel } from "./rankingData";
import { modelCodeToSlug } from "./vehicleData";

/** First commit of lib/rankingData.ts: 806605391f0b5876e89dcf1a7520f3decaec6b28. */
export const SITE_PUBLISHED_DATE = "2026-04-03";

export const READER_QUESTION =
  "Which enthusiast car from 1968–2013 is the best buy right now?";

const SLICE_KEYS = [
  "appreciation_focus",
  "performance_focus",
  "budget_focus",
  "preservation_focus",
] as const;

type SliceKey = (typeof SLICE_KEYS)[number];

export function isoDate(value: string): string {
  return value.slice(0, 10);
}

export function rankingAsOfDate(): string {
  return isoDate(META.computed_at);
}

export function formatUtcDate(isoDay: string): string {
  const [year, month, day] = isoDay.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day)).toLocaleDateString("en-US", {
    timeZone: "UTC",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function modelLabel(model: Pick<RankedModel, "make" | "model" | "generation">): string {
  return `${model.make} ${model.model} (${model.generation})`;
}

export function siteDefinition(): string {
  return `Caronomist Values ranks ${META.model_count} collector and enthusiast cars (1968–2013) on a 100-point score so buyers and owners can compare appreciation, heritage, liquidity, running costs, performance, and upgradability.`;
}

function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function sliceLeader(slice: SliceKey): RankedModel {
  const code = SLICE_RANKINGS[slice][0]?.modelCode;
  const model = code ? getModelByCode(code) : undefined;
  if (!model) {
    throw new Error(`Missing leader for ${slice}`);
  }
  return model;
}

export function buyerAnswer(): string {
  const appreciation = sliceLeader("appreciation_focus");
  const performance = sliceLeader("performance_focus");
  const budget = sliceLeader("budget_focus");
  const preservation = sliceLeader("preservation_focus");
  const asOf = formatUtcDate(rankingAsOfDate());
  const opening =
    appreciation.modelCode === performance.modelCode
      ? `both the appreciation slice and the performance slice are led by the ${modelLabel(appreciation)}`
      : `the appreciation slice is led by the ${modelLabel(appreciation)} and the performance slice is led by the ${modelLabel(performance)}`;
  const text = `It depends on what you want from the car. In the ${asOf} snapshot, ${opening}. The budget slice is led by the ${modelLabel(budget)}. The preservation slice is led by the ${modelLabel(preservation)}. Those are ranks inside this ${META.model_count}-car set, not a prediction of future prices.`;
  const words = wordCount(text);
  if (words > 100) {
    throw new Error(`Buyer answer is ${words} words`);
  }
  return text;
}

export function homeStructuredData(origin: string) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        name: "Caronomist Values",
        url: origin,
        description: siteDefinition(),
      },
      {
        "@type": "Organization",
        name: "Caronomist",
        url: origin,
      },
      {
        "@type": "ItemList",
        name: "Enthusiast vehicle rankings",
        numberOfItems: OVERALL_RANKING.length,
        itemListElement: OVERALL_RANKING.map((model) => ({
          "@type": "ListItem",
          position: model.rank,
          name: modelLabel(model),
          url: `${origin}/vehicles/${modelCodeToSlug(model.modelCode)}`,
        })),
      },
    ],
  };
}

export function vehicleStructuredData(
  origin: string,
  vehicle: {
    make: string;
    model: string;
    generation: string;
    modelCode: string;
    notes: string;
    price_range: { low: number; high: number };
  }
) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: modelLabel(vehicle),
    description: vehicle.notes,
    category: "Collector vehicle",
    brand: { "@type": "Brand", name: vehicle.make },
    url: `${origin}/vehicles/${modelCodeToSlug(vehicle.modelCode)}`,
    offers: {
      "@type": "AggregateOffer",
      lowPrice: vehicle.price_range.low,
      highPrice: vehicle.price_range.high,
      priceCurrency: "USD",
    },
  };
}

export const SCORE_WEIGHT_LABELS: Record<string, string> = {
  appreciation: "Appreciation",
  heritage: "Heritage",
  liquidity: "Liquidity",
  coo: "Running costs",
  performance: "Performance",
  upgradability: "Upgradability",
};
