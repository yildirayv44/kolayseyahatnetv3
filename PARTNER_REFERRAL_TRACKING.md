# Partner Referral Tracking Sistemi

## 🎯 Genel Bakış

Partner referral tracking sistemi, partnerlerin paylaştığı linkler üzerinden gelen müşterileri otomatik olarak takip eder ve komisyon hesaplamasını kolaylaştırır.

## 📋 Nasıl Çalışır?

### 1. Partner Link Formatı

Partnerler herhangi bir sayfaya kendi referans kodlarını ekleyerek link paylaşabilir:

```
# Ana sayfa
https://www.kolayseyahat.net?ref=KS123456

# Belirli ülke sayfası
https://www.kolayseyahat.net/amerika?ref=KS123456

# Vize başvuru formu (boş)
https://www.kolayseyahat.net/vize-basvuru-formu?ref=KS123456

# Vize başvuru formu (dolu)
https://www.kolayseyahat.net/vize-basvuru-formu?country_id=4&country_name=Amerika&package_id=13&package_name=Amerika+Vizesi+Online+Danışmanlık&ref=KS123456
```

**Önemli:** `?ref=KS123456` parametresi herhangi bir URL'e eklenebilir!

### 2. Otomatik Takip

Kullanıcı partner linkine tıkladığında:

1. ✅ `ReferralTracker` component otomatik çalışır
2. ✅ URL'den `ref` parametresini yakalar
3. ✅ Partner ID'yi **30 gün** geçerli olacak şekilde kaydeder:
   - Cookie'ye kaydeder
   - LocalStorage'a yedek olarak kaydeder
4. ✅ Kullanıcı sitede gezinirken partner ID korunur

### 3. Form Gönderimi

Kullanıcı vize başvuru formunu doldurduğunda:

1. ✅ Form otomatik olarak kaydedilmiş `partner_id`'yi alır
2. ✅ `applications` tablosuna `partner_id` ile kaydedilir
3. ✅ `affiliate_referrals` tablosuna otomatik kayıt oluşturulur:
   - Müşteri bilgileri (ad, email, telefon)
   - Ülke ve vize tipi
   - Başvuru durumu: "pending" (İşlem Bekleniyor)
   - Komisyon: 0 (Admin tarafından belirlenecek)
   - Kaynak: "link" (otomatik)

## 🔒 Gizlilik ve Güvenlik

### Partner Görünümü

Partnerler kendi dashboard'larında:
- ❌ Müşteri ad/soyad bilgilerini **GÖREMEZ**
- ❌ Müşteri e-mail adreslerini **GÖREMEZ**
- ❌ Müşteri telefon numaralarını **GÖREMEZ**
- ✅ Sadece başvuru numarası, ülke, durum ve komisyon bilgilerini görür

### Admin Görünümü

Admin panelinde:
- ✅ Tüm müşteri bilgileri görünür
- ✅ Manuel komisyon girişi yapılabilir
- ✅ Başvuru durumu güncellenebilir
- ✅ Ödeme durumu işaretlenebilir

## 💰 Komisyon Sistemi

### Manuel Hesaplama

Komisyonlar **manuel olarak** hesaplanır çünkü:
- Her başvurunun paketi farklı olabilir
- Sabit fiyat yok
- Teklifler farklı sistemden takip ediliyor

### Admin İşlemleri

1. **Başvuru Gelir:**
   - `applications` tablosunda `partner_id` görünür
   - `affiliate_referrals` tablosunda kayıt oluşur
   - Durum: "İşlem Bekleniyor"

2. **Teklif Hazırlanır:**
   - Admin başka sistemde teklif hazırlar
   - Müşteri onaylar

3. **Komisyon Belirlenir:**
   - Admin `Partner Yönetimi > Partner Detayları` sayfasına gider
   - Referans listesinde ilgili başvuruyu bulur
   - Komisyon tutarını girer (örn: 500.00)
   - Durum güncellenir: "Onaylandı"

4. **Ödeme Yapılır:**
   - Partner'e ödeme yapıldığında
   - "Ödendi" checkbox'ı işaretlenir

## 📊 Durum Kodları

| Durum | Açıklama | Partner Görünümü |
|-------|----------|------------------|
| `pending` | İşlem Bekleniyor | İşlem Bekleniyor |
| `processing` | İşlemde | İşlemde |
| `approved` | Onaylandı | Onaylandı |
| `rejected` | Reddedildi | Reddedildi |

## 🔍 Takip Senaryoları

