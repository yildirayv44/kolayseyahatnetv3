# Pexels API Entegrasyonu

Bu dokümantasyon, Pexels API kullanarak blog ve ülke içeriklerindeki görselleri yönetme sistemini açıklar.

## 🎯 Özellikler

1. **Otomatik Görsel Arama**: Prompt'tan Pexels'te görsel arama
2. **Kırık Görsel Düzeltme**: 404 dönen görselleri otomatik değiştirme
3. **Görsel İndirme ve Yükleme**: Pexels görsellerini Supabase Storage'a yükleme
4. **Admin Panel**: Görsel tespit ve yönetim arayüzü
5. **Manuel Yükleme**: Dosya yükleme desteği
6. **API Endpoints**: Admin paneli için REST API

## 🔑 API Key

```env
PEXELS_API_KEY=ydkwM7I4jF8FAb4ST0w7oifGhWQQ4oFpCoVuTgxsOjKrNHN4fGr7iqxc
```

## 📚 Kullanım

### 0. Admin Panel (Önerilen)

**URL:** `http://localhost:3000/admin/images`

Admin panelinde:
1. Tüm görselleri görüntüleyin (OK/Hata durumları)
2. Hatalı görselleri filtreleyin
3. "Değiştir" butonuna tıklayın
4. Pexels'ten arama yapın veya dosya yükleyin
5. Yeni görseli seçin - otomatik olarak indirilip yüklenecek

**Özellikler:**
- ✅ Tüm görselleri listele
- ✅ Durum kontrolü (OK/Hata)
- ✅ Filtreleme (Tümü/Çalışan/Hatalı)
- ✅ Arama
- ✅ Pexels entegrasyonu
- ✅ Manuel dosya yükleme
- ✅ Otomatik indirme ve yükleme

### 1. Görsel Arama API

**Endpoint:** `POST /api/images/generate`

**Request:**
```json
{
  "prompt": "istanbul turkey travel",
  "orientation": "landscape",
  "perPage": 5
}
```

**Response:**
```json
{
  "success": true,
  "photos": [
    {
      "id": 17257218,
      "url": "https://images.pexels.com/photos/17257218/...",
      "thumbnail": "https://images.pexels.com/photos/17257218/...",
      "alt": "açık hava, ağaçlar, akşam",
      "photographer": "Furkan Coban",
      "photographer_url": "https://www.pexels.com/..."
    }
  ],
  "total": 8000
}
```

**Örnek Kullanım:**
```bash
curl -X POST http://localhost:3000/api/images/generate \
  -H "Content-Type: application/json" \
  -d '{"prompt":"istanbul turkey travel","perPage":3}'
```

### 2. Kırık Görsel Düzeltme API

**Endpoint:** `POST /api/images/fix-broken`

**Request:**
```json
{
  "type": "blog",  // veya "country"
  "id": 26
}
```

**Response:**
```json
{
  "success": true,
  "replacedCount": 3,
  "message": "Fixed 3 broken image(s)"
}
```

**Örnek Kullanım:**
```bash
# Blog için
curl -X POST http://localhost:3000/api/images/fix-broken \
  -H "Content-Type: application/json" \
  -d '{"type":"blog","id":26}'

# Ülke için
curl -X POST http://localhost:3000/api/images/fix-broken \
  -H "Content-Type: application/json" \
  -d '{"type":"country","id":1}'
```

### 3. Script ile Toplu Düzeltme

Tüm blog ve ülke içeriklerindeki kırık görselleri düzeltmek için:

```bash
npx tsx scripts/fix-broken-images.ts
```

**Çıktı:**
```
🚀 Starting broken image fix process...

🔍 Checking blogs for broken images...

📊 Found 45 blogs

📝 Checking blog: Ev Alana Vatandaşlık Veren Ülkeler 2025
🔍 Broken image found: https://example.com/broken.jpg
✅ Replaced with Pexels image: https://images.pexels.com/...
✅ Fixed 2 broken image(s) in content

✅ Total fixed: 15 broken image(s) in blogs

🔍 Checking countries for broken images...

📊 Found 30 countries

🌍 Checking country: Amerika
✅ Fixed 1 broken image(s) in contents

✅ Total fixed: 8 broken image(s) in countries

✅ Process completed successfully!
```

