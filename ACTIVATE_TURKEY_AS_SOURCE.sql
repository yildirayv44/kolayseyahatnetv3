-- ============================================================================
-- Activate Turkey as Source Country
-- Türkiye'yi kaynak ülke olarak aktif et
-- ============================================================================

-- Türkiye'yi source country olarak işaretle
UPDATE countries 
SET is_source_country = true 
WHERE country_code = 'TUR';

-- Verification - Türkiye'nin aktif olduğunu doğrula
SELECT 
  id,
  name,
  country_code,
  is_source_country,
  passport_rank,
  flag_emoji
FROM countries 
WHERE country_code = 'TUR';

-- ============================================================================
-- Supabase Dashboard'da çalıştırın:
-- 1. Supabase Dashboard → SQL Editor
-- 2. Bu SQL'i yapıştırın
-- 3. RUN butonuna tıklayın
-- 4. Admin panel'i yenileyin: https://www.kolayseyahat.net/admin/visa-matrix
-- 5. Türkiye listede görünecek
-- ============================================================================
