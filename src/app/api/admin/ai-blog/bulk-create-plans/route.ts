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
 * POST /api/admin/ai-blog/bulk-create-plans
 * Create multiple plans for multiple countries at once
 * with auto-approval and auto-scheduling options
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      country_ids, 
      month, 
      year, 
      topics_per_country = 10,
      auto_approve = false,
      auto_schedule = false,
      schedule_start_date,
      schedule_frequency = 'daily'
    } = body;

    if (!country_ids || !Array.isArray(country_ids) || country_ids.length === 0) {
      return NextResponse.json(
        { error: 'At least one country ID is required' },
        { status: 400 }
      );
    }

    if (!month || !year) {
      return NextResponse.json(
        { error: 'Month and year are required' },
        { status: 400 }
      );
    }

    const results = {
      success: true,
      total_countries: country_ids.length,
      total_topics_requested: country_ids.length * topics_per_country,
      created_plans: [] as any[],
      failed_countries: [] as any[],
      total_topics_created: 0,
      auto_approved: auto_approve,
      auto_scheduled: auto_schedule
    };

    // Process each country
    for (const country_id of country_ids) {
      try {
        // Get country details
        const { data: country, error: countryError } = await supabase
          .from('countries')
          .select('id, name, slug, country_code')
          .eq('id', country_id)
          .single();

        if (countryError || !country) {
          results.failed_countries.push({
            country_id,
            error: 'Country not found'
          });
          continue;
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
            total_topics: topics_per_country,
            status: 'planning',
            auto_schedule: auto_schedule,
            start_publish_date: auto_schedule ? schedule_start_date : null,
            publish_frequency: auto_schedule ? schedule_frequency : 'daily',
            data_sources: {
              google_search_console: false,
              google_trends: false,
              manual: true,
              bulk_creation: true
            }
          })
          .select()
          .single();

        if (planError || !plan) {
          results.failed_countries.push({
            country_id,
            country_name: country.name,
            error: 'Failed to create plan'
          });
          continue;
        }

        // Generate topics using AI
        const prompt = `Sen bir SEO uzmanı ve seyahat içerik stratejistisin. Türk gezginler için blog konuları öneriyorsun.

GÖREV: ${country.name} için ${topics_per_country} blog konu başlığı oluştur.

BAĞLAM:
- Ana sayfa: https://www.kolayseyahat.net/${country.slug}
- Hedef kitle: Türk gezginler, vize başvurusu yapacak kişiler
- Dönem: ${month}/${year}
- Amaç: Ana ülke sayfasına organik trafik çekmek

KONU DAĞILIMI:
- Vize & Prosedürler (30%)
- Seyahat Planlama (35%)
- Pratik Bilgiler (20%)
- Kültür & Yaşam (10%)
- Karşılaştırma (5%)

ÖNEMLİ: category alanı SADECE şu değerlerden biri olmalı:
- "visa_procedures" (vize işlemleri)
- "travel_planning" (seyahat planlama)
- "practical_info" (pratik bilgiler)
- "culture" (kültür)
- "comparison" (karşılaştırma)

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
      "outline": ["Giriş", "Bölüm 1"],
      "internal_link_opportunities": [
        {"anchor": "${country.name} vizesi", "context": "Vize başvurusu"}
      ],
      "data_source": "ai_generated",
      "reasoning": "Neden bu konu"
    }
  ]
}

ZORUNLU: JSON formatında ${topics_per_country} konu döndür.`;

        const completion = await openai.chat.completions.create({
          model: 'gpt-4o',
          messages: [
            { role: 'system', content: 'You are an expert SEO content strategist. Always respond with valid JSON.' },
            { role: 'user', content: prompt }
          ],
          temperature: 0.8,
          max_tokens: 8000,
          response_format: { type: 'json_object' }
        });

        const responseText = completion.choices[0].message.content;
        if (!responseText) {
          console.error(`No AI response for ${country.name}`);
          results.failed_countries.push({
            country_id,
            country_name: country.name,
            error: 'No AI response'
          });
          continue;
        }

        console.log(`AI response for ${country.name}: ${responseText.length} chars`);

        let aiResponse;
        try {
          aiResponse = JSON.parse(responseText);
        } catch (parseError) {
          console.error(`JSON parse error for ${country.name}:`, parseError);
          console.error('Response preview:', responseText.substring(0, 500));
          results.failed_countries.push({
            country_id,
            country_name: country.name,
            error: 'Invalid JSON from AI'
          });
          continue;
        }

        const topics = aiResponse.topics || [];

        if (!Array.isArray(topics) || topics.length === 0) {
          console.error(`Invalid topics for ${country.name}:`, topics);
          results.failed_countries.push({
            country_id,
            country_name: country.name,
            error: 'Invalid topics format'
          });
          continue;
        }

        console.log(`Successfully parsed ${topics.length} topics for ${country.name}`);

        // Helper function
        const safeNumber = (value: any, defaultValue: number): number => {
          if (value === null || value === undefined || value === '') return defaultValue;
          const parsed = typeof value === 'number' ? value : parseInt(String(value), 10);
          return isNaN(parsed) || !isFinite(parsed) ? defaultValue : parsed;
        };

        // Valid categories from database constraint
        const validCategories = ['visa_procedures', 'travel_planning', 'practical_info', 'culture', 'comparison'];
        
        // Insert topics
        const topicsToInsert = topics.map((topic: any) => {
          // Validate and fix category
          let category = topic.category;
          if (!validCategories.includes(category)) {
            console.warn(`Invalid category "${category}" for topic "${topic.title}", defaulting to "practical_info"`);
            category = 'practical_info';
          }
          
          return {
            plan_id: plan.id,
            country_id: country.id,
            title: topic.title,
            title_en: topic.title_en || topic.title,
            slug: topic.slug,
            description: topic.description || '',
            category: category,
            search_intent: topic.search_intent || 'informational',
            content_angle: topic.content_angle || '',
            target_keywords: Array.isArray(topic.target_keywords) ? topic.target_keywords : [],
            estimated_search_volume: safeNumber(topic.estimated_search_volume, 0),
            keyword_difficulty: safeNumber(topic.keyword_difficulty, 0),
            target_word_count: safeNumber(topic.target_word_count, 1500),
            outline: Array.isArray(topic.outline) ? topic.outline : [],
            internal_link_opportunities: Array.isArray(topic.internal_link_opportunities) ? topic.internal_link_opportunities : [],
            priority: safeNumber(topic.priority, 5),
            status: auto_approve ? 'approved' : 'pending',
            data_source: topic.data_source || 'ai_generated',
            search_metrics: {
              estimated_search_volume: safeNumber(topic.estimated_search_volume, 0),
              keyword_difficulty: safeNumber(topic.keyword_difficulty, 0)
            },
            reasoning: topic.reasoning || ''
          };
        });

        const { data: insertedTopics, error: topicsError } = await supabase
          .from('ai_blog_topics')
          .insert(topicsToInsert)
          .select();

        if (topicsError || !insertedTopics) {
          console.error(`Failed to insert topics for ${country.name}:`, topicsError);
          console.error('Topics to insert:', JSON.stringify(topicsToInsert, null, 2));
          results.failed_countries.push({
            country_id,
            country_name: country.name,
            error: topicsError?.message || 'Failed to insert topics'
          });
          continue;
        }

        // Update plan status
        const planStatus = auto_approve ? 'generating' : 'review';
        await supabase
          .from('ai_blog_plans')
          .update({ 
            status: planStatus,
            generated_topics: insertedTopics.length,
            approved_topics: auto_approve ? insertedTopics.length : 0
          })
          .eq('id', plan.id);

        results.created_plans.push({
          plan_id: plan.id,
          country_id: country.id,
          country_name: country.name,
          topics_created: insertedTopics.length,
          status: planStatus
        });

        results.total_topics_created += insertedTopics.length;

        // Store auto-schedule info in plan for client-side processing
        if (auto_schedule && schedule_start_date) {
          await supabase
            .from('ai_blog_plans')
            .update({ 
              start_publish_date: schedule_start_date,
              publish_frequency: schedule_frequency,
              auto_schedule: true
            })
            .eq('id', plan.id);
          
          console.log(`Plan ${plan.id} marked for auto-scheduling from ${schedule_start_date}`);
        }
        
        console.log(`Plan ${plan.id} created with ${insertedTopics.length} topics (status: ${planStatus})`);

      } catch (error: any) {
        results.failed_countries.push({
          country_id,
          error: error.message
        });
      }
    }

    return NextResponse.json({
      ...results,
      message: `${results.created_plans.length} plan oluşturuldu, ${results.total_topics_created} konu üretildi!`
    });

  } catch (error: any) {
    console.error('Bulk plan creation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create bulk plans' },
      { status: 500 }
    );
  }
}
