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

İÇERİK KURALLARI:
1. 🎯 Samimi, dostça ton (AI gibi değil, insan gibi yaz)
2. 📝 Kişisel deneyim/hikaye ekle (engaging olsun)
3. 💡 Pratik, actionable bilgi ver
4. 🔗 Ana ülke sayfasına 2-3 doğal internal link
5. 📊 Liste, tablo, bullet point kullan
6. ✨ Emoji minimal kullan (sadece başlıklarda)
7. 🚫 "Yapay zeka", "AI", "otomatik" gibi kelimeler kullanma
8. 🚫 Çok resmi veya akademik dil kullanma

YAZI STİLİ:
✅ "Geçen yaz ${countryName}'a gittiğimde..."
✅ "Şahsen ben hep..."
✅ "Arkadaşlarımdan duyduğuma göre..."
✅ "Benim tavsiyem şu olur:"
❌ "Bu makalede incelenecektir..."
❌ "Araştırmalar göstermektedir ki..."
❌ "Sonuç olarak söylemek gerekirse..."

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
   - CTA: "${countryName} vizesi için başvuru yapın"
   - Internal link: Ana ülke sayfası

İÇERİK TASLAĞ (Kullan):
${topic.outline ? topic.outline.map((item: string, i: number) => `${i + 1}. ${item}`).join('\n') : 'Kendi taslağını oluştur'}

INTERNAL LINK STRATEJISI:
- İlk link: İlk 300 kelimede
- Doğal akış: "Daha fazla bilgi için ${countryName} vize rehberimize göz atabilirsiniz"
- Anchor text çeşitliliği: "${countryName} vizesi", "vize başvuru süreci", "vize ücretleri"

SEO:
- Hedef keyword ilk 100 kelimede geçmeli: ${topic.target_keywords?.[0] || topic.title}
- H2, H3 başlıklar kullan
- Meta title: "${topic.title} - Kolay Seyahat" (max 60 karakter)
- Meta description: 150-160 karakter, CTA içermeli

PEXELS GÖRSEL:
- İçeriğe uygun görsel arama terimi öner (İngilizce)

ÇIKTI FORMATI (JSON):
{
  "content": "# ${topic.title}\\n\\n[Tam içerik markdown formatında]",
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
          const photo = pexelsResult.photos[0];
          
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
        status: 'review'
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
      .update({ status: 'review' })
      .eq('id', topic_id);

    return NextResponse.json({
      success: true,
      content_id: content.id,
      topic_id: topic.id,
      message: 'Content generated successfully. Ready for review.',
      data: {
        content,
        has_image: !!coverImageUrl,
        word_count: aiResponse.word_count,
        tokens_used: completion.usage?.total_tokens
      }
    });

  } catch (error: any) {
    console.error('Content generation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate content' },
      { status: 500 }
    );
  }
}
