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
 * POST /api/admin/ai-blog/refine-content
 * Refine existing content with custom AI instructions
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { content_id, current_content, instructions } = body;

    if (!content_id || !current_content || !instructions) {
      return NextResponse.json(
        { error: 'Content ID, current content, and instructions are required' },
        { status: 400 }
      );
    }

    // Get content metadata
    const { data: content, error: contentError } = await supabase
      .from('ai_blog_content')
      .select('*, ai_blog_topics(*, ai_blog_plans(country_name, country_slug))')
      .eq('id', content_id)
      .single();

    if (contentError || !content) {
      return NextResponse.json(
        { error: 'Content not found' },
        { status: 404 }
      );
    }

    const topic = content.ai_blog_topics;
    const plan = topic.ai_blog_plans;
    const countryName = plan.country_name;
    const countrySlug = plan.country_slug;

    // Create refinement prompt
    const prompt = `Sen profesyonel bir içerik editörüsün. Mevcut blog içeriğini kullanıcının talimatlarına göre iyileştir.

MEVCUT İÇERİK:
${current_content}

KULLANICI TALİMATLARI:
${instructions}

ÜLKE: ${countryName}
ANA SAYFA: https://www.kolayseyahat.net/${countrySlug}

KALİTE KURALLARI (MUTLAKA UYULMALI):
1. 🚫 KEYWORD STUFFING YASAK
   - Anahtar kelimeleri doğal kullan
   - Keyword yoğunluğu max %2.5 olmalı
   - Zorla tekrar etme

2. 🔗 ANA SAYFA DEĞERİ
   - Ana ülke sayfasına 2-3 doğal link
   - Linkler değer katmalı, spam olmamalı
   - Anchor text çeşitliliği kullan

3. ✍️ İNSAN GİBİ YAZ
   - Samimi, dostça ton
   - Kişisel deneyim/hikaye ekle
   - "AI", "yapay zeka" kelimelerini kullanma

4. 💎 DEĞER KAT
   - Pratik, actionable bilgi ver
   - Gerçek örnekler, fiyatlar ekle
   - Okuyucuya yardımcı ol

5. 🎯 KOLAY SEYAHAT YÖNLENDIRME
   - Doğal CTA kullan
   - Profesyonel destek öner
   - Satış baskısı yapma

İYİLEŞTİRME ÖRNEKLERİ:

❌ KÖTÜ (Keyword Stuffing):
"${countryName} vizesi için ${countryName} vize başvurusu yapmalısınız. ${countryName} vizesi almak için ${countryName} vize ücretlerini öğrenin."

✅ İYİ (Doğal):
"Vize başvurusu yapmadan önce, gerekli belgeleri hazırlamanızı öneririm. Başvuru sürecini kolaylaştırmak için [${countryName} vize rehberimize](/${countrySlug}) göz atabilirsiniz."

❌ KÖTÜ (Spam Link):
"Buraya tıklayın. Hemen başvurun. Şimdi satın alın."

✅ İYİ (Değer Katıcı):
"Tüm bu süreçleri tek başınıza yönetmek yerine, profesyonel destek almak isterseniz [uzman danışmanlarımız](/${countrySlug}) size yardımcı olabilir."

ÇIKTI:
Sadece iyileştirilmiş içeriği döndür. Başka açıklama ekleme. Markdown formatında yaz.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'Sen profesyonel bir içerik editörüsün. Kaliteli, doğal, SEO-friendly içerikler üretiyorsun. Keyword stuffing yapmıyorsun.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 4000
    });

    const refinedContent = completion.choices[0].message.content;
    if (!refinedContent) {
      throw new Error('No response from OpenAI');
    }

    // Calculate keyword density to check quality
    const wordCount = refinedContent.split(/\s+/).length;
    const keywordCount = content.target_keywords.reduce((count: number, keyword: string) => {
      const regex = new RegExp(keyword, 'gi');
      return count + (refinedContent.match(regex) || []).length;
    }, 0);
    const keywordDensity = (keywordCount / wordCount) * 100;

    // Warn if keyword density is too high
    let warning = null;
    if (keywordDensity > 2.5) {
      warning = `⚠️ Keyword yoğunluğu yüksek (${keywordDensity.toFixed(2)}%). Daha doğal bir dil kullanmayı deneyin.`;
    }

    return NextResponse.json({
      success: true,
      refined_content: refinedContent,
      metrics: {
        word_count: wordCount,
        keyword_density: keywordDensity.toFixed(2),
        tokens_used: completion.usage?.total_tokens
      },
      warning
    });

  } catch (error: any) {
    console.error('Content refinement error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to refine content' },
      { status: 500 }
    );
  }
}
