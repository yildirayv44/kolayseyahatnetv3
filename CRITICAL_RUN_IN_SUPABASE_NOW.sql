-- ============================================================================
-- CRITICAL: Bu SQL'i Supabase SQL Editor'da ÇALIŞTIRMALISINız!
-- "Country data not found" hatası bu migration çalıştırılmadan düzelmez!
-- ============================================================================

-- 1. Countries tablosuna RLS politikası ekle (ZORUNLU)
ALTER TABLE countries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read access to countries" ON countries;

CREATE POLICY "Allow public read access to countries"
  ON countries
  FOR SELECT
  TO public
  USING (true);

-- 2. visa_pages_seo tablosuna yeni kolonları ekle
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

-- 3. Index'leri oluştur
CREATE INDEX IF NOT EXISTS idx_visa_pages_seo_slug ON visa_pages_seo(slug);
CREATE INDEX IF NOT EXISTS idx_visa_pages_seo_views ON visa_pages_seo(view_count DESC);

-- 4. Kolon açıklamaları ekle
COMMENT ON COLUMN visa_pages_seo.slug IS 'SEO-friendly URL slug';
COMMENT ON COLUMN visa_pages_seo.custom_content IS 'Admin custom content';
COMMENT ON COLUMN visa_pages_seo.use_custom_content IS 'Toggle custom vs AI content';
COMMENT ON COLUMN visa_pages_seo.view_count IS 'Page view count';
COMMENT ON COLUMN visa_pages_seo.important_notes IS 'Important notes section';
COMMENT ON COLUMN visa_pages_seo.travel_tips IS 'Travel tips section';
COMMENT ON COLUMN visa_pages_seo.health_requirements IS 'Health requirements section';
COMMENT ON COLUMN visa_pages_seo.customs_rules IS 'Customs rules section';
COMMENT ON COLUMN visa_pages_seo.why_kolay_seyahat IS 'Why Kolay Seyahat section';
COMMENT ON COLUMN visa_pages_seo.country_info IS 'Country information (capital, language, etc.)';

-- BAŞARILI! Migration tamamlandı.
-- Artık bilateral vize sayfaları oluşturabilirsiniz.
