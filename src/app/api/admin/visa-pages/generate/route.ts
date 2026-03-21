import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { generateVisaPageContent } from '@/lib/ai/generate-visa-content';

/**
 * POST /api/admin/visa-pages/generate
 * Generate AI content for a bilateral visa page
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { source_country_code, destination_country_code, locale = 'tr' } = body;

    if (!source_country_code || !destination_country_code) {
      return NextResponse.json(
        { success: false, error: 'Source and destination country codes are required' },
        { status: 400 }
      );
    }

    // Generate AI content
    const content = await generateVisaPageContent(
      source_country_code,
      destination_country_code,
      locale as 'tr' | 'en'
    );

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
