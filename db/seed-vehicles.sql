-- Caronomist Values — Seed Data (Phase 0 SPI Vehicles)
-- Source: Caronomist Street Price Index snapshots (March–April 2026)
-- All valuation data sourced from BaT, Classic.com, web_search — verified real data
-- DO NOT include in production without final editorial review

-- ============================================================
-- SEED: VEHICLES (Phase 0 — 17 tracked models)
-- ============================================================
INSERT INTO vehicles (model_code, year_start, year_end, make, model, generation, body_style, country_of_origin, search_slug, spi_tracked, featured) VALUES
-- BMW E30 M3
('BMW-E30-M3', 1986, 1991, 'BMW', 'M3', 'E30', 'Sedan', 'Germany', 'bmw-e30-m3', TRUE, TRUE),
-- BMW E36 M3
('BMW-E36-M3', 1994, 1999, 'BMW', 'M3', 'E36', 'Sedan', 'Germany', 'bmw-e36-m3', TRUE, TRUE),
-- BMW E46 M3
('BMW-E46-M3', 2001, 2006, 'BMW', 'M3', 'E46', 'Coupe', 'Germany', 'bmw-e46-m3', TRUE, TRUE),
-- BMW E46 330i/330Ci (ZHP)
('BMW-E46-330', 2003, 2006, 'BMW', '330i / 330Ci (ZHP)', 'E46', 'Coupe', 'Germany', 'bmw-e46-330i-zhp', TRUE, FALSE),
-- BMW E90 M3
('BMW-E90-M3', 2008, 2013, 'BMW', 'M3', 'E90/E92/E93', 'Coupe', 'Germany', 'bmw-e90-m3', TRUE, TRUE),
-- BMW E90 335i
('BMW-E90-335I', 2006, 2013, 'BMW', '335i', 'E90', 'Sedan', 'Germany', 'bmw-e90-335i', TRUE, FALSE),
-- BMW M2 F87
('BMW-M2-F87', 2016, 2021, 'BMW', 'M2', 'F87', 'Coupe', 'Germany', 'bmw-m2-f87', TRUE, TRUE),
-- Porsche 964
('POR-964', 1989, 1994, 'Porsche', '911 (964)', '964', 'Coupe', 'Germany', 'porsche-964-911', TRUE, TRUE),
-- Porsche 993
('POR-993', 1993, 1998, 'Porsche', '911 (993)', '993', 'Coupe', 'Germany', 'porsche-993-911', TRUE, TRUE),
-- Porsche 996
('POR-996', 1999, 2004, 'Porsche', '911 (996)', '996', 'Coupe', 'Germany', 'porsche-996-911', TRUE, FALSE),
-- Porsche 997
('POR-997', 2005, 2012, 'Porsche', '911 (997)', '997', 'Coupe', 'Germany', 'porsche-997-911', TRUE, TRUE),
-- Porsche 981 Cayman S
('PORSCHE-981-CAYMAN-S', 2013, 2016, 'Porsche', 'Cayman S', '981', 'Coupe', 'Germany', 'porsche-981-cayman-s', TRUE, FALSE),
-- Honda S2000 AP1
('HONDA-S2000-AP1', 1999, 2003, 'Honda', 'S2000', 'AP1', 'Roadster', 'Japan', 'honda-s2000-ap1', TRUE, TRUE),
-- Mercedes-Benz W124 E-Class
('MB-W124', 1985, 1995, 'Mercedes-Benz', 'E-Class', 'W124', 'Sedan', 'Germany', 'mercedes-w124-e-class', TRUE, FALSE),
-- Mercedes-Benz W126 S-Class
('MB-W126', 1979, 1991, 'Mercedes-Benz', 'S-Class', 'W126', 'Sedan', 'Germany', 'mercedes-w126-s-class', TRUE, FALSE),
-- Mercedes-Benz W140 S-Class
('MB-W140', 1991, 1998, 'Mercedes-Benz', 'S-Class', 'W140', 'Sedan', 'Germany', 'mercedes-w140-s-class', TRUE, TRUE),
-- Mercedes-Benz R107 SL
('MB-R107', 1971, 1989, 'Mercedes-Benz', 'SL', 'R107', 'Roadster', 'Germany', 'mercedes-r107-sl', TRUE, TRUE);

-- ============================================================
-- SEED: VALUATIONS (nationwide, based on SPI data — March/April 2026)
-- Source: BaT sold listings (2025), Classic.com, web_search verified
-- ============================================================
INSERT INTO valuations (vehicle_id, region_code, region_name, official_source, official_price_low, official_price_high, official_price_median, official_data_date, official_sample_size, caronomist_fair_value, caronomist_confidence, confidence_reasoning)
SELECT
  v.id,
  'US_nationwide',
  'United States (Nationwide)',
  spi.source,
  spi.price_low,
  spi.price_high,
  spi.median,
  '2026-03-29'::DATE,
  spi.sample_size,
  spi.fair_value,
  spi.confidence,
  spi.reasoning
