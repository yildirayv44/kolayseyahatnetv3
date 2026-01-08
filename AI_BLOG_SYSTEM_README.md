# 🤖 AI Blog İçerik Üretim Sistemi

## 📋 Genel Bakış

Bu sistem, ülke bazlı blog içeriklerini AI ile otomatik olarak üreten, editor onayı ile yayınlayan tam entegre bir çözümdür.

## 🎯 Özellikler

- ✅ **Ülke Bazlı Planlama**: Her ülke için aylık 30 konu üretimi
- ✅ **AI Konu Üretimi**: ChatGPT ile SEO-friendly konu başlıkları
- ✅ **Editor Onay Sistemi**: İki aşamalı onay (Plan → İçerik)
- ✅ **Otomatik İçerik Üretimi**: Samimi, insan gibi blog yazıları
- ✅ **Pexels Entegrasyonu**: Otomatik kapak görseli
- ✅ **SEO Optimizasyonu**: Meta title, description, internal links
- ✅ **Performans Takibi**: İçerik başarı metrikleri

## 🗂️ Sistem Mimarisi

### Database Tabloları

1. **ai_blog_plans**: Plan yönetimi
2. **ai_blog_topics**: Konu havuzu
3. **ai_blog_content**: Üretilen içerikler
4. **ai_blog_performance**: Performans metrikleri

### API Endpoints

```
POST   /api/admin/ai-blog/create-plan          # Plan oluştur
GET    /api/admin/ai-blog/plans                # Planları listele
GET    /api/admin/ai-blog/plan-details         # Plan detayları
PATCH  /api/admin/ai-blog/update-topic         # Konu düzenle
DELETE /api/admin/ai-blog/update-topic         # Konu sil
POST   /api/admin/ai-blog/approve-plan         # Planı onayla
POST   /api/admin/ai-blog/generate-content     # İçerik üret
POST   /api/admin/ai-blog/publish-content      # İçerik yayınla
```

### Admin Sayfaları

```
/admin/ai-blog-planner                         # Ana dashboard
/admin/ai-blog-planner/review/[plan_id]       # Plan inceleme
/admin/ai-blog-planner/content/[plan_id]      # İçerik inceleme
```

## 🚀 Kullanım Kılavuzu

### 1. Plan Oluşturma

1. `/admin/ai-blog-planner` sayfasına gidin
2. Ülke seçin (örn: Amerika)
3. Ay ve yıl seçin (örn: Ocak 2026)
4. Konu sayısı belirleyin (varsayılan: 30)
5. **"Plan Oluştur ve Konuları Üret"** butonuna basın

**Süre**: ~30 saniye

**Sonuç**: 30 konu başlığı AI tarafından üretilir

### 2. Plan İnceleme ve Düzenleme

Plan oluşturulduktan sonra otomatik olarak inceleme sayfasına yönlendirilirsiniz.

**Yapabilecekleriniz**:
- ✏️ Konu başlıklarını düzenle
- 🗑️ İstenmeyen konuları sil
- ⬆️⬇️ Öncelikleri ayarla
- ➕ Yeni konu ekle
- 🔍 Kategori ve durum filtrele

**Konu Detayları**:
- Başlık (TR/EN)
- Açıklama
- Kategori (Vize, Seyahat, Pratik Bilgiler, vb.)
- Hedef anahtar kelimeler
- Tahmini arama hacmi
- Keyword zorluğu
- Hedef kelime sayısı
- İçerik taslağı

### 3. Planı Onaylama ve İçerik Üretimi

Konuları inceledikten sonra:

1. **"Planı Onayla ve Üretime Başla"** butonuna basın
2. Sistem otomatik olarak her konu için içerik üretmeye başlar
3. Her içerik için:
   - Tam blog yazısı (1500-2500 kelime)
   - Meta title ve description
   - Pexels'ten kapak görseli
   - Internal linkler
   - SEO optimizasyonu

