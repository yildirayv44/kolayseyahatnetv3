import { NextRequest, NextResponse } from "next/server";
import { openai } from "@/lib/openai";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const SEO_ANALYSIS_PROMPT = `Sen deneyimli bir SEO ve içerik stratejisti olarak görev yapacaksın. Aşağıda bir vize danışmanlık sitesinin ülke sayfası içerik yapısını paylaşıyorum. Bu yapıyı şu kriterlere göre kapsamlı analiz et:

## ANALİZ KRİTERLERİ

### 1. İÇERİK YETERLİLİĞİ ANALİZİ
- Her bölüm kullanıcının o konudaki tüm sorularını cevaplayabiliyor mu?
- Eksik kalan kritik bilgiler var mı?
- İçerik derinliği rakip otoriter sitelerle karşılaştırıldığında yeterli mi?
- Thin content (ince içerik) riski taşıyan bölümler var mı?

### 2. İÇERİK ÇEŞİTLİLİĞİ ANALİZİ
- Farklı kullanıcı niyetlerini (informational, transactional, navigational) karşılıyor mu?
- Görsel içerik (infografik, tablo, video) ihtiyacı var mı?
- Farklı formatlarda içerik sunuluyor mu (liste, paragraf, adım adım rehber)?

### 3. KULLANICI DENEYİMİ VE SAYFA TUTMA ANALİZİ
- Kullanıcıyı sayfada tutacak engagement elementleri yeterli mi?
- İçerik akışı mantıklı mı? Kullanıcı journey'si optimize mi?
- Bounce rate'i düşürecek internal linking fırsatları var mı?
- Dwell time'ı artıracak interaktif elementler önerebilir misin?

### 4. E-E-A-T (Experience, Expertise, Authoritativeness, Trustworthiness) ANALİZİ
- Uzmanlık ve deneyim nasıl gösterilebilir?
- Güvenilirlik sinyalleri yeterli mi?
- Otorite oluşturmak için eksik olan içerik türleri neler?
- YMYL (Your Money Your Life) kategorisinde güven nasıl artırılır?

### 5. SEMANTİK SEO VE TOPICAL AUTHORITY ANALİZİ
- Ana konu etrafında hangi alt konular eksik?
- Topic cluster yapısı için öneriler
- LSI (Latent Semantic Indexing) keyword fırsatları
- Featured snippet kazanma potansiyeli olan içerik formatları

### 6. RAKİP KARŞILAŞTIRMASI PERSPEKTİFİ
- Sektördeki otoriter siteler hangi içerikleri sunuyor?
- Rakiplerde olup bizde olmayan içerik türleri neler?
- Farklılaşma fırsatları nerede?

## ÇIKTI FORMATI (JSON)

Analizini aşağıdaki JSON formatında sun:

{
  "overallScore": 0-100 arası puan,
  "summary": "Genel değerlendirme özeti (2-3 cümle)",
  "strengths": ["Güçlü yön 1", "Güçlü yön 2", ...],
  "missingContent": [
    {
      "title": "Eksik içerik başlığı",
      "description": "Neden önemli",
      "priority": "high/medium/low",
      "impact": "Beklenen SEO etkisi"
    }
  ],
  "improvements": [
    {
      "section": "Bölüm adı",
      "current": "Mevcut durum",
      "suggestion": "Öneri",
      "priority": "high/medium/low"
    }
  ],
  "engagementSuggestions": [
    {
      "element": "Element adı",
      "description": "Açıklama",
      "expectedImpact": "Beklenen etki"
    }
  ],
  "eeatRecommendations": [
    {
      "aspect": "E-E-A-T boyutu",
      "recommendation": "Öneri",
      "implementation": "Nasıl uygulanır"
    }
  ],
  "technicalSEO": [
    {
      "item": "Teknik SEO öğesi",
      "status": "good/warning/missing",
      "recommendation": "Öneri"
    }
  ],
  "actionPlan": [
    {
      "rank": 1,
      "action": "Aksiyon",
      "effort": "low/medium/high",
      "impact": "low/medium/high",
      "timeline": "Süre tahmini"
    }
  ],
  "contentScores": {
    "sufficiency": 0-100,
    "diversity": 0-100,
    "engagement": 0-100,
    "eeat": 0-100,
    "semanticSEO": 0-100
  }
}

Sadece JSON döndür, başka açıklama ekleme.`;

