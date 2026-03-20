-- Migration: Expand visa_requirements table for multi-source matrix
-- Created: 2026-03-20
-- Purpose: Add source_country_code to support visa requirements from any country to any country

-- Add source_country_code column (nullable to preserve existing data)
ALTER TABLE visa_requirements ADD COLUMN IF NOT EXISTS source_country_code VARCHAR(3) DEFAULT 'TUR';

-- Update all existing records to be Turkey-sourced
UPDATE visa_requirements SET source_country_code = 'TUR' WHERE source_country_code IS NULL;

-- Make source_country_code NOT NULL after setting defaults
ALTER TABLE visa_requirements ALTER COLUMN source_country_code SET NOT NULL;

-- Drop old unique constraint on country_code only
DROP INDEX IF EXISTS idx_visa_requirements_country_code;

-- Create new unique constraint on (source_country_code, country_code)
CREATE UNIQUE INDEX IF NOT EXISTS idx_visa_requirements_matrix 
ON visa_requirements(source_country_code, country_code);

-- Create additional indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_visa_requirements_source ON visa_requirements(source_country_code);
CREATE INDEX IF NOT EXISTS idx_visa_requirements_destination ON visa_requirements(country_code);

-- Add comment for documentation
COMMENT ON COLUMN visa_requirements.source_country_code IS 'ISO 3166-1 alpha-3 code of source country (passport holder). Default TUR for Turkey.';
