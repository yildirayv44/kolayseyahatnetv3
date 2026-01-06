# Affiliate Sistemi - Kolay Seyahat

## Genel Bakış

Kolay Seyahat affiliate sistemi, partnerların vize başvurularını yönlendirerek komisyon kazanmasını sağlayan basit ve etkili bir sistemdir.

## Özellikler

### ✅ Tamamlanan Özellikler

1. **Başvuru Formu**
   - Affiliate başvuru formu: `/affiliate`
   - Form doldurulduğunda otomatik e-mail bildirimi
   - Kullanıcıya onay e-maili gönderimi

2. **E-mail Bildirimleri**
   - Admin'e yeni başvuru bildirimi
   - Başvuru sahibine onay e-maili
   - **Partner onaylandığında hoş geldin e-maili**
   - **Şifre sıfırlama linki ile giriş bilgileri**
   - Resend API kullanılarak gönderim

3. **Kimlik Doğrulama (Auth)**
   - Supabase Auth entegrasyonu
   - Otomatik kullanıcı hesabı oluşturma
   - Şifre sıfırlama sistemi
   - Güvenli giriş/çıkış
   - Partner dashboard koruması

3. **Veritabanı Yapısı**
   - `user_affiliates`: Başvuru kayıtları
   - `affiliate_partners`: Onaylı partnerlar
   - `affiliate_referrals`: Referans takibi
   - RLS politikaları aktif

4. **Partner Tracking**
   - Benzersiz Partner ID (örn: KS123456)
   - Referans linki sistemi
   - Manuel referans ekleme desteği

5. **Komisyon Seviyeleri**
   - **Standart**: %10 komisyon
   - **Enterprise**: %20 komisyon
   - **Kurumsal**: %30 komisyon

6. **Partner Dashboard**
   - Partner bilgileri görüntüleme
   - Referans linki kopyalama
   - Referans listesi ve takibi
   - Kazanç özeti

## Kullanım

### Affiliate Başvurusu

1. Kullanıcı `/affiliate` sayfasına gider
2. Formu doldurur (ad, e-posta, telefon, vb.)
3. Form gönderilir:
   - Veritabanına kaydedilir
   - Admin'e e-mail gönderilir
   - Kullanıcıya onay e-maili gönderilir

### Partner Onaylama (Otomatik - Admin Panelinden)

**En Hızlı ve Basit Yöntem:**

1. `Admin Panel > Affiliate Başvuruları` sayfasına git
2. Başvuruyu incele
3. Durum dropdown'dan "Onaylandı" seç
4. Açılan popup'ta komisyon seviyesi seç (1, 2 veya 3)
5. Sistem otomatik olarak:
   - ✅ Supabase Auth hesabı oluşturur
   - ✅ Benzersiz Partner ID üretir
   - ✅ Partner kaydını oluşturur
   - ✅ Şifre sıfırlama linki ile hoş geldin e-maili gönderir

**Partner Ne Yapacak:**

1. E-mailini kontrol eder
2. "Şifre Oluştur" butonuna tıklar
3. Yeni şifresini belirler
4. `/partner-giris` sayfasından giriş yapar
5. `/partner` dashboard'unda işlemlerini takip eder

### Referans Takibi

#### Otomatik (Link ile)
Partner linki: `https://www.kolayseyahat.net?ref=KS123456`
- Link üzerinden gelen başvurular otomatik olarak partnera atanır

