-- Fix: blogs tablosu için RLS politikaları
-- Hata: "new row violates row-level security policy for table blogs"
-- Çözüm: Authenticated (giriş yapmış) kullanıcılar için INSERT, UPDATE, DELETE izinleri ekleniyor.
-- Admin kontrolü users tablosundaki is_admin=1 alanıyla frontend'de yapılıyor.

-- Mevcut politikaları temizle (varsa)
DROP POLICY IF EXISTS "blogs_select_public" ON blogs;
DROP POLICY IF EXISTS "blogs_insert_authenticated" ON blogs;
DROP POLICY IF EXISTS "blogs_update_authenticated" ON blogs;
DROP POLICY IF EXISTS "blogs_delete_authenticated" ON blogs;

-- RLS aktif değilse aktif et
ALTER TABLE blogs ENABLE ROW LEVEL SECURITY;

-- 1. Herkese okuma izni (public blog okuyabilsin)
CREATE POLICY "blogs_select_public"
  ON blogs
  FOR SELECT
  USING (true);

-- 2. Giriş yapmış kullanıcılara INSERT izni (admin kontrolü frontend'de)
CREATE POLICY "blogs_insert_authenticated"
  ON blogs
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- 3. Giriş yapmış kullanıcılara UPDATE izni
CREATE POLICY "blogs_update_authenticated"
  ON blogs
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- 4. Giriş yapmış kullanıcılara DELETE izni
CREATE POLICY "blogs_delete_authenticated"
  ON blogs
  FOR DELETE
  TO authenticated
  USING (true);
