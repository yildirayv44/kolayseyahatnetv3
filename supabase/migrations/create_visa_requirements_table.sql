-- Create visa requirements table based on PassportIndex data structure
-- This table stores visa requirements for Turkish passport holders traveling to other countries
-- Migration: create_visa_requirements_table
-- Created: 2025-12-08

-- Create visa requirements table
CREATE TABLE IF NOT EXISTS visa_requirements (
  id BIGSERIAL PRIMARY KEY,
  
  -- Country reference
  country_code VARCHAR(3) NOT NULL UNIQUE, -- ISO 3166-1 alpha-3 code (e.g., USA, GBR, DEU)
  country_name VARCHAR(255) NOT NULL,
  
  -- Visa requirement status (from PassportIndex)
  -- Values: 'visa-free', 'visa-on-arrival', 'eta', 'evisa', 'visa-required', 'no-admission'
  visa_status VARCHAR(50) NOT NULL,
  
  -- Duration allowed (for visa-free/visa-on-arrival)
  allowed_stay VARCHAR(100), -- e.g., "90 days", "30 days", "6 months"
  
  -- Additional details
  conditions TEXT, -- Special conditions or notes
  
  -- PassportIndex specific data
  passport_index_score INTEGER, -- Mobility score (0-199)
  
  -- Additional information
  visa_cost VARCHAR(100), -- Cost if visa required (e.g., "$160", "Free", "€60")
  processing_time VARCHAR(100), -- Processing time (e.g., "3-5 days", "Instant", "2-4 weeks")
  
  -- Application method
  application_method VARCHAR(50), -- 'online', 'embassy', 'on-arrival', 'not-required'
  application_url TEXT, -- URL for visa application
  
  -- Embassy information
  embassy_location VARCHAR(255), -- Embassy location in Turkey
  embassy_contact VARCHAR(255), -- Embassy contact info
  
  -- Metadata
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  data_source VARCHAR(100) DEFAULT 'PassportIndex', -- Source of data
  notes TEXT, -- Additional notes
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_visa_requirements_country_code ON visa_requirements(country_code);
CREATE INDEX IF NOT EXISTS idx_visa_requirements_visa_status ON visa_requirements(visa_status);
CREATE INDEX IF NOT EXISTS idx_visa_requirements_country_name ON visa_requirements(country_name);

-- Add comments for documentation
COMMENT ON TABLE visa_requirements IS 'Visa requirements for Turkish passport holders based on PassportIndex data';
COMMENT ON COLUMN visa_requirements.country_code IS 'ISO 3166-1 alpha-3 country code';
COMMENT ON COLUMN visa_requirements.visa_status IS 'Visa requirement status: visa-free, visa-on-arrival, eta, evisa, visa-required, no-admission';
COMMENT ON COLUMN visa_requirements.allowed_stay IS 'Duration allowed for visa-free or visa-on-arrival (e.g., 90 days, 30 days)';
COMMENT ON COLUMN visa_requirements.conditions IS 'Special conditions, restrictions, or requirements';
COMMENT ON COLUMN visa_requirements.passport_index_score IS 'PassportIndex mobility score (0-199)';
COMMENT ON COLUMN visa_requirements.visa_cost IS 'Cost of visa if required';
COMMENT ON COLUMN visa_requirements.processing_time IS 'Visa processing time';
COMMENT ON COLUMN visa_requirements.application_method IS 'How to apply: online, embassy, on-arrival, not-required';
COMMENT ON COLUMN visa_requirements.application_url IS 'URL for online visa application';

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_visa_requirements_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_visa_requirements_updated_at
  BEFORE UPDATE ON visa_requirements
  FOR EACH ROW
  EXECUTE FUNCTION update_visa_requirements_updated_at();

-- Add RLS (Row Level Security) policies
ALTER TABLE visa_requirements ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read access to visa requirements"
  ON visa_requirements
  FOR SELECT
  TO public
  USING (true);

-- Allow authenticated users to insert/update (for admin panel)
CREATE POLICY "Allow authenticated users to manage visa requirements"
  ON visa_requirements
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);
