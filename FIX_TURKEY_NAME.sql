-- ============================================================================
-- Fix Turkey Name in Database
-- Türkiye'nin adını düzelt
-- ============================================================================

-- Türkiye'nin mevcut durumunu kontrol et
SELECT 
  id,
  name,
  country_code,
  is_source_country,
  status
FROM countries 
WHERE country_code = 'TUR';

-- Türkiye'nin adını düzelt
UPDATE countries 
SET name = 'Türkiye'
WHERE country_code = 'TUR';

-- Türkiye'yi source country olarak aktif et (eğer değilse)
UPDATE countries 
SET is_source_country = true,
    status = 1
WHERE country_code = 'TUR';

-- Doğrulama
SELECT 
  id,
  name,
  country_code,
  is_source_country,
  status
FROM countries 
WHERE country_code = 'TUR';

-- ============================================================================
-- Supabase Dashboard'da çalıştırın:
-- 1. Supabase Dashboard → SQL Editor
-- 2. Bu SQL'i yapıştırın ve RUN
-- 3. Sayfayı yenileyin: https://www.kolayseyahat.net/sirbistan-vize-tablosu
-- 4. "TUR" yerine "Türkiye" görünecek
-- ============================================================================
