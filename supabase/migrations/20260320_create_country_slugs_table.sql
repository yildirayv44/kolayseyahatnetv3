-- Migration: Create country_slugs table for multi-locale slug management
-- Created: 2026-03-20
-- Purpose: Support multiple slug types (destination-only, source-destination) in multiple locales

CREATE TABLE IF NOT EXISTS country_slugs (
  id BIGSERIAL PRIMARY KEY,
  country_id BIGINT NOT NULL REFERENCES countries(id) ON DELETE CASCADE,
  locale VARCHAR(5) NOT NULL, -- tr, en
  slug VARCHAR(255) NOT NULL,
  slug_type VARCHAR(50) NOT NULL, -- 'destination' (existing), 'source-destination' (new)
  source_country_code VARCHAR(3), -- NULL for destination-only slugs
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(slug, locale),
  UNIQUE(country_id, locale, slug_type, source_country_code)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_country_slugs_lookup ON country_slugs(slug, locale);
CREATE INDEX IF NOT EXISTS idx_country_slugs_country ON country_slugs(country_id);
CREATE INDEX IF NOT EXISTS idx_country_slugs_type ON country_slugs(slug_type);
CREATE INDEX IF NOT EXISTS idx_country_slugs_source ON country_slugs(source_country_code);

-- Add comments for documentation
COMMENT ON TABLE country_slugs IS 'Multi-locale slug management for country pages. Supports both destination-only (existing) and source-destination (new) slug types.';
COMMENT ON COLUMN country_slugs.slug_type IS 'Type of slug: destination (e.g., amerika-vizesi) or source-destination (e.g., turkmenistan-vatandaslari-amerika-vizesi)';
COMMENT ON COLUMN country_slugs.source_country_code IS 'Source country code for source-destination slugs. NULL for destination-only slugs.';

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_country_slugs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_country_slugs_updated_at ON country_slugs;
CREATE TRIGGER trigger_country_slugs_updated_at
  BEFORE UPDATE ON country_slugs
  FOR EACH ROW
  EXECUTE FUNCTION update_country_slugs_updated_at();

-- Add RLS policies
ALTER TABLE country_slugs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read access to country slugs" ON country_slugs;
DROP POLICY IF EXISTS "Allow authenticated users to manage country slugs" ON country_slugs;

CREATE POLICY "Allow public read access to country slugs"
  ON country_slugs
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow authenticated users to manage country slugs"
  ON country_slugs
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);
