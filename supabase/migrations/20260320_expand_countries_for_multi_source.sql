-- Migration: Expand countries table for multi-source visa system
-- Created: 2026-03-20
-- Purpose: Add columns to support countries as both source (passport holders) and destination

-- Add new columns to countries table
ALTER TABLE countries ADD COLUMN IF NOT EXISTS is_source_country BOOLEAN DEFAULT false;
ALTER TABLE countries ADD COLUMN IF NOT EXISTS passport_rank INTEGER;
ALTER TABLE countries ADD COLUMN IF NOT EXISTS passport_power_score INTEGER;
ALTER TABLE countries ADD COLUMN IF NOT EXISTS region VARCHAR(100);
ALTER TABLE countries ADD COLUMN IF NOT EXISTS flag_emoji VARCHAR(10);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_countries_is_source ON countries(is_source_country);
CREATE INDEX IF NOT EXISTS idx_countries_region ON countries(region);
CREATE INDEX IF NOT EXISTS idx_countries_passport_rank ON countries(passport_rank);

-- Add comments for documentation
COMMENT ON COLUMN countries.is_source_country IS 'Whether this country can be selected as a source (passport holder) country in visa checker';
COMMENT ON COLUMN countries.passport_rank IS 'Global passport ranking from PassportIndex';
COMMENT ON COLUMN countries.passport_power_score IS 'Passport power score (0-199) from PassportIndex';
COMMENT ON COLUMN countries.region IS 'Geographic region: Europe, Asia, Americas, Africa, Oceania, Middle East';
COMMENT ON COLUMN countries.flag_emoji IS 'Country flag emoji (e.g., 🇹🇷, 🇺🇸)';

-- Mark Turkey as source country (existing system)
UPDATE countries SET is_source_country = true WHERE country_code = 'TUR';

-- Update Turkey's region if not set
UPDATE countries SET region = 'Middle East' WHERE country_code = 'TUR' AND region IS NULL;
