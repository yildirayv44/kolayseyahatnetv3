-- ============================================================================
-- CRITICAL: RLS Policy Fix for visa_pages_seo
-- Bu SQL'i Supabase Dashboard SQL Editor'da çalıştırın
-- Hata: new row violates row-level security policy for table "visa_pages_seo"
-- ============================================================================

-- 1. Mevcut policy'leri sil
DROP POLICY IF EXISTS "Allow authenticated users to manage visa pages" ON visa_pages_seo;
DROP POLICY IF EXISTS "Allow public read access to published visa pages" ON visa_pages_seo;
DROP POLICY IF EXISTS "Allow authenticated users full access to visa pages" ON visa_pages_seo;

-- 2. Authenticated kullanıcılar için tam erişim (INSERT, UPDATE, DELETE)
CREATE POLICY "Allow authenticated users full access to visa pages"
  ON visa_pages_seo
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- 3. Public kullanıcılar için sadece okuma erişimi
CREATE POLICY "Allow public read access to published visa pages"
  ON visa_pages_seo
  FOR SELECT
  TO public
  USING (content_status = 'published' OR content_status = 'generated');

-- 4. RLS'nin aktif olduğundan emin ol
ALTER TABLE visa_pages_seo ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- BAŞARILI! Artık bilateral vize sayfaları oluşturabilirsiniz.
-- Test: http://localhost:3000/admin/ulkeler/27/bilateral-vize
-- ============================================================================
