-- ============================================================================
-- KOLAY SEYAHAT - VISA MATRIX MIGRATIONS
-- Run these in Supabase Dashboard → SQL Editor
-- ============================================================================

-- MIGRATION 1: Expand countries table
-- ============================================================================
ALTER TABLE countries ADD COLUMN IF NOT EXISTS is_source_country BOOLEAN DEFAULT false;
ALTER TABLE countries ADD COLUMN IF NOT EXISTS passport_rank INTEGER;
ALTER TABLE countries ADD COLUMN IF NOT EXISTS passport_power_score INTEGER;
ALTER TABLE countries ADD COLUMN IF NOT EXISTS region VARCHAR(100);
ALTER TABLE countries ADD COLUMN IF NOT EXISTS flag_emoji VARCHAR(10);

CREATE INDEX IF NOT EXISTS idx_countries_is_source ON countries(is_source_country);
CREATE INDEX IF NOT EXISTS idx_countries_region ON countries(region);
CREATE INDEX IF NOT EXISTS idx_countries_passport_rank ON countries(passport_rank);

COMMENT ON COLUMN countries.is_source_country IS 'Whether this country can be selected as a source (passport holder) country in visa checker';
COMMENT ON COLUMN countries.passport_rank IS 'Global passport ranking from PassportIndex';
COMMENT ON COLUMN countries.passport_power_score IS 'Passport power score (0-199) from PassportIndex';
COMMENT ON COLUMN countries.region IS 'Geographic region: Europe, Asia, Americas, Africa, Oceania, Middle East';
COMMENT ON COLUMN countries.flag_emoji IS 'Country flag emoji (e.g., 🇹🇷, 🇺🇸)';

UPDATE countries SET is_source_country = true WHERE country_code = 'TUR';
UPDATE countries SET region = 'Middle East' WHERE country_code = 'TUR' AND region IS NULL;

-- MIGRATION 2: Expand products table
-- ============================================================================
ALTER TABLE products ADD COLUMN IF NOT EXISTS source_country_code VARCHAR(3) DEFAULT 'TUR';

CREATE INDEX IF NOT EXISTS idx_products_source_country ON products(source_country_code);
CREATE INDEX IF NOT EXISTS idx_products_source_destination ON products(source_country_code, country_id);

COMMENT ON COLUMN products.source_country_code IS 'ISO 3166-1 alpha-3 code of source country (passport holder). Default TUR for Turkey.';

UPDATE products SET source_country_code = 'TUR' WHERE source_country_code IS NULL;
ALTER TABLE products ALTER COLUMN source_country_code SET NOT NULL;

-- MIGRATION 3: Expand visa_requirements table
-- ============================================================================
ALTER TABLE visa_requirements ADD COLUMN IF NOT EXISTS source_country_code VARCHAR(3) DEFAULT 'TUR';

UPDATE visa_requirements SET source_country_code = 'TUR' WHERE source_country_code IS NULL;
ALTER TABLE visa_requirements ALTER COLUMN source_country_code SET NOT NULL;

DROP INDEX IF EXISTS idx_visa_requirements_country_code;

CREATE UNIQUE INDEX IF NOT EXISTS idx_visa_requirements_matrix 
ON visa_requirements(source_country_code, country_code);

CREATE INDEX IF NOT EXISTS idx_visa_requirements_source ON visa_requirements(source_country_code);
CREATE INDEX IF NOT EXISTS idx_visa_requirements_destination ON visa_requirements(country_code);

COMMENT ON COLUMN visa_requirements.source_country_code IS 'ISO 3166-1 alpha-3 code of source country (passport holder). Default TUR for Turkey.';

-- MIGRATION 4: Create country_slugs table
-- ============================================================================
CREATE TABLE IF NOT EXISTS country_slugs (
  id BIGSERIAL PRIMARY KEY,
  country_id BIGINT NOT NULL REFERENCES countries(id) ON DELETE CASCADE,
  locale VARCHAR(5) NOT NULL,
  slug VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add new columns if they don't exist
ALTER TABLE country_slugs ADD COLUMN IF NOT EXISTS slug_type VARCHAR(50);
ALTER TABLE country_slugs ADD COLUMN IF NOT EXISTS source_country_code VARCHAR(3);

-- Add unique constraint if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'country_slugs_slug_locale_key'
  ) THEN
    ALTER TABLE country_slugs ADD CONSTRAINT country_slugs_slug_locale_key UNIQUE(slug, locale);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_country_slugs_lookup ON country_slugs(slug, locale);
