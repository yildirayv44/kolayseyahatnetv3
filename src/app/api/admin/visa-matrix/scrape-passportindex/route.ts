import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Use service role key for admin operations to bypass RLS
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * POST /api/admin/visa-matrix/scrape-passportindex
 * 
 * Scrape visa requirements from PassportIndex for a specific source country
 * 
 * Body:
 * {
 *   sourceCountryCode: string (ISO 3166-1 alpha-3, e.g., TKM, DEU, IND)
 * }
 * 
 * Response:
 * {
 *   success: boolean,
 *   scraped: number,
 *   errors: Array<string>,
 *   sourceCountry: string
 * }
 */

interface PassportIndexData {
  countryCode: string;
  countryName: string;
  visaStatus: 'visa-free' | 'visa-on-arrival' | 'eta' | 'visa-required';
  allowedStay?: string;
  conditions?: string;
  visaCost?: string;
  processingTime?: string;
  applicationMethod?: 'online' | 'embassy' | 'on-arrival' | 'not-required';
}

// Country code to name mapping (will be expanded)
const COUNTRY_NAMES: Record<string, string> = {
  'AFG': 'Afganistan',
  'ALB': 'Arnavutluk',
  'DZA': 'Cezayir',
  'AND': 'Andorra',
  'AGO': 'Angola',
  'ATG': 'Antigua ve Barbuda',
  'ARG': 'Arjantin',
  'ARM': 'Ermenistan',
  'AUS': 'Avustralya',
  'AUT': 'Avusturya',
  'AZE': 'Azerbaycan',
  'BHS': 'Bahamalar',
  'BHR': 'Bahreyn',
  'BGD': 'Bangladeş',
  'BRB': 'Barbados',
  'BLR': 'Belarus',
  'BEL': 'Belçika',
  'BLZ': 'Belize',
  'BEN': 'Benin',
  'BTN': 'Bhutan',
  'BOL': 'Bolivya',
  'BIH': 'Bosna-Hersek',
  'BWA': 'Botsvana',
  'BRA': 'Brezilya',
  'BRN': 'Brunei',
  'BGR': 'Bulgaristan',
  'BFA': 'Burkina Faso',
  'BDI': 'Burundi',
  'KHM': 'Kamboçya',
  'CMR': 'Kamerun',
  'CAN': 'Kanada',
  'CPV': 'Cape Verde',
  'CAF': 'Orta Afrika Cumhuriyeti',
  'TCD': 'Çad',
  'CHL': 'Şili',
  'CHN': 'Çin',
  'COL': 'Kolombiya',
  'COM': 'Komorlar',
  'COG': 'Kongo',
  'COD': 'Kongo Demokratik Cumhuriyeti',
  'CRI': 'Kosta Rika',
  'CIV': 'Fildişi Sahili',
  'HRV': 'Hırvatistan',
  'CUB': 'Küba',
  'CYP': 'Kıbrıs',
  'CZE': 'Çekya',
  'DNK': 'Danimarka',
  'DJI': 'Cibuti',
  'DMA': 'Dominika',
  'DOM': 'Dominik Cumhuriyeti',
  'ECU': 'Ekvador',
  'EGY': 'Mısır',
  'SLV': 'El Salvador',
  'GNQ': 'Ekvator Ginesi',
  'ERI': 'Eritre',
  'EST': 'Estonya',
  'SWZ': 'Eswatini',
  'ETH': 'Etiyopya',
  'FJI': 'Fiji',
  'FIN': 'Finlandiya',
  'FRA': 'Fransa',
  'GAB': 'Gabon',
  'GMB': 'Gambiya',
  'GEO': 'Gürcistan',
  'DEU': 'Almanya',
  'GHA': 'Gana',
  'GRC': 'Yunanistan',
  'GRD': 'Grenada',
  'GTM': 'Guatemala',
  'GIN': 'Gine',
  'GNB': 'Gine-Bissau',
  'GUY': 'Guyana',
  'HTI': 'Haiti',
  'HND': 'Honduras',
  'HKG': 'Hong Kong',
  'HUN': 'Macaristan',
  'ISL': 'İzlanda',
  'IND': 'Hindistan',
  'IDN': 'Endonezya',
  'IRN': 'İran',
  'IRQ': 'Irak',
  'IRL': 'İrlanda',
  'ISR': 'İsrail',
  'ITA': 'İtalya',
  'JAM': 'Jamaika',
  'JPN': 'Japonya',
  'JOR': 'Ürdün',
  'KAZ': 'Kazakistan',
  'KEN': 'Kenya',
  'KIR': 'Kiribati',
  'XKX': 'Kosova',
  'KWT': 'Kuveyt',
  'KGZ': 'Kırgızistan',
  'LAO': 'Laos',
  'LVA': 'Letonya',
  'LBN': 'Lübnan',
  'LSO': 'Lesotho',
  'LBR': 'Liberya',
  'LBY': 'Libya',
  'LIE': 'Lihtenştayn',
  'LTU': 'Litvanya',
  'LUX': 'Lüksemburg',
  'MAC': 'Makao',
  'MDG': 'Madagaskar',
  'MWI': 'Malavi',
  'MYS': 'Malezya',
  'MDV': 'Maldivler',
  'MLI': 'Mali',
  'MLT': 'Malta',
  'MHL': 'Marshall Adaları',
  'MRT': 'Moritanya',
  'MUS': 'Mauritius',
  'MEX': 'Meksika',
  'FSM': 'Mikronezya',
  'MDA': 'Moldova',
  'MCO': 'Monako',
  'MNG': 'Moğolistan',
  'MNE': 'Karadağ',
  'MAR': 'Fas',
  'MOZ': 'Mozambik',
  'MMR': 'Myanmar',
  'NAM': 'Namibya',
  'NRU': 'Nauru',
  'NPL': 'Nepal',
  'NLD': 'Hollanda',
  'NZL': 'Yeni Zelanda',
  'NIC': 'Nikaragua',
  'NER': 'Nijer',
  'NGA': 'Nijerya',
  'PRK': 'Kuzey Kore',
  'MKD': 'Kuzey Makedonya',
  'NOR': 'Norveç',
  'OMN': 'Umman',
  'PAK': 'Pakistan',
  'PLW': 'Palau',
  'PSE': 'Filistin',
  'PAN': 'Panama',
  'PNG': 'Papua Yeni Gine',
  'PRY': 'Paraguay',
  'PER': 'Peru',
  'PHL': 'Filipinler',
  'POL': 'Polonya',
  'PRT': 'Portekiz',
  'QAT': 'Katar',
  'ROU': 'Romanya',
  'RUS': 'Rusya',
  'RWA': 'Ruanda',
  'KNA': 'Saint Kitts ve Nevis',
  'LCA': 'Saint Lucia',
  'WSM': 'Samoa',
  'SMR': 'San Marino',
  'STP': 'São Tomé ve Príncipe',
  'SAU': 'Suudi Arabistan',
  'SEN': 'Senegal',
  'SRB': 'Sırbistan',
  'SYC': 'Seyşeller',
  'SLE': 'Sierra Leone',
  'SGP': 'Singapur',
  'SVK': 'Slovakya',
  'SVN': 'Slovenya',
  'SLB': 'Solomon Adaları',
  'SOM': 'Somali',
  'ZAF': 'Güney Afrika',
  'KOR': 'Güney Kore',
  'SSD': 'Güney Sudan',
  'ESP': 'İspanya',
  'LKA': 'Sri Lanka',
  'VCT': 'Saint Vincent ve Grenadinler',
  'SDN': 'Sudan',
  'SUR': 'Surinam',
  'SWE': 'İsveç',
  'CHE': 'İsviçre',
  'SYR': 'Suriye',
  'TWN': 'Tayvan',
  'TJK': 'Tacikistan',
  'TZA': 'Tanzanya',
  'THA': 'Tayland',
  'TLS': 'Doğu Timor',
  'TGO': 'Togo',
  'TON': 'Tonga',
  'TTO': 'Trinidad ve Tobago',
  'TUN': 'Tunus',
  'TUR': 'Türkiye',
  'TKM': 'Türkmenistan',
  'TUV': 'Tuvalu',
  'UGA': 'Uganda',
  'UKR': 'Ukrayna',
  'ARE': 'Birleşik Arap Emirlikleri',
  'GBR': 'Birleşik Krallık',
  'USA': 'Amerika Birleşik Devletleri',
  'URY': 'Uruguay',
  'UZB': 'Özbekistan',
  'VUT': 'Vanuatu',
  'VAT': 'Vatikan',
  'VEN': 'Venezuela',
  'VNM': 'Vietnam',
  'YEM': 'Yemen',
  'ZMB': 'Zambiya',
  'ZWE': 'Zimbabve',
};

