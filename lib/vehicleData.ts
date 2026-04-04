// Vehicle Detail Data Loader
// Source: Corporate-Library/Projects/caronomist/data/models/*.json + master-ranking
// Generated: 2026-04-02 by Kion Sprint Wave 32

import { OVERALL_RANKING, RankedModel } from "./rankingData";

export interface PriceBand {
  low: number;
  median: number;
  high: number;
}

export interface OfficialValue {
  bat_recent_median?: number;
  classic_com_avg?: number;
  hagerty_avg?: number;
  weighted_official: number;
  trend_signal: string;
  trend_12mo_pct: number;
  data_confidence: string;
  as_of: string;
  sources?: { source: string; note?: string; url?: string }[];
}

export interface VehicleDetail {
  modelCode: string;
  make: string;
  model: string;
  generation: string;
  yearRange: string;
  officialValue: OfficialValue;
  price_bands: {
    excellent: PriceBand;
    good: PriceBand;
    fair: PriceBand;
    project: PriceBand;
  };
  price_range: { low: number; high: number };
  notes: string;
  engines: string[];
  transmissions?: string[];
  drivetrain: string;
  hp_stock: number;
  torque_stock?: number;
  curb_weight_lbs?: number;
  zero_to_60?: number;
  production_count: number;
  known_failures: string[];
  essential_maintenance: string[];
  mod_ecosystem_strength: number;
  community_heat: number;
  parts_availability: number;
  daily_ability: number;
  motorsport_creds: string[];
  homologation: boolean;
  notable_options?: string[];
  spec_source?: string;
  spec_confidence?: string;
  // Joined from master ranking
  ranking?: RankedModel;
}

// All 21 vehicle detail records embedded at build time
// Data sourced from enriched model JSONs (Wave 22) + verified SPI data (Wave 2+)