#### Manuel (İsim ile)
Müşteri başvuru sırasında partner adını verirse:

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
  'Müşteri Adı',
  'musteri@email.com',
  '0555 987 65 43',
  'USA',
  'Tourist Visa',
  'pending',
  500.00, -- Komisyon tutarı
  'manual',
  'Partner adını referans olarak verdi'
);
```

## Veritabase Tabloları

### user_affiliates
Affiliate başvuruları
- `id`: Başvuru ID
- `name`, `email`, `phone`: İletişim bilgileri
- `website`, `social_media`: Platform bilgileri
- `status`: 0=pending, 1=approved, 2=rejected

### affiliate_partners
Onaylı partnerlar
- `id`: Partner ID
- `partner_id`: Benzersiz partner kodu (KS123456)
- `email`: Partner e-mail (Supabase Auth ile eşleşir)
- `commission_level`: standard/enterprise/kurumsal
- `commission_rate`: Komisyon oranı (10/20/30)
- `total_referrals`: Toplam referans sayısı
- `total_earnings`: Toplam kazanç

### auth.users (Supabase Auth)
Kimlik doğrulama
- Partner onaylandığında otomatik oluşturulur
- `email`: Partner e-mail adresi
- `user_metadata`: Partner bilgileri (name, partner_id, role)
- Şifre sıfırlama ve giriş yönetimi

### affiliate_referrals
Referans kayıtları
- `id`: Referans ID
- `partner_id`: Partner kodu
- `customer_name`, `customer_email`: Müşteri bilgileri
- `application_status`: pending/approved/rejected
- `commission_amount`: Komisyon tutarı
- `commission_paid`: Ödeme durumu
- `referral_source`: link/manual

## E-mail Konfigürasyonu

Edge Function: `affiliate-application-notification`

Gerekli environment variable:
```bash
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxx
```

E-mail gönderimi:
1. Admin'e: `yildirayv4@gmail.com`
2. Başvuru sahibine: Başvuru e-mail adresi

## Partner Giriş ve Dashboard

### Giriş Sayfası
URL: `/partner-giris`

Özellikler:
- E-posta ve şifre ile giriş
- "Şifremi Unuttum" özelliği
- Şifre sıfırlama e-maili gönderimi
- Supabase Auth entegrasyonu

### Partner Dashboard
URL: `/partner`

**Giriş Gerektirir** - Kimlik doğrulaması yapılmamış kullanıcılar `/partner-giris` sayfasına yönlendirilir

Özellikler:
- Partner ID ve referans linki görüntüleme
- Kopyalama butonu (clipboard)
- Referans listesi ve takibi
- Komisyon özeti
- Kazanç takibi
- Gerçek zamanlı istatistikler

### Şifre Sıfırlama Akışı

1. Partner `/partner-giris` sayfasında "Şifremi Unuttum" tıklar
2. E-posta adresini girer
3. Supabase otomatik şifre sıfırlama e-maili gönderir
4. Partner e-maildeki linke tıklar
5. Yeni şifresini belirler
6. Giriş yapabilir

## Güvenlik

- RLS (Row Level Security) aktif
- Anonymous kullanıcılar sadece başvuru yapabilir
- Authenticated kullanıcılar kendi verilerini görebilir
- Service role tam erişime sahip

## Önemli Notlar

1. **Basit Yapı**: Sistem karmaşık değil, temel özelliklere odaklanmış
2. **Manuel Onay**: Partner onayı manuel yapılır
3. **Referans Takibi**: Hem link hem manuel referans desteklenir
4. **Komisyon Seviyeleri**: 3 seviye - %10, %20, %30
5. **E-mail Bildirimleri**: Her başvuruda otomatik gönderim

## Gelecek Geliştirmeler (Opsiyonel)

- [ ] Admin panelinde partner onaylama arayüzü
- [ ] Otomatik komisyon hesaplama
- [ ] Ödeme takip sistemi
- [ ] Partner performans raporları
- [ ] Referans linki analitikleri

## Sorun Giderme

### Form hata veriyor
- RLS politikalarını kontrol edin
- Edge Function'ın çalıştığından emin olun
- Console loglarını kontrol edin

### E-mail gelmiyor
- `RESEND_API_KEY` environment variable'ı kontrol edin
- `SUPABASE_SERVICE_ROLE_KEY` environment variable'ı kontrol edin
- Resend Dashboard'da loglara bakın
- Spam klasörünü kontrol edin
- Edge Function loglarını kontrol edin

### Partner giriş yapamıyor
- Supabase Auth hesabı oluşturuldu mu?
- E-mail doğrulandı mı? (email_confirm: true)
- Şifre sıfırlama linki kullanıldı mı?
- Partner `/partner-giris` sayfasını kullanıyor mu?

### Partner dashboard boş
- Kullanıcının `affiliate_partners` tablosunda kaydı var mı?
- `status = 'active'` mi?
- E-mail adresi Supabase Auth ile eşleşiyor mu?
- Kullanıcı giriş yapmış mı?

### "Kullanıcı hesabı oluşturulamadı" hatası
- `SUPABASE_SERVICE_ROLE_KEY` doğru mu?
- Admin panelinde service role key kullanılıyor mu?
- E-mail adresi zaten kayıtlı olabilir (Supabase Auth'da kontrol edin)

## İletişim

Sorularınız için: yildirayv4@gmail.com
