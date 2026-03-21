-- ============================================================================
-- Activate all countries as source countries
-- Tüm ülkeleri kaynak ülke olarak aktif et
-- ============================================================================

UPDATE countries 
SET is_source_country = true 
WHERE status = 1;

-- Verify the update
SELECT 
  COUNT(*) as total_countries,
  COUNT(*) FILTER (WHERE is_source_country = true) as source_countries
FROM countries 
WHERE status = 1;