**Süre**: ~30 dakika (30 konu için)

### 4. İçerik İnceleme

İçerikler üretildikten sonra `/admin/ai-blog-planner/content/[plan_id]` sayfasına gidin.

**Her içerik için görüntülenen**:
- Kapak görseli (Pexels)
- Başlık ve meta description
- Kelime sayısı
- SEO skoru (0-100)
- Okunabilirlik skoru (0-100)
- Durum (İncelemede, Onaylandı, Yayında)

**Yapabilecekleriniz**:
- 👁️ **Önizle**: İçeriği tam ekranda oku
- ✅ **Onayla**: İçeriği yayına hazır işaretle
- ✏️ **Düzenle**: Küçük düzeltmeler yap
- 🚀 **Yayınla**: Onaylanan içeriği yayına al

### 5. Yayınlama

Onaylanan içerikler için **"Yayınla"** butonuna basın.

**Sistem otomatik olarak**:
1. `blogs` tablosuna kayıt oluşturur
2. Blog URL'i oluşturur: `/blog/[slug]`
3. Sayfayı revalidate eder
4. İçerik canlıya alınır

## 📊 Konu Kategorileri

### 1. Vize & Prosedürler (30%)
- Vize başvuru rehberleri
- Mülakat soruları
- Gerekli belgeler
- Vize ücretleri
- Red nedenleri

**Örnek**: "Amerika Vize Mülakat Soruları: 2026 Güncel Liste"

### 2. Seyahat Planlama (35%)
- Şehir rehberleri
- Gezi rotaları
- Konaklama önerileri
- Ulaşım bilgileri
- Bütçe planlaması

**Örnek**: "New York'ta 3 Gün: Günlük 100 Dolara Gezi Planı"

### 3. Pratik Bilgiler (20%)
- Para ve döviz
- İnternet ve SIM kart
- Güvenlik ipuçları
- Sağlık sigortası
- Alışveriş rehberi

**Örnek**: "Amerika'da İnternet: SIM Kart ve WiFi Seçenekleri"

### 4. Kültür & Yaşam (10%)
- Yemek kültürü
- Gelenekler
- Görgü kuralları
- Günlük yaşam

**Örnek**: "Amerika'da Bahşiş Kültürü: Ne Kadar Vermeli?"

### 5. Karşılaştırma & Listicle (5%)
- Top 10 listeleri
- Ülke karşılaştırmaları
- En iyi yerler

**Örnek**: "Amerika'nın En Güzel 15 Milli Parkı"

## 🎨 İçerik Özellikleri

### AI Yazım Stili

**✅ Samimi ve Doğal**:
```
"Geçen yaz New York'a gittiğimde..."
"Şahsen ben hep..."
"Benim tavsiyem şu olur:"
```

**❌ Resmi ve Yapay**:
```
"Bu makalede incelenecektir..."
"Araştırmalar göstermektedir ki..."
"Sonuç olarak söylemek gerekirse..."
```

### SEO Optimizasyonu

- **Meta Title**: `[Başlık] - Kolay Seyahat` (max 60 karakter)
- **Meta Description**: 150-160 karakter, CTA içerir
- **Internal Links**: 2-3 adet, doğal akışta
- **Hedef Keyword**: İlk 100 kelimede geçer
- **H2/H3 Başlıklar**: SEO-friendly yapı

### Görsel Stratejisi

- **Kaynak**: Pexels API
- **Format**: Landscape (yatay)
- **Kalite**: Large2x (yüksek çözünürlük)
- **Alt Text**: SEO-friendly açıklama
- **Kredi**: Fotoğrafçı bilgisi otomatik eklenir

## 🔧 Teknik Detaylar

### Environment Variables

```env
# OpenAI
OPENAI_API_KEY=sk-...

# Pexels
PEXELS_API_KEY=...

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
```

### AI Model

- **Model**: GPT-4o
- **Temperature**: 0.8-0.9 (yaratıcı)
- **Max Tokens**: 4000
- **Response Format**: JSON

