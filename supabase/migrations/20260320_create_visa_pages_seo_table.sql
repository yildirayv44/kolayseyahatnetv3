-- Migration: Create visa_pages_seo table for AI-generated SEO content
-- Created: 2026-03-20
-- Purpose: Store SEO metadata and AI-generated content for source-destination visa pages

CREATE TABLE IF NOT EXISTS visa_pages_seo (
  id BIGSERIAL PRIMARY KEY,
  source_country_code VARCHAR(3) NOT NULL,
  destination_country_code VARCHAR(3) NOT NULL,
  locale VARCHAR(5) NOT NULL DEFAULT 'tr', -- tr, en
  
  -- SEO Metadata
  meta_title VARCHAR(255),
  meta_description TEXT,
  h1_title VARCHAR(255),
  
  -- AI-generated Content
  intro_text TEXT,
  requirements_section TEXT,
  process_section TEXT,
  faq_json JSONB, -- [{question: string, answer: string}]
  
  -- Content Status
  content_status VARCHAR(50) DEFAULT 'pending', -- pending, generated, reviewed, published
  generated_at TIMESTAMP WITH TIME ZONE,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  published_at TIMESTAMP WITH TIME ZONE,
  
  -- AI Generation Metadata
  ai_model VARCHAR(100), -- e.g., 'gpt-4', 'gemini-pro'
  generation_prompt TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(source_country_code, destination_country_code, locale)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_visa_pages_seo_lookup ON visa_pages_seo(source_country_code, destination_country_code);
CREATE INDEX IF NOT EXISTS idx_visa_pages_seo_status ON visa_pages_seo(content_status);
CREATE INDEX IF NOT EXISTS idx_visa_pages_seo_locale ON visa_pages_seo(locale);
CREATE INDEX IF NOT EXISTS idx_visa_pages_seo_published ON visa_pages_seo(published_at) WHERE published_at IS NOT NULL;

-- Add comments for documentation
COMMENT ON TABLE visa_pages_seo IS 'SEO metadata and AI-generated content for source-destination visa pages';
COMMENT ON COLUMN visa_pages_seo.content_status IS 'Content workflow status: pending, generated, reviewed, published';
COMMENT ON COLUMN visa_pages_seo.faq_json IS 'FAQ section as JSON array: [{question: string, answer: string}]';

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_visa_pages_seo_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_visa_pages_seo_updated_at ON visa_pages_seo;
CREATE TRIGGER trigger_visa_pages_seo_updated_at
  BEFORE UPDATE ON visa_pages_seo
  FOR EACH ROW
  EXECUTE FUNCTION update_visa_pages_seo_updated_at();

-- Add RLS policies
ALTER TABLE visa_pages_seo ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read access to published visa pages" ON visa_pages_seo;
DROP POLICY IF EXISTS "Allow authenticated users to manage visa pages" ON visa_pages_seo;

CREATE POLICY "Allow public read access to published visa pages"
  ON visa_pages_seo
  FOR SELECT
  TO public
  USING (content_status = 'published');

CREATE POLICY "Allow authenticated users to manage visa pages"
  ON visa_pages_seo
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);
