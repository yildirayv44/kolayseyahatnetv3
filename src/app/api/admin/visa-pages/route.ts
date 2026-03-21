import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

/**
 * GET /api/admin/visa-pages
 * List all bilateral visa pages with filters
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sourceCountry = searchParams.get('source');
    const destinationCountry = searchParams.get('destination');
    const status = searchParams.get('status');
    const locale = searchParams.get('locale');
    const search = searchParams.get('search');

    let query = supabase
      .from('visa_pages_seo')
      .select('*')
      .order('created_at', { ascending: false });

    if (sourceCountry) {
      query = query.eq('source_country_code', sourceCountry);
    }

    if (destinationCountry) {
      query = query.eq('destination_country_code', destinationCountry);
    }

    if (status) {
      query = query.eq('content_status', status);
    }

    if (locale) {
      query = query.eq('locale', locale);
    }

    if (search) {
      query = query.or(`slug.ilike.%${search}%,meta_title.ilike.%${search}%`);
    }

    const { data: visaPages, error } = await query;

    if (error) throw error;

    // Manually fetch country data for all pages
    if (visaPages && visaPages.length > 0) {
      const countryCodes = new Set<string>();
      visaPages.forEach(page => {
        countryCodes.add(page.source_country_code);
        countryCodes.add(page.destination_country_code);
      });

      const { data: countries } = await supabase
        .from('countries')
        .select('name, country_code, flag_emoji')
        .in('country_code', Array.from(countryCodes));

      const countryMap = new Map(countries?.map(c => [c.country_code, c]) || []);

      const enrichedData = visaPages.map(page => ({
        ...page,
        source_country: countryMap.get(page.source_country_code),
        destination_country: countryMap.get(page.destination_country_code)
      }));

      return NextResponse.json({
        success: true,
        data: enrichedData,
        count: enrichedData.length
      });
    }

    return NextResponse.json({
      success: true,
      data: [],
      count: 0
    });
  } catch (error: any) {
    console.error('Get visa pages error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch visa pages' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/visa-pages
 * Create a new bilateral visa page
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      source_country_code,
      destination_country_code,
      locale = 'tr',
      meta_title,
      meta_description,
      h1_title,
      intro_text,
      requirements_section,
      process_section,
      faq_json,
      custom_content,
      use_custom_content = false,
      content_status = 'pending'
    } = body;

    if (!source_country_code || !destination_country_code) {
      return NextResponse.json(
        { success: false, error: 'Source and destination country codes are required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('visa_pages_seo')
      .insert({
        source_country_code,
        destination_country_code,
        locale,
        meta_title,
        meta_description,
        h1_title,
        intro_text,
        requirements_section,
        process_section,
        faq_json,
        custom_content,
        use_custom_content,
        content_status
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      data,
      message: 'Visa page created successfully'
    });
  } catch (error: any) {
    console.error('Create visa page error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create visa page' },
      { status: 500 }
    );
  }
}
