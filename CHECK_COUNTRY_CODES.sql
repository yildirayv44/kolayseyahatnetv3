-- Check country codes in database
SELECT country_code, name, name_en
FROM countries
WHERE country_code IN ('TUR', 'USA', 'GBR', 'DEU', 'FRA', 'ITA', 'CAN', 'AUS', 'JPN', 'CHN', 'RUS')
ORDER BY country_code;

-- Check all country codes
SELECT country_code, name
FROM countries
WHERE status = 1
ORDER BY country_code
LIMIT 50;
