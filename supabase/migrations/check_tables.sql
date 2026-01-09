-- Check if all required tables and columns exist

-- Check tables
SELECT 
  table_name,
  CASE 
    WHEN table_name IN ('ai_blog_plans', 'ai_blog_topics', 'ai_blog_content', 'ai_blog_content_versions') 
    THEN '✅ EXISTS'
    ELSE '❌ MISSING'
  END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('ai_blog_plans', 'ai_blog_topics', 'ai_blog_content', 'ai_blog_content_versions')
ORDER BY table_name;

-- Check ai_blog_topics columns
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'ai_blog_topics'
ORDER BY ordinal_position;

-- Check RLS policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies 
WHERE tablename IN ('ai_blog_plans', 'ai_blog_topics', 'ai_blog_content')
ORDER BY tablename, policyname;