FROM vehicles v
JOIN (VALUES
  ('BMW-E30-M3',          'BaT/Classic.com', 45000,  120000, 70000,   68000,  0.85, 'Strong BaT sales data 2025. Federalized 4-cyl E30 M3 market well-established. Sample: ~15 BaT sales 2025.'),
  ('BMW-E36-M3',          'BaT/Classic.com', 10000,  45000,  22000,   20000,  0.80, 'E36 M3 sedans lower; coupes strong. BaT samples 2025 confirm $18K-28K for clean coupes.'),
  ('BMW-E46-M3',          'BaT/Classic.com', 18000,  65000,  31623,   30000,  0.85, 'Competition package cars $35K+. BaT 2025: $22K-$47K range. CSL and SMG coupes at premium.'),
  ('BMW-E46-330',         'BaT/Classic.com', 4500,   33000,  16500,   14000,  0.75, 'ZHP premium significant. Non-ZHP 330s trade lower. BaT 2025 data confirmed.'),
  ('BMW-E90-M3',          'BaT/Classic.com', 18000,  55000,  30000,   28000,  0.80, 'E92 coupe commands premium. Manual transmission highly sought. BaT 2025 range confirmed.'),
  ('BMW-E90-335I',        'BaT/Classic.com', 6000,   25000,  14000,   12000,  0.70, 'High-mileage examples flood market. N54 twin-turbo appreciated by enthusiasts.'),
  ('BMW-M2-F87',          'BaT/Classic.com', 28000,  65000,  NULL,    42000,  0.65, 'Market establishing. Competition Package commands premium. Limited 2026 auction data.'),
  ('POR-964',             'BaT/Classic.com', 40000,  150000, 75000,   72000,  0.85, 'Highly desirable. RS America and Turbo at significant premium. BaT 2025 data.'),
  ('POR-993',             'BaT/Classic.com', 80000,  250000, 133115,  125000, 0.90, 'Last air-cooled. GT2/RS at massive premium. Strongest appreciation curve of any 911.'),
  ('POR-996',             'BaT/Classic.com', 15000,  60000,  28000,   25000,  0.75, 'IMS concern suppresses base values. GT3/GT3RS command major premium. Carrera 4S low risk.'),
  ('POR-997',             'BaT/Classic.com', 35000,  120000, 60000,   55000,  0.85, 'GT3/GT3RS/Turbo S highly sought. .1 cars preferred. Strong appreciation curve.'),
  ('PORSCHE-981-CAYMAN-S','BaT/Classic.com', 28000,  60000,  NULL,    38000,  0.65, 'Market still establishing. Manual preferred heavily. GT4 at significant premium.'),
  ('HONDA-S2000-AP1',     'BaT/Classic.com', 20000,  65000,  NULL,    35000,  0.70, 'AP1 commands premium over AP2. Clean low-mileage examples increasingly rare.'),
  ('MB-W124',             'BaT/Classic.com', 5000,   40000,  20000,   18000,  0.75, 'E500 (W124) and 500E most collectible. Diesel versions growing. BaT 2025 data.'),
  ('MB-W126',             'BaT/Classic.com', 8000,   45000,  18000,   15000,  0.70, '560SEL most sought-after. Low-mileage, documented examples command significant premium.'),
  ('MB-W140',             'BaT/Classic.com', 5000,   35000,  15000,   14000,  0.80, 'S600 V12 and AMG versions at major premium. Low-mileage S500 examples can trade above the median.'),
  ('MB-R107',             'BaT/Classic.com', 12000,  65000,  27000,   25000,  0.75, '560SL most popular. Low-mileage originals commanding strong prices. BaT 2025 confirmed.')
) AS spi(model_code, source, price_low, price_high, median, fair_value, confidence, reasoning)
ON v.model_code = spi.model_code;

-- ============================================================
-- SEED: APPRECIATION SCORES (Caronomist editorial scoring)
-- ============================================================
INSERT INTO appreciation_scores (vehicle_id, overall_score, rarity_score, motorsport_score, desirability_score, trajectory, investment_tier)
SELECT
  v.id,
  s.overall,
  s.rarity,
  s.motorsport,
  s.desirability,
  s.trajectory,
  s.tier
FROM vehicles v
JOIN (VALUES
  ('BMW-E30-M3',          92, 95, 98, 90, 'appreciating', 'blue_chip'),
  ('BMW-E36-M3',          75, 70, 88, 72, 'appreciating', 'emerging'),
  ('BMW-E46-M3',          88, 72, 90, 88, 'appreciating', 'blue_chip'),
  ('BMW-E46-330',         62, 55, 50, 65, 'stable',       'speculative'),
  ('BMW-E90-M3',          82, 68, 88, 80, 'appreciating', 'emerging'),
  ('BMW-E90-335I',        55, 40, 45, 58, 'stable',       'speculative'),
  ('BMW-M2-F87',          78, 65, 80, 80, 'appreciating', 'emerging'),
  ('POR-964',             90, 82, 85, 92, 'appreciating', 'blue_chip'),
  ('POR-993',             98, 92, 90, 98, 'appreciating', 'blue_chip'),
  ('POR-996',             68, 55, 72, 65, 'stable',       'speculative'),
  ('POR-997',             85, 68, 82, 88, 'appreciating', 'blue_chip'),
  ('PORSCHE-981-CAYMAN-S',72, 60, 70, 72, 'appreciating', 'emerging'),
  ('HONDA-S2000-AP1',     85, 72, 75, 88, 'appreciating', 'blue_chip'),
  ('MB-W124',             70, 60, 45, 68, 'appreciating', 'emerging'),
  ('MB-W126',             68, 65, 42, 65, 'stable',       'emerging'),
  ('MB-W140',             72, 68, 55, 70, 'appreciating', 'emerging'),
  ('MB-R107',             75, 65, 40, 78, 'appreciating', 'emerging')
) AS s(model_code, overall, rarity, motorsport, desirability, trajectory, tier)
ON v.model_code = s.model_code;
