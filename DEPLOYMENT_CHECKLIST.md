# Pasaport Bazlı Global Vize Sistemi - Deployment Checklist

## 📋 Pre-Deployment Checklist

### 1. Database Migration (CRITICAL)
Migration dosyalarını sırayla çalıştırın:

```bash
# Supabase Dashboard → SQL Editor'da sırayla çalıştırın:

1. ✅ 20260320_expand_countries_for_multi_source.sql
   - countries tablosuna yeni kolonlar ekler
   - Türkiye'yi kaynak ülke olarak işaretler

2. ✅ 20260320_expand_products_for_multi_source.sql
   - products tablosuna source_country_code ekler
   - Mevcut paketleri TUR olarak işaretler

3. ✅ 20260320_expand_visa_requirements_for_multi_source.sql
   - visa_requirements tablosuna source_country_code ekler
   - Unique constraint günceller

4. ✅ 20260320_create_country_slugs_table.sql
   - Çok dilli slug yönetimi için yeni tablo

5. ✅ 20260320_create_visa_pages_seo_table.sql
   - SEO içerik yönetimi için yeni tablo
```

**Doğrulama:**
```sql
-- Kolonların eklendiğini doğrula
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'countries' 
AND column_name IN ('is_source_country', 'passport_rank', 'region', 'flag_emoji');

-- Türkiye'nin kaynak ülke olduğunu doğrula
SELECT name, country_code, is_source_country 
FROM countries 
WHERE country_code = 'TUR';
```

### 2. API Endpoint Testing

#### Test v1 API'lerin Çalıştığını Doğrula (CRITICAL)
```bash
# Mevcut API'ler değişmemeli
curl https://www.kolayseyahat.net/api/mobile/countries
curl https://www.kolayseyahat.net/api/mobile/countries/amerika
curl https://www.kolayseyahat.net/api/countries
```

**Beklenen:** Tüm endpoint'ler 200 OK dönmeli, veri yapısı değişmemeli.

#### Test v2 API'leri
```bash
# Yeni API'ler
curl https://www.kolayseyahat.net/api/mobile/v2/source-countries
curl "https://www.kolayseyahat.net/api/mobile/v2/visa-check?source=TUR&destination=USA"
curl "https://www.kolayseyahat.net/api/mobile/v2/countries?source=TUR"
```

**Beklenen:** Yeni endpoint'ler 200 OK dönmeli, doğru veri yapısı.

### 3. Frontend Testing

#### Mevcut Sayfaların Çalıştığını Doğrula (CRITICAL)
```
✅ /amerika-vizesi → Türkiye'den ABD'ye (mevcut sistem)
✅ /ingiltere-vizesi → Türkiye'den İngiltere'ye
✅ /vize-basvuru-formu-std → Başvuru formu
✅ /basvuru → Başvuru formu
```

**Test Senaryosu:**
1. Ülke sayfasına git
2. Vize bilgilerini kontrol et
3. Paketleri kontrol et
4. "Başvuru Yap" butonuna tıkla
5. Form açılmalı ve çalışmalı

#### Yeni Sayfaları Test Et
```
🆕 /vize-sorgulama → Vize checker ana sayfa
🆕 /vize-sorgulama/turkmenistan-amerika → SEO sayfası (oluşturulduysa)
```

**Test Senaryosu:**
1. Vize sorgulama sayfasına git
2. Kaynak ülke seç (Türkiye)
3. Hedef ülke seç (Amerika)
4. "Kontrol Et" butonuna tıkla
5. Sonuçlar görünmeli
6. Paketler varsa gösterilmeli

### 4. Admin Panel Testing

#### Visa Matrix Yönetimi
```
✅ /admin/visa-matrix
```

**Test Senaryosu:**
1. Admin panel'e giriş yap
2. Kaynak ülke listesini kontrol et
3. Türkiye'nin aktif olduğunu doğrula
4. Scraping işlemini test et (küçük bir ülke ile)
5. İstatistikleri kontrol et

#### SEO İçerik Yönetimi
```
✅ /admin/visa-matrix/seo
```

**Test Senaryosu:**
1. Kaynak ülke seç (Türkiye)
2. Dil seç (Türkçe)
3. "Toplu Üret" butonuna tıkla
4. İlk 10 sayfa için içerik üretilmeli
5. Sayfaları "Yayınla"
6. Frontend'de görüntüle

### 5. Data Population

#### İlk Veri Yükleme
```sql
-- 1. Türkiye için vize verilerini kontrol et
SELECT COUNT(*) FROM visa_requirements WHERE source_country_code = 'TUR';
-- Beklenen: ~120-150 kayıt (mevcut sistem)

-- 2. Diğer kaynak ülkeleri ekle (opsiyonel)
UPDATE countries 
SET is_source_country = true 
WHERE country_code IN ('DEU', 'IND', 'TKM', 'GBR', 'USA');
```

#### PassportIndex Scraping
1. Admin panel → Visa Matrix
2. Kaynak ülke seç (örn: Türkmenistan)
3. "Veri Çek" butonuna tıkla
4. ~194 kayıt eklenmeli

#### SEO İçerik Üretimi
1. Admin panel → SEO İçerik Yönetimi
2. Kaynak ülke: Türkiye, Dil: Türkçe
3. "Toplu Üret" → İlk 50 sayfa
4. Sayfaları "Yayınla"
5. Kaynak ülke: Türkiye, Dil: İngilizce
6. "Toplu Üret" → İlk 50 sayfa

### 6. Performance Testing

