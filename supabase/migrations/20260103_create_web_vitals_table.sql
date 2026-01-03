-- Create web_vitals table for performance monitoring
CREATE TABLE IF NOT EXISTS public.web_vitals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_name TEXT NOT NULL, -- CLS, FID, LCP, FCP, TTFB, INP
  metric_value NUMERIC NOT NULL,
  metric_rating TEXT, -- good, needs-improvement, poor
  page_url TEXT NOT NULL,
  user_agent TEXT,
  connection_type TEXT,
  device_type TEXT, -- mobile, desktop, tablet
  locale TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_web_vitals_metric_name ON public.web_vitals(metric_name);
CREATE INDEX IF NOT EXISTS idx_web_vitals_created_at ON public.web_vitals(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_web_vitals_page_url ON public.web_vitals(page_url);
CREATE INDEX IF NOT EXISTS idx_web_vitals_rating ON public.web_vitals(metric_rating);
CREATE INDEX IF NOT EXISTS idx_web_vitals_device_type ON public.web_vitals(device_type);
CREATE INDEX IF NOT EXISTS idx_web_vitals_locale ON public.web_vitals(locale);

-- Enable RLS
ALTER TABLE public.web_vitals ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Anyone can insert web vitals (for client-side reporting)
CREATE POLICY "Anyone can insert web vitals"
  ON public.web_vitals
  FOR INSERT
  WITH CHECK (true);

-- Only authenticated users can read web vitals
CREATE POLICY "Authenticated users can read web vitals"
  ON public.web_vitals
  FOR SELECT
  TO authenticated
  USING (true);

-- Create materialized view for aggregated stats
CREATE MATERIALIZED VIEW IF NOT EXISTS public.web_vitals_summary AS
SELECT 
  metric_name,
  metric_rating,
  device_type,
  locale,
  COUNT(*) as count,
  AVG(metric_value) as avg_value,
  PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY metric_value) as p75_value,
  PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY metric_value) as p95_value,
  MIN(metric_value) as min_value,
  MAX(metric_value) as max_value,
  DATE_TRUNC('day', created_at) as date
FROM public.web_vitals
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY metric_name, metric_rating, device_type, locale, DATE_TRUNC('day', created_at);

-- Create index on materialized view
CREATE INDEX IF NOT EXISTS idx_web_vitals_summary_date ON public.web_vitals_summary(date DESC);
CREATE INDEX IF NOT EXISTS idx_web_vitals_summary_metric ON public.web_vitals_summary(metric_name);

-- Function to refresh materialized view
CREATE OR REPLACE FUNCTION refresh_web_vitals_summary()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.web_vitals_summary;
END;
$$ LANGUAGE plpgsql;

-- Schedule automatic refresh (requires pg_cron extension)
-- This will refresh the summary every hour
-- Uncomment if pg_cron is available:
-- SELECT cron.schedule('refresh-web-vitals', '0 * * * *', 'SELECT refresh_web_vitals_summary()');
