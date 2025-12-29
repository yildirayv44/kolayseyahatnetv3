import { NextResponse } from 'next/server';
import { getCountryBySlug, getCountryProducts } from '@/lib/queries';

export const revalidate = 3600; // 1 hour cache

/**
 * GET /api/countries/[slug]
 * 
 * Simple endpoint for WhatsApp AI and external integrations
 * Returns detailed country information with visa requirements and products
 * 
 * Response:
 * {
 *   success: boolean,
 *   data: Country with products and requirements
 * }
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    if (!slug) {
      return NextResponse.json(
        { success: false, error: 'Slug parameter is required' },
        { status: 400 }
      );
    }

    // Get country by slug
    const country = await getCountryBySlug(slug);

    if (!country) {
      return NextResponse.json(
        { success: false, error: 'Country not found' },
        { status: 404 }
      );
    }

    // Get products for this country
    const products = await getCountryProducts(country.id);

    // Format products with requirements
    const formattedProducts = products.map(product => ({
      id: product.id,
      name: product.name,
      price: product.price,
      currency_id: product.currency_id,
      description: product.description || null,
      requirements: product.requirements || [],
      process_time: product.process_time || null,
    }));

    // Format response for WhatsApp AI
    const response = {
      id: country.id,
      name: country.name,
      slug: slug,
      country_code: country.country_code,
      visa_status: country.visa_status || 'unknown',
      visa_info: country.visa_info || null,
      allowed_stay: country.allowed_stay || null,
      conditions: country.conditions || null,
      notes: country.notes || null,
      application_method: country.application_method || null,
      available_methods: country.available_methods || [],
      image_url: country.image_url || null,
      products: formattedProducts,
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
    console.error('API: /api/countries/[slug] error', error);
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
