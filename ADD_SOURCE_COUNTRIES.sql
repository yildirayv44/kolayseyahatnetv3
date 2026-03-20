-- ============================================================================
-- ADD SOURCE COUNTRIES - Run in Supabase SQL Editor
-- ============================================================================

-- 1. Mark Turkey as source country (if not already done)
UPDATE countries
SET
  is_source_country = true,
  region = 'Middle East',
  flag_emoji = '🇹🇷',
  passport_rank = 45,
  passport_power_score = 110
WHERE country_code = 'TUR';

-- 2. Mark Afghanistan as source country
UPDATE countries
SET
  is_source_country = true,
  region = 'Asia',
  flag_emoji = '🇦🇫',
  passport_rank = 110,
  passport_power_score = 28
WHERE country_code = 'AFG';

-- 3. Mark Montenegro as source country
UPDATE countries
SET
  is_source_country = true,
  region = 'Europe',
  flag_emoji = '🇲🇪',
  passport_rank = 48,
  passport_power_score = 124
WHERE country_code = 'MNE';

-- 4. Verify all source countries
SELECT 
  country_code,
  name,
  is_source_country,
  passport_rank,
  passport_power_score,
  region,
  flag_emoji,
  status
FROM countries 
WHERE is_source_country = true
ORDER BY passport_rank;

-- Expected: 3 rows (Turkey, Afghanistan, Montenegro)

-- ============================================================================
-- IMPORTANT: After running this, you need visa requirements data!
-- ============================================================================

-- Check if visa requirements exist for these source countries
SELECT 
  source_country_code,
  COUNT(*) as destination_count
FROM visa_requirements
WHERE source_country_code IN ('TUR', 'AFG', 'MNE')
GROUP BY source_country_code;

-- If no data exists, you need to run scraping:
-- 1. Go to /admin/visa-matrix
-- 2. Select source country (Afghanistan or Montenegro)
-- 3. Click "Veri Çek" to scrape from PassportIndex

-- ============================================================================
