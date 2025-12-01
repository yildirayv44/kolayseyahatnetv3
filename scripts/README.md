# Content Translation Script

Bu script, tüm Türkçe içeriği otomatik olarak İngilizce'ye çevirir.

## Gereksinimler

1. **OpenAI API Key**: GPT-4o-mini kullanarak çeviri yapar
2. **Supabase Service Role Key**: Database'e yazma yetkisi için gerekli
3. **tsx**: TypeScript dosyalarını çalıştırmak için

## Kurulum

### 1. Paketleri Yükle

```bash
npm install
```

### 2. Environment Variables

`.env.local` dosyasını oluşturun ve şu değişkenleri ekleyin:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
OPENAI_API_KEY=sk-your-openai-api-key
```

**Önemli:** `SUPABASE_SERVICE_ROLE_KEY` kullanın, `NEXT_PUBLIC_SUPABASE_ANON_KEY` değil!

### 3. OpenAI API Key Alma

1. https://platform.openai.com/ adresine gidin
2. API Keys bölümünden yeni key oluşturun
3. Key'i `.env.local` dosyasına ekleyin

## Kullanım

### Tüm İçeriği Çevir

```bash
npm run translate
```

Bu komut:
- ✅ Tüm ülkeleri çevirir (countries)
- ✅ Tüm blogları çevirir (blogs)
- ✅ Tüm danışmanları çevirir (users/consultants)

### Çevrilen Alanlar

**Countries (Ülkeler):**
- `title` → `title_en`
- `description` → `description_en`
- `contents` → `contents_en`
- `req_document` → `req_document_en`
- `price_contents` → `price_contents_en`
- `warning_notes` → `warning_notes_en`

**Blogs:**
- `title` → `title_en`
- `description` → `description_en`
- `contents` → `contents_en`

**Consultants (Danışmanlar):**
- `description` → `description_en`
- `aboutme` → `aboutme_en`

## Özellikler

### ✅ Güvenli Çeviri
- Sadece henüz çevrilmemiş içerikleri çevirir
- Mevcut İngilizce içeriğin üzerine yazmaz
- HTML tag'leri korunur

### ⏱️ Rate Limiting
- Her çeviri arasında 1 saniye bekler
- OpenAI API limitlerini aşmaz

### 📊 Progress Tracking
- Her adımı konsola yazdırır
- Hataları loglar
- Özet rapor verir

### 🎯 Field-Specific Prompts
- Her alan için özel çeviri promptları
- SEO-friendly başlıklar
- Professional tone

## Maliyet

GPT-4o-mini kullanır:
- **Input:** $0.150 / 1M tokens
- **Output:** $0.600 / 1M tokens

Örnek maliyet (tahmini):
- 50 ülke × 3000 kelime = ~$2-3
- 100 blog × 1000 kelime = ~$1-2
- 10 danışman × 500 kelime = ~$0.50

**Toplam:** ~$3-6 (yaklaşık)

## Sorun Giderme

### "Missing environment variables" Hatası
```bash
# .env.local dosyasını kontrol edin
cat .env.local
```

### "Rate limit exceeded" Hatası
Script'te bekleme süresini artırın:
```typescript
await new Promise(resolve => setTimeout(resolve, 2000)); // 1000 → 2000
```

### Belirli Bir Tabloyu Çevirmek
Script'i düzenleyin ve sadece istediğiniz fonksiyonu çağırın:
```typescript
// main() fonksiyonunda:
await translateCountries(); // Sadece ülkeler
// await translateBlogs();
// await translateConsultants();
```

## Yeniden Çeviri

Eğer çeviriyi yeniden yapmak isterseniz:

```sql
-- Tüm İngilizce içeriği sil
UPDATE countries SET title_en = NULL, description_en = NULL, contents_en = NULL;
UPDATE blogs SET title_en = NULL, description_en = NULL, contents_en = NULL;
UPDATE users SET description_en = NULL, aboutme_en = NULL WHERE role = 2;
```

Sonra scripti tekrar çalıştırın.

## Notlar

- ⚠️ Script çalışırken kesmeyin
- ⚠️ Büyük içerikler için zaman alabilir
- ✅ İstediğiniz zaman tekrar çalıştırabilirsiniz
- ✅ Sadece eksik çevirileri tamamlar
