# 🌍 Çok Dilli (i18n) Kullanım Kılavuzu

## Genel Bakış

Kolay Seyahat projesi Türkçe (tr) ve İngilizce (en) dillerini desteklemektedir.

## Kullanım

### 1. Sabit Metinler İçin Translation Sistemi

Butonlar, label'lar ve diğer sabit metinler için merkezi translation sistemi kullanın:

```tsx
import { t } from "@/i18n/translations";
import type { Locale } from "@/i18n/translations";

function MyComponent({ locale }: { locale: Locale }) {
  return (
    <div>
      <h1>{t(locale, "askQuestion")}</h1>
      <button>{t(locale, "submit")}</button>
      <input placeholder={t(locale, "yourName")} />
    </div>
  );
}
```

### 2. Dinamik İçerik İçin AI Translation

Veritabanından gelen içerikler (blog yazıları, ülke açıklamaları vb.) için AI translation kullanın:

```tsx
import { translateText } from "@/lib/translation";

// Server Component'te
const translatedContent = await translateText(content, locale);
```

### 3. Yeni Translation Key Ekleme

`src/i18n/translations.ts` dosyasına yeni key'ler ekleyin:

```typescript
export const translations = {
  tr: {
    myNewKey: "Türkçe Metin",
    // ...
  },
  en: {
    myNewKey: "English Text",
    // ...
  },
} as const;
```

## Mevcut Translation Key'leri

### Genel
- `readMore`, `learnMore`, `apply`, `contact`
- `submit`, `cancel`, `save`, `delete`, `edit`
- `search`, `filter`, `loading`, `noResults`

### Navigasyon
- `home`, `countries`, `visaPackages`, `blog`
- `about`, `faq`

### Ülke Sayfası
- `visaInfo`, `requiredDocuments`, `applicationProcess`
- `processingTime`, `visaFee`
- `askQuestion`, `questionsFromUsers`
- `yourQuestion`, `yourName`, `yourEmail`, `yourPhone`
- `sendQuestion`, `questionSent`, `questionError`

### Yorumlar
- `comments`, `writeComment`, `yourComment`
- `rating`, `submitComment`
- `commentSent`, `commentError`

### Başvuru Formu
- `applyForVisa`, `fullName`, `email`, `phone`
- `country`, `visaPackage`, `notes`
- `submitApplication`, `applicationSent`, `applicationError`

### Footer
- `quickLinks`, `popularCountries`, `followUs`
- `allRightsReserved`

## URL Yapısı

### Türkçe (Varsayılan)
- Ana sayfa: `/`
- Ülke sayfası: `/bahreyn`
- Blog: `/blog/genel/123`

### İngilizce
- Ana sayfa: `/en`
- Ülke sayfası: `/en/bahreyn`
- Blog: `/en/blog/general/123`

## Sitemap

Sitemap otomatik olarak her iki dil için URL'ler oluşturur:

- Türkçe sayfalar: `https://kolayseyahat.net/bahreyn`
- İngilizce sayfalar: `https://kolayseyahat.net/en/bahreyn`

## Component Örnekleri

### Client Component

```tsx
"use client";

import { t } from "@/i18n/translations";
import type { Locale } from "@/i18n/translations";

export function MyForm({ locale = "tr" }: { locale?: Locale }) {
  return (
    <form>
      <input placeholder={t(locale, "yourName")} />
      <button>{t(locale, "submit")}</button>
    </form>
  );
}
```

### Server Component

```tsx
import { t } from "@/i18n/translations";
import { translateText } from "@/lib/translation";

export default async function CountryPage({ 
  params 
}: { 
  params: { locale: string; slug: string } 
}) {
  const locale = params.locale || "tr";
  
  // Sabit metinler için
  const title = t(locale, "visaInfo");
  
  // Dinamik içerik için
  const translatedContent = await translateText(content, locale);
  
  return (
    <div>
      <h1>{title}</h1>
      <p>{translatedContent}</p>
    </div>
  );
}
```

## Best Practices

1. **Sabit metinler için** → `t(locale, "key")` kullanın
2. **Dinamik içerik için** → `translateText()` kullanın
3. **Yeni key eklerken** → Hem TR hem EN versiyonunu ekleyin
4. **Component'lerde** → `locale` prop'u alın
5. **URL'lerde** → İngilizce için `/en` prefix kullanın

## Dosya Yapısı

```
src/
├── i18n/
│   ├── config.ts          # Dil ayarları
│   └── translations.ts    # Sabit metinler
├── lib/
│   └── translation.ts     # AI translation
└── app/
    ├── [locale]/          # Çok dilli route'lar
    └── sitemap.ts         # Çok dilli sitemap
```

## Sorun Giderme

### "Translation key bulunamadı" hatası
- `translations.ts` dosyasında key'in hem TR hem EN versiyonunu kontrol edin
- TypeScript type'ını güncelleyin: `TranslationKey`

### İngilizce sayfa 404 veriyor
- `app/[locale]/` klasör yapısını kontrol edin
- Sitemap'te URL'lerin doğru olduğunu kontrol edin

### Dinamik içerik çevrilmiyor
- `translateText()` fonksiyonunun await edildiğinden emin olun
- OpenAI API key'inin ayarlandığını kontrol edin

## Gelecek Geliştirmeler

- [ ] Daha fazla dil desteği (Arapça, Rusça vb.)
- [ ] Translation cache'i database'e taşıma
- [ ] Admin panelinde translation yönetimi
- [ ] Otomatik translation quality check
