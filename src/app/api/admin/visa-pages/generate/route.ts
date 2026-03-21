import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { generateVisaPageContent } from '@/lib/ai/generate-visa-content';

// Use service role key for admin operations (bypasses RLS)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's')
    .replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ç/g, 'c')
    .replace(/Ğ/g, 'g').replace(/Ü/g, 'u').replace(/Ş/g, 's')
    .replace(/İ/g, 'i').replace(/Ö/g, 'o').replace(/Ç/g, 'c')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

async function generateSlug(sourceCode: string, destCode: string, locale: string): Promise<string> {
  const { data: countries } = await supabase
    .from('countries')
    .select('country_code, name, name_en')
    .in('country_code', [sourceCode, destCode]);

  const source = countries?.find(c => c.country_code === sourceCode);
  const dest = countries?.find(c => c.country_code === destCode);
  const suffix = locale === 'en' ? 'visa' : 'vize';

  const sourceName = locale === 'en' ? (source?.name_en || source?.name) : source?.name;
  const destName = locale === 'en' ? (dest?.name_en || dest?.name) : dest?.name;

  return `${slugify(sourceName || sourceCode)}-${slugify(destName || destCode)}-${suffix}`;
}

/**
 * POST /api/admin/visa-pages/generate
 * Generate AI content for a bilateral visa page
 */
export async function POST(request: NextRequest) {
  try {
    console.log('[API] POST /api/admin/visa-pages/generate called');
    const body = await request.json();
    console.log('[API] Request body:', body);
    const { source_country_code, destination_country_code, locale = 'tr' } = body;

    if (!source_country_code || !destination_country_code) {
      console.log('[API] Missing country codes');
      return NextResponse.json(
        { success: false, error: 'Source and destination country codes are required' },
        { status: 400 }
      );
    }

    console.log('[API] Calling generateVisaPageContent...');
    // Generate AI content
    const content = await generateVisaPageContent(
      source_country_code,
      destination_country_code,
      locale as 'tr' | 'en'
    );
    console.log('[API] Content generated successfully');

    // Generate proper slug with Turkish character support
    const slug = await generateSlug(source_country_code, destination_country_code, locale);
    console.log('[API] Generated slug:', slug);

    // Check if page already exists
    const { data: existing } = await supabase
      .from('visa_pages_seo')
      .select('id')
      .eq('source_country_code', source_country_code)
      .eq('destination_country_code', destination_country_code)
      .eq('locale', locale)
      .single();

    let result;

    if (existing) {
      // Update existing page
      const { data, error } = await supabase
        .from('visa_pages_seo')
        .update({
          ...content,
          slug,
          content_status: 'generated',
          generated_at: new Date().toISOString(),
          ai_model: 'internal-template',
          generation_prompt: `Generated content for ${source_country_code} to ${destination_country_code} visa page`
        })
        .eq('id', existing.id)
        .select()
        .single();

      if (error) throw error;
      result = data;
    } else {
      // Create new page
      const { data, error } = await supabase
        .from('visa_pages_seo')
        .insert({
          source_country_code,
          destination_country_code,
          locale,
          slug,
          ...content,
          content_status: 'generated',
          generated_at: new Date().toISOString(),
          ai_model: 'internal-template',
          generation_prompt: `Generated content for ${source_country_code} to ${destination_country_code} visa page`
        })
        .select()
        .single();

      if (error) throw error;
      result = data;
    }

    return NextResponse.json({
      success: true,
      data: result,
      message: 'Content generated successfully'
    });
  } catch (error: any) {
    console.error('Generate visa page error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to generate content' },
      { status: 500 }
    );
  }
}
