// Master Ranking Data — generated 2026-04-02 by Kion Sprint Wave 22
// Source: Corporate-Library/Projects/caronomist/data/master-ranking-2026-04-02.json

export interface DimensionScores {
  appreciation: number;
  heritage: number;
  liquidity: number;
  coo: number;
  performance: number;
  upgradability: number;
}

export interface MarketValue {
  weighted_official: number;
  trend_signal: string;
  trend_12mo_pct: number;
}

export interface RankedModel {
  rank: number;
  modelCode: string;
  make: string;
  model: string;
  generation: string;
  yearRange: string;
  overallScore: number;
  dimensionScores: DimensionScores;
  marketValue: MarketValue;
  hp_stock: number;
  production_count: number;
  community_heat: number;
  homologation: boolean;
}

export interface SliceEntry {
  rank: number;
  modelCode: string;
  sliceScore: number;
}

export interface SliceRankings {
  appreciation_focus: SliceEntry[];
  performance_focus: SliceEntry[];
  budget_focus: SliceEntry[];
  preservation_focus: SliceEntry[];
}

export const META = {
  computed_at: "2026-04-02T14:31:00Z",
  version: "1.0",
  model_count: 21,
  scoring_version: "v1.0",
  weights: {
    appreciation: 0.25,
    heritage: 0.20,
    liquidity: 0.15,
    coo: 0.15,
    performance: 0.15,
    upgradability: 0.10,
  },
};

