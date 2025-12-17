-- Add is_manual_content column to countries table
ALTER TABLE countries ADD COLUMN IF NOT EXISTS is_manual_content BOOLEAN DEFAULT FALSE;

-- Mark manual content countries
UPDATE countries SET is_manual_content = TRUE WHERE name IN (
  'Yunanistan',
  'Güney Kore',
  'Amerika',
  'İngiltere',
  'Kuveyt',
  'Dubai',
  'Kenya'
);

-- Also try with country codes in case names don't match exactly
UPDATE countries SET is_manual_content = TRUE WHERE country_code IN (
  'GRC',  -- Yunanistan
  'KOR',  -- Güney Kore
  'USA',  -- Amerika
  'GBR',  -- İngiltere
  'KWT',  -- Kuveyt
  'ARE',  -- Dubai (BAE)
  'KEN'   -- Kenya
);
