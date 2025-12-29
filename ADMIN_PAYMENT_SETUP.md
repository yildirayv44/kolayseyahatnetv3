# Admin Panel - Ödeme Takibi Kurulumu

## Veritabanı Migration

Aşağıdaki SQL migration dosyası oluşturuldu:
`supabase/migrations/add_payment_fields_to_applications.sql`

Bu migration'ı Supabase projenize uygulayın:

```bash
# Supabase CLI ile
supabase db push

# Veya Supabase Dashboard'dan SQL Editor'de çalıştırın
```

## Yeni Alanlar

`applications` tablosuna eklenen alanlar:

- **wants_payment** (BOOLEAN): Kullanıcı şimdi ödeme yapmak istiyor mu?
- **payment_method** (TEXT): Ödeme yöntemi ('bank_transfer' veya 'credit_card')
- **payment_status** (TEXT): Ödeme durumu ('pending', 'completed', 'failed', 'cancelled')
- **payment_date** (TIMESTAMPTZ): Ödeme tamamlanma tarihi

## Admin Panel Önerileri

### 1. Başvuru Listesi Görünümü

Başvuru listesinde şu bilgileri gösterin:
- Ödeme durumu badge'i (renkli etiket)
- Ödeme yöntemi ikonu
- Ödeme tarihi (varsa)

### 2. Başvuru Detay Sayfası

Her başvuru için:
- Ödeme bilgileri kartı
- Ödeme durumu güncelleme butonu
- Banka havalesi seçilmişse: Dekont yükleme alanı
- Kredi kartı seçilmişse: Ödeme linki gönderme butonu

### 3. Filtreleme

Başvuruları şunlara göre filtreleyin:
- Ödeme durumu
- Ödeme yöntemi
- Ödeme bekleyenler
- Ödemesi tamamlananlar

### 4. Bildirimler

- Banka havalesi seçen kullanıcılara dekont hatırlatması
- Ödeme tamamlandığında admin'e bildirim
- Kullanıcıya ödeme onay e-postası

## Örnek SQL Sorguları

### Ödeme bekleyen başvurular
```sql
SELECT * FROM applications 
WHERE wants_payment = TRUE 
AND payment_status = 'pending'
ORDER BY created_at DESC;
```

### Banka havalesi bekleyenler
```sql
SELECT * FROM applications 
WHERE payment_method = 'bank_transfer' 
AND payment_status = 'pending'
ORDER BY created_at DESC;
```

### Ödeme durumu güncelleme
```sql
UPDATE applications 
SET payment_status = 'completed', 
    payment_date = NOW() 
WHERE id = 'APPLICATION_ID';
```

## Banka Hesap Bilgileri

Formda gösterilen hesap bilgileri:
- **Hesap Adı**: Kolay Seyahat Teknoloji Limited Şirketi
- **IBAN**: TR71 0004 6001 1888 8000 1215 84

## Güvenlik Notları

- Kredi kartı bilgileri asla veritabanında saklanmaz
- Tüm ödemeler 256-bit SSL ile şifrelenir
- 3D Secure zorunludur
- Ödeme gateway'i entegrasyonu için PCI-DSS uyumlu servis kullanın

## Mobil Uygulama Entegrasyonu

Mobil API endpoint'i de güncellenmelidir:
`/api/mobile/applications/route.ts`

Yeni alanları kabul edecek şekilde güncelleme yapın.
