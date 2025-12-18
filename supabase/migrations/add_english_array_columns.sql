-- Add English versions of array columns to countries table
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/kcocpunrmubppassklzo/sql

-- Application Steps (EN)
ALTER TABLE countries 
ADD COLUMN IF NOT EXISTS application_steps_en JSONB;
COMMENT ON COLUMN countries.application_steps_en IS 'Visa application steps in English (JSONB array)';

-- Required Documents (EN)
ALTER TABLE countries 
ADD COLUMN IF NOT EXISTS required_documents_en JSONB;
COMMENT ON COLUMN countries.required_documents_en IS 'Required documents in English (JSONB array)';

-- Important Notes (EN)
ALTER TABLE countries 
ADD COLUMN IF NOT EXISTS important_notes_en JSONB;
COMMENT ON COLUMN countries.important_notes_en IS 'Important notes in English (JSONB array)';

-- Travel Tips (EN)
ALTER TABLE countries 
ADD COLUMN IF NOT EXISTS travel_tips_en JSONB;
COMMENT ON COLUMN countries.travel_tips_en IS 'Travel tips in English (JSONB array)';

-- Popular Cities (EN)
ALTER TABLE countries 
ADD COLUMN IF NOT EXISTS popular_cities_en JSONB;
COMMENT ON COLUMN countries.popular_cities_en IS 'Popular cities in English (JSONB array)';

-- Verify columns were added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'countries' 
AND column_name LIKE '%_en'
ORDER BY column_name;
