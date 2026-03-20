-- ============================================================================
-- MIGRATION VERIFICATION - Run this in Supabase SQL Editor
-- ============================================================================

-- 1. Check if new columns exist in countries table
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'countries' 
AND column_name IN ('is_source_country', 'passport_rank', 'passport_power_score', 'region', 'flag_emoji')
ORDER BY column_name;

-- Expected: 5 rows showing all new columns

-- 2. Check Turkey's status
SELECT 
  id, 
  name, 
  country_code, 
  is_source_country, 
  region,
  flag_emoji,
  status
FROM countries 
WHERE country_code = 'TUR';

-- Expected: 1 row with is_source_country = true

-- 3. If Turkey is NOT marked as source country, run this:
-- UPDATE countries SET is_source_country = true WHERE country_code = 'TUR';

-- 4. Check all source countries
SELECT 
  country_code,
  name,
  is_source_country,
  passport_rank,
  region,
  status
FROM countries 
WHERE is_source_country = true
ORDER BY name;

-- Expected: At least Turkey (TUR)

-- 5. Check products table
SELECT 
  column_name, 
  data_type,
  column_default
FROM information_schema.columns 
WHERE table_name = 'products' 
AND column_name = 'source_country_code';

-- Expected: 1 row showing source_country_code column

-- 6. Check visa_requirements table
SELECT 
  column_name, 
  data_type,
  column_default
FROM information_schema.columns 
WHERE table_name = 'visa_requirements' 
AND column_name = 'source_country_code';

-- Expected: 1 row showing source_country_code column

-- 7. Check new tables exist
SELECT 
  table_name,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public' 
AND table_name IN ('country_slugs', 'visa_pages_seo');

-- Expected: 2 rows (both tables)

-- ============================================================================
-- IF TURKEY IS NOT MARKED AS SOURCE COUNTRY, RUN THIS FIX:
-- ============================================================================

UPDATE countries 
SET 
  is_source_country = true,
  region = 'Middle East',
  flag_emoji = '🇹🇷'
WHERE country_code = 'TUR';

-- Verify the update
SELECT country_code, name, is_source_country, region, flag_emoji 
FROM countries 
WHERE country_code = 'TUR';

-- ============================================================================
