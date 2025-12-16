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

interface TranslationResult {
  id: number;
  name: string;
  type: string;
  success: boolean;
  fields_translated: string[];
  error?: string;
}

async function translateText(text: string, type: 'title' | 'description' | 'content'): Promise<string> {
  if (!text || text.trim() === '') return '';

  const systemPrompts: Record<string, string> = {
    title: `You are a professional translator. Translate this Turkish visa/travel title to English.
Rules:
- Keep it concise (max 60 chars for meta title)
- SEO-friendly
- Professional tone
- If it contains "Vizesi" translate to "Visa"
- Keep "Kolay Seyahat" brand name unchanged
- Return ONLY the translated title, nothing else`,
    
    description: `You are a professional translator. Translate this Turkish visa/travel description to English.
Rules:
- Keep it compelling and within 155 characters
- SEO-optimized
- Professional tone
- Keep "Kolay Seyahat" brand name unchanged
- Return ONLY the translated description, nothing else`,
    
    content: `You are a professional translator specializing in travel and visa content. Translate the Turkish text to English.
Rules:
- Maintain the original meaning and tone
- Keep markdown formatting (H2, H3, lists, etc.)
- Use natural, fluent English
- Preserve technical terms (visa, passport, etc.)
- Keep the same structure
- SEO-friendly translation
- Professional tone
- Keep "Kolay Seyahat" brand name unchanged`,
  };

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: systemPrompts[type] },
      { role: 'user', content: text },
    ],
    temperature: 0.3,
    max_tokens: type === 'content' ? 4000 : 200,
  });

  return completion.choices[0]?.message?.content?.trim() || '';
}

/**
 * Translate missing English content for countries and blogs
 * POST /api/admin/seo/translate-missing
 */
