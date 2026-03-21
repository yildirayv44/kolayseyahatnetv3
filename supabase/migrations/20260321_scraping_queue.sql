-- ============================================================================
-- Scraping Queue System
-- Background job processing for batch visa data scraping
-- ============================================================================

-- Create scraping_queue table
CREATE TABLE IF NOT EXISTS scraping_queue (
  id SERIAL PRIMARY KEY,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, processing, completed, failed, cancelled
  total_countries INT NOT NULL,
  processed_countries INT NOT NULL DEFAULT 0,
  successful_countries INT NOT NULL DEFAULT 0,
  failed_countries INT NOT NULL DEFAULT 0,
  current_country_code TEXT,
  current_country_name TEXT,
  error_message TEXT,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index for status queries
CREATE INDEX IF NOT EXISTS idx_scraping_queue_status ON scraping_queue(status);
CREATE INDEX IF NOT EXISTS idx_scraping_queue_created_at ON scraping_queue(created_at DESC);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_scraping_queue_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER scraping_queue_updated_at
  BEFORE UPDATE ON scraping_queue
  FOR EACH ROW
  EXECUTE FUNCTION update_scraping_queue_updated_at();

-- Enable RLS
ALTER TABLE scraping_queue ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Allow service role full access to scraping_queue"
  ON scraping_queue
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to read scraping_queue"
  ON scraping_queue
  FOR SELECT
  TO authenticated
  USING (true);

-- Comments
COMMENT ON TABLE scraping_queue IS 'Queue for background batch visa data scraping jobs';
COMMENT ON COLUMN scraping_queue.status IS 'Job status: pending, processing, completed, failed, cancelled';
COMMENT ON COLUMN scraping_queue.total_countries IS 'Total number of countries to process';
COMMENT ON COLUMN scraping_queue.processed_countries IS 'Number of countries processed so far';
COMMENT ON COLUMN scraping_queue.successful_countries IS 'Number of countries successfully scraped';
COMMENT ON COLUMN scraping_queue.failed_countries IS 'Number of countries that failed';
COMMENT ON COLUMN scraping_queue.current_country_code IS 'Currently processing country code';
COMMENT ON COLUMN scraping_queue.current_country_name IS 'Currently processing country name';
