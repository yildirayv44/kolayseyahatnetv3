-- Fix duplicate objects from partial migration
-- Run this if you get "already exists" errors

-- Drop and recreate policy if needed
DROP POLICY IF EXISTS "Service role has full access to content versions" ON ai_blog_content_versions;
CREATE POLICY "Service role has full access to content versions" 
ON ai_blog_content_versions FOR ALL USING (true);

-- Ensure all columns exist in ai_blog_content
DO $$ 
BEGIN
  -- Add columns if they don't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='ai_blog_content' AND column_name='scheduled_publish_date') THEN
    ALTER TABLE ai_blog_content ADD COLUMN scheduled_publish_date DATE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='ai_blog_content' AND column_name='auto_publish') THEN
    ALTER TABLE ai_blog_content ADD COLUMN auto_publish BOOLEAN DEFAULT false;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='ai_blog_content' AND column_name='publish_order') THEN
    ALTER TABLE ai_blog_content ADD COLUMN publish_order INTEGER DEFAULT 0;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='ai_blog_content' AND column_name='version') THEN
    ALTER TABLE ai_blog_content ADD COLUMN version INTEGER DEFAULT 1;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='ai_blog_content' AND column_name='edit_history') THEN
    ALTER TABLE ai_blog_content ADD COLUMN edit_history JSONB DEFAULT '[]';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='ai_blog_content' AND column_name='custom_images') THEN
    ALTER TABLE ai_blog_content ADD COLUMN custom_images JSONB DEFAULT '[]';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='ai_blog_content' AND column_name='ai_refinement_instructions') THEN
    ALTER TABLE ai_blog_content ADD COLUMN ai_refinement_instructions TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='ai_blog_content' AND column_name='keyword_density') THEN
    ALTER TABLE ai_blog_content ADD COLUMN keyword_density DECIMAL(5,2) DEFAULT 0;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='ai_blog_content' AND column_name='main_page_links_count') THEN
    ALTER TABLE ai_blog_content ADD COLUMN main_page_links_count INTEGER DEFAULT 0;
  END IF;
END $$;

-- Ensure all columns exist in ai_blog_plans
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='ai_blog_plans' AND column_name='start_publish_date') THEN
    ALTER TABLE ai_blog_plans ADD COLUMN start_publish_date DATE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='ai_blog_plans' AND column_name='publish_frequency') THEN
    ALTER TABLE ai_blog_plans ADD COLUMN publish_frequency TEXT DEFAULT 'daily' 
    CHECK (publish_frequency IN ('daily', 'weekly', 'custom'));
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='ai_blog_plans' AND column_name='auto_schedule') THEN
    ALTER TABLE ai_blog_plans ADD COLUMN auto_schedule BOOLEAN DEFAULT false;
  END IF;
END $$;

-- Verify tables exist
SELECT 'ai_blog_plans exists' as status WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'ai_blog_plans');
SELECT 'ai_blog_topics exists' as status WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'ai_blog_topics');
SELECT 'ai_blog_content exists' as status WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'ai_blog_content');
SELECT 'ai_blog_content_versions exists' as status WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'ai_blog_content_versions');
