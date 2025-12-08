-- Add country_code to countries table and link with visa_requirements
-- Migration: add_country_code_and_visa_link
-- Created: 2025-12-08

-- Add country_code column to countries table (ISO 3166-1 alpha-3)
ALTER TABLE countries ADD COLUMN IF NOT EXISTS country_code VARCHAR(3);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_countries_country_code ON countries(country_code);

-- Add comment
COMMENT ON COLUMN countries.country_code IS 'ISO 3166-1 alpha-3 country code (e.g., USA, GBR, DEU) - links to visa_requirements table';

-- Update existing countries with their ISO codes
-- Common countries that might already exist
UPDATE countries SET country_code = 'USA' WHERE name ILIKE '%amerika%' OR name ILIKE '%united states%';
UPDATE countries SET country_code = 'GBR' WHERE name ILIKE '%ingiltere%' OR name ILIKE '%united kingdom%' OR name ILIKE '%britain%';
UPDATE countries SET country_code = 'DEU' WHERE name ILIKE '%almanya%' OR name ILIKE '%germany%';
UPDATE countries SET country_code = 'FRA' WHERE name ILIKE '%fransa%' OR name ILIKE '%france%';
UPDATE countries SET country_code = 'ITA' WHERE name ILIKE '%italya%' OR name ILIKE '%italy%';
UPDATE countries SET country_code = 'ESP' WHERE name ILIKE '%ispanya%' OR name ILIKE '%spain%';
UPDATE countries SET country_code = 'NLD' WHERE name ILIKE '%hollanda%' OR name ILIKE '%netherlands%';
UPDATE countries SET country_code = 'BEL' WHERE name ILIKE '%belcika%' OR name ILIKE '%belgium%';
UPDATE countries SET country_code = 'CHE' WHERE name ILIKE '%isvicre%' OR name ILIKE '%switzerland%';
UPDATE countries SET country_code = 'AUT' WHERE name ILIKE '%avusturya%' OR name ILIKE '%austria%';
UPDATE countries SET country_code = 'GRC' WHERE name ILIKE '%yunanistan%' OR name ILIKE '%greece%';
UPDATE countries SET country_code = 'PRT' WHERE name ILIKE '%portekiz%' OR name ILIKE '%portugal%';
UPDATE countries SET country_code = 'SWE' WHERE name ILIKE '%isvec%' OR name ILIKE '%sweden%';
UPDATE countries SET country_code = 'NOR' WHERE name ILIKE '%norvec%' OR name ILIKE '%norway%';
UPDATE countries SET country_code = 'DNK' WHERE name ILIKE '%danimarka%' OR name ILIKE '%denmark%';
UPDATE countries SET country_code = 'FIN' WHERE name ILIKE '%finlandiya%' OR name ILIKE '%finland%';
UPDATE countries SET country_code = 'POL' WHERE name ILIKE '%polonya%' OR name ILIKE '%poland%';
UPDATE countries SET country_code = 'CZE' WHERE name ILIKE '%cekya%' OR name ILIKE '%czech%';
UPDATE countries SET country_code = 'HUN' WHERE name ILIKE '%macaristan%' OR name ILIKE '%hungary%';
UPDATE countries SET country_code = 'JPN' WHERE name ILIKE '%japonya%' OR name ILIKE '%japan%';
UPDATE countries SET country_code = 'KOR' WHERE name ILIKE '%kore%' OR name ILIKE '%korea%';
UPDATE countries SET country_code = 'CHN' WHERE name ILIKE '%cin%' OR name ILIKE '%china%';
UPDATE countries SET country_code = 'IND' WHERE name ILIKE '%hindistan%' OR name ILIKE '%india%';
UPDATE countries SET country_code = 'RUS' WHERE name ILIKE '%rusya%' OR name ILIKE '%russia%';
UPDATE countries SET country_code = 'CAN' WHERE name ILIKE '%kanada%' OR name ILIKE '%canada%';
UPDATE countries SET country_code = 'MEX' WHERE name ILIKE '%meksika%' OR name ILIKE '%mexico%';
UPDATE countries SET country_code = 'BRA' WHERE name ILIKE '%brezilya%' OR name ILIKE '%brazil%';
UPDATE countries SET country_code = 'ARG' WHERE name ILIKE '%arjantin%' OR name ILIKE '%argentina%';
UPDATE countries SET country_code = 'AUS' WHERE name ILIKE '%avustralya%' OR name ILIKE '%australia%';
UPDATE countries SET country_code = 'NZL' WHERE name ILIKE '%yeni zelanda%' OR name ILIKE '%new zealand%';
UPDATE countries SET country_code = 'SGP' WHERE name ILIKE '%singapur%' OR name ILIKE '%singapore%';
UPDATE countries SET country_code = 'THA' WHERE name ILIKE '%tayland%' OR name ILIKE '%thailand%';
UPDATE countries SET country_code = 'MYS' WHERE name ILIKE '%malezya%' OR name ILIKE '%malaysia%';
UPDATE countries SET country_code = 'IDN' WHERE name ILIKE '%endonezya%' OR name ILIKE '%indonesia%';
UPDATE countries SET country_code = 'PHL' WHERE name ILIKE '%filipin%' OR name ILIKE '%philippines%';
UPDATE countries SET country_code = 'VNM' WHERE name ILIKE '%vietnam%';
UPDATE countries SET country_code = 'EGY' WHERE name ILIKE '%misir%' OR name ILIKE '%egypt%';
UPDATE countries SET country_code = 'ARE' WHERE name ILIKE '%emirlik%' OR name ILIKE '%uae%' OR name ILIKE '%dubai%';
UPDATE countries SET country_code = 'SAU' WHERE name ILIKE '%suudi%' OR name ILIKE '%saudi%';
UPDATE countries SET country_code = 'QAT' WHERE name ILIKE '%katar%' OR name ILIKE '%qatar%';
UPDATE countries SET country_code = 'JOR' WHERE name ILIKE '%urdun%' OR name ILIKE '%jordan%';
UPDATE countries SET country_code = 'LBN' WHERE name ILIKE '%lubnan%' OR name ILIKE '%lebanon%';
UPDATE countries SET country_code = 'ISR' WHERE name ILIKE '%israil%' OR name ILIKE '%israel%';
UPDATE countries SET country_code = 'ZAF' WHERE name ILIKE '%guney afrika%' OR name ILIKE '%south africa%';
UPDATE countries SET country_code = 'MAR' WHERE name ILIKE '%fas%' OR name ILIKE '%morocco%';
UPDATE countries SET country_code = 'TUN' WHERE name ILIKE '%tunus%' OR name ILIKE '%tunisia%';
UPDATE countries SET country_code = 'IRL' WHERE name ILIKE '%irlanda%' OR name ILIKE '%ireland%';
UPDATE countries SET country_code = 'ISL' WHERE name ILIKE '%izlanda%' OR name ILIKE '%iceland%';
UPDATE countries SET country_code = 'HRV' WHERE name ILIKE '%hirvatistan%' OR name ILIKE '%croatia%';
UPDATE countries SET country_code = 'SRB' WHERE name ILIKE '%sirbistan%' OR name ILIKE '%serbia%';
UPDATE countries SET country_code = 'BGR' WHERE name ILIKE '%bulgaristan%' OR name ILIKE '%bulgaria%';
UPDATE countries SET country_code = 'ROU' WHERE name ILIKE '%romanya%' OR name ILIKE '%romania%';
UPDATE countries SET country_code = 'UKR' WHERE name ILIKE '%ukrayna%' OR name ILIKE '%ukraine%';

-- Create a view to easily see countries with their visa requirements
CREATE OR REPLACE VIEW countries_with_visa_info AS
SELECT 
  c.id,
  c.name,
  c.slug,
  c.country_code,
  c.image_url,
  c.status,
  vr.visa_status,
  vr.allowed_stay,
  vr.conditions,
  vr.visa_cost,
  vr.processing_time,
  vr.application_method
FROM countries c
LEFT JOIN visa_requirements vr ON c.country_code = vr.country_code
ORDER BY c.name;

-- Add comment to view
COMMENT ON VIEW countries_with_visa_info IS 'Countries with their visa requirements for Turkish passport holders';
