import { NextResponse } from 'next/server';
import { getSourceCountries } from '@/lib/queries';

export const revalidate = 3600; // 1 hour cache

/**
 * GET /api/mobile/v2/source-countries
 * 
 * Returns list of countries that can be selected as source (passport holder) countries
 * Only countries with is_source_country = true are returned
 * 
 * Response:
 * {
 *   success: boolean,
 *   data: Array<{
 *     id: number,
 *     name: string,
 *     country_code: string,
 *     flag_emoji: string,
 *     passport_rank: number,
 *     passport_power_score: number,
 *     region: string
 *   }>,
 *   count: number
 * }
 */
export async function GET() {
  try {
    const countries = await getSourceCountries();

    return NextResponse.json({
      success: true,
      data: countries,
      count: countries.length,
    }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
  } catch (error) {
    console.error('API: /api/mobile/v2/source-countries error', error);
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
