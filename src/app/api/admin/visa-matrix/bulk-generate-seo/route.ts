import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

/**
 * POST /api/admin/visa-matrix/bulk-generate-seo
 * 
 * Generate SEO content for multiple visa pages
 * 
 * Body:
 * {
 *   sourceCountryCode: string,
 *   locale: string (tr or en),
 *   limit?: number (default: 50)
 * }
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sourceCountryCode, locale, limit = 50 } = body;

    if (!sourceCountryCode || !locale) {
      return NextResponse.json(
        { success: false, error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Get all visa requirements for source country
    const { data: visaReqs, error: visaError } = await supabase
      .from('visa_requirements')
      .select('source_country_code, country_code')
      .eq('source_country_code', sourceCountryCode)
      .limit(limit);

    if (visaError || !visaReqs) {
      return NextResponse.json(
        { success: false, error: 'Failed to fetch visa requirements' },
        { status: 500 }
      );
    }

    let generated = 0;
    let skipped = 0;
    const errors: string[] = [];

    // Generate SEO content for each destination
    for (const visaReq of visaReqs) {
      try {
        // Check if SEO content already exists
        const { data: existing } = await supabase
          .from('visa_pages_seo')
          .select('id')
          .eq('source_country_code', visaReq.source_country_code)
          .eq('destination_country_code', visaReq.country_code)
          .eq('locale', locale)
          .maybeSingle();

        if (existing) {
          skipped++;
          continue;
        }

        // Call generate-seo endpoint
        const response = await fetch(`${request.nextUrl.origin}/api/admin/visa-matrix/generate-seo`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sourceCountryCode: visaReq.source_country_code,
            destinationCountryCode: visaReq.country_code,
            locale,
          }),
        });

        if (response.ok) {
          generated++;
        } else {
          const errorData = await response.json();
          errors.push(`${visaReq.country_code}: ${errorData.error}`);
        }

        // Rate limiting: wait 100ms between requests
        await new Promise(resolve => setTimeout(resolve, 100));

      } catch (err) {
        errors.push(`${visaReq.country_code}: ${err instanceof Error ? err.message : 'Unknown error'}`);
      }
    }

    return NextResponse.json({
      success: true,
      generated,
      skipped,
      total: visaReqs.length,
      errors,
      message: `Generated ${generated} SEO pages, skipped ${skipped} existing`,
    });

  } catch (error) {
    console.error('API: /api/admin/visa-matrix/bulk-generate-seo error', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
