-- ============================================================================
-- Restore Turkey Data - Exclude from Scraping
-- Türkiye verilerini koruma - scraping'den hariç tut
-- ============================================================================

-- 1. Türkiye'yi source country'den çıkar (scraping yapılmasın)
UPDATE countries 
SET is_source_country = false 
WHERE country_code = 'TUR';

-- 2. PassportIndex'ten çekilen Türkiye verilerini sil
-- (Sadece source_country_code = 'TUR' olanları sil, destination olarak kalanlar korunsun)
DELETE FROM visa_requirements 
WHERE source_country_code = 'TUR';

-- 3. Scraping queue'dan Türkiye job'larını temizle
DELETE FROM scraping_queue 
WHERE current_country_code = 'TUR';

-- Verification
SELECT 
  country_code,
  name,
  is_source_country,
  (SELECT COUNT(*) FROM visa_requirements WHERE source_country_code = 'TUR') as turkey_visa_count
FROM countries 
WHERE country_code = 'TUR';

-- ============================================================================
-- NOT: Eski Türkiye verilerini geri yüklemek için backup'tan restore gerekli
-- Eğer backup yoksa, manuel olarak tekrar girilmeli
-- ============================================================================
