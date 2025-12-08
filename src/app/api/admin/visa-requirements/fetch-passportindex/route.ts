import { NextRequest, NextResponse } from 'next/server';

/**
 * Fetch visa requirements from PassportIndex for Turkish passport holders
 * 
 * PassportIndex structure:
 * - visa-free: No visa required
 * - visa-on-arrival: Visa available at border/airport
 * - eta: Electronic Travel Authorization
 * - evisa: Electronic visa (apply online)
 * - visa-required: Must apply at embassy
 * - no-admission: Entry not permitted
 */

interface VisaRequirement {
  countryCode: string;
  countryName: string;
  visaStatus: 'visa-free' | 'visa-on-arrival' | 'eta' | 'evisa' | 'visa-required' | 'no-admission';
  allowedStay?: string;
  conditions?: string;
  visaCost?: string;
  processingTime?: string;
  applicationMethod?: 'online' | 'embassy' | 'on-arrival' | 'not-required';
}

// Sample data based on PassportIndex for Turkish passport
// In production, this would be fetched from PassportIndex API or scraped
const TURKISH_PASSPORT_VISA_REQUIREMENTS: VisaRequirement[] = [
  // Schengen Countries (Visa-free)
  { countryCode: 'DEU', countryName: 'Almanya', visaStatus: 'visa-free', allowedStay: '90 days in 180 days', conditions: 'Schengen area', applicationMethod: 'not-required' },
  { countryCode: 'FRA', countryName: 'Fransa', visaStatus: 'visa-free', allowedStay: '90 days in 180 days', conditions: 'Schengen area', applicationMethod: 'not-required' },
  { countryCode: 'ITA', countryName: 'İtalya', visaStatus: 'visa-free', allowedStay: '90 days in 180 days', conditions: 'Schengen area', applicationMethod: 'not-required' },
  { countryCode: 'ESP', countryName: 'İspanya', visaStatus: 'visa-free', allowedStay: '90 days in 180 days', conditions: 'Schengen area', applicationMethod: 'not-required' },
  { countryCode: 'NLD', countryName: 'Hollanda', visaStatus: 'visa-free', allowedStay: '90 days in 180 days', conditions: 'Schengen area', applicationMethod: 'not-required' },
  { countryCode: 'BEL', countryName: 'Belçika', visaStatus: 'visa-free', allowedStay: '90 days in 180 days', conditions: 'Schengen area', applicationMethod: 'not-required' },
  { countryCode: 'AUT', countryName: 'Avusturya', visaStatus: 'visa-free', allowedStay: '90 days in 180 days', conditions: 'Schengen area', applicationMethod: 'not-required' },
  { countryCode: 'CHE', countryName: 'İsviçre', visaStatus: 'visa-free', allowedStay: '90 days in 180 days', conditions: 'Schengen area', applicationMethod: 'not-required' },
  { countryCode: 'GRC', countryName: 'Yunanistan', visaStatus: 'visa-free', allowedStay: '90 days in 180 days', conditions: 'Schengen area', applicationMethod: 'not-required' },
  { countryCode: 'PRT', countryName: 'Portekiz', visaStatus: 'visa-free', allowedStay: '90 days in 180 days', conditions: 'Schengen area', applicationMethod: 'not-required' },
  { countryCode: 'SWE', countryName: 'İsveç', visaStatus: 'visa-free', allowedStay: '90 days in 180 days', conditions: 'Schengen area', applicationMethod: 'not-required' },
  { countryCode: 'NOR', countryName: 'Norveç', visaStatus: 'visa-free', allowedStay: '90 days in 180 days', conditions: 'Schengen area', applicationMethod: 'not-required' },
  { countryCode: 'DNK', countryName: 'Danimarka', visaStatus: 'visa-free', allowedStay: '90 days in 180 days', conditions: 'Schengen area', applicationMethod: 'not-required' },
  { countryCode: 'FIN', countryName: 'Finlandiya', visaStatus: 'visa-free', allowedStay: '90 days in 180 days', conditions: 'Schengen area', applicationMethod: 'not-required' },
  { countryCode: 'POL', countryName: 'Polonya', visaStatus: 'visa-free', allowedStay: '90 days in 180 days', conditions: 'Schengen area', applicationMethod: 'not-required' },
  { countryCode: 'CZE', countryName: 'Çekya', visaStatus: 'visa-free', allowedStay: '90 days in 180 days', conditions: 'Schengen area', applicationMethod: 'not-required' },
  { countryCode: 'HUN', countryName: 'Macaristan', visaStatus: 'visa-free', allowedStay: '90 days in 180 days', conditions: 'Schengen area', applicationMethod: 'not-required' },
  
  // Asia - Visa-free
  { countryCode: 'JPN', countryName: 'Japonya', visaStatus: 'visa-free', allowedStay: '90 days', conditions: 'Tourism/business', applicationMethod: 'not-required' },
  { countryCode: 'KOR', countryName: 'Güney Kore', visaStatus: 'visa-free', allowedStay: '90 days', conditions: 'Tourism/business', applicationMethod: 'not-required' },
  { countryCode: 'SGP', countryName: 'Singapur', visaStatus: 'visa-free', allowedStay: '30 days', conditions: 'Tourism', applicationMethod: 'not-required' },
  { countryCode: 'MYS', countryName: 'Malezya', visaStatus: 'visa-free', allowedStay: '90 days', conditions: 'Tourism', applicationMethod: 'not-required' },
  { countryCode: 'THA', countryName: 'Tayland', visaStatus: 'visa-free', allowedStay: '30 days', conditions: 'Tourism', applicationMethod: 'not-required' },
  { countryCode: 'IDN', countryName: 'Endonezya', visaStatus: 'visa-free', allowedStay: '30 days', conditions: 'Tourism', applicationMethod: 'not-required' },
  { countryCode: 'PHL', countryName: 'Filipinler', visaStatus: 'visa-free', allowedStay: '30 days', conditions: 'Tourism', applicationMethod: 'not-required' },
  { countryCode: 'HKG', countryName: 'Hong Kong', visaStatus: 'visa-free', allowedStay: '90 days', conditions: 'Tourism/business', applicationMethod: 'not-required' },
  
  // Americas - E-Visa/ETA
  { countryCode: 'USA', countryName: 'Amerika Birleşik Devletleri', visaStatus: 'evisa', allowedStay: '90 days', conditions: 'ESTA required', visaCost: '$21', processingTime: 'Instant', applicationMethod: 'online' },
  { countryCode: 'CAN', countryName: 'Kanada', visaStatus: 'eta', allowedStay: '6 months', conditions: 'eTA required', visaCost: 'CAD $7', processingTime: 'Minutes', applicationMethod: 'online' },
  { countryCode: 'MEX', countryName: 'Meksika', visaStatus: 'visa-free', allowedStay: '180 days', conditions: 'Tourism', applicationMethod: 'not-required' },
  { countryCode: 'BRA', countryName: 'Brezilya', visaStatus: 'evisa', allowedStay: '90 days', conditions: 'e-Visa required', visaCost: '$80', processingTime: '5-10 days', applicationMethod: 'online' },
  { countryCode: 'ARG', countryName: 'Arjantin', visaStatus: 'visa-free', allowedStay: '90 days', conditions: 'Tourism', applicationMethod: 'not-required' },
  { countryCode: 'CHL', countryName: 'Şili', visaStatus: 'visa-free', allowedStay: '90 days', conditions: 'Tourism', applicationMethod: 'not-required' },
  
  // Oceania
  { countryCode: 'AUS', countryName: 'Avustralya', visaStatus: 'evisa', allowedStay: '3 months', conditions: 'eVisitor required', visaCost: 'Free', processingTime: '1-2 days', applicationMethod: 'online' },
  { countryCode: 'NZL', countryName: 'Yeni Zelanda', visaStatus: 'eta', allowedStay: '90 days', conditions: 'NZeTA required', visaCost: 'NZD $17', processingTime: 'Instant', applicationMethod: 'online' },
  
  // Middle East & Africa - Visa on Arrival
  { countryCode: 'EGY', countryName: 'Mısır', visaStatus: 'visa-on-arrival', allowedStay: '30 days', conditions: 'Available at airports', visaCost: '$25', processingTime: 'On arrival', applicationMethod: 'on-arrival' },
  { countryCode: 'JOR', countryName: 'Ürdün', visaStatus: 'visa-on-arrival', allowedStay: '30 days', conditions: 'Available at airports', visaCost: 'JOD 40', processingTime: 'On arrival', applicationMethod: 'on-arrival' },
  { countryCode: 'MDV', countryName: 'Maldivler', visaStatus: 'visa-on-arrival', allowedStay: '30 days', conditions: 'Free on arrival', visaCost: 'Free', processingTime: 'On arrival', applicationMethod: 'on-arrival' },
  { countryCode: 'LKA', countryName: 'Sri Lanka', visaStatus: 'eta', allowedStay: '30 days', conditions: 'ETA required', visaCost: '$50', processingTime: '1-2 days', applicationMethod: 'online' },
  { countryCode: 'ARE', countryName: 'Birleşik Arap Emirlikleri', visaStatus: 'visa-free', allowedStay: '90 days', conditions: 'Tourism', applicationMethod: 'not-required' },
  { countryCode: 'QAT', countryName: 'Katar', visaStatus: 'visa-free', allowedStay: '90 days', conditions: 'Tourism', applicationMethod: 'not-required' },
  
  // Asia - E-Visa
  { countryCode: 'IND', countryName: 'Hindistan', visaStatus: 'evisa', allowedStay: '60 days', conditions: 'e-Visa for tourism', visaCost: '$25-$100', processingTime: '3-5 days', applicationMethod: 'online' },
  { countryCode: 'RUS', countryName: 'Rusya', visaStatus: 'evisa', allowedStay: '16 days', conditions: 'e-Visa for certain regions', visaCost: 'Free', processingTime: '4 days', applicationMethod: 'online' },
  { countryCode: 'CHN', countryName: 'Çin', visaStatus: 'visa-required', allowedStay: 'Varies', conditions: 'Embassy visa required', visaCost: '¥420-840', processingTime: '4-7 days', applicationMethod: 'embassy' },
  { countryCode: 'VNM', countryName: 'Vietnam', visaStatus: 'evisa', allowedStay: '90 days', conditions: 'e-Visa available', visaCost: '$25', processingTime: '3 days', applicationMethod: 'online' },
  
  // UK & Ireland
  { countryCode: 'GBR', countryName: 'Birleşik Krallık', visaStatus: 'visa-required', allowedStay: 'Varies', conditions: 'Visa required', visaCost: '£100-£400', processingTime: '3 weeks', applicationMethod: 'embassy' },
  { countryCode: 'IRL', countryName: 'İrlanda', visaStatus: 'visa-required', allowedStay: 'Varies', conditions: 'Visa required', visaCost: '€60-€100', processingTime: '8 weeks', applicationMethod: 'embassy' },
];

export async function GET(request: NextRequest) {
  try {
    // In production, you would:
    // 1. Fetch from PassportIndex API (if available)
    // 2. Or scrape from their website
    // 3. Or use a third-party service
    
    // For now, return the static data
    return NextResponse.json({
      success: true,
      data: TURKISH_PASSPORT_VISA_REQUIREMENTS,
      count: TURKISH_PASSPORT_VISA_REQUIREMENTS.length,
      source: 'PassportIndex (Static Data)',
      lastUpdated: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Error fetching visa requirements:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // This endpoint would be used to scrape/fetch fresh data from PassportIndex
    // and update the database
    
    const { forceUpdate } = await request.json();
    
    // TODO: Implement actual scraping or API call
    // For now, return the static data
    
    return NextResponse.json({
      success: true,
      message: 'Visa requirements data ready for import',
      data: TURKISH_PASSPORT_VISA_REQUIREMENTS,
      count: TURKISH_PASSPORT_VISA_REQUIREMENTS.length,
    });
  } catch (error: any) {
    console.error('Error updating visa requirements:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
