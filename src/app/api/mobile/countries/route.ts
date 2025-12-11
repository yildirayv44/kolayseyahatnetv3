import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const revalidate = 3600; // 1 hour cache

// Continent mapping based on country codes
const CONTINENT_MAP: Record<string, { name: string; nameEn: string }> = {
  // Avrupa
  'ALB': { name: 'Avrupa', nameEn: 'Europe' },
  'AND': { name: 'Avrupa', nameEn: 'Europe' },
  'AUT': { name: 'Avrupa', nameEn: 'Europe' },
  'BLR': { name: 'Avrupa', nameEn: 'Europe' },
  'BEL': { name: 'Avrupa', nameEn: 'Europe' },
  'BIH': { name: 'Avrupa', nameEn: 'Europe' },
  'BGR': { name: 'Avrupa', nameEn: 'Europe' },
  'HRV': { name: 'Avrupa', nameEn: 'Europe' },
  'CYP': { name: 'Avrupa', nameEn: 'Europe' },
  'CZE': { name: 'Avrupa', nameEn: 'Europe' },
  'DNK': { name: 'Avrupa', nameEn: 'Europe' },
  'EST': { name: 'Avrupa', nameEn: 'Europe' },
  'FIN': { name: 'Avrupa', nameEn: 'Europe' },
  'FRA': { name: 'Avrupa', nameEn: 'Europe' },
  'DEU': { name: 'Avrupa', nameEn: 'Europe' },
  'GRC': { name: 'Avrupa', nameEn: 'Europe' },
  'HUN': { name: 'Avrupa', nameEn: 'Europe' },
  'ISL': { name: 'Avrupa', nameEn: 'Europe' },
  'IRL': { name: 'Avrupa', nameEn: 'Europe' },
  'ITA': { name: 'Avrupa', nameEn: 'Europe' },
  'LVA': { name: 'Avrupa', nameEn: 'Europe' },
  'LIE': { name: 'Avrupa', nameEn: 'Europe' },
  'LTU': { name: 'Avrupa', nameEn: 'Europe' },
  'LUX': { name: 'Avrupa', nameEn: 'Europe' },
  'MLT': { name: 'Avrupa', nameEn: 'Europe' },
  'MDA': { name: 'Avrupa', nameEn: 'Europe' },
  'MCO': { name: 'Avrupa', nameEn: 'Europe' },
  'MNE': { name: 'Avrupa', nameEn: 'Europe' },
  'NLD': { name: 'Avrupa', nameEn: 'Europe' },
  'MKD': { name: 'Avrupa', nameEn: 'Europe' },
  'NOR': { name: 'Avrupa', nameEn: 'Europe' },
  'POL': { name: 'Avrupa', nameEn: 'Europe' },
  'PRT': { name: 'Avrupa', nameEn: 'Europe' },
  'ROU': { name: 'Avrupa', nameEn: 'Europe' },
  'RUS': { name: 'Avrupa', nameEn: 'Europe' },
  'SMR': { name: 'Avrupa', nameEn: 'Europe' },
  'SRB': { name: 'Avrupa', nameEn: 'Europe' },
  'SVK': { name: 'Avrupa', nameEn: 'Europe' },
  'SVN': { name: 'Avrupa', nameEn: 'Europe' },
  'ESP': { name: 'Avrupa', nameEn: 'Europe' },
  'SWE': { name: 'Avrupa', nameEn: 'Europe' },
  'CHE': { name: 'Avrupa', nameEn: 'Europe' },
  'UKR': { name: 'Avrupa', nameEn: 'Europe' },
  'GBR': { name: 'Avrupa', nameEn: 'Europe' },
  'VAT': { name: 'Avrupa', nameEn: 'Europe' },
  'GEO': { name: 'Avrupa', nameEn: 'Europe' },
  'ARM': { name: 'Avrupa', nameEn: 'Europe' },
  'AZE': { name: 'Avrupa', nameEn: 'Europe' },
  // Asya
  'AFG': { name: 'Asya', nameEn: 'Asia' },
  'BHR': { name: 'Orta Doğu', nameEn: 'Middle East' },
  'BGD': { name: 'Asya', nameEn: 'Asia' },
  'BTN': { name: 'Asya', nameEn: 'Asia' },
  'BRN': { name: 'Asya', nameEn: 'Asia' },
  'KHM': { name: 'Asya', nameEn: 'Asia' },
  'CHN': { name: 'Asya', nameEn: 'Asia' },
  'IND': { name: 'Asya', nameEn: 'Asia' },
  'IDN': { name: 'Asya', nameEn: 'Asia' },
  'IRN': { name: 'Orta Doğu', nameEn: 'Middle East' },
  'IRQ': { name: 'Orta Doğu', nameEn: 'Middle East' },
  'ISR': { name: 'Orta Doğu', nameEn: 'Middle East' },
  'JPN': { name: 'Asya', nameEn: 'Asia' },
  'JOR': { name: 'Orta Doğu', nameEn: 'Middle East' },
  'KAZ': { name: 'Asya', nameEn: 'Asia' },
  'KWT': { name: 'Orta Doğu', nameEn: 'Middle East' },
  'KGZ': { name: 'Asya', nameEn: 'Asia' },
  'LAO': { name: 'Asya', nameEn: 'Asia' },
  'LBN': { name: 'Orta Doğu', nameEn: 'Middle East' },
  'MYS': { name: 'Asya', nameEn: 'Asia' },
  'MDV': { name: 'Asya', nameEn: 'Asia' },
  'MNG': { name: 'Asya', nameEn: 'Asia' },
  'MMR': { name: 'Asya', nameEn: 'Asia' },
  'NPL': { name: 'Asya', nameEn: 'Asia' },
  'PRK': { name: 'Asya', nameEn: 'Asia' },
  'OMN': { name: 'Orta Doğu', nameEn: 'Middle East' },
  'PAK': { name: 'Asya', nameEn: 'Asia' },
  'PHL': { name: 'Asya', nameEn: 'Asia' },
  'QAT': { name: 'Orta Doğu', nameEn: 'Middle East' },
  'SAU': { name: 'Orta Doğu', nameEn: 'Middle East' },
  'SGP': { name: 'Asya', nameEn: 'Asia' },
  'KOR': { name: 'Asya', nameEn: 'Asia' },
  'LKA': { name: 'Asya', nameEn: 'Asia' },
  'SYR': { name: 'Orta Doğu', nameEn: 'Middle East' },
  'TWN': { name: 'Asya', nameEn: 'Asia' },
  'TJK': { name: 'Asya', nameEn: 'Asia' },
  'THA': { name: 'Asya', nameEn: 'Asia' },
  'TLS': { name: 'Asya', nameEn: 'Asia' },
  'TKM': { name: 'Asya', nameEn: 'Asia' },
  'ARE': { name: 'Orta Doğu', nameEn: 'Middle East' },
  'UZB': { name: 'Asya', nameEn: 'Asia' },
  'VNM': { name: 'Asya', nameEn: 'Asia' },
  'YEM': { name: 'Orta Doğu', nameEn: 'Middle East' },
  // Kuzey Amerika
  'CAN': { name: 'Kuzey Amerika', nameEn: 'North America' },
  'USA': { name: 'Kuzey Amerika', nameEn: 'North America' },
  'MEX': { name: 'Kuzey Amerika', nameEn: 'North America' },
  'CUB': { name: 'Kuzey Amerika', nameEn: 'North America' },
  'DOM': { name: 'Kuzey Amerika', nameEn: 'North America' },
  'GTM': { name: 'Kuzey Amerika', nameEn: 'North America' },
  'HND': { name: 'Kuzey Amerika', nameEn: 'North America' },
  'JAM': { name: 'Kuzey Amerika', nameEn: 'North America' },
  'PAN': { name: 'Kuzey Amerika', nameEn: 'North America' },
  'CRI': { name: 'Kuzey Amerika', nameEn: 'North America' },
  // Güney Amerika
  'ARG': { name: 'Güney Amerika', nameEn: 'South America' },
  'BOL': { name: 'Güney Amerika', nameEn: 'South America' },
  'BRA': { name: 'Güney Amerika', nameEn: 'South America' },
  'CHL': { name: 'Güney Amerika', nameEn: 'South America' },
  'COL': { name: 'Güney Amerika', nameEn: 'South America' },
  'ECU': { name: 'Güney Amerika', nameEn: 'South America' },
  'GUY': { name: 'Güney Amerika', nameEn: 'South America' },
  'PRY': { name: 'Güney Amerika', nameEn: 'South America' },
  'PER': { name: 'Güney Amerika', nameEn: 'South America' },
  'SUR': { name: 'Güney Amerika', nameEn: 'South America' },
  'URY': { name: 'Güney Amerika', nameEn: 'South America' },
  'VEN': { name: 'Güney Amerika', nameEn: 'South America' },
  // Afrika
  'DZA': { name: 'Afrika', nameEn: 'Africa' },
  'AGO': { name: 'Afrika', nameEn: 'Africa' },
  'BEN': { name: 'Afrika', nameEn: 'Africa' },
  'BWA': { name: 'Afrika', nameEn: 'Africa' },
  'BFA': { name: 'Afrika', nameEn: 'Africa' },
  'BDI': { name: 'Afrika', nameEn: 'Africa' },
  'CMR': { name: 'Afrika', nameEn: 'Africa' },
  'CPV': { name: 'Afrika', nameEn: 'Africa' },
  'CAF': { name: 'Afrika', nameEn: 'Africa' },
  'TCD': { name: 'Afrika', nameEn: 'Africa' },
  'COM': { name: 'Afrika', nameEn: 'Africa' },
  'COD': { name: 'Afrika', nameEn: 'Africa' },
  'COG': { name: 'Afrika', nameEn: 'Africa' },
  'CIV': { name: 'Afrika', nameEn: 'Africa' },
  'DJI': { name: 'Afrika', nameEn: 'Africa' },
  'EGY': { name: 'Afrika', nameEn: 'Africa' },
  'GNQ': { name: 'Afrika', nameEn: 'Africa' },
  'ERI': { name: 'Afrika', nameEn: 'Africa' },
  'SWZ': { name: 'Afrika', nameEn: 'Africa' },
  'ETH': { name: 'Afrika', nameEn: 'Africa' },
  'GAB': { name: 'Afrika', nameEn: 'Africa' },
  'GMB': { name: 'Afrika', nameEn: 'Africa' },
  'GHA': { name: 'Afrika', nameEn: 'Africa' },
  'GIN': { name: 'Afrika', nameEn: 'Africa' },
  'GNB': { name: 'Afrika', nameEn: 'Africa' },
  'KEN': { name: 'Afrika', nameEn: 'Africa' },
  'LSO': { name: 'Afrika', nameEn: 'Africa' },
  'LBR': { name: 'Afrika', nameEn: 'Africa' },
  'LBY': { name: 'Afrika', nameEn: 'Africa' },
  'MDG': { name: 'Afrika', nameEn: 'Africa' },
  'MWI': { name: 'Afrika', nameEn: 'Africa' },
  'MLI': { name: 'Afrika', nameEn: 'Africa' },
  'MRT': { name: 'Afrika', nameEn: 'Africa' },
  'MUS': { name: 'Afrika', nameEn: 'Africa' },
  'MAR': { name: 'Afrika', nameEn: 'Africa' },
  'MOZ': { name: 'Afrika', nameEn: 'Africa' },
  'NAM': { name: 'Afrika', nameEn: 'Africa' },
  'NER': { name: 'Afrika', nameEn: 'Africa' },
  'NGA': { name: 'Afrika', nameEn: 'Africa' },
  'RWA': { name: 'Afrika', nameEn: 'Africa' },
  'STP': { name: 'Afrika', nameEn: 'Africa' },
  'SEN': { name: 'Afrika', nameEn: 'Africa' },
  'SYC': { name: 'Afrika', nameEn: 'Africa' },
  'SLE': { name: 'Afrika', nameEn: 'Africa' },
  'SOM': { name: 'Afrika', nameEn: 'Africa' },
  'ZAF': { name: 'Afrika', nameEn: 'Africa' },
  'SSD': { name: 'Afrika', nameEn: 'Africa' },
  'SDN': { name: 'Afrika', nameEn: 'Africa' },
  'TZA': { name: 'Afrika', nameEn: 'Africa' },
  'TGO': { name: 'Afrika', nameEn: 'Africa' },
  'TUN': { name: 'Afrika', nameEn: 'Africa' },
  'UGA': { name: 'Afrika', nameEn: 'Africa' },
  'ZMB': { name: 'Afrika', nameEn: 'Africa' },
  'ZWE': { name: 'Afrika', nameEn: 'Africa' },
  // Okyanusya
  'AUS': { name: 'Okyanusya', nameEn: 'Oceania' },
  'FJI': { name: 'Okyanusya', nameEn: 'Oceania' },
  'NZL': { name: 'Okyanusya', nameEn: 'Oceania' },
  'PNG': { name: 'Okyanusya', nameEn: 'Oceania' },
  'WSM': { name: 'Okyanusya', nameEn: 'Oceania' },
  'SLB': { name: 'Okyanusya', nameEn: 'Oceania' },
  'TON': { name: 'Okyanusya', nameEn: 'Oceania' },
  'VUT': { name: 'Okyanusya', nameEn: 'Oceania' },
};

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
 * GET /api/mobile/countries
 * 
 * Returns list of all active countries with basic info and visa requirements
 * 
 * Query params:
 * - search: Filter by country name (optional)
 * - visaStatus: Filter by visa status (optional) - visa-free, evisa, visa-required, visa-on-arrival
 * - continent: Filter by continent (optional) - Avrupa, Asya, Afrika, etc.
 * 
 * Response:
 * {
 *   success: boolean,
 *   data: Country[],
 *   count: number,
 *   statistics: { visaFree, evisa, visaOnArrival, visaRequired, total }
 *   continents: [{ name, count }]
 * }
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const visaStatusFilter = searchParams.get('visaStatus');
    const continentFilter = searchParams.get('continent');

    // Get all active countries with more fields
    let query = supabase
      .from('countries')
      .select(`
        id,
        name,
        country_code,
        image_url,
        process_time,
        visa_required,
        visa_type,
        max_stay_duration
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

    // Statistics counters
    const stats = {
      visaFree: 0,
      evisa: 0,
      visaOnArrival: 0,
      visaRequired: 0,
      total: 0,
    };

    // Continent counters
    const continentCounts: Record<string, number> = {};

    // Format response
    let formattedCountries = countries?.map(country => {
      const normalizedVisaStatus = normalizeVisaType(country.visa_type);
      const continent = CONTINENT_MAP[country.country_code] || { name: 'Diğer', nameEn: 'Other' };
      
      // Update statistics
      stats.total++;
      if (normalizedVisaStatus === 'visa-free') stats.visaFree++;
      else if (normalizedVisaStatus === 'evisa') stats.evisa++;
      else if (normalizedVisaStatus === 'visa-on-arrival') stats.visaOnArrival++;
      else stats.visaRequired++;

      // Update continent counts
      continentCounts[continent.name] = (continentCounts[continent.name] || 0) + 1;
      
      return {
        id: country.id,
        name: country.name,
        slug: taxonomyMap.get(country.id) || `country-${country.id}`,
        countryCode: country.country_code,
        imageUrl: country.image_url,
        processTime: country.process_time,
        visaRequired: country.visa_required,
        visaType: country.visa_type,
        visaStatus: normalizedVisaStatus,
        maxStayDuration: country.max_stay_duration,
        continent: continent.name,
        continentEn: continent.nameEn,
      };
    }) || [];

    // Apply visa status filter
    if (visaStatusFilter) {
      formattedCountries = formattedCountries.filter(
        c => c.visaStatus === visaStatusFilter
      );
    }

    // Apply continent filter
    if (continentFilter) {
      formattedCountries = formattedCountries.filter(
        c => c.continent === continentFilter || c.continentEn === continentFilter
      );
    }

    // Format continents array
    const continents = Object.entries(continentCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    return NextResponse.json({
      success: true,
      data: formattedCountries,
      count: formattedCountries.length,
      statistics: stats,
      continents,
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
