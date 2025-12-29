# WhatsApp Edge Function - API Kullanım Hatası Düzeltmesi

## 🐛 Hata

```
TypeError: countries.find is not a function
```

**Neden:** API'den dönen response doğru parse edilmemiş. Response bir object ama kod array bekliyor.

## ❌ Yanlış Kod (Mevcut)

```typescript
async getCountryInfo(countryName: string) {
  const response = await fetch('https://www.kolayseyahat.net/api/countries');
  const countries = await response.json(); // ❌ Bu bir object: { success: true, data: [...] }
  
  const country = countries.find(c => c.name === countryName); // ❌ HATA: countries.find is not a function
  return country;
}
```

## ✅ Doğru Kod

```typescript
async getCountryInfo(countryName: string) {
  const response = await fetch('https://www.kolayseyahat.net/api/countries');
  const result = await response.json();
  
  // API response yapısı: { success: true, data: [...], count: 150 }
  if (!result.success || !result.data) {
    throw new Error('Failed to fetch countries');
  }
  
  const countries = result.data; // ✅ Array'i çıkar
  
  // Ülke adını normalize et (Türkçe karakter, büyük/küçük harf)
  const normalizedSearch = countryName
    .toLowerCase()
    .trim()
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ı/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c');
  
  const country = countries.find(c => {
    const normalizedName = c.name
      .toLowerCase()
      .replace(/ğ/g, 'g')
      .replace(/ü/g, 'u')
      .replace(/ş/g, 's')
      .replace(/ı/g, 'i')
      .replace(/ö/g, 'o')
      .replace(/ç/g, 'c');
    
    return normalizedName.includes(normalizedSearch);
  });
  
  return country;
}
```

## 📋 Tam Edge Function Örneği