#### API Response Times
```bash
# v1 API (mevcut)
time curl https://www.kolayseyahat.net/api/mobile/countries
# Beklenen: < 500ms

# v2 API (yeni)
time curl "https://www.kolayseyahat.net/api/mobile/v2/visa-check?source=TUR&destination=USA"
# Beklenen: < 300ms
```

#### Page Load Times
```bash
# Mevcut sayfa
time curl https://www.kolayseyahat.net/amerika-vizesi
# Beklenen: < 2s

# Yeni sayfa
time curl https://www.kolayseyahat.net/vize-sorgulama
# Beklenen: < 2s
```

### 7. SEO Testing

#### Meta Tags
```bash
# Test meta tags
curl -s https://www.kolayseyahat.net/vize-sorgulama | grep -i "meta name=\"description\""
curl -s https://www.kolayseyahat.net/vize-sorgulama/turkmenistan-amerika | grep -i "meta name=\"description\""
```

#### Sitemap Generation (TODO)
```
- [ ] Sitemap generator oluştur
- [ ] Yeni sayfaları sitemap'e ekle
- [ ] Google Search Console'a submit et
```

### 8. Mobile App Compatibility

#### API Contract Testing
```bash
# Mobil uygulamanın kullandığı endpoint'leri test et
curl https://www.kolayseyahat.net/api/mobile/countries
curl https://www.kolayseyahat.net/api/mobile/countries/amerika
curl https://www.kolayseyahat.net/api/mobile/applications
```

**Beklenen:** Tüm endpoint'ler önceki gibi çalışmalı, veri yapısı değişmemeli.

### 9. Error Handling

#### Test Error Scenarios
```bash
# Geçersiz ülke kodu
curl "https://www.kolayseyahat.net/api/mobile/v2/visa-check?source=XXX&destination=USA"
# Beklenen: 404 Not Found

# Eksik parametre
curl "https://www.kolayseyahat.net/api/mobile/v2/visa-check?source=TUR"
# Beklenen: 400 Bad Request

# Var olmayan SEO sayfası
curl https://www.kolayseyahat.net/vize-sorgulama/xxx-yyy
# Beklenen: 404 Not Found
```

### 10. Monitoring Setup

#### Sentry/Error Tracking
```
- [ ] Sentry kurulumu kontrol et
- [ ] Error tracking aktif mi?
- [ ] Alert'ler yapılandırıldı mı?
```

#### Analytics
```
- [ ] Google Analytics tracking
- [ ] Yeni sayfalar için event tracking
- [ ] Conversion tracking (başvuru formu)
```

---

## 🚀 Deployment Steps

### Step 1: Backup
```bash
# Database backup
# Supabase Dashboard → Database → Backups → Create Backup
```

### Step 2: Run Migrations
```bash
# Yukarıdaki migration dosyalarını sırayla çalıştır
```

### Step 3: Deploy Code
```bash
# Vercel/hosting provider'a deploy
git add .
git commit -m "feat: Add passport-based global visa system"
git push origin main
```

### Step 4: Verify Deployment
```bash
# Tüm test'leri tekrar çalıştır
# Özellikle mevcut API'lerin çalıştığını doğrula
```

### Step 5: Data Population
```bash
# Admin panel'den ilk veri yüklemesini yap
# 1. Scraping (Türkiye + 2-3 popüler ülke)
# 2. SEO içerik üretimi (ilk 100 sayfa)
```

### Step 6: Monitor
```bash
# İlk 24 saat yakından takip et
# - Error rates
# - API response times
# - User feedback
```

---

## ⚠️ Rollback Plan

Eğer bir sorun çıkarsa:

### Immediate Rollback
```bash
# 1. Code rollback
git revert HEAD
git push origin main

# 2. Database rollback (eğer gerekirse)
# Supabase Dashboard → Database → Backups → Restore
```

### Partial Rollback
```bash
# Sadece yeni sayfaları devre dışı bırak
# Admin panel'den is_source_country = false yap (Türkiye hariç)
UPDATE countries SET is_source_country = false WHERE country_code != 'TUR';
```

---

## ✅ Post-Deployment Checklist

- [ ] Tüm mevcut özellikler çalışıyor
- [ ] Yeni özellikler çalışıyor
- [ ] API response times normal
- [ ] Error rate normal
- [ ] Mobil uygulama çalışıyor
- [ ] SEO sayfaları index'leniyor
- [ ] Analytics tracking çalışıyor
- [ ] Monitoring aktif

---

## 📊 Success Metrics

### Week 1
- [ ] 0 critical errors
- [ ] Mevcut API'lerde 0 breaking change
- [ ] Yeni API'ler < 300ms response time
- [ ] İlk 100 SEO sayfası yayında

### Month 1
- [ ] 500+ SEO sayfası yayında
- [ ] 5+ kaynak ülke aktif
- [ ] Organik trafik artışı
- [ ] 0 user complaints

---

## 🔧 Troubleshooting

### Problem: Migration hatası
**Çözüm:** Migration dosyalarını tek tek çalıştır, her birinden sonra doğrula.

### Problem: API 500 error
**Çözüm:** Logs'u kontrol et, database connection'ı doğrula.

### Problem: SEO sayfası 404
**Çözüm:** Slug yapısını kontrol et, country_slugs tablosunu kontrol et.

### Problem: Mevcut özellik çalışmıyor
**Çözüm:** IMMEDIATE ROLLBACK! Mevcut sistem korunmalı.

---

**Son Güncelleme:** 2026-03-20
**Hazırlayan:** Cascade AI
**Durum:** Ready for Deployment
