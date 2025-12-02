# Sayfa Yönetimi Sistemi

Admin panelde dinamik sayfa oluşturma ve yönetme sistemi başarıyla eklendi.

## 🎯 Özellikler

### ✅ Tamamlanan Özellikler

1. **Veritabanı Yapısı**
   - `pages` tablosu oluşturuldu
   - Türkçe ve İngilizce içerik desteği
   - RLS (Row Level Security) politikaları
   - Otomatik timestamp güncelleme

2. **Admin Panel Sayfaları**
   - Sayfa listesi (`/admin/sayfalar`)
   - Yeni sayfa oluşturma (`/admin/sayfalar/yeni`)
   - Sayfa düzenleme (`/admin/sayfalar/[id]/duzenle`)
   - Filtreleme (Tümü, Yayında, Taslak, Yasal, Kurumsal)

3. **Dinamik Sayfa Render**
   - `/sayfa/[slug]` route'u
   - Türkçe ve İngilizce içerik desteği
   - SEO optimize edilmiş metadata
   - Responsive tasarım

4. **Rich Text Editor**
   - HTML içerik düzenleme
   - Resim yükleme
   - Başlık, liste, tablo desteği
   - Önizleme özelliği

## 📁 Dosya Yapısı

```
src/
├── app/
│   ├── admin/
│   │   └── sayfalar/
│   │       ├── page.tsx                    # Sayfa listesi
│   │       ├── yeni/
│   │       │   └── page.tsx                # Yeni sayfa oluştur
│   │       └── [id]/
│   │           └── duzenle/
│   │               └── page.tsx            # Sayfa düzenle
│   └── [locale]/
│       └── sayfa/
│           └── [slug]/
│               └── page.tsx                # Dinamik sayfa render
├── components/
│   └── admin/
│       ├── AdminSidebar.tsx                # Güncellendi
│       └── RichTextEditor.tsx              # Mevcut
└── supabase/
    └── migrations/
        └── create_pages_table.sql          # Veritabanı migration
```

## 🗄️ Veritabanı Şeması

```sql
CREATE TABLE custom_pages (
  id UUID PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  title_en TEXT,
  content TEXT NOT NULL,
  content_en TEXT,
  meta_description TEXT,
  meta_description_en TEXT,
  is_published BOOLEAN DEFAULT false,
  show_in_menu BOOLEAN DEFAULT false,
  menu_order INTEGER DEFAULT 0,
  page_type TEXT DEFAULT 'custom',
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  created_by UUID,
  updated_by UUID
);
```

## 🚀 Kullanım

### 1. Veritabanı Migration'ı Çalıştır

✅ **Migration başarıyla uygulandı!**

Tablo adı: `custom_pages` (mevcut `pages` tablosu ile çakışmayı önlemek için)

### 2. Admin Panelde Sayfa Oluştur

1. Admin panelde "Sayfa Yönetimi" menüsüne tıklayın
2. "Yeni Sayfa" butonuna tıklayın
3. Formu doldurun:
   - **Slug**: URL için benzersiz slug (örn: `hakkimizda`)
   - **Başlık**: Türkçe başlık
   - **Title (English)**: İngilizce başlık (opsiyonel)
   - **İçerik**: Rich text editor ile içerik
   - **Ayarlar**: Yayın durumu, menü görünürlüğü, sayfa tipi

4. "Sayfayı Kaydet" butonuna tıklayın

### 3. Sayfayı Görüntüle

Oluşturulan sayfa şu URL'lerden erişilebilir:
- Türkçe: `https://kolayseyahat.net/sayfa/[slug]`
- İngilizce: `https://kolayseyahat.net/en/sayfa/[slug]`

## 📝 Sayfa Tipleri

- **custom**: Özel sayfalar
- **legal**: Yasal sayfalar (KVKK, Gizlilik vb.)
- **corporate**: Kurumsal sayfalar (Hakkımızda, Neden Biz vb.)
- **info**: Bilgilendirme sayfaları

## 🎨 Özellikler

### Çoklu Dil Desteği
- Türkçe ve İngilizce içerik
- Dil bazlı metadata
- Otomatik dil algılama

### SEO Optimizasyonu
- Meta description
- Dinamik title
- Slug-based URL'ler

### İçerik Yönetimi
- Rich text editor
- Resim yükleme
- HTML desteği
- Önizleme

### Yayın Kontrolü
- Taslak/Yayında durumu
- Menü görünürlüğü
- Sıralama

## 🔒 Güvenlik

- RLS (Row Level Security) aktif
- Sadece authenticated kullanıcılar düzenleyebilir
- Public kullanıcılar sadece yayındaki sayfaları görebilir
- XSS koruması (dangerouslySetInnerHTML dikkatli kullanılmalı)

## 📱 Responsive Tasarım

Tüm sayfalar mobil, tablet ve desktop cihazlarda optimize edilmiştir.

## 🔄 Gelecek Geliştirmeler

- [ ] Sayfa versiyonlama
- [ ] Sayfa şablonları
- [ ] Medya kütüphanesi
- [ ] SEO analizi
- [ ] Sayfa kopyalama
- [ ] Toplu işlemler
- [ ] Sayfa kategorileri
- [ ] Yorum sistemi

## 🐛 Bilinen Sorunlar

Şu an bilinen bir sorun bulunmamaktadır.

## 📞 Destek

Herhangi bir sorun veya soru için lütfen geliştirici ile iletişime geçin.
