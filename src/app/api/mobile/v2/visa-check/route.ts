import { NextRequest, NextResponse } from 'next/server';
import { getVisaRequirement, getCountryProductsBySource } from '@/lib/queries';
import { supabase } from '@/lib/supabase';

export const revalidate = 3600; // 1 hour cache

/**
 * GET /api/mobile/v2/visa-check?source=TKM&destination=USA
 * 
 * Check visa requirements between two countries
 * 
 * Query Parameters:
 * - source: Source country code (ISO 3166-1 alpha-3, e.g., TKM, DEU, IND)
 * - destination: Destination country code (ISO 3166-1 alpha-3, e.g., USA, GBR, JPN)
 * 
 * Response:
 * {
 *   success: boolean,
 *   data: {
 *     source: { code, name, flag_emoji },
 *     destination: { code, name, flag_emoji },
 *     visa_status: string,
 *     allowed_stay: string | null,
 *     conditions: string | null,
 *     visa_cost: string | null,
 *     processing_time: string | null,
 *     application_method: string | null,
 *     application_url: string | null,
 *     packages: Array<Package> | [],
 *     has_packages: boolean
 *   }
 * }
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sourceCode = searchParams.get('source');
    const destinationCode = searchParams.get('destination');

    if (!sourceCode || !destinationCode) {
      return NextResponse.json(
        { success: false, error: 'Both source and destination parameters are required' },
        { status: 400 }
      );
    }

    // Get source country info
    const { data: sourceCountry } = await supabase
      .from('countries')
      .select('id, name, country_code, flag_emoji')
      .eq('country_code', sourceCode)
      .eq('status', 1)
      .maybeSingle();

    if (!sourceCountry) {
      return NextResponse.json(
        { success: false, error: 'Source country not found' },
        { status: 404 }
      );
    }

    // Get destination country info
    const { data: destinationCountry } = await supabase
      .from('countries')
      .select('id, name, country_code, flag_emoji')
      .eq('country_code', destinationCode)
      .eq('status', 1)
      .maybeSingle();

    if (!destinationCountry) {
      return NextResponse.json(
        { success: false, error: 'Destination country not found' },
        { status: 404 }
      );
    }

    // Get visa requirement
    const visaReq = await getVisaRequirement(sourceCode, destinationCode);

    // Get packages if available
    const packages = await getCountryProductsBySource(
      destinationCountry.id,
      sourceCode
    );

    const response = {
      source: {
        code: sourceCountry.country_code,
        name: sourceCountry.name,
        flag_emoji: sourceCountry.flag_emoji,
      },
      destination: {
        code: destinationCountry.country_code,
        name: destinationCountry.name,
        flag_emoji: destinationCountry.flag_emoji,
      },
      visa_status: visaReq?.visa_status || 'unknown',
      allowed_stay: visaReq?.allowed_stay || null,
      conditions: visaReq?.conditions || null,
      visa_cost: visaReq?.visa_cost || null,
      processing_time: visaReq?.processing_time || null,
      application_method: visaReq?.application_method || null,
      application_url: visaReq?.application_url || null,
      packages: packages.map(p => ({
        id: p.id,
        name: p.name,
        price: p.price,
        currency_id: p.currency_id,
        description: p.description,
        requirements: p.requirements,
        process_time: p.process_time,
      })),
      has_packages: packages.length > 0,
    };

    return NextResponse.json({
      success: true,
      data: response,
    }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
  } catch (error) {
    console.error('API: /api/mobile/v2/visa-check error', error);
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
