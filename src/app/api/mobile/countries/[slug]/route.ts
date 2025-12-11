import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const revalidate = 3600; // 1 hour cache

/**
 * GET /api/mobile/countries/[slug]
 * 
 * Returns detailed country information including:
 * - Country details
 * - Visa requirements
 * - Available packages with pricing
 * - Required documents
 * 
 * Response:
 * {
 *   success: boolean,
 *   data: CountryDetail
 * }
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    // Get taxonomy to find country ID
    const { data: taxonomy } = await supabase
      .from('taxonomies')
      .select('model_id, slug')
      .eq('slug', slug)
      .eq('type', 'Country\\CountryController@detail')
      .maybeSingle();

    if (!taxonomy) {
      return NextResponse.json(
        { success: false, error: 'Country not found' },
        { status: 404 }
      );
    }

    const countryId = taxonomy.model_id;

    // Get country details
    const { data: country, error: countryError } = await supabase
      .from('countries')
      .select('*')
      .eq('id', countryId)
      .eq('status', 1)
      .maybeSingle();

    if (countryError || !country) {
      return NextResponse.json(
        { success: false, error: 'Country not found' },
        { status: 404 }
      );
    }

    // Get visa requirements for Turkish citizens
    const { data: visaReq } = await supabase
      .from('visa_requirements')
      .select('*')
      .eq('country_id', countryId)
      .eq('passport_country', 'TR')
      .maybeSingle();

    // Get products/packages for this country
    const { data: products } = await supabase
      .from('products')
      .select(`
        id,
        name,
        description,
        price,
        currency_id,
        features
      `)
      .eq('country_id', countryId)
      .eq('status', 1)
      .order('sorted', { ascending: true });

    // Get currency symbols
    const currencyMap: Record<number, string> = {
      1: 'TRY',
      2: 'USD',
      3: 'EUR',
    };

    // Format packages
    const formattedPackages = products?.map(product => ({
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      currency: currencyMap[product.currency_id] || 'TRY',
      features: product.features || [],
    })) || [];

    // Get required documents
    const requiredDocs = country.required_documents || [];

    // Format response
    const response = {
      id: country.id,
      name: country.name,
      slug: slug,
      countryCode: country.country_code,
      imageUrl: country.image_url,
      title: country.title,
      description: country.description,
      processTime: country.process_time,
      visaRequired: country.visa_required,
      visaRequirement: visaReq ? {
        visaStatus: visaReq.visa_status,
        allowedStay: visaReq.allowed_stay,
        conditions: visaReq.conditions,
        applicationMethod: visaReq.application_method,
        notes: visaReq.notes,
        availableMethods: visaReq.available_methods || [],
      } : null,
      packages: formattedPackages,
      requiredDocuments: requiredDocs,
      hasPackages: formattedPackages.length > 0,
    };

    return NextResponse.json({
      success: true,
      data: response,
    }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  } catch (error) {
    console.error('API: country detail error', error);
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
