-- Create custom_pages table for custom page management
CREATE TABLE IF NOT EXISTS public.custom_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  title_en TEXT,
  content TEXT NOT NULL,
  content_en TEXT,
  meta_description TEXT,
  meta_description_en TEXT,
  is_published BOOLEAN DEFAULT false,
  show_in_menu BOOLEAN DEFAULT false,
  menu_order INTEGER DEFAULT 0,
  page_type TEXT DEFAULT 'custom', -- custom, legal, corporate, etc.
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_custom_pages_slug ON public.custom_pages(slug);
CREATE INDEX IF NOT EXISTS idx_custom_pages_published ON public.custom_pages(is_published);
CREATE INDEX IF NOT EXISTS idx_custom_pages_type ON public.custom_pages(page_type);

-- Enable RLS
ALTER TABLE public.custom_pages ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Public can read published pages
CREATE POLICY "Public can read published custom pages"
  ON public.custom_pages
  FOR SELECT
  USING (is_published = true);

-- Authenticated users can read all pages
CREATE POLICY "Authenticated users can read all custom pages"
  ON public.custom_pages
  FOR SELECT
  TO authenticated
  USING (true);

-- Authenticated users can insert pages
CREATE POLICY "Authenticated users can insert custom pages"
  ON public.custom_pages
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Authenticated users can update pages
CREATE POLICY "Authenticated users can update custom pages"
  ON public.custom_pages
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Authenticated users can delete pages
CREATE POLICY "Authenticated users can delete custom pages"
  ON public.custom_pages
  FOR DELETE
  TO authenticated
  USING (true);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_custom_pages_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER update_custom_pages_updated_at_trigger
  BEFORE UPDATE ON public.custom_pages
  FOR EACH ROW
  EXECUTE FUNCTION update_custom_pages_updated_at();

-- Insert some default pages (optional)
INSERT INTO public.custom_pages (slug, title, title_en, content, content_en, is_published, page_type, show_in_menu)
VALUES 
  ('kvkk', 'KVKK - Kişisel Verilerin Korunması', 'GDPR - Personal Data Protection', 
   '<p>KVKK içeriği buraya gelecek</p>', '<p>GDPR content here</p>', 
   true, 'legal', false),
  ('bilgi-gizliligi', 'Bilgi Gizliliği Politikası', 'Privacy Policy', 
   '<p>Gizlilik politikası içeriği</p>', '<p>Privacy policy content</p>', 
   true, 'legal', false),
  ('neden-biz', 'Neden Kolay Seyahat?', 'Why Choose Us?', 
   '<p>Neden biz içeriği</p>', '<p>Why us content</p>', 
   true, 'corporate', true)
ON CONFLICT (slug) DO NOTHING;
