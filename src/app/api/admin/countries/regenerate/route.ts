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

export async function POST(request: NextRequest) {
  try {
    const { countryId, fields, aiProvider = 'openai' } = await request.json();

    if (!countryId) {
      return NextResponse.json(
        { success: false, error: "Country ID is required" },
        { status: 400 }
      );
    }

    console.log(`🔄 Regenerating fields for country ID: ${countryId} using ${aiProvider.toUpperCase()}`);
    console.log(`📝 Fields to regenerate:`, fields);

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
      contents: `"contents": "SADECE GENEL ANLATIMSAL İÇERİK (EN AZ 8-10 paragraf, 1500+ kelime). ÖNEMLİ: Liste, madde, tablo kullanma! Sadece akıcı paragraflar. İçerik: 1) Ülke hakkında kapsamlı bilgi - tarihi, kültürü, turistik yerler, yaşam tarzı (3-4 paragraf), 2) Vize politikası genel açıklama - hangi durumlarda gerekli, vize türleri hakkında genel bilgi (2-3 paragraf), 3) Başvuru süreci genel anlatım - nasıl yapılır, nelere dikkat edilmeli, süreç nasıl işler (2-3 paragraf), 4) Kolay Seyahat avantajları - neden tercih edilmeli, nasıl kolaylık sağlar (2 paragraf). HTML formatında sadece <h3> başlıklar ve <p> paragraflar kullan."`,
      meta_description: `"meta_description": "SEO için optimize edilmiş açıklama (max 160 karakter, ülke vize bilgileri + CTA)"`,
      application_steps: `"application_steps": ["Adım 1: Kolay Seyahat uzman danışmanlarıyla iletişime geçin", "Adım 2: ...", "Adım 3: ...", "..."]`,
      required_documents: `"required_documents": ["Gerekli belge 1", "Gerekli belge 2", "..."]`,
      important_notes: `"important_notes": ["Önemli not 1", "Önemli not 2", "Kolay Seyahat uzman danışmanları tüm süreçte size yardımcı olur", "..."]`,
      travel_tips: `"travel_tips": ["Seyahat ipucu 1", "Seyahat ipucu 2", "..."]`,
      popular_cities: `"popular_cities": ["Popüler şehir 1", "Popüler şehir 2", "..."]`,
      best_time_to_visit: `"best_time_to_visit": "En iyi ziyaret zamanı ve nedeni"`,
      health_requirements: `"health_requirements": "Sağlık gereksinimleri (aşı, sigorta vb.)"`,
      customs_regulations: `"customs_regulations": "Gümrük kuralları özeti"`,
      emergency_contacts: `"emergency_contacts": {"embassy": "Türk Elçiliği/Konsolosluğu telefon ve adres bilgisi", "emergencyNumber": "Genel acil durum numarası (örn: 112)", "police": "Polis numarası", "ambulance": "Ambulans numarası"}`,
      why_kolay_seyahat: `"why_kolay_seyahat": "Kolay Seyahat ile çalışmanın avantajları (2-3 cümle)"`,
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

    const prompt = `Sen Kolay Seyahat vize danışmanlık firmasının uzman içerik yazarısın. ${country.name} ülkesi için aşağıdaki alanları yeniden oluştur.${visaInfoContext}

ÖNEMLİ KURALLAR:
1. Vize başvuru adımlarında "Kolay Seyahat'in uzman danışmanlarıyla başvuru yapabilirsiniz" vurgusunu yap
2. Ücret bilgilerinde "Danışmanlık hizmet bedelleri hariçtir" notunu ekle
3. SEO için optimize edilmiş içerik oluştur
4. Profesyonel ve güvenilir bir dil kullan

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

    // Update only selected fields
    const updateData: any = {};
    fields.forEach((field: string) => {
      if (generatedData[field] !== undefined) {
        updateData[field] = generatedData[field];
      }
    });

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
