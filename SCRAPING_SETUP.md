# PassportIndex Veri Çekme Sistemi - Kurulum ve Test

## 🎯 Özellikler

✅ **Gerçek HTML Scraping**: PassportIndex'ten canlı veri çekme (cheerio ile parse)
✅ **Otomatik Cronjob**: Her 10 dakikada bir farklı ülke (round-robin)
✅ **Detaylı Logging**: Admin panel'de tüm işlemlerin takibi
✅ **Hata Yönetimi**: Başarısız işlemlerin kaydı ve raporlama
✅ **Progress Tracking**: Gerçek zamanlı ilerleme gösterimi

## 📋 Kurulum Adımları

### 1. Database Migration'ları Çalıştır

Supabase Dashboard → SQL Editor'da `RUN_MIGRATIONS.sql` dosyasını çalıştırın:

```sql
-- MIGRATION 6: scraping_logs tablosu oluşturulacak
-- Tüm migration'lar idempotent (tekrar çalıştırılabilir)
```

### 2. Source Country'leri Aktif Et

```sql
-- Supabase SQL Editor'da çalıştırın
UPDATE countries 
SET is_source_country = true, 
    region = 'Middle East', 
    flag_emoji = '🇹🇷'
WHERE country_code = 'TUR';

UPDATE countries 
SET is_source_country = true, 
    region = 'Asia', 
    flag_emoji = '🇰🇿'
WHERE country_code = 'KAZ';

UPDATE countries 
SET is_source_country = true, 
    region = 'Asia', 
    flag_emoji = '🇦🇫'
WHERE country_code = 'AFG';

UPDATE countries 
SET is_source_country = true, 
    region = 'Europe', 
    flag_emoji = '🇲🇪'
WHERE country_code = 'MNE';

-- Doğrulama
SELECT country_code, name, is_source_country, region 
FROM countries 
WHERE is_source_country = true;
```

### 3. NPM Packages Yükle

```bash
npm install cheerio
```

### 4. Environment Variables (Opsiyonel)

`.env.local` dosyasına ekleyin (cronjob güvenliği için):

```env
CRON_SECRET=your-secret-token-here
```

## 🧪 Test Adımları

### Test 1: Manuel Scraping (Kazakistan)

1. Browser'da: `http://localhost:3000/admin/visa-matrix`
2. Dropdown'dan **"Kazakistan"** seçin
3. **"Veri Çek"** butonuna tıklayın
4. Progress bar ve detaylı mesajları izleyin

**Beklenen Sonuç:**
```
✅ Başarıyla Tamamlandı!

📊 Özet:
• Kaynak Ülke: Kazakistan (KAZ)
• Toplam Ülke: 190+
• Başarılı: 190+

📋 Örnek Kayıtlar:
• Albania: visa-free (90)
• Germany: visa-required
• Turkey: visa-free (90)
• China: visa-free (30)
• United States: visa-required
```

### Test 2: Scraping Logs Kontrolü

1. Browser'da: `http://localhost:3000/admin/visa-matrix/logs`
2. Son scraping işlemini görün
3. Status: **completed** ✅
4. Progress bar: **100%**
5. Hata varsa detayları görüntüleyin

### Test 3: Cronjob Endpoint (Manuel)

Terminal'de:

```bash
# Local test
curl http://localhost:3000/api/cron/scrape-visa-data

# With auth (if CRON_SECRET is set)
curl -H "Authorization: Bearer your-secret-token" \
  http://localhost:3000/api/cron/scrape-visa-data
```

**Beklenen Response:**
```json
{
  "success": true,
  "country": "Türkiye",
  "countryCode": "TUR",
  "scrapeResult": {
    "success": true,
    "scraped": 198,
    "total": 198
  }
}
```

### Test 4: Vize Sorgulama Sayfası

