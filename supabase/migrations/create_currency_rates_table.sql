-- Create currency_rates table for TCMB daily cache
-- Migration: create_currency_rates_table
-- Created: 2025-12-29

CREATE TABLE IF NOT EXISTS currency_rates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL UNIQUE,
  usd_buying NUMERIC(10, 4) NOT NULL,
  usd_selling NUMERIC(10, 4) NOT NULL,
  eur_buying NUMERIC(10, 4) NOT NULL,
  eur_selling NUMERIC(10, 4) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for fast date lookups
CREATE INDEX IF NOT EXISTS idx_currency_rates_date ON currency_rates(date DESC);

-- Add comment for documentation
COMMENT ON TABLE currency_rates IS 'Daily currency rates from TCMB (Turkish Central Bank)';
COMMENT ON COLUMN currency_rates.date IS 'Rate date (YYYY-MM-DD)';
COMMENT ON COLUMN currency_rates.usd_buying IS 'USD buying rate';
COMMENT ON COLUMN currency_rates.usd_selling IS 'USD selling rate';
COMMENT ON COLUMN currency_rates.eur_buying IS 'EUR buying rate';
COMMENT ON COLUMN currency_rates.eur_selling IS 'EUR selling rate';