## 🛠️ Kod Kullanımı

### Pexels'ten Görsel Arama

```typescript
import { searchPexelsPhotos } from '@/lib/pexels';

const result = await searchPexelsPhotos('istanbul turkey', {
  perPage: 5,
  orientation: 'landscape',
  locale: 'tr-TR',
});

if (result && result.photos.length > 0) {
  const photo = result.photos[0];
  console.log('Image URL:', photo.src.large);
  console.log('Alt text:', photo.alt);
}
```

### HTML İçeriğindeki Kırık Görselleri Düzelt

```typescript
import { replacebrokenImagesInHTML } from '@/lib/pexels';

const html = '<img src="https://broken.com/image.jpg" alt="test" />';
const { html: updatedHtml, replacedCount } = await replacebrokenImagesInHTML(
  html,
  'istanbul travel'
);

console.log('Replaced:', replacedCount);
console.log('Updated HTML:', updatedHtml);
```

### İçeriğe Görsel Ekle

```typescript
import { addImagesToContent } from '@/lib/pexels';

const html = '<p>İstanbul hakkında...</p>';
const updatedHtml = await addImagesToContent(
  html,
  'İstanbul Gezi Rehberi',
  2  // Eklenecek görsel sayısı
);
```

## 🎨 Admin Panel Entegrasyonu

Admin panelinde görsel eklemek için:

```typescript
// Görsel arama butonu
async function searchImages(prompt: string) {
  const response = await fetch('/api/images/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, perPage: 10 }),
  });
  
  const data = await response.json();
  return data.photos;
}

// Kırık görselleri düzelt butonu
async function fixBrokenImages(type: 'blog' | 'country', id: number) {
  const response = await fetch('/api/images/fix-broken', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type, id }),
  });
  
  const data = await response.json();
  alert(data.message);
}
```

## 📋 Fonksiyonlar

### `searchPexelsPhotos(query, options)`
Pexels'ten görsel arar.

**Parametreler:**
- `query` (string): Arama terimi
- `options` (object):
  - `perPage` (number): Sayfa başına sonuç (varsayılan: 15)
  - `page` (number): Sayfa numarası (varsayılan: 1)
  - `orientation` ('landscape' | 'portrait' | 'square'): Görsel yönü
  - `size` ('large' | 'medium' | 'small'): Görsel boyutu
  - `locale` ('en-US' | 'tr-TR'): Dil

### `isImageBroken(url)`
URL'nin 404 dönüp dönmediğini kontrol eder.

### `replacebrokenImagesInHTML(html, context)`
HTML içeriğindeki kırık görselleri Pexels'ten yenileriyle değiştirir.

### `generateImageFromPrompt(prompt, insertPosition)`
Prompt'tan görsel oluşturur ve HTML tag döndürür.

### `addImagesToContent(html, title, imageCount)`
İçeriğe otomatik görsel ekler.

## 🔄 Otomatik Çalıştırma

Kırık görselleri düzenli olarak kontrol etmek için cron job ekleyebilirsiniz:

```bash
# Her gün saat 03:00'te çalıştır
0 3 * * * cd /path/to/project && npx tsx scripts/fix-broken-images.ts
```

## ⚠️ Önemli Notlar

1. **Rate Limiting**: Pexels API'de dakikada 200 istek limiti var
2. **Attribution**: Pexels görselleri ücretsiz ama fotoğrafçı bilgisi saklanmalı
3. **Cache**: Sık kullanılan görselleri cache'leyebilirsiniz
4. **Backup**: Değişiklik yapmadan önce database backup alın

## 🎯 Gelecek Geliştirmeler

- [ ] Görsel cache sistemi
- [ ] Toplu görsel yükleme
- [ ] Görsel optimizasyonu (resize, compress)
- [ ] AI ile görsel seçimi (en uygun görseli otomatik seç)
- [ ] Görsel metadata yönetimi
