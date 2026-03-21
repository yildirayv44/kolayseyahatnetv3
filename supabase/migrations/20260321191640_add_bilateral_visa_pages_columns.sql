-- ============================================================================
-- Bilateral Visa Pages Migration
-- Adds necessary columns and policies for bilateral visa pages functionality
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

-- 2. Add new columns to visa_pages_seo table
ALTER TABLE visa_pages_seo 
ADD COLUMN IF NOT EXISTS slug VARCHAR(255) UNIQUE,
ADD COLUMN IF NOT EXISTS custom_content TEXT,
ADD COLUMN IF NOT EXISTS use_custom_content BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_viewed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS important_notes TEXT,
ADD COLUMN IF NOT EXISTS travel_tips TEXT,
ADD COLUMN IF NOT EXISTS health_requirements TEXT,
ADD COLUMN IF NOT EXISTS customs_rules TEXT,
ADD COLUMN IF NOT EXISTS why_kolay_seyahat TEXT,
ADD COLUMN IF NOT EXISTS country_info JSONB;

-- 3. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_visa_pages_seo_slug ON visa_pages_seo(slug);
CREATE INDEX IF NOT EXISTS idx_visa_pages_seo_views ON visa_pages_seo(view_count DESC);
CREATE INDEX IF NOT EXISTS idx_visa_pages_seo_source_dest ON visa_pages_seo(source_country_code, destination_country_code);

-- 4. Add column comments for documentation
COMMENT ON COLUMN visa_pages_seo.slug IS 'SEO-friendly URL slug: {source-country}-{destination-country}-vize (e.g., turkiye-amerika-vize)';
COMMENT ON COLUMN visa_pages_seo.custom_content IS 'Admin-provided custom content (overrides AI-generated content when use_custom_content is true)';
COMMENT ON COLUMN visa_pages_seo.use_custom_content IS 'Toggle between AI-generated content and custom content';
COMMENT ON COLUMN visa_pages_seo.view_count IS 'Number of page views for analytics';
COMMENT ON COLUMN visa_pages_seo.last_viewed_at IS 'Last time the page was viewed';
COMMENT ON COLUMN visa_pages_seo.important_notes IS 'Important notes section (HTML content)';
COMMENT ON COLUMN visa_pages_seo.travel_tips IS 'Travel tips section (HTML content)';
COMMENT ON COLUMN visa_pages_seo.health_requirements IS 'Health requirements section (HTML content)';
COMMENT ON COLUMN visa_pages_seo.customs_rules IS 'Customs rules section (HTML content)';
COMMENT ON COLUMN visa_pages_seo.why_kolay_seyahat IS 'Why Kolay Seyahat section (HTML content)';
COMMENT ON COLUMN visa_pages_seo.country_info IS 'Country information (capital, language, currency, timezone, emergency numbers) as JSONB';

-- 5. Create function to auto-generate slug from country codes
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
  final_slug TEXT;
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
  
  -- Generate slug (simplified, you may want to add proper slugification)
  final_slug := lower(source_name) || '-' || lower(destination_name) || '-' || slug_suffix;
  
  -- Basic cleanup (replace spaces with hyphens)
  final_slug := replace(final_slug, ' ', '-');
  
  RETURN final_slug;
END;
$$ LANGUAGE plpgsql;

-- 6. Create trigger to auto-generate slug on insert if not provided
CREATE OR REPLACE FUNCTION auto_generate_visa_page_slug()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
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

-- 7. Update RLS policies for visa_pages_seo
DROP POLICY IF EXISTS "Allow public read access to published visa pages" ON visa_pages_seo;
DROP POLICY IF EXISTS "Allow authenticated users to manage visa pages" ON visa_pages_seo;

CREATE POLICY "Allow public read access to published visa pages"
  ON visa_pages_seo
  FOR SELECT
  TO public
  USING (content_status = 'published' OR content_status = 'generated');

CREATE POLICY "Allow authenticated users to manage visa pages"
  ON visa_pages_seo
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);
