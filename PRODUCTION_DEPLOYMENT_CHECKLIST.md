# Production Deployment Checklist

## ✅ Database Migrations

### Tamamlanan Migrations
- ✅ `add_partner_id_to_applications` - Applications tablosuna partner_id kolonu eklendi
- ✅ `fix_affiliate_system_and_add_partner_tracking_v2` - Affiliate sistem tabloları oluşturuldu

### Migration Durumu
```
✅ user_affiliates - Affiliate başvuruları
✅ affiliate_partners - Onaylı partnerlar
✅ affiliate_referrals - Referans takibi
✅ applications.partner_id - Partner tracking kolonu
```

## ✅ Edge Functions

### Gerekli Edge Functions
1. **affiliate-application-notification** ✅
   - Başvuru e-mail bildirimleri
   - Admin + Kullanıcı e-mailleri
   - Status: Deployed

2. **partner-welcome-email** ✅
   - Partner onay e-maili
   - Şifre sıfırlama linki
   - Status: Deployed

### Deployment Komutu
```bash
# Edge Functions zaten deploy edilmiş
# Gerekirse tekrar deploy:
supabase functions deploy affiliate-application-notification
supabase functions deploy partner-welcome-email
```

## ✅ Environment Variables

### Production'da Gerekli Env Variables

**Supabase:**
- ✅ `NEXT_PUBLIC_SUPABASE_URL`
- ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- ✅ `SUPABASE_SERVICE_ROLE_KEY`

**Email (Resend):**
- ✅ `RESEND_API_KEY`

**Site URL:**
- ⚠️ `NEXT_PUBLIC_APP_URL` - Production URL'e güncellenmeli
- ⚠️ `NEXT_PUBLIC_SITE_URL` - Production URL'e güncellenmeli

### Production Environment Variables

```bash
# Vercel/Production'da ayarlanmalı:
NEXT_PUBLIC_APP_URL=https://www.kolayseyahat.net
NEXT_PUBLIC_SITE_URL=https://www.kolayseyahat.net
NEXT_PUBLIC_SUPABASE_URL=https://kcocpunrmubppaskklzo.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[mevcut key]
SUPABASE_SERVICE_ROLE_KEY=[mevcut key]
RESEND_API_KEY=[mevcut key]
```

## ✅ Code Changes

### Yeni Dosyalar
- ✅ `/src/lib/referralTracking.ts` - Referral tracking utility
- ✅ `/src/components/ReferralTracker.tsx` - Otomatik tracking component
- ✅ `/src/components/forms/PartnerLoginForm.tsx` - Partner giriş formu
- ✅ `/src/app/[locale]/partner-giris/page.tsx` - Partner giriş sayfası
- ✅ `/src/app/admin/partnerler/page.tsx` - Partner yönetim sayfası

### Güncellenen Dosyalar
- ✅ `/src/app/[locale]/layout.tsx` - ReferralTracker eklendi
- ✅ `/src/app/[locale]/affiliate/page.tsx` - Partner giriş formu eklendi
- ✅ `/src/app/[locale]/partner/page.tsx` - Gizlilik güncellemesi
- ✅ `/src/components/forms/ApplicationForm.tsx` - Partner tracking eklendi
- ✅ `/src/lib/queries.ts` - Partner referral kayıt eklendi
- ✅ `/src/app/admin/affiliate-basvurular/page.tsx` - Otomatik partner oluşturma
- ✅ `/src/components/admin/AdminSidebar.tsx` - Partner menüsü eklendi

## ✅ Database Schema

### Tablolar
```sql
-- user_affiliates (mevcut)
-- affiliate_partners (mevcut)
-- affiliate_referrals (mevcut)
-- applications.partner_id (yeni kolon)
```

### Indexes
```sql
-- idx_applications_partner_id (oluşturuldu)
```

### Foreign Keys
```sql
-- applications.partner_id -> affiliate_partners.partner_id (oluşturuldu)
```

## ⚠️ Production Öncesi Yapılacaklar

### 1. Environment Variables Güncelleme
```bash
# Vercel Dashboard'da:
NEXT_PUBLIC_APP_URL=https://www.kolayseyahat.net
NEXT_PUBLIC_SITE_URL=https://www.kolayseyahat.net
```

