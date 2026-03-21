-- ============================================================================
-- INSERT Turkey Record - Fixed Version
-- Türkiye kaydını ekle - Düzeltilmiş versiyon
-- ============================================================================

-- Önce Türkiye kaydını kontrol et
SELECT id, name, country_code, is_source_country, status
FROM countries 
WHERE country_code = 'TUR';

-- Eğer kayıt varsa güncelle, yoksa ekle (UPSERT yerine IF kullan)
DO $$
BEGIN
  -- Türkiye kaydı var mı kontrol et
  IF EXISTS (SELECT 1 FROM countries WHERE country_code = 'TUR') THEN
    -- Varsa güncelle
    UPDATE countries 
    SET name = 'Türkiye',
        is_source_country = true,
        status = 1,
        flag_emoji = '🇹🇷',
        region = 'Middle East'
    WHERE country_code = 'TUR';
    
    RAISE NOTICE 'Türkiye kaydı güncellendi';
  ELSE
    -- Yoksa ekle
    INSERT INTO countries (
      name,
      country_code,
      is_source_country,
      status,
      flag_emoji,
      region
    ) VALUES (
      'Türkiye',
      'TUR',
      true,
      1,
      '🇹🇷',
      'Middle East'
    );
    
    RAISE NOTICE 'Türkiye kaydı eklendi';
  END IF;
END $$;

-- Doğrulama
SELECT 
  id,
  name,
  country_code,
  is_source_country,
  status,
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
-- flag_emoji: 🇹🇷
-- region: Middle East
-- ============================================================================