export const OVERALL_RANKING: RankedModel[] = [
  {
    rank: 1,
    modelCode: "BMW-E90-M3",
    make: "BMW",
    model: "M3",
    generation: "E90/E92/E93",
    yearRange: "2008–2013",
    overallScore: 79.5,
    dimensionScores: { appreciation: 82, heritage: 91, liquidity: 85, coo: 44, performance: 83, upgradability: 90 },
    marketValue: { weighted_official: 30500, trend_signal: "RISING", trend_12mo_pct: 8.0 },
    hp_stock: 414, production_count: 19000, community_heat: 10, homologation: false,
  },
  {
    rank: 2,
    modelCode: "BMW-E36-M3",
    make: "BMW",
    model: "M3",
    generation: "E36",
    yearRange: "1994–1999",
    overallScore: 76.6,
    dimensionScores: { appreciation: 85, heritage: 84, liquidity: 91, coo: 40, performance: 66, upgradability: 90 },
    marketValue: { weighted_official: 22300, trend_signal: "RISING", trend_12mo_pct: 12.0 },
    hp_stock: 240, production_count: 71000, community_heat: 9, homologation: false,
  },
  {
    rank: 3,
    modelCode: "BMW-E46-M3",
    make: "BMW",
    model: "M3",
    generation: "E46",
    yearRange: "2001–2006",
    overallScore: 76.0,
    dimensionScores: { appreciation: 72, heritage: 91, liquidity: 85, coo: 44, performance: 76, upgradability: 90 },
    marketValue: { weighted_official: 32900, trend_signal: "STABLE-RISING", trend_12mo_pct: 5.0 },
    hp_stock: 333, production_count: 45000, community_heat: 10, homologation: false,
  },
  {
    rank: 4,
    modelCode: "POR-996",
    make: "Porsche",
    model: "911",
    generation: "996",
    yearRange: "1999–2004",
    overallScore: 74.2,
    dimensionScores: { appreciation: 78, heritage: 76, liquidity: 91, coo: 40, performance: 79, upgradability: 80 },
    marketValue: { weighted_official: 26200, trend_signal: "RISING", trend_12mo_pct: 12.0 },
    hp_stock: 296, production_count: 175000, community_heat: 8, homologation: false,
  },
  {
    rank: 5,
    modelCode: "BMW-Z3-COUPE",
    make: "BMW",
    model: "Z3 Coupe",
    generation: "E36/8",
    yearRange: "1998–2002",
    overallScore: 73.1,
    dimensionScores: { appreciation: 100, heritage: 63, liquidity: 80, coo: 45, performance: 65, upgradability: 70 },
    marketValue: { weighted_official: 28500, trend_signal: "RISING", trend_12mo_pct: 10.0 },
    hp_stock: 240, production_count: 5765, community_heat: 8, homologation: false,
  },
  {
    rank: 6,
    modelCode: "BMW-E30-M3",
    make: "BMW",
    model: "M3",
    generation: "E30",
    yearRange: "1987–1991",
    overallScore: 72.4,
    dimensionScores: { appreciation: 80, heritage: 98, liquidity: 60, coo: 30, performance: 62, upgradability: 75 },
    marketValue: { weighted_official: 62000, trend_signal: "RISING", trend_12mo_pct: 6.5 },
    hp_stock: 192, production_count: 17970, community_heat: 10, homologation: true,
  },
  {
    rank: 7,
    modelCode: "BMW-E46-330",
    make: "BMW",
    model: "330i/330ci",
    generation: "E46",
    yearRange: "2001–2005",
    overallScore: 71.3,
    dimensionScores: { appreciation: 75, heritage: 72, liquidity: 88, coo: 65, performance: 58, upgradability: 85 },
    marketValue: { weighted_official: 14800, trend_signal: "RISING", trend_12mo_pct: 10.0 },
    hp_stock: 225, production_count: 280000, community_heat: 8, homologation: false,
  },
  {
    rank: 8,
    modelCode: "BMW-1M-E82",
    make: "BMW",
    model: "1M Coupe",
    generation: "E82",
    yearRange: "2011",
    overallScore: 70.2,
    dimensionScores: { appreciation: 68, heritage: 84, liquidity: 72, coo: 48, performance: 81, upgradability: 82 },
    marketValue: { weighted_official: 58000, trend_signal: "STABLE-HIGH", trend_12mo_pct: 3.0 },
    hp_stock: 335, production_count: 6309, community_heat: 10, homologation: false,
  },
  {
    rank: 9,
    modelCode: "BMW-135IS-E82",
    make: "BMW",
    model: "135i/135is",
    generation: "E82",
    yearRange: "2008–2013",
    overallScore: 68.0,
    dimensionScores: { appreciation: 72, heritage: 61, liquidity: 80, coo: 55, performance: 76, upgradability: 88 },
    marketValue: { weighted_official: 18500, trend_signal: "EARLY-APPRECIATION", trend_12mo_pct: 8.0 },
    hp_stock: 300, production_count: 32000, community_heat: 9, homologation: false,
  },
  {
    rank: 10,
    modelCode: "BMW-E90-335",
    make: "BMW",
    model: "335i",
    generation: "E90/E92/E93",
    yearRange: "2007–2013",
    overallScore: 65.6,
    dimensionScores: { appreciation: 60, heritage: 63, liquidity: 85, coo: 50, performance: 72, upgradability: 88 },
    marketValue: { weighted_official: 16200, trend_signal: "EARLY-APPRECIATION", trend_12mo_pct: 4.0 },
    hp_stock: 300, production_count: 95000, community_heat: 8, homologation: false,
  },
  {
    rank: 11,
    modelCode: "POR-997",
    make: "Porsche",
    model: "911",
    generation: "997",
    yearRange: "2005–2012",
    overallScore: 65.6,
    dimensionScores: { appreciation: 55, heritage: 76, liquidity: 85, coo: 48, performance: 82, upgradability: 70 },
    marketValue: { weighted_official: 62000, trend_signal: "STABLE", trend_12mo_pct: 3.0 },
    hp_stock: 325, production_count: 145000, community_heat: 7, homologation: false,
  },
  {
    rank: 12,
    modelCode: "MB-CLK55-W209",
    make: "Mercedes-Benz",
    model: "CLK55 AMG",
    generation: "W209",
    yearRange: "2003–2005",
    overallScore: 63.8,
    dimensionScores: { appreciation: 72, heritage: 68, liquidity: 62, coo: 38, performance: 75, upgradability: 60 },
    marketValue: { weighted_official: 22000, trend_signal: "EARLY-APPRECIATION", trend_12mo_pct: 5.0 },
    hp_stock: 362, production_count: 12000, community_heat: 7, homologation: false,
  },
  {
    rank: 13,
    modelCode: "POR-993",
    make: "Porsche",
    model: "911",
    generation: "993",
    yearRange: "1995–1998",
    overallScore: 63.2,
    dimensionScores: { appreciation: 52, heritage: 91, liquidity: 60, coo: 40, performance: 72, upgradability: 60 },
    marketValue: { weighted_official: 92000, trend_signal: "STABLE-HIGH", trend_12mo_pct: 1.0 },
    hp_stock: 272, production_count: 68000, community_heat: 9, homologation: false,
  },
  {
    rank: 14,
    modelCode: "BMW-M635CSI-E24",
    make: "BMW",
    model: "M635CSi / M6",
    generation: "E24",
    yearRange: "1984–1989",
    overallScore: 62.4,
    dimensionScores: { appreciation: 68, heritage: 82, liquidity: 52, coo: 35, performance: 60, upgradability: 65 },
    marketValue: { weighted_official: 38000, trend_signal: "STABLE-RISING", trend_12mo_pct: 5.0 },
    hp_stock: 256, production_count: 5855, community_heat: 7, homologation: false,
  },
  {
    rank: 15,
    modelCode: "BMW-2002",
    make: "BMW",
    model: "2002",
    generation: "E10",
    yearRange: "1968–1976",
    overallScore: 60.8,
    dimensionScores: { appreciation: 60, heritage: 95, liquidity: 55, coo: 50, performance: 35, upgradability: 70 },
    marketValue: { weighted_official: 22000, trend_signal: "STABLE-RISING", trend_12mo_pct: 4.0 },
    hp_stock: 113, production_count: 340000, community_heat: 8, homologation: false,
  },
  {
    rank: 16,
    modelCode: "POR-964",
    make: "Porsche",
    model: "911",
    generation: "964",
    yearRange: "1989–1994",
    overallScore: 59.9,
    dimensionScores: { appreciation: 50, heritage: 84, liquidity: 62, coo: 40, performance: 65, upgradability: 55 },
    marketValue: { weighted_official: 82000, trend_signal: "STABLE", trend_12mo_pct: 2.0 },
    hp_stock: 247, production_count: 63762, community_heat: 8, homologation: false,
  },
  {
    rank: 17,
    modelCode: "MB-W124",
    make: "Mercedes-Benz",
    model: "E-Class",
    generation: "W124",
    yearRange: "1984–1995",
    overallScore: 59.6,
    dimensionScores: { appreciation: 68, heritage: 72, liquidity: 58, coo: 55, performance: 40, upgradability: 55 },
    marketValue: { weighted_official: 18000, trend_signal: "RISING", trend_12mo_pct: 8.0 },
    hp_stock: 134, production_count: 2700000, community_heat: 7, homologation: false,
  },
  {
    rank: 18,
    modelCode: "MB-W140",
    make: "Mercedes-Benz",
    model: "S-Class",
    generation: "W140",
    yearRange: "1991–1998",
    overallScore: 58.4,
    dimensionScores: { appreciation: 70, heritage: 68, liquidity: 55, coo: 35, performance: 48, upgradability: 50 },
    marketValue: { weighted_official: 28000, trend_signal: "RISING", trend_12mo_pct: 10.0 },
    hp_stock: 275, production_count: 406824, community_heat: 6, homologation: false,
  },
  {
    rank: 19,
    modelCode: "MB-R107",
    make: "Mercedes-Benz",
    model: "SL-Class",
    generation: "R107",
    yearRange: "1972–1989",
    overallScore: 53.0,
    dimensionScores: { appreciation: 45, heritage: 78, liquidity: 52, coo: 42, performance: 38, upgradability: 45 },
    marketValue: { weighted_official: 32000, trend_signal: "STABLE-RISING", trend_12mo_pct: 4.0 },
    hp_stock: 150, production_count: 237287, community_heat: 6, homologation: false,
  },
  {
    rank: 20,
    modelCode: "MB-W126",
    make: "Mercedes-Benz",
    model: "S-Class",
    generation: "W126",
    yearRange: "1979–1991",
    overallScore: 52.8,
    dimensionScores: { appreciation: 58, heritage: 72, liquidity: 45, coo: 45, performance: 35, upgradability: 42 },
    marketValue: { weighted_official: 22000, trend_signal: "RISING", trend_12mo_pct: 7.0 },
    hp_stock: 184, production_count: 892123, community_heat: 6, homologation: false,
  },
  {
    rank: 21,
    modelCode: "BMW-850I-E31",
    make: "BMW",
    model: "850i/850Ci",
    generation: "E31",
    yearRange: "1990–1999",
    overallScore: 51.1,
    dimensionScores: { appreciation: 50, heritage: 72, liquidity: 45, coo: 28, performance: 58, upgradability: 45 },
    marketValue: { weighted_official: 42000, trend_signal: "STABLE", trend_12mo_pct: 2.0 },
    hp_stock: 296, production_count: 30621, community_heat: 6, homologation: false,
  },
];

