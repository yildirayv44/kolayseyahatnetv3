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

type JsonFieldType = 'travel_tips' | 'application_steps' | 'important_notes' | 'popular_cities';
type TextFieldType = 'best_time_to_visit' | 'health_requirements' | 'customs_regulations' | 'why_kolay_seyahat';

async function translateJsonArray(items: string[], fieldType: JsonFieldType): Promise<string[]> {
  if (!items || items.length === 0) return [];

  const prompts: Record<JsonFieldType, string> = {
    travel_tips: `You are a professional translator. Translate these Turkish travel tips to English.
Rules:
- Keep them concise and helpful
- Professional tone
- Return ONLY a JSON array of translated strings, nothing else`,
    application_steps: `You are a professional translator. Translate these Turkish visa application steps to English.
Rules:
- Keep them clear and actionable
- Professional tone
- Keep "Adım X:" format as "Step X:"
- Return ONLY a JSON array of translated strings, nothing else`,
    important_notes: `You are a professional translator. Translate these Turkish important travel notes to English.
Rules:
- Keep the warning tone
- Professional and clear
- Return ONLY a JSON array of translated strings, nothing else`,
    popular_cities: `You are a professional translator. Translate these Turkish city names to their English equivalents.
Rules:
- Use official English names for cities (e.g., "Atina" -> "Athens", "Roma" -> "Rome")
- Keep city names that are the same in both languages
- Return ONLY a JSON array of translated strings, nothing else`,
  };

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: prompts[fieldType] },
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

async function translateText(text: string, fieldType: TextFieldType): Promise<string> {
  if (!text || text.trim() === '') return '';

  const prompts: Record<TextFieldType, string> = {
    best_time_to_visit: `You are a professional translator. Translate this Turkish text about the best time to visit a country to English.
Rules:
- Keep it informative and helpful
- Professional tone
- Return ONLY the translated text, nothing else`,
    health_requirements: `You are a professional translator. Translate this Turkish text about health requirements for travel to English.
Rules:
- Keep medical/health terminology accurate
- Professional tone
- Return ONLY the translated text, nothing else`,
    customs_regulations: `You are a professional translator. Translate this Turkish text about customs regulations to English.
Rules:
- Keep legal/customs terminology accurate
- Professional tone
- Return ONLY the translated text, nothing else`,
    why_kolay_seyahat: `You are a professional translator. Translate this Turkish marketing text about why to choose Kolay Seyahat to English.
Rules:
- Keep the persuasive tone
- Keep "Kolay Seyahat" brand name unchanged
- Professional tone
- Return ONLY the translated text, nothing else`,
  };

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: prompts[fieldType] },
        { role: 'user', content: text },
      ],
      temperature: 0.3,
      max_tokens: 1000,
    });

    return completion.choices[0]?.message?.content?.trim() || '';
  } catch (error) {
    console.error('Translation error:', error);
    return '';
  }
}

/**
 * Translate all extended country fields to English
 * POST /api/admin/seo/translate-json-fields
 */
export async function POST(request: NextRequest) {
  try {
    const { limit = 10 } = await request.json();

    // Get countries that need translation - check all fields
    const { data: countries, error } = await supabase
      .from('countries')
      .select(`
        id, name, 
        travel_tips, travel_tips_en,
        application_steps, application_steps_en,
        important_notes, important_notes_en,
        popular_cities, popular_cities_en,
        best_time_to_visit, best_time_to_visit_en,
        health_requirements, health_requirements_en,
        customs_regulations, customs_regulations_en,
        why_kolay_seyahat, why_kolay_seyahat_en
      `)
      .eq('status', 1)
      .or('travel_tips_en.is.null,application_steps_en.is.null,important_notes_en.is.null,popular_cities_en.is.null,best_time_to_visit_en.is.null,health_requirements_en.is.null,customs_regulations_en.is.null,why_kolay_seyahat_en.is.null')
      .limit(limit);

    if (error) throw error;

    const results: any[] = [];
    let translated = 0;

    for (const country of countries || []) {
      const updates: Record<string, any> = {};
      const fieldsTranslated: string[] = [];

      // JSON Array Fields
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

      // Translate important_notes if needed
      if (!country.important_notes_en && country.important_notes && country.important_notes.length > 0) {
        const translatedNotes = await translateJsonArray(country.important_notes, 'important_notes');
        if (translatedNotes.length > 0) {
          updates.important_notes_en = translatedNotes;
          fieldsTranslated.push('important_notes_en');
        }
      }

      // Translate popular_cities if needed
      if (!country.popular_cities_en && country.popular_cities && country.popular_cities.length > 0) {
        const translatedCities = await translateJsonArray(country.popular_cities, 'popular_cities');
        if (translatedCities.length > 0) {
          updates.popular_cities_en = translatedCities;
          fieldsTranslated.push('popular_cities_en');
        }
      }

      // Text Fields
      // Translate best_time_to_visit if needed
      if (!country.best_time_to_visit_en && country.best_time_to_visit) {
        const translatedText = await translateText(country.best_time_to_visit, 'best_time_to_visit');
        if (translatedText) {
          updates.best_time_to_visit_en = translatedText;
          fieldsTranslated.push('best_time_to_visit_en');
        }
      }

      // Translate health_requirements if needed
      if (!country.health_requirements_en && country.health_requirements) {
        const translatedText = await translateText(country.health_requirements, 'health_requirements');
        if (translatedText) {
          updates.health_requirements_en = translatedText;
          fieldsTranslated.push('health_requirements_en');
        }
      }

      // Translate customs_regulations if needed
      if (!country.customs_regulations_en && country.customs_regulations) {
        const translatedText = await translateText(country.customs_regulations, 'customs_regulations');
        if (translatedText) {
          updates.customs_regulations_en = translatedText;
          fieldsTranslated.push('customs_regulations_en');
        }
      }

      // Translate why_kolay_seyahat if needed
      if (!country.why_kolay_seyahat_en && country.why_kolay_seyahat) {
        const translatedText = await translateText(country.why_kolay_seyahat, 'why_kolay_seyahat');
        if (translatedText) {
          updates.why_kolay_seyahat_en = translatedText;
          fieldsTranslated.push('why_kolay_seyahat_en');
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
 * Get count of countries needing extended field translation
 * GET /api/admin/seo/translate-json-fields
 */
export async function GET() {
  try {
    const { count } = await supabase
      .from('countries')
      .select('id', { count: 'exact', head: true })
      .eq('status', 1)
      .or('travel_tips_en.is.null,application_steps_en.is.null,important_notes_en.is.null,popular_cities_en.is.null,best_time_to_visit_en.is.null,health_requirements_en.is.null,customs_regulations_en.is.null,why_kolay_seyahat_en.is.null');

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
