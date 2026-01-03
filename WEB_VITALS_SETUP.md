# 📊 Web Vitals Tracking System - Setup Guide

## ✅ Tamamlanan Adımlar

### 1. Database Migration ✅
- ✅ `web_vitals` tablosu oluşturuldu
- ✅ Indexler eklendi (metric_name, created_at, page_url, rating, device_type, locale)
- ✅ RLS policies yapılandırıldı
- ✅ Materialized view (`web_vitals_summary`) oluşturuldu
- ✅ Refresh fonksiyonu eklendi

**Migration Status:** ✅ Başarıyla uygulandı (Supabase Project: kcocpunrmubppaskklzo)

### 2. API Endpoints ✅
- ✅ `POST /api/web-vitals` - Metrik kaydetme
- ✅ `GET /api/web-vitals` - Veri çekme ve analiz
- ✅ `POST /api/web-vitals/refresh` - Materialized view refresh
- ✅ `GET /api/web-vitals/refresh` - Son refresh zamanı
- ✅ `POST /api/web-vitals/check-alerts` - Alert kontrolü ve gönderimi
- ✅ `GET /api/web-vitals/check-alerts` - Mevcut durum görüntüleme

### 3. Client-Side Tracking ✅
- ✅ `src/app/web-vitals.tsx` güncellendi
- ✅ `navigator.sendBeacon` implementasyonu
- ✅ Production-only tracking
- ✅ Google Analytics entegrasyonu

### 4. Admin Dashboard ✅
- ✅ `src/components/admin/WebVitalsDashboard.tsx` oluşturuldu
- ✅ `src/app/admin/analytics/page.tsx` oluşturuldu
- ✅ Core Web Vitals status cards
- ✅ Metric detail views
- ✅ Device breakdown
- ✅ Top slowest pages

### 5. Cron Jobs ✅
- ✅ `vercel.json` oluşturuldu
- ✅ Saatlik materialized view refresh
- ✅ 6 saatte bir alert kontrolü

---

## 🚀 Deployment Checklist

### 1. Environment Variables
`.env.local` dosyasına ekleyin:

```bash
# Opsiyonel: Cron job güvenliği için
CRON_SECRET=your-random-secret-key

# Opsiyonel: Slack bildirimleri için
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL

# Opsiyonel: Email bildirimleri için (Resend örneği)
RESEND_API_KEY=re_your_api_key
```

### 2. Vercel Deployment
```bash
# Deploy to production
vercel --prod

# Cron jobs otomatik olarak aktif olacak
```

### 3. Admin Panel Erişimi
Production'da admin panel'e gidin:
```
https://www.kolayseyahat.net/admin/analytics
```

### 4. Test Etme
Development'ta test için:

```typescript
// src/app/web-vitals.tsx içinde geçici olarak:
if (process.env.NODE_ENV === 'production') {
// Bunu şuna değiştirin:
if (true) { // Test için
```

Sonra tarayıcıda sayfaları ziyaret edin ve console'da Web Vitals metriklerini görün.

---

## 📈 Kullanım

### Manuel Refresh
Materialized view'i manuel refresh etmek için:

```bash
curl -X POST https://www.kolayseyahat.net/api/web-vitals/refresh
```

### Alert Kontrolü
Core Web Vitals durumunu kontrol etmek için:

```bash
# Sadece görüntüle (alert göndermez)
curl https://www.kolayseyahat.net/api/web-vitals/check-alerts

# Alert kontrolü yap ve gerekirse gönder
curl -X POST https://www.kolayseyahat.net/api/web-vitals/check-alerts
```

### Dashboard Filtreleme
Admin dashboard'da:
- Time range seçimi (1/7/30/90 gün)
- Metric'e tıklayarak detaylı analiz
- Device breakdown görüntüleme
- En yavaş sayfaları görme

---

## 🔔 Alert Sistemi

### Slack Entegrasyonu
1. Slack workspace'inizde bir Incoming Webhook oluşturun
2. Webhook URL'sini `.env.local`'e ekleyin:
   ```bash
   SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
   ```
3. Deploy edin

### Email Entegrasyonu
`src/app/api/web-vitals/check-alerts/route.ts` içindeki `sendAlert` fonksiyonunu güncelleyin:

```typescript
async function sendAlert(metric: string, goodPercentage: number, details: any) {
  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'alerts@kolayseyahat.net',
      to: 'admin@kolayseyahat.net',
      subject: `⚠️ Core Web Vitals Alert: ${metric} Failing`,
      html: `...`,
    }),
  });
}
```

### Alert Kriterleri
Alert gönderilir eğer:
- Core Web Vitals metriklerinden biri (LCP, FID, CLS, INP)
- Son 7 gündeki "good" rating oranı %75'in altındaysa
- 6 saatte bir kontrol edilir (vercel.json'da yapılandırılmış)

---

## 📊 Metrics Açıklamaları

### Core Web Vitals
- **LCP** (Largest Contentful Paint): Loading performance
  - Good: ≤ 2.5s
  - Poor: > 4.0s

- **FID** (First Input Delay): Interactivity
  - Good: ≤ 100ms
  - Poor: > 300ms

- **CLS** (Cumulative Layout Shift): Visual stability
  - Good: ≤ 0.1
  - Poor: > 0.25

- **INP** (Interaction to Next Paint): Responsiveness
  - Good: ≤ 200ms
  - Poor: > 500ms

### Additional Metrics
- **FCP** (First Contentful Paint): ≤ 1.8s (good)
- **TTFB** (Time to First Byte): ≤ 800ms (good)

---

## 🔧 Troubleshooting

### Veri Gelmiyor
1. Production'da olduğunuzdan emin olun
2. Browser console'da hata var mı kontrol edin
3. `/api/web-vitals` endpoint'inin çalıştığını test edin

### Materialized View Refresh Hatası
```bash
# Manuel refresh deneyin
curl -X POST https://www.kolayseyahat.net/api/web-vitals/refresh

# Supabase'de fonksiyonu kontrol edin
SELECT refresh_web_vitals_summary();
```

### Alert Gelmiyor
1. Environment variables doğru mu kontrol edin
2. Cron job'ların çalıştığını Vercel dashboard'dan kontrol edin
3. Alert endpoint'ini manuel test edin:
   ```bash
   curl -X POST https://www.kolayseyahat.net/api/web-vitals/check-alerts
   ```

---

## 🎯 Sonraki Adımlar

### Kısa Vadede
- [ ] Slack/Email entegrasyonunu tamamlayın
- [ ] Production'da veri toplanmasını bekleyin (24-48 saat)
- [ ] İlk raporları inceleyin

### Orta Vadede
- [ ] Yavaş sayfaları optimize edin
- [ ] Device-specific sorunları çözün
- [ ] Alert threshold'larını fine-tune edin

### Uzun Vadede
- [ ] Historical trend analysis ekleyin
- [ ] Custom dashboards oluşturun
- [ ] A/B testing için Web Vitals karşılaştırması

---

## 📚 Kaynaklar

- [Web Vitals Documentation](https://web.dev/vitals/)
- [Core Web Vitals](https://web.dev/vitals/#core-web-vitals)
- [Vercel Cron Jobs](https://vercel.com/docs/cron-jobs)
- [Supabase Materialized Views](https://supabase.com/docs/guides/database/postgres/materialized-views)

---

## 🎉 Tamamlandı!

Web Vitals tracking sistemi tamamen kuruldu ve production'a hazır! 🚀

Sorularınız için: admin@kolayseyahat.net
