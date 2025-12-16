import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function translateJsonArray(items: string[], fieldType: 'travel_tips' | 'application_steps'): Promise<string[]> {
  if (!items || items.length === 0) return [];

  const systemPrompt = fieldType === 'travel_tips'
    ? `You are a professional translator. Translate these Turkish travel tips to English.
Rules:
- Keep them concise and helpful
- Professional tone
- Return ONLY a JSON array of translated strings, nothing else
- Example input: ["Adalar arası ulaşım feribot ile yapılır", "Siesta saatlerine dikkat edin"]
- Example output: ["Inter-island transportation is by ferry", "Be mindful of siesta hours"]`
    : `You are a professional translator. Translate these Turkish visa application steps to English.
Rules:
- Keep them clear and actionable
- Professional tone
- Keep "Adım X:" format as "Step X:"
- Return ONLY a JSON array of translated strings, nothing else
- Example input: ["Adım 1: Online randevu alın", "Adım 2: Başvuru formunu doldurun"]
- Example output: ["Step 1: Book an online appointment", "Step 2: Fill out the application form"]`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: JSON.stringify(items) },
      ],
      temperature: 0.3,
      max_tokens: 1000,
    });

    const response = completion.choices[0]?.message?.content?.trim() || '[]';
    return JSON.parse(response);
  } catch (error) {
    console.error('Translation error:', error);
    return [];
  }
}

/**
 * Translate travel_tips and application_steps for all countries
 * POST /api/admin/seo/translate-json-fields
 */
export async function POST(request: NextRequest) {
  try {
    const { limit = 10 } = await request.json();

    // Get countries that need translation
    const { data: countries, error } = await supabase
      .from('countries')
      .select('id, name, travel_tips, application_steps, travel_tips_en, application_steps_en')
      .eq('status', 1)
      .or('travel_tips_en.is.null,application_steps_en.is.null')
      .limit(limit);

    if (error) throw error;

    const results: any[] = [];
    let translated = 0;

    for (const country of countries || []) {
      const updates: Record<string, any> = {};
      const fieldsTranslated: string[] = [];

      // Translate travel_tips if needed
      if (!country.travel_tips_en && country.travel_tips && country.travel_tips.length > 0) {
        const translatedTips = await translateJsonArray(country.travel_tips, 'travel_tips');
        if (translatedTips.length > 0) {
          updates.travel_tips_en = translatedTips;
          fieldsTranslated.push('travel_tips_en');
        }
      }

      // Translate application_steps if needed
      if (!country.application_steps_en && country.application_steps && country.application_steps.length > 0) {
        const translatedSteps = await translateJsonArray(country.application_steps, 'application_steps');
        if (translatedSteps.length > 0) {
          updates.application_steps_en = translatedSteps;
          fieldsTranslated.push('application_steps_en');
        }
      }

      // Update database
      if (Object.keys(updates).length > 0) {
        const { error: updateError } = await supabase
          .from('countries')
          .update(updates)
          .eq('id', country.id);

        if (!updateError) {
          translated++;
          results.push({
            id: country.id,
            name: country.name,
            success: true,
            fields_translated: fieldsTranslated,
          });
        } else {
          results.push({
            id: country.id,
            name: country.name,
            success: false,
            error: updateError.message,
          });
        }
      }
    }

    return NextResponse.json({
      success: true,
      total_translated: translated,
      results,
    });
  } catch (error: any) {
    console.error('Translation error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * Get count of countries needing JSON field translation
 * GET /api/admin/seo/translate-json-fields
 */
export async function GET() {
  try {
    const { count } = await supabase
      .from('countries')
      .select('id', { count: 'exact', head: true })
      .eq('status', 1)
      .or('travel_tips_en.is.null,application_steps_en.is.null');

    return NextResponse.json({
      success: true,
      missing_count: count || 0,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
