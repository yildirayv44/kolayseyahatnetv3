-- ============================================================================
-- INSERT Turkey with sorted value - RLS bypass using service role
-- Türkiye kaydını sorted değeri ile ekle
-- ============================================================================

-- NOT: Bu SQL'i Supabase Dashboard'da çalıştırın (service_role yetkisi ile)

DO $$
DECLARE
  max_sorted INTEGER;
BEGIN
  -- En yüksek sorted değerini bul
  SELECT COALESCE(MAX(sorted), 0) INTO max_sorted FROM countries;
  
  -- Türkiye kaydı var mı kontrol et
  IF EXISTS (SELECT 1 FROM countries WHERE country_code = 'TUR') THEN
    -- Varsa güncelle
    UPDATE countries 
    SET name = 'Türkiye',
        is_source_country = true,
        status = 1,
        flag_emoji = '🇹🇷',
        region = 'Middle East',
        sorted = COALESCE(sorted, max_sorted + 1)
    WHERE country_code = 'TUR';
    
    RAISE NOTICE 'Türkiye kaydı güncellendi';
  ELSE
    -- Yoksa ekle (sorted değeri ile)
    INSERT INTO countries (
      name,
      country_code,
      is_source_country,
      status,
      flag_emoji,
      region,
      sorted
    ) VALUES (
      'Türkiye',
      'TUR',
      true,
      1,
      '🇹🇷',
      'Middle East',
      max_sorted + 1
    );
    
    RAISE NOTICE 'Türkiye kaydı eklendi (sorted: %)', max_sorted + 1;
  END IF;
END $$;

-- Doğrulama
SELECT 
  id,
  name,
  country_code,
  is_source_country,
  status,
  sorted,
  flag_emoji,
  region
FROM countries 
WHERE country_code = 'TUR';

-- ============================================================================
-- Beklenen sonuç:
-- name: Türkiye
-- country_code: TUR
-- is_source_country: true
-- status: 1
-- sorted: (bir sayı)
-- flag_emoji: 🇹🇷
-- region: Middle East
-- ============================================================================
