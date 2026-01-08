-- AI Blog Content Generation System
-- Created: 2026-01-09

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. AI Blog Plans Table
CREATE TABLE IF NOT EXISTS ai_blog_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  country_id INTEGER REFERENCES countries(id) ON DELETE CASCADE,
  country_name TEXT NOT NULL,
  country_slug TEXT NOT NULL,
  month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
  year INTEGER NOT NULL CHECK (year >= 2024),
  total_topics INTEGER DEFAULT 30,
  generated_topics INTEGER DEFAULT 0,
  approved_topics INTEGER DEFAULT 0,
  published_topics INTEGER DEFAULT 0,
  rejected_topics INTEGER DEFAULT 0,
  status TEXT DEFAULT 'planning' CHECK (status IN ('planning', 'generating', 'review', 'completed', 'cancelled')),
  data_sources JSONB DEFAULT '{}',
  created_by UUID,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP,
  UNIQUE(country_id, month, year)
);

CREATE INDEX idx_ai_blog_plans_status ON ai_blog_plans(status);
CREATE INDEX idx_ai_blog_plans_country ON ai_blog_plans(country_id);
CREATE INDEX idx_ai_blog_plans_created ON ai_blog_plans(created_at DESC);

-- 2. AI Blog Topics Table
CREATE TABLE IF NOT EXISTS ai_blog_topics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  plan_id UUID REFERENCES ai_blog_plans(id) ON DELETE CASCADE,
  country_id INTEGER REFERENCES countries(id),
  
  -- Content
  title TEXT NOT NULL,
  title_en TEXT,
  slug TEXT NOT NULL,
  description TEXT,
  
  -- Categorization
  category TEXT NOT NULL CHECK (category IN ('visa_procedures', 'travel_planning', 'practical_info', 'culture', 'comparison')),
  search_intent TEXT CHECK (search_intent IN ('informational', 'transactional', 'navigational')),
  content_angle TEXT,
  
  -- SEO Data
  target_keywords TEXT[],
  estimated_search_volume INTEGER DEFAULT 0,
  keyword_difficulty INTEGER DEFAULT 0 CHECK (keyword_difficulty >= 0 AND keyword_difficulty <= 100),
  
  -- Content Planning
  target_word_count INTEGER DEFAULT 1500,
  outline JSONB DEFAULT '[]',
  internal_link_opportunities JSONB DEFAULT '[]',
  
  -- Priority & Status
  priority INTEGER DEFAULT 0 CHECK (priority >= 0 AND priority <= 10),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'generating', 'review', 'approved', 'rejected', 'published')),
  rejection_reason TEXT,
  
  -- Metadata
  data_source TEXT,
  search_metrics JSONB DEFAULT '{}',
  reasoning TEXT,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_ai_blog_topics_plan ON ai_blog_topics(plan_id);
CREATE INDEX idx_ai_blog_topics_status ON ai_blog_topics(status);
CREATE INDEX idx_ai_blog_topics_priority ON ai_blog_topics(priority DESC);
CREATE INDEX idx_ai_blog_topics_slug ON ai_blog_topics(slug);

-- 3. AI Generated Blog Content Table
CREATE TABLE IF NOT EXISTS ai_blog_content (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  topic_id UUID REFERENCES ai_blog_topics(id) ON DELETE CASCADE,
  blog_id INTEGER REFERENCES blogs(id) ON DELETE SET NULL,
  
  -- Content
  title TEXT NOT NULL,
  title_en TEXT,
  slug TEXT NOT NULL,
  content TEXT NOT NULL,
  content_en TEXT,
  description TEXT,
  
  -- SEO
  meta_title TEXT NOT NULL,
  meta_description TEXT NOT NULL,
  target_keywords TEXT[],
  
  -- Image
  cover_image_url TEXT,
  cover_image_alt TEXT,
  pexels_image_id TEXT,
  pexels_photographer TEXT,
  pexels_photographer_url TEXT,
  
  -- Internal Links
  internal_links JSONB DEFAULT '[]',
  
  -- Quality Metrics
  word_count INTEGER DEFAULT 0,
  readability_score INTEGER DEFAULT 0 CHECK (readability_score >= 0 AND readability_score <= 100),
  seo_score INTEGER DEFAULT 0 CHECK (seo_score >= 0 AND seo_score <= 100),
  
  -- AI Metadata
  ai_model TEXT DEFAULT 'gpt-4',
  generation_prompt TEXT,
  generation_tokens INTEGER DEFAULT 0,
  generation_cost DECIMAL(10, 4) DEFAULT 0,
  
  -- Workflow
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'review', 'approved', 'published', 'rejected')),
  editor_notes TEXT,
  reviewed_by UUID,
  reviewed_at TIMESTAMP,
  published_at TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_ai_blog_content_topic ON ai_blog_content(topic_id);