CREATE INDEX IF NOT EXISTS idx_country_slugs_country ON country_slugs(country_id);
CREATE INDEX IF NOT EXISTS idx_country_slugs_type ON country_slugs(slug_type);
CREATE INDEX IF NOT EXISTS idx_country_slugs_source ON country_slugs(source_country_code);

COMMENT ON TABLE country_slugs IS 'Multi-locale slug management for country pages. Supports both destination-only (existing) and source-destination (new) slug types.';
COMMENT ON COLUMN country_slugs.slug_type IS 'Type of slug: destination (e.g., amerika-vizesi) or source-destination (e.g., turkmenistan-vatandaslari-amerika-vizesi)';
COMMENT ON COLUMN country_slugs.source_country_code IS 'Source country code for source-destination slugs. NULL for destination-only slugs.';

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

-- MIGRATION 5: Create visa_pages_seo table
-- ============================================================================
CREATE TABLE IF NOT EXISTS visa_pages_seo (
  id BIGSERIAL PRIMARY KEY,
  source_country_code VARCHAR(3) NOT NULL,
  destination_country_code VARCHAR(3) NOT NULL,
  locale VARCHAR(5) NOT NULL DEFAULT 'tr',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add new columns if they don't exist
ALTER TABLE visa_pages_seo ADD COLUMN IF NOT EXISTS meta_title VARCHAR(255);
ALTER TABLE visa_pages_seo ADD COLUMN IF NOT EXISTS meta_description TEXT;
ALTER TABLE visa_pages_seo ADD COLUMN IF NOT EXISTS h1_title VARCHAR(255);
ALTER TABLE visa_pages_seo ADD COLUMN IF NOT EXISTS intro_text TEXT;
ALTER TABLE visa_pages_seo ADD COLUMN IF NOT EXISTS requirements_section TEXT;
ALTER TABLE visa_pages_seo ADD COLUMN IF NOT EXISTS process_section TEXT;
ALTER TABLE visa_pages_seo ADD COLUMN IF NOT EXISTS faq_json JSONB;
ALTER TABLE visa_pages_seo ADD COLUMN IF NOT EXISTS content_status VARCHAR(50) DEFAULT 'pending';
ALTER TABLE visa_pages_seo ADD COLUMN IF NOT EXISTS generated_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE visa_pages_seo ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE visa_pages_seo ADD COLUMN IF NOT EXISTS published_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE visa_pages_seo ADD COLUMN IF NOT EXISTS ai_model VARCHAR(100);
ALTER TABLE visa_pages_seo ADD COLUMN IF NOT EXISTS generation_prompt TEXT;

-- Add unique constraint if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'visa_pages_seo_source_destination_locale_key'
  ) THEN
    ALTER TABLE visa_pages_seo ADD CONSTRAINT visa_pages_seo_source_destination_locale_key 
    UNIQUE(source_country_code, destination_country_code, locale);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_visa_pages_seo_lookup ON visa_pages_seo(source_country_code, destination_country_code);
CREATE INDEX IF NOT EXISTS idx_visa_pages_seo_status ON visa_pages_seo(content_status);
CREATE INDEX IF NOT EXISTS idx_visa_pages_seo_locale ON visa_pages_seo(locale);
CREATE INDEX IF NOT EXISTS idx_visa_pages_seo_published ON visa_pages_seo(published_at) WHERE published_at IS NOT NULL;

COMMENT ON TABLE visa_pages_seo IS 'SEO metadata and AI-generated content for source-destination visa pages';
COMMENT ON COLUMN visa_pages_seo.content_status IS 'Content workflow status: pending, generated, reviewed, published';
COMMENT ON COLUMN visa_pages_seo.faq_json IS 'FAQ section as JSON array: [{question: string, answer: string}]';

