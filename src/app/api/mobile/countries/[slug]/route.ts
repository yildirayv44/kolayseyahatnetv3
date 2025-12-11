import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const revalidate = 3600; // 1 hour cache

// Normalize visa type to standard format
function normalizeVisaType(visaType: string | null): string {
  if (!visaType) return 'unknown';
  const lower = visaType.toLowerCase().trim();
  if (lower.includes('vizesiz') || lower === 'visa-free') return 'visa-free';
  if (lower.includes('e-vize') || lower.includes('evize') || lower === 'eta') return 'evisa';
  if (lower.includes('kapıda') || lower.includes('on-arrival')) return 'visa-on-arrival';
  if (lower.includes('schengen')) return 'schengen';
  return 'visa-required';
}

/**
 * GET /api/mobile/countries/[slug]
 * 
 * Returns detailed country information including:
 * - Country details (name, capital, currency, language, timezone)
 * - Visa requirements (status, stay duration, application method)
 * - Available packages with pricing
 * - Required documents
 * - Application steps
 * - Important notes
 * - Health requirements
 * - Customs regulations
 * - Emergency contacts
 * - Popular cities
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

    // Get country details with ALL fields
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

    // Format response with ALL available data
    const response = {
      // Basic Info
      id: country.id,
      name: country.name,
      slug: slug,
      countryCode: country.country_code,
      imageUrl: country.image_url,
      title: country.title,
      description: country.description,
      
      // Country Info
      countryInfo: {
        capital: country.capital,
        currency: country.currency,
        language: country.language,
        timezone: country.timezone,
      },
      
      // Visa Info
      visaInfo: {
        visaRequired: country.visa_required,
        visaType: country.visa_type,
        visaStatus: normalizeVisaType(country.visa_type),
        processTime: country.process_time,
        maxStayDuration: country.max_stay_duration,
        visaFee: country.visa_fee,
        applicationMethod: country.visa_type === 'Vizesiz' ? 'not-required' : 
                          country.visa_type?.includes('E-') ? 'online' : 'embassy',
      },
      
      // Documents & Steps
      requiredDocuments: country.required_documents || [],
      applicationSteps: country.application_steps || [],
      
      // Notes & Tips
      importantNotes: country.important_notes || [],
      travelTips: country.travel_tips || [],
      
      // Health & Customs
      healthRequirements: country.health_requirements,
      customsRegulations: country.customs_regulations,
      
      // Emergency Info
      emergencyContacts: country.emergency_contacts || {},
      
      // Popular Cities
      popularCities: country.popular_cities || [],
      
      // Best Time to Visit
      bestTimeToVisit: country.best_time_to_visit,
      
      // Why Kolay Seyahat
      whyKolaySeyahat: country.why_kolay_seyahat,
      
      // Packages
      packages: formattedPackages,
      hasPackages: formattedPackages.length > 0,
      
      // Pricing (if available)
      pricing: country.price ? {
        price: country.price,
        originalPrice: country.original_price,
        discountPercentage: country.discount_percentage,
      } : null,
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
