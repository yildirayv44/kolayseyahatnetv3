import { NextRequest, NextResponse } from 'next/server';
import { getCountriesBySource } from '@/lib/queries';

export const revalidate = 3600; // 1 hour cache

/**
 * GET /api/mobile/v2/countries?source=TKM
 * 
 * Get all destination countries with visa requirements from a source country
 * 
 * Query Parameters:
 * - source: Source country code (ISO 3166-1 alpha-3, default: TUR)
 * - search: Search query (optional)
 * - visaStatus: Filter by visa status (optional)
 * 
 * Response:
 * {
 *   success: boolean,
 *   source_country: string,
 *   data: Array<Country>,
 *   count: number,
 *   statistics: {
 *     visa_free: number,
 *     visa_on_arrival: number,
 *     eta: number,
 *     visa_required: number,
 *     total: number
 *   }
 * }
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sourceCode = searchParams.get('source') || 'TUR';
    const search = searchParams.get('search');
    const visaStatusFilter = searchParams.get('visaStatus');

    // Get countries by source
    let countries = await getCountriesBySource(sourceCode);

    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase();
      countries = countries.filter(c => 
        c.name.toLowerCase().includes(searchLower) ||
        c.country_code?.toLowerCase().includes(searchLower)
      );
    }

    // Apply visa status filter
    if (visaStatusFilter) {
      countries = countries.filter(c => c.visa_status === visaStatusFilter);
    }

    // Calculate statistics
    const stats = {
      visa_free: countries.filter(c => c.visa_status === 'visa-free').length,
      visa_on_arrival: countries.filter(c => c.visa_status === 'visa-on-arrival').length,
      eta: countries.filter(c => c.visa_status === 'eta').length,
      visa_required: countries.filter(c => c.visa_status === 'visa-required' || c.visa_status === 'evisa').length,
      total: countries.length,
    };

    // Format response
    const formattedCountries = countries.map(country => ({
      id: country.id,
      name: country.name,
      slug: country.slug,
      country_code: country.country_code,
      image_url: country.image_url,
      visa_status: country.visa_status,
      visa_required: country.visa_required,
      allowed_stay: country.allowed_stay,
      available_methods: country.available_methods,
      conditions: country.conditions,
      packages: country.packages,
      has_packages: country.packages.length > 0,
      price: country.price,
      currency_id: country.currency_id,
    }));

    return NextResponse.json({
      success: true,
      source_country: sourceCode,
      data: formattedCountries,
      count: formattedCountries.length,
      statistics: stats,
    }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
  } catch (error) {
    console.error('API: /api/mobile/v2/countries error', error);
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
