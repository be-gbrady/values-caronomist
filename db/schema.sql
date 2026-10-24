-- Caronomist Values — PostgreSQL Schema v1.0
-- Target: Supabase (PostgreSQL 15+)
-- Generated: 2026-04-02
-- Purpose: values.caronomist.com vehicle database

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- CORE VEHICLE TABLE
-- ============================================================
CREATE TABLE vehicles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  model_code VARCHAR(50) UNIQUE NOT NULL,   -- e.g., "BMW-E46-M3"
  year_start INT NOT NULL,
  year_end INT,
  make VARCHAR(100) NOT NULL,
  model VARCHAR(100) NOT NULL,
  generation VARCHAR(50),                    -- e.g., "E46"
  trim VARCHAR(255),                         -- e.g., "Competition Package"
  body_style VARCHAR(50),                    -- Coupe, Sedan, Wagon, Cabriolet, Roadster
  country_of_origin VARCHAR(50),
  units_produced INT,
  search_slug VARCHAR(255) UNIQUE,           -- e.g., "bmw-e46-m3-2001"
  spi_tracked BOOLEAN DEFAULT FALSE,         -- in Caronomist Street Price Index
  featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_vehicles_make ON vehicles(make);
CREATE INDEX idx_vehicles_year_start ON vehicles(year_start);
CREATE INDEX idx_vehicles_search_slug ON vehicles(search_slug);
CREATE INDEX idx_vehicles_spi_tracked ON vehicles(spi_tracked);

-- ============================================================
-- SPECIFICATIONS TABLE
-- ============================================================
CREATE TABLE specifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,

  -- Engine
  engine_code VARCHAR(50),
  displacement_cc INT,
  horsepower INT,
  torque_lb_ft INT,
  fuel_type VARCHAR(50) DEFAULT 'Gasoline',

  -- Transmission & Drivetrain
  transmission VARCHAR(100),
  drivetrain VARCHAR(10),                    -- RWD, FWD, AWD

  -- Performance
  zero_sixty_sec DECIMAL(4, 2),
  quarter_mile_sec DECIMAL(4, 2),
  top_speed_mph INT,

  -- Fuel Economy
  fuel_economy_city INT,
  fuel_economy_highway INT,
  fuel_economy_combined INT,

  -- Physical
  curb_weight_lbs INT,
  length_in DECIMAL(6, 1),
  width_in DECIMAL(6, 1),
  height_in DECIMAL(6, 1),
  wheelbase_in DECIMAL(6, 1),

  -- Heritage / Collectibility
  motorsport_achievements TEXT,
  factory_racing_lineage BOOLEAN DEFAULT FALSE,
  significant_awards TEXT,
  cultural_significance TEXT,

  -- Sourcing
  source_urls TEXT[],
  caronomist_verified BOOLEAN DEFAULT FALSE,
  verification_date TIMESTAMP WITH TIME ZONE,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE (vehicle_id)
);

CREATE INDEX idx_specs_vehicle_id ON specifications(vehicle_id);
CREATE INDEX idx_specs_horsepower ON specifications(horsepower);

-- ============================================================
-- VALUATIONS TABLE
-- ============================================================
CREATE TABLE valuations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,

  -- Region
  region_code VARCHAR(20) DEFAULT 'US_nationwide',
  region_name VARCHAR(100) DEFAULT 'United States (Nationwide)',

  -- Official Market Data
  official_source VARCHAR(100),              -- "Classic.com", "Hagerty", "Cars&Bids"
  official_price_low INT,
  official_price_high INT,
  official_price_median INT,
  official_data_date DATE,
  official_sample_size INT,

  -- Street Market Data (FB Marketplace, Craigslist)
  street_source VARCHAR(100),               -- "FB_Marketplace", "Craigslist"
  street_price_low INT,
  street_price_high INT,
  street_price_median INT,
  street_data_date DATE,
  street_sample_size INT,

  -- Caronomist Recommendation
  caronomist_fair_value INT,
  caronomist_confidence DECIMAL(3, 2),       -- 0.00–1.00
  confidence_reasoning TEXT,

  -- Trends (% change)
  trend_30d_pct DECIMAL(6, 2),
  trend_90d_pct DECIMAL(6, 2),
  trend_1y_pct DECIMAL(6, 2),
  trend_5y_pct DECIMAL(6, 2),

  -- Condition breakdowns
  price_excellent INT,
  price_good INT,
  price_fair INT,
  price_poor INT,

  data_freshness_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_valuations_vehicle_id ON valuations(vehicle_id);