### Maliyet Tahmini

**Konu Üretimi**:
- 30 konu = ~5,000 token
- Maliyet: ~$0.015

**İçerik Üretimi**:
- 1 içerik (2000 kelime) = ~8,000 token
- Maliyet: ~$0.12
- 30 içerik = ~$3.60

**Toplam (1 plan)**: ~$3.62

## 📈 Performans Metrikleri

Sistem otomatik olarak şu metrikleri takip eder:

- **Trafik**: Görüntüleme, benzersiz ziyaretçi
- **Engagement**: Sayfa süresi, bounce rate
- **Conversion**: Internal link tıklamaları
- **SEO**: Organik trafik, keyword sıralamaları

## 🐛 Sorun Giderme

### Plan Oluşturulamıyor

**Kontrol Edin**:
- OpenAI API key tanımlı mı?
- Supabase bağlantısı çalışıyor mu?
- Aynı ülke/ay için plan var mı? (Unique constraint)

### İçerik Üretilmiyor

**Kontrol Edin**:
- Topic status 'approved' mı?
- OpenAI API limiti aşıldı mı?
- Pexels API key tanımlı mı?

### Görsel Yüklenmiyor

**Kontrol Edin**:
- Pexels API key geçerli mi?
- Supabase storage bucket 'blog-images' var mı?
- Storage RLS policy'leri doğru mu?

### Yayınlama Başarısız

**Kontrol Edin**:
- Content status 'approved' mı?
- `blogs` tablosuna yazma yetkisi var mı?
- Slug benzersiz mi?

## 🔐 Güvenlik

### RLS Policies

Tüm tablolarda Row Level Security aktif:
- Service role tam erişim
- Anon key sadece okuma (gerekirse)

### API Güvenliği

- Admin endpoint'leri authentication gerektirir
- Rate limiting önerilir
- CORS ayarları kontrol edilmeli

## 📝 Workflow Özeti

```
1. Plan Oluştur
   ↓
2. AI Konuları Üretir (30 adet)
   ↓
3. Editor İnceler ve Düzenler
   ↓
4. Planı Onayla
   ↓
5. AI İçerikleri Üretir (30 adet)
   ↓
6. Editor İçerikleri İnceler
   ↓
7. İçerikleri Onayla
   ↓
8. İçerikleri Yayınla
   ↓
9. Blog Canlıda! 🎉
```

## 🎯 Best Practices

### Konu Seçimi

- ✅ Aranabilir başlıklar kullanın
- ✅ Spesifik ve net olun
- ✅ Sayı ve yıl ekleyin ("10 İpucu", "2026 Rehberi")
- ❌ Çok genel başlıklardan kaçının

### İçerik İnceleme

- ✅ SEO skoru >85 olmalı
- ✅ Okunabilirlik skoru >75 olmalı
- ✅ Internal linkler doğal olmalı
- ✅ Görsel içeriğe uygun olmalı

### Yayınlama Stratejisi

- 📅 Düzenli yayın takvimi oluşturun
- 🎯 Önce yüksek öncelikli konuları yayınlayın
- 📊 Performansı takip edin
- 🔄 Başarılı konuları çoğaltın

## 🚀 Gelecek Geliştirmeler

- [ ] Toplu yayınlama
- [ ] Otomatik yayın takvimi
- [ ] A/B test için başlık varyasyonları
- [ ] Google Search Console entegrasyonu
- [ ] Otomatik internal link önerileri
- [ ] İçerik güncelleme sistemi

## 📞 Destek

Sorun yaşarsanız:
1. Bu README'yi kontrol edin
2. Database migration'ın çalıştığından emin olun
3. Environment variables'ları kontrol edin
4. API endpoint'lerini test edin

---

**Sistem Versiyonu**: 1.0.0  
**Son Güncelleme**: 2026-01-09  
**Geliştirici**: Kolay Seyahat Tech Team
