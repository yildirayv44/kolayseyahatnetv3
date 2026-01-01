-- Add person_count, total_amount, and currency rate fields to applications table
-- Migration: add_person_count_total_amount_and_currency_rates
-- Created: 2026-01-01

ALTER TABLE applications
ADD COLUMN IF NOT EXISTS person_count INTEGER DEFAULT 1 CHECK (person_count >= 1 AND person_count <= 10),
ADD COLUMN IF NOT EXISTS total_amount DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS package_currency TEXT,
ADD COLUMN IF NOT EXISTS usd_rate DECIMAL(10, 4),
ADD COLUMN IF NOT EXISTS eur_rate DECIMAL(10, 4),
ADD COLUMN IF NOT EXISTS tl_amount DECIMAL(10, 2);

-- Add comments for documentation
COMMENT ON COLUMN applications.person_count IS 'Number of people for this application (1-10)';
COMMENT ON COLUMN applications.total_amount IS 'Total amount to be paid (package price × person count)';
COMMENT ON COLUMN applications.package_currency IS 'Currency of the package (TRY, USD, EUR)';
COMMENT ON COLUMN applications.usd_rate IS 'USD selling rate at the time of application (TCMB)';
COMMENT ON COLUMN applications.eur_rate IS 'EUR selling rate at the time of application (TCMB)';
COMMENT ON COLUMN applications.tl_amount IS 'Total amount in Turkish Lira (converted using rates)';

-- Create index for queries
CREATE INDEX IF NOT EXISTS idx_applications_person_count ON applications(person_count);
