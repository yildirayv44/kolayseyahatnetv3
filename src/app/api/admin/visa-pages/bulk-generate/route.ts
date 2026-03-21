import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { generateVisaPageContent } from '@/lib/ai/generate-visa-content';

/**
 * POST /api/admin/visa-pages/bulk-generate
 * Generate AI content for multiple bilateral visa pages
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { country_pairs, locale = 'tr' } = body;

    if (!country_pairs || !Array.isArray(country_pairs)) {
      return NextResponse.json(
        { success: false, error: 'country_pairs array is required' },
        { status: 400 }
      );
    }

    const results = {
      total: country_pairs.length,
      successful: 0,
      failed: 0,
      errors: [] as any[]
    };

    // Process each country pair
    for (const pair of country_pairs) {
      const { source_country_code, destination_country_code } = pair;

      try {
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

        if (existing) {
          // Update existing page
          await supabase
            .from('visa_pages_seo')
            .update({
              ...content,
              content_status: 'generated',
              generated_at: new Date().toISOString(),
              ai_model: 'internal-template',
              generation_prompt: `Bulk generated content for ${source_country_code} to ${destination_country_code}`
            })
            .eq('id', existing.id);
        } else {
          // Create new page
          await supabase
            .from('visa_pages_seo')
            .insert({
              source_country_code,
              destination_country_code,
              locale,
              ...content,
              content_status: 'generated',
              generated_at: new Date().toISOString(),
              ai_model: 'internal-template',
              generation_prompt: `Bulk generated content for ${source_country_code} to ${destination_country_code}`
            });
        }

        results.successful++;
        
        // Rate limiting: wait 100ms between generations
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error: any) {
        results.failed++;
        results.errors.push({
          source: source_country_code,
          destination: destination_country_code,
          error: error.message
        });
      }
    }

    return NextResponse.json({
      success: true,
      data: results,
      message: `Generated ${results.successful} pages, ${results.failed} failed`
    });
  } catch (error: any) {
    console.error('Bulk generate visa pages error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to bulk generate content' },
      { status: 500 }
    );
  }
}
