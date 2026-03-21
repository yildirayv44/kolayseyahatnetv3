-- Fix RLS policies for countries table to allow public read access
-- This is needed for bilateral visa page generation

-- Enable RLS if not already enabled
ALTER TABLE countries ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Allow public read access to countries" ON countries;
DROP POLICY IF EXISTS "Allow authenticated users to manage countries" ON countries;

-- Create public read policy
CREATE POLICY "Allow public read access to countries"
  ON countries
  FOR SELECT
  TO public
  USING (true);

-- Create authenticated write policy
CREATE POLICY "Allow authenticated users to manage countries"
  ON countries
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Verify policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'countries';
