-- Add Turkey to countries table for bilateral visa pages
-- This is required before generating bilateral visa content

DO $$
DECLARE
  max_sorted INTEGER;
BEGIN
  -- Get max sorted value
  SELECT COALESCE(MAX(sorted), 0) INTO max_sorted FROM countries;
  
  -- Insert or update Turkey
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
    max_sorted + 1
  )
  ON CONFLICT (country_code) 
  DO UPDATE SET
    name = 'Türkiye',
    is_source_country = true,
    status = 1,
    flag_emoji = '🇹🇷',
    region = 'Middle East',
    sorted = COALESCE(countries.sorted, max_sorted + 1);
  
  RAISE NOTICE 'Turkey added/updated successfully';
END $$;

-- Verify
SELECT id, name, country_code, is_source_country, status
FROM countries
WHERE country_code = 'TUR';
