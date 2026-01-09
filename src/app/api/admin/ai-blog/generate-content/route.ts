import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * POST /api/admin/ai-blog/generate-content
 * Generate full blog content for approved topics
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { topic_id } = body;

    if (!topic_id) {
      return NextResponse.json(
        { error: 'Topic ID is required' },
        { status: 400 }
      );
    }

    // Get topic details
    const { data: topic, error: topicError } = await supabase
      .from('ai_blog_topics')
      .select('*, ai_blog_plans(country_name, country_slug)')
      .eq('id', topic_id)
      .single();

    if (topicError || !topic) {
      return NextResponse.json(
        { error: 'Topic not found' },
        { status: 404 }
      );
    }

    if (topic.status !== 'approved') {
      return NextResponse.json(
        { error: 'Topic must be approved before generating content' },
        { status: 400 }
      );
    }

    // Update status to generating
    await supabase
      .from('ai_blog_topics')
      .update({ status: 'generating' })
      .eq('id', topic_id);

    const countryName = topic.ai_blog_plans.country_name;
    const countrySlug = topic.ai_blog_plans.country_slug;

    // Generate content using ChatGPT
    const prompt = `Sen profesyonel bir seyahat yazarısın. Türk gezginler için samimi, bilgilendirici içerikler yazıyorsun.

GÖREV: Aşağıdaki konu için tam blog içeriği yaz.

KONU: ${topic.title}
ÜLKE: ${countryName}
HEDEF KELİME: ${topic.target_word_count}
ANA SAYFA: https://www.kolayseyahat.net/${countrySlug}

İÇERİK KURALLARI (MUTLAKA UYULMALI):
1. 🎯 Samimi, dostça ton (AI gibi değil, insan gibi yaz)
2. 📝 Kişisel deneyim/hikaye ekle (engaging olsun)
3. 💡 Pratik, actionable bilgi ver
4. 🔗 Ana ülke sayfasına 2-3 doğal internal link
5. 📊 Liste, tablo, bullet point kullan
6. ✨ Emoji minimal kullan (sadece başlıklarda)
7. 🚫 "Yapay zeka", "AI", "otomatik" gibi kelimeler kullanma
8. 🚫 Çok resmi veya akademik dil kullanma

🚨 KRİTİK: KEYWORD STUFFING YASAK 🚨
- Anahtar kelimeleri DOĞAL kullan
- Keyword yoğunluğu MAX %2.5 olmalı
- Aynı kelimeyi art arda tekrar etme
- Zorla anahtar kelime sıkıştırma
- Her cümlede anahtar kelime kullanma

KÖTÜ ÖRNEK (Keyword Stuffing):
"${countryName} vizesi için ${countryName} vize başvurusu yapmalısınız. ${countryName} vizesi almak için ${countryName} vize ücretlerini öğrenin. ${countryName} vize süreci..."

İYİ ÖRNEK (Doğal):
"Vize başvurusu yapmadan önce, gerekli belgeleri hazırlamanızı öneririm. Süreç genellikle 2-3 hafta sürer. Başvuru ücretleri ve detaylı bilgi için rehberimize göz atabilirsiniz."

🎯 ANA SAYFA DEĞERİNİ ARTIR:
- Ana ülke sayfası = Otorite kaynak
- Blog = Ana sayfaya değer katan destek içerik
- Internal linkler = Ana sayfanın değerini artırmalı
- Blog, ana sayfanın rakibi DEĞİL, destekçisi olmalı
- Ana sayfaya kaliteli, ilgili trafik gönder

YAZI STİLİ:
✅ "Geçen yaz ${countryName}'a gittiğimde..."
✅ "Şahsen ben hep..."
✅ "Arkadaşlarımdan duyduğuma göre..."
✅ "Benim tavsiyem şu olur:"
❌ "Bu makalede incelenecektir..."
❌ "Araştırmalar göstermektedir ki..."
❌ "Sonuç olarak söylemek gerekirse..."

KOLAY SEYAHAT YÖNLENDIRME STRATEJİSİ:
✅ Vize başvuru süreçlerinde: "Profesyonel destek almak isterseniz, [Kolay Seyahat](https://www.kolayseyahat.net/${countrySlug}) üzerinden başvurunuzu kolayca yapabilirsiniz."
✅ Randevu/belgeler kısmında: "Tüm bu süreçleri tek başınıza yönetmek yerine, [uzman danışmanlarımızdan](https://www.kolayseyahat.net/${countrySlug}) destek alabilirsiniz."
✅ Sonuç bölümünde: "Vize başvurunuz için [buradan](https://www.kolayseyahat.net/${countrySlug}) hemen başlayabilirsiniz."
❌ Direkt satış cümlesi kullanma: "Hemen satın alın", "Şimdi sipariş verin"
❌ Çok sık link verme (max 3-4 link)

YAPI:
1. GİRİŞ (150-200 kelime)
   - Hook: Merak uyandırıcı soru/hikaye
   - Problem: Okuyucunun sorunu
   - Çözüm: Bu yazıda ne bulacak

2. ANA İÇERİK (H2 başlıklar)
   - Her bölüm pratik bilgi içermeli
   - Örnekler, fiyatlar, linkler ekle
   - Kişisel deneyim/anekdot paylaş

3. SONUÇ (100-150 kelime)
   - Özet: Ana noktalar
   - Güçlü CTA: "Vize başvurunuzu profesyonel destekle yapmak isterseniz..."
   - Kolay Seyahat avantajları: Hızlı, güvenli, uzman desteği
   - Internal link: Ana ülke sayfası (doğal akışta)
   - Son cümle: Teşvik edici ve yardımcı ton

İÇERİK TASLAĞ (Kullan):
${topic.outline ? topic.outline.map((item: string, i: number) => `${i + 1}. ${item}`).join('\n') : 'Kendi taslağını oluştur'}

INTERNAL LINK STRATEJISI:
- İlk link: İlk 300 kelimede, doğal akışta
- Vize süreç anlatımında: "Başvuru sürecini kolaylaştırmak için [${countryName} vize rehberimize](/${countrySlug}) göz atabilirsiniz."
- Belge/randevu kısmında: "Profesyonel destek almak isterseniz, [uzman ekibimiz](/${countrySlug}) size yardımcı olabilir."
- Sonuç bölümünde: "Vize başvurunuz için [buradan hemen başlayabilirsiniz](/${countrySlug})."
- Anchor text çeşitliliği kullan: "${countryName} vizesi", "vize başvuru süreci", "uzman danışmanlarımız", "profesyonel destek"

SEO:
- Hedef keyword ilk 100 kelimede geçmeli: ${topic.target_keywords?.[0] || topic.title}
- H2, H3 başlıklar kullan
- Meta title: "${topic.title} - Kolay Seyahat" (max 60 karakter)
- Meta description: 150-160 karakter, CTA içermeli

HTML FORMAT KURALLARI:
✅ KULLAN:
- <h1> Ana başlık için (sadece 1 tane)
- <h2> Alt başlıklar için (💰, 📋, ✈️ gibi emoji ekle)
- <h3> Alt-alt başlıklar için
- <p> Paragraflar için
- <strong> Vurgulu metinler için
- <em> İtalik metinler için
- <a href="url"> Linkler için
- <ul><li> Madde listeleri için
- <ol><li> Numaralı listeler için

❌ KULLANMA:
- Markdown syntax (##, **, *, [](url))
- Escape karakterler (\\n yerine gerçek HTML)
- Inline CSS veya style attribute

HTML ÖRNEK:
<h1>Benin Vizesi Nasıl Alınır?</h1>

<p>Benin vizesi almak için ihtiyacınız olan tüm bilgileri bu rehberde bulabilirsiniz. Başvuru süreci, gerekli belgeler ve daha fazlası!</p>

<h2>💰 Vize Ücretleri ve Ödeme Yöntemleri</h2>

<p>Benin vizesi ücretleri genellikle vize türüne göre değişiklik gösterir. İşte güncel ücretler:</p>

<ul>
<li><strong>Turistik Vize:</strong> Tatil ya da geziler için idealdir.</li>
<li><strong>İş Vizesi:</strong> İş amaçlı seyahat edenler için.</li>
</ul>

<p>Profesyonel destek almak isterseniz, <a href="/${countrySlug}">${countryName} vize başvurunuzu</a> kolayca yapabilirsiniz.</p>

PEXELS GÖRSEL:
- İçeriğe uygun görsel arama terimi öner (İngilizce)

ÇIKTI FORMATI (JSON):
{
  "content": "<h1>${topic.title}</h1>\\n\\n<p>[Tam içerik HTML formatında - <p>, <h2>, <h3>, <strong>, <em>, <a>, <ul>, <li> tag'leri kullan]</p>",
  "meta_title": "${topic.title} - Kolay Seyahat",
  "meta_description": "...",
  "internal_links": [
    {
      "url": "/${countrySlug}",
      "anchor": "${countryName} vizesi",
      "position": 250,
      "context": "Vize başvuru süreci hakkında detaylı bilgi"
    }
  ],
  "pexels_search_query": "turkey istanbul travel",
  "image_alt_text": "...",
  "word_count": ${topic.target_word_count},
  "readability_score": 75,
  "seo_score": 85
}

ÖNEMLI: Sadece JSON döndür, başka açıklama ekleme. İçerik samimi ve insan gibi olmalı.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'Sen profesyonel bir seyahat yazarısın. Samimi, insan gibi içerikler üretiyorsun. Sadece JSON formatında yanıt veriyorsun.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.9,
      max_tokens: 4000,
      response_format: { type: 'json_object' }
    });

    const responseText = completion.choices[0].message.content;
    if (!responseText) {
      throw new Error('No response from OpenAI');
    }

    const aiResponse = JSON.parse(responseText);

    // Search and download Pexels image
    let coverImageUrl = null;
    let pexelsData: { id: string; photographer: string; photographer_url: string } | null = null;

    if (aiResponse.pexels_search_query && process.env.PEXELS_API_KEY) {
      try {
        const pexelsResponse = await fetch(
          `https://api.pexels.com/v1/search?query=${encodeURIComponent(aiResponse.pexels_search_query)}&per_page=5&orientation=landscape`,
          {
            headers: {
              'Authorization': process.env.PEXELS_API_KEY
            }
          }
        );

        const pexelsResult = await pexelsResponse.json();

        if (pexelsResult.photos && pexelsResult.photos.length > 0) {
          // Select a random photo from results to avoid duplicates
          const randomIndex = Math.floor(Math.random() * Math.min(pexelsResult.photos.length, 5));
          const photo = pexelsResult.photos[randomIndex];
          
          // Download image
          const imageResponse = await fetch(photo.src.large2x);
          const imageBuffer = await imageResponse.arrayBuffer();

          // Upload to Supabase storage
          const fileName = `blog-covers/${topic.slug}-${Date.now()}.jpg`;
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('blog-images')
            .upload(fileName, imageBuffer, {
              contentType: 'image/jpeg',
              cacheControl: '31536000'
            });

          if (!uploadError && uploadData) {
            const { data: urlData } = supabase.storage
              .from('blog-images')
              .getPublicUrl(fileName);

            coverImageUrl = urlData.publicUrl;
            pexelsData = {
              id: photo.id,
              photographer: photo.photographer,
              photographer_url: photo.photographer_url
            };
          }
        }
      } catch (error) {
        console.error('Pexels image error:', error);
      }
    }

    // Generate meta title with proper format
    const metaTitle = aiResponse.meta_title || `${topic.title} - Kolay Seyahat`;
    const cleanMetaTitle = metaTitle.length > 60 
      ? metaTitle.substring(0, 57) + '...'
      : metaTitle;

    // Insert content into database
    // If topic is approved (auto-approve), content should also be approved for auto-scheduling
    const contentStatus = topic.status === 'approved' ? 'approved' : 'review';
    
    const { data: content, error: contentError } = await supabase
      .from('ai_blog_content')
      .insert({
        topic_id: topic.id,
        title: topic.title,
        title_en: topic.title_en,
        slug: topic.slug,
        content: aiResponse.content,
        description: topic.description,
        meta_title: cleanMetaTitle,
        meta_description: aiResponse.meta_description,
        target_keywords: topic.target_keywords,
        cover_image_url: coverImageUrl,
        cover_image_alt: aiResponse.image_alt_text,
        pexels_image_id: pexelsData?.id,
        pexels_photographer: pexelsData?.photographer,
        pexels_photographer_url: pexelsData?.photographer_url,
        internal_links: aiResponse.internal_links || [],
        word_count: aiResponse.word_count || 0,
        readability_score: aiResponse.readability_score || 0,
        seo_score: aiResponse.seo_score || 0,
        ai_model: 'gpt-4o',
        generation_prompt: prompt,
        generation_tokens: completion.usage?.total_tokens || 0,
        status: contentStatus
      })
      .select()
      .single();

    if (contentError) {
      console.error('Content insertion error:', contentError);
      throw new Error('Failed to insert content');
    }

    // Update topic status
    await supabase
      .from('ai_blog_topics')
      .update({ 
        content_generated: true,
        generated_at: new Date().toISOString()
      })
      .eq('id', topic_id);

    // If content is approved and plan has auto_schedule enabled, trigger scheduling
    if (contentStatus === 'approved') {
      // Get plan details to check if auto_schedule is enabled
      const { data: planData } = await supabase
        .from('ai_blog_plans')
        .select('id, auto_schedule, start_publish_date, publish_frequency')
        .eq('id', topic.plan_id)
        .single();

      if (planData?.auto_schedule && planData.start_publish_date) {
        console.log(`Content ${content.id} is approved, will be auto-scheduled`);
        // Note: Actual scheduling happens via schedule-plan API after all content is generated
      }
    }

    return NextResponse.json({
      success: true,
      content_id: content.id,
      topic_id: topic.id,
      title: content.title,
      word_count: content.word_count,
      has_cover_image: !!coverImageUrl,
      status: contentStatus
    });

  } catch (error: any) {
    console.error('Content generation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate content' },
      { status: 500 }
    );
  }
}