### 2. Edge Functions Environment Variables
```bash
# Supabase Dashboard > Edge Functions > Secrets:
RESEND_API_KEY=[production key]
SUPABASE_SERVICE_ROLE_KEY=[production key]
```

### 3. Build Test
```bash
npm run build
# Hata kontrolü
```

### 4. TypeScript Kontrol
```bash
npm run type-check
# veya
npx tsc --noEmit
```

## 🚀 Deployment Adımları

### 1. Database Migration (Supabase)
```bash
# Migrations zaten production'da
# Kontrol için:
# Supabase Dashboard > Database > Migrations
```

### 2. Edge Functions (Supabase)
```bash
# Zaten deployed
# Kontrol için:
# Supabase Dashboard > Edge Functions
```

### 3. Next.js App (Vercel)
```bash
# Git push ile otomatik deploy
git add .
git commit -m "feat: Partner referral tracking system"
git push origin main

# Vercel otomatik deploy edecek
```

### 4. Environment Variables (Vercel)
```
1. Vercel Dashboard > Project > Settings > Environment Variables
2. NEXT_PUBLIC_APP_URL güncelle
3. NEXT_PUBLIC_SITE_URL güncelle
4. Redeploy trigger et
```

## ✅ Post-Deployment Kontrol

### 1. Referral Tracking Test
```
1. Partner linkine git: https://www.kolayseyahat.net?ref=KS123456
2. Browser Console'da kontrol: Cookie kaydedildi mi?
3. Form doldur
4. Admin panelde partner_id görünüyor mu?
```

### 2. Partner Login Test
```
1. https://www.kolayseyahat.net/affiliate
2. Partner giriş formu görünüyor mu?
3. Test login yap
4. Dashboard açılıyor mu?
```

### 3. Admin Panel Test
```
1. /admin/affiliate-basvurular
2. Başvuru onayla
3. Partner oluşturuluyor mu?
4. E-mail gidiyor mu?
```

### 4. Email Test
```
1. Test başvurusu yap
2. Admin e-mail geldi mi?
3. Kullanıcı e-mail geldi mi?
4. Partner onay e-maili geldi mi?
```

## 📊 Monitoring

### Kontrol Edilecekler
- ✅ Supabase Dashboard > Logs
- ✅ Vercel Dashboard > Logs
- ✅ Edge Functions Logs
- ✅ Database Queries Performance
- ✅ Email Delivery (Resend Dashboard)

## 🔒 Güvenlik

### Kontrol Listesi
- ✅ RLS policies aktif
- ✅ Service role key sadece server-side
- ✅ Partner gizlilik koruması
- ✅ Auth flow güvenli
- ✅ CORS ayarları doğru

## 📝 Dokümantasyon

### Oluşturulan Dökümanlar
- ✅ `AFFILIATE_SYSTEM_README.md`
- ✅ `PARTNER_REFERRAL_TRACKING.md`
- ✅ `PRODUCTION_DEPLOYMENT_CHECKLIST.md` (bu dosya)

## ⚡ Hızlı Deployment Komutu

```bash
# 1. Build test
npm run build

# 2. Git push (Vercel otomatik deploy)
git add .
git commit -m "feat: Partner referral tracking system - Production ready"
git push origin main

# 3. Vercel'de environment variables güncelle
# 4. Redeploy trigger et
```

## ✅ HAZIR!

Sistem production'a alınmaya hazır:
- ✅ Tüm migrations uygulandı
- ✅ Edge Functions deploy edildi
- ✅ Code değişiklikleri tamamlandı
- ✅ Dokümantasyon hazır
- ⚠️ Sadece environment variables güncellenmeli (NEXT_PUBLIC_APP_URL, NEXT_PUBLIC_SITE_URL)

## 🎯 Son Kontrol

```bash
# Build başarılı mı?
npm run build

# TypeScript hataları var mı?
npx tsc --noEmit

# Lint hataları var mı?
npm run lint
```

Herhangi bir hata yoksa **DEPLOY EDİLEBİLİR!** 🚀
