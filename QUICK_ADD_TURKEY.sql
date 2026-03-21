-- Quick add Turkey to countries table
-- Run this in Supabase SQL Editor

INSERT INTO countries (
  name,
  country_code,
  is_source_country,
  status,
  flag_emoji,
  region,
  sorted
) VALUES (
  'Türkiye',
  'TUR',
  true,
  1,
  '🇹🇷',
  'Middle East',
  (SELECT COALESCE(MAX(sorted), 0) + 1 FROM countries)
)
ON CONFLICT (country_code) 
DO UPDATE SET
  name = 'Türkiye',
  is_source_country = true,
  status = 1,
  flag_emoji = '🇹🇷';

-- Verify
SELECT id, name, country_code, is_source_country, status
FROM countries
WHERE country_code = 'TUR';
