-- Quick verification script
-- Run this in Supabase Dashboard SQL Editor

-- 1. Check if tables exist
SELECT 
  'ai_blog_plans' as table_name,
  EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'ai_blog_plans') as exists
UNION ALL
SELECT 
  'ai_blog_topics',
  EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'ai_blog_topics')
UNION ALL
SELECT 
  'ai_blog_content',
  EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'ai_blog_content');

-- 2. If tables exist, try a simple insert test
DO $$
BEGIN
  -- Test insert (will rollback)
  INSERT INTO ai_blog_topics (
    plan_id,
    country_id,
    title,
    slug,
    category,
    status
  ) VALUES (
    '00000000-0000-0000-0000-000000000000'::uuid,
    1,
    'Test Topic',
    'test-topic',
    'travel_planning',
    'pending'
  );
  
  RAISE NOTICE 'Insert test successful!';
  
  -- Rollback test data
  RAISE EXCEPTION 'Rolling back test insert';
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Error: %', SQLERRM;
END $$;
