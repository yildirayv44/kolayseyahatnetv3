-- Migration: Add scraping logs table for tracking visa data scraping
-- ============================================================================

-- Create scraping_logs table
CREATE TABLE IF NOT EXISTS scraping_logs (
  id BIGSERIAL PRIMARY KEY,
  source_country_code VARCHAR(3) NOT NULL,
  source_country_name VARCHAR(255),
  status VARCHAR(50) NOT NULL, -- 'pending', 'in_progress', 'completed', 'failed'
  countries_scraped INTEGER DEFAULT 0,
  countries_total INTEGER DEFAULT 0,
  errors TEXT,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_scraping_logs_country ON scraping_logs(source_country_code);
CREATE INDEX IF NOT EXISTS idx_scraping_logs_status ON scraping_logs(status);
CREATE INDEX IF NOT EXISTS idx_scraping_logs_created ON scraping_logs(created_at DESC);

-- Add comments
COMMENT ON TABLE scraping_logs IS 'Logs for visa requirements scraping operations';
COMMENT ON COLUMN scraping_logs.source_country_code IS 'ISO 3166-1 alpha-3 country code';
COMMENT ON COLUMN scraping_logs.status IS 'Current status of the scraping operation';
COMMENT ON COLUMN scraping_logs.countries_scraped IS 'Number of countries successfully scraped';
COMMENT ON COLUMN scraping_logs.countries_total IS 'Total number of countries to scrape';

-- ============================================================================