```typescript
// supabase/functions/whatsapp-ai-assistant/index.ts

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const API_BASE_URL = "https://www.kolayseyahat.net";

class WhatsAppAssistant {
  // Ülke listesini çek
  async getCountries() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/countries`);
      const result = await response.json();
      
      if (!result.success || !result.data) {
        console.error('Countries API failed:', result);
        return [];
      }
      
      return result.data; // Array döner
    } catch (error) {
      console.error('Error fetching countries:', error);
      return [];
    }
  }

  // Ülke bilgisini bul
  async getCountryInfo(countryName: string) {
    try {
      const countries = await this.getCountries();
      
      if (!Array.isArray(countries)) {
        console.error('Countries is not an array:', countries);
        return null;
      }
      
      // Normalize search term
      const normalizedSearch = this.normalizeText(countryName);
      
      // Find country
      const country = countries.find(c => {
        const normalizedName = this.normalizeText(c.name);
        return normalizedName.includes(normalizedSearch) || 
               normalizedSearch.includes(normalizedName);
      });
      
      if (!country) {
        console.log(`Country not found: ${countryName}`);
        return null;
      }
      
      // Get detailed info
      const detailResponse = await fetch(`${API_BASE_URL}/api/countries/${country.slug}`);
      const detailResult = await detailResponse.json();
      
      if (!detailResult.success || !detailResult.data) {
        console.error('Country detail API failed:', detailResult);
        return country; // Return basic info
      }
      
      return detailResult.data; // Return detailed info
    } catch (error) {
      console.error('Error fetching country info:', error);
      return null;
    }
  }

  // Türkçe karakter normalize
  normalizeText(text: string): string {
    return text
      .toLowerCase()
      .trim()
      .replace(/ğ/g, 'g')
      .replace(/ü/g, 'u')
      .replace(/ş/g, 's')
      .replace(/ı/g, 'i')
      .replace(/ö/g, 'o')
      .replace(/ç/g, 'c');
  }

  // Vize bilgilerini formatla
  formatVisaInfo(country: any): string {
    const flag = this.getCountryFlag(country.country_code);
    let message = `${flag} ${country.name} Vize Bilgileri:\n\n`;
    
    // Vize durumu
    const visaStatusText = this.getVisaStatusText(country.visa_status);
    message += `✅ Vize Durumu: ${visaStatusText}\n`;
    
    // Vize ücreti
    if (country.products && country.products.length > 0) {
      const product = country.products[0];
      const currency = product.currency_id === 1 ? '$' : '€';
      message += `💰 Başvuru Ücreti: ${currency}${product.price}\n`;
    }
    
    // Gerekli belgeler
    if (country.products && country.products[0]?.requirements) {
      message += `📄 Gerekli Belgeler:\n`;
      country.products[0].requirements.forEach((req: string) => {
        message += `   • ${req}\n`;
      });
    }
    
    // Linkler
    message += `\n📋 Başvuru Seçenekleri:\n\n`;
    message += `1️⃣ ${country.name} Sayfası (Önerilen):\n`;
    message += `👉 ${API_BASE_URL}/${country.slug}\n`;
    message += `✓ Detaylı vize bilgileri\n`;
    message += `✓ ${country.name}'ye özel başvuru formu\n\n`;
    message += `2️⃣ Genel Başvuru Formu:\n`;
    message += `👉 ${API_BASE_URL}/vize-basvuru-formu\n`;
    message += `✓ Tüm ülkeler için kullanılabilir\n\n`;
    message += `Ne zaman seyahat etmeyi planlıyorsunuz?`;
    
    return message;
  }

  getVisaStatusText(status: string): string {
    switch (status) {
      case 'required': return 'Gerekli';
      case 'not_required': return 'Gerekli Değil';
      case 'on_arrival': return 'Varışta Vize';
      case 'e_visa': return 'E-Vize';
      case 'eta': return 'E-Vize (ETA)';
      default: return 'Bilinmiyor';
    }
  }

  getCountryFlag(countryCode: string): string {
    // ISO 3166-1 alpha-3 to emoji flag
    const flagMap: Record<string, string> = {
      'KOR': '🇰🇷',
      'JPN': '🇯🇵',
      'USA': '🇺🇸',
      'GBR': '🇬🇧',
      'FRA': '🇫🇷',
      'DEU': '🇩🇪',
      'ITA': '🇮🇹',
      'ESP': '🇪🇸',
      // Add more as needed
    };
    return flagMap[countryCode] || '🌍';
  }

  async handleMessage(message: string): Promise<string> {
    const lowerMessage = message.toLowerCase();
    
    // Greeting
    if (lowerMessage.includes('merhaba') || lowerMessage.includes('selam')) {
      return 'Merhaba! Kolay Seyahat\'e hoş geldiniz 👋\nHangi ülkeye vize başvurusu yapmak istiyorsunuz?';
    }
    
    // Country query
    const country = await this.getCountryInfo(message);
    if (country) {
      return this.formatVisaInfo(country);
    }
    
    // Default
    return 'Hangi ülkeye vize başvurusu yapmak istiyorsunuz?\n\nÖrnek: Güney Kore, Japonya, İtalya, vb.';
  }
}

// Serve function
serve(async (req) => {
  try {
    const { message } = await req.json();
    
    const assistant = new WhatsAppAssistant();
    const response = await assistant.handleMessage(message);
    
    return new Response(
      JSON.stringify({ success: true, message: response }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});
```

## 🔧 Supabase'de Güncelleme

1. **Supabase Dashboard'a git:**
   ```
   https://supabase.com/dashboard/project/[PROJECT_ID]/functions
   ```

2. **`whatsapp-ai-assistant` fonksiyonunu bul**

3. **Kodu güncelle** - Yukarıdaki doğru kodu kullan

4. **Deploy et:**
   ```bash
   supabase functions deploy whatsapp-ai-assistant
   ```


```typescript
// ❌ const countries = await response.json();
// ✅ const { data: countries } = await response.json();
```
