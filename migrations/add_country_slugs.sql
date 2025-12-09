-- 1. Add slug column to countries table
ALTER TABLE countries 
ADD COLUMN IF NOT EXISTS slug VARCHAR(255);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_countries_slug ON countries(slug);

-- 2. Create country_slugs table for multi-locale support
CREATE TABLE IF NOT EXISTS country_slugs (
  id SERIAL PRIMARY KEY,
  country_id INTEGER NOT NULL REFERENCES countries(id) ON DELETE CASCADE,
  slug VARCHAR(255) NOT NULL,
  locale VARCHAR(10) NOT NULL DEFAULT 'tr',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure unique slug per locale
  UNIQUE(country_id, locale),
  UNIQUE(slug, locale)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_country_slugs_country_id ON country_slugs(country_id);
CREATE INDEX IF NOT EXISTS idx_country_slugs_slug ON country_slugs(slug);
CREATE INDEX IF NOT EXISTS idx_country_slugs_locale ON country_slugs(locale);

-- Add comment
COMMENT ON TABLE country_slugs IS 'Multi-locale slug mappings for countries';
COMMENT ON COLUMN country_slugs.slug IS 'URL-friendly slug for the country';
COMMENT ON COLUMN country_slugs.locale IS 'Language code (tr, en, etc.)';
