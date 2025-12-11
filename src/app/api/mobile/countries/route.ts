import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const revalidate = 3600; // 1 hour cache

/**
 * GET /api/mobile/countries
 * 
 * Returns list of all active countries with basic info and visa requirements
 * 
 * Query params:
 * - search: Filter by country name (optional)
 * - visaStatus: Filter by visa status (optional) - visa-free, evisa, visa-required, visa-on-arrival
 * 
 * Response:
 * {
 *   success: boolean,
 *   data: Country[],
 *   count: number
 * }
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const visaStatusFilter = searchParams.get('visaStatus');

    // Get all active countries
    let query = supabase
      .from('countries')
      .select(`
        id,
        name,
        country_code,
        image_url,
        process_time,
        visa_required
      `)
      .eq('status', 1)
      .order('sorted', { ascending: true });

    // Apply search filter
    if (search) {
      query = query.ilike('name', `%${search}%`);
    }

    const { data: countries, error } = await query;

    if (error) {
      console.error('API: getCountries error', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch countries' },
        { status: 500 }
      );
    }

    // Get taxonomy slugs for all countries
    const countryIds = countries?.map(c => c.id) || [];
    
    const { data: taxonomies } = await supabase
      .from('taxonomies')
      .select('model_id, slug')
      .in('model_id', countryIds)
      .eq('type', 'Country\\CountryController@detail');

    const taxonomyMap = new Map<number, string>();
    taxonomies?.forEach(tax => {
      taxonomyMap.set(tax.model_id, tax.slug);
    });

    // Get visa requirements for Turkish citizens
    const { data: visaReqs } = await supabase
      .from('visa_requirements')
      .select('country_id, visa_status, allowed_stay')
      .eq('passport_country', 'TR');

    const visaReqMap = new Map<number, any>();
    visaReqs?.forEach(req => {
      visaReqMap.set(req.country_id, req);
    });

    // Format response
    let formattedCountries = countries?.map(country => {
      const visaReq = visaReqMap.get(country.id);
      
      return {
        id: country.id,
        name: country.name,
        slug: taxonomyMap.get(country.id) || `country-${country.id}`,
        countryCode: country.country_code,
        imageUrl: country.image_url,
        processTime: country.process_time,
        visaRequired: country.visa_required,
        visaStatus: visaReq?.visa_status || null,
        allowedStay: visaReq?.allowed_stay || null,
      };
    }) || [];

    // Apply visa status filter
    if (visaStatusFilter) {
      formattedCountries = formattedCountries.filter(
        c => c.visaStatus === visaStatusFilter
      );
    }

    return NextResponse.json({
      success: true,
      data: formattedCountries,
      count: formattedCountries.length,
    }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  } catch (error) {
    console.error('API: countries error', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Handle CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
