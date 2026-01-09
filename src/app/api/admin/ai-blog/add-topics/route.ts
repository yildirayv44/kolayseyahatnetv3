import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

/**
 * POST /api/admin/ai-blog/add-topics
 * Add new topics to an existing plan
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { plan_id, topic_count = 5 } = body;

    if (!plan_id) {
      return NextResponse.json(
        { error: 'Plan ID is required' },
        { status: 400 }
      );
    }

    // Get plan details
    const { data: plan, error: planError } = await supabase
      .from('ai_blog_plans')
      .select('*')
      .eq('id', plan_id)
      .single();

    if (planError || !plan) {
      return NextResponse.json(
        { error: 'Plan not found' },
        { status: 404 }
      );
    }

    // Get country details
    const { data: country, error: countryError } = await supabase
      .from('countries')
      .select('id, name, slug, country_code')
      .eq('id', plan.country_id)
      .single();

    if (countryError || !country) {
      return NextResponse.json(
        { error: 'Country not found' },
        { status: 404 }
      );
    }

    // Get existing topics to avoid duplicates
    const { data: existingTopics } = await supabase
      .from('ai_blog_topics')
      .select('title, slug')
      .eq('plan_id', plan_id);

    const existingTitles = existingTopics?.map(t => t.title) || [];
    const existingSlugs = existingTopics?.map(t => t.slug) || [];

    // Generate new topics using ChatGPT
    const prompt = `Sen bir SEO uzmanı ve seyahat içerik stratejistisin. Türk gezginler için blog konuları öneriyorsun.

GÖREV: ${country.name} için ${topic_count} YENİ blog konu başlığı oluştur.

BAĞLAM:
- Ana sayfa: https://www.kolayseyahat.net/${country.slug}
- Hedef kitle: Türk gezginler, vize başvurusu yapacak kişiler
- Dönem: ${plan.month}/${plan.year}
- Amaç: Ana ülke sayfasına organik trafik çekmek

ÖNEMLİ: Aşağıdaki başlıkları KULLANMA (zaten var):
${existingTitles.slice(0, 10).map(t => `- ${t}`).join('\n')}

BAŞLIK KRİTERLERİ:
1. ✅ Aranabilir (gerçek arama sorguları)
2. ✅ Merak uyandırıcı
3. ✅ Spesifik ve net
4. ✅ Pratik değer vaat etmeli
5. ✅ Mevcut başlıklardan FARKLI olmalı

KONU DAĞILIMI:
- Vize & Prosedürler (30%): Başvuru, mülakat, belgeler
- Seyahat Planlama (35%): Şehir rehberleri, rotalar
- Pratik Bilgiler (20%): Para, internet, güvenlik
- Kültür & Yaşam (10%): Yemek, gelenek
- Karşılaştırma (5%): Top 10, karşılaştırmalar

HER KONU İÇİN ÇIKTI (JSON Object with topics array):
{
  "topics": [
    {
      "title": "Başlık",
      "title_en": "English Title",
      "slug": "baslik-slug",
      "description": "Açıklama",
      "category": "visa_procedures",
      "search_intent": "informational",
      "target_keywords": ["keyword1", "keyword2"],
      "estimated_search_volume": 1500,
      "keyword_difficulty": 35,
      "content_angle": "practical_guide",
      "target_word_count": 1800,
      "priority": 7,
      "outline": ["Giriş", "Bölüm 1", "Bölüm 2"],
      "internal_link_opportunities": [
        {"anchor": "${country.name} vizesi", "context": "Vize başvurusu"}
      ],
      "data_source": "ai_generated",
      "reasoning": "Neden bu konu seçildi"
    }
  ]
}

ZORUNLU: JSON formatında döndür, topics array içinde ${topic_count} konu olmalı.`;

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
      max_tokens: 4000,
      response_format: { type: 'json_object' }
    });

    const responseText = completion.choices[0].message.content;
    if (!responseText) {
      throw new Error('No response from OpenAI');
    }

    let aiResponse;
    try {
      aiResponse = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Failed to parse AI response:', responseText);
      return NextResponse.json(
        { 
          error: 'Invalid JSON from AI',
          details: 'AI response could not be parsed as JSON'
        },
        { status: 500 }
      );
    }

    const topics = aiResponse.topics || [];

    if (!Array.isArray(topics) || topics.length === 0) {
      return NextResponse.json(
        { 
          error: 'Invalid topics format from AI',
          details: 'Expected topics array but got: ' + typeof topics
        },
        { status: 500 }
      );
    }

    // Helper function to safely parse numbers
    const safeNumber = (value: any, defaultValue: number): number => {
      const parsed = parseInt(value);
      return isNaN(parsed) ? defaultValue : parsed;
    };

    // Filter out duplicates and insert new topics
    const newTopics = topics.filter((topic: any) => 
      !existingSlugs.includes(topic.slug) && !existingTitles.includes(topic.title)
    );

    const topicsToInsert = newTopics.map((topic: any) => ({
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

    if (topicsToInsert.length === 0) {
      return NextResponse.json(
        { 
          error: 'No new topics to add',
          details: 'All generated topics are duplicates'
        },
        { status: 400 }
      );
    }

    const { data: insertedTopics, error: topicsError } = await supabase
      .from('ai_blog_topics')
      .insert(topicsToInsert)
      .select();

    if (topicsError) {
      console.error('Topics insertion error:', topicsError);
      return NextResponse.json(
        { 
          error: 'Failed to insert topics',
          details: topicsError.message
        },
        { status: 500 }
      );
    }

    // Update plan's total_topics count
    const newTotalTopics = (existingTopics?.length || 0) + insertedTopics.length;
    await supabase
      .from('ai_blog_plans')
      .update({ 
        total_topics: newTotalTopics,
        generated_topics: newTotalTopics
      })
      .eq('id', plan_id);

    return NextResponse.json({
      success: true,
      plan_id,
      topics_added: insertedTopics.length,
      total_topics: newTotalTopics,
      message: `${insertedTopics.length} yeni konu eklendi!`,
      topics: insertedTopics
    });

  } catch (error: any) {
    console.error('Add topics error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to add topics' },
      { status: 500 }
    );
  }
}