const MODEL_DATA: VehicleDetail[] = [
  {
    modelCode: "BMW-E90-M3",
    make: "BMW", model: "M3", generation: "E90/E92/E93", yearRange: "2008–2013",
    officialValue: { weighted_official: 30500, trend_signal: "RISING", trend_12mo_pct: 8.0, data_confidence: "HIGH", as_of: "2026-04-02",
      bat_recent_median: 30000, classic_com_avg: 29000, hagerty_avg: 29500,
      sources: [{ source: "BaT", note: "Feb 2026 E90 sedan ~$28–32K range", url: "https://bringatrailer.com/bmw/e90-m3/" }, { source: "Hagerty", url: "https://www.hagerty.com/apps/valuationtools/2013-BMW-M3" }] },
    price_bands: { excellent: { low: 38000, median: 48000, high: 65000 }, good: { low: 24000, median: 32000, high: 40000 }, fair: { low: 14000, median: 20000, high: 26000 }, project: { low: 8000, median: 12000, high: 18000 } },
    price_range: { low: 10000, high: 70000 },
    notes: "V8-powered M3, last naturally aspirated M3. S65 4.0L V8 revs to 8300 rpm. E90 sedan, E92 coupe, E93 convertible. Daily driver-capable with high maintenance costs. GTS variant is blue-chip collector car ($300K+).",
    engines: ["S65B40 4.0L V8 (420hp US, 414hp EU)"],
    transmissions: ["6MT (SMG delete preferred)", "SMG III robotized manual"],
    drivetrain: "RWD",
    hp_stock: 414, torque_stock: 295, curb_weight_lbs: 3638, zero_to_60: 4.5,
    production_count: 19000,
    known_failures: ["Rod bearing failure (most critical — $2,500–$5,000 replace preventively)", "VANOS solenoid wear", "throttle actuator failure", "SMG pump failure (SMG cars)", "rear subframe cracking (E92 high-mileage)", "differential mount wear"],
    essential_maintenance: ["Rod bearing replacement at 60–80K miles ($2,500–$4,500 — non-negotiable)", "VANOS cleaning + solenoid check ~$500", "differential fluid every 30K", "cooling system overhaul at 100K"],
    mod_ecosystem_strength: 10, community_heat: 10, parts_availability: 9, daily_ability: 7,
    motorsport_creds: ["DTM-era V8 homologation connection", "ALMS class wins", "basis for factory GTS and CRT programs"],
    homologation: false,
    notable_options: ["Competition Package (DCT)", "M Drive Pro", "GTS (collector tier)", "CRT (carbon roof, 65 units)"],
    spec_source: "BMW M GmbH; Hagerty; BaT aggregate 2025–2026",
    spec_confidence: "HIGH",
  },
  {
    modelCode: "BMW-E36-M3",
    make: "BMW", model: "M3", generation: "E36", yearRange: "1994–1999",
    officialValue: { weighted_official: 24800, trend_signal: "RISING", trend_12mo_pct: 12.0, data_confidence: "HIGH", as_of: "2026-04-02",
      bat_recent_median: 24000, classic_com_avg: 23000, hagerty_avg: 25000,
      sources: [{ source: "BaT", note: "2025-2026: clean US-spec ~$22–28K", url: "https://bringatrailer.com/bmw/e36-m3/" }, { source: "Hagerty", url: "https://www.hagerty.com/apps/valuationtools/1999-BMW-M3" }] },
    price_bands: { excellent: { low: 30000, median: 40000, high: 55000 }, good: { low: 18000, median: 25000, high: 32000 }, fair: { low: 9000, median: 14000, high: 20000 }, project: { low: 4000, median: 7000, high: 12000 } },
    price_range: { low: 5000, high: 60000 },
    notes: "US-spec M3 had detuned S50B30US engine vs Euro S50B32. Euro-spec (S50B32, S52) significantly more desirable. Lightweight, analog character. Strong appreciation underway. Lightweight sedan (M3/4/5 homologation) is rarest US variant.",
    engines: ["S50B30US 3.0L I6 (USA, 240hp)", "S50B32 3.2L I6 (Euro, 321hp)", "S52B32 3.2L I6 (USA 1997–1999, 240hp)"],
    transmissions: ["5MT (Getrag 420G)", "4AT (rare)"],
    drivetrain: "RWD",
    hp_stock: 240, torque_stock: 236, curb_weight_lbs: 3175, zero_to_60: 5.5,
    production_count: 71242,
    known_failures: ["Rear subframe cracking (critical — inspect and reinforce)", "VANOS unit wear (S52 prone)", "cooling system failure (plastic components age poorly)", "diff mount failure", "sunroof drain clogs → water damage"],
    essential_maintenance: ["Rear subframe inspection + reinforcement ($500–$1,500)", "VANOS rebuild $500–$1,200", "full cooling system refresh $600–$1,200", "diff and trans fluid flush every 30K"],
    mod_ecosystem_strength: 9, community_heat: 9, parts_availability: 9, daily_ability: 8,
    motorsport_creds: ["IMSA class victories", "SCCA club racing dominant", "Euro DTM class competitor"],
    homologation: false,
    notable_options: ["Lightweight (M3/4/5 homologation package, USA)", "Euro S50B32 engine", "Dakar Yellow (rare/premium)"],
    spec_source: "BMW M GmbH; BaT aggregate 2025–2026; E36 M3 forums",
    spec_confidence: "HIGH",
  },
  {
    modelCode: "BMW-E46-M3",
    make: "BMW", model: "M3", generation: "E46", yearRange: "2001–2006",
    officialValue: { weighted_official: 36500, trend_signal: "RISING", trend_12mo_pct: 5.0, data_confidence: "HIGH", as_of: "2026-04-02",
      bat_recent_median: 36000, classic_com_avg: 34000, hagerty_avg: 35000,
      sources: [{ source: "BaT", note: "2025–2026: clean coupe ~$32–40K", url: "https://bringatrailer.com/bmw/e46-m3/" }] },
    price_bands: { excellent: { low: 42000, median: 55000, high: 75000 }, good: { low: 28000, median: 38000, high: 48000 }, fair: { low: 15000, median: 22000, high: 30000 }, project: { low: 7000, median: 11000, high: 18000 } },
    price_range: { low: 9000, high: 80000 },
    notes: "S54 6-cylinder, widely considered finest analog M car ever built. Extremely high community following. SMG cars depreciated; 6MT highly preferred. CSL variant ($65–90K) commands strong premium. Values still ascending.",
    engines: ["S54B32 3.2L I6 (333hp)", "S54B32HP (CSL, 360hp)"],
    transmissions: ["6MT (ZF 310)", "SMG II (robotic)"],
    drivetrain: "RWD",
    hp_stock: 333, torque_stock: 262, curb_weight_lbs: 3415, zero_to_60: 4.8,
    production_count: 45000,
    known_failures: ["Subframe cracking (coupe especially — inspect, reinforce)", "SMG pump failure (SMG cars)", "VANOS rattle on cold start", "throttle actuator ($350–$600)", "rod bearing (less critical than E90 but inspect)"],
    essential_maintenance: ["Subframe inspection + reinforcement $600–$2,000", "VANOS rebuild $800–$1,500", "throttle actuator replacement if rough idle", "cooling system refresh every 80K"],
    mod_ecosystem_strength: 10, community_heat: 10, parts_availability: 8, daily_ability: 7,
    motorsport_creds: ["Production car racing dominant 2001–2006", "ALMS GT class", "basis for CSL homologation program"],
    homologation: false,
    notable_options: ["CSL (1,385 US-spec, carbon fiber, titanium exhaust)", "Imola Red (premium color)", "Competition Package"],
    spec_source: "BMW M GmbH; BaT aggregate 2025–2026",
    spec_confidence: "HIGH",
  },
  {
    modelCode: "POR-996",
    make: "Porsche", model: "911", generation: "996", yearRange: "1999–2004",
    officialValue: { weighted_official: 26200, trend_signal: "RISING", trend_12mo_pct: 12.0, data_confidence: "HIGH", as_of: "2026-04-02",
      bat_recent_median: 28000, classic_com_avg: 26000, hagerty_avg: 24000,
      sources: [{ source: "BaT", note: "Clean Carrera 2S ~$28–35K Feb 2026", url: "https://bringatrailer.com/porsche/911-996/" }, { source: "Classic.com", url: "https://www.classic.com/m/porsche/911/996/" }] },
    price_bands: { excellent: { low: 38000, median: 50000, high: 70000 }, good: { low: 24000, median: 32000, high: 44000 }, fair: { low: 12000, median: 18000, high: 26000 }, project: { low: 5000, median: 9000, high: 15000 } },
    price_range: { low: 8000, high: 80000 },
    notes: "IMS bearing stigma suppressed prices for years, creating entry opportunity as IMS solutions mature. First water-cooled 911. GT3 996 is blue-chip collector ($80–150K+). Standard Carrera now in active appreciation. Best value entry to air-cooled-era DNA.",
    engines: ["M96/01 3.4L flat-6 (300hp)", "M96/03 3.6L flat-6 (320hp)", "M96/70 GT3 3.6L (381hp)", "M96/70S Turbo 3.6L twin-turbo (420hp)"],
    transmissions: ["G96/00 6MT", "Tiptronic S 5AT"],
    drivetrain: "RWD (C2), AWD (C4)",
    hp_stock: 296, torque_stock: 258, curb_weight_lbs: 2910, zero_to_60: 5.2,
    production_count: 175262,
    known_failures: ["IMS bearing failure (critical — replace with aftermarket LN/IMS Solution)", "RMS (rear main seal) leak", "coolant pipe failure (plastic T-pipe behind engine)", "bore scoring (Carrera 2S with M96/03)", "AOS failure → oil consumption"],
    essential_maintenance: ["IMS bearing upgrade $800–$2,000 (do at clutch time)", "RMS replacement $400–$800", "coolant pipe inspection/replacement $200–$500", "AOS replacement if oil in intake"],
    mod_ecosystem_strength: 8, community_heat: 9, parts_availability: 8, daily_ability: 8,
    motorsport_creds: ["996 GT3 Cup dominant in Carrera Cup global series", "Le Mans GT class — 911 GT3 RS heritage", "IMSA GT class competitor"],
    homologation: false,
    notable_options: ["GT3 (collector, $80K+)", "GT3 RS (limited, $100K+)", "Turbo (X50 package)", "Aerokit"],
    spec_source: "Porsche AG; BaT aggregate 2025–2026; Pelican Parts technical library",
    spec_confidence: "HIGH",
  },
  {
    modelCode: "BMW-Z3-COUPE",
    make: "BMW", model: "Z3 M Coupe", generation: "Z3 M Coupe", yearRange: "1998–2002",
    officialValue: { weighted_official: 42000, trend_signal: "RISING", trend_12mo_pct: 10.0, data_confidence: "HIGH", as_of: "2026-04-02",
      bat_recent_median: 42000, classic_com_avg: 40000, hagerty_avg: 40000,
      sources: [{ source: "BaT", note: "2025–2026: clean M Coupe $38–48K", url: "https://bringatrailer.com/bmw/z3-m-coupe/" }] },
    price_bands: { excellent: { low: 50000, median: 65000, high: 85000 }, good: { low: 34000, median: 44000, high: 55000 }, fair: { low: 20000, median: 28000, high: 38000 }, project: { low: 12000, median: 18000, high: 26000 } },
    price_range: { low: 15000, high: 90000 },
    notes: "'Clown shoe' — polarizing but iconic. Extremely stiff body, fantastic chassis. S52 (1998–2000 US) or S54 (2001–2002 US) engines. S54-equipped cars command $15–20K premium. Production: ~2,970 in USA. Strong collector appreciation underway.",
    engines: ["S52B32 3.2L I6 (240hp, 1998–2000 US)", "S54B32 3.2L I6 (315hp, 2001–2002 US)"],
    transmissions: ["5MT (S52)", "6MT (S54)"],
    drivetrain: "RWD",
    hp_stock: 240, torque_stock: 240, curb_weight_lbs: 3045, zero_to_60: 5.2,
    production_count: 2970,
    known_failures: ["Rear subframe cracking (similar to E36/E46)", "VANOS wear (S52)", "S54: throttle actuator, VANOS rattle, rod bearings (moderate risk)", "rust in rockers/sills if unprotected"],
    essential_maintenance: ["Rear subframe inspection + reinforcement", "VANOS service every 60K", "S54 rod bearing preventive at 80K", "cooling system refresh"],
    mod_ecosystem_strength: 7, community_heat: 8, parts_availability: 7, daily_ability: 7,
    motorsport_creds: ["Factory Z3 M Coupe raced in privateers SCCA/IMSA", "Chris Bangle design — cultural icon"],
    homologation: false,
    notable_options: ["S54 engine (2001–2002 — premium)", "Velocity Yellow (rarest/most sought color)", "Individual colors"],
    spec_source: "BMW AG; BaT aggregate 2025–2026; Z3 M Coupe Registry",
    spec_confidence: "HIGH",
  },
  {
    modelCode: "BMW-E30-M3",
    make: "BMW", model: "M3", generation: "E30", yearRange: "1986–1991",
    officialValue: { weighted_official: 70600, trend_signal: "RISING", trend_12mo_pct: 6.5, data_confidence: "HIGH", as_of: "2026-04-02",
      bat_recent_median: 70000, classic_com_avg: 72000, hagerty_avg: 68000,
      sources: [{ source: "BaT", note: "Nov 2025 $69K, Feb 2026 $71.3K", url: "https://bringatrailer.com/bmw/e30-m3/" }, { source: "Classic.com", url: "https://www.classic.com/m/bmw/m3/e30/" }] },
    price_bands: { excellent: { low: 90000, median: 110000, high: 150000 }, good: { low: 55000, median: 70000, high: 90000 }, fair: { low: 30000, median: 42000, high: 55000 }, project: { low: 18000, median: 28000, high: 38000 } },
    price_range: { low: 28000, high: 150000 },
    notes: "BMW's first M3. Air-cooled-era DNA with S14 high-rev four-cylinder. Homologation special for Group A racing. Sport Evolution (Evo III) commands massive premium ($150–250K). Values climbing steadily.",
    engines: ["S14B23 2.3L I4 (197hp, 1987–1989)", "S14B25 2.5L I4 (238hp, Evolution 1990–1991)"],
    transmissions: ["5MT (Getrag dogleg 265/5)"],
    drivetrain: "RWD",
    hp_stock: 197, torque_stock: 170, curb_weight_lbs: 2590, zero_to_60: 6.5,
    production_count: 17970,
    known_failures: ["Valve stem seal leaks (S14 oil burning)", "oil leaks (cam cover, oil pan)", "dogleg gearbox synchro wear", "rust (sills, rear arches, floors)", "front suspension bushing wear"],
    essential_maintenance: ["Valve stem seals $1,500–$2,500", "oil pan gasket + cam cover $300–$600", "complete underbody rust inspection before purchase", "dogleg transmission rebuild if rough shifting $800–$1,500"],
    mod_ecosystem_strength: 8, community_heat: 10, parts_availability: 6, daily_ability: 5,
    motorsport_creds: ["DTM champion 1987–1989 (Ravaglia, van de Poele)", "European Touring Car Champion 1987", "Group A homologation special"],
    homologation: true,
    notable_options: ["Sport Evolution (Evo III) — extreme rarity, $150–250K", "Roberto Ravaglia Edition", "Johnny Cecotto Edition"],
    spec_source: "BMW M GmbH production records; Road & Track; E30 M3 Registry",
    spec_confidence: "HIGH",
  },
  {
    modelCode: "BMW-E46-330",
    make: "BMW", model: "330i/330Ci", generation: "E46", yearRange: "2001–2006",
    officialValue: { weighted_official: 14200, trend_signal: "RISING", trend_12mo_pct: 10.0, data_confidence: "MEDIUM", as_of: "2026-04-02",
      bat_recent_median: 14000, classic_com_avg: 13500, hagerty_avg: 13000,
      sources: [{ source: "BaT", note: "2025–2026: clean 330Ci $12–17K", url: "https://bringatrailer.com/bmw/330ci/" }] },
    price_bands: { excellent: { low: 18000, median: 24000, high: 32000 }, good: { low: 10000, median: 15000, high: 20000 }, fair: { low: 5000, median: 8000, high: 12000 }, project: { low: 2500, median: 4000, high: 7000 } },
    price_range: { low: 3000, high: 35000 },
    notes: "E46 330i/330Ci is the M3 without the M tax — M54B30 engine, excellent chassis, rapidly appreciating. Zhp performance package adds sport diff, close-ratio gearbox, aero kit — commands $5–8K premium. ZHP coupes now reaching $25–30K for pristine examples.",
    engines: ["M54B30 3.0L I6 (225hp)"],
    transmissions: ["5MT", "6MT (ZHP)", "5AT (steptronic)"],
    drivetrain: "RWD",
    hp_stock: 225, torque_stock: 214, curb_weight_lbs: 3230, zero_to_60: 5.9,
    production_count: 180000,
    known_failures: ["VANOS solenoid wear (rattle on cold start)", "cooling system failure (Achilles heel — replace plastic components)", "rear subframe cracking (less severe than M3 but monitor)", "window regulator failure", "DISA valve O-ring leak"],
    essential_maintenance: ["Full cooling system refresh $600–$1,200 (do proactively)", "VANOS solenoid cleaning/replacement $300–$600", "DISA valve inspection $100–$300", "rear subframe inspection"],
    mod_ecosystem_strength: 8, community_heat: 8, parts_availability: 9, daily_ability: 9,
    motorsport_creds: ["E46 330i production class racing (SCCA, club events)", "ZHP: factory sport tuning package"],
    homologation: false,
    notable_options: ["ZHP Performance Package (highly sought)", "Sport Package without ZHP", "Individual colors (rare)"],
    spec_source: "BMW AG; BaT aggregate 2025–2026",
    spec_confidence: "MEDIUM",
  },
  {
    modelCode: "BMW-1M-E82",
    make: "BMW", model: "1M Coupe", generation: "E82", yearRange: "2011",
    officialValue: { weighted_official: 58000, trend_signal: "RISING", trend_12mo_pct: 3.0, data_confidence: "HIGH", as_of: "2026-04-02",
      bat_recent_median: 58000, classic_com_avg: 56000, hagerty_avg: 55000,
      sources: [{ source: "BaT", note: "2025–2026: clean 1M $52–65K", url: "https://bringatrailer.com/bmw/1m/" }] },
    price_bands: { excellent: { low: 65000, median: 80000, high: 100000 }, good: { low: 48000, median: 60000, high: 72000 }, fair: { low: 35000, median: 44000, high: 55000 }, project: { low: 25000, median: 32000, high: 42000 } },
    price_range: { low: 28000, high: 105000 },
    notes: "One-year-only production (6,309 global). N54 twin-turbo — prodigious tuning potential. Wide-body, E92 M3 brakes/steering, mechanical LSd. Called 'last true M' by many. Values stable but firm — no distressed examples exist.",
    engines: ["N54B30 3.0L twin-turbo I6 (335hp)"],
    transmissions: ["6MT only"],
    drivetrain: "RWD",
    hp_stock: 335, torque_stock: 369, curb_weight_lbs: 3296, zero_to_60: 4.5,
    production_count: 6309,
    known_failures: ["N54 high-pressure fuel pump (HPFP) failure", "charge pipe blowoff under boost", "wastegate rattle", "injector wear at high mileage", "VANOS solenoids"],
    essential_maintenance: ["HPFP monitoring — replace if surge/hesitation", "charge pipe inspection/upgrade", "oil every 5K miles (not 15K BMW norm)", "wastegate rebuild if rattle persists"],
    mod_ecosystem_strength: 10, community_heat: 10, parts_availability: 8, daily_ability: 8,
    motorsport_creds: ["Basis for multiple privateer endurance programs", "one-make 1M cup series (Germany)", "Chris Harris 'Car of the Decade' — cultural weight"],
    homologation: false,
    notable_options: ["Valencia Orange (most collectible color)", "6-speed only — no other transmission"],
    spec_source: "BMW AG; BaT aggregate 2025–2026; Bimmerpost 1M registry",
    spec_confidence: "HIGH",
  },
  {
    modelCode: "BMW-135IS-E82",
    make: "BMW", model: "135is", generation: "E82", yearRange: "2012–2013",
    officialValue: { weighted_official: 22000, trend_signal: "RISING", trend_12mo_pct: 8.0, data_confidence: "MEDIUM", as_of: "2026-04-02",
      bat_recent_median: 22000, classic_com_avg: 21000, hagerty_avg: 20000,
      sources: [{ source: "BaT", note: "2025: clean 135is $18–26K", url: "https://bringatrailer.com/bmw/135is/" }] },
    price_bands: { excellent: { low: 28000, median: 36000, high: 45000 }, good: { low: 18000, median: 24000, high: 30000 }, fair: { low: 10000, median: 15000, high: 20000 }, project: { low: 6000, median: 9000, high: 13000 } },
    price_range: { low: 7000, high: 48000 },
    notes: "Two-year US production only (2012–2013). N54 engine, close-ratio 6MT, active M differential (rare on non-M). Limited production similar to 1M but much less known. Rapid appreciation as collectors discover it.",
    engines: ["N54B30TO 3.0L twin-turbo I6 (320hp)"],
    transmissions: ["6MT (close-ratio)", "DCT"],
    drivetrain: "RWD",
    hp_stock: 320, torque_stock: 332, curb_weight_lbs: 3296, zero_to_60: 4.7,
    production_count: 4500,
    known_failures: ["N54 HPFP (same as 1M)", "charge pipe blowoff", "wastegate rattle", "DSC module coding issues on modified cars"],
    essential_maintenance: ["Same N54 protocol as 1M — HPFP monitoring, charge pipe, oil changes at 5K"],
    mod_ecosystem_strength: 9, community_heat: 8, parts_availability: 8, daily_ability: 8,
    motorsport_creds: ["Active M differential — factory track hardware without M badge", "Basis for multiple track build programs"],
    homologation: false,
    notable_options: ["Active M Differential (standard)", "Sport Line exterior", "Comfort Access"],
    spec_source: "BMW AG; BaT aggregate 2025–2026",
    spec_confidence: "MEDIUM",
  },
  {
    modelCode: "BMW-E90-335",
    make: "BMW", model: "335i", generation: "E90/E92/E93", yearRange: "2007–2013",
    officialValue: { weighted_official: 16500, trend_signal: "RISING", trend_12mo_pct: 4.0, data_confidence: "MEDIUM", as_of: "2026-04-02",
      bat_recent_median: 16500, classic_com_avg: 16000, hagerty_avg: 15000,
      sources: [{ source: "BaT", note: "2025–2026: clean E92 335i $14–20K", url: "https://bringatrailer.com/bmw/335i/" }] },
    price_bands: { excellent: { low: 22000, median: 28000, high: 36000 }, good: { low: 13000, median: 18000, high: 24000 }, fair: { low: 6000, median: 10000, high: 14000 }, project: { low: 3000, median: 5000, high: 8000 } },
    price_range: { low: 4000, high: 38000 },
    notes: "N54/N55 twin-turbo — 400+hp on a tune, daily driver, luxury levels. E92 coupe the sweet spot. BimmerWorld + turner motorsport ecosystem massive. Entry-point into enthusiast collecting.",
    engines: ["N54B30 3.0L twin-turbo I6 (300hp, 2007–2010)", "N55B30 3.0L single-turbo I6 (300hp, 2011–2013)"],
    transmissions: ["6MT", "DCT (N55)", "6AT (ZF)"],
    drivetrain: "RWD (335i), AWD (335xi)",
    hp_stock: 300, torque_stock: 300, curb_weight_lbs: 3571, zero_to_60: 5.0,
    production_count: 120000,
    known_failures: ["N54: HPFP, injectors, charge pipe, wastegate rattle", "N55: oil filter housing leak, valve cover gasket", "power steering pump (E90 sedan)", "rear subframe mount wear"],
    essential_maintenance: ["N54: HPFP monitoring, charge pipe upgrade, injector inspection at 80K", "N55: valve cover gasket at 80K, oil filter housing gasket", "oil every 5K miles"],
    mod_ecosystem_strength: 10, community_heat: 8, parts_availability: 10, daily_ability: 9,
    motorsport_creds: ["Dominant SCCA club production class", "Turner Motorsport ALMS campaigns"],
    homologation: false,
    notable_options: ["Sport Package", "Performance Exhaust", "Cold Weather Package", "iDrive with navigation"],
    spec_source: "BMW AG; BaT aggregate 2025–2026",
    spec_confidence: "MEDIUM",
  },
  {
    modelCode: "POR-997",
    make: "Porsche", model: "911", generation: "997", yearRange: "2005–2012",
    officialValue: { weighted_official: 60000, trend_signal: "RISING", trend_12mo_pct: 3.0, data_confidence: "HIGH", as_of: "2026-04-02",
      bat_recent_median: 58000, classic_com_avg: 60000, hagerty_avg: 58000,
      sources: [{ source: "BaT", note: "2025–2026: clean 997.1 C2S MT ~$55–68K", url: "https://bringatrailer.com/porsche/911-997/" }] },
    price_bands: { excellent: { low: 75000, median: 95000, high: 130000 }, good: { low: 52000, median: 68000, high: 82000 }, fair: { low: 32000, median: 44000, high: 56000 }, project: { low: 18000, median: 26000, high: 36000 } },
    price_range: { low: 20000, high: 140000 },
    notes: "IMS issue resolved in 997.2 (2009+). 997.1 (2005–2008) more affordable entry, still carries IMS. GT3 997 ($125–175K) and GT3 RS are serious collectors' cars. Sport Classic and Speedster extremely rare/valuable.",
    engines: ["MA1.02 3.6L flat-6 997.1 (325hp)", "MA1.22 3.8L flat-6 997.1 S (355hp)", "MA1.21 3.6L DFI 997.2 (345hp)", "MA1.23 3.8L DFI 997.2 S (385hp)"],
    transmissions: ["G97/00 6MT", "PDK 7DCT (997.2)"],
    drivetrain: "RWD (C2), AWD (C4)",
    hp_stock: 325, torque_stock: 273, curb_weight_lbs: 3020, zero_to_60: 4.8,
    production_count: 213000,
    known_failures: ["IMS bearing (997.1 — replace, LN Engineering solution)", "RMS seal", "bore scoring (997.2 DFI engines at high mileage)", "coolant pipe failure (same as 996)", "AOS"],
    essential_maintenance: ["IMS upgrade at clutch service (997.1)", "RMS replacement", "PDK service every 40K (997.2)", "bore scoring inspection at pre-purchase"],
    mod_ecosystem_strength: 9, community_heat: 9, parts_availability: 9, daily_ability: 8,
    motorsport_creds: ["997 GT3 Cup global one-make series", "Porsche Supercup", "Le Mans GT2/GTE class wins", "GT3 RS LMGT2 factory effort"],
    homologation: false,
    notable_options: ["GT3 (base collector)", "GT3 RS", "Sport Classic (249 USA — $200K+)", "Speedster (356 USA)"],
    spec_source: "Porsche AG; BaT aggregate 2025–2026; Pelican Parts; Porsche Club America",
    spec_confidence: "HIGH",
  },
  {
    modelCode: "MB-CLK55-W209",
    make: "Mercedes-Benz", model: "CLK55 AMG", generation: "W209", yearRange: "2003–2006",
    officialValue: { weighted_official: 18500, trend_signal: "RISING", trend_12mo_pct: 5.0, data_confidence: "MEDIUM", as_of: "2026-04-02",
      bat_recent_median: 18000, classic_com_avg: 17000, hagerty_avg: 18000,
      sources: [{ source: "BaT", note: "2025: clean CLK55 $15–22K", url: "https://bringatrailer.com/mercedes-benz/clk55-amg/" }] },
    price_bands: { excellent: { low: 24000, median: 30000, high: 40000 }, good: { low: 14000, median: 20000, high: 26000 }, fair: { low: 7000, median: 11000, high: 16000 }, project: { low: 3000, median: 6000, high: 10000 } },
    price_range: { low: 5000, high: 42000 },
    notes: "M113K 5.5L V8 — naturally aspirated AMG at its purist. 362hp, exhaust note legendary. CLK-class body (W209) with AMG widebody. Undervalued vs E46 M3 peers. Elegant yet brutal.",
    engines: ["M113K 5.5L V8 (362hp)"],
    transmissions: ["5G-Tronic 5AT"],
    drivetrain: "RWD",
    hp_stock: 362, torque_stock: 376, curb_weight_lbs: 3880, zero_to_60: 4.9,
    production_count: 12000,
    known_failures: ["Balance shaft gear wear (critical — replace at 100K with aftermarket)", "motor mount failure", "SBC brake system (Sensotronic — specialized service required)", "valve stem seal wear at high mileage"],
    essential_maintenance: ["Balance shaft gear inspection + replacement $1,500–$3,000", "motor mounts $400–$800", "SBC brake service (specialist only)", "transmission service every 40K"],
    mod_ecosystem_strength: 6, community_heat: 7, parts_availability: 7, daily_ability: 7,
    motorsport_creds: ["CLK DTM AMG (separate W209-derived racing program)", "M113K engine used in SL55, SLK55, CLS55, E55"],
    homologation: false,
    notable_options: ["Designo interior packages", "AMG Performance Package (limited)"],
    spec_source: "Mercedes-Benz AG; BaT aggregate 2025–2026; MBWorld forums",
    spec_confidence: "MEDIUM",
  },
  {
    modelCode: "MB-R107",
    make: "Mercedes-Benz", model: "SL-Class", generation: "R107", yearRange: "1972–1989",
    officialValue: { weighted_official: 38000, trend_signal: "RISING", trend_12mo_pct: 4.0, data_confidence: "MEDIUM", as_of: "2026-04-02",
      bat_recent_median: 38000, classic_com_avg: 36000, hagerty_avg: 36000,
      sources: [{ source: "BaT", note: "2025–2026: clean 450SL/560SL $32–45K", url: "https://bringatrailer.com/mercedes-benz/sl-r107/" }] },
    price_bands: { excellent: { low: 50000, median: 65000, high: 85000 }, good: { low: 30000, median: 42000, high: 55000 }, fair: { low: 16000, median: 24000, high: 34000 }, project: { low: 8000, median: 14000, high: 22000 } },
    price_range: { low: 10000, high: 90000 },
    notes: "Longest-produced MB model (18 years). 450SL (V8) most common US import. 560SL (1986–1989) most valuable. Built to last forever. Steady, unspectacular appreciation. Stable collector base.",
    engines: ["M117 4.5L V8 (450SL)", "M117 3.8L I6 (380SL)", "M117 5.6L V8 (560SL)"],
    transmissions: ["3-speed automatic", "4-speed automatic"],
    drivetrain: "RWD",
    hp_stock: 190, torque_stock: 232, curb_weight_lbs: 3770, zero_to_60: 9.0,
    production_count: 237287,
    known_failures: ["Fuel injection system aging (CIS Bosch — specialist knowledge required)", "rust in rocker panels, floor pans", "hard top lift mechanism failure", "timing chain guide wear (V8)", "door pillar corrosion"],
    essential_maintenance: ["Full CIS injection service $800–$1,500", "timing chain tensioner/guide inspection", "complete underbody rust survey", "hard top mechanism lubrication/rebuild"],
    mod_ecosystem_strength: 5, community_heat: 6, parts_availability: 7, daily_ability: 5,
    motorsport_creds: ["Factory AMG 450SLC rally car (1977 Rallye du Bandama win)", "cultural icon — Hollywood, Riviera"],
    homologation: false,
    notable_options: ["560SL (1986–1989, highest value)", "hardtop + softtop combo", "Euro-spec 6.0L AMG conversion (rare)"],
    spec_source: "Mercedes-Benz AG records; Hagerty Valuation Guide; R107 SL Technical Companion",
    spec_confidence: "MEDIUM",
  },
  {
    modelCode: "MB-W124",
    make: "Mercedes-Benz", model: "E-Class", generation: "W124", yearRange: "1984–1997",
    officialValue: { weighted_official: 16500, trend_signal: "RISING", trend_12mo_pct: 8.0, data_confidence: "MEDIUM", as_of: "2026-04-02",
      bat_recent_median: 16500, classic_com_avg: 15000, hagerty_avg: 15500,
      sources: [{ source: "BaT", note: "2025–2026: clean 300E/E320 $14–20K; 500E $35–55K", url: "https://bringatrailer.com/mercedes-benz/e-class-w124/" }] },
    price_bands: { excellent: { low: 22000, median: 28000, high: 40000 }, good: { low: 12000, median: 18000, high: 25000 }, fair: { low: 5000, median: 9000, high: 14000 }, project: { low: 2000, median: 4000, high: 8000 } },
    price_range: { low: 3000, high: 55000 },
    notes: "Overengineered at its finest. Considered peak MB build quality. 500E (hand-assembled at Porsche, 10,479 units) is standout collector variant ($35–55K). 300E/CE/TE all appreciating. Wagon (S124) commands premium.",
    engines: ["M102 2.3L I4 (230E)", "M103 2.6L I6 (260E)", "M103 3.0L I6 (300E)", "M119 5.0L V8 (500E/E500)"],
    transmissions: ["4G-Tronic 4AT", "5-speed manual (rare Euro)"],
    drivetrain: "RWD",
    hp_stock: 177, torque_stock: 188, curb_weight_lbs: 3300, zero_to_60: 8.5,
    production_count: 2700000,
    known_failures: ["Fuel system aging (rubber hoses, CIS injection)", "rust in rear quarters, floor pans, trunk", "wiring harness insulation cracking (fire risk — inspect)", "climate control vacuum system failure", "head gasket (4-cylinder variants)"],
    essential_maintenance: ["Wiring harness inspection (fire risk — critical on 20+ year cars)", "fuel system rubber hose replacement", "climate control vacuum test", "full underbody rust survey"],
    mod_ecosystem_strength: 5, community_heat: 7, parts_availability: 7, daily_ability: 6,
    motorsport_creds: ["500E: hand-assembled Porsche collaboration — production crossover history", "W124 Coupe CE: styling benchmark era"],
    homologation: false,
    notable_options: ["500E/E500 (Porsche-assembled, collector)", "Estate/Wagon (S124, premium)", "Coupe CE"],
    spec_source: "Mercedes-Benz AG; Hagerty; BaT aggregate 2025–2026; W124 World forums",
    spec_confidence: "MEDIUM",
  },
  {
    modelCode: "MB-W140",
    make: "Mercedes-Benz", model: "S-Class", generation: "W140", yearRange: "1991–1998",
    officialValue: { weighted_official: 22000, trend_signal: "RISING", trend_12mo_pct: 10.0, data_confidence: "MEDIUM", as_of: "2026-04-02",
      bat_recent_median: 22000, classic_com_avg: 20000, hagerty_avg: 20000,
      sources: [{ source: "BaT", note: "2025–2026: clean S600 / S500 $18–28K", url: "https://bringatrailer.com/mercedes-benz/s-class-w140/" }] },
    price_bands: { excellent: { low: 30000, median: 40000, high: 55000 }, good: { low: 16000, median: 24000, high: 34000 }, fair: { low: 7000, median: 12000, high: 18000 }, project: { low: 3000, median: 6000, high: 10000 } },
    price_range: { low: 5000, high: 60000 },
    notes: "Overengineered 'Big Body' Mercedes — tank built to last. 600 SEC/SL V12 commands collector premium. S600 (M120 6.0L V12) approaching blue-chip status for perfect examples. Boomerang appreciation after 2000s depreciation cliff.",
    engines: ["M119 4.2L V8 (S420)", "M119 5.0L V8 (S500)", "M120 6.0L V12 (S600/600SE)"],
    transmissions: ["4G-Tronic 4AT (V8)", "5G-Tronic 5AT (V12)"],
    drivetrain: "RWD",
    hp_stock: 322, torque_stock: 354, curb_weight_lbs: 4740, zero_to_60: 6.1,
    production_count: 406400,
    known_failures: ["M120 V12: timing chain tensioner failure (catastrophic if not serviced)", "air suspension failure (ABC system)", "wiring harness brittleness", "power steering hose leaks", "fuel accumulator aging"],
    essential_maintenance: ["V12: timing chain tensioner service $1,000–$2,500", "ABC suspension service $500–$1,500", "wiring harness inspection", "full preventive fluid flush"],
    mod_ecosystem_strength: 4, community_heat: 7, parts_availability: 6, daily_ability: 5,
    motorsport_creds: ["Cultural: W140 appears in Ace Ventura, multiple 90s films", "S600 Coupe — Wolfgang Porsche personal car era"],
    homologation: false,
    notable_options: ["S600 (V12 — collector)", "600 SEL long wheelbase (head of state spec)", "AMG 6.9 conversions (aftermarket)"],
    spec_source: "Mercedes-Benz AG; Hagerty; BaT 2025–2026; W140 World forums",
    spec_confidence: "MEDIUM",
  },
  {
    modelCode: "MB-W126",
    make: "Mercedes-Benz", model: "S-Class", generation: "W126", yearRange: "1979–1991",
    officialValue: { weighted_official: 18000, trend_signal: "RISING", trend_12mo_pct: 7.0, data_confidence: "MEDIUM", as_of: "2026-04-02",
      bat_recent_median: 18000, classic_com_avg: 17000, hagerty_avg: 17000,
      sources: [{ source: "BaT", note: "2025–2026: clean 560SEL/500SEC $15–22K", url: "https://bringatrailer.com/mercedes-benz/s-class-w126/" }] },
    price_bands: { excellent: { low: 24000, median: 32000, high: 45000 }, good: { low: 13000, median: 19000, high: 27000 }, fair: { low: 6000, median: 10000, high: 16000 }, project: { low: 2500, median: 5000, high: 9000 } },
    price_range: { low: 4000, high: 50000 },
    notes: "Considered finest MB ever built — peak quality before cost cutting. 560SEC Coupe and 560SEL long wheelbase most desirable. 500SEC AMG conversions rare and valuable. Strong, steady appreciation.",
    engines: ["M116 3.8L V8 (380SE)", "M116 4.2L V8 (420SEL)", "M117 5.0L V8 (500SE/SEC)", "M117 5.6L V8 (560SEL/SEC)"],
    transmissions: ["4G-Tronic 4AT"],
    drivetrain: "RWD",
    hp_stock: 238, torque_stock: 287, curb_weight_lbs: 4180, zero_to_60: 7.5,
    production_count: 818036,
    known_failures: ["Rust (rear quarters, wheel arches, rocker panels)", "fuel injection CIS aging", "automatic transmission band wear", "A/C system aging (R12 refrigerant era)", "hard brake lines corrosion"],
    essential_maintenance: ["Full rust survey before purchase", "CIS injection service $600–$1,200", "transmission service every 30K", "R12 → R134a A/C conversion if needed"],
    mod_ecosystem_strength: 4, community_heat: 6, parts_availability: 7, daily_ability: 6,
    motorsport_creds: ["AMG 5.6L rally/touring programs (600SEL AMG)", "Icon of 1980s executive culture globally"],
    homologation: false,
    notable_options: ["560SEC Coupe (most desirable)", "560SEL long wheelbase", "AMG conversions (body kit + engine)"],
    spec_source: "Mercedes-Benz AG; Hagerty; BaT aggregate 2025–2026",
    spec_confidence: "MEDIUM",
  },
  {
    modelCode: "BMW-M635CSI-E24",
    make: "BMW", model: "M635CSi", generation: "E24", yearRange: "1984–1989",
    officialValue: { weighted_official: 42000, trend_signal: "RISING", trend_12mo_pct: 5.0, data_confidence: "MEDIUM", as_of: "2026-04-02",
      bat_recent_median: 42000, classic_com_avg: 40000, hagerty_avg: 40000,
      sources: [{ source: "BaT", note: "2025: clean M635CSi $38–48K", url: "https://bringatrailer.com/bmw/6-series-e24/" }] },
    price_bands: { excellent: { low: 55000, median: 70000, high: 90000 }, good: { low: 34000, median: 46000, high: 58000 }, fair: { low: 18000, median: 28000, high: 38000 }, project: { low: 10000, median: 16000, high: 24000 } },
    price_range: { low: 12000, high: 95000 },
    notes: "S38B35 6-cylinder (the M1 engine) in grand tourer body. Considered alongside E28 M5 as finest pre-E30 M product. Low production, complex maintenance. Values firm and climbing for clean examples.",
    engines: ["S38B35 3.5L I6 (260hp Euro / 256hp US)"],
    transmissions: ["Getrag 265/5 5MT", "ZF 4AT (M635 auto)"],
    drivetrain: "RWD",
    hp_stock: 256, torque_stock: 243, curb_weight_lbs: 3350, zero_to_60: 6.4,
    production_count: 5855,
    known_failures: ["S38 oil pan gasket + cam cover (significant leak potential)", "S38 vanos unit (pre-vanos, but mechanical timing wear)", "E24 rust (rear quarters, trunk floor, door bottoms)", "fuel injection CIS aging", "electrical gremlins"],
    essential_maintenance: ["Full S38 valve adjustment every 15K", "cam timing check", "complete rust survey before purchase", "CIS injection service"],
    mod_ecosystem_strength: 6, community_heat: 7, parts_availability: 5, daily_ability: 5,
    motorsport_creds: ["S38 engine in M1 (1978 Procar championship)", "E24 M635CSi class wins in touring car racing"],
    homologation: false,
    notable_options: ["Individual colors (rare factory)", "sunroof delete", "Euro-spec 260hp vs US 256hp"],
    spec_source: "BMW M GmbH; Hagerty; BaT aggregate 2025–2026; E24 forums",
    spec_confidence: "MEDIUM",
  },
  {
    modelCode: "BMW-2002",
    make: "BMW", model: "2002", generation: "E10", yearRange: "1968–1976",
    officialValue: { weighted_official: 28000, trend_signal: "RISING", trend_12mo_pct: 4.0, data_confidence: "MEDIUM", as_of: "2026-04-02",
      bat_recent_median: 28000, classic_com_avg: 26000, hagerty_avg: 26000,
      sources: [{ source: "BaT", note: "2025: clean 2002tii $24–34K; 2002 $18–26K", url: "https://bringatrailer.com/bmw/2002/" }] },
    price_bands: { excellent: { low: 38000, median: 50000, high: 70000 }, good: { low: 22000, median: 32000, high: 42000 }, fair: { low: 12000, median: 18000, high: 26000 }, project: { low: 6000, median: 10000, high: 16000 } },
    price_range: { low: 8000, high: 75000 },
    notes: "The car that built BMW in America. Turbo (1973–1974) is rare collector gem ($50–80K). Tii (fuel injection) commands premium over carb versions. Extremely popular mod/resto community.",
    engines: ["M10 1.6L I4 (2002)", "M10 2.0L I4 (2002ti/tii)", "M10 2.0L turbo (2002 Turbo, 1973–1974)"],
    transmissions: ["4MT", "5MT (Getrag)", "3AT (ZF)"],
    drivetrain: "RWD",
    hp_stock: 100, torque_stock: 116, curb_weight_lbs: 2160, zero_to_60: 9.5,
    production_count: 337174,
    known_failures: ["Rust everywhere (sills, floor pans, rear wheel arches — inspect thoroughly)", "Solex carb issues (2002 base)", "Kugelfischer injection wear (tii)", "cooling system aging", "rear trailing arm mounts"],
    essential_maintenance: ["Complete rust inspection before purchase", "Kugelfischer pump rebuild (tii) $400–$800", "front strut refresh", "full cooling system flush"],
    mod_ecosystem_strength: 7, community_heat: 8, parts_availability: 7, daily_ability: 6,
    motorsport_creds: ["2002 Turbo: BMW's first turbocharged production car", "2002ti/tii: European Touring Car competition 1969–1973", "Foundation of BMW Motorsport legacy"],
    homologation: false,
    notable_options: ["2002 Turbo (collector — $50–80K)", "2002tii (fuel injection — premium)", "Baur Cabriolet", "Alpina B2 variants"],
    spec_source: "BMW AG; Hagerty Classic Car Values; BaT aggregate 2025–2026; 2002FAQ.com",
    spec_confidence: "MEDIUM",
  },
  {
    modelCode: "POR-993",
    make: "Porsche", model: "911", generation: "993", yearRange: "1994–1998",
    officialValue: { weighted_official: 115000, trend_signal: "STABLE", trend_12mo_pct: 1.0, data_confidence: "HIGH", as_of: "2026-04-02",
      bat_recent_median: 115000, classic_com_avg: 110000, hagerty_avg: 108000,
      sources: [{ source: "BaT", note: "2025–2026: clean 993 C2 $100–130K", url: "https://bringatrailer.com/porsche/911-993/" }, { source: "Hagerty", url: "https://www.hagerty.com/apps/valuationtools/1998-Porsche-911" }] },
    price_bands: { excellent: { low: 140000, median: 180000, high: 250000 }, good: { low: 90000, median: 120000, high: 150000 }, fair: { low: 55000, median: 75000, high: 95000 }, project: { low: 35000, median: 50000, high: 70000 } },
    price_range: { low: 40000, high: 280000 },
    notes: "Last air-cooled 911. Blue-chip status fully established. Turbo ($200–400K), GT2 ($500K–1M), RS ($300–600K) are serious investment grade. Carrera market stable/plateaued at high level. Ownership HALO of Porsche collector world.",
    engines: ["M64/05 3.6L flat-6 (272hp Carrera)", "M64/60 3.6L twin-turbo (408hp Turbo)"],
    transmissions: ["G50/21 6MT", "Tiptronic S 4AT"],
    drivetrain: "RWD (C2), AWD (C4, Turbo)",
    hp_stock: 272, torque_stock: 243, curb_weight_lbs: 2910, zero_to_60: 5.1,
    production_count: 68000,
    known_failures: ["Chain tensioner failure (older oil — preventive service critical)", "IMS not applicable (air-cooled)", "rust in floor pans (Northern cars)", "oil cooler lines", "throttle body wear"],
    essential_maintenance: ["Timing chain tensioner service $1,000–$2,000", "oil cooler line inspection", "complete pre-purchase inspection by 993 specialist"],
    mod_ecosystem_strength: 7, community_heat: 10, parts_availability: 7, daily_ability: 6,
    motorsport_creds: ["993 RSR Le Mans GT2 class", "993 Cup one-make series", "993 GT2 Evo factory race car — last air-cooled racer"],
    homologation: false,
    notable_options: ["Turbo ($200K+)", "GT2 (investment grade)", "RS ($300K+)", "Speedster (rare)"],
    spec_source: "Porsche AG; Hagerty; BaT aggregate 2025–2026; Porsche Club America",
    spec_confidence: "HIGH",
  },
  {
    modelCode: "POR-964",
    make: "Porsche", model: "911", generation: "964", yearRange: "1989–1994",
    officialValue: { weighted_official: 72000, trend_signal: "RISING", trend_12mo_pct: 2.0, data_confidence: "HIGH", as_of: "2026-04-02",
      bat_recent_median: 72000, classic_com_avg: 70000, hagerty_avg: 68000,
      sources: [{ source: "BaT", note: "2025–2026: clean 964 Carrera 2 MT $65–80K", url: "https://bringatrailer.com/porsche/911-964/" }] },
    price_bands: { excellent: { low: 95000, median: 120000, high: 155000 }, good: { low: 58000, median: 78000, high: 95000 }, fair: { low: 38000, median: 52000, high: 68000 }, project: { low: 22000, median: 32000, high: 46000 } },
    price_range: { low: 25000, high: 160000 },
    notes: "Bridge between 3.2 and 993. 85% new parts vs 3.2. RS America and Speedster are significant collector cars. Turbo 3.6 ($120–180K) highly desired. Appreciation solid, slower than 993.",
    engines: ["M64/01 3.6L flat-6 (247hp Carrera 2/4)", "M64/50 3.3L turbo (320hp)", "M64/51 3.6L turbo (360hp Turbo 3.6)"],
    transmissions: ["G64/00 5MT", "Tiptronic 4AT"],
    drivetrain: "RWD (C2), AWD (C4)",
    hp_stock: 247, torque_stock: 228, curb_weight_lbs: 2954, zero_to_60: 5.5,
    production_count: 62172,
    known_failures: ["Chain tensioner (same generation issue)", "oil cooler leaks", "power steering rack leaks (C4)", "rust in floor pans (pre-galvanized body)", "clutch wear (steep engagement)"],
    essential_maintenance: ["Timing chain tensioner preventive service", "oil cooler hose replacement", "complete rust inspection (pre-1990 cars pre-galvanize)", "specialist pre-purchase inspection"],
    mod_ecosystem_strength: 7, community_heat: 8, parts_availability: 7, daily_ability: 6,
    motorsport_creds: ["964 RSR Le Mans GT class", "964 Cup race car", "Carrera Cup origins"],
    homologation: false,
    notable_options: ["RS America (2,000 USA, lightweight)", "Speedster ($100K+)", "Turbo 3.6 ($120–180K)", "Carrera 4 (first AWD 911 production)"],
    spec_source: "Porsche AG; Hagerty; BaT aggregate 2025–2026",
    spec_confidence: "HIGH",
  },
  {
    modelCode: "BMW-850I-E31",
    make: "BMW", model: "850i/850Ci/M8", generation: "E31", yearRange: "1990–1999",
    officialValue: { weighted_official: 32000, trend_signal: "RISING", trend_12mo_pct: 2.0, data_confidence: "MEDIUM", as_of: "2026-04-02",
      bat_recent_median: 32000, classic_com_avg: 30000, hagerty_avg: 30000,
      sources: [{ source: "BaT", note: "2025–2026: clean 850Ci $28–38K; M8 prototype separate", url: "https://bringatrailer.com/bmw/850i/" }] },
    price_bands: { excellent: { low: 44000, median: 58000, high: 75000 }, good: { low: 25000, median: 35000, high: 46000 }, fair: { low: 12000, median: 20000, high: 28000 }, project: { low: 6000, median: 11000, high: 18000 } },
    price_range: { low: 8000, high: 80000 },
    notes: "V12 GT flagship — criminally undervalued. M70 V12 is engineering marvel. S70B56 M8 prototype (1 made) is museum piece. 850CSi (S70B32, 375hp) is the production collector's choice ($55–80K). Maintenance complex/expensive but values rising.",
    engines: ["M70B50 5.0L V12 (850i/850Ci, 296hp)", "M73B54 5.4L V12 (850Ci 1994+, 326hp)", "S70B32 5.6L V12 (850CSi, 375hp)"],
    transmissions: ["6MT (850CSi)", "4AT ZF (850i)", "5AT (850Ci)"],
    drivetrain: "RWD",
    hp_stock: 296, torque_stock: 332, curb_weight_lbs: 4299, zero_to_60: 6.0,
    production_count: 31062,
    known_failures: ["V12 throttle actuator (dual unit failure — $800–$2,000)", "V12 cooling system complexity", "E-gas throttle cable wear", "suspension bushings (complex geometry)", "electronics gremlins (complex for era)"],
    essential_maintenance: ["V12 cooling system overhaul every 80K", "throttle actuator inspection", "transmission service every 40K", "annual electrical system check"],
    mod_ecosystem_strength: 5, community_heat: 7, parts_availability: 5, daily_ability: 4,
    motorsport_creds: ["S70B56 M8 prototype — V12 race development mule", "850CSi: factory widebody/sport program"],
    homologation: false,
    notable_options: ["850CSi (S70B32 V12, widebody — collector)", "Individual colors", "6MT (CSi only)"],
    spec_source: "BMW AG; Hagerty; BaT aggregate 2025–2026; E31Source forums",
    spec_confidence: "MEDIUM",
  },
];

// Build a map for O(1) lookup
const MODEL_MAP = new Map<string, VehicleDetail>(
  MODEL_DATA.map((v) => [v.modelCode, v])
);

// Join ranking data at runtime
export function getVehicleDetail(modelCode: string): (VehicleDetail & { ranking: RankedModel }) | null {
  const vehicle = MODEL_MAP.get(modelCode);
  if (!vehicle) return null;
  const ranking = OVERALL_RANKING.find((r) => r.modelCode === modelCode);
  if (!ranking) return null;
  return { ...vehicle, ranking };
}

export function getAllVehicleDetails(): (VehicleDetail & { ranking: RankedModel })[] {
  return OVERALL_RANKING.map((r) => {
    const vehicle = MODEL_MAP.get(r.modelCode)!;
    return { ...vehicle, ranking: r };
  }).filter(Boolean);
}

export function getModelCodes(): string[] {
  return MODEL_DATA.map((v) => v.modelCode);
}

// Slug → modelCode mapping (URL-safe)
export function slugToModelCode(slug: string): string {
  return slug.toUpperCase().replace(/-/g, "-");
}

export function modelCodeToSlug(modelCode: string): string {
  return modelCode.toLowerCase();
}
