# Kolay Seyahat Mobile API

Bu API, mobil uygulamalar için vize gereklilikleri ve başvuru işlemlerini yönetmek üzere tasarlanmıştır.

## Base URL

```
Production: https://www.kolayseyahat.net/api/mobile
Development: http://localhost:3000/api/mobile
```

## Authentication

Şu an için public API. İleride API key authentication eklenebilir.

## CORS

Tüm endpoint'ler CORS destekler ve herhangi bir origin'den erişilebilir.

---

## Endpoints

### 1. Ülkeler Listesi

Tüm aktif ülkeleri, vize durumlarını, istatistikleri ve kıta bilgilerini listeler.

```
GET /api/mobile/countries
```

#### Query Parameters

| Parametre | Tip | Açıklama |
|-----------|-----|----------|
| search | string | Ülke adına göre filtrele |
| visaStatus | string | Vize durumuna göre filtrele: `visa-free`, `evisa`, `visa-required`, `visa-on-arrival`, `schengen` |
| continent | string | Kıtaya göre filtrele: `Avrupa`, `Asya`, `Afrika`, `Orta Doğu`, `Kuzey Amerika`, `Güney Amerika`, `Okyanusya` |

#### Örnek Request

```bash
# Tüm ülkeler
curl https://www.kolayseyahat.net/api/mobile/countries

# Arama ile
curl "https://www.kolayseyahat.net/api/mobile/countries?search=amerika"

# Vize durumuna göre
curl "https://www.kolayseyahat.net/api/mobile/countries?visaStatus=visa-free"

# Kıtaya göre
curl "https://www.kolayseyahat.net/api/mobile/countries?continent=Avrupa"
```

#### Örnek Response

```json
{
  "success": true,
  "data": [
    {
      "id": 80,
      "name": "Bosna Hersek",
      "slug": "bosna-hersek",
      "countryCode": "BIH",
      "imageUrl": "https://...",
      "processTime": "İşlem süresi yoktur",
      "visaRequired": false,
      "visaType": "Vizesiz",
      "visaStatus": "visa-free",
      "maxStayDuration": "90 gün",
      "continent": "Avrupa",
      "continentEn": "Europe"
    }
  ],
  "count": 196,
  "statistics": {
    "visaFree": 115,
    "evisa": 7,
    "visaOnArrival": 1,
    "visaRequired": 73,
    "total": 196
  },
  "continents": [
    { "name": "Afrika", "count": 53 },
    { "name": "Avrupa", "count": 49 },
    { "name": "Asya", "count": 26 },
    { "name": "Orta Doğu", "count": 14 },
    { "name": "Güney Amerika", "count": 12 },
    { "name": "Kuzey Amerika", "count": 11 },
    { "name": "Okyanusya", "count": 8 }
  ]
}
```

---

### 2. Ülke Detayı

Belirli bir ülkenin TÜM detaylı bilgilerini getirir:
- Ülke bilgileri (başkent, para birimi, dil, saat dilimi)
- Vize gereklilikleri (durum, kalış süresi, başvuru yöntemi)
- Gerekli belgeler
- Başvuru adımları
- Önemli notlar ve seyahat ipuçları
- Sağlık gereksinimleri
- Gümrük kuralları
- Acil durum iletişim bilgileri
- Popüler şehirler
- Paketler ve fiyatlar

```
GET /api/mobile/countries/{slug}
```

#### Path Parameters

| Parametre | Tip | Açıklama |
|-----------|-----|----------|
| slug | string | Ülke slug'ı (örn: `bosna-hersek`, `amerika`) |

#### Örnek Request

```bash
curl https://www.kolayseyahat.net/api/mobile/countries/bosna-hersek
```

#### Örnek Response

