import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function translateJsonArray(items: string[], fieldType: string): Promise<string[]> {
  if (!items || items.length === 0) return [];

  const prompt = `You are a professional translator. Translate these Turkish texts to English.

IMPORTANT: Return ONLY a valid JSON array of translated strings. No markdown, no explanations.

Example input: ["Merhaba", "Dünya"]
Example output: ["Hello", "World"]

Field type: ${fieldType}
Rules:
- Return ONLY a valid JSON array
- Translate each string to English
- Keep the same number of items
- Professional tone
- For city names, use official English names (e.g., "Atina" -> "Athens")
- For steps, keep "Adım X:" format as "Step X:"`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: prompt },
        { role: 'user', content: JSON.stringify(items) },
      ],
      temperature: 0.3,
      max_tokens: 2000,
    });

    const response = completion.choices[0]?.message?.content?.trim() || '[]';
    return JSON.parse(response);
  } catch (error) {
    console.error('Translation error:', error);
    return [];
  }
}

async function translateText(text: string, fieldType: string): Promise<string> {
  if (!text || text.trim() === '') return '';

  const prompt = `You are a professional translator. Translate this Turkish text to English.
Field type: ${fieldType}
Rules:
- Professional tone
- Keep technical terms accurate
- Return ONLY the translated text, nothing else`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: prompt },
        { role: 'user', content: text },
      ],
      temperature: 0.3,
      max_tokens: 2000,
    });

    return completion.choices[0]?.message?.content?.trim() || '';
  } catch (error) {
    console.error('Translation error:', error);
    return '';
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Get country data
    const { data: country, error: fetchError } = await supabase
      .from("countries")
      .select(`
        id, name, title, description, contents,
        travel_tips, application_steps, important_notes,
        popular_cities, required_documents,
        best_time_to_visit, health_requirements, customs_regulations,
        title_en, description_en, contents_en,
        travel_tips_en, application_steps_en, important_notes_en,
        popular_cities_en, required_documents_en,
        best_time_to_visit_en, health_requirements_en, customs_regulations_en
      `)
      .eq("id", id)
      .single();

    if (fetchError || !country) {
      return NextResponse.json({ success: false, error: "Country not found" }, { status: 404 });
    }

    const updates: Record<string, any> = {};
    const translatedFields: string[] = [];

    // Translate title if missing
    if (!country.title_en && country.title) {
      const translated = await translateText(country.title, 'title');
      if (translated) {
        updates.title_en = translated;
        translatedFields.push('title_en');
      }
    }

    // Translate description if missing
    if (!country.description_en && country.description) {
      const translated = await translateText(country.description, 'description');
      if (translated) {
        updates.description_en = translated;
        translatedFields.push('description_en');
      }
    }

    // Translate contents if missing
    if (!country.contents_en && country.contents) {
      const translated = await translateText(country.contents, 'contents');
      if (translated) {
        updates.contents_en = translated;
        translatedFields.push('contents_en');
      }
    }

    // Translate JSON array fields
    const arrayFields = [
      { source: 'travel_tips', target: 'travel_tips_en' },
      { source: 'application_steps', target: 'application_steps_en' },
      { source: 'important_notes', target: 'important_notes_en' },
      { source: 'popular_cities', target: 'popular_cities_en' },
      { source: 'required_documents', target: 'required_documents_en' },
    ];

    for (const field of arrayFields) {
      const sourceValue = country[field.source as keyof typeof country];
      const targetValue = country[field.target as keyof typeof country];
      
      if ((!targetValue || (Array.isArray(targetValue) && targetValue.length === 0)) && 
          sourceValue && Array.isArray(sourceValue) && sourceValue.length > 0) {
        const translated = await translateJsonArray(sourceValue as string[], field.source);
        if (translated.length > 0) {
          updates[field.target] = translated;
          translatedFields.push(field.target);
        }
      }
    }

    // Translate text fields
    const textFields = [
      { source: 'best_time_to_visit', target: 'best_time_to_visit_en' },
      { source: 'health_requirements', target: 'health_requirements_en' },
      { source: 'customs_regulations', target: 'customs_regulations_en' },
    ];

    for (const field of textFields) {
      const sourceValue = country[field.source as keyof typeof country];
      const targetValue = country[field.target as keyof typeof country];
      
      if (!targetValue && sourceValue) {
        const translated = await translateText(sourceValue as string, field.source);
        if (translated) {
          updates[field.target] = translated;
          translatedFields.push(field.target);
        }
      }
    }

    // Update country if there are translations
    if (Object.keys(updates).length > 0) {
      const { error: updateError } = await supabase
        .from("countries")
        .update(updates)
        .eq("id", id);

      if (updateError) {
        return NextResponse.json({ success: false, error: updateError.message }, { status: 400 });
      }
    }

    return NextResponse.json({
      success: true,
      translatedFields,
      message: translatedFields.length > 0 
        ? `${translatedFields.length} alan çevrildi` 
        : 'Çevrilecek alan bulunamadı',
    });
  } catch (error: any) {
    console.error("Translation error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