export async function POST(request: NextRequest) {
  try {
    const { type, id, translateAll = false } = await request.json();

    const results: TranslationResult[] = [];
    let totalTranslated = 0;

    // Translate single item
    if (id && type) {
      const result = await translateSingleItem(type, id);
      results.push(result);
      if (result.success) totalTranslated++;
    }
    // Translate all missing
    else if (translateAll) {
      // Get countries with missing English content
      if (!type || type === 'country') {
        const { data: countries } = await supabase
          .from('countries')
          .select('id, name, title, meta_title, meta_description, description, contents, title_en, meta_title_en, meta_description_en, description_en, contents_en')
          .eq('status', 1)
          .or('title_en.is.null,title_en.eq.,meta_title_en.is.null,meta_title_en.eq.,meta_description_en.is.null,meta_description_en.eq.,contents_en.is.null,contents_en.eq.')
          .limit(10); // Limit to prevent timeout

        if (countries) {
          for (const country of countries) {
            const result = await translateCountry(country);
            results.push(result);
            if (result.success) totalTranslated++;
          }
        }
      }

      // Get blogs with missing English content
      if (!type || type === 'blog') {
        const { data: blogs } = await supabase
          .from('blogs')
          .select('id, title, description, contents, title_en, description_en, contents_en')
          .or('title_en.is.null,title_en.eq.,description_en.is.null,description_en.eq.,contents_en.is.null,contents_en.eq.')
          .limit(10);

        if (blogs) {
          for (const blog of blogs) {
            const result = await translateBlog(blog);
            results.push(result);
            if (result.success) totalTranslated++;
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      total_translated: totalTranslated,
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

async function translateSingleItem(type: string, id: number): Promise<TranslationResult> {
  if (type === 'country') {
    const { data: country } = await supabase
      .from('countries')
      .select('id, name, title, meta_title, meta_description, description, contents, title_en, meta_title_en, meta_description_en, description_en, contents_en')
      .eq('id', id)
      .single();

    if (country) {
      return translateCountry(country);
    }
  } else if (type === 'blog') {
    const { data: blog } = await supabase
      .from('blogs')
      .select('id, title, description, contents, title_en, description_en, contents_en')
      .eq('id', id)
      .single();

    if (blog) {
      return translateBlog(blog);
    }
  }

  return {
    id,
    name: 'Unknown',
    type,
    success: false,
    fields_translated: [],
    error: 'Item not found',
  };
}

async function translateCountry(country: any): Promise<TranslationResult> {
  const fieldsTranslated: string[] = [];
  const updates: Record<string, string> = {};

  try {
    // Translate title_en
    if (!country.title_en && country.title) {
      const translated = await translateText(country.title, 'title');
      if (translated) {
        updates.title_en = translated;
        fieldsTranslated.push('title_en');
      }
    }

    // Translate meta_title_en
    if (!country.meta_title_en && country.meta_title) {
      const translated = await translateText(country.meta_title, 'title');
      if (translated) {
        updates.meta_title_en = translated;
        fieldsTranslated.push('meta_title_en');
      }
    }

    // Translate meta_description_en
    if (!country.meta_description_en && country.meta_description) {
      const translated = await translateText(country.meta_description, 'description');
      if (translated) {
        updates.meta_description_en = translated;
        fieldsTranslated.push('meta_description_en');
      }
    }

    // Translate description_en
    if (!country.description_en && country.description) {
      const translated = await translateText(country.description, 'description');
      if (translated) {
        updates.description_en = translated;
        fieldsTranslated.push('description_en');
      }
    }

    // Translate contents_en (only if not too long)
    if (!country.contents_en && country.contents && country.contents.length < 10000) {
      const translated = await translateText(country.contents, 'content');
      if (translated) {
        updates.contents_en = translated;
        fieldsTranslated.push('contents_en');
      }
    }

    // Update database
    if (Object.keys(updates).length > 0) {
      const { error } = await supabase
        .from('countries')
        .update(updates)
        .eq('id', country.id);

      if (error) throw error;
    }

    return {
      id: country.id,
      name: country.name,
      type: 'country',
      success: true,
      fields_translated: fieldsTranslated,
    };
  } catch (error: any) {
    return {
      id: country.id,
      name: country.name,
      type: 'country',
      success: false,
      fields_translated: fieldsTranslated,
      error: error.message,
    };
  }
}

async function translateBlog(blog: any): Promise<TranslationResult> {
  const fieldsTranslated: string[] = [];
  const updates: Record<string, string> = {};

  try {
    // Translate title_en
    if (!blog.title_en && blog.title) {
      const translated = await translateText(blog.title, 'title');
      if (translated) {
        updates.title_en = translated;
        fieldsTranslated.push('title_en');
      }
    }

    // Translate description_en
    if (!blog.description_en && blog.description) {
      const translated = await translateText(blog.description, 'description');
      if (translated) {
        updates.description_en = translated;
        fieldsTranslated.push('description_en');
      }
    }

    // Translate contents_en (only if not too long)
    if (!blog.contents_en && blog.contents && blog.contents.length < 10000) {
      const translated = await translateText(blog.contents, 'content');
      if (translated) {
        updates.contents_en = translated;
        fieldsTranslated.push('contents_en');
      }
    }

    // Update database
    if (Object.keys(updates).length > 0) {
      const { error } = await supabase
        .from('blogs')
        .update(updates)
        .eq('id', blog.id);

      if (error) throw error;
    }

    return {
      id: blog.id,
      name: blog.title,
      type: 'blog',
      success: true,
      fields_translated: fieldsTranslated,
    };
  } catch (error: any) {
    return {
      id: blog.id,
      name: blog.title,
      type: 'blog',
      success: false,
      fields_translated: fieldsTranslated,
      error: error.message,
    };
  }
}

/**
 * Get count of items with missing English content
 * GET /api/admin/seo/translate-missing
 */
export async function GET() {
  try {
    // Count countries with missing English content
    const { count: countriesMissing } = await supabase
      .from('countries')
      .select('id', { count: 'exact', head: true })
      .eq('status', 1)
      .or('title_en.is.null,title_en.eq.,contents_en.is.null,contents_en.eq.');

    // Count blogs with missing English content
    const { count: blogsMissing } = await supabase
      .from('blogs')
      .select('id', { count: 'exact', head: true })
      .or('title_en.is.null,title_en.eq.,contents_en.is.null,contents_en.eq.');

    return NextResponse.json({
      success: true,
      missing: {
        countries: countriesMissing || 0,
        blogs: blogsMissing || 0,
        total: (countriesMissing || 0) + (blogsMissing || 0),
      },
    });
  } catch (error: any) {
    console.error('Error getting missing count:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