```json
{
  "success": true,
  "data": {
    "id": 80,
    "name": "Bosna Hersek",
    "slug": "bosna-hersek",
    "countryCode": "BIH",
    "imageUrl": "https://...",
    "title": "Bosna Hersek Vizesi",
    "description": "Bosna Hersek, tarihi ve kültürel zenginlikleriyle dolu bir Balkan ülkesidir.",
    
    "countryInfo": {
      "capital": "Sarajevo",
      "currency": "Bosna-Hersek Markı (1 BAM = 14.49 TRY)",
      "language": "Boşnakça, Sırpça, Hırvatça",
      "timezone": "Orta Avrupa Zamanı (CET)"
    },
    
    "visaInfo": {
      "visaRequired": false,
      "visaType": "Vizesiz",
      "visaStatus": "visa-free",
      "processTime": "İşlem süresi yoktur",
      "maxStayDuration": "90 gün",
      "visaFee": "Vize ücreti yoktur",
      "applicationMethod": "not-required"
    },
    
    "requiredDocuments": [
      "Geçerli pasaport",
      "Seyahat sağlık sigortası",
      "Otel rezervasyonu",
      "Dönüş bileti"
    ],
    
    "applicationSteps": [
      "Adım 1: Kolay Seyahat uzman danışmanlarıyla iletişime geçin",
      "Adım 2: Gerekli belgeleri hazırlayın",
      "Adım 3: Başvuru formunu doldurun",
      "Adım 4: Randevu alın ve konsolosluğa gidin",
      "Adım 5: Vize sonucunu bekleyin"
    ],
    
    "importantNotes": [
      "Bosna Hersek'e vizesiz seyahat edebilirsiniz.",
      "Seyahat sağlık sigortası yaptırmayı unutmayın."
    ],
    
    "travelTips": [
      "Yerel para birimini kullanmayı öğrenin.",
      "Temel Boşnakça kelimeleri öğrenmek faydalı olabilir."
    ],
    
    "healthRequirements": "Yurtdışı seyahat sağlık sigortası önerilmektedir.",
    
    "customsRegulations": "Yasaklı maddeler veya yüksek miktarda nakit para ile seyahat etmemeye dikkat edin.",
    
    "emergencyContacts": {
      "police": "122",
      "ambulance": "124",
      "emergencyNumber": "112",
      "embassy": "Türk Elçiliği - Tel: +387 33 441 140, Adres: Bistrik 15, 71000 Sarajevo"
    },
    
    "popularCities": ["Sarajevo", "Mostar", "Banja Luka"],
    
    "bestTimeToVisit": "Bahar ve yaz ayları",
    
    "whyKolaySeyahat": "Uzman desteği, zaman kazancı ve güvenli seyahat deneyimi.",
    
    "packages": [],
    "hasPackages": false,
    "pricing": null
  }
}
```

---

### 3. Başvuru Gönder

Yeni bir vize başvurusu oluşturur.

```
POST /api/mobile/applications
```

#### Request Body

| Alan | Tip | Zorunlu | Açıklama |
|------|-----|---------|----------|
| fullName | string | ✅ | Ad Soyad |
| email | string | ✅ | E-posta adresi |
| phone | string | ✅ | Telefon numarası |
| countryId | number | ❌ | Ülke ID |
| countryName | string | ❌ | Ülke adı |
| packageId | number | ❌ | Paket ID |
| packageName | string | ❌ | Paket adı |
| notes | string | ❌ | Ek notlar |

#### Örnek Request

```bash
curl -X POST https://www.kolayseyahat.net/api/mobile/applications \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Ahmet Yılmaz",
    "email": "ahmet@example.com",
    "phone": "0532 123 4567",
    "countryId": 4,
    "countryName": "Amerika",
    "packageId": 1,
    "packageName": "B1/B2 Turist Vizesi",
    "notes": "Acil başvuru, 2 hafta içinde"
  }'
```

#### Başarılı Response

```json
{
  "success": true,
  "message": "Başvurunuz başarıyla alındı. En kısa sürede sizinle iletişime geçeceğiz.",
  "applicationId": 123
}
```

