import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import OpenAI from "openai";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Check if URL is a PDF
function isPdfUrl(url: string): boolean {
  return url.toLowerCase().endsWith('.pdf') || url.toLowerCase().includes('.pdf?');
}

// Fetch PDF and extract text using pdf-parse
async function fetchPdfContent(url: string): Promise<string> {
  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; KolaySeyahatBot/1.0)",
      },
      signal: AbortSignal.timeout(30000), // 30 second timeout for PDFs
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Use require for pdf-parse (CommonJS module)
    const pdfParse = require('pdf-parse');
    const pdfData = await pdfParse(buffer);
    
    // Clean and limit text
    const text = pdfData.text
      .replace(/\s+/g, " ")
      .trim();
    
    return `[PDF İçeriği - ${pdfData.numpages} sayfa]\n${text.slice(0, 20000)}`;
  } catch (error: any) {
    console.error(`Error fetching PDF ${url}:`, error.message);
    // Fallback: return URL info for AI to understand it's a PDF
    return `[PDF dosyası: ${url} - İçerik okunamadı: ${error.message}. Lütfen PDF'i manuel olarak kontrol edin.]`;
  }
}

// Fetch URL using Node.js https module (more reliable for some servers)
async function fetchWithHttps(url: string): Promise<string> {
  const https = require('https');
  const http = require('http');
  
  return new Promise((resolve) => {
    const isHttps = url.startsWith('https');
    const client = isHttps ? https : http;
    
    const options = {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
      },
      rejectUnauthorized: false,
      timeout: 30000,
    };
    
    const req = client.get(url, options, (res: any) => {
      // Handle redirects
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        fetchWithHttps(res.headers.location).then(resolve);
        return;
      }
      
      let data = '';
      res.on('data', (chunk: any) => data += chunk);
      res.on('end', () => resolve(data));
    });
    
    req.on('error', (err: any) => {
      console.error(`HTTPS fetch error: ${err.message}`);
      resolve('');
    });
    
    req.on('timeout', () => {
      req.destroy();
      resolve('');
    });
  });
}

// Fetch and extract text content from a URL (HTML or PDF)
async function fetchUrlContent(url: string): Promise<string> {
  // Check if it's a PDF
  if (isPdfUrl(url)) {
    return fetchPdfContent(url);
  }

  try {
    // Use Node.js https module directly for better compatibility
    const html = await fetchWithHttps(url);
    
    if (!html || html.length < 100) {
      throw new Error("Empty or invalid response");
    }

    // Check if it's a PDF response
    if (html.startsWith('%PDF')) {
      try {
        const pdfParse = require('pdf-parse');
        const buffer = Buffer.from(html, 'binary');
        const pdfData = await pdfParse(buffer);
        return `[PDF İçeriği - ${pdfData.numpages} sayfa]\n${pdfData.text.replace(/\s+/g, " ").trim().slice(0, 20000)}`;
      } catch (pdfError: any) {
        return `[PDF dosyası algılandı ancak okunamadı: ${pdfError.message}]`;
      }
    }
    
    // Better HTML to text conversion - preserve table structure and important content
    const text = html
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
      .replace(/<\/div>/gi, "\n")
      // Remove remaining tags
      .replace(/<[^>]+>/g, " ")
      // Decode HTML entities
      .replace(/&nbsp;/g, " ")
      .replace(/&ndash;/g, "–")
      .replace(/&mdash;/g, "—")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      // Clean up whitespace but preserve newlines
      .replace(/[ \t]+/g, " ")
      .replace(/\n\s*\n/g, "\n\n")
      .trim();

    // Limit content length for API
    return text.slice(0, 20000);
  } catch (error: any) {
    console.error(`Error fetching ${url}:`, error.message);
    return `[Error fetching content: ${error.message}]`;
  }
}

