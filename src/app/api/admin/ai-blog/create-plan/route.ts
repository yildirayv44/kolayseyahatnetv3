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

    // Check if plan already exists
    const { data: existingPlan } = await supabase
      .from('ai_blog_plans')
      .select('id, status')
      .eq('country_id', country_id)
      .eq('month', month)
      .eq('year', year)
      .single();

    if (existingPlan) {
      return NextResponse.json(
        { error: 'Plan already exists for this country and period', plan_id: existingPlan.id },
        { status: 409 }
      );
    }

    // Create plan
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

HER KONU İÇİN ÇIKTI (JSON Array):
[
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

ÖNEMLI: Sadece JSON array döndür, başka açıklama ekleme. ${topic_count} adet konu oluştur.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'Sen bir SEO uzmanı ve seyahat içerik stratejistisin. Sadece JSON formatında yanıt veriyorsun.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.8,
      max_tokens: 4000,
      response_format: { type: 'json_object' }
    });

    const responseText = completion.choices[0].message.content;
    if (!responseText) {
      throw new Error('No response from OpenAI');
    }

    const aiResponse = JSON.parse(responseText);
    const topics = aiResponse.topics || [];

    if (!Array.isArray(topics) || topics.length === 0) {
      throw new Error('Invalid topics format from AI');
    }

    // Insert topics into database
    const topicsToInsert = topics.map((topic: any) => ({
      plan_id: plan.id,
      country_id: country.id,
      title: topic.title,
      title_en: topic.title_en,
      slug: topic.slug,
      description: topic.description,
      category: topic.category,
      search_intent: topic.search_intent,
      target_keywords: topic.target_keywords,
      estimated_search_volume: topic.estimated_search_volume || 0,
      keyword_difficulty: topic.keyword_difficulty || 0,
      content_angle: topic.content_angle,
      target_word_count: topic.target_word_count || 1500,
      outline: topic.outline || [],
      internal_link_opportunities: topic.internal_link_opportunities || [],
      priority: topic.priority || 5,
      status: 'pending',
      data_source: topic.data_source || 'ai_generated',
      search_metrics: {
        estimated_search_volume: topic.estimated_search_volume,
        keyword_difficulty: topic.keyword_difficulty
      },
      reasoning: topic.reasoning
    }));

    const { data: insertedTopics, error: topicsError } = await supabase
      .from('ai_blog_topics')
      .insert(topicsToInsert)
      .select();

    if (topicsError) {
      console.error('Topics insertion error:', topicsError);
      throw new Error('Failed to insert topics');
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
