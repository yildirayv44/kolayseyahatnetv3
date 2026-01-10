-- Fix auto-schedule trigger to not override manually set dates
-- The trigger should only set the date if it's not already set

CREATE OR REPLACE FUNCTION auto_schedule_content()
RETURNS TRIGGER AS $$
DECLARE
  plan_start_date DATE;
  content_order INTEGER;
BEGIN
  -- Only auto-schedule if scheduled_publish_date is NOT already set
  IF NEW.scheduled_publish_date IS NOT NULL THEN
    RETURN NEW;
  END IF;

  -- Get plan start date
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
  
  -- Set scheduled date and order ONLY if date is not already set
  IF plan_start_date IS NOT NULL AND NEW.auto_publish = true THEN
    NEW.scheduled_publish_date := plan_start_date + (content_order || ' days')::INTERVAL;
    NEW.publish_order := content_order;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreate trigger
DROP TRIGGER IF EXISTS auto_schedule_content_trigger ON ai_blog_content;
CREATE TRIGGER auto_schedule_content_trigger
  BEFORE INSERT OR UPDATE OF auto_publish ON ai_blog_content
  FOR EACH ROW
  WHEN (NEW.auto_publish = true)
  EXECUTE FUNCTION auto_schedule_content();
