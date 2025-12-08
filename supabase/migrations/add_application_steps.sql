-- Add application_steps column to countries table
ALTER TABLE countries 
ADD COLUMN IF NOT EXISTS application_steps JSONB;

COMMENT ON COLUMN countries.application_steps IS 'Vize başvuru adımları (JSONB array)';