// Country code to PassportIndex slug mapping
const COUNTRY_SLUG_MAP: Record<string, string> = {
  'TUR': 'turkey',
  'KAZ': 'kazakhstan',
  'AFG': 'afghanistan',
  'MNE': 'montenegro',
  'DEU': 'germany',
  'USA': 'united-states-of-america',
  'GBR': 'united-kingdom',
  'FRA': 'france',
  'ESP': 'spain',
  'ITA': 'italy',
  // Add more as needed
};

function getCountrySlug(countryCode: string): string {
  // Check if we have a manual mapping
  if (COUNTRY_SLUG_MAP[countryCode]) {
    return COUNTRY_SLUG_MAP[countryCode];
  }
  
  // Otherwise, use country name and slugify
  const countryName = COUNTRY_NAMES[countryCode];
  if (countryName) {
    return countryName
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[()]/g, '')
      .replace(/\./g, '');
  }
  
  return countryCode.toLowerCase();
}

function extractCountryCode(href: string): string {
  // Extract from URL like: /country/afghanistan/
  const match = href.match(/\/country\/([^/]+)\/?/);
  if (!match) return '';
  
  const slug = match[1].toLowerCase();
  
  // Try to find by slug
  for (const [code, mappedSlug] of Object.entries(COUNTRY_SLUG_MAP)) {
    if (mappedSlug === slug) return code;
  }
  
  // Try to find by country name
  for (const [code, name] of Object.entries(COUNTRY_NAMES)) {
    const nameSlug = name
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[()]/g, '')
      .replace(/\./g, '')
      .replace(/'/g, '')
      .replace(/,/g, '');
    if (nameSlug === slug) return code;
  }
  
  // If still not found, try partial match
  for (const [code, name] of Object.entries(COUNTRY_NAMES)) {
    const nameSlug = name
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[()]/g, '')
      .replace(/\./g, '')
      .replace(/'/g, '')
      .replace(/,/g, '');
    if (nameSlug.includes(slug) || slug.includes(nameSlug)) {
      return code;
    }
  }
  
  return '';
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sourceCountryCode } = body;

    if (!sourceCountryCode) {
      return NextResponse.json(
        { success: false, error: 'sourceCountryCode is required' },
        { status: 400 }
      );
    }

    // Verify source country exists
    const { data: sourceCountry } = await supabase
      .from('countries')
      .select('id, name, country_code')
      .eq('country_code', sourceCountryCode)
      .eq('status', 1)
      .maybeSingle();

    if (!sourceCountry) {
      return NextResponse.json(
        { success: false, error: 'Source country not found' },
        { status: 404 }
      );
    }

    // Create scraping log entry
    const { data: logEntry, error: logError } = await supabase
      .from('scraping_logs')
      .insert({
        source_country_code: sourceCountryCode,
        source_country_name: sourceCountry.name,
        status: 'in_progress',
        started_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (logError) {
      console.error('Failed to create scraping log:', logError);
    }

    const logId = logEntry?.id;

    // Fetch data from GitHub CSV dataset (more reliable than HTML scraping)
    const csvUrl = 'https://raw.githubusercontent.com/ilyankou/passport-index-dataset/master/passport-index-tidy-iso3.csv';
    
    console.log(`Fetching PassportIndex dataset from GitHub...`);
    
    const csvResponse = await fetch(csvUrl);
    if (!csvResponse.ok) {
      throw new Error(`Failed to fetch PassportIndex CSV: ${csvResponse.status}`);
    }

    const csvText = await csvResponse.text();
    const lines = csvText.split('\n');
    
    // Parse CSV (format: Passport,Destination,Requirement)
    const visaData: PassportIndexData[] = [];
    
    for (let i = 1; i < lines.length; i++) { // Skip header
      const line = lines[i].trim();
      if (!line) continue;
      
      const parts = line.split(',');
      if (parts.length < 3) continue;
      
      const passport = parts[0].trim();
      const destination = parts[1].trim();
      const requirement = parts[2].trim();
      
      // Only process rows for the selected source country
      if (passport !== sourceCountryCode) continue;
      
      // Get destination country name
      const destCountryName = COUNTRY_NAMES[destination] || destination;
      
      // Parse requirement value
      let visaStatus: PassportIndexData['visaStatus'] = 'visa-required';
      let applicationMethod: PassportIndexData['applicationMethod'] = 'embassy';
      let allowedStay: string | undefined = undefined;
      
      const reqLower = requirement.toLowerCase();
      
      if (reqLower === 'visa free' || reqLower === 'visa-free') {
        visaStatus = 'visa-free';
        applicationMethod = 'not-required';
      } else if (!isNaN(parseInt(requirement))) {
        // Number of days for visa-free
        visaStatus = 'visa-free';
        applicationMethod = 'not-required';
        allowedStay = `${requirement} days`;
      } else if (reqLower === 'visa on arrival' || reqLower.includes('on arrival')) {
        visaStatus = 'visa-on-arrival';
        applicationMethod = 'on-arrival';
      } else if (reqLower === 'eta' || reqLower === 'e-visa' || reqLower === 'evisa') {
        visaStatus = 'eta';
        applicationMethod = 'online';
      } else if (reqLower === 'visa required' || reqLower.includes('required')) {
        visaStatus = 'visa-required';
        applicationMethod = 'embassy';
      } else if (reqLower === 'no admission' || reqLower === '-1') {
        visaStatus = 'visa-required';
        applicationMethod = 'embassy';
      }
      
      visaData.push({
        countryCode: destination,
        countryName: destCountryName,
        visaStatus,
        allowedStay,
        conditions: requirement !== reqLower ? requirement : undefined,
        applicationMethod,
      });
    }
    
    console.log(`Parsed ${visaData.length} countries from PassportIndex dataset`);

    let scraped = 0;
    let skipped = 0;
    const errors: string[] = [];
    const details: Array<{country: string, status: string}> = [];

    // Insert or update visa requirements with detailed tracking
    for (const data of visaData) {
      try {
        const { error } = await supabase
          .from('visa_requirements')
          .upsert({
            source_country_code: sourceCountryCode,
            country_code: data.countryCode,
            country_name: data.countryName,
            visa_status: data.visaStatus,
            allowed_stay: data.allowedStay,
            conditions: data.conditions,
            visa_cost: data.visaCost,
            processing_time: data.processingTime,
            application_method: data.applicationMethod,
            data_source: 'PassportIndex',
            last_updated: new Date().toISOString(),
          }, {
            onConflict: 'source_country_code,country_code',
          });

        if (error) {
          errors.push(`${data.countryCode}: ${error.message}`);
          details.push({ country: data.countryName, status: 'error' });
        } else {
          scraped++;
          details.push({ 
            country: data.countryName, 
            status: `${data.visaStatus}${data.allowedStay ? ` (${data.allowedStay})` : ''}` 
          });
        }
      } catch (err) {
        errors.push(`${data.countryCode}: ${err instanceof Error ? err.message : 'Unknown error'}`);
        details.push({ country: data.countryName, status: 'error' });
      }
    }

    // Update scraping log with completion
    if (logId) {
      await supabase
        .from('scraping_logs')
        .update({
          status: errors.length > 0 ? 'completed' : 'completed',
          countries_scraped: scraped,
          countries_total: visaData.length,
          errors: errors.length > 0 ? errors.join('\n') : null,
          completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', logId);
    }

    return NextResponse.json({
      success: true,
      sourceCountry: sourceCountryCode,
      scraped,
      skipped,
      total: visaData.length,
      errors,
      details: details.slice(0, 10), // First 10 for preview
      message: `Scraped ${scraped} visa requirements for ${sourceCountry.name}`,
      logId,
    });

  } catch (error) {
    console.error('API: /api/admin/visa-matrix/scrape-passportindex error', error);
    
    // Try to update log on error
    try {
      const body = await request.json();
      const { sourceCountryCode } = body;
      
      if (sourceCountryCode) {
        await supabase
          .from('scraping_logs')
          .update({
            status: 'failed',
            errors: error instanceof Error ? error.message : 'Unknown error',
            completed_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('source_country_code', sourceCountryCode)
          .eq('status', 'in_progress');
      }
    } catch (logError) {
      console.error('Failed to update error log:', logError);
    }
    
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