#### Hata Response

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

---

## Vize Durumları (visaStatus)

| Değer | Açıklama |
|-------|----------|
| `visa-free` | Vize gerekmiyor |
| `evisa` | E-Vize ile giriş |
| `visa-on-arrival` | Kapıda vize |
| `visa-required` | Konsolosluk vizesi gerekli |

---

## Para Birimleri

| Değer | Açıklama |
|-------|----------|
| `TRY` | Türk Lirası |
| `USD` | Amerikan Doları |
| `EUR` | Euro |

---

## Hata Kodları

| HTTP Kodu | Açıklama |
|-----------|----------|
| 200 | Başarılı |
| 400 | Geçersiz istek (eksik/hatalı parametre) |
| 404 | Kaynak bulunamadı |
| 500 | Sunucu hatası |

---

## Rate Limiting

Şu an için rate limiting uygulanmamaktadır. Kötüye kullanım durumunda eklenebilir.

---

## Caching

- Ülkeler listesi: 1 saat cache
- Ülke detayı: 1 saat cache
- Başvurular: Cache yok (real-time)

---

## Mobil Uygulama Örnek Akışı

### Flutter/Dart Örneği

```dart
import 'dart:convert';
import 'package:http/http.dart' as http;

class VisaApiService {
  static const baseUrl = 'https://www.kolayseyahat.net/api/mobile';

  // Ülkeleri getir
  Future<List<Country>> getCountries({String? search, String? visaStatus}) async {
    var url = '$baseUrl/countries';
    var params = <String, String>{};
    if (search != null) params['search'] = search;
    if (visaStatus != null) params['visaStatus'] = visaStatus;
    
    if (params.isNotEmpty) {
      url += '?' + params.entries.map((e) => '${e.key}=${e.value}').join('&');
    }

    final response = await http.get(Uri.parse(url));
    final data = jsonDecode(response.body);
    
    if (data['success']) {
      return (data['data'] as List).map((c) => Country.fromJson(c)).toList();
    }
    throw Exception(data['error']);
  }

  // Ülke detayı getir
  Future<CountryDetail> getCountryDetail(String slug) async {
    final response = await http.get(Uri.parse('$baseUrl/countries/$slug'));
    final data = jsonDecode(response.body);
    
    if (data['success']) {
      return CountryDetail.fromJson(data['data']);
    }
    throw Exception(data['error']);
  }

  // Başvuru gönder
  Future<ApplicationResult> submitApplication({
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
      Uri.parse('$baseUrl/applications'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'fullName': fullName,
        'email': email,
        'phone': phone,
        'countryId': countryId,
        'countryName': countryName,
        'packageId': packageId,
        'packageName': packageName,
        'notes': notes,
      }),
    );
    
    final data = jsonDecode(response.body);
    return ApplicationResult.fromJson(data);
  }
}
```

### React Native Örneği

```javascript
const API_BASE = 'https://www.kolayseyahat.net/api/mobile';

// Ülkeleri getir
export const getCountries = async (search, visaStatus) => {
  const params = new URLSearchParams();
  if (search) params.append('search', search);
  if (visaStatus) params.append('visaStatus', visaStatus);
  
  const url = `${API_BASE}/countries${params.toString() ? '?' + params : ''}`;
  const response = await fetch(url);
  const data = await response.json();
  
  if (data.success) return data.data;
  throw new Error(data.error);
};

// Ülke detayı getir
export const getCountryDetail = async (slug) => {
  const response = await fetch(`${API_BASE}/countries/${slug}`);
  const data = await response.json();
  
  if (data.success) return data.data;
  throw new Error(data.error);
};

// Başvuru gönder
export const submitApplication = async (applicationData) => {
  const response = await fetch(`${API_BASE}/applications`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(applicationData),
  });
  
  return await response.json();
};
```

---

## Destek

API ile ilgili sorularınız için: info@kolayseyahat.net
