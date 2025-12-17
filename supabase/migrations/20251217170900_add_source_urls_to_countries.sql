-- Add source_urls column to countries table for storing official visa information sources
ALTER TABLE countries ADD COLUMN IF NOT EXISTS source_urls jsonb DEFAULT '[]'::jsonb;

-- Add last_source_check column to track when sources were last analyzed
ALTER TABLE countries ADD COLUMN IF NOT EXISTS last_source_check timestamp with time zone;

-- Add source_check_notes column to store AI analysis notes
ALTER TABLE countries ADD COLUMN IF NOT EXISTS source_check_notes text;

-- Create a table for storing content update suggestions from AI
CREATE TABLE IF NOT EXISTS content_suggestions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  country_id bigint REFERENCES countries(id) ON DELETE CASCADE,
  suggestion_type text NOT NULL, -- 'visa_fee', 'requirements', 'documents', 'general', 'visa_status'
  field_name text, -- which field to update (e.g., 'visa_fee', 'required_documents', 'contents')
  current_value text,
  suggested_value text,
  source_url text,
  confidence_score numeric(3,2), -- 0.00 to 1.00
  status text DEFAULT 'pending', -- 'pending', 'approved', 'rejected', 'applied'
  created_at timestamp with time zone DEFAULT now(),
  reviewed_at timestamp with time zone,
  reviewed_by uuid,
  notes text
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_content_suggestions_country ON content_suggestions(country_id);
CREATE INDEX IF NOT EXISTS idx_content_suggestions_status ON content_suggestions(status);

-- Enable RLS
ALTER TABLE content_suggestions ENABLE ROW LEVEL SECURITY;

-- Create policy for authenticated users (admin)
CREATE POLICY "Allow all for authenticated users" ON content_suggestions
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Comment for documentation
COMMENT ON COLUMN countries.source_urls IS 'JSON array of official source URLs for visa information (e.g., embassy websites, e-visa portals)';
COMMENT ON COLUMN countries.last_source_check IS 'Timestamp of last AI analysis of source URLs';
COMMENT ON COLUMN countries.source_check_notes IS 'Notes from the last AI analysis';
COMMENT ON TABLE content_suggestions IS 'Stores AI-generated content update suggestions based on source URL analysis';
