-- ============================================================================
-- CRITICAL: Run this in Supabase SQL Editor to fix bilateral visa pages
-- ============================================================================

-- 1. Fix RLS policies for countries table (REQUIRED)
-- Without this, the API cannot read country data
ALTER TABLE countries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read access to countries" ON countries;

CREATE POLICY "Allow public read access to countries"
  ON countries
  FOR SELECT
  TO public
  USING (true);

-- 2. Run the bilateral visa pages migration
-- Add new columns to visa_pages_seo
ALTER TABLE visa_pages_seo 
ADD COLUMN IF NOT EXISTS slug VARCHAR(255) UNIQUE,
ADD COLUMN IF NOT EXISTS custom_content TEXT,
ADD COLUMN IF NOT EXISTS use_custom_content BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_viewed_at TIMESTAMP WITH TIME ZONE;

-- Create index for slug lookups
CREATE INDEX IF NOT EXISTS idx_visa_pages_seo_slug ON visa_pages_seo(slug);

-- Create index for view analytics
CREATE INDEX IF NOT EXISTS idx_visa_pages_seo_views ON visa_pages_seo(view_count DESC);

-- Add comments for new columns
COMMENT ON COLUMN visa_pages_seo.slug IS 'SEO-friendly URL slug: {source-country}-{destination-country}-vize (e.g., turkiye-amerika-vize)';
COMMENT ON COLUMN visa_pages_seo.custom_content IS 'Admin-provided custom content (overrides AI-generated content when use_custom_content is true)';
COMMENT ON COLUMN visa_pages_seo.use_custom_content IS 'Toggle between AI-generated content and custom content';
COMMENT ON COLUMN visa_pages_seo.view_count IS 'Number of page views for analytics';
COMMENT ON COLUMN visa_pages_seo.last_viewed_at IS 'Last time the page was viewed';

-- Function to auto-generate slug from country codes
CREATE OR REPLACE FUNCTION generate_visa_page_slug(
  source_code VARCHAR(3),
  destination_code VARCHAR(3),
  locale_code VARCHAR(5)
)
RETURNS VARCHAR(255) AS $$
DECLARE
  source_name TEXT;
  destination_name TEXT;
  slug_suffix TEXT;
BEGIN
  -- Get country names (simplified slugs)
  SELECT name INTO source_name FROM countries WHERE country_code = source_code;
  SELECT name INTO destination_name FROM countries WHERE country_code = destination_code;
  
  -- Determine suffix based on locale
  IF locale_code = 'en' THEN
    slug_suffix := 'visa';
  ELSE
    slug_suffix := 'vize';
  END IF;
  
  -- Generate slug: lowercase, replace spaces with hyphens, remove special chars
  RETURN lower(
    regexp_replace(
      regexp_replace(source_name || '-' || destination_name || '-' || slug_suffix, '[^a-zA-Z0-9\s-]', '', 'g'),
      '\s+', '-', 'g'
    )
  );
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate slug on insert if not provided
CREATE OR REPLACE FUNCTION auto_generate_visa_page_slug()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.slug IS NULL THEN
    NEW.slug := generate_visa_page_slug(NEW.source_country_code, NEW.destination_country_code, NEW.locale);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_auto_generate_visa_page_slug ON visa_pages_seo;
CREATE TRIGGER trigger_auto_generate_visa_page_slug
  BEFORE INSERT ON visa_pages_seo
  FOR EACH ROW
  EXECUTE FUNCTION auto_generate_visa_page_slug();

-- Function to increment view count
CREATE OR REPLACE FUNCTION increment_visa_page_views(page_slug VARCHAR(255))
RETURNS void AS $$
BEGIN
  UPDATE visa_pages_seo
  SET view_count = view_count + 1,
      last_viewed_at = NOW()
  WHERE slug = page_slug;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- Verification queries
-- ============================================================================

-- Check RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd
FROM pg_policies
WHERE tablename = 'countries';

-- Check if columns were added
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'visa_pages_seo'
AND column_name IN ('slug', 'custom_content', 'use_custom_content', 'view_count', 'last_viewed_at');

-- Check Turkey exists
SELECT id, name, country_code, status
FROM countries
WHERE country_code = 'TUR';

-- ============================================================================
-- Done! Now run: npx tsx scripts/add-turkey-and-generate.ts
-- ============================================================================
