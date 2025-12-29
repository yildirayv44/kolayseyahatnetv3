import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const revalidate = 3600; // 1 hour cache

/**
 * GET /api/countries/code/[code]
 * 
 * Get country by 3-letter ISO code (ISO 3166-1 alpha-3)
 * Designed for WhatsApp AI and external integrations
 * 
 * Example: /api/countries/code/KOR (Güney Kore)
 * 
 * Response:
 * {
 *   success: boolean,
 *   data: Country with products and requirements
 * }
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;

    if (!code || code.length !== 3) {
      return NextResponse.json(
        { success: false, error: 'Valid 3-letter country code is required (e.g., KOR, JPN, USA)' },
        { status: 400 }
      );
    }

    // Normalize code to uppercase
    const countryCode = code.toUpperCase();

    // Get country by code (not country_code - column name is 'code')
    const { data: country, error: countryError } = await supabase
      .from('countries')
      .select('*')
      .eq('code', countryCode)
      .eq('active', true)
      .maybeSingle();

    if (countryError) {
      console.error('API: getCountryByCode error', countryError);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch country' },
        { status: 500 }
      );
    }

    if (!country) {
      return NextResponse.json(
        { success: false, error: `Country not found with code: ${countryCode}` },
        { status: 404 }
      );
    }

    // Get taxonomy slug
    const { data: taxonomy } = await supabase
      .from('taxonomies')
      .select('slug')
      .eq('model_id', country.id)
      .eq('type', 'Country\\CountryController@detail')
      .maybeSingle();

    const slug = taxonomy?.slug || `country-${country.id}`;

    // Get visa requirements (using code, not country_code)
    const { data: visaReqs } = await supabase
      .from('visa_requirements')
      .select('visa_status, allowed_stay, conditions, notes, application_method, available_methods')
      .eq('country_code', countryCode)
      .maybeSingle();

    // Get products for this country
    const { data: products } = await supabase
      .from('products')
      .select('id, name, price, currency_id, description, requirements, process_time')
      .eq('country_id', country.id)
      .eq('active', true)
      .order('price', { ascending: true });

    // Format products
    const formattedProducts = products?.map(product => ({
      id: product.id,
      name: product.name,
      price: product.price,
      currency_id: product.currency_id,
      description: product.description || null,
      requirements: product.requirements || [],
      process_time: product.process_time || null,
    })) || [];

    // Format response
    const response = {
      id: country.id,
      name: country.name,
      slug: slug,
      country_code: country.code, // Use 'code' column, not 'country_code'
      visa_status: visaReqs?.visa_status || 'unknown',
      visa_info: country.short_description || null,
      allowed_stay: visaReqs?.allowed_stay || null,
      conditions: visaReqs?.conditions || null,
      notes: visaReqs?.notes || null,
      application_method: visaReqs?.application_method || null,
      available_methods: visaReqs?.available_methods || [],
      image_url: country.featured_image_url || null,
      products: formattedProducts,
      // Lowest price for quick reference
      starting_price: formattedProducts.length > 0 ? formattedProducts[0].price : null,
      currency_id: formattedProducts.length > 0 ? formattedProducts[0].currency_id : 1,
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
    console.error('API: /api/countries/code/[code] error', error);
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