export async function POST(request: NextRequest) {
  try {
    const { countryId, sourceUrls, additionalContent } = await request.json();

    if (!countryId || (!sourceUrls?.length && !additionalContent)) {
      return NextResponse.json(
        { error: "countryId and either sourceUrls or additionalContent required" },
        { status: 400 }
      );
    }

    // Get current country data
    const { data: country, error: countryError } = await supabaseAdmin
      .from("countries")
      .select("*")
      .eq("id", countryId)
      .single();

    if (countryError || !country) {
      return NextResponse.json(
        { error: "Country not found" },
        { status: 404 }
      );
    }

    // Fetch content from all source URLs
    const sourceContents: { url: string; content: string }[] = [];
    for (const url of (sourceUrls || [])) {
      if (url && url.trim()) {
        const content = await fetchUrlContent(url.trim());
        console.log(`📄 Fetched content from ${url}:`);
        console.log(`   Length: ${content.length} chars`);
        console.log(`   Preview: ${content.slice(0, 1000)}...`);
        
        // Check if USD prices are in content
        const usdMatches = content.match(/USD\s*\d+|\d+\s*USD/gi);
        console.log(`   USD fiyatları: ${usdMatches ? usdMatches.slice(0, 10).join(', ') : 'Bulunamadı'}`);
        
        sourceContents.push({ url: url.trim(), content });
      }
    }

    if (sourceContents.length === 0 && !additionalContent) {
      return NextResponse.json(
        { error: "No valid source URLs or additional content provided" },
        { status: 400 }
      );
    }

    // Prepare current country data summary
    const currentData = {
      name: country.name,
      visa_fee: country.visa_fee || "Belirtilmemiş",
      max_stay_duration: country.max_stay_duration || "Belirtilmemiş",
      processing_time: country.processing_time || country.process_time || "Belirtilmemiş",
      required_documents: country.required_documents || [],
      important_notes: country.important_notes || [],
      application_steps: country.application_steps || [],
      contents: country.contents || "İçerik yok",
      req_document: country.req_document || "",
      price_contents: country.price_contents || "",
    };

    // Build prompt for AI analysis
    const sourceTexts = sourceContents
      .map((s, i) => `--- Kaynak ${i + 1}: ${s.url} ---\n${s.content}`)
      .join("\n\n");

    // Strip HTML tags from contents for analysis
    const stripHtml = (html: string) => html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();

    const prompt = `Sen bir vize danışmanlık uzmanısın. Aşağıdaki resmi kaynak sayfalarını analiz ederek ${country.name} vizesi hakkında güncel bilgileri çıkar ve mevcut içeriğimizi değerlendir.

MEVCUT VERİLERİMİZ (JSON Alanları):
- Vize Ücreti (visa_fee): ${currentData.visa_fee}
- Maksimum Kalış Süresi (max_stay_duration): ${currentData.max_stay_duration}
- İşlem Süresi (processing_time): ${currentData.processing_time}
- Gerekli Belgeler Listesi (required_documents - JSON array): ${JSON.stringify(currentData.required_documents)}
- Önemli Notlar (important_notes - JSON array): ${JSON.stringify(currentData.important_notes)}
- Başvuru Adımları (application_steps - JSON array): ${JSON.stringify(currentData.application_steps)}

MEVCUT SAYFA İÇERİĞİ (contents alanı - Ana HTML içerik):
${stripHtml(currentData.contents).slice(0, 4000)}

MEVCUT GEREKLİ BELGELER İÇERİĞİ (req_document alanı - HTML):
${stripHtml(currentData.req_document).slice(0, 2000)}

MEVCUT FİYAT İÇERİĞİ (price_contents alanı - HTML):
${stripHtml(currentData.price_contents).slice(0, 1500)}

KAYNAK SAYFALAR (Resmi Kaynaklar):
${sourceTexts || "(URL'lerden içerik alınamadı)"}

${additionalContent ? `KULLANICI TARAFINDAN GİRİLEN EK İÇERİK (ÇOK ÖNEMLİ - MUTLAKA DİKKATE AL):
--- Kullanıcı Girişi ---
${additionalContent}
--- Kullanıcı Girişi Sonu ---

NOT: Yukarıdaki kullanıcı tarafından girilen içerik, kaynak sayfalardan kopyalanmış önemli bilgiler içermektedir. Bu içeriği MUTLAKA dikkate al ve analiz et. Bu içerikteki bilgiler güvenilir kabul edilmelidir.
` : ''}
GÖREV:
1. Kaynak sayfalardan vize ile ilgili TÜM güncel bilgileri çıkar
2. Mevcut verilerimizle DETAYLI karşılaştır
3. HER ALAN için değişiklik veya güncelleme önerileri sun
4. Özellikle şunları kontrol et:
   - Vize ücreti değişmiş mi?
   - Gerekli belgeler listesi güncel mi? Eksik veya fazla belge var mı?
   - Kalış süresi doğru mu?
   - İşlem süresi güncel mi?
   - Önemli notlarda eksik bilgi var mı?
   - Ana içerikte (contents) güncel olmayan veya eksik bilgi var mı?
5. KAYNAK SAYFALARDA BULUNAN FAYDALI EK BİLGİLERİ de öner:
   - Başvuru prosedürleri ve adımları
   - Özel durumlar ve istisnalar
   - Konsolosluk/büyükelçilik bilgileri
   - Vize türleri ve farklılıkları
   - Sık sorulan sorular ve cevapları
   - Kullanıcılar için faydalı ipuçları

ÖNEMLİ KURALLAR:
- SADECE kaynak sayfalarda AÇIKÇA YAZILI olan bilgileri kullan
- Kaynak sayfada OLMAYAN bilgileri KESİNLİKLE UYDURMA
- Eğer bir bilgi kaynak sayfada yoksa "Kaynak sayfada belirtilmemiş" yaz
- Kendi eğitim verinden veya genel bilginden BİLGİ EKLEME
- Mevcut içeriğimizde OLMAYAN bilgileri mutlaka belirt
- Güncel olmayan veya YANLIŞ bilgileri tespit et
- JSON array alanları için (required_documents, important_notes, application_steps) tam liste öner
- Ana içerik (contents) için eklenecek paragrafları HTML formatında öner
- contents alanı için suggestions dizisine field_name: "contents" olarak öneri ekle
- contents önerisi için suggested_value alanına eklenecek HTML içeriği yaz (mevcut içeriğe EKLENECEk yeni bölümler)

KRİTİK - BİLGİ KAYNAĞI KURALI:
- Vize ücreti, kalış süresi, işlem süresi gibi bilgiler SADECE kaynak sayfadan alınmalı
- Kaynak sayfada "30 USD" yazıyorsa "30 USD" yaz, "90 EUR" gibi farklı bir değer UYDURMA
- Para birimi kaynak sayfadaki ile AYNI olmalı (USD ise USD, EUR ise EUR)
- Eğer kaynak sayfada belirli bir bilgi yoksa, o alanı "Kaynak sayfada bulunamadı" olarak işaretle

SOMUT ÖNERİ KURALLARI (ÇOK ÖNEMLİ):
- "Kalıp bilgilerin güncellenmesi" gibi GENEL öneriler YASAK
- Her öneri SOMUT ve UYGULANABILIR olmalı
- Örnek KÖTÜ öneri: "Eksik bilgilerin eklenmesi" 
- Örnek İYİ öneri: "Vize ücreti 30 USD olarak güncellenmeli (kaynak: immigration.gov.np)"
- content_improvements içinde html_content alanına GERÇEK HTML içerik yaz
- Kaynaklarda bulduğun bilgileri doğrudan öner, soyut kalma
- Kaynak sayfada olmayan bilgileri ÖNERİ OLARAK DA SUNMA

YANIT FORMAT (JSON):
{
  "analysis_summary": "Genel analiz özeti - kaynaklarda ne bulundu, mevcut içerikle farklar neler (Türkçe, detaylı)",
  "suggestions": [
    {
      "type": "visa_fee|requirements|documents|visa_status|processing_time|stay_duration|content|general",
      "field_name": "güncellenecek alan adı (visa_fee, max_stay_duration, processing_time, required_documents, important_notes, application_steps, contents, req_document, price_contents)",
      "current_value": "mevcut değer (kısa özet)",
      "suggested_value": "önerilen yeni değer - JSON array için tam array, HTML için HTML içerik",
      "source_url": "bilginin alındığı kaynak URL",
      "confidence": 0.0-1.0 arası güven skoru,
      "reason": "değişiklik nedeni (Türkçe, detaylı)"
    }
  ],
  "content_improvements": [
    {
      "section": "hangi bölüm (Ana İçerik, Gerekli Belgeler Bölümü, Fiyat Bölümü, Başvuru Adımları vb.)",
      "issue": "tespit edilen SOMUT sorun - örn: 'Vize ücreti 80 EUR yazıyor ama kaynaklarda 90 EUR'",
      "suggestion": "SOMUT düzeltme - örn: 'Vize ücretini 90 EUR olarak güncelleyin'",
      "priority": "high|medium|low",
      "html_content": "Eklenecek veya değiştirilecek HTML içerik - örn: '<p>Bulgaristan vizesi için güncel ücret 90 EUR'dir.</p>'"
    }
  ],
  "no_changes_needed": false,
  "visa_required": true/false/null,
  "extracted_info": {
    "visa_fee": "tespit edilen ücret",
    "stay_duration": "tespit edilen kalış süresi",
    "processing_time": "tespit edilen işlem süresi",
    "documents": ["tespit edilen TÜM belgeler listesi"],
    "important_notes": ["tespit edilen TÜM önemli notlar"],
    "application_steps": ["tespit edilen başvuru adımları"]
  }
}

NOT: En az 1 öneri sun. Hiç değişiklik gerekmese bile extracted_info'yu doldur. Sadece JSON formatında yanıt ver.`;


    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "Sen bir vize danışmanlık uzmanısın. Resmi kaynaklardan vize bilgilerini analiz edip JSON formatında raporluyorsun. Türkçe yanıt ver.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.3,
      max_tokens: 4000,
      response_format: { type: "json_object" },
    });

    const aiResponse = completion.choices[0]?.message?.content;
    if (!aiResponse) {
      throw new Error("AI response empty");
    }

    const analysis = JSON.parse(aiResponse);

    // Save suggestions to database if any
    if (analysis.suggestions && analysis.suggestions.length > 0) {
      for (const suggestion of analysis.suggestions) {
        await supabaseAdmin.from("content_suggestions").insert({
          country_id: countryId,
          suggestion_type: suggestion.type,
          field_name: suggestion.field_name,
          current_value: typeof suggestion.current_value === 'object' 
            ? JSON.stringify(suggestion.current_value) 
            : suggestion.current_value,
          suggested_value: typeof suggestion.suggested_value === 'object'
            ? JSON.stringify(suggestion.suggested_value)
            : suggestion.suggested_value,
          source_url: suggestion.source_url,
          confidence_score: suggestion.confidence,
          notes: suggestion.reason,
          status: "pending",
        });
      }
    }

    // Update country with last check timestamp
    await supabaseAdmin
      .from("countries")
      .update({
        source_urls: sourceUrls.filter((u: string) => u && u.trim()),
        last_source_check: new Date().toISOString(),
        source_check_notes: analysis.analysis_summary,
      })
      .eq("id", countryId);

    return NextResponse.json({
      success: true,
      analysis,
      sourcesAnalyzed: sourceContents.length,
    });
  } catch (error: any) {
    console.error("Source analysis error:", error);
    return NextResponse.json(
      { error: error.message || "Analysis failed" },
      { status: 500 }
    );
  }
}

// GET endpoint to fetch pending suggestions for a country
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const countryId = searchParams.get("countryId");

  if (!countryId) {
    return NextResponse.json(
      { error: "countryId required" },
      { status: 400 }
    );
  }

  const { data: suggestions, error } = await supabaseAdmin
    .from("content_suggestions")
    .select("*")
    .eq("country_id", countryId)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ suggestions });
}
