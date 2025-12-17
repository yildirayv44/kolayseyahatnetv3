import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient } from "@supabase/supabase-js";
import { getCountryCode } from "@/lib/country-codes";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY || "");

// Fetch and extract text content from a URL
async function fetchUrlContent(url: string): Promise<string> {
  try {
    // Check if it's a PDF
    if (url.toLowerCase().endsWith('.pdf') || url.toLowerCase().includes('.pdf?')) {
      try {
        const response = await fetch(url, {
          headers: { "User-Agent": "Mozilla/5.0 (compatible; KolaySeyahatBot/1.0)" },
          signal: AbortSignal.timeout(30000),
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const pdfParse = require('pdf-parse');
        const pdfData = await pdfParse(buffer);
        return `[PDF - ${pdfData.numpages} sayfa]\n${pdfData.text.replace(/\s+/g, " ").trim().slice(0, 15000)}`;
      } catch (pdfError: any) {
        return `[PDF okunamadı: ${pdfError.message}]`;
      }
    }

    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9,tr;q=0.8",
        "Cache-Control": "no-cache",
      },
      signal: AbortSignal.timeout(15000),
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    
    const html = await response.text();
    return html
      // Remove scripts, styles, nav, footer, header
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
      .replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, "")
      .replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, "")
      .replace(/<header[^>]*>[\s\S]*?<\/header>/gi, "")
      // Convert table cells to readable format
      .replace(/<\/th>/gi, " | ")
      .replace(/<\/td>/gi, " | ")
      .replace(/<\/tr>/gi, "\n")
      // Convert list items to readable format
      .replace(/<li[^>]*>/gi, "• ")
      .replace(/<\/li>/gi, "\n")
      // Convert paragraphs and breaks to newlines
      .replace(/<\/p>/gi, "\n")
      .replace(/<br\s*\/?>/gi, "\n")
      // Remove remaining tags
      .replace(/<[^>]+>/g, " ")
      // Decode HTML entities
      .replace(/&nbsp;/g, " ")
      .replace(/&ndash;/g, "–")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      // Clean up whitespace but preserve newlines
      .replace(/[ \t]+/g, " ")
      .replace(/\n\s*\n/g, "\n\n")
      .trim()
      .slice(0, 20000);
  } catch (error: any) {
    return `[Hata: ${error.message}]`;
  }
}

