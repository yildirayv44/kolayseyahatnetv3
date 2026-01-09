import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * POST /api/admin/ai-blog/create-plan
 * Create AI blog content plan and generate topics
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    const body = await request.json();
    const { country_id, month, year, topic_count = 30 } = body;

    if (!country_id || !month || !year) {
      return NextResponse.json(
        { error: 'Country ID, month, and year are required' },
        { status: 400 }
      );
    }

    // Get country details
    const { data: country, error: countryError } = await supabase
      .from('countries')
      .select('id, name, slug, country_code')
      .eq('id', country_id)
      .single();

    if (countryError || !country) {
      return NextResponse.json(
        { error: 'Country not found' },
        { status: 404 }
      );
    }

    // Create plan (allow multiple plans for same country/period)
    const { data: plan, error: planError } = await supabase
      .from('ai_blog_plans')
      .insert({
        country_id: country.id,
        country_name: country.name,
        country_slug: country.slug,
        month,
        year,
        total_topics: topic_count,
        status: 'planning',
        data_sources: {
          google_search_console: false,
          google_trends: false,
          manual: true
        }
      })
      .select()
      .single();

    if (planError || !plan) {
      console.error('Plan creation error:', planError);
      return NextResponse.json(
        { error: 'Failed to create plan' },
        { status: 500 }
      );
    }

    // Generate topics using ChatGPT
    const prompt = `Sen bir SEO uzmanı ve seyahat içerik stratejistisin. Türk gezginler için blog konuları öneriyorsun.

GÖREV: ${country.name} için ${topic_count} blog konu başlığı oluştur.

BAĞLAM:
- Ana sayfa: https://www.kolayseyahat.net/${country.slug}
- Hedef kitle: Türk gezginler, vize başvurusu yapacak kişiler
- Dönem: ${month}/${year}
- Amaç: Ana ülke sayfasına organik trafik çekmek, internal linking

BAŞLIK KRİTERLERİ:
1. ✅ Aranabilir (gerçek arama sorguları)
2. ✅ Merak uyandırıcı (clickbait değil, engaging)
3. ✅ Spesifik ve net (belirsiz değil)
4. ✅ Sayı/yıl içerebilir ("10 İpucu", "${year} Rehberi")
5. ✅ Pratik değer vaat etmeli

BAŞLIK ÖRNEKLERİ:
✅ "New York'ta 3 Gün: Günlük 100 Dolara Gezi Planı"
✅ "Amerika Vize Mülakat Soruları: ${year} Güncel Liste"
✅ "Los Angeles'ta Nerede Kalınır? Mahalle Mahalle Rehber"
❌ "${country.name} Hakkında Bilmeniz Gerekenler" (çok genel)
❌ "${country.name} Gezisi İpuçları" (belirsiz)

KONU DAĞILIMI (${topic_count} konu):
- Vize & Prosedürler (30%): Başvuru, mülakat, belgeler, ücretler, red nedenleri
- Seyahat Planlama (35%): Şehir rehberleri, gezi rotaları, konaklama, ulaşım
- Pratik Bilgiler (20%): Para, internet, güvenlik, sağlık, alışveriş
- Kültür & Yaşam (10%): Yemek, gelenek, görgü kuralları
- Karşılaştırma & Listicle (5%): Top 10, karşılaştırmalar

ÇIKTI FORMATI (JSON Object):
{
  "topics": [
    {
      "title": "New York'ta 3 Gün: Günlük 100 Dolara Gezi Planı",
      "title_en": "3 Days in New York: $100 Daily Budget Plan",
      "slug": "new-york-3-gun-100-dolar-gezi-plani",
      "description": "New York'ta bütçe dostu 3 günlük gezi planı, ücretsiz aktiviteler ve tasarruf ipuçları",
      "category": "travel_planning",
      "search_intent": "informational",
      "target_keywords": ["new york gezilecek yerler", "new york bütçe gezi", "new york 3 gün"],
      "estimated_search_volume": 2400,
      "keyword_difficulty": 35,
      "content_angle": "practical_budget_guide",
      "target_word_count": 1800,
      "priority": 8,
      "outline": [
        "Giriş: New York'ta Bütçe Dostu Gezi Mümkün mü?",
        "1. Gün: Manhattan'ın Ücretsiz Cazibe Merkezleri",
        "2. Gün: Brooklyn ve Queens Keşfi",
        "3. Gün: Müzeler ve Son Alışveriş",
        "Bütçe Özeti: Nereye Ne Kadar Harcadık?",
        "Bonus İpuçları: Daha Fazla Tasarruf İçin"
      ],
      "internal_link_opportunities": [
        {"anchor": "${country.name} vizesi", "context": "Gezi öncesi vize başvurusu"},
        {"anchor": "${country.name} vize ücretleri", "context": "Toplam seyahat bütçesi"}
      ],
      "data_source": "ai_generated",
      "reasoning": "Popüler şehir, pratik bilgi, bütçe odaklı içerik"
    }
  ]
}

ÖNEMLI: Sadece JSON object döndür, başka açıklama ekleme. topics array'inde ${topic_count} adet konu oluştur.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are an expert SEO content strategist. Always respond with valid JSON.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.8,
      max_tokens: 8000,
      response_format: { type: 'json_object' }
    });

    const responseText = completion.choices[0].message.content;
    if (!responseText) {
      throw new Error('No response from OpenAI');
    }

    console.log('AI Response length:', responseText.length);
    console.log('AI Response preview:', responseText.substring(0, 200));

    let aiResponse;
    try {
      aiResponse = JSON.parse(responseText);
    } catch (parseError) {
      console.error('JSON Parse Error:', parseError);
      console.error('Response text (first 1000 chars):', responseText.substring(0, 1000));
      console.error('Response text (last 500 chars):', responseText.substring(responseText.length - 500));
      
      // Try to extract topics array even if JSON is incomplete
      const topicsMatch = responseText.match(/"topics"\s*:\s*\[([\s\S]*)\]/);
      if (topicsMatch) {
        try {
          const partialJson = `{"topics":[${topicsMatch[1]}]}`;
          aiResponse = JSON.parse(partialJson);
          console.log('Recovered partial JSON with', aiResponse.topics?.length, 'topics');
        } catch (recoveryError) {
          return NextResponse.json(
            { 
              error: 'Invalid JSON from AI',
              details: 'AI response could not be parsed as JSON',
              preview: responseText.substring(0, 500)
            },
            { status: 500 }
          );
        }
      } else {
        return NextResponse.json(
          { 
            error: 'Invalid JSON from AI',
            details: 'Could not find topics array in response'
          },
          { status: 500 }
        );
      }
    }

    const topics = aiResponse.topics || [];

    if (!Array.isArray(topics) || topics.length === 0) {
      console.error('Invalid topics array:', topics);
      return NextResponse.json(
        { 
          error: 'Invalid topics format from AI',
          details: 'Expected topics array but got: ' + typeof topics,
          topicsCount: Array.isArray(topics) ? topics.length : 0
        },
        { status: 500 }
      );
    }

    console.log('Successfully parsed', topics.length, 'topics');

    // Helper function to safely parse numbers
    const safeNumber = (value: any, defaultValue: number): number => {
      if (value === null || value === undefined || value === '') {
        return defaultValue;
      }
      const parsed = typeof value === 'number' ? value : parseInt(String(value), 10);
      return isNaN(parsed) || !isFinite(parsed) ? defaultValue : parsed;
    };

    // Insert topics into database
    const topicsToInsert = topics.map((topic: any) => ({
      plan_id: plan.id,
      country_id: country.id,
      title: topic.title || 'Untitled',
      title_en: topic.title_en || '',
      slug: topic.slug || '',
      description: topic.description || '',
      category: topic.category || 'travel_planning',
      search_intent: topic.search_intent || 'informational',
      target_keywords: Array.isArray(topic.target_keywords) ? topic.target_keywords : [],
      estimated_search_volume: safeNumber(topic.estimated_search_volume, 0),
      keyword_difficulty: safeNumber(topic.keyword_difficulty, 0),
      content_angle: topic.content_angle || '',
      target_word_count: safeNumber(topic.target_word_count, 1500),
      outline: Array.isArray(topic.outline) ? topic.outline : [],
      internal_link_opportunities: Array.isArray(topic.internal_link_opportunities) ? topic.internal_link_opportunities : [],
      priority: safeNumber(topic.priority, 5),
      status: 'pending',
      data_source: topic.data_source || 'ai_generated',
      search_metrics: {
        estimated_search_volume: safeNumber(topic.estimated_search_volume, 0),
        keyword_difficulty: safeNumber(topic.keyword_difficulty, 0)
      },
      reasoning: topic.reasoning || ''
    }));

    const { data: insertedTopics, error: topicsError } = await supabase
      .from('ai_blog_topics')
      .insert(topicsToInsert)
      .select();

    if (topicsError) {
      console.error('Topics insertion error:', topicsError);
      console.error('Topics to insert:', JSON.stringify(topicsToInsert, null, 2));
      return NextResponse.json(
        { 
          error: 'Failed to insert topics',
          details: topicsError.message,
          hint: topicsError.hint,
          code: topicsError.code
        },
        { status: 500 }
      );
    }

    // Update plan status
    await supabase
      .from('ai_blog_plans')
      .update({ 
        status: 'review',
        generated_topics: topics.length 
      })
      .eq('id', plan.id);

    return NextResponse.json({
      success: true,
      plan_id: plan.id,
      country: country.name,
      topics_generated: topics.length,
      message: 'Plan created successfully. Topics are ready for review.',
      data: {
        plan,
        topics: insertedTopics
      }
    });

  } catch (error: any) {
    console.error('AI blog plan creation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create plan' },
      { status: 500 }
    );
  }
}
