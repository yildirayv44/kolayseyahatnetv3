import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const runtime = "nodejs";
export const maxDuration = 60;

/**
 * Generate country menu content using AI
 * POST /api/admin/ai/generate-country-menu
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      countryName, 
      menuName, 
      menuType, // 'category' or 'page'
      parentCategory,
      keywords = [],
      tone = 'professional',
      length = 'medium'
    } = body;

    if (!countryName || !menuName) {
      return NextResponse.json(
        { error: "Ülke adı ve sayfa adı gerekli" },
        { status: 400 }
      );
    }

    // Generate content
    const contentPrompt = `Sen profesyonel bir vize danışmanlık şirketinin içerik yazarısın. 

Görev: "${countryName} - ${menuName}" için detaylı, bilgilendirici ve SEO uyumlu içerik oluştur.

Sayfa Tipi: ${menuType === 'category' ? 'Kategori Sayfası (Genel Bakış)' : 'Alt Sayfa (Detaylı Bilgi)'}
${parentCategory ? `Ana Kategori: ${parentCategory}` : ''}
${keywords.length > 0 ? `Anahtar Kelimeler: ${keywords.join(', ')}` : ''}

Ton: ${tone === 'professional' ? 'Profesyonel ve güvenilir' : tone === 'friendly' ? 'Samimi ve yardımsever' : 'Bilgilendirici'}
Uzunluk: ${length === 'short' ? '500-800 kelime' : length === 'medium' ? '1000-1500 kelime' : '1500-2000 kelime'}

İçerik Yapısı:
1. Giriş Paragrafı (Genel bilgi ve önem)
2. Ana Bölümler:
   - Vize Türü/Gereklilikleri
   - Başvuru Süreci
   - Gerekli Belgeler
   - Süre ve Ücretler
   - Önemli Notlar ve İpuçları
3. Sonuç ve CTA (Kolay Seyahat ile iletişim)

Önemli:
- Türkçe yaz
- HTML formatında döndür (<h2>, <h3>, <p>, <ul>, <li> kullan)
- SEO uyumlu başlıklar kullan
- Kolay Seyahat'ın uzmanlığını vurgula
- Güncel ve doğru bilgiler ver
- Okuyucuya değer kat
- CTA ekle: "0212 909 99 71" telefon numarası

Lütfen sadece HTML içeriği döndür, başka açıklama ekleme.`;

    const contentResponse = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "Sen profesyonel bir vize danışmanlık içerik yazarısın. HTML formatında, SEO uyumlu, bilgilendirici içerikler oluşturursun."
        },
        {
          role: "user",
          content: contentPrompt
        }
      ],
      temperature: 0.7,
      max_tokens: 3000,
    });

    const content = contentResponse.choices[0]?.message?.content || "";

    // Generate SEO metadata
    const metaPrompt = `"${countryName} - ${menuName}" için SEO metadata oluştur.

Anahtar Kelimeler: ${keywords.join(', ')}

Lütfen SADECE aşağıdaki JSON formatında döndür:
{
  "meta_title": "60 karakter max, SEO optimized başlık",
  "meta_description": "150-160 karakter, ikna edici açıklama",
  "slug": "url-friendly-slug",
  "short_description": "Kısa özet (200 karakter max)"
}

Kurallar:
- meta_title: Ülke adı + vize türü + "Kolay Seyahat" içermeli
- meta_description: Fayda odaklı, CTA içermeli
- slug: küçük harf, tire ile ayrılmış, türkçe karakter yok
- short_description: Sayfa için kısa tanıtım`;

    const metaResponse = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "Sen SEO uzmanısın. JSON formatında metadata oluşturursun."
        },
        {
          role: "user",
          content: metaPrompt
        }
      ],
      temperature: 0.5,
      max_tokens: 500,
      response_format: { type: "json_object" }
    });

    const metadataText = metaResponse.choices[0]?.message?.content || "{}";
    const metadata = JSON.parse(metadataText);

    return NextResponse.json({
      content,
      metadata: {
        meta_title: metadata.meta_title || `${countryName} ${menuName} - Kolay Seyahat`,
        meta_description: metadata.meta_description || `${countryName} ${menuName} hakkında detaylı bilgi ve profesyonel danışmanlık hizmeti.`,
        slug: metadata.slug || menuName.toLowerCase().replace(/\s+/g, '-'),
        short_description: metadata.short_description || `${countryName} ${menuName} bilgileri`
      }
    });

  } catch (error: any) {
    console.error("Generate country menu error:", error);
    return NextResponse.json(
      { error: error.message || "İçerik oluşturulamadı" },
      { status: 500 }
    );
  }
}