CREATE INDEX idx_valuations_region ON valuations(region_code);
CREATE INDEX idx_valuations_freshness ON valuations(data_freshness_date);

-- ============================================================
-- APPRECIATION SCORES TABLE (Caronomist Proprietary)
-- ============================================================
CREATE TABLE appreciation_scores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,

  -- Caronomist Score (0–100)
  overall_score INT CHECK (overall_score >= 0 AND overall_score <= 100),
  rarity_score INT CHECK (rarity_score >= 0 AND rarity_score <= 100),
  motorsport_score INT CHECK (motorsport_score >= 0 AND motorsport_score <= 100),
  desirability_score INT CHECK (desirability_score >= 0 AND desirability_score <= 100),
  condition_sensitivity_score INT,           -- how much condition affects value
  trajectory VARCHAR(20),                    -- "appreciating", "stable", "declining"
  investment_tier VARCHAR(20),               -- "blue_chip", "emerging", "speculative"

  scoring_methodology_version VARCHAR(10) DEFAULT '1.0',
  scored_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  scored_by VARCHAR(100) DEFAULT 'Caronomist Editorial',

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE (vehicle_id)
);

CREATE INDEX idx_appreciation_vehicle_id ON appreciation_scores(vehicle_id);
CREATE INDEX idx_appreciation_tier ON appreciation_scores(investment_tier);
CREATE INDEX idx_appreciation_score ON appreciation_scores(overall_score);

-- ============================================================
-- BUYER GUIDES TABLE
-- ============================================================
CREATE TABLE buyer_guides (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,

  -- Guide Content (Markdown)
  overview_md TEXT,
  weak_points_md TEXT,                       -- Known failure points, rust, reliability
  maintenance_notes_md TEXT,
  buying_checklist_md TEXT,
  parts_pricing_md TEXT,

  -- Cost of Ownership
  annual_maintenance_est_low INT,
  annual_maintenance_est_high INT,
  parts_availability VARCHAR(50),            -- "excellent", "good", "fair", "poor"
  diy_friendliness VARCHAR(50),              -- "beginner", "intermediate", "expert"

  -- Community Resources
  forum_urls TEXT[],
  registry_urls TEXT[],
  specialist_shops TEXT[],

  paywall_tier INT DEFAULT 3,                -- 1=free, 2=$12, 3=$29, 4=lifetime
  published BOOLEAN DEFAULT FALSE,
  last_reviewed DATE,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE (vehicle_id)
);

CREATE INDEX idx_guides_vehicle_id ON buyer_guides(vehicle_id);
CREATE INDEX idx_guides_published ON buyer_guides(published);

-- ============================================================
-- AUDIT LOG (data source tracking)
-- ============================================================
CREATE TABLE audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  entity_type VARCHAR(50) NOT NULL,          -- "vehicle", "valuation", "specification"
  entity_id UUID NOT NULL,
  action VARCHAR(50) NOT NULL,               -- "create", "update", "verify", "import"
  performed_by VARCHAR(100),                 -- operator handle or "import_script"
  source_url TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_audit_entity ON audit_log(entity_type, entity_id);
CREATE INDEX idx_audit_performed_by ON audit_log(performed_by);

-- ============================================================
-- HELPER: auto-update updated_at timestamp
-- ============================================================
CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_vehicles_updated_at BEFORE UPDATE ON vehicles FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();
CREATE TRIGGER set_specs_updated_at BEFORE UPDATE ON specifications FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();
CREATE TRIGGER set_valuations_updated_at BEFORE UPDATE ON valuations FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();
CREATE TRIGGER set_appreciation_updated_at BEFORE UPDATE ON appreciation_scores FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();
CREATE TRIGGER set_guides_updated_at BEFORE UPDATE ON buyer_guides FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