// Slice rankings (top 10 per slice)
export const SLICE_RANKINGS: Record<string, SliceEntry[]> = {
  appreciation_focus: [
    { rank: 1, modelCode: "BMW-E90-M3", sliceScore: 79.2 },
    { rank: 2, modelCode: "BMW-E36-M3", sliceScore: 79.2 },
    { rank: 3, modelCode: "BMW-Z3-COUPE", sliceScore: 78.5 },
    { rank: 4, modelCode: "BMW-E30-M3", sliceScore: 77.9 },
    { rank: 5, modelCode: "BMW-E46-M3", sliceScore: 75.2 },
    { rank: 6, modelCode: "POR-996", sliceScore: 74.4 },
    { rank: 7, modelCode: "BMW-E46-330", sliceScore: 72.7 },
    { rank: 8, modelCode: "BMW-1M-E82", sliceScore: 68.2 },
    { rank: 9, modelCode: "BMW-M635CSI-E24", sliceScore: 68.2 },
    { rank: 10, modelCode: "BMW-135IS-E82", sliceScore: 65.5 },
  ],
  performance_focus: [
    { rank: 1, modelCode: "BMW-E90-M3", sliceScore: 82.6 },
    { rank: 2, modelCode: "BMW-1M-E82", sliceScore: 78.4 },
    { rank: 3, modelCode: "POR-997", sliceScore: 77.8 },
    { rank: 4, modelCode: "BMW-E46-M3", sliceScore: 77.3 },
    { rank: 5, modelCode: "POR-996", sliceScore: 76.1 },
    { rank: 6, modelCode: "BMW-135IS-E82", sliceScore: 76.0 },
    { rank: 7, modelCode: "BMW-E90-335", sliceScore: 74.2 },
    { rank: 8, modelCode: "MB-CLK55-W209", sliceScore: 71.3 },
    { rank: 9, modelCode: "BMW-E36-M3", sliceScore: 71.2 },
    { rank: 10, modelCode: "POR-964", sliceScore: 68.8 },
  ],
  budget_focus: [
    { rank: 1, modelCode: "BMW-E46-330", sliceScore: 79.1 },
    { rank: 2, modelCode: "BMW-E90-335", sliceScore: 76.4 },
    { rank: 3, modelCode: "BMW-135IS-E82", sliceScore: 74.8 },
    { rank: 4, modelCode: "BMW-E36-M3", sliceScore: 73.2 },
    { rank: 5, modelCode: "BMW-2002", sliceScore: 68.5 },
    { rank: 6, modelCode: "MB-W124", sliceScore: 67.9 },
    { rank: 7, modelCode: "MB-CLK55-W209", sliceScore: 65.2 },
    { rank: 8, modelCode: "POR-996", sliceScore: 64.8 },
    { rank: 9, modelCode: "BMW-E90-M3", sliceScore: 63.1 },
    { rank: 10, modelCode: "BMW-E46-M3", sliceScore: 61.7 },
  ],
  preservation_focus: [
    { rank: 1, modelCode: "BMW-E30-M3", sliceScore: 84.1 },
    { rank: 2, modelCode: "BMW-2002", sliceScore: 81.2 },
    { rank: 3, modelCode: "BMW-M635CSI-E24", sliceScore: 78.6 },
    { rank: 4, modelCode: "POR-993", sliceScore: 77.3 },
    { rank: 5, modelCode: "BMW-E46-M3", sliceScore: 76.8 },
    { rank: 6, modelCode: "MB-R107", sliceScore: 74.2 },
    { rank: 7, modelCode: "POR-964", sliceScore: 73.9 },
    { rank: 8, modelCode: "BMW-1M-E82", sliceScore: 72.6 },
    { rank: 9, modelCode: "BMW-E90-M3", sliceScore: 71.4 },
    { rank: 10, modelCode: "MB-W126", sliceScore: 68.8 },
  ],
};

export function getModelByCode(code: string): RankedModel | undefined {
  return OVERALL_RANKING.find((m) => m.modelCode === code);
}

export function formatCurrency(val: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(val);
}

export function trendLabel(signal: string): string {
  const map: Record<string, string> = {
    "RISING": "Rising",
    "STABLE-RISING": "Stable-Rising",
    "STABLE": "Stable",
    "STABLE-HIGH": "Stable High",
    "EARLY-APPRECIATION": "Early Appreciation",
  };
  return map[signal] ?? signal;
}

export function trendColor(signal: string): string {
  if (signal === "RISING") return "#22c55e";
  if (signal === "STABLE-RISING") return "#86efac";
  if (signal === "EARLY-APPRECIATION") return "#F7C948";
  if (signal === "STABLE-HIGH") return "#94a3b8";
  return "#64748b";
}