1. Browser'da: `http://localhost:3000/vize-sorgulama`
2. "Pasaport Ülkeniz" dropdown'ını açın
3. **Kazakistan** görünmeli
4. Kazakistan'ı seçin
5. Hedef ülke seçin (örn: Türkiye)
6. Vize durumunu görün: **visa-free (90 days)**

## 🚀 Deployment (Vercel)

### 1. Git Push

```bash
git add .
git commit -m "feat: Add PassportIndex HTML scraping with cronjob"
git push origin main
```

### 2. Vercel'de Otomatik Deploy

- Vercel otomatik olarak deploy edecek
- Cronjob `vercel.json`'dan otomatik kurulacak
- Her 10 dakikada bir çalışacak: `*/10 * * * *`

### 3. Vercel Cron Job Doğrulama

1. Vercel Dashboard → Project → Settings → Cron Jobs
2. `/api/cron/scrape-visa-data` görünmeli
3. Schedule: **Every 10 minutes**
4. Status: **Active** ✅

### 4. Production Test

```bash
# Production cronjob test
curl https://your-domain.com/api/cron/scrape-visa-data
```

## 📊 Monitoring

### Admin Panel'de İzleme

**Scraping Logs:**
- URL: `/admin/visa-matrix/logs`
- Auto-refresh: Her 10 saniyede bir
- Filtreleme: Status, ülke, tarih

**Metrics:**
- Toplam scraping sayısı
- Başarı oranı
- Ortalama süre
- Hata oranı

### Database Query'leri

```sql
-- Son 24 saatteki scraping'ler
SELECT 
  source_country_name,
  status,
  countries_scraped,
  countries_total,
  completed_at
FROM scraping_logs
WHERE created_at > NOW() - INTERVAL '24 hours'
ORDER BY created_at DESC;

-- Başarı oranı
SELECT 
  status,
  COUNT(*) as count,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 2) as percentage
FROM scraping_logs
GROUP BY status;

-- Ortalama scraping süresi
SELECT 
  AVG(EXTRACT(EPOCH FROM (completed_at - started_at))) as avg_seconds
FROM scraping_logs
WHERE status = 'completed';
```

## 🔧 Troubleshooting

### Hata: "Failed to fetch PassportIndex HTML"

**Çözüm:**
- PassportIndex sitesi erişilebilir mi kontrol edin
- User-Agent header'ı doğru mu?
- Rate limiting var mı?

### Hata: "Cannot find module 'cheerio'"

**Çözüm:**
```bash
npm install cheerio
```

### Hata: "Source country not found"

**Çözüm:**
```sql
-- Ülkeyi source country olarak işaretle
UPDATE countries 
SET is_source_country = true 
WHERE country_code = 'KAZ';
```

### Cronjob Çalışmıyor

**Kontrol:**
1. Vercel Dashboard → Cron Jobs → Status
2. Logs'da hata var mı?
3. `vercel.json` doğru mu?

## 📈 Performance

**Scraping Süresi:**
- ~190 ülke: 5-10 saniye
- Cheerio parse: Çok hızlı
- Database insert: Bulk upsert

**Cronjob Cycle:**
- 4 source country × 10 dakika = 40 dakika/cycle
- Her ülke günde ~36 kez güncellenecek

## 🎉 Başarı Kriterleri

✅ Kazakistan için 190+ ülke verisi çekildi
✅ Scraping logs'da "completed" status
✅ Vize sorgulama sayfasında Kazakistan seçilebiliyor
✅ Cronjob her 10 dakikada çalışıyor
✅ Admin panel'de loglar görünüyor
✅ Hata durumunda detaylı log kaydediliyor

## 📝 Notlar

- PassportIndex HTML yapısı değişirse scraping logic'i güncellenmelidir
- Cheerio selector'ları: `#psprt-dashboard-table tbody tr`
- Country slug mapping: `COUNTRY_SLUG_MAP` dictionary'sinde
- Rate limiting için 10 dakikalık interval yeterli