-- ============================================================
-- MEMBERS TABLE (Memberstack + Stripe subscriber tracking)
-- ============================================================
CREATE TABLE members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Identity
  email VARCHAR(255) UNIQUE NOT NULL,
  memberstack_id VARCHAR(255) UNIQUE,          -- Memberstack member ID
  stripe_customer_id VARCHAR(255) UNIQUE,      -- Stripe customer ID
  stripe_subscription_id VARCHAR(255) UNIQUE,  -- Active Stripe subscription ID

  -- Subscription state
  tier VARCHAR(20) NOT NULL DEFAULT 'free',    -- 'free', 'pro', 'pro_plus', 'lifetime'
  tier_source VARCHAR(20) DEFAULT 'email',     -- 'email', 'stripe', 'manual'
  subscription_status VARCHAR(30),             -- 'active', 'past_due', 'cancelled', 'lifetime'
  subscription_started_at TIMESTAMP WITH TIME ZONE,
  subscription_renewed_at TIMESTAMP WITH TIME ZONE,
  subscription_cancelled_at TIMESTAMP WITH TIME ZONE,
  subscription_ends_at TIMESTAMP WITH TIME ZONE,

  -- Billing
  billing_interval VARCHAR(10),                -- 'monthly', 'yearly', 'lifetime'
  currency VARCHAR(3) DEFAULT 'USD',
  amount_cents INT,                            -- Current recurring amount in cents

  -- Usage limits
  portfolio_count INT DEFAULT 0,
  alert_count INT DEFAULT 0,

  -- Flags
  is_flagged BOOLEAN DEFAULT FALSE,            -- True if chargeback dispute filed
  flag_reason TEXT,
  churn_risk BOOLEAN DEFAULT FALSE,            -- True if 30d+ inactive

  -- Metadata
  signup_source VARCHAR(100),                  -- UTM source or referral
  last_login_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_members_email ON members(email);
CREATE INDEX idx_members_stripe_customer ON members(stripe_customer_id);
CREATE INDEX idx_members_tier ON members(tier);
CREATE INDEX idx_members_status ON members(subscription_status);

CREATE TRIGGER set_members_updated_at
  BEFORE UPDATE ON members
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

-- ============================================================
-- WEBHOOK EVENTS LOG (idempotency + audit trail)
-- ============================================================
CREATE TABLE webhook_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  stripe_event_id VARCHAR(255) UNIQUE NOT NULL, -- Stripe event ID (evt_xxx) — enforces idempotency
  event_type VARCHAR(100) NOT NULL,             -- e.g., 'customer.subscription.created'
  stripe_customer_id VARCHAR(255),
  stripe_subscription_id VARCHAR(255),
  processed BOOLEAN DEFAULT FALSE,
  processing_error TEXT,
  raw_payload JSONB,                            -- Full Stripe event object for replay
  received_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_webhook_events_stripe_id ON webhook_events(stripe_event_id);
CREATE INDEX idx_webhook_events_type ON webhook_events(event_type);
CREATE INDEX idx_webhook_events_customer ON webhook_events(stripe_customer_id);

-- ============================================================
-- EMAIL EVENTS LOG (campaign deduplication + send history)
-- ============================================================
CREATE TABLE email_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id VARCHAR(255) UNIQUE NOT NULL,       -- idempotency key (e.g., memberstack_event_id)
  event_type VARCHAR(100) NOT NULL,            -- 'member.signup', 'member.day7', etc.
  to_email VARCHAR(255) NOT NULL,
  template VARCHAR(100),                       -- 'welcome', 'day7-upsell', etc.
  postmark_message_id VARCHAR(255),            -- Postmark MessageID for tracking
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_email_events_event_id ON email_events(event_id);
CREATE INDEX idx_email_events_to_email ON email_events(to_email);
CREATE INDEX idx_email_events_type ON email_events(event_type);
