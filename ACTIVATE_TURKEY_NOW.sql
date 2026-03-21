-- ============================================================================
-- ACTIVATE TURKEY - Run this in Supabase Dashboard NOW
-- Türkiye'yi şimdi aktif et - Supabase Dashboard'da çalıştır
-- ============================================================================

-- 1. Türkiye'yi aktif et ve düzelt
UPDATE countries 
SET is_source_country = true,
    name = 'Türkiye',
    status = 1
WHERE country_code = 'TUR';

-- 2. Doğrulama - Türkiye aktif mi?
SELECT 
  id,
  name,
  country_code,
  is_source_country,
  status
FROM countries 
WHERE country_code = 'TUR';

-- Beklenen sonuç:
-- name: Türkiye
-- country_code: TUR
-- is_source_country: true
-- status: 1

-- ============================================================================
-- SONRA: Terminal'de bu komutu çalıştırın (manuel scraping test)
-- ============================================================================
-- curl -X POST "https://www.kolayseyahat.net/api/admin/visa-matrix/scrape-passportindex" \
--   -H "Content-Type: application/json" \
--   -d '{"sourceCountryCode":"TUR"}'
-- 
-- Beklenen: 199 ülke verisi çekilecek (~1 dakika)
-- ============================================================================