export async function POST(request: NextRequest) {
  try {
    const { countryId } = await request.json();

    if (!countryId) {
      return NextResponse.json(
        { success: false, error: "Country ID gerekli" },
        { status: 400 }
      );
    }

    // Fetch country data with all content fields
    const { data: country, error: countryError } = await supabase
      .from("countries")
      .select("*")
      .eq("id", countryId)
      .single();

    if (countryError || !country) {
      return NextResponse.json(
        { success: false, error: "Ülke bulunamadı" },
        { status: 404 }
      );
    }

    // Fetch visa requirements
    let visaRequirement = null;
    if (country.country_code) {
      const { data: visaReq } = await supabase
        .from("visa_requirements")
        .select("*")
        .eq("country_code", country.country_code)
        .limit(1)
        .single();
      visaRequirement = visaReq;
    }

    // Fetch FAQs via question_to_countries relation table
    const { data: questionRelations } = await supabase
      .from("question_to_countries")
      .select("question_id")
      .eq("country_id", countryId);
    
    let faqs: any[] = [];
    if (questionRelations && questionRelations.length > 0) {
      const questionIds = questionRelations.map((r: { question_id: number }) => r.question_id);
      const { data: questionData } = await supabase
        .from("questions")
        .select("question, answer")
        .in("id", questionIds)
        .eq("status", 1)
        .limit(20);
      faqs = questionData || [];
    }

    // Fetch comments count
    const { count: commentsCount } = await supabase
      .from("comments")
      .select("*", { count: "exact", head: true })
      .eq("country_id", countryId)
      .eq("status", 1);

    // Fetch related blogs via country_to_blogs relation table
    const { data: blogRelations } = await supabase
      .from("country_to_blogs")
      .select("blog_id")
      .eq("country_id", countryId);
    
    let blogs: any[] = [];
    if (blogRelations && blogRelations.length > 0) {
      const blogIds = blogRelations.map((r: { blog_id: number }) => r.blog_id);
      const { data: blogData } = await supabase
        .from("blogs")
        .select("title, slug")
        .in("id", blogIds)
        .eq("status", 1)
        .limit(5);
      blogs = blogData || [];
    }

    // Fetch country menus (sub-pages) via country_to_menus relation table
    const { data: menuRelations } = await supabase
      .from("country_to_menus")
      .select("country_menu_id")
      .eq("country_id", countryId);
    
    let menus: any[] = [];
    if (menuRelations && menuRelations.length > 0) {
      const menuIds = menuRelations.map((r: { country_menu_id: number }) => r.country_menu_id);
      const { data: menuData } = await supabase
        .from("country_menus")
        .select("name, slug, parent_id")
        .in("id", menuIds)
        .eq("status", 1);
      menus = menuData || [];
    }

    // Prepare content summary for analysis
    const contentSummary = {
      countryName: country.name,
      title: country.title || "Yok",
      description: country.description ? `${country.description.substring(0, 500)}...` : "Yok",
      
      // Hero section data
      visaStatus: visaRequirement?.visa_status || "Belirtilmemiş",
      allowedStay: visaRequirement?.allowed_stay || "Belirtilmemiş",
      applicationMethod: visaRequirement?.application_method || "Belirtilmemiş",
      processTime: country.process_time || "Belirtilmemiş",
      
      // Country info
      capital: country.capital || "Yok",
      currency: country.currency || "Yok",
      language: country.language || "Yok",
      timezone: country.timezone || "Yok",
      
      // Content sections
      popularCities: country.popular_cities?.length || 0,
      bestTimeToVisit: country.best_time_to_visit ? "Var" : "Yok",
      travelTips: country.travel_tips?.length || 0,
      applicationSteps: country.application_steps?.length || 0,
      requiredDocuments: country.required_documents?.length || 0,
      importantNotes: country.important_notes?.length || 0,
      healthRequirements: country.health_requirements ? "Var" : "Yok",
      customsRegulations: country.customs_regulations ? "Var" : "Yok",
      emergencyContacts: country.emergency_contacts ? "Var" : "Yok",
      whyKolaySeyahat: country.why_kolay_seyahat ? "Var" : "Yok",
      
      // Additional content
      faqCount: faqs?.length || 0,
      faqSamples: faqs?.slice(0, 3).map(f => f.question) || [],
      commentsCount: commentsCount || 0,
      relatedBlogs: blogs?.length || 0,
      subPages: menus?.length || 0,
      subPageNames: menus?.map(m => m.name) || [],
      
      // English content availability
      hasEnglishTitle: !!country.title_en,
      hasEnglishDescription: !!country.description_en,
      hasEnglishTravelTips: country.travel_tips_en?.length > 0,
      hasEnglishApplicationSteps: country.application_steps_en?.length > 0,
    };

    const userMessage = `
## ÜLKE: ${country.name}

## MEVCUT İÇERİK DURUMU:

### Hero Section:
- Vize Durumu: ${contentSummary.visaStatus}
- Kalış Süresi: ${contentSummary.allowedStay}
- Başvuru Yöntemi: ${contentSummary.applicationMethod}
- İşlem Süresi: ${contentSummary.processTime}

### Ülke Bilgileri:
- Başkent: ${contentSummary.capital}
- Para Birimi: ${contentSummary.currency}
- Dil: ${contentSummary.language}
- Saat Dilimi: ${contentSummary.timezone}

### İçerik Bölümleri:
- Popüler Şehirler: ${contentSummary.popularCities} adet
- En İyi Ziyaret Zamanı: ${contentSummary.bestTimeToVisit}
- Seyahat İpuçları: ${contentSummary.travelTips} adet
- Başvuru Adımları: ${contentSummary.applicationSteps} adet
- Gerekli Belgeler: ${contentSummary.requiredDocuments} adet
- Önemli Notlar: ${contentSummary.importantNotes} adet
- Sağlık Gereksinimleri: ${contentSummary.healthRequirements}
- Gümrük Kuralları: ${contentSummary.customsRegulations}
- Acil Durum İletişim: ${contentSummary.emergencyContacts}
- Neden Kolay Seyahat: ${contentSummary.whyKolaySeyahat}

### Ek İçerikler:
- SSS (FAQ): ${contentSummary.faqCount} soru
- Örnek Sorular: ${contentSummary.faqSamples.join(", ") || "Yok"}
- Kullanıcı Yorumları: ${contentSummary.commentsCount} yorum
- İlgili Blog Yazıları: ${contentSummary.relatedBlogs} yazı
- Alt Sayfalar: ${contentSummary.subPages} sayfa (${contentSummary.subPageNames.join(", ") || "Yok"})

### Çoklu Dil Desteği:
- İngilizce Başlık: ${contentSummary.hasEnglishTitle ? "Var" : "Yok"}
- İngilizce Açıklama: ${contentSummary.hasEnglishDescription ? "Var" : "Yok"}
- İngilizce Seyahat İpuçları: ${contentSummary.hasEnglishTravelTips ? "Var" : "Yok"}
- İngilizce Başvuru Adımları: ${contentSummary.hasEnglishApplicationSteps ? "Var" : "Yok"}

### Sayfa Açıklaması:
${contentSummary.description}

Bu içeriği analiz et ve JSON formatında sonuç döndür.`;

    // Call OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: SEO_ANALYSIS_PROMPT,
        },
        {
          role: "user",
          content: userMessage,
        },
      ],
      temperature: 0.7,
      max_tokens: 4000,
      response_format: { type: "json_object" },
    });

    const analysisText = completion.choices[0].message.content || "{}";
    
    let analysis;
    try {
      analysis = JSON.parse(analysisText);
    } catch (parseError) {
      console.error("JSON parse error:", parseError);
      return NextResponse.json(
        { success: false, error: "Analiz sonucu işlenemedi" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      country: {
        id: country.id,
        name: country.name,
        slug: country.slug,
      },
      contentSummary,
      analysis,
    });
  } catch (error) {
    console.error("SEO Content Analysis Error:", error);
    return NextResponse.json(
      { success: false, error: "Analiz sırasında bir hata oluştu" },
      { status: 500 }
    );
  }
}

// GET endpoint to fetch countries list
export async function GET() {
  try {
    const { data: countries, error } = await supabase
      .from("countries")
      .select("id, name, slug, country_code, status")
      .eq("status", 1)
      .order("name", { ascending: true });

    if (error) {
      return NextResponse.json(
        { success: false, error: "Ülkeler yüklenemedi" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      countries,
    });
  } catch (error) {
    console.error("Countries fetch error:", error);
    return NextResponse.json(
      { success: false, error: "Bir hata oluştu" },
      { status: 500 }
    );
  }
}