### Senaryo 1: Link + Form
```
1. Partner linki paylaşır: ?ref=KS123456
2. Kullanıcı tıklar → Cookie kaydedilir (30 gün)
3. Sitede gezer
4. Vize başvuru formunu doldurur
5. ✅ Otomatik partner'a atanır
6. Admin komisyon belirler
```

### Senaryo 2: Link + Telefon
```
1. Partner linki paylaşır: ?ref=KS123456
2. Kullanıcı tıklar → Cookie kaydedilir
3. Telefon arar
4. Admin başvuruyu kontrol eder
5. ✅ partner_id zaten kayıtlı
6. Admin manuel komisyon ekler
```

### Senaryo 3: Sadece İsim
```
1. Müşteri telefon eder, partner adını verir
2. Admin manuel referral ekler:
   - Partner ID seçer
   - Müşteri bilgilerini girer
   - Kaynak: "manual"
3. Komisyon belirlenir
```

## 🛠️ Teknik Detaylar

### Cookie/LocalStorage

```javascript
// Cookie adı
ks_partner_ref = "KS123456"

// Geçerlilik süresi
30 gün

// Yedekleme
LocalStorage'da da saklanır
```

### Veritabanı Tabloları

**applications:**
- `partner_id`: VARCHAR(20) - Partner referans kodu
- Müşteri bilgileri
- Başvuru detayları

**affiliate_referrals:**
- `partner_id`: VARCHAR(20) - Partner referans kodu
- `customer_name`, `customer_email`, `customer_phone`
- `country_code`, `visa_type`
- `application_status`: pending/processing/approved/rejected
- `commission_amount`: NUMERIC(10,2) - Manuel girilir
- `commission_paid`: BOOLEAN - Ödeme durumu
- `referral_source`: link/manual
- `notes`: TEXT

**affiliate_partners:**
- `total_referrals`: Toplam referans sayısı (otomatik)
- `total_earnings`: Toplam kazanç (otomatik hesaplanır)

## 📱 Partner Dashboard

Partner dashboard'da gösterilen bilgiler:

```
Başvuru #1
🔗 Link
Amerika - Tourist Visa
İşlem Bekleniyor
Belirlenmedi
06.01.2026
```

**Gösterilmeyen:**
- Müşteri adı
- E-mail
- Telefon

## 🎯 Admin Panel İşlemleri

### Partner Detayları Sayfası

1. `Admin Panel > Partner Yönetimi`
2. Partner'e tıkla
3. Referanslar listesi açılır
4. Her referans için:
   - Müşteri bilgileri görünür (sadece admin)
   - Durum dropdown'dan değiştirilebilir
   - Komisyon input'una tutar girilir
   - "Ödendi" checkbox'ı işaretlenebilir

### Komisyon Girişi

```
Müşteri: Ahmet Yılmaz
ahmet@email.com
0555 123 45 67

Ülke: Amerika
Vize: Tourist Visa

Durum: [Onaylandı ▼]

Komisyon: [500.00] ₺

Ödendi: [✓]

Tarih: 06.01.2026
```

## 🚀 Kullanım Örnekleri

### Partner Link Oluşturma

```javascript
// Basit link
const partnerLink = `https://www.kolayseyahat.net?ref=${partnerId}`;

// Ülke sayfası
const countryLink = `https://www.kolayseyahat.net/amerika?ref=${partnerId}`;

// Form linki (dolu)
const formLink = `https://www.kolayseyahat.net/vize-basvuru-formu?country_id=4&country_name=Amerika&package_id=13&package_name=Amerika+Vizesi&ref=${partnerId}`;
```

### Manuel Referral Ekleme (SQL)

```sql
INSERT INTO affiliate_referrals (
  partner_id,
  customer_name,
  customer_email,
  customer_phone,
  country_code,
  visa_type,
  application_status,
  commission_amount,
  referral_source,
  notes
) VALUES (
  'KS123456',
  'Ahmet Yılmaz',
  'ahmet@email.com',
  '0555 123 45 67',
  'Amerika',
  'Tourist Visa',
  'pending',
  0,
  'manual',
  'Telefon ile başvuru - Partner adını verdi'
);
```

## ⚠️ Önemli Notlar

1. **30 Gün Geçerlilik:** Kullanıcı bugün linke tıklasa, 30 gün sonra başvuru yapsa bile partner'a atanır
2. **Tüm URL'ler:** `?ref=` parametresi herhangi bir URL'e eklenebilir
3. **Gizlilik:** Partnerler müşteri bilgilerini göremez
4. **Manuel Komisyon:** Her başvuru için admin manuel komisyon belirler
5. **Otomatik Toplam:** Partner toplam kazancı otomatik hesaplanır

## 📞 Destek

Sorularınız için: yildirayv4@gmail.com
