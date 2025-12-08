-- Add extended fields to countries table for AI-generated content
-- Migration: add_country_extended_fields
-- Created: 2025-12-08

-- SEO fields
ALTER TABLE countries ADD COLUMN IF NOT EXISTS meta_description TEXT;

-- Visa details
ALTER TABLE countries ADD COLUMN IF NOT EXISTS visa_type VARCHAR(255);
ALTER TABLE countries ADD COLUMN IF NOT EXISTS max_stay_duration VARCHAR(255);
ALTER TABLE countries ADD COLUMN IF NOT EXISTS visa_fee VARCHAR(255);
ALTER TABLE countries ADD COLUMN IF NOT EXISTS processing_time VARCHAR(255);

-- JSON array fields
ALTER TABLE countries ADD COLUMN IF NOT EXISTS required_documents JSONB DEFAULT '[]'::jsonb;
ALTER TABLE countries ADD COLUMN IF NOT EXISTS important_notes JSONB DEFAULT '[]'::jsonb;
ALTER TABLE countries ADD COLUMN IF NOT EXISTS travel_tips JSONB DEFAULT '[]'::jsonb;
ALTER TABLE countries ADD COLUMN IF NOT EXISTS popular_cities JSONB DEFAULT '[]'::jsonb;

-- Text fields
ALTER TABLE countries ADD COLUMN IF NOT EXISTS best_time_to_visit TEXT;
ALTER TABLE countries ADD COLUMN IF NOT EXISTS health_requirements TEXT;
ALTER TABLE countries ADD COLUMN IF NOT EXISTS customs_regulations TEXT;
ALTER TABLE countries ADD COLUMN IF NOT EXISTS why_kolay_seyahat TEXT;

-- JSON object field
ALTER TABLE countries ADD COLUMN IF NOT EXISTS emergency_contacts JSONB DEFAULT '{}'::jsonb;

-- Country info
ALTER TABLE countries ADD COLUMN IF NOT EXISTS capital VARCHAR(255);
ALTER TABLE countries ADD COLUMN IF NOT EXISTS currency VARCHAR(255);
ALTER TABLE countries ADD COLUMN IF NOT EXISTS language VARCHAR(255);
ALTER TABLE countries ADD COLUMN IF NOT EXISTS timezone VARCHAR(255);

-- Add comments for documentation
COMMENT ON COLUMN countries.meta_description IS 'SEO meta description for the country page';
COMMENT ON COLUMN countries.visa_type IS 'Type of visa required (e.g., E-Visa, Tourist Visa, Visa-free)';
COMMENT ON COLUMN countries.max_stay_duration IS 'Maximum allowed stay duration';
COMMENT ON COLUMN countries.visa_fee IS 'Visa fee information (includes disclaimer about consultation fees)';
COMMENT ON COLUMN countries.processing_time IS 'Visa processing time';
COMMENT ON COLUMN countries.required_documents IS 'Array of required documents for visa application';
COMMENT ON COLUMN countries.important_notes IS 'Array of important notes and warnings';
COMMENT ON COLUMN countries.travel_tips IS 'Array of travel tips and recommendations';
COMMENT ON COLUMN countries.popular_cities IS 'Array of popular cities to visit';
COMMENT ON COLUMN countries.best_time_to_visit IS 'Best time to visit the country';
COMMENT ON COLUMN countries.health_requirements IS 'Health requirements (vaccines, insurance, etc)';
COMMENT ON COLUMN countries.customs_regulations IS 'Customs and import/export regulations';
COMMENT ON COLUMN countries.emergency_contacts IS 'Emergency contact information (embassy, police, etc)';
COMMENT ON COLUMN countries.why_kolay_seyahat IS 'Why choose Kolay Seyahat for this country';
COMMENT ON COLUMN countries.capital IS 'Capital city';
COMMENT ON COLUMN countries.currency IS 'Currency information';
COMMENT ON COLUMN countries.language IS 'Official language(s)';
COMMENT ON COLUMN countries.timezone IS 'Timezone information';
