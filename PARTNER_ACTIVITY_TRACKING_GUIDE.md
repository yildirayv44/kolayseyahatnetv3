# Partner Activity Tracking System - Kullanım Kılavuzu

## 📊 Genel Bakış

Partner yönetim sistemi artık detaylı aktivite takibi ile geliştirildi. Admin panelde her partner için:
- Kaç kişinin giriş yaptığı
- Hangi sayfaları görüntüledikleri
- Hangi ülke ve paketlere baktıkları
- Form başlatma ve gönderme oranları
- Cihaz, tarayıcı ve işletim sistemi bilgileri

## 🗄️ Veritabanı Yapısı

### Yeni Tablolar

#### `partner_activities`
Tüm kullanıcı aktivitelerini detaylı olarak kaydeder:
- `activity_type`: page_view, country_view, package_view, form_start, form_submit, button_click
- `page_url`, `page_title`: Görüntülenen sayfa bilgileri
- `country_id`, `country_name`: İlgilenilen ülke
- `package_id`, `package_name`: İlgilenilen paket
- `device_type`, `browser`, `os`: Cihaz bilgileri
- `session_id`, `visitor_id`: Oturum ve ziyaretçi takibi

#### `partner_sessions`
Benzersiz ziyaretçi oturumlarını takip eder:
- `session_id`: Benzersiz oturum kimliği
- `visitor_id`: Benzersiz ziyaretçi kimliği (çerezler arası kalıcı)
- `first_visit`, `last_activity`: Oturum zamanlaması
- `total_page_views`: Toplam sayfa görüntüleme
- `converted`: Dönüşüm durumu (form gönderildi mi?)
- `landing_page`: İlk giriş sayfası
- `device_type`, `browser`, `os`: Cihaz bilgileri

## 🔗 Referans Link Kullanımı

Partner linki örneği:
```
https://www.kolayseyahat.net/?ref=KS184203
https://www.kolayseyahat.net/amerika?ref=KS184203
https://www.kolayseyahat.net/vize-basvuru-formu?ref=KS184203
```

## 📈 Admin Panel - Partner Detay Sayfası

### Erişim
1. Admin Panel > Partner Yönetimi
2. Partner listesinde **Analitik İkonu** (📊) butonuna tıklayın
3. Detaylı partner sayfası açılır: `/admin/partnerler/[partnerId]`

### Özellikler

#### 1. **Genel İstatistikler**
- **Toplam Ziyaret**: Benzersiz oturum sayısı
- **Benzersiz Ziyaretçi**: Farklı kullanıcı sayısı
- **Dönüşüm Oranı**: Form gönderen / Toplam ziyaret
- **Form Tamamlama Oranı**: Form gönderen / Form başlatan

#### 2. **Tarih Filtreleme**
- Son 7 Gün
- Son 30 Gün
- Son 90 Gün
- Tüm Zamanlar

#### 3. **Sekmeler**

##### **Genel Bakış**
- Özet istatistikler
- Son 10 aktivite
- Hızlı görünüm

##### **Aktiviteler**
Her aktivite için:
- Aktivite tipi (sayfa görüntüleme, form başlatma, vb.)
- Görüntülenen sayfa
- İlgilenilen ülke/paket (varsa)
- Cihaz bilgileri (mobil/tablet/desktop)
- Tarayıcı ve işletim sistemi
- Tarih ve saat
- Oturum ID

##### **Oturumlar**
Her oturum için:
- Oturum ID
- Dönüşüm durumu (✓ işareti ile)
- İlk giriş sayfası (landing page)
- Toplam sayfa görüntüleme
- Cihaz, tarayıcı, OS bilgileri
- İlk ve son aktivite zamanı

##### **Başvurular**
Mevcut referral sistemi ile entegre:
- Müşteri bilgileri
- Ülke ve vize tipi
- Başvuru durumu
- Komisyon bilgileri
- Ödeme durumu

## 🎯 Takip Edilen Aktiviteler

### Otomatik Takip
1. **page_view**: Her sayfa görüntüleme
2. **country_view**: Ülke detay sayfası görüntüleme
3. **package_view**: Paket görüntüleme
4. **form_start**: Form ile ilk etkileşim
5. **form_submit**: Form gönderimi
6. **button_click**: Önemli buton tıklamaları

### Oturum Yönetimi
- **Session ID**: Her tarayıcı oturumu için benzersiz (sessionStorage)
- **Visitor ID**: Kullanıcı için kalıcı (localStorage, 30 gün)
- Otomatik oturum güncelleme
- Dönüşüm takibi

