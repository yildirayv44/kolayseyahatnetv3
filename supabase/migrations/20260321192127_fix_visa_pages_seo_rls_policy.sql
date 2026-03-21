-- ============================================================================
-- Fix RLS Policy for visa_pages_seo table
-- Allows authenticated users to INSERT bilateral visa pages
-- ============================================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Allow authenticated users to manage visa pages" ON visa_pages_seo;
DROP POLICY IF EXISTS "Allow public read access to published visa pages" ON visa_pages_seo;

-- Create new policy for authenticated users (full access)
CREATE POLICY "Allow authenticated users full access to visa pages"
  ON visa_pages_seo
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create policy for public read access
CREATE POLICY "Allow public read access to published visa pages"
  ON visa_pages_seo
  FOR SELECT
  TO public
  USING (content_status = 'published' OR content_status = 'generated');

-- Ensure RLS is enabled
ALTER TABLE visa_pages_seo ENABLE ROW LEVEL SECURITY;
