# Email Notification Setup

## Resend API Key Nasıl Alınır?

### 1. Resend Hesabı Oluşturun
1. [https://resend.com](https://resend.com) adresine gidin
2. "Sign Up" butonuna tıklayın
3. Email ile kayıt olun

### 2. API Key Oluşturun
1. Dashboard'a giriş yapın
2. "API Keys" bölümüne gidin
3. "Create API Key" butonuna tıklayın
4. İsim verin (örn: "Kolay Seyahat Production")
5. "Full Access" seçin
6. API key'i kopyalayın

### 3. .env.local Dosyasına Ekleyin
```bash
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxx
```

### 4. Domain Doğrulama (Opsiyonel ama Önerilen)
1. Resend Dashboard'da "Domains" bölümüne gidin
2. "Add Domain" butonuna tıklayın
3. Domain adınızı girin (örn: kolayseyahat.net)
4. DNS kayıtlarını ekleyin:
   - SPF record
   - DKIM records
   - DMARC record (opsiyonel)
5. Doğrulama tamamlandıktan sonra email route'unda `from` adresini güncelleyin:
   ```typescript
   from: 'Kolay Seyahat <noreply@kolayseyahat.net>'
   ```

## Test Etme

### Local Test
```bash
# .env.local dosyasına API key ekleyin
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxx

# Development server'ı başlatın
npm run dev

# Başvuru formunu doldurun
# http://localhost:3000/vize-basvuru-formu
```

### Production Test
```bash
# Vercel'de environment variable ekleyin
# Settings > Environment Variables
# RESEND_API_KEY = re_xxxxxxxxxxxxxxxxxxxxxxxxxx

# Deploy edin
git push origin main
```

## Email İçeriği

Başvuru geldiğinde şu bilgiler email ile gönderilir:
- 👤 Ad Soyad
- 📧 E-posta
- 📱 Telefon
- 🌍 Ülke (varsa)
- 📦 Paket (varsa)
- 📝 Notlar (varsa)
- ⏰ Başvuru Zamanı

## Alıcı Email Adresi

Email bildirimleri şu adrese gönderilir:
- **yildirayv4@gmail.com**

Değiştirmek için:
`src/app/api/send-application-notification/route.ts` dosyasında:
```typescript
to: ['yildirayv4@gmail.com'], // Burası değiştirilebilir
```

## Önemli Notlar

1. **Free Plan Limitleri:**
   - Resend free plan: 100 email/gün
   - 3,000 email/ay
   - Yeterli değilse Pro plan'e geçin

2. **Email Gönderimi Başarısız Olursa:**
   - Başvuru yine de kaydedilir
   - Sadece email bildirimi atlanır
   - Console'da hata loglanır

3. **Production'da:**
   - Mutlaka domain doğrulama yapın
   - SPF/DKIM kayıtları ekleyin
   - Spam klasörüne düşme riskini azaltır

4. **Monitoring:**
   - Resend Dashboard'da email loglarını kontrol edin
   - Delivery rate'i takip edin
   - Bounce/complaint rate'lere dikkat edin

## Sorun Giderme

### Email Gelmiyor
1. Resend Dashboard > Logs'u kontrol edin
2. API key'in doğru olduğundan emin olun
3. Spam klasörünü kontrol edin
4. Domain doğrulamasını yapın

### "RESEND_API_KEY not configured" Hatası
1. .env.local dosyasında RESEND_API_KEY var mı?
2. Server'ı restart ettiniz mi?
3. Production'da Vercel environment variable eklediniz mi?

### Email Spam'e Düşüyor
1. Domain doğrulama yapın
2. SPF/DKIM kayıtları ekleyin
3. DMARC policy ekleyin
4. "onboarding@resend.dev" yerine kendi domain'inizi kullanın

## Alternatif Email Servisleri

Resend yerine başka servisler de kullanabilirsiniz:
- **SendGrid** (12,000 email/ay free)
- **Mailgun** (5,000 email/ay free)
- **AWS SES** (62,000 email/ay free)
- **Postmark** (100 email/ay free)

Route dosyasını (`src/app/api/send-application-notification/route.ts`) ilgili servisin API'sine göre güncelleyin.
