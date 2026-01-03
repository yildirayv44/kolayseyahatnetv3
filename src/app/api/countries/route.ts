import { NextResponse } from 'next/server';
import { getCountries } from '@/lib/queries';

export const revalidate = 3600; // 1 hour cache

/**
 * GET /api/countries
 * 
 * Simple endpoint for WhatsApp AI and external integrations
 * Returns list of all active countries with visa requirements
 * 
 * Response:
 * {
 *   success: boolean,
 *   data: Country[],
 *   count: number
 * }
 */
export async function GET() {
  try {
    const countries = await getCountries();

    if (!countries || countries.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No countries found' },
        { status: 404 }
      );
    }

    // Format for WhatsApp AI and Widget
    const formattedCountries = countries.map(country => ({
      id: country.id,
      name: country.name,
      slug: country.slug,
      country_code: country.country_code, // ISO 3166-1 alpha-3 (e.g., KOR, JPN, USA)
      visa_status: country.visa_status || 'unknown',
      visa_info: country.visa_info || null,
      visa_labels: country.visa_labels || [],
      visa_required: country.visa_required || false,
      price: country.price || null,
      currency_id: country.currency_id || 1,
      packages: country.packages || [],
      image_url: country.image_url || null,
      // Add URL for easy access
      detail_url: `https://www.kolayseyahat.net/${country.slug}`,
      api_url: `https://www.kolayseyahat.net/api/countries/code/${country.country_code}`,
    }));

    return NextResponse.json({
      success: true,
      data: formattedCountries,
      count: formattedCountries.length,
    }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
  } catch (error) {
    console.error('API: /api/countries error', error);
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
