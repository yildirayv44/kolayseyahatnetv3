# Admin Panel - Görsel Yönetimi

Bu dokümantasyon, admin panelindeki görsel tespit ve değiştirme sistemini açıklar.

## 🎯 Özellikler

- ✅ Tüm görselleri tespit et (Blog + Ülke)
- ✅ Görsel durumu kontrolü (OK / Hata)
- ✅ Filtreleme (Tümü / Çalışan / Hatalı)
- ✅ Arama (URL, alt text, başlık)
- ✅ **Tüm görselleri değiştir** (OK olanlar dahil)
- ✅ Pexels entegrasyonu
- ✅ Manuel dosya yükleme
- ✅ Otomatik indirme ve Supabase Storage'a yükleme

## 📍 Erişim

**URL:** `http://localhost:3000/admin/images`

**Menü:** Admin Panel → Görsel Tespiti

## 🎨 Kullanım Senaryoları

### Senaryo 1: Blog Öne Çıkan Görseli Değiştir

**Durum:** Blog'un öne çıkan görseli çalışıyor ama farklı bir görsel kullanmak istiyorsunuz.

**Adımlar:**
1. Admin panelde "Görsel Tespiti" menüsüne tıklayın
2. Filtreyi "Çalışan" olarak seçin (veya "Tümü" bırakın)
3. Arama kutusuna blog başlığını yazın
4. Blog kartını bulun (image_url field)
5. **Mavi "Değiştir"** butonuna tıklayın
6. Modal açılır:
   - Mevcut görsel önizlemesi görünür
   - İki seçenek:
     - **A) Pexels'ten ara:** "portugal travel" gibi bir arama yapın
     - **B) Dosya yükle:** Bilgisayarınızdan görsel seçin
