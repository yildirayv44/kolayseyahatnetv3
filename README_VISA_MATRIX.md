# Pasaport Bazlı Global Vize Sistemi

## 🎯 Genel Bakış

Bu sistem, mevcut Türkiye vize danışmanlık sistemini **tamamen koruyarak**, 194 ülke için pasaport-hedef bazında vize gerekliliklerini sorgulama, SEO-friendly sayfalar oluşturma ve mobil API v2 sunma özelliklerini ekler.

### Temel Özellikler

✅ **Geriye Uyumlu**: Mevcut sistem hiç değişmedi  
✅ **Çok Kaynaklı**: Herhangi bir ülkeden herhangi bir ülkeye vize sorgulaması  
✅ **SEO Optimized**: ~37,000 potansiyel SEO sayfası  
✅ **Mobil API v2**: Yeni özellikler için ayrı API versiyonu  
✅ **Admin Panel**: Kolay veri yönetimi  

---

## 🚀 Hızlı Başlangıç

### 1. Migration'ları Çalıştır

Supabase Dashboard → SQL Editor'da sırayla:

```sql
-- 1. Countries tablosunu genişlet
\i supabase/migrations/20260320_expand_countries_for_multi_source.sql

-- 2. Products tablosunu genişlet
\i supabase/migrations/20260320_expand_products_for_multi_source.sql

-- 3. Visa requirements tablosunu genişlet
\i supabase/migrations/20260320_expand_visa_requirements_for_multi_source.sql

-- 4. Country slugs tablosunu oluştur
\i supabase/migrations/20260320_create_country_slugs_table.sql

-- 5. Visa pages SEO tablosunu oluştur
\i supabase/migrations/20260320_create_visa_pages_seo_table.sql
```

### 2. İlk Veri Yükleme

```bash
# Admin panel'e git
open https://www.kolayseyahat.net/admin/visa-matrix

# 1. Türkiye'nin kaynak ülke olduğunu doğrula
# 2. Diğer ülkeleri kaynak olarak işaretle (opsiyonel)
# 3. PassportIndex scraping yap
# 4. SEO içerik üret
```

### 3. Test Et

```bash
# Mevcut API'leri test et (değişmemeli)
curl https://www.kolayseyahat.net/api/mobile/countries

# Yeni API'leri test et
curl https://www.kolayseyahat.net/api/mobile/v2/source-countries
curl "https://www.kolayseyahat.net/api/mobile/v2/visa-check?source=TUR&destination=USA"

# Frontend'i test et
open https://www.kolayseyahat.net/vize-sorgulama
```

---

## 📚 Kullanım Kılavuzu

### Kullanıcı Akışı

#### Vize Sorgulama
1. `/vize-sorgulama` sayfasına git
2. Pasaport ülkeni seç
3. Hedef ülkeyi seç
4. "Kontrol Et" butonuna tıkla
5. Vize bilgilerini ve paketleri gör

#### SEO Sayfaları
- URL formatı: `/vize-sorgulama/{kaynak-ülke}-{hedef-ülke}`
- Örnek: `/vize-sorgulama/turkmenistan-amerika`
- Detaylı vize bilgileri, belgeler, süreç, SSS

### Admin Akışı

#### Vize Matrix Yönetimi
```
/admin/visa-matrix
```

**Özellikler:**
- Kaynak ülke aktif/pasif yapma
- PassportIndex scraping
- İstatistikler

**Kullanım:**
1. Kaynak ülke seç
2. "Veri Çek" butonuna tıkla
3. ~194 hedef ülke için vize verileri çekilir

#### SEO İçerik Yönetimi
```
/admin/visa-matrix/seo
```

**Özellikler:**
- Toplu SEO içerik üretimi
- İçerik durumu yönetimi
- Yayınlama

**Kullanım:**
1. Kaynak ülke ve dil seç
2. "Toplu Üret" butonuna tıkla
3. Oluşturulan sayfaları "Yayınla"

---

## 🔌 API Dokümantasyonu

### API v2 Endpoint'leri

