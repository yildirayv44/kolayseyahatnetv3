-- Test: Create a bilateral visa page for Turkey -> USA
-- Run this in Supabase SQL Editor after running the migration

-- First, make sure the migration is applied
-- Then insert a test page

INSERT INTO visa_pages_seo (
  source_country_code,
  destination_country_code,
  locale,
  slug,
  meta_title,
  meta_description,
  h1_title,
  intro_text,
  requirements_section,
  process_section,
  faq_json,
  content_status,
  generated_at,
  ai_model
) VALUES (
  'TUR',
  'USA',
  'tr',
  'turkiye-amerika-vize',
  'Türkiye - Amerika Vize Başvurusu | Kolay Seyahat',
  'Türk vatandaşları için Amerika vize gereklilikleri, başvuru süreci ve gerekli belgeler. Vize gerekli. Detaylı bilgi için tıklayın.',
  'Türkiye''den Amerika''ya Vize Başvurusu',
  '<p>Türk vatandaşları Amerika''ya seyahat etmek için vize başvurusu yapmaları gerekmektedir. İşlem süresi yaklaşık 2-4 hafta.</p><p>Bu sayfada Amerika vizesi için gerekli belgeler, başvuru süreci ve önemli bilgiler yer almaktadır.</p>',
  '<h2>Gerekli Belgeler</h2><ul><li>En az 6 ay geçerli pasaport</li><li>Vize başvuru formu (doldurulmuş ve imzalı)</li><li>Pasaport fotoğrafı (2 adet, biyometrik)</li><li>Seyahat sigortası</li><li>Dönüş uçak bileti</li><li>Otel rezervasyonu veya davet mektubu</li><li>Banka hesap özeti (son 3 ay)</li><li>İş belgesi veya öğrenci belgesi</li></ul>',
  '<h2>Başvuru Süreci</h2><ol><li>Online randevu alın (konsolosluk/vize merkezi)</li><li>Gerekli belgeleri hazırlayın</li><li>Vize başvuru formunu doldurun</li><li>Randevu gününde konsolosluğa gidin</li><li>Belgeleri teslim edin ve biyometrik verilerinizi verin</li><li>Vize ücretini ödeyin</li><li>Başvuru sonucunu bekleyin (genellikle 5-15 iş günü)</li><li>Vizenizi teslim alın</li></ol>',
  '[
    {"question": "Türk vatandaşları Amerika''ya vize almadan gidebilir mi?", "answer": "Hayır, Türk vatandaşları Amerika''ya gitmek için vize almaları gerekmektedir."},
    {"question": "Amerika vizesi için ne kadar süre gerekiyor?", "answer": "Amerika vizesi için işlem süresi yaklaşık 2-4 hafta."},
    {"question": "Amerika vizesi için hangi belgeler gerekli?", "answer": "Gerekli belgeler arasında geçerli pasaport, pasaport fotoğrafı, seyahat sigortası, dönüş bileti ve konaklama belgesi bulunmaktadır. Detaylı liste yukarıda yer almaktadır."},
    {"question": "Amerika vizesi ücreti ne kadar?", "answer": "Vize ücreti vize türüne ve kalış süresine göre değişiklik göstermektedir. Güncel ücret bilgisi için konsoloslukla iletişime geçmenizi öneririz."},
    {"question": "Amerika''da ne kadar süre kalabilirim?", "answer": "Kalış süresi vize türüne göre değişmektedir. Detaylı bilgi için konsolosluğa başvurunuz."}
  ]'::jsonb,
  'published',
  NOW(),
  'manual-test'
)
ON CONFLICT (source_country_code, destination_country_code, locale) 
DO UPDATE SET
  slug = EXCLUDED.slug,
  meta_title = EXCLUDED.meta_title,
  meta_description = EXCLUDED.meta_description,
  h1_title = EXCLUDED.h1_title,
  intro_text = EXCLUDED.intro_text,
  requirements_section = EXCLUDED.requirements_section,
  process_section = EXCLUDED.process_section,
  faq_json = EXCLUDED.faq_json,
  content_status = EXCLUDED.content_status,
  generated_at = EXCLUDED.generated_at,
  ai_model = EXCLUDED.ai_model;

-- Verify the insert
SELECT id, slug, source_country_code, destination_country_code, content_status, created_at
FROM visa_pages_seo
WHERE slug = 'turkiye-amerika-vize';
