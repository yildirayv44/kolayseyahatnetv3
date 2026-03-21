-- Migration: Add source_country_code to visa_requirements table
-- This allows storing visa requirements for multiple source countries
-- ============================================================================

-- Add source_country_code column
ALTER TABLE visa_requirements 
ADD COLUMN IF NOT EXISTS source_country_code VARCHAR(3);

-- Update existing records to use TUR as default source country
UPDATE visa_requirements 
SET source_country_code = 'TUR' 
WHERE source_country_code IS NULL;

-- Make source_country_code NOT NULL after setting defaults
ALTER TABLE visa_requirements 
ALTER COLUMN source_country_code SET NOT NULL;

-- Drop old unique constraint on country_code only
ALTER TABLE visa_requirements 
DROP CONSTRAINT IF EXISTS visa_requirements_country_code_key;

-- Add new composite unique constraint
ALTER TABLE visa_requirements 
ADD CONSTRAINT visa_requirements_source_destination_unique 
UNIQUE (source_country_code, country_code);

-- Add index for source_country_code
CREATE INDEX IF NOT EXISTS idx_visa_requirements_source_country 
ON visa_requirements(source_country_code);

-- Add composite index for common queries
CREATE INDEX IF NOT EXISTS idx_visa_requirements_source_dest 
ON visa_requirements(source_country_code, country_code);

-- Update comments
COMMENT ON COLUMN visa_requirements.source_country_code IS 'ISO 3166-1 alpha-3 code of the passport holder country (e.g., TUR, KAZ, AFG)';
COMMENT ON TABLE visa_requirements IS 'Visa requirements for passport holders from various countries based on PassportIndex data';

-- ============================================================================