CREATE OR REPLACE FUNCTION update_visa_pages_seo_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_visa_pages_seo_updated_at ON visa_pages_seo;
CREATE TRIGGER trigger_visa_pages_seo_updated_at
  BEFORE UPDATE ON visa_pages_seo
  FOR EACH ROW
  EXECUTE FUNCTION update_visa_pages_seo_updated_at();

ALTER TABLE visa_pages_seo ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read access to published visa pages" ON visa_pages_seo;
DROP POLICY IF EXISTS "Allow authenticated users to manage visa pages" ON visa_pages_seo;

CREATE POLICY "Allow public read access to published visa pages"
  ON visa_pages_seo
  FOR SELECT
  TO public
  USING (content_status = 'published');

CREATE POLICY "Allow authenticated users to manage visa pages"
  ON visa_pages_seo
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ============================================================================
-- MIGRATION 6: Add source_country_code to visa_requirements
-- ============================================================================

-- Add source_country_code column
ALTER TABLE visa_requirements 
ADD COLUMN IF NOT EXISTS source_country_code VARCHAR(3);

-- Update existing records to use TUR as default source country
UPDATE visa_requirements 
SET source_country_code = 'TUR' 
WHERE source_country_code IS NULL;

-- Make source_country_code NOT NULL after setting defaults
ALTER TABLE visa_requirements 
ALTER COLUMN source_country_code SET NOT NULL;

-- Drop old unique constraint on country_code only
ALTER TABLE visa_requirements 
DROP CONSTRAINT IF EXISTS visa_requirements_country_code_key;

-- Add new composite unique constraint (drop first if exists)
ALTER TABLE visa_requirements 
DROP CONSTRAINT IF EXISTS visa_requirements_source_destination_unique;

ALTER TABLE visa_requirements 
ADD CONSTRAINT visa_requirements_source_destination_unique 
UNIQUE (source_country_code, country_code);

-- Add index for source_country_code
CREATE INDEX IF NOT EXISTS idx_visa_requirements_source_country 
ON visa_requirements(source_country_code);

-- Add composite index for common queries
CREATE INDEX IF NOT EXISTS idx_visa_requirements_source_dest 
ON visa_requirements(source_country_code, country_code);

-- ============================================================================
-- MIGRATION 7: Create scraping_logs table
-- ============================================================================
CREATE TABLE IF NOT EXISTS scraping_logs (
  id BIGSERIAL PRIMARY KEY,
  source_country_code VARCHAR(3) NOT NULL,
  source_country_name VARCHAR(255),
  status VARCHAR(50) NOT NULL,
  countries_scraped INTEGER DEFAULT 0,
  countries_total INTEGER DEFAULT 0,
  errors TEXT,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_scraping_logs_country ON scraping_logs(source_country_code);
CREATE INDEX IF NOT EXISTS idx_scraping_logs_status ON scraping_logs(status);
CREATE INDEX IF NOT EXISTS idx_scraping_logs_created ON scraping_logs(created_at DESC);

-- ============================================================================
-- END OF MIGRATIONS
-- ============================================================================

-- Check if all columns were added successfully
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'countries' 
AND column_name IN ('is_source_country', 'passport_rank', 'passport_power_score', 'region', 'flag_emoji')
ORDER BY column_name;

-- Check Turkey is marked as source country
SELECT id, name, country_code, is_source_country, region 
FROM countries 
WHERE country_code = 'TUR';

-- Check products have source_country_code
SELECT COUNT(*) as total_products, 
       COUNT(source_country_code) as with_source_code,
       COUNT(DISTINCT source_country_code) as distinct_sources
FROM products;

-- Check visa_requirements have source_country_code
SELECT COUNT(*) as total_requirements,
       COUNT(source_country_code) as with_source_code,
       COUNT(DISTINCT source_country_code) as distinct_sources
FROM visa_requirements;

-- Check new tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('country_slugs', 'visa_pages_seo');

-- ============================================================================
-- MIGRATIONS COMPLETE!
-- ============================================================================