7. Pexels sonuçlarından birini seçin veya dosya yükleyin
8. ✅ Görsel otomatik olarak:
   - İndirilir (Pexels'ten)
   - Supabase Storage'a yüklenir
   - Database'de güncellenir

**Sonuç:** Blog öne çıkan görseli değişti!

---

### Senaryo 2: Kırık Görseli Düzelt

**Durum:** İçerikte 404 dönen bir görsel var.

**Adımlar:**
1. "Hatalı" filtresini seçin
2. Kırık görseli bulun
3. **Kırmızı "Düzelt"** butonuna tıklayın
4. Pexels'ten alakalı bir görsel arayın
5. Görseli seçin
6. ✅ Otomatik olarak düzeltilir

---

### Senaryo 3: Ülke İçeriğindeki Görseli Değiştir

**Durum:** Ülke detay sayfasındaki bir görseli değiştirmek istiyorsunuz.

**Adımlar:**
1. Arama kutusuna ülke adını yazın (örn: "Amerika")
2. İlgili görseli bulun
3. "Değiştir" butonuna tıklayın
4. Yeni görsel seçin
5. ✅ Güncellendi!

---

## 🎨 Arayüz Özellikleri

### İstatistikler (Üst Kısım)

```
┌─────────────────┬─────────────────┬─────────────────┐
│ Toplam Görsel   │   Çalışan       │    Hatalı       │
│      37         │      1          │      36         │
└─────────────────┴─────────────────┴─────────────────┘
```

### Filtreler

- **Tümü:** Tüm görselleri göster
- **Çalışan:** Sadece OK olan görseller
- **Hatalı:** Sadece 404 dönen görseller

### Görsel Kartları

Her kart şunları içerir:
- **Görsel önizlemesi** (OK ise)
- **Durum rozeti** (✅ OK veya ❌ Hata)
- **Başlık** (Blog/Ülke adı)
- **Kaynak tipi** (📝 Blog veya 🌍 Ülke)
- **Alan adı** (image_url, contents, vb.)
- **URL** (hover ile tam URL)
- **Buton:**
  - 🔴 Kırmızı "Düzelt" (Hatalı görseller için)
  - 🔵 Mavi "Değiştir" (Çalışan görseller için)

### Değiştirme Modalı

Modal açıldığında:

```
┌─────────────────────────────────────────┐
│ Görseli Değiştir                    [X] │
├─────────────────────────────────────────┤
│ Mevcut Görsel:                          │
│ [Görsel Önizlemesi] (OK ise)            │
│ URL: https://...                        │
│ Kaynak: Blog Adı (Blog)                 │
│ Alan: image_url                         │
├─────────────────────────────────────────┤
│ Dosya Yükle:                            │
│ [Dosya Seçici]                          │
├─────────────────────────────────────────┤
│              veya                        │
├─────────────────────────────────────────┤
│ Pexels'ten Ara:                         │
│ [Arama Kutusu] [Ara]                    │
├─────────────────────────────────────────┤
│ [Görsel 1] [Görsel 2] [Görsel 3]        │
│ [Görsel 4] [Görsel 5] [Görsel 6]        │
│ ...                                     │
└─────────────────────────────────────────┘
```

## 🔧 Teknik Detaylar

### API Endpoints

**1. Görsel Tespiti:**
```bash
GET /api/admin/images/detect

Response:
{
  "success": true,
  "images": [...],
  "stats": {
    "total": 37,
    "ok": 1,
    "error": 36
  }
}
```

**2. Görsel Değiştirme:**
```bash
POST /api/admin/images/replace

Body:
{
  "sourceType": "blog",
  "sourceId": 26,
  "field": "image_url",
  "oldUrl": "https://...",
  "newImageUrl": "https://images.pexels.com/..."
}

Response:
{
  "success": true,
  "newUrl": "https://kcocpunrmubppaskklzo.supabase.co/...",
  "message": "Image replaced successfully"
}
```

**3. Dosya Yükleme:**
```bash
POST /api/admin/images/upload

Body: FormData
- file: File
- bucket: "blog-images" | "country-images"

Response:
{
  "success": true,
  "url": "https://...",
  "path": "..."
}
```

### Görsel İşleme Akışı

```
1. Kullanıcı "Değiştir" butonuna tıklar
   ↓
2. Modal açılır
   ↓
3. Kullanıcı seçim yapar:
   
   A) Pexels Arama:
      - Pexels API'ye istek
      - Sonuçlar gösterilir
      - Kullanıcı bir görsel seçer
      ↓
   B) Dosya Yükleme:
      - Dosya seçilir
      - Upload API'ye gönderilir
      ↓
      
4. Görsel İndirme (Pexels ise):
   - fetch(pexelsUrl)
   - Buffer'a çevir
   ↓
   
5. Supabase Storage'a Yükleme:
   - supabase.storage.upload()
   - Public URL al
   ↓
   
6. Database Güncelleme:
   - Eski URL → Yeni URL
   - HTML içeriği güncelle (contents field ise)
   - Direct field güncelle (image_url ise)
   ↓
   
7. ✅ Başarılı!
```

## 📊 Görsel Kaynakları

### Blog Görselleri

- **Ana görsel:** `blogs.image_url`
- **İçerik görselleri:** `blogs.contents` (HTML içinde)

### Ülke Görselleri

- **Ana görsel:** `countries.image_url`
- **İçerik görselleri:** `countries.contents`
- **Fiyat içeriği:** `countries.price_contents`
- **Gerekli belgeler:** `countries.req_document`

## 🎯 Önemli Notlar

### ✅ Yapabilirsiniz

- Tüm görselleri değiştirebilirsiniz (OK olanlar dahil)
- Pexels'ten arama yapabilirsiniz
- Kendi görselinizi yükleyebilirsiniz
- Aynı görseli birden fazla kez değiştirebilirsiniz
- Filtreleme ve arama yapabilirsiniz

### ⚠️ Dikkat Edilmesi Gerekenler

- **Dosya boyutu:** Max 5MB
- **Dosya formatı:** JPG, PNG, WebP, GIF
- **Pexels rate limit:** Dakikada 200 istek
- **Eski görseller:** Supabase Storage'dan silinmez (manuel temizlik gerekebilir)
- **Backup:** Önemli değişiklikler öncesi backup alın

### 🔒 Güvenlik

- Admin paneli authentication gerektirir
- Service role key kullanılır (server-side)
- RLS policies aktif
- File validation yapılır

## 🚀 Performans İpuçları

1. **Toplu İşlem:** Birden fazla görseli değiştirmek için script kullanın
2. **Cache:** Sık değişmeyen görseller için CDN kullanın
3. **Optimizasyon:** Büyük görselleri yüklemeden önce optimize edin
4. **Lazy Loading:** Frontend'de lazy loading aktif

## 📝 Örnek Kullanımlar

### Blog Öne Çıkan Görselini Değiştir

```typescript
// Manuel API kullanımı (gerekirse)
const response = await fetch('/api/admin/images/replace', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    sourceType: 'blog',
    sourceId: 26,
    field: 'image_url',
    oldUrl: 'https://old-image.jpg',
    newImageUrl: 'https://images.pexels.com/photos/123/pexels-photo-123.jpeg',
  }),
});
```

### Toplu Görsel Değiştirme (Script)

```bash
# Tüm kırık görselleri düzelt
npx tsx scripts/fix-broken-images.ts
```

## 🎓 SSS

**S: OK olan bir görseli değiştirebilir miyim?**
A: ✅ Evet! Tüm görsellerde "Değiştir" butonu var.

**S: Pexels görselleri siyah görünüyor?**
A: ✅ Düzeltildi! Artık `large` size kullanılıyor.

**S: Blog öne çıkan görseli değiştirilemiyor mu?**
A: ✅ Düzeltildi! Artık tüm görseller değiştirilebilir.

**S: Eski görsel ne oluyor?**
A: Supabase Storage'da kalıyor. Manuel temizlik yapabilirsiniz.

**S: Pexels fotoğrafçı bilgisi kaydediliyor mu?**
A: Evet, API response'da mevcut ama şu an database'de saklanmıyor.

**S: Aynı görseli birden fazla yerde kullanabilir miyim?**
A: Evet, her kullanım ayrı bir kayıt olarak değiştirilir.

## 🎉 Özet

Admin panelindeki Görsel Tespiti özelliği ile:

- ✅ Tüm görselleri tek yerden yönetin
- ✅ Kırık görselleri hızlıca düzeltin
- ✅ Çalışan görselleri de değiştirin
- ✅ Pexels'ten kolayca görsel bulun
- ✅ Kendi görsellerinizi yükleyin
- ✅ Otomatik indirme ve yükleme

**Sonuç:** Görsel yönetimi artık çok kolay! 🎨
