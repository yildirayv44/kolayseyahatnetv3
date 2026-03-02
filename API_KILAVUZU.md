# Kolay Seyahat API Kullanım Kılavuzu

> **Base URL:** `https://www.kolayseyahat.net`
> **Protokol:** HTTPS
> **Format:** JSON
> **CORS:** Tüm origin'lere açık (`Access-Control-Allow-Origin: *`)

---

## İçindekiler

1. [Ülke Listesi (Mobil)](#1-ülke-listesi-mobil)
2. [Ülke Listesi (Basit)](#2-ülke-listesi-basit)
3. [Ülke Detayı (Slug ile)](#3-ülke-detayı-slug-ile)
4. [Başvuru Gönderme (Mobil)](#4-başvuru-gönderme-mobil)
5. [Döviz Kurları](#5-döviz-kurları)
6. [Veri Yapıları](#6-veri-yapıları)
7. [Hata Yönetimi](#7-hata-yönetimi)

---

## 1. Ülke Listesi (Mobil)

En kapsamlı endpoint. Kıta bilgisi, vize durumu filtreleri ve istatistikler içerir.

```
GET /api/mobile/countries
```

### Query Parametreleri

| Parametre    | Tip    | Zorunlu | Açıklama                                                         |
|-------------|--------|---------|------------------------------------------------------------------|
| `search`     | string | Hayır   | Ülke adına göre arama (case-insensitive, kısmi eşleşme)         |
| `visaStatus` | string | Hayır   | Vize durumuna göre filtre (aşağıdaki değerler)                  |
| `continent`  | string | Hayır   | Kıtaya göre filtre (TR veya EN isim)                             |

### `visaStatus` Değerleri

| Değer              | Açıklama       |
|-------------------|----------------|
| `visa-free`       | Vizesiz         |
| `evisa`           | E-vize / ETA    |
| `visa-on-arrival` | Varışta Vize    |
| `visa-required`   | Vize Gerekli    |

### `continent` Değerleri

| Türkçe         | İngilizce      |
|---------------|----------------|
| Avrupa        | Europe         |
| Asya          | Asia           |
| Afrika        | Africa         |
| Kuzey Amerika | North America  |
| Güney Amerika | South America  |
| Okyanusya     | Oceania        |
| Orta Doğu     | Middle East    |

### Örnek İstekler

```bash
# Tüm ülkeler
curl "https://www.kolayseyahat.net/api/mobile/countries"

# Arama
curl "https://www.kolayseyahat.net/api/mobile/countries?search=almanya"

# Vizesiz ülkeler
curl "https://www.kolayseyahat.net/api/mobile/countries?visaStatus=visa-free"

# Avrupa ülkeleri
curl "https://www.kolayseyahat.net/api/mobile/countries?continent=Avrupa"

# Birden fazla filtre
curl "https://www.kolayseyahat.net/api/mobile/countries?visaStatus=evisa&continent=Asya"
```

### Başarılı Yanıt (200)

```json
{
  "success": true,
  "data": [
    {
      "id": 15,
      "name": "Fransa",
      "slug": "fransa-vizesi",
      "countryCode": "FRA",
      "imageUrl": "https://...",
      "processTime": "15 iş günü",
      "processTimeTooltip": "Randevu sonrası değerlendirme süresi",
      "visaRequired": true,
      "visaType": "schengen",
      "visaStatus": "visa-required",
      "availableMethods": ["embassy"],
      "visaLabels": ["Vize Gerekli"],
      "visaLabel": "Vize Gerekli",
      "maxStayDuration": "90 gün",
      "continent": "Avrupa",
      "continentEn": "Europe"
    },
    {
      "id": 7,
      "name": "Yunanistan",
      "slug": "yunanistan-vizesi",
      "countryCode": "GRC",
      "imageUrl": "https://...",
      "processTime": "10 iş günü",
      "processTimeTooltip": "Randevu sonrası değerlendirme süresi",
      "visaRequired": true,
      "visaType": "schengen",
      "visaStatus": "visa-required",
      "availableMethods": ["embassy"],
      "visaLabels": ["Vize Gerekli"],
      "visaLabel": "Vize Gerekli",
      "maxStayDuration": "90 gün",
      "continent": "Avrupa",
      "continentEn": "Europe"
    }
  ],
  "count": 120,
  "statistics": {
    "visaFree": 15,
    "eta": 25,
    "visaOnArrival": 10,
    "visaRequired": 70,
    "total": 120
  },
  "continents": [
    { "name": "Avrupa", "count": 45 },
    { "name": "Afrika", "count": 30 },
    { "name": "Asya", "count": 20 },
    { "name": "Orta Doğu", "count": 12 },
    { "name": "Kuzey Amerika", "count": 8 },
    { "name": "Güney Amerika", "count": 5 }
  ]
}
```

### Yanıt Alanları (Her Ülke)

| Alan                 | Tip       | Açıklama                                               |
|---------------------|-----------|--------------------------------------------------------|
| `id`                | number    | Ülke ID                                                |
| `name`              | string    | Ülke adı (Türkçe)                                     |
| `slug`              | string    | URL slug (detay sayfası için)                          |
| `countryCode`       | string    | ISO 3166-1 alpha-3 ülke kodu (örn: `FRA`, `USA`, `KOR`) |
| `imageUrl`          | string?   | Ülke görseli URL                                       |
| `processTime`       | string?   | İşlem süresi (örn: "15 iş günü")                      |
| `processTimeTooltip`| string?   | İşlem süresi açıklaması                               |
| `visaRequired`      | boolean   | Vize gerekli mi?                                       |
| `visaType`          | string?   | Orijinal vize tipi (schengen, evize vb.)               |
| `visaStatus`        | string    | Normalize edilmiş vize durumu                          |
| `availableMethods`  | string[]  | Mevcut başvuru yöntemleri                              |
| `visaLabels`        | string[]  | Vize durum etiketleri (Türkçe)                         |
| `visaLabel`         | string    | Birleştirilmiş etiket (örn: "E-vize / Vizesiz")       |
| `maxStayDuration`   | string?   | Maksimum kalış süresi                                  |
| `continent`         | string    | Kıta adı (Türkçe)                                     |
| `continentEn`       | string    | Kıta adı (İngilizce)                                  |

---

## 2. Ülke Listesi (Basit)

Daha basit format. Fiyat ve paket bilgilerini içerir.

```
GET /api/countries
```

**Parametre yok.**

### Başarılı Yanıt (200)

```json
{
  "success": true,
  "data": [
    {
      "id": 15,
      "name": "Fransa",
      "slug": "fransa-vizesi",
      "country_code": "FRA",
      "visa_status": "visa-required",
      "visa_info": "Schengen vizesi gereklidir...",
      "visa_labels": ["Vize Gerekli"],
      "visa_required": true,
      "price": 150,
      "currency_id": 2,
      "packages": [
        { "id": 101, "name": "Standart Paket", "price": 150, "currency_id": 2 },
        { "id": 102, "name": "Premium Paket", "price": 250, "currency_id": 2 }
      ],
      "image_url": "https://...",
      "detail_url": "https://www.kolayseyahat.net/fransa-vizesi",
      "api_url": "https://www.kolayseyahat.net/api/countries/code/FRA"
    }
  ],
  "count": 120
}
```

### `currency_id` Değerleri

| ID | Para Birimi | Sembol |
|----|------------|--------|
| 1  | TRY (₺)   | ₺      |
| 2  | USD ($)    | $      |
| 3  | EUR (€)    | €      |

---

## 3. Ülke Detayı (Slug ile)

Tek bir ülkenin detaylı bilgisi + vize paketleri + gerekli belgeler.

```
GET /api/countries/{slug}
```

### Path Parametreleri

| Parametre | Tip    | Zorunlu | Açıklama                          |
|-----------|--------|---------|-----------------------------------|
| `slug`    | string | Evet    | Ülke slug'ı (örn: `fransa-vizesi`)|

### Örnek İstek

```bash
curl "https://www.kolayseyahat.net/api/countries/fransa-vizesi"
```

### Başarılı Yanıt (200)

```json
{
  "success": true,
  "data": {
    "id": 15,
    "name": "Fransa",
    "slug": "fransa-vizesi",
    "country_code": "FRA",
    "visa_status": "visa-required",
    "visa_info": "Schengen vizesi gereklidir...",
    "allowed_stay": "90 gün",
    "conditions": "Schengen bölgesi içinde 180 gün içinde 90 gün",
    "notes": "Başvuru en az 15 gün önceden yapılmalıdır.",
    "application_method": "embassy",
    "available_methods": ["embassy"],
    "image_url": "https://...",
    "products": [
      {
        "id": 101,
        "name": "Standart Vize Paketi",
        "price": "150.00",
        "currency_id": 2,
        "description": "Standart vize başvuru hizmeti",
        "requirements": [
          "Pasaport (6 ay geçerlilik)",
          "Biyometrik fotoğraf (2 adet)",
          "Seyahat sağlık sigortası",
          "Konaklama belgesi",
          "Uçak bileti rezervasyonu"
        ],
        "process_time": "15 iş günü"
      },
      {
        "id": 102,
        "name": "Premium Vize Paketi",
        "price": "250.00",
        "currency_id": 2,
        "description": "Hızlandırılmış başvuru + dosya hazırlama",
        "requirements": [
          "Pasaport (6 ay geçerlilik)",
          "Biyometrik fotoğraf (2 adet)",
          "Seyahat sağlık sigortası"
        ],
        "process_time": "7 iş günü"
      }
    ]
  }
}
```

### Ülke Detay Alanları

| Alan                | Tip       | Açıklama                                          |
|--------------------|-----------|---------------------------------------------------|
| `id`               | number    | Ülke ID                                           |
| `name`             | string    | Ülke adı                                          |
| `slug`             | string    | URL slug                                          |
| `country_code`     | string    | ISO 3166-1 alpha-3 kodu                           |
| `visa_status`      | string    | Vize durumu                                       |
| `visa_info`        | string?   | Vize hakkında genel bilgi                         |
| `allowed_stay`     | string?   | İzin verilen kalış süresi                         |
| `conditions`       | string?   | Vize koşulları                                    |
| `notes`            | string?   | Ek notlar                                         |
| `application_method`| string?  | Başvuru yöntemi                                   |
| `available_methods`| string[]  | Tüm mevcut başvuru yöntemleri                     |
| `image_url`        | string?   | Ülke görseli                                      |
| `products`         | Product[] | Vize paketleri (aşağıda detay)                    |

### Ürün (Product) Alanları

| Alan           | Tip       | Açıklama                         |
|---------------|-----------|----------------------------------|
| `id`          | number    | Ürün/paket ID                    |
| `name`        | string    | Paket adı                        |
| `price`       | string    | Fiyat                            |
| `currency_id` | number    | Para birimi (1=TRY, 2=USD, 3=EUR)|
| `description` | string?   | Paket açıklaması                 |
| `requirements`| string[]  | Gerekli belgeler listesi         |
| `process_time`| string?   | İşlem süresi                     |

---

## 4. Başvuru Gönderme (Mobil)

Yeni vize başvurusu oluşturur.

```
POST /api/mobile/applications
```

### Request Body

```json
{
  "fullName": "Ahmet Yılmaz",
  "email": "ahmet@email.com",
  "phone": "05551234567",
  "countryId": 15,
  "countryName": "Fransa",
  "packageId": 101,
  "packageName": "Standart Vize Paketi",
  "notes": "Mart ayı için planlıyorum"
}
```

### Body Alanları

| Alan          | Tip    | Zorunlu | Açıklama               |
|--------------|--------|---------|------------------------|
| `fullName`   | string | **Evet**| Ad soyad               |
| `email`      | string | **Evet**| E-posta (geçerli format)|
| `phone`      | string | **Evet**| Telefon numarası       |
| `countryId`  | number | Hayır   | Ülke ID                |
| `countryName`| string | Hayır   | Ülke adı               |
| `packageId`  | number | Hayır   | Seçilen paket ID       |
| `packageName`| string | Hayır   | Seçilen paket adı      |
| `notes`      | string | Hayır   | Ek notlar              |

### Başarılı Yanıt (200)

```json
{
  "success": true,
  "message": "Başvurunuz başarıyla alındı. En kısa sürede sizinle iletişime geçeceğiz.",
  "applicationId": 1234
}
```

### Hata Yanıtları

**400 - Eksik Alan:**
```json
{
  "success": false,
  "error": "Missing required fields",
  "details": {
    "fullName": null,
    "email": "Required",
    "phone": null
  }
}
```

**400 - Geçersiz E-posta:**
```json
{
  "success": false,
  "error": "Invalid email format"
}
```

---

## 5. Döviz Kurları

TCMB güncel döviz kurlarını döndürür.

```
GET /api/currency-rates
```

### Başarılı Yanıt (200)

```json
{
  "success": true,
  "rates": {
    "USD": { "buying": 36.50, "selling": 36.85 },
    "EUR": { "buying": 39.20, "selling": 39.60 }
  }
}
```

> **Not:** TL fiyat hesaplaması için **satış kuru** (`selling`) kullanılır.
>
> **TL Tutar Hesaplama:** `paket_fiyat × kişi_sayısı × selling_kur`

---

## 6. Veri Yapıları

### Vize Durumu Akışı

```
visa-free        → Vizesiz (pasaportla giriş)
visa-on-arrival  → Varışta Vize (havalimanında)
evisa / eta      → E-vize (online başvuru)
visa-required    → Vize Gerekli (büyükelçilik/konsolosluk)
```

### Başvuru Yöntemleri (`available_methods`)

| Değer              | Açıklama                               |
|-------------------|----------------------------------------|
| `visa-free`       | Vize gerekmez                          |
| `visa-on-arrival` | Varışta vize alınır                    |
| `evisa`           | Online e-vize başvurusu                |
| `eta`             | Elektronik seyahat izni (ETA/ESTA)     |
| `embassy`         | Büyükelçilik/konsolosluk başvurusu     |

> Bir ülkede birden fazla yöntem olabilir (örn: hem e-vize hem vizesiz).

---

## 7. Hata Yönetimi

### Genel Hata Formatı

```json
{
  "success": false,
  "error": "Hata açıklaması",
  "message": "Detaylı hata mesajı (opsiyonel)"
}
```

### HTTP Durum Kodları

| Kod | Açıklama           |
|-----|-------------------|
| 200 | Başarılı           |
| 400 | Geçersiz istek     |
| 404 | Bulunamadı         |
| 500 | Sunucu hatası      |

---

## Hızlı Başlangıç Örneği (Flutter/Dart)

```dart
import 'dart:convert';
import 'package:http/http.dart' as http;

const baseUrl = 'https://www.kolayseyahat.net';

// Ülke listesi
Future<Map<String, dynamic>> getCountries({String? search, String? visaStatus}) async {
  final params = <String, String>{};
  if (search != null) params['search'] = search;
  if (visaStatus != null) params['visaStatus'] = visaStatus;
  
  final uri = Uri.parse('$baseUrl/api/mobile/countries').replace(queryParameters: params);
  final response = await http.get(uri);
  return jsonDecode(response.body);
}

// Ülke detayı
Future<Map<String, dynamic>> getCountryDetail(String slug) async {
  final response = await http.get(Uri.parse('$baseUrl/api/countries/$slug'));
  return jsonDecode(response.body);
}

// Başvuru gönder
Future<Map<String, dynamic>> submitApplication({
  required String fullName,
  required String email,
  required String phone,
  int? countryId,
  String? countryName,
  int? packageId,
  String? packageName,
  String? notes,
}) async {
  final response = await http.post(
    Uri.parse('$baseUrl/api/mobile/applications'),
    headers: {'Content-Type': 'application/json'},
    body: jsonEncode({
      'fullName': fullName,
      'email': email,
      'phone': phone,
      if (countryId != null) 'countryId': countryId,
      if (countryName != null) 'countryName': countryName,
      if (packageId != null) 'packageId': packageId,
      if (packageName != null) 'packageName': packageName,
      if (notes != null) 'notes': notes,
    }),
  );
  return jsonDecode(response.body);
}
```

## Hızlı Başlangıç Örneği (React Native / JavaScript)

```javascript
const BASE_URL = 'https://www.kolayseyahat.net';

// Ülke listesi
async function getCountries({ search, visaStatus, continent } = {}) {
  const params = new URLSearchParams();
  if (search) params.append('search', search);
  if (visaStatus) params.append('visaStatus', visaStatus);
  if (continent) params.append('continent', continent);
  
  const res = await fetch(`${BASE_URL}/api/mobile/countries?${params}`);
  return res.json();
}

// Ülke detayı
async function getCountryDetail(slug) {
  const res = await fetch(`${BASE_URL}/api/countries/${slug}`);
  return res.json();
}

// Başvuru gönder
async function submitApplication(data) {
  const res = await fetch(`${BASE_URL}/api/mobile/applications`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}
```

---

## Önemli Notlar

- **Cache:** Ülke listeleri 1 saat cache'lenir (`s-maxage=3600`). Güncel veri için `Cache-Control: no-cache` header'ı gönderin.
- **Rate Limit:** Şu an aktif rate limit yoktur, ancak makul kullanım beklenir.
- **Authentication:** Bu endpoint'ler herkese açıktır, API key gerekmez.
- **CORS:** Tüm origin'lerden erişime açıktır.
- **Encoding:** UTF-8. Türkçe karakterler desteklenir.

---

> **⚠️ Bu API'ler mobil uygulama tarafından aktif olarak kullanılmaktadır. Mevcut endpoint'lerde, response yapılarında ve alan adlarında kesinlikle değişiklik yapılmamalıdır.**
