-- ============================================================================
-- Enable Turkey for Manual Test Scraping
-- Türkiye'yi manuel test için aktif et
-- ============================================================================

-- 1. Türkiye'yi aktif et ve adını düzelt
UPDATE countries 
SET is_source_country = true,
    name = 'Türkiye',
    status = 1
WHERE country_code = 'TUR';

-- 2. Doğrulama
SELECT 
  id,
  name,
  country_code,
  is_source_country,
  status,
  passport_rank,
  flag_emoji
FROM countries 
WHERE country_code = 'TUR';

-- 3. Mevcut Türkiye verilerini kontrol et
SELECT 
  COUNT(*) as total_records,
  COUNT(DISTINCT country_code) as unique_countries
FROM visa_requirements 
WHERE source_country_code = 'TUR';

-- ============================================================================
-- Adımlar:
-- 1. Supabase Dashboard → SQL Editor'da bu SQL'i çalıştır
-- 2. Admin panel'i yenile: https://www.kolayseyahat.net/admin/visa-matrix
-- 3. Türkiye dropdown'da görünecek
-- 4. Türkiye'yi seç → "Veri Çek" butonu → Manuel test
-- 5. ~1 dakika sonra 199 ülke verisi çekilecek
-- 6. Norveç'i kontrol et: visa-required olmalı
-- ============================================================================
