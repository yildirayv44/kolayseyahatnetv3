-- ============================================
-- AI BLOG CONTENT SCHEDULING & VERSIONING
-- Enterprise Features Migration
-- ============================================

-- Add scheduling columns to ai_blog_content
ALTER TABLE ai_blog_content
ADD COLUMN IF NOT EXISTS scheduled_publish_date DATE,
ADD COLUMN IF NOT EXISTS auto_publish BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS publish_order INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS version INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS edit_history JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS custom_images JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS ai_refinement_instructions TEXT,
ADD COLUMN IF NOT EXISTS keyword_density DECIMAL(5,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS main_page_links_count INTEGER DEFAULT 0;

-- Create index for scheduled publishing
CREATE INDEX IF NOT EXISTS idx_ai_blog_content_scheduled 
ON ai_blog_content(scheduled_publish_date, auto_publish, status) 
WHERE auto_publish = true AND status = 'approved';

-- Create index for publish order
CREATE INDEX IF NOT EXISTS idx_ai_blog_content_publish_order 
ON ai_blog_content(publish_order, scheduled_publish_date);

-- Add scheduling columns to ai_blog_plans
ALTER TABLE ai_blog_plans
ADD COLUMN IF NOT EXISTS start_publish_date DATE,
ADD COLUMN IF NOT EXISTS publish_frequency TEXT DEFAULT 'daily' CHECK (publish_frequency IN ('daily', 'weekly', 'custom')),
ADD COLUMN IF NOT EXISTS auto_schedule BOOLEAN DEFAULT false;

-- Function to calculate keyword density
CREATE OR REPLACE FUNCTION calculate_keyword_density(content_text TEXT, keywords TEXT[])
RETURNS DECIMAL AS $$
DECLARE
  total_words INTEGER;
  keyword_count INTEGER := 0;
  keyword TEXT;
BEGIN
  -- Count total words
  total_words := array_length(regexp_split_to_array(lower(content_text), '\s+'), 1);
  
  -- Count keyword occurrences
  FOREACH keyword IN ARRAY keywords
  LOOP
    keyword_count := keyword_count + (
      SELECT COUNT(*)
      FROM regexp_matches(lower(content_text), lower(keyword), 'g')
    );
  END LOOP;
  
  -- Calculate density (keyword_count / total_words * 100)
  IF total_words > 0 THEN
    RETURN ROUND((keyword_count::DECIMAL / total_words * 100), 2);
  ELSE
    RETURN 0;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to auto-schedule content
CREATE OR REPLACE FUNCTION auto_schedule_content()
RETURNS TRIGGER AS $$
DECLARE
  plan_start_date DATE;
  content_order INTEGER;
BEGIN
  -- Get plan start date and content order
  SELECT start_publish_date INTO plan_start_date
  FROM ai_blog_plans
  WHERE id = (
    SELECT plan_id FROM ai_blog_topics WHERE id = NEW.topic_id
  );
  
  -- Get content order (how many contents already scheduled for this plan)
  SELECT COUNT(*) INTO content_order
  FROM ai_blog_content
  WHERE topic_id IN (
    SELECT id FROM ai_blog_topics WHERE plan_id = (
      SELECT plan_id FROM ai_blog_topics WHERE id = NEW.topic_id
    )
  );
  
  -- Set scheduled date and order
  IF plan_start_date IS NOT NULL AND NEW.auto_publish = true THEN
    NEW.scheduled_publish_date := plan_start_date + (content_order || ' days')::INTERVAL;
    NEW.publish_order := content_order;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for auto-scheduling
DROP TRIGGER IF EXISTS auto_schedule_content_trigger ON ai_blog_content;
CREATE TRIGGER auto_schedule_content_trigger
  BEFORE INSERT OR UPDATE OF auto_publish ON ai_blog_content
  FOR EACH ROW
  WHEN (NEW.auto_publish = true)
  EXECUTE FUNCTION auto_schedule_content();

-- Function to update keyword density on content change
CREATE OR REPLACE FUNCTION update_keyword_density()
RETURNS TRIGGER AS $$
BEGIN
  NEW.keyword_density := calculate_keyword_density(
    NEW.content,
    NEW.target_keywords
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for keyword density calculation
DROP TRIGGER IF EXISTS update_keyword_density_trigger ON ai_blog_content;
CREATE TRIGGER update_keyword_density_trigger
  BEFORE INSERT OR UPDATE OF content, target_keywords ON ai_blog_content
  FOR EACH ROW
  EXECUTE FUNCTION update_keyword_density();

-- Create content versions table for edit history
CREATE TABLE IF NOT EXISTS ai_blog_content_versions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content_id UUID REFERENCES ai_blog_content(id) ON DELETE CASCADE,
  version INTEGER NOT NULL,
  content TEXT NOT NULL,
  meta_title TEXT,
  meta_description TEXT,
  cover_image_url TEXT,
  custom_images JSONB DEFAULT '[]',
  changes_summary TEXT,
  changed_by UUID,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(content_id, version)
);

CREATE INDEX IF NOT EXISTS idx_content_versions_content ON ai_blog_content_versions(content_id);
CREATE INDEX IF NOT EXISTS idx_content_versions_created ON ai_blog_content_versions(created_at DESC);

-- Function to save content version before update
CREATE OR REPLACE FUNCTION save_content_version()
RETURNS TRIGGER AS $$
BEGIN
  -- Only save version if content actually changed
  IF OLD.content IS DISTINCT FROM NEW.content OR 
     OLD.meta_title IS DISTINCT FROM NEW.meta_title OR
     OLD.meta_description IS DISTINCT FROM NEW.meta_description THEN
    
    INSERT INTO ai_blog_content_versions (
      content_id,
      version,
      content,
      meta_title,
      meta_description,
      cover_image_url,
      custom_images,
      changes_summary
    ) VALUES (
      OLD.id,
      OLD.version,
      OLD.content,
      OLD.meta_title,
      OLD.meta_description,
      OLD.cover_image_url,
      OLD.custom_images,
      'Version saved before update'
    );
    
    -- Increment version
    NEW.version := OLD.version + 1;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for version saving
DROP TRIGGER IF EXISTS save_content_version_trigger ON ai_blog_content;
CREATE TRIGGER save_content_version_trigger
  BEFORE UPDATE ON ai_blog_content
  FOR EACH ROW
  EXECUTE FUNCTION save_content_version();

-- RLS policies for new tables
ALTER TABLE ai_blog_content_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role has full access to content versions" 
ON ai_blog_content_versions FOR ALL USING (true);

-- Add comments
COMMENT ON COLUMN ai_blog_content.scheduled_publish_date IS 'Date when content should be auto-published';
COMMENT ON COLUMN ai_blog_content.auto_publish IS 'Enable automatic publishing on scheduled date';
COMMENT ON COLUMN ai_blog_content.publish_order IS 'Order in which content should be published';
COMMENT ON COLUMN ai_blog_content.version IS 'Current version number of content';
COMMENT ON COLUMN ai_blog_content.edit_history IS 'JSON array of edit timestamps and summaries';
COMMENT ON COLUMN ai_blog_content.custom_images IS 'JSON array of custom images added to content';
COMMENT ON COLUMN ai_blog_content.keyword_density IS 'Percentage of target keywords in content';
COMMENT ON COLUMN ai_blog_content.main_page_links_count IS 'Number of links to main country page';

COMMENT ON TABLE ai_blog_content_versions IS 'Version history for content edits';

-- ============================================
-- MIGRATION COMPLETE
-- New features:
-- - Content scheduling with auto-publish
-- - Version control and edit history
-- - Keyword density tracking
-- - Custom image management
-- - Daily publication ordering
-- ============================================
