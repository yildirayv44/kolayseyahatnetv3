-- ============================================================================
-- FIX: Add source_country_code to visa_requirements table
-- Bu migration unique constraint hatasını düzeltir
-- ============================================================================

-- 1. Add source_country_code column
ALTER TABLE visa_requirements 
ADD COLUMN IF NOT EXISTS source_country_code VARCHAR(3);

-- 2. Update existing records to use TUR as default source country
UPDATE visa_requirements 
SET source_country_code = 'TUR' 
WHERE source_country_code IS NULL;

-- 3. Make source_country_code NOT NULL after setting defaults
ALTER TABLE visa_requirements 
ALTER COLUMN source_country_code SET NOT NULL;

-- 4. Drop old unique constraint on country_code only
ALTER TABLE visa_requirements 
DROP CONSTRAINT IF EXISTS visa_requirements_country_code_key;

-- 5. Add new composite unique constraint (drop first if exists)
ALTER TABLE visa_requirements 
DROP CONSTRAINT IF EXISTS visa_requirements_source_destination_unique;

ALTER TABLE visa_requirements 
ADD CONSTRAINT visa_requirements_source_destination_unique 
UNIQUE (source_country_code, country_code);

-- 6. Add index for source_country_code
CREATE INDEX IF NOT EXISTS idx_visa_requirements_source_country 
ON visa_requirements(source_country_code);

-- 7. Add composite index for common queries
CREATE INDEX IF NOT EXISTS idx_visa_requirements_source_dest 
ON visa_requirements(source_country_code, country_code);

-- ============================================================================
-- Verification Query
-- ============================================================================
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'visa_requirements' 
  AND column_name IN ('source_country_code', 'country_code')
ORDER BY ordinal_position;

-- Check constraints
SELECT 
  conname AS constraint_name,
  contype AS constraint_type
FROM pg_constraint 
WHERE conrelid = 'visa_requirements'::regclass;

-- ============================================================================
