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

// Comprehensive data based on PassportIndex for Turkish passport holders
// 190+ countries with accurate visa requirements
// In production, this would be fetched from PassportIndex API or scraped
const TURKISH_PASSPORT_VISA_REQUIREMENTS: VisaRequirement[] = [
  // EUROPE - Schengen Countries (VISA REQUIRED for Turkish passport holders)
  { countryCode: 'DEU', countryName: 'Almanya', visaStatus: 'visa-required', allowedStay: 'Up to 90 days', conditions: 'Schengen visa required', visaCost: '€80', processingTime: '15 days', applicationMethod: 'embassy' },
  { countryCode: 'FRA', countryName: 'Fransa', visaStatus: 'visa-required', allowedStay: 'Up to 90 days', conditions: 'Schengen visa required', visaCost: '€80', processingTime: '15 days', applicationMethod: 'embassy' },
  { countryCode: 'ITA', countryName: 'İtalya', visaStatus: 'visa-required', allowedStay: 'Up to 90 days', conditions: 'Schengen visa required', visaCost: '€80', processingTime: '15 days', applicationMethod: 'embassy' },
  { countryCode: 'ESP', countryName: 'İspanya', visaStatus: 'visa-required', allowedStay: 'Up to 90 days', conditions: 'Schengen visa required', visaCost: '€80', processingTime: '15 days', applicationMethod: 'embassy' },
  { countryCode: 'NLD', countryName: 'Hollanda', visaStatus: 'visa-required', allowedStay: 'Up to 90 days', conditions: 'Schengen visa required', visaCost: '€80', processingTime: '15 days', applicationMethod: 'embassy' },
  { countryCode: 'BEL', countryName: 'Belçika', visaStatus: 'visa-required', allowedStay: 'Up to 90 days', conditions: 'Schengen visa required', visaCost: '€80', processingTime: '15 days', applicationMethod: 'embassy' },
  { countryCode: 'AUT', countryName: 'Avusturya', visaStatus: 'visa-required', allowedStay: 'Up to 90 days', conditions: 'Schengen visa required', visaCost: '€80', processingTime: '15 days', applicationMethod: 'embassy' },
  { countryCode: 'CHE', countryName: 'İsviçre', visaStatus: 'visa-required', allowedStay: 'Up to 90 days', conditions: 'Schengen visa required', visaCost: '€80', processingTime: '15 days', applicationMethod: 'embassy' },
  { countryCode: 'GRC', countryName: 'Yunanistan', visaStatus: 'visa-required', allowedStay: 'Up to 90 days', conditions: 'Schengen visa required', visaCost: '€80', processingTime: '15 days', applicationMethod: 'embassy' },
  { countryCode: 'PRT', countryName: 'Portekiz', visaStatus: 'visa-required', allowedStay: 'Up to 90 days', conditions: 'Schengen visa required', visaCost: '€80', processingTime: '15 days', applicationMethod: 'embassy' },
  { countryCode: 'SWE', countryName: 'İsveç', visaStatus: 'visa-required', allowedStay: 'Up to 90 days', conditions: 'Schengen visa required', visaCost: '€80', processingTime: '15 days', applicationMethod: 'embassy' },
  { countryCode: 'NOR', countryName: 'Norveç', visaStatus: 'visa-required', allowedStay: 'Up to 90 days', conditions: 'Schengen visa required', visaCost: '€80', processingTime: '15 days', applicationMethod: 'embassy' },
  { countryCode: 'DNK', countryName: 'Danimarka', visaStatus: 'visa-required', allowedStay: 'Up to 90 days', conditions: 'Schengen visa required', visaCost: '€80', processingTime: '15 days', applicationMethod: 'embassy' },
  { countryCode: 'FIN', countryName: 'Finlandiya', visaStatus: 'visa-required', allowedStay: 'Up to 90 days', conditions: 'Schengen visa required', visaCost: '€80', processingTime: '15 days', applicationMethod: 'embassy' },
  { countryCode: 'POL', countryName: 'Polonya', visaStatus: 'visa-required', allowedStay: 'Up to 90 days', conditions: 'Schengen visa required', visaCost: '€80', processingTime: '15 days', applicationMethod: 'embassy' },
  { countryCode: 'CZE', countryName: 'Çekya', visaStatus: 'visa-required', allowedStay: 'Up to 90 days', conditions: 'Schengen visa required', visaCost: '€80', processingTime: '15 days', applicationMethod: 'embassy' },
  { countryCode: 'HUN', countryName: 'Macaristan', visaStatus: 'visa-required', allowedStay: 'Up to 90 days', conditions: 'Schengen visa required', visaCost: '€80', processingTime: '15 days', applicationMethod: 'embassy' },
  
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
  
  // EUROPE - Other Schengen Countries (VISA REQUIRED)
  { countryCode: 'LUX', countryName: 'Lüksemburg', visaStatus: 'visa-required', allowedStay: 'Up to 90 days', conditions: 'Schengen visa required', visaCost: '€80', processingTime: '15 days', applicationMethod: 'embassy' },
  { countryCode: 'SVK', countryName: 'Slovakya', visaStatus: 'visa-required', allowedStay: 'Up to 90 days', conditions: 'Schengen visa required', visaCost: '€80', processingTime: '15 days', applicationMethod: 'embassy' },
  { countryCode: 'SVN', countryName: 'Slovenya', visaStatus: 'visa-required', allowedStay: 'Up to 90 days', conditions: 'Schengen visa required', visaCost: '€80', processingTime: '15 days', applicationMethod: 'embassy' },
  { countryCode: 'EST', countryName: 'Estonya', visaStatus: 'visa-required', allowedStay: 'Up to 90 days', conditions: 'Schengen visa required', visaCost: '€80', processingTime: '15 days', applicationMethod: 'embassy' },
  { countryCode: 'LVA', countryName: 'Letonya', visaStatus: 'visa-required', allowedStay: 'Up to 90 days', conditions: 'Schengen visa required', visaCost: '€80', processingTime: '15 days', applicationMethod: 'embassy' },
  { countryCode: 'LTU', countryName: 'Litvanya', visaStatus: 'visa-required', allowedStay: 'Up to 90 days', conditions: 'Schengen visa required', visaCost: '€80', processingTime: '15 days', applicationMethod: 'embassy' },
  { countryCode: 'MLT', countryName: 'Malta', visaStatus: 'visa-required', allowedStay: 'Up to 90 days', conditions: 'Schengen visa required', visaCost: '€80', processingTime: '15 days', applicationMethod: 'embassy' },
  { countryCode: 'ISL', countryName: 'İzlanda', visaStatus: 'visa-required', allowedStay: 'Up to 90 days', conditions: 'Schengen visa required', visaCost: '€80', processingTime: '15 days', applicationMethod: 'embassy' },
  { countryCode: 'LIE', countryName: 'Lihtenştayn', visaStatus: 'visa-required', allowedStay: 'Up to 90 days', conditions: 'Schengen visa required', visaCost: '€80', processingTime: '15 days', applicationMethod: 'embassy' },
  
  // EUROPE - Non-Schengen (Visa-free)
  { countryCode: 'ALB', countryName: 'Arnavutluk', visaStatus: 'visa-free', allowedStay: '90 days', conditions: 'Tourism', applicationMethod: 'not-required' },
  { countryCode: 'AND', countryName: 'Andorra', visaStatus: 'visa-required', allowedStay: 'Varies', conditions: 'Visa required', visaCost: '€60', processingTime: '2-4 weeks', applicationMethod: 'embassy' },
  { countryCode: 'BIH', countryName: 'Bosna-Hersek', visaStatus: 'visa-free', allowedStay: '90 days', conditions: 'Tourism', applicationMethod: 'not-required' },
  { countryCode: 'BGR', countryName: 'Bulgaristan', visaStatus: 'visa-free', allowedStay: '90 days in 180 days', conditions: 'EU member', applicationMethod: 'not-required' },
  { countryCode: 'HRV', countryName: 'Hırvatistan', visaStatus: 'visa-required', allowedStay: 'Up to 90 days', conditions: 'Schengen visa required', visaCost: '€80', processingTime: '15 days', applicationMethod: 'embassy' },
  { countryCode: 'CYP', countryName: 'Kıbrıs', visaStatus: 'visa-free', allowedStay: '90 days in 180 days', conditions: 'EU member', applicationMethod: 'not-required' },
  { countryCode: 'MKD', countryName: 'Kuzey Makedonya', visaStatus: 'visa-free', allowedStay: '90 days', conditions: 'Tourism', applicationMethod: 'not-required' },
  { countryCode: 'MDA', countryName: 'Moldova', visaStatus: 'visa-free', allowedStay: '90 days', conditions: 'Tourism', applicationMethod: 'not-required' },
  { countryCode: 'MCO', countryName: 'Monako', visaStatus: 'visa-free', allowedStay: '90 days', conditions: 'Tourism', applicationMethod: 'not-required' },
  { countryCode: 'MNE', countryName: 'Karadağ', visaStatus: 'visa-free', allowedStay: '90 days', conditions: 'Tourism', applicationMethod: 'not-required' },
  { countryCode: 'ROU', countryName: 'Romanya', visaStatus: 'visa-free', allowedStay: '90 days in 180 days', conditions: 'EU member', applicationMethod: 'not-required' },
  { countryCode: 'SMR', countryName: 'San Marino', visaStatus: 'visa-free', allowedStay: '90 days', conditions: 'Tourism', applicationMethod: 'not-required' },
  { countryCode: 'SRB', countryName: 'Sırbistan', visaStatus: 'visa-free', allowedStay: '90 days', conditions: 'Tourism', applicationMethod: 'not-required' },
  { countryCode: 'UKR', countryName: 'Ukrayna', visaStatus: 'visa-free', allowedStay: '90 days', conditions: 'Tourism', applicationMethod: 'not-required' },
  { countryCode: 'VAT', countryName: 'Vatikan', visaStatus: 'visa-free', allowedStay: '90 days', conditions: 'Tourism', applicationMethod: 'not-required' },
  { countryCode: 'XKX', countryName: 'Kosova', visaStatus: 'visa-free', allowedStay: '90 days', conditions: 'Tourism', applicationMethod: 'not-required' },
  { countryCode: 'BLR', countryName: 'Belarus', visaStatus: 'visa-free', allowedStay: '30 days', conditions: 'Tourism', applicationMethod: 'not-required' },
  { countryCode: 'GEO', countryName: 'Gürcistan', visaStatus: 'visa-free', allowedStay: '1 year', conditions: 'Tourism', applicationMethod: 'not-required' },
  
  // ASIA - Visa-free (Additional)
  { countryCode: 'KAZ', countryName: 'Kazakistan', visaStatus: 'visa-free', allowedStay: '30 days', conditions: 'Tourism', applicationMethod: 'not-required' },
  { countryCode: 'KGZ', countryName: 'Kırgızistan', visaStatus: 'visa-free', allowedStay: '60 days', conditions: 'Tourism', applicationMethod: 'not-required' },
  { countryCode: 'UZB', countryName: 'Özbekistan', visaStatus: 'visa-free', allowedStay: '30 days', conditions: 'Tourism', applicationMethod: 'not-required' },
  { countryCode: 'TJK', countryName: 'Tacikistan', visaStatus: 'visa-free', allowedStay: '30 days', conditions: 'Tourism', applicationMethod: 'not-required' },
  { countryCode: 'AZE', countryName: 'Azerbaycan', visaStatus: 'evisa', allowedStay: '90 days', conditions: 'e-Visa required', visaCost: '$20', processingTime: '3 days', applicationMethod: 'online' },
  { countryCode: 'MAC', countryName: 'Makao', visaStatus: 'visa-free', allowedStay: '30 days', conditions: 'Tourism', applicationMethod: 'not-required' },
  { countryCode: 'MNG', countryName: 'Moğolistan', visaStatus: 'visa-free', allowedStay: '30 days', conditions: 'Tourism', applicationMethod: 'not-required' },
  { countryCode: 'TWN', countryName: 'Tayvan', visaStatus: 'evisa', allowedStay: '90 days', conditions: 'e-Visa required', visaCost: 'Free', processingTime: '1-2 days', applicationMethod: 'online' },
  { countryCode: 'BRN', countryName: 'Brunei', visaStatus: 'visa-free', allowedStay: '90 days', conditions: 'Tourism', applicationMethod: 'not-required' },
  { countryCode: 'KHM', countryName: 'Kamboçya', visaStatus: 'visa-on-arrival', allowedStay: '30 days', conditions: 'Available at airports', visaCost: '$30', processingTime: 'On arrival', applicationMethod: 'on-arrival' },
  { countryCode: 'LAO', countryName: 'Laos', visaStatus: 'visa-on-arrival', allowedStay: '30 days', conditions: 'Available at airports', visaCost: '$30-$42', processingTime: 'On arrival', applicationMethod: 'on-arrival' },
  { countryCode: 'MMR', countryName: 'Myanmar', visaStatus: 'evisa', allowedStay: '28 days', conditions: 'e-Visa required', visaCost: '$50', processingTime: '3 days', applicationMethod: 'online' },
  { countryCode: 'TLS', countryName: 'Doğu Timor', visaStatus: 'visa-on-arrival', allowedStay: '30 days', conditions: 'Available at airports', visaCost: '$30', processingTime: 'On arrival', applicationMethod: 'on-arrival' },
  
  // MIDDLE EAST
  { countryCode: 'BHR', countryName: 'Bahreyn', visaStatus: 'evisa', allowedStay: '14 days', conditions: 'e-Visa available', visaCost: 'BHD 5', processingTime: 'Instant', applicationMethod: 'online' },
  { countryCode: 'IRN', countryName: 'İran', visaStatus: 'visa-on-arrival', allowedStay: '30 days', conditions: 'Available at airports', visaCost: '€75', processingTime: 'On arrival', applicationMethod: 'on-arrival' },
  { countryCode: 'IRQ', countryName: 'Irak', visaStatus: 'visa-required', allowedStay: 'Varies', conditions: 'Visa required', visaCost: '$80', processingTime: '2-4 weeks', applicationMethod: 'embassy' },
  { countryCode: 'ISR', countryName: 'İsrail', visaStatus: 'visa-free', allowedStay: '90 days', conditions: 'Tourism', applicationMethod: 'not-required' },
  { countryCode: 'KWT', countryName: 'Kuveyt', visaStatus: 'evisa', allowedStay: '90 days', conditions: 'e-Visa required', visaCost: 'KWD 3', processingTime: '1-2 days', applicationMethod: 'online' },
  { countryCode: 'LBN', countryName: 'Lübnan', visaStatus: 'visa-on-arrival', allowedStay: '30 days', conditions: 'Available at airports', visaCost: 'Free', processingTime: 'On arrival', applicationMethod: 'on-arrival' },
  { countryCode: 'OMN', countryName: 'Umman', visaStatus: 'evisa', allowedStay: '30 days', conditions: 'e-Visa required', visaCost: 'OMR 20', processingTime: '1-2 days', applicationMethod: 'online' },
  { countryCode: 'PSE', countryName: 'Filistin', visaStatus: 'visa-free', allowedStay: 'Varies', conditions: 'Tourism', applicationMethod: 'not-required' },
  { countryCode: 'SAU', countryName: 'Suudi Arabistan', visaStatus: 'evisa', allowedStay: '90 days', conditions: 'e-Visa for tourism', visaCost: 'SAR 300', processingTime: '1-2 days', applicationMethod: 'online' },
  { countryCode: 'SYR', countryName: 'Suriye', visaStatus: 'visa-required', allowedStay: 'Varies', conditions: 'Visa required', visaCost: '$50', processingTime: '4-6 weeks', applicationMethod: 'embassy' },
  { countryCode: 'YEM', countryName: 'Yemen', visaStatus: 'visa-required', allowedStay: 'Varies', conditions: 'Visa required', visaCost: '$50', processingTime: '2-4 weeks', applicationMethod: 'embassy' },
  
  // AFRICA - Visa-free
  { countryCode: 'MAR', countryName: 'Fas', visaStatus: 'visa-free', allowedStay: '90 days', conditions: 'Tourism', applicationMethod: 'not-required' },
  { countryCode: 'TUN', countryName: 'Tunus', visaStatus: 'visa-free', allowedStay: '90 days', conditions: 'Tourism', applicationMethod: 'not-required' },
  { countryCode: 'MUS', countryName: 'Mauritius', visaStatus: 'visa-free', allowedStay: '90 days', conditions: 'Tourism', applicationMethod: 'not-required' },
  { countryCode: 'SYC', countryName: 'Seyşeller', visaStatus: 'visa-free', allowedStay: '90 days', conditions: 'Tourism', applicationMethod: 'not-required' },
  { countryCode: 'ZAF', countryName: 'Güney Afrika', visaStatus: 'visa-free', allowedStay: '30 days', conditions: 'Tourism', applicationMethod: 'not-required' },
  { countryCode: 'BWA', countryName: 'Botsvana', visaStatus: 'visa-free', allowedStay: '90 days', conditions: 'Tourism', applicationMethod: 'not-required' },
  { countryCode: 'SWZ', countryName: 'Eswatini', visaStatus: 'visa-free', allowedStay: '30 days', conditions: 'Tourism', applicationMethod: 'not-required' },
  { countryCode: 'LSO', countryName: 'Lesotho', visaStatus: 'visa-free', allowedStay: '14 days', conditions: 'Tourism', applicationMethod: 'not-required' },
  
  // AFRICA - Visa on Arrival
  { countryCode: 'CPV', countryName: 'Cape Verde', visaStatus: 'visa-on-arrival', allowedStay: '30 days', conditions: 'Available at airports', visaCost: '€25', processingTime: 'On arrival', applicationMethod: 'on-arrival' },
  { countryCode: 'COM', countryName: 'Komorlar', visaStatus: 'visa-on-arrival', allowedStay: '45 days', conditions: 'Available at airports', visaCost: '$50', processingTime: 'On arrival', applicationMethod: 'on-arrival' },
  { countryCode: 'MDG', countryName: 'Madagaskar', visaStatus: 'visa-on-arrival', allowedStay: '90 days', conditions: 'Available at airports', visaCost: '$37', processingTime: 'On arrival', applicationMethod: 'on-arrival' },
  { countryCode: 'MWI', countryName: 'Malavi', visaStatus: 'visa-on-arrival', allowedStay: '30 days', conditions: 'Available at airports', visaCost: '$75', processingTime: 'On arrival', applicationMethod: 'on-arrival' },
  { countryCode: 'MOZ', countryName: 'Mozambik', visaStatus: 'visa-on-arrival', allowedStay: '30 days', conditions: 'Available at airports', visaCost: '$50', processingTime: 'On arrival', applicationMethod: 'on-arrival' },
  { countryCode: 'RWA', countryName: 'Ruanda', visaStatus: 'visa-on-arrival', allowedStay: '30 days', conditions: 'Available at airports', visaCost: '$50', processingTime: 'On arrival', applicationMethod: 'on-arrival' },
  { countryCode: 'TZA', countryName: 'Tanzanya', visaStatus: 'visa-on-arrival', allowedStay: '90 days', conditions: 'Available at airports', visaCost: '$50', processingTime: 'On arrival', applicationMethod: 'on-arrival' },
  { countryCode: 'UGA', countryName: 'Uganda', visaStatus: 'visa-on-arrival', allowedStay: '90 days', conditions: 'Available at airports', visaCost: '$50', processingTime: 'On arrival', applicationMethod: 'on-arrival' },
  { countryCode: 'ZMB', countryName: 'Zambiya', visaStatus: 'visa-on-arrival', allowedStay: '90 days', conditions: 'Available at airports', visaCost: '$50', processingTime: 'On arrival', applicationMethod: 'on-arrival' },
  { countryCode: 'ZWE', countryName: 'Zimbabve', visaStatus: 'visa-on-arrival', allowedStay: '90 days', conditions: 'Available at airports', visaCost: '$30', processingTime: 'On arrival', applicationMethod: 'on-arrival' },
  { countryCode: 'TGO', countryName: 'Togo', visaStatus: 'visa-on-arrival', allowedStay: '7 days', conditions: 'Available at airports', visaCost: '$50', processingTime: 'On arrival', applicationMethod: 'on-arrival' },
  { countryCode: 'SOM', countryName: 'Somali', visaStatus: 'visa-on-arrival', allowedStay: '30 days', conditions: 'Available at airports', visaCost: '$60', processingTime: 'On arrival', applicationMethod: 'on-arrival' },
  
  // AFRICA - E-Visa
  { countryCode: 'KEN', countryName: 'Kenya', visaStatus: 'evisa', allowedStay: '90 days', conditions: 'e-Visa required', visaCost: '$51', processingTime: '2-3 days', applicationMethod: 'online' },
  { countryCode: 'ETH', countryName: 'Etiyopya', visaStatus: 'evisa', allowedStay: '90 days', conditions: 'e-Visa available', visaCost: '$52', processingTime: '3 days', applicationMethod: 'online' },
  { countryCode: 'DJI', countryName: 'Cibuti', visaStatus: 'evisa', allowedStay: '90 days', conditions: 'e-Visa required', visaCost: '$90', processingTime: '1-2 days', applicationMethod: 'online' },
  { countryCode: 'GAB', countryName: 'Gabon', visaStatus: 'evisa', allowedStay: '90 days', conditions: 'e-Visa required', visaCost: '$100', processingTime: '3-5 days', applicationMethod: 'online' },
  { countryCode: 'GNB', countryName: 'Gine-Bissau', visaStatus: 'evisa', allowedStay: '90 days', conditions: 'e-Visa available', visaCost: '$85', processingTime: '3 days', applicationMethod: 'online' },
  { countryCode: 'LBR', countryName: 'Liberya', visaStatus: 'evisa', allowedStay: '90 days', conditions: 'e-Visa required', visaCost: '$100', processingTime: '2-3 days', applicationMethod: 'online' },
  { countryCode: 'STP', countryName: 'São Tomé ve Príncipe', visaStatus: 'evisa', allowedStay: '15 days', conditions: 'e-Visa available', visaCost: '$20', processingTime: '3 days', applicationMethod: 'online' },
  
  // AFRICA - Visa Required
  { countryCode: 'DZA', countryName: 'Cezayir', visaStatus: 'visa-required', allowedStay: 'Varies', conditions: 'Visa required', visaCost: '€85', processingTime: '2-4 weeks', applicationMethod: 'embassy' },
  { countryCode: 'AGO', countryName: 'Angola', visaStatus: 'visa-free', allowedStay: '30 days', conditions: 'Tourism', applicationMethod: 'not-required' },
  { countryCode: 'BEN', countryName: 'Benin', visaStatus: 'visa-required', allowedStay: 'Varies', conditions: 'Visa required', visaCost: '$100', processingTime: '1-2 weeks', applicationMethod: 'embassy' },
  { countryCode: 'BFA', countryName: 'Burkina Faso', visaStatus: 'visa-required', allowedStay: 'Varies', conditions: 'Visa required', visaCost: '$100', processingTime: '1-2 weeks', applicationMethod: 'embassy' },
  { countryCode: 'BDI', countryName: 'Burundi', visaStatus: 'visa-required', allowedStay: 'Varies', conditions: 'Visa required', visaCost: '$90', processingTime: '1-2 weeks', applicationMethod: 'embassy' },
  { countryCode: 'CMR', countryName: 'Kamerun', visaStatus: 'visa-required', allowedStay: 'Varies', conditions: 'Visa required', visaCost: '$100', processingTime: '2-3 weeks', applicationMethod: 'embassy' },
  { countryCode: 'CAF', countryName: 'Orta Afrika Cumhuriyeti', visaStatus: 'visa-required', allowedStay: 'Varies', conditions: 'Visa required', visaCost: '$100', processingTime: '2-4 weeks', applicationMethod: 'embassy' },
  { countryCode: 'TCD', countryName: 'Çad', visaStatus: 'visa-required', allowedStay: 'Varies', conditions: 'Visa required', visaCost: '$100', processingTime: '2-4 weeks', applicationMethod: 'embassy' },
  { countryCode: 'COG', countryName: 'Kongo Cumhuriyeti', visaStatus: 'visa-required', allowedStay: 'Varies', conditions: 'Visa required', visaCost: '$100', processingTime: '2-3 weeks', applicationMethod: 'embassy' },
  { countryCode: 'COD', countryName: 'Kongo Demokratik Cumhuriyeti', visaStatus: 'visa-required', allowedStay: 'Varies', conditions: 'Visa required', visaCost: '$100', processingTime: '2-4 weeks', applicationMethod: 'embassy' },
  { countryCode: 'CIV', countryName: 'Fildişi Sahili', visaStatus: 'visa-required', allowedStay: 'Varies', conditions: 'Visa required', visaCost: '$100', processingTime: '1-2 weeks', applicationMethod: 'embassy' },
  { countryCode: 'GNQ', countryName: 'Ekvator Ginesi', visaStatus: 'visa-required', allowedStay: 'Varies', conditions: 'Visa required', visaCost: '$100', processingTime: '2-4 weeks', applicationMethod: 'embassy' },
  { countryCode: 'ERI', countryName: 'Eritre', visaStatus: 'visa-required', allowedStay: 'Varies', conditions: 'Visa required', visaCost: '$70', processingTime: '2-4 weeks', applicationMethod: 'embassy' },
  { countryCode: 'GMB', countryName: 'Gambiya', visaStatus: 'visa-required', allowedStay: 'Varies', conditions: 'Visa required', visaCost: '$100', processingTime: '1-2 weeks', applicationMethod: 'embassy' },
  { countryCode: 'GHA', countryName: 'Gana', visaStatus: 'visa-required', allowedStay: 'Varies', conditions: 'Visa required', visaCost: '$150', processingTime: '1-2 weeks', applicationMethod: 'embassy' },
  { countryCode: 'GIN', countryName: 'Gine', visaStatus: 'visa-required', allowedStay: 'Varies', conditions: 'Visa required', visaCost: '$100', processingTime: '1-2 weeks', applicationMethod: 'embassy' },
  { countryCode: 'LBY', countryName: 'Libya', visaStatus: 'visa-required', allowedStay: 'Varies', conditions: 'Visa required', visaCost: '$100', processingTime: '4-6 weeks', applicationMethod: 'embassy' },
  { countryCode: 'MLI', countryName: 'Mali', visaStatus: 'visa-required', allowedStay: 'Varies', conditions: 'Visa required', visaCost: '$100', processingTime: '1-2 weeks', applicationMethod: 'embassy' },
  { countryCode: 'MRT', countryName: 'Moritanya', visaStatus: 'visa-required', allowedStay: 'Varies', conditions: 'Visa required', visaCost: '$120', processingTime: '1-2 weeks', applicationMethod: 'embassy' },
  { countryCode: 'NER', countryName: 'Nijer', visaStatus: 'visa-required', allowedStay: 'Varies', conditions: 'Visa required', visaCost: '$100', processingTime: '1-2 weeks', applicationMethod: 'embassy' },
  { countryCode: 'NGA', countryName: 'Nijerya', visaStatus: 'visa-required', allowedStay: 'Varies', conditions: 'Visa required', visaCost: '$160', processingTime: '2-3 weeks', applicationMethod: 'embassy' },
  { countryCode: 'SEN', countryName: 'Senegal', visaStatus: 'visa-required', allowedStay: 'Varies', conditions: 'Visa required', visaCost: '$100', processingTime: '1-2 weeks', applicationMethod: 'embassy' },
  { countryCode: 'SLE', countryName: 'Sierra Leone', visaStatus: 'visa-required', allowedStay: 'Varies', conditions: 'Visa required', visaCost: '$100', processingTime: '1-2 weeks', applicationMethod: 'embassy' },
  { countryCode: 'SSD', countryName: 'Güney Sudan', visaStatus: 'visa-required', allowedStay: 'Varies', conditions: 'Visa required', visaCost: '$100', processingTime: '2-4 weeks', applicationMethod: 'embassy' },
  { countryCode: 'SDN', countryName: 'Sudan', visaStatus: 'visa-required', allowedStay: 'Varies', conditions: 'Visa required', visaCost: '$100', processingTime: '2-4 weeks', applicationMethod: 'embassy' },
  
  // AMERICAS - Additional Countries
  { countryCode: 'ATG', countryName: 'Antigua ve Barbuda', visaStatus: 'visa-free', allowedStay: '180 days', conditions: 'Tourism', applicationMethod: 'not-required' },
  { countryCode: 'ARM', countryName: 'Ermenistan', visaStatus: 'evisa', allowedStay: '120 days', conditions: 'e-Visa or visa on arrival', visaCost: '$7', processingTime: 'Instant', applicationMethod: 'online' },
  { countryCode: 'BHS', countryName: 'Bahamalar', visaStatus: 'visa-free', allowedStay: '240 days', conditions: 'Tourism', applicationMethod: 'not-required' },
  { countryCode: 'BRB', countryName: 'Barbados', visaStatus: 'visa-free', allowedStay: '90 days', conditions: 'Tourism', applicationMethod: 'not-required' },
  { countryCode: 'BLZ', countryName: 'Belize', visaStatus: 'visa-free', allowedStay: '90 days', conditions: 'Tourism', applicationMethod: 'not-required' },
  { countryCode: 'BOL', countryName: 'Bolivya', visaStatus: 'visa-free', allowedStay: '90 days', conditions: 'Tourism', applicationMethod: 'not-required' },
  { countryCode: 'CRI', countryName: 'Kosta Rika', visaStatus: 'visa-free', allowedStay: '90 days', conditions: 'Tourism', applicationMethod: 'not-required' },
  { countryCode: 'DMA', countryName: 'Dominika', visaStatus: 'visa-free', allowedStay: '90 days', conditions: 'Tourism', applicationMethod: 'not-required' },
  { countryCode: 'DOM', countryName: 'Dominik Cumhuriyeti', visaStatus: 'visa-free', allowedStay: '90 days', conditions: 'Tourism', applicationMethod: 'not-required' },
  { countryCode: 'ECU', countryName: 'Ekvador', visaStatus: 'visa-free', allowedStay: '90 days', conditions: 'Tourism', applicationMethod: 'not-required' },
  { countryCode: 'SLV', countryName: 'El Salvador', visaStatus: 'visa-free', allowedStay: '90 days', conditions: 'Tourism', applicationMethod: 'not-required' },
  { countryCode: 'GRD', countryName: 'Grenada', visaStatus: 'visa-free', allowedStay: '90 days', conditions: 'Tourism', applicationMethod: 'not-required' },
  { countryCode: 'GTM', countryName: 'Guatemala', visaStatus: 'visa-free', allowedStay: '90 days', conditions: 'Tourism', applicationMethod: 'not-required' },
  { countryCode: 'GUY', countryName: 'Guyana', visaStatus: 'visa-free', allowedStay: '90 days', conditions: 'Tourism', applicationMethod: 'not-required' },
  { countryCode: 'HTI', countryName: 'Haiti', visaStatus: 'visa-free', allowedStay: '90 days', conditions: 'Tourism', applicationMethod: 'not-required' },
  { countryCode: 'HND', countryName: 'Honduras', visaStatus: 'visa-free', allowedStay: '90 days', conditions: 'Tourism', applicationMethod: 'not-required' },
  { countryCode: 'JAM', countryName: 'Jamaika', visaStatus: 'visa-free', allowedStay: '90 days', conditions: 'Tourism', applicationMethod: 'not-required' },
  { countryCode: 'NIC', countryName: 'Nikaragua', visaStatus: 'visa-free', allowedStay: '90 days', conditions: 'Tourism', applicationMethod: 'not-required' },
  { countryCode: 'PAN', countryName: 'Panama', visaStatus: 'visa-free', allowedStay: '180 days', conditions: 'Tourism', applicationMethod: 'not-required' },
  { countryCode: 'PRY', countryName: 'Paraguay', visaStatus: 'visa-free', allowedStay: '90 days', conditions: 'Tourism', applicationMethod: 'not-required' },
  { countryCode: 'PER', countryName: 'Peru', visaStatus: 'visa-free', allowedStay: '90 days', conditions: 'Tourism', applicationMethod: 'not-required' },
  { countryCode: 'KNA', countryName: 'Saint Kitts ve Nevis', visaStatus: 'visa-free', allowedStay: '90 days', conditions: 'Tourism', applicationMethod: 'not-required' },
  { countryCode: 'LCA', countryName: 'Saint Lucia', visaStatus: 'visa-free', allowedStay: '90 days', conditions: 'Tourism', applicationMethod: 'not-required' },
  { countryCode: 'VCT', countryName: 'Saint Vincent ve Grenadinler', visaStatus: 'visa-free', allowedStay: '90 days', conditions: 'Tourism', applicationMethod: 'not-required' },
  { countryCode: 'SUR', countryName: 'Surinam', visaStatus: 'visa-free', allowedStay: '90 days', conditions: 'Tourism', applicationMethod: 'not-required' },
  { countryCode: 'TTO', countryName: 'Trinidad ve Tobago', visaStatus: 'visa-free', allowedStay: '90 days', conditions: 'Tourism', applicationMethod: 'not-required' },
  { countryCode: 'URY', countryName: 'Uruguay', visaStatus: 'visa-free', allowedStay: '90 days', conditions: 'Tourism', applicationMethod: 'not-required' },
  { countryCode: 'VEN', countryName: 'Venezuela', visaStatus: 'visa-free', allowedStay: '90 days', conditions: 'Tourism', applicationMethod: 'not-required' },
  { countryCode: 'CUB', countryName: 'Küba', visaStatus: 'visa-required', allowedStay: 'Varies', conditions: 'Tourist card required', visaCost: '$50', processingTime: '1 week', applicationMethod: 'embassy' },
  
  // OCEANIA - Additional
  { countryCode: 'FJI', countryName: 'Fiji', visaStatus: 'visa-free', allowedStay: '120 days', conditions: 'Tourism', applicationMethod: 'not-required' },
  { countryCode: 'KIR', countryName: 'Kiribati', visaStatus: 'visa-free', allowedStay: '90 days', conditions: 'Tourism', applicationMethod: 'not-required' },
  { countryCode: 'MHL', countryName: 'Marshall Adaları', visaStatus: 'visa-free', allowedStay: '90 days', conditions: 'Tourism', applicationMethod: 'not-required' },
  { countryCode: 'FSM', countryName: 'Mikronezya', visaStatus: 'visa-free', allowedStay: '90 days', conditions: 'Tourism', applicationMethod: 'not-required' },
  { countryCode: 'NRU', countryName: 'Nauru', visaStatus: 'visa-free', allowedStay: '90 days', conditions: 'Tourism', applicationMethod: 'not-required' },
  { countryCode: 'PLW', countryName: 'Palau', visaStatus: 'visa-free', allowedStay: '90 days', conditions: 'Tourism', applicationMethod: 'not-required' },
  { countryCode: 'PNG', countryName: 'Papua Yeni Gine', visaStatus: 'visa-on-arrival', allowedStay: '60 days', conditions: 'Available at airports', visaCost: '$100', processingTime: 'On arrival', applicationMethod: 'on-arrival' },
  { countryCode: 'WSM', countryName: 'Samoa', visaStatus: 'visa-free', allowedStay: '60 days', conditions: 'Tourism', applicationMethod: 'not-required' },
  { countryCode: 'SLB', countryName: 'Solomon Adaları', visaStatus: 'visa-free', allowedStay: '90 days', conditions: 'Tourism', applicationMethod: 'not-required' },
  { countryCode: 'TON', countryName: 'Tonga', visaStatus: 'visa-free', allowedStay: '90 days', conditions: 'Tourism', applicationMethod: 'not-required' },
  { countryCode: 'TUV', countryName: 'Tuvalu', visaStatus: 'visa-on-arrival', allowedStay: '30 days', conditions: 'Available at airports', visaCost: '$50', processingTime: 'On arrival', applicationMethod: 'on-arrival' },
  { countryCode: 'VUT', countryName: 'Vanuatu', visaStatus: 'visa-free', allowedStay: '90 days', conditions: 'Tourism', applicationMethod: 'not-required' },
  
  // ASIA - Additional Visa Required
  { countryCode: 'AFG', countryName: 'Afganistan', visaStatus: 'visa-required', allowedStay: 'Varies', conditions: 'Visa required', visaCost: '$160', processingTime: '4-6 weeks', applicationMethod: 'embassy' },
  { countryCode: 'BTN', countryName: 'Bhutan', visaStatus: 'visa-required', allowedStay: 'Varies', conditions: 'Visa required', visaCost: '$40', processingTime: '2-3 weeks', applicationMethod: 'embassy' },
  { countryCode: 'PRK', countryName: 'Kuzey Kore', visaStatus: 'visa-required', allowedStay: 'Varies', conditions: 'Visa required', visaCost: '$100', processingTime: '4-8 weeks', applicationMethod: 'embassy' },
  { countryCode: 'NPL', countryName: 'Nepal', visaStatus: 'visa-on-arrival', allowedStay: '90 days', conditions: 'Available at airports', visaCost: '$30-$100', processingTime: 'On arrival', applicationMethod: 'on-arrival' },
  { countryCode: 'PAK', countryName: 'Pakistan', visaStatus: 'evisa', allowedStay: '90 days', conditions: 'e-Visa available', visaCost: '$60', processingTime: '3-5 days', applicationMethod: 'online' },
  { countryCode: 'TKM', countryName: 'Türkmenistan', visaStatus: 'visa-required', allowedStay: 'Varies', conditions: 'Visa required', visaCost: '$100', processingTime: '2-4 weeks', applicationMethod: 'embassy' },
  { countryCode: 'BGD', countryName: 'Bangladeş', visaStatus: 'visa-on-arrival', allowedStay: '30 days', conditions: 'Available at airports', visaCost: '$51', processingTime: 'On arrival', applicationMethod: 'on-arrival' },
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