#### 1. Kaynak Ülke Listesi
```http
GET /api/mobile/v2/source-countries
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Türkiye",
      "country_code": "TUR",
      "flag_emoji": "🇹🇷",
      "passport_rank": 45,
      "passport_power_score": 110
    }
  ],
  "count": 1
}
```

#### 2. Vize Durumu Sorgulama
```http
GET /api/mobile/v2/visa-check?source=TUR&destination=USA
```

**Parameters:**
- `source` (required): Kaynak ülke kodu (ISO 3166-1 alpha-3)
- `destination` (required): Hedef ülke kodu

**Response:**
```json
{
  "success": true,
  "data": {
    "source": {
      "code": "TUR",
      "name": "Türkiye",
      "flag_emoji": "🇹🇷"
    },
    "destination": {
      "code": "USA",
      "name": "Amerika Birleşik Devletleri",
      "flag_emoji": "🇺🇸"
    },
    "visa_status": "visa-required",
    "allowed_stay": null,
    "conditions": "B1/B2 visa required",
    "visa_cost": "$160",
    "processing_time": "2-4 weeks",
    "application_method": "embassy",
    "packages": [
      {
        "id": 123,
        "name": "Standart Vize Paketi",
        "price": "2500",
        "currency_id": 1
      }
    ],
    "has_packages": true
  }
}
```

#### 3. Kaynak Bazlı Ülke Listesi
```http
GET /api/mobile/v2/countries?source=TUR
```

**Parameters:**
- `source` (required): Kaynak ülke kodu
- `search` (optional): Arama terimi
- `visaStatus` (optional): Vize durumu filtresi

**Response:**
```json
{
  "success": true,
  "source_country": "TUR",
  "data": [...],
  "count": 194,
  "statistics": {
    "visa_free": 70,
    "visa_on_arrival": 45,
    "eta": 15,
    "visa_required": 64,
    "total": 194
  }
}
```

### Admin API Endpoint'leri

#### 1. PassportIndex Scraping
```http
POST /api/admin/visa-matrix/scrape-passportindex
Content-Type: application/json

{
  "sourceCountryCode": "TKM"
}
```

#### 2. SEO İçerik Üretimi
```http
POST /api/admin/visa-matrix/generate-seo
Content-Type: application/json

{
  "sourceCountryCode": "TKM",
  "destinationCountryCode": "USA",
  "locale": "tr"
}
```

#### 3. Toplu SEO Üretimi
```http
POST /api/admin/visa-matrix/bulk-generate-seo
Content-Type: application/json

{
  "sourceCountryCode": "TKM",
  "locale": "tr",
  "limit": 50
}
```

---

## 🗄️ Database Schema

### Yeni/Güncellenmiş Tablolar

#### `countries` (genişletildi)
```sql
-- Yeni kolonlar
is_source_country BOOLEAN DEFAULT false
passport_rank INTEGER
passport_power_score INTEGER
region VARCHAR(100)
flag_emoji VARCHAR(10)
```

#### `products` (genişletildi)
```sql
-- Yeni kolon
source_country_code VARCHAR(3) DEFAULT 'TUR'
```

#### `visa_requirements` (genişletildi)
```sql
-- Yeni kolon
source_country_code VARCHAR(3) DEFAULT 'TUR'

-- Unique constraint
UNIQUE(source_country_code, country_code)
```

#### `country_slugs` (yeni)
```sql
CREATE TABLE country_slugs (
  id BIGSERIAL PRIMARY KEY,
  country_id BIGINT REFERENCES countries(id),
  locale VARCHAR(5),
  slug VARCHAR(255),
  slug_type VARCHAR(50),
  source_country_code VARCHAR(3),
  UNIQUE(slug, locale)
);
```

#### `visa_pages_seo` (yeni)
```sql
CREATE TABLE visa_pages_seo (
  id BIGSERIAL PRIMARY KEY,
  source_country_code VARCHAR(3),
  destination_country_code VARCHAR(3),
  locale VARCHAR(5),
  meta_title VARCHAR(255),
  meta_description TEXT,
  h1_title VARCHAR(255),
  intro_text TEXT,
  requirements_section TEXT,
  process_section TEXT,
  faq_json JSONB,
  content_status VARCHAR(50),
  UNIQUE(source_country_code, destination_country_code, locale)
);
```