export async function POST(request: NextRequest) {
  try {
    const { countryId, fields, aiProvider = 'openai', sourceUrls = [] } = await request.json();

    if (!countryId) {
      return NextResponse.json(
        { success: false, error: "Country ID is required" },
        { status: 400 }
      );
    }

    console.log(`🔄 Regenerating fields for country ID: ${countryId} using ${aiProvider.toUpperCase()}`);
    console.log(`📝 Fields to regenerate:`, fields);
    console.log(`🔗 Source URLs:`, sourceUrls);

    // Get existing country data
    const { data: country, error: fetchError } = await supabase
      .from("countries")
      .select("*")
      .eq("id", countryId)
      .single();

    if (fetchError || !country) {
      return NextResponse.json(
        { success: false, error: "Country not found" },
        { status: 404 }
      );
    }

    // Get country_code and fetch visa requirements from PassportIndex
    const countryCode = country.country_code || getCountryCode(country.name);
    let visaRequirementData = null;
    
    if (countryCode) {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('localhost') 
          ? 'http://localhost:3000'
          : process.env.NEXT_PUBLIC_SUPABASE_URL?.replace('/rest/v1', '');
        const visaResponse = await fetch(`${baseUrl}/api/admin/visa-requirements/fetch-passportindex`);
        if (visaResponse.ok) {
          const visaData = await visaResponse.json();
          visaRequirementData = visaData.data?.find((v: any) => v.countryCode === countryCode);
          if (visaRequirementData) {
            console.log(`📋 Found visa requirement data for ${country.name}:`, visaRequirementData.visaStatus);
          }
        }
      } catch (error) {
        console.log(`⚠️ Could not fetch visa requirements for ${country.name}`);
      }
    }

    // Build dynamic prompt based on selected fields
    const fieldPrompts: Record<string, string> = {
      // İçerik alanları
      contents: `"contents": "SADECE GENEL ANLATIMSAL İÇERİK (EN AZ 8-10 paragraf, 1500+ kelime). ÖNEMLİ: Liste, madde, tablo kullanma! Sadece akıcı paragraflar. İçerik: 1) Ülke hakkında kapsamlı bilgi - tarihi, kültürü, turistik yerler, yaşam tarzı (3-4 paragraf), 2) Vize politikası genel açıklama - hangi durumlarda gerekli, vize türleri hakkında genel bilgi (2-3 paragraf), 3) Başvuru süreci genel anlatım - nasıl yapılır, nelere dikkat edilmeli, süreç nasıl işler (2-3 paragraf), 4) Kolay Seyahat avantajları - neden tercih edilmeli, nasıl kolaylık sağlar (2 paragraf). HTML formatında sadece <h3> başlıklar ve <p> paragraflar kullan."`,
      description: `"description": "Kısa ve öz açıklama (2-3 cümle, ülke ve vize hakkında genel bilgi)"`,
      why_kolay_seyahat: `"why_kolay_seyahat": "Kolay Seyahat ile çalışmanın avantajları (2-3 cümle)"`,
      req_document: `"req_document": "Gerekli belgeler HTML formatında detaylı açıklama. <h3> başlıklar ve <ul><li> listeler kullan. Her belge için açıklama ekle."`,
      price_contents: `"price_contents": "Vize ücretleri ve ödeme bilgileri HTML formatında. Ücret tablosu, ödeme yöntemleri, 'Danışmanlık hizmet bedelleri hariçtir' notu ekle."`,
      // SEO alanları
      meta_title: `"meta_title": "SEO için optimize edilmiş başlık (max 60 karakter, ülke adı + vize + Kolay Seyahat)"`,
      meta_description: `"meta_description": "SEO için optimize edilmiş açıklama (max 160 karakter, ülke vize bilgileri + CTA)"`,
      // Vize bilgileri
      visa_fee: `"visa_fee": "Vize ücreti (örn: 80 USD veya Vize ücreti yoktur). Kaynak URL'lerden doğru bilgiyi al. 'Danışmanlık hizmet bedelleri hariçtir' ekle."`,
      max_stay_duration: `"max_stay_duration": "Maksimum kalış süresi (örn: 90 gün, 30 gün). Kaynak URL'lerden doğru bilgiyi al."`,
      processing_time: `"processing_time": "İşlem süresi (örn: 3-5 iş günü, 7-14 gün). Kaynak URL'lerden doğru bilgiyi al."`,
      application_steps: `"application_steps": ["Adım 1: Kolay Seyahat uzman danışmanlarıyla iletişime geçin ve vize türünüzü belirleyin", "Adım 2: Gerekli belgeleri hazırlayın ve danışmanlarımıza iletin", "Adım 3: Başvuru formunu doldurun (danışmanlarımız yardımcı olur)", "Adım 4: Randevu alın ve konsolosluğa gidin", "Adım 5: Vize sonucunu bekleyin (takip için danışmanlarınızla iletişimde kalın)"]`,
      required_documents: `"required_documents": ["Pasaport (en az 6 ay geçerlilik süresi)", "Biyometrik fotoğraf", "Seyahat sağlık sigortası", "Uçak rezervasyonu", "Konaklama belgeleri", "Finansal durum belgeleri", "...diğer gerekli belgeler kaynak URL'lerden alınmalı"]`,
      important_notes: `"important_notes": ["Pasaportunuzun geçerlilik süresi, seyahat tarihinden itibaren en az 6 ay olmalıdır", "Seyahat sağlık sigortası yaptırmayı unutmayın", "Kolay Seyahat uzman danışmanları tüm süreçte size yardımcı olur", "Belgelerinizi eksiksiz ve doğru bir şekilde hazırlamak önemlidir", "...diğer önemli notlar kaynak URL'lerden alınmalı"]`,
      // Seyahat bilgileri
      travel_tips: `"travel_tips": ["Seyahat ipucu 1", "Seyahat ipucu 2", "..."]`,
      popular_cities: `"popular_cities": ["Popüler şehir 1", "Popüler şehir 2", "..."]`,
      best_time_to_visit: `"best_time_to_visit": "En iyi ziyaret zamanı ve nedeni"`,
      health_requirements: `"health_requirements": "Sağlık gereksinimleri (aşı, sigorta vb.)"`,
      customs_regulations: `"customs_regulations": "Gümrük kuralları özeti"`,
      emergency_contacts: `"emergency_contacts": {"embassy": "Türk Elçiliği/Konsolosluğu telefon ve adres bilgisi", "emergencyNumber": "Genel acil durum numarası (örn: 112)", "police": "Polis numarası", "ambulance": "Ambulans numarası"}`,
      // Ülke bilgileri
      capital: `"capital": "Başkent adı"`,
      currency: `"currency": "Para birimi (TRY karşılığı ile)"`,
      language: `"language": "Resmi dil(ler)"`,
      timezone: `"timezone": "Saat dilimi"`,
    };

    // Build prompt with only selected fields
    const selectedFieldPrompts = fields
      .filter((field: string) => fieldPrompts[field])
      .map((field: string) => fieldPrompts[field])
      .join(',\n  ');

    // Add visa context if available
    const visaInfoContext = visaRequirementData ? `

ÖNEMLI - GERÇEK VİZE BİLGİSİ (PassportIndex):
- Vize Durumu: ${visaRequirementData.visaStatus}
- Kalış Süresi: ${visaRequirementData.allowedStay || 'Belirtilmemiş'}
- Koşullar: ${visaRequirementData.conditions || 'Yok'}
- Başvuru Yöntemi: ${visaRequirementData.applicationMethod || 'Belirtilmemiş'}

Bu bilgileri MUTLAKA kullan ve içeriğe yansıt. Vize durumu ve kalış süresini doğru belirt.` : '';

    // Fetch source URL contents if provided
    let sourceUrlContext = '';
    if (sourceUrls && sourceUrls.length > 0) {
      console.log(`📥 Fetching ${sourceUrls.length} source URLs...`);
      const sourceContents: string[] = [];
      for (const url of sourceUrls) {
        if (url && url.trim()) {
          const content = await fetchUrlContent(url.trim());
          sourceContents.push(`--- Kaynak: ${url} ---\n${content}`);
        }
      }
      if (sourceContents.length > 0) {
        sourceUrlContext = `

RESMİ KAYNAK SAYFALAR (Bu bilgileri baz al ve içeriğe yansıt):
${sourceContents.join('\n\n')}

KRİTİK - KAYNAK KULLANIM KURALLARI:
- Vize ücreti, kalış süresi, işlem süresi gibi SAYISAL bilgileri SADECE yukarıdaki kaynak sayfalardan al
- Kaynak sayfada "30 USD" yazıyorsa "30 USD" yaz, başka bir değer UYDURMA
- Para birimi kaynak sayfadaki ile AYNI olmalı (USD ise USD, EUR ise EUR)
- Kaynak sayfada belirli bir bilgi YOKSA, o alanı boş bırak veya "Belirtilmemiş" yaz
- Kendi eğitim verinden veya genel bilginden SAYISAL değer EKLEME`;
        console.log(`✅ Fetched ${sourceContents.length} source URLs`);
      }
    }

    const prompt = `Sen Kolay Seyahat vize danışmanlık firmasının uzman içerik yazarısın. ${country.name} ülkesi için aşağıdaki alanları yeniden oluştur.${visaInfoContext}${sourceUrlContext}

ÖNEMLİ KURALLAR:
1. Vize başvuru adımlarında "Kolay Seyahat'in uzman danışmanlarıyla başvuru yapabilirsiniz" vurgusunu yap
2. Ücret bilgilerinde "Danışmanlık hizmet bedelleri hariçtir" notunu ekle
3. SEO için optimize edilmiş içerik oluştur
4. Profesyonel ve güvenilir bir dil kullan
5. Vize ücreti, kalış süresi gibi SAYISAL bilgileri SADECE kaynak sayfalardan al, UYDURMA

Aşağıdaki JSON formatında yanıt ver (SADECE seçili alanlar):

{
  ${selectedFieldPrompts}
}

SADECE JSON yanıtı ver, başka açıklama ekleme.`;

    let generatedData;

    if (aiProvider === 'openai') {
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "Sen bir vize danışmanlığı uzmanısın. Verilen ülke için detaylı ve doğru vize bilgileri üretiyorsun. Sadece JSON formatında yanıt veriyorsun."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        response_format: { type: "json_object" }
      });

      const content = completion.choices[0].message.content;
      if (!content) {
        throw new Error("No content generated from OpenAI");
      }
      generatedData = JSON.parse(content);
    } else {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("No valid JSON found in Gemini response");
      }
      generatedData = JSON.parse(jsonMatch[0]);
    }

    console.log(`✅ Generated data for ${fields.length} fields`);

    // Array fields that must be stored as arrays
    const arrayFields = [
      'application_steps',
      'required_documents', 
      'important_notes',
      'travel_tips',
      'popular_cities',
    ];

    // Update only selected fields with proper type handling
    const updateData: any = {};
    fields.forEach((field: string) => {
      if (generatedData[field] !== undefined) {
        let value = generatedData[field];
        
        // Ensure array fields are actually arrays
        if (arrayFields.includes(field)) {
          if (typeof value === 'string') {
            // Try to parse if it's a JSON string
            try {
              value = JSON.parse(value);
            } catch {
              // If parsing fails, split by newlines or commas
              value = value.split(/[\n,]/).map((s: string) => s.trim()).filter(Boolean);
            }
          }
          // Ensure it's an array
          if (!Array.isArray(value)) {
            value = value ? [value] : [];
          }
        }
        
        updateData[field] = value;
      }
    });
    
    console.log(`📦 Update data types:`, Object.entries(updateData).map(([k, v]) => `${k}: ${Array.isArray(v) ? 'array' : typeof v}`));

    const { error: updateError } = await supabase
      .from("countries")
      .update(updateData)
      .eq("id", countryId);

    if (updateError) {
      console.error(`Database update error:`, updateError);
      throw new Error(`Failed to update country: ${updateError.message}`);
    }

    console.log(`✅ Updated ${Object.keys(updateData).length} fields for ${country.name}`);

    return NextResponse.json({
      success: true,
      message: `Successfully regenerated ${fields.length} fields`,
      updatedFields: Object.keys(updateData),
      data: updateData,
    });
  } catch (error: any) {
    console.error("❌ Regenerate error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
