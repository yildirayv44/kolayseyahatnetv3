-- ============================================================================
-- INSERT Turkey Record - Türkiye kaydını ekle
-- ============================================================================

-- Türkiye kaydını ekle (eğer yoksa)
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
)
ON CONFLICT (country_code) DO UPDATE SET
  name = 'Türkiye',
  is_source_country = true,
  status = 1,
  flag_emoji = '🇹🇷',
  region = 'Middle East';

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