---

## 🧪 Testing

### Manuel Test Checklist

#### Mevcut Sistem (CRITICAL)
- [ ] `/amerika-vizesi` çalışıyor
- [ ] `/vize-basvuru-formu-std` çalışıyor
- [ ] `/api/mobile/countries` çalışıyor
- [ ] Paketler gösteriliyor
- [ ] Başvuru formu çalışıyor

#### Yeni Sistem
- [ ] `/vize-sorgulama` çalışıyor
- [ ] Kaynak ülke seçimi çalışıyor
- [ ] Vize sorgulama çalışıyor
- [ ] Sonuçlar gösteriliyor
- [ ] Paketler gösteriliyor (varsa)

#### Admin Panel
- [ ] `/admin/visa-matrix` çalışıyor
- [ ] Kaynak ülke toggle çalışıyor
- [ ] Scraping çalışıyor
- [ ] `/admin/visa-matrix/seo` çalışıyor
- [ ] SEO üretimi çalışıyor

### API Tests

```bash
# Test script
./test-visa-matrix.sh
```

---

## 🔧 Troubleshooting

### Problem: Migration hatası
**Belirti:** SQL error during migration  
**Çözüm:** 
1. Migration dosyalarını tek tek çalıştır
2. Her birinden sonra `SELECT * FROM {table} LIMIT 1` ile doğrula
3. Hata varsa rollback yap

### Problem: API 500 error
**Belirti:** Internal server error  
**Çözüm:**
1. Logs'u kontrol et: Supabase Dashboard → Logs
2. Database connection'ı doğrula
3. RLS policies'i kontrol et

### Problem: SEO sayfası 404
**Belirti:** Page not found  
**Çözüm:**
1. Slug formatını kontrol et: `{source}-{destination}`
2. SEO content'in published olduğunu doğrula
3. `country_slugs` tablosunu kontrol et

### Problem: Paketler görünmüyor
**Belirti:** No packages shown  
**Çözüm:**
1. `products.source_country_code` kontrol et
2. Paket varsa `source_country_code = 'TUR'` olmalı
3. Diğer ülkeler için paket yoksa normal

---

## 📊 Monitoring

### Key Metrics

**API Performance:**
- Response time < 300ms
- Error rate < 0.1%
- Uptime > 99.9%

**User Engagement:**
- Vize sorgulama kullanımı
- SEO sayfa görüntülenmeleri
- Conversion rate (başvuru)

**Data Quality:**
- Vize verisi güncelliği
- SEO içerik kalitesi
- Scraping başarı oranı

### Monitoring Tools

- **Sentry**: Error tracking
- **Google Analytics**: User behavior
- **Supabase Logs**: Database queries
- **Vercel Analytics**: Performance

---

## 🔄 Maintenance

### Günlük
- [ ] Error logs kontrol
- [ ] API response times kontrol
- [ ] User feedback kontrol

### Haftalık
- [ ] Vize verisi güncelliği kontrol
- [ ] SEO sayfa performance kontrol
- [ ] Database backup doğrula

### Aylık
- [ ] PassportIndex scraping (tüm ülkeler)
- [ ] SEO içerik review
- [ ] Performance optimization
- [ ] User feedback analizi

---

## 📖 Additional Resources

- **Deployment Checklist**: `DEPLOYMENT_CHECKLIST.md`
- **Implementation Summary**: `IMPLEMENTATION_SUMMARY.md`
- **Original Plan**: `.windsurf/plans/passport-visa-matrix-revised-a787df.md`

---

## 🤝 Contributing

### Development Workflow

1. Create feature branch
2. Make changes
3. Test locally
4. Test mevcut sistem (CRITICAL)
5. Submit PR
6. Review & merge

### Code Style

- TypeScript strict mode
- ESLint rules
- Prettier formatting
- Component documentation

---

## 📞 Support

**Technical Issues:**
- Check troubleshooting section
- Review logs
- Contact development team

**Business Questions:**
- Feature requests
- Data accuracy
- Partnership opportunities

---

**Version:** 1.0.0  
**Last Updated:** 2026-03-20  
**Status:** Production Ready ✅