CREATE INDEX idx_ai_blog_content_blog ON ai_blog_content(blog_id);
CREATE INDEX idx_ai_blog_content_status ON ai_blog_content(status);
CREATE INDEX idx_ai_blog_content_slug ON ai_blog_content(slug);
CREATE INDEX idx_ai_blog_content_created ON ai_blog_content(created_at DESC);

-- 4. Content Performance Tracking Table
CREATE TABLE IF NOT EXISTS ai_blog_performance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  blog_id INTEGER REFERENCES blogs(id) ON DELETE CASCADE,
  content_id UUID REFERENCES ai_blog_content(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  
  -- Traffic Metrics
  views INTEGER DEFAULT 0,
  unique_visitors INTEGER DEFAULT 0,
  avg_time_on_page INTEGER DEFAULT 0,
  bounce_rate DECIMAL(5,2) DEFAULT 0,
  
  -- Engagement
  conversions INTEGER DEFAULT 0,
  internal_link_clicks INTEGER DEFAULT 0,
  
  -- SEO
  organic_traffic INTEGER DEFAULT 0,
  ranking_keywords JSONB DEFAULT '[]',
  avg_position DECIMAL(5,2),
  
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(blog_id, date)
);

CREATE INDEX idx_ai_blog_performance_blog ON ai_blog_performance(blog_id);
CREATE INDEX idx_ai_blog_performance_date ON ai_blog_performance(date DESC);

-- 5. Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- 6. Create triggers for updated_at
CREATE TRIGGER update_ai_blog_plans_updated_at BEFORE UPDATE ON ai_blog_plans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ai_blog_topics_updated_at BEFORE UPDATE ON ai_blog_topics
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ai_blog_content_updated_at BEFORE UPDATE ON ai_blog_content
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 7. Create function to update plan statistics
CREATE OR REPLACE FUNCTION update_plan_statistics()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE ai_blog_plans
  SET 
    generated_topics = (SELECT COUNT(*) FROM ai_blog_topics WHERE plan_id = NEW.plan_id),
    approved_topics = (SELECT COUNT(*) FROM ai_blog_topics WHERE plan_id = NEW.plan_id AND status = 'approved'),
    published_topics = (SELECT COUNT(*) FROM ai_blog_topics WHERE plan_id = NEW.plan_id AND status = 'published'),
    rejected_topics = (SELECT COUNT(*) FROM ai_blog_topics WHERE plan_id = NEW.plan_id AND status = 'rejected')
  WHERE id = NEW.plan_id;
  
  RETURN NEW;
END;
$$ language 'plpgsql';

-- 8. Create trigger to auto-update plan statistics
CREATE TRIGGER update_plan_stats_on_topic_change 
  AFTER INSERT OR UPDATE OF status ON ai_blog_topics
  FOR EACH ROW EXECUTE FUNCTION update_plan_statistics();

-- Comments for documentation
COMMENT ON TABLE ai_blog_plans IS 'Stores AI blog content generation plans for each country and month';
COMMENT ON TABLE ai_blog_topics IS 'Stores individual blog topics generated by AI with SEO data';
COMMENT ON TABLE ai_blog_content IS 'Stores full AI-generated blog content with metadata';
COMMENT ON TABLE ai_blog_performance IS 'Tracks performance metrics for published AI-generated content';
