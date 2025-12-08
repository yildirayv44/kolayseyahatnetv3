import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { supabase } from "@/lib/supabase";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY || "");

export async function POST(request: NextRequest) {
  try {
    const { country, aiProvider = 'openai' } = await request.json();

    if (!country || !country.name || !country.code) {
      return NextResponse.json(
        { success: false, error: "Country data is required" },
        { status: 400 }
      );
    }

    console.log(`🌍 Generating data for: ${country.name} using ${aiProvider.toUpperCase()}`);

    // Step 1: Generate comprehensive country data with selected AI provider
    const prompt = `Sen Kolay Seyahat vize danışmanlık firmasının uzman içerik yazarısın. ${country.name} (${country.code}) ülkesi için Türkiye vatandaşları için detaylı vize bilgileri oluştur.

ÖNEMLİ KURALLAR:
1. Vize başvuru adımlarında "Kolay Seyahat'in uzman danışmanlarıyla başvuru yapabilirsiniz" vurgusunu yap
2. Ücret bilgilerinde "Danışmanlık hizmet bedelleri hariçtir" notunu ekle
3. SEO için optimize edilmiş title ve meta description oluştur
4. Profesyonel ve güvenilir bir dil kullan

Aşağıdaki JSON formatında yanıt ver:

{
  "name": "${country.name}",
  "code": "${country.code}",
  "region": "${country.region}",
  "capital": "Başkent adı",
  "currency": "Para birimi (TRY karşılığı ile)",
  "language": "Resmi dil(ler)",
  "timezone": "Saat dilimi",
  "visaRequired": ${country.visaRequired},
  "visaType": "Vize türü (Vizesiz, E-Vize, Vize Gerekli, vb.)",
  "maxStayDuration": "Maksimum kalış süresi",
  "visaFee": "Vize ücreti (Danışmanlık hizmet bedelleri hariçtir notu ekle)",
  "processingTime": "İşlem süresi",
  "seoTitle": "SEO için optimize edilmiş başlık (max 60 karakter, ülke adı + vize + Kolay Seyahat)",
  "seoDescription": "SEO için optimize edilmiş açıklama (max 160 karakter, ülke vize bilgileri + CTA)",
  "description": "Ülke hakkında 2-3 cümlelik kısa açıklama (seyahat odaklı)",
  "visaDescription": "Vize süreci hakkında detaylı açıklama (3-4 paragraf). Kolay Seyahat'in uzman danışmanlarıyla başvuru yapılabileceğini vurgula.",
  "applicationSteps": [
    "Adım 1: ... (Kolay Seyahat uzman danışmanlarıyla iletişime geçin)",
    "Adım 2: ...",
    "Adım 3: ...",
    "..."
  ],
  "requiredDocuments": [
    "Gerekli belge 1",
    "Gerekli belge 2",
    "..."
  ],
  "importantNotes": [
    "Önemli not 1",
    "Önemli not 2",
    "Kolay Seyahat uzman danışmanları tüm süreçte size yardımcı olur",
    "..."
  ],
  "travelTips": [
    "Seyahat ipucu 1",
    "Seyahat ipucu 2",
    "..."
  ],
  "popularCities": [
    "Popüler şehir 1",
    "Popüler şehir 2",
    "..."
  ],
  "bestTimeToVisit": "En iyi ziyaret zamanı ve nedeni",
  "healthRequirements": "Sağlık gereksinimleri (aşı, sigorta vb.)",
  "customsRegulations": "Gümrük kuralları özeti",
  "emergencyContacts": {
    "embassy": "Türkiye'deki elçilik/konsolosluk bilgisi",
    "emergencyNumber": "Acil durum numarası"
  },
  "whyKolaySeyahat": "Kolay Seyahat ile çalışmanın avantajları (2-3 cümle)"
}

SADECE JSON yanıtı ver, başka açıklama ekleme.`;

    let countryData;

    if (aiProvider === 'openai') {
      // Use OpenAI GPT-4o Mini
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

      const text = completion.choices[0].message.content || "{}";
      countryData = JSON.parse(text);
    } else {
      // Use Google Gemini 1.5 Flash
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const result = await model.generateContent(prompt);
      const response = result.response;
      const text = response.text();

      // Parse JSON response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("Failed to parse AI response");
      }

      countryData = JSON.parse(jsonMatch[0]);
    }

    console.log(`✅ Generated data for ${country.name}`);

    // Step 2: Generate country image with Imagen
    // Temporarily disabled - will add back once Imagen API is fixed
    let imageUrl = null;
    console.log(`⏭️ Skipping image generation for ${country.name} (will add later)`);

    // Step 3: Insert country into database
    // Only use fields that exist in the database schema
    const { data: insertedCountry, error: insertError } = await supabase
      .from("countries")
      .insert({
        name: countryData.name,
        title: countryData.seoTitle || `${countryData.name} Vizesi | Kolay Seyahat`,
        description: countryData.description,
        visa_description: countryData.visaDescription,
        visa_required: countryData.visaRequired ? 1 : 0,
        country_code: countryData.code,
        image_url: imageUrl,
        status: 1,
        sorted: 999,
      })
      .select()
      .single();

    if (insertError) {
      console.error(`Database insert error for ${country.name}:`, insertError);
      throw new Error(`Failed to insert country: ${insertError.message}`);
    }

    console.log(`✅ ${country.name} added to database with ID: ${insertedCountry.id}`);

    // Step 4: Create taxonomy entry for URL slug
    const slug = countryData.name
      .toLowerCase()
      .replace(/ı/g, 'i')
      .replace(/ğ/g, 'g')
      .replace(/ü/g, 'u')
      .replace(/ş/g, 's')
      .replace(/ö/g, 'o')
      .replace(/ç/g, 'c')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    const { error: taxonomyError } = await supabase
      .from("taxonomies")
      .insert({
        model_id: insertedCountry.id,
        type: "Country\\CountryController@detail",
        slug: slug,
        locale: "tr",
      });

    if (taxonomyError) {
      console.error(`Taxonomy insert error for ${country.name}:`, taxonomyError);
      // Continue even if taxonomy fails
    } else {
      console.log(`✅ Taxonomy created for ${country.name}: ${slug}`);
    }

    return NextResponse.json({
      success: true,
      country: {
        ...insertedCountry,
        slug,
      },
      message: `${country.name} successfully added`,
    });

  } catch (error: any) {
    console.error("Country generation error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to generate country data",
        details: error.toString(),
      },
      { status: 500 }
    );
  }
}