## 💻 Teknik Detaylar

### Tracking Fonksiyonları

```typescript
// Sayfa görüntüleme
trackPageView(partnerId, { countryId, countryName });

// Ülke görüntüleme
trackCountryView(partnerId, countryId, countryName);

// Paket görüntüleme
trackPackageView(partnerId, packageId, packageName);

// Form başlatma
trackFormStart(partnerId, { countryId, countryName });

// Form gönderimi
trackFormSubmit(partnerId, {
  countryId,
  countryName,
  customerName,
  customerEmail
});

// Buton tıklama
trackButtonClick(partnerId, buttonName, metadata);
```

### Entegrasyon Noktaları

1. **ReferralTracker Component** (`src/components/ReferralTracker.tsx`)
   - Her sayfa değişiminde otomatik tracking
   - Partner ID yakalama ve session başlatma

2. **ApplicationForm** (`src/components/forms/ApplicationForm.tsx`)
   - Form başlatma tracking (ilk etkileşimde)
   - Form gönderme tracking
   - Dönüşüm işaretleme

3. **Partner Activity Tracking** (`src/lib/partnerActivityTracking.ts`)
   - Tüm tracking fonksiyonları
   - Session ve visitor ID yönetimi
   - Cihaz bilgisi algılama

## 📊 Kullanım Senaryoları

### Senaryo 1: Partner Performans Analizi
1. Admin panelde partner listesine git
2. İlgili partnerin analitik butonuna tıkla
3. "Son 30 Gün" filtresi ile:
   - Kaç kişi geldi?
   - Kaç sayfa görüntülediler?
   - Hangi ülkelere ilgi gösterdiler?
   - Kaç kişi form başlattı?
   - Kaç kişi form gönderdi?
   - Dönüşüm oranı nedir?

### Senaryo 2: Detaylı Aktivite İnceleme
1. "Aktiviteler" sekmesine geç
2. Her aktiviteyi görüntüle:
   - Kullanıcı hangi sayfaları gezdi?
   - Hangi ülke/paketlere baktı?
   - Mobil mi desktop'tan mı girdi?
   - Hangi tarayıcıyı kullandı?

### Senaryo 3: Oturum Analizi
1. "Oturumlar" sekmesine geç
2. Her oturum için:
   - Kullanıcı nereden geldi? (landing page)
   - Kaç sayfa görüntüledi?
   - Dönüşüm sağladı mı?
   - Ne kadar süre geçirdi?

### Senaryo 4: Başvuru Takibi
1. "Başvurular" sekmesine geç
2. Partner üzerinden gelen tüm başvuruları gör
3. Komisyon ve ödeme durumlarını yönet

## 🔒 Güvenlik ve Gizlilik

- **RLS Policies**: Tüm tablolar Row Level Security ile korunuyor
- **Service Role**: Sadece service role tam erişime sahip
- **IP Adresleri**: Anonim olarak saklanıyor
- **Müşteri Bilgileri**: Sadece admin panelde görünür
- **Partner Dashboard**: Partnerler kendi istatistiklerini görebilir ama müşteri bilgilerini göremez

## 🚀 Gelecek Geliştirmeler

- [ ] Gerçek zamanlı dashboard
- [ ] Grafik ve görselleştirmeler
- [ ] Export (Excel/CSV)
- [ ] E-posta raporları
- [ ] A/B test tracking
- [ ] Conversion funnel analizi
- [ ] Heatmap entegrasyonu

## 📝 Notlar

- Tüm tracking client-side yapılıyor (GDPR uyumlu)
- Session ID her tarayıcı oturumunda yenileniyor
- Visitor ID 30 gün boyunca kalıcı
- Aktiviteler gerçek zamanlı kaydediliyor
- Admin panelde geçmiş veriler filtrelenebilir

## 🆘 Sorun Giderme

### Tracking Çalışmıyor
1. Browser console'da hata var mı kontrol edin
2. Supabase bağlantısını kontrol edin
3. RLS policy'lerin doğru olduğundan emin olun

### Veriler Görünmüyor
1. Tarih filtresini kontrol edin
2. Partner ID'nin doğru olduğundan emin olun
3. Veritabanında veri olup olmadığını kontrol edin

### Performans Sorunları
1. Tarih filtresi kullanın (tüm zamanlar yerine 30 gün)
2. Sayfa başına limit uygulayın
3. Index'lerin doğru çalıştığından emin olun
