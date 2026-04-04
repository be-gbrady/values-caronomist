// Caronomist Values — Core Types
// Mirrors the PostgreSQL schema for type-safe data access

export interface Vehicle {
  id: string;
  model_code: string;
  year_start: number;
  year_end: number | null;
  make: string;
  model: string;
  generation: string | null;
  trim: string | null;
  body_style: string | null;
  country_of_origin: string | null;
  units_produced: number | null;
  search_slug: string;
  spi_tracked: boolean;
  featured: boolean;
  created_at: string;
  updated_at: string;
}

export interface Specification {
  id: string;
  vehicle_id: string;
  engine_code: string | null;
  displacement_cc: number | null;
  horsepower: number | null;
  torque_lb_ft: number | null;
  fuel_type: string;
  transmission: string | null;
  drivetrain: string | null;
  zero_sixty_sec: number | null;
  quarter_mile_sec: number | null;
  top_speed_mph: number | null;
  fuel_economy_city: number | null;
  fuel_economy_highway: number | null;
  fuel_economy_combined: number | null;
  curb_weight_lbs: number | null;
  wheelbase_in: number | null;
  motorsport_achievements: string | null;
  factory_racing_lineage: boolean;
  cultural_significance: string | null;
  source_urls: string[];
  caronomist_verified: boolean;
}

export interface Valuation {
  id: string;
  vehicle_id: string;
  region_code: string;
  region_name: string;
  official_source: string | null;
  official_price_low: number | null;
  official_price_high: number | null;
  official_price_median: number | null;
  official_data_date: string | null;
  official_sample_size: number | null;
  street_source: string | null;
  street_price_low: number | null;
  street_price_high: number | null;
  street_price_median: number | null;
  caronomist_fair_value: number | null;
  caronomist_confidence: number | null;
  confidence_reasoning: string | null;
  trend_30d_pct: number | null;
  trend_90d_pct: number | null;
  trend_1y_pct: number | null;
  price_excellent: number | null;
  price_good: number | null;
  price_fair: number | null;
  price_poor: number | null;
  data_freshness_date: string;
}

export interface AppreciationScore {
  id: string;
  vehicle_id: string;
  overall_score: number;
  rarity_score: number;
  motorsport_score: number;
  desirability_score: number;
  trajectory: 'appreciating' | 'stable' | 'declining';
  investment_tier: 'blue_chip' | 'emerging' | 'speculative';
  scoring_methodology_version: string;
  scored_at: string;
}

export interface BuyerGuide {
  id: string;
  vehicle_id: string;
  overview_md: string | null;
  weak_points_md: string | null;
  maintenance_notes_md: string | null;
  buying_checklist_md: string | null;
  parts_pricing_md: string | null;
  annual_maintenance_est_low: number | null;
  annual_maintenance_est_high: number | null;
  parts_availability: string | null;
  diy_friendliness: string | null;
  forum_urls: string[];
  paywall_tier: number;
  published: boolean;
  last_reviewed: string | null;
}

// Composite type for vehicle listing cards
export interface VehicleCard extends Vehicle {
  valuation?: Pick<Valuation, 'caronomist_fair_value' | 'official_price_low' | 'official_price_high' | 'official_price_median' | 'trend_1y_pct'>;
  appreciation?: Pick<AppreciationScore, 'overall_score' | 'trajectory' | 'investment_tier'>;
}

// API response types
export interface ApiResponse<T> {
  data: T;
  total?: number;
  page?: number;
  limit?: number;
  error?: string;
}

// ─── Member & Subscription Types ───────────────────────────────────────────

export type MemberTier = 'free' | 'pro' | 'pro_plus' | 'lifetime';
export type SubscriptionStatus = 'active' | 'past_due' | 'cancelled' | 'lifetime' | null;
export type BillingInterval = 'monthly' | 'yearly' | 'lifetime' | null;

export interface Member {
  id: string;
  email: string;
  memberstack_id: string | null;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  tier: MemberTier;
  tier_source: 'email' | 'stripe' | 'manual';
  subscription_status: SubscriptionStatus;
  subscription_started_at: string | null;
  subscription_renewed_at: string | null;
  subscription_cancelled_at: string | null;
  subscription_ends_at: string | null;
  billing_interval: BillingInterval;
  currency: string;
  amount_cents: number | null;
  portfolio_count: number;
  alert_count: number;
  is_flagged: boolean;
  flag_reason: string | null;
  churn_risk: boolean;
  signup_source: string | null;
  last_login_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface WebhookEvent {
  id: string;
  stripe_event_id: string;
  event_type: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  processed: boolean;
  processing_error: string | null;
  raw_payload: Record<string, unknown>;
  received_at: string;
  processed_at: string | null;
}

// Stripe subscription tier lookup — maps Stripe price IDs to member tiers
// Price IDs are env-var configured; this is the canonical mapping type
export interface StripePriceMap {
  [priceId: string]: {
    tier: MemberTier;
    interval: BillingInterval;
    amountCents: number;
  };
}

export interface VehicleSearchParams {
  q?: string;
  make?: string;
  year_min?: number;
  year_max?: number;
  tier?: 'blue_chip' | 'emerging' | 'speculative';
  price_max?: number;
  spi_only?: boolean;
  page?: number;
  limit?: number;
  sort?: 'score' | 'price_asc' | 'price_desc' | 'year' | 'appreciation';
}
