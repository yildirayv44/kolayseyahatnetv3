-- Migration: Expand products table for multi-source visa packages
-- Created: 2026-03-20
-- Purpose: Add source_country_code to support visa packages from any country to any country

-- Add source_country_code column (nullable to preserve existing data)
ALTER TABLE products ADD COLUMN IF NOT EXISTS source_country_code VARCHAR(3) DEFAULT 'TUR';

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_products_source_country ON products(source_country_code);
CREATE INDEX IF NOT EXISTS idx_products_source_destination ON products(source_country_code, country_id);

-- Add comment for documentation
COMMENT ON COLUMN products.source_country_code IS 'ISO 3166-1 alpha-3 code of source country (passport holder). Default TUR for Turkey.';

-- Update all existing products to be Turkey-sourced
UPDATE products SET source_country_code = 'TUR' WHERE source_country_code IS NULL;

-- Make source_country_code NOT NULL after setting defaults
ALTER TABLE products ALTER COLUMN source_country_code SET NOT NULL;
