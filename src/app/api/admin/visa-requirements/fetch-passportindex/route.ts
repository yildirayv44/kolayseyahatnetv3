import { NextRequest, NextResponse } from 'next/server';

/**
 * Fetch visa requirements from PassportIndex for Turkish passport holders
 * 
 * PassportIndex Categories (OFFICIAL):
 * - visa-free (69 countries): No visa required - GREEN
 * - visa-on-arrival (48 countries): Visa available at border/airport - BLUE
 * - eta (6 countries): Electronic Travel Authorization required - ORANGE
 * - visa-required (75 countries): Must apply at embassy/consulate - RED
 * 
 * Total: 198 countries
 * Data source: https://www.passportindex.org/passport/turkey/
 * Last updated: December 8, 2024
 */

interface VisaRequirement {
  countryCode: string;
  countryName: string;
  visaStatus: 'visa-free' | 'visa-on-arrival' | 'eta' | 'visa-required';
  allowedStay?: string;
  conditions?: string;
  visaCost?: string;
  processingTime?: string;
  applicationMethod?: 'online' | 'embassy' | 'on-arrival' | 'not-required';
}

// Generated from PassportIndex data
// Total countries: 198
const TURKISH_PASSPORT_VISA_REQUIREMENTS: VisaRequirement[] = [
  { countryCode: 'AFG', countryName: 'Afganistan', visaStatus: 'visa-required', conditions: 'Visa required', applicationMethod: 'embassy' },
  { countryCode: 'ALB', countryName: 'Arnavutluk', visaStatus: 'visa-free', conditions: 'Tourism', applicationMethod: 'not-required' },
  { countryCode: 'DZA', countryName: 'Cezayir', visaStatus: 'visa-required', conditions: 'Visa required', applicationMethod: 'embassy' },
  { countryCode: 'AND', countryName: 'Andorra', visaStatus: 'visa-required', conditions: 'Visa required', applicationMethod: 'embassy' },
  { countryCode: 'AGO', countryName: 'Angola', visaStatus: 'visa-free', allowedStay: '30 days', conditions: 'Tourism', applicationMethod: 'not-required' },
  { countryCode: 'ATG', countryName: 'Antigua ve Barbuda', visaStatus: 'visa-free', allowedStay: '180 days', conditions: 'Tourism', applicationMethod: 'not-required' },
  { countryCode: 'ARG', countryName: 'Arjantin', visaStatus: 'visa-free', allowedStay: '90 days', conditions: 'Tourism', applicationMethod: 'not-required' },
  { countryCode: 'ARM', countryName: 'Ermenistan', visaStatus: 'visa-on-arrival', allowedStay: '120 days', conditions: 'eVisa or visa on arrival', applicationMethod: 'on-arrival' },
  { countryCode: 'AUS', countryName: 'Avustralya', visaStatus: 'visa-required', conditions: 'eVisa available online', applicationMethod: 'online' },
  { countryCode: 'AUT', countryName: 'Avusturya', visaStatus: 'visa-required', conditions: 'Visa required', applicationMethod: 'embassy' },
  { countryCode: 'AZE', countryName: 'Azerbaycan', visaStatus: 'visa-free', allowedStay: '90 days', conditions: 'Tourism', applicationMethod: 'not-required' },
  { countryCode: 'BHS', countryName: 'Bahamalar', visaStatus: 'visa-free', allowedStay: '240 days', conditions: 'Tourism', applicationMethod: 'not-required' },
  { countryCode: 'BHR', countryName: 'Bahreyn', visaStatus: 'visa-required', conditions: 'eVisa available online', applicationMethod: 'online' },
  { countryCode: 'BGD', countryName: 'Bangladeş', visaStatus: 'visa-on-arrival', allowedStay: '30 days', conditions: 'Visa on arrival', applicationMethod: 'on-arrival' },
  { countryCode: 'BRB', countryName: 'Barbados', visaStatus: 'visa-free', allowedStay: '180 days', conditions: 'Tourism', applicationMethod: 'not-required' },
  { countryCode: 'BLR', countryName: 'Belarus', visaStatus: 'visa-free', allowedStay: '30 days', conditions: 'Tourism', applicationMethod: 'not-required' },
  { countryCode: 'BEL', countryName: 'Belçika', visaStatus: 'visa-required', conditions: 'Visa required', applicationMethod: 'embassy' },
  { countryCode: 'BLZ', countryName: 'Belize', visaStatus: 'visa-free', allowedStay: '90 days', conditions: 'Tourism', applicationMethod: 'not-required' },
  { countryCode: 'BEN', countryName: 'Benin', visaStatus: 'visa-required', conditions: 'eVisa available online', applicationMethod: 'online' },
  { countryCode: 'BTN', countryName: 'Bhutan', visaStatus: 'visa-required', conditions: 'eVisa available online', applicationMethod: 'online' },
  { countryCode: 'BOL', countryName: 'Bolivya', visaStatus: 'visa-free', allowedStay: '90 days', conditions: 'Tourism', applicationMethod: 'not-required' },
  { countryCode: 'BIH', countryName: 'Bosna-Hersek', visaStatus: 'visa-free', allowedStay: '90 days', conditions: 'Tourism', applicationMethod: 'not-required' },
  { countryCode: 'BWA', countryName: 'Botsvana', visaStatus: 'visa-free', allowedStay: '90 days', conditions: 'Tourism', applicationMethod: 'not-required' },
  { countryCode: 'BRA', countryName: 'Brezilya', visaStatus: 'visa-free', allowedStay: '90 days', conditions: 'Tourism', applicationMethod: 'not-required' },
  { countryCode: 'BRN', countryName: 'Brunei', visaStatus: 'visa-free', allowedStay: '30 days', conditions: 'Tourism', applicationMethod: 'not-required' },
  { countryCode: 'BGR', countryName: 'Bulgaristan', visaStatus: 'visa-required', conditions: 'Visa required', applicationMethod: 'embassy' },
  { countryCode: 'BFA', countryName: 'Burkina Faso', visaStatus: 'visa-required', conditions: 'eVisa available online', applicationMethod: 'online' },
  { countryCode: 'BDI', countryName: 'Burundi', visaStatus: 'visa-on-arrival', allowedStay: '30 days', conditions: 'eVisa or visa on arrival', applicationMethod: 'on-arrival' },
  { countryCode: 'KHM', countryName: 'Kamboçya', visaStatus: 'visa-on-arrival', allowedStay: '30 days', conditions: 'eVisa or visa on arrival', applicationMethod: 'on-arrival' },
  { countryCode: 'CMR', countryName: 'Kamerun', visaStatus: 'visa-required', conditions: 'eVisa available online', applicationMethod: 'online' },
  { countryCode: 'CAN', countryName: 'Kanada', visaStatus: 'visa-required', conditions: 'Visa required', applicationMethod: 'embassy' },
  { countryCode: 'CPV', countryName: 'Cape Verde', visaStatus: 'visa-on-arrival', conditions: 'Visa on arrival', applicationMethod: 'on-arrival' },
  { countryCode: 'CAF', countryName: 'Orta Afrika Cumhuriyeti', visaStatus: 'visa-required', conditions: 'Visa required', applicationMethod: 'embassy' },
  { countryCode: 'TCD', countryName: 'Çad', visaStatus: 'visa-required', conditions: 'eVisa available online', applicationMethod: 'online' },
  { countryCode: 'CHL', countryName: 'Şili', visaStatus: 'visa-free', allowedStay: '90 days', conditions: 'Tourism', applicationMethod: 'not-required' },
  { countryCode: 'CHN', countryName: 'Çin', visaStatus: 'visa-required', conditions: 'Visa required', applicationMethod: 'embassy' },
  { countryCode: 'COL', countryName: 'Kolombiya', visaStatus: 'visa-free', allowedStay: '90 days', conditions: 'Tourism', applicationMethod: 'not-required' },
  { countryCode: 'COM', countryName: 'Komorlar', visaStatus: 'visa-on-arrival', allowedStay: '45 days', conditions: 'Visa on arrival', applicationMethod: 'on-arrival' },
  { countryCode: 'COG', countryName: 'Kongo', visaStatus: 'visa-required', conditions: 'Visa required', applicationMethod: 'embassy' },
  { countryCode: 'COD', countryName: 'Kongo Demokratik Cumhuriyeti', visaStatus: 'visa-on-arrival', allowedStay: '7 days', conditions: 'eVisa or visa on arrival', applicationMethod: 'on-arrival' },
  { countryCode: 'CRI', countryName: 'Kosta Rika', visaStatus: 'visa-free', allowedStay: '30 days', conditions: 'Tourism', applicationMethod: 'not-required' },
  { countryCode: 'CIV', countryName: 'Fildişi Sahili', visaStatus: 'eta', allowedStay: '90 days', conditions: 'pre-enrollment', applicationMethod: 'online' },
  { countryCode: 'HRV', countryName: 'Hırvatistan', visaStatus: 'visa-required', conditions: 'Visa required', applicationMethod: 'embassy' },
  { countryCode: 'CUB', countryName: 'Küba', visaStatus: 'visa-on-arrival', allowedStay: '90 days', conditions: 'eVisa or visa on arrival', applicationMethod: 'on-arrival' },
  { countryCode: 'CYP', countryName: 'Kıbrıs', visaStatus: 'visa-required', conditions: 'Visa required', applicationMethod: 'embassy' },
  { countryCode: 'CZE', countryName: 'Çekya', visaStatus: 'visa-required', conditions: 'Visa required', applicationMethod: 'embassy' },
  { countryCode: 'DNK', countryName: 'Danimarka', visaStatus: 'visa-required', conditions: 'Visa required', applicationMethod: 'embassy' },
  { countryCode: 'DJI', countryName: 'Cibuti', visaStatus: 'visa-on-arrival', allowedStay: '90 days', conditions: 'eVisa or visa on arrival', applicationMethod: 'on-arrival' },
  { countryCode: 'DMA', countryName: 'Dominika', visaStatus: 'visa-free', allowedStay: '21 days', conditions: 'Tourism', applicationMethod: 'not-required' },
  { countryCode: 'DOM', countryName: 'Dominik Cumhuriyeti', visaStatus: 'visa-free', allowedStay: '30 days', conditions: 'Tourism', applicationMethod: 'not-required' },
  { countryCode: 'ECU', countryName: 'Ekvador', visaStatus: 'visa-free', allowedStay: '90 days', conditions: 'Tourism', applicationMethod: 'not-required' },
  { countryCode: 'EGY', countryName: 'Mısır', visaStatus: 'visa-on-arrival', allowedStay: '30 days', conditions: 'Visa on arrival', applicationMethod: 'on-arrival' },
  { countryCode: 'SLV', countryName: 'El Salvador', visaStatus: 'visa-free', allowedStay: '180 days', conditions: 'Tourism', applicationMethod: 'not-required' },
  { countryCode: 'GNQ', countryName: 'Ekvator Ginesi', visaStatus: 'visa-free', allowedStay: '90 days', conditions: 'Tourism', applicationMethod: 'not-required' },
  { countryCode: 'ERI', countryName: 'Eritre', visaStatus: 'visa-required', conditions: 'Visa required', applicationMethod: 'embassy' },
  { countryCode: 'EST', countryName: 'Estonya', visaStatus: 'visa-required', conditions: 'Visa required', applicationMethod: 'embassy' },
  { countryCode: 'SWZ', countryName: 'Eswatini', visaStatus: 'visa-free', allowedStay: '30 days', conditions: 'Tourism', applicationMethod: 'not-required' },
  { countryCode: 'ETH', countryName: 'Etiyopya', visaStatus: 'visa-on-arrival', allowedStay: '90 days', conditions: 'eVisa or visa on arrival', applicationMethod: 'on-arrival' },
  { countryCode: 'FJI', countryName: 'Fiji', visaStatus: 'visa-free', allowedStay: '120 days', conditions: 'Tourism', applicationMethod: 'not-required' },
  { countryCode: 'FIN', countryName: 'Finlandiya', visaStatus: 'visa-required', conditions: 'Visa required', applicationMethod: 'embassy' },
  { countryCode: 'FRA', countryName: 'Fransa', visaStatus: 'visa-required', conditions: 'Visa required', applicationMethod: 'embassy' },
  { countryCode: 'GAB', countryName: 'Gabon', visaStatus: 'visa-on-arrival', allowedStay: '90 days', conditions: 'eVisa or visa on arrival', applicationMethod: 'on-arrival' },
  { countryCode: 'GMB', countryName: 'Gambiya', visaStatus: 'visa-free', allowedStay: '90 days', conditions: 'Tourism', applicationMethod: 'not-required' },
  { countryCode: 'GEO', countryName: 'Gürcistan', visaStatus: 'visa-free', allowedStay: '360 days', conditions: 'Tourism', applicationMethod: 'not-required' },
  { countryCode: 'DEU', countryName: 'Almanya', visaStatus: 'visa-required', conditions: 'Visa required', applicationMethod: 'embassy' },
  { countryCode: 'GHA', countryName: 'Gana', visaStatus: 'visa-required', conditions: 'Visa required', applicationMethod: 'embassy' },
  { countryCode: 'GRC', countryName: 'Yunanistan', visaStatus: 'visa-required', conditions: 'Visa required', applicationMethod: 'embassy' },
  { countryCode: 'GRD', countryName: 'Grenada', visaStatus: 'visa-required', conditions: 'Visa required', applicationMethod: 'embassy' },
  { countryCode: 'GTM', countryName: 'Guatemala', visaStatus: 'visa-free', allowedStay: '90 days', conditions: 'Tourism', applicationMethod: 'not-required' },
  { countryCode: 'GIN', countryName: 'Gine', visaStatus: 'visa-on-arrival', allowedStay: '90 days', conditions: 'eVisa or visa on arrival', applicationMethod: 'on-arrival' },
  { countryCode: 'GNB', countryName: 'Gine-Bissau', visaStatus: 'visa-on-arrival', allowedStay: '90 days', conditions: 'Visa on arrival', applicationMethod: 'on-arrival' },
  { countryCode: 'GUY', countryName: 'Guyana', visaStatus: 'visa-required', conditions: 'eVisa available online', applicationMethod: 'online' },
  { countryCode: 'HTI', countryName: 'Haiti', visaStatus: 'visa-free', allowedStay: '90 days', conditions: 'Tourism', applicationMethod: 'not-required' },
  { countryCode: 'HND', countryName: 'Honduras', visaStatus: 'visa-free', allowedStay: '90 days', conditions: 'Tourism', applicationMethod: 'not-required' },
  { countryCode: 'HKG', countryName: 'Hong Kong', visaStatus: 'visa-free', allowedStay: '90 days', conditions: 'Tourism', applicationMethod: 'not-required' },
  { countryCode: 'HUN', countryName: 'Macaristan', visaStatus: 'visa-required', conditions: 'Visa required', applicationMethod: 'embassy' },
  { countryCode: 'ISL', countryName: 'İzlanda', visaStatus: 'visa-required', conditions: 'Visa required', applicationMethod: 'embassy' },
  { countryCode: 'IND', countryName: 'Hindistan', visaStatus: 'visa-required', conditions: 'Visa required', applicationMethod: 'embassy' },
  { countryCode: 'IDN', countryName: 'Endonezya', visaStatus: 'visa-free', allowedStay: '30 days', conditions: 'Tourism', applicationMethod: 'not-required' },
  { countryCode: 'IRN', countryName: 'İran', visaStatus: 'visa-free', allowedStay: '90 days', conditions: 'Tourism', applicationMethod: 'not-required' },
  { countryCode: 'IRQ', countryName: 'Irak', visaStatus: 'visa-required', conditions: 'eVisa available online', applicationMethod: 'online' },
  { countryCode: 'IRL', countryName: 'İrlanda', visaStatus: 'visa-required', conditions: 'Visa required', applicationMethod: 'embassy' },
  { countryCode: 'ISR', countryName: 'İsrail', visaStatus: 'visa-required', conditions: 'eVisa available online', applicationMethod: 'online' },
  { countryCode: 'ITA', countryName: 'İtalya', visaStatus: 'visa-required', conditions: 'Visa required', applicationMethod: 'embassy' },
  { countryCode: 'JAM', countryName: 'Jamaika', visaStatus: 'visa-free', allowedStay: '90 days', conditions: 'Tourism', applicationMethod: 'not-required' },
  { countryCode: 'JPN', countryName: 'Japonya', visaStatus: 'visa-free', allowedStay: '90 days', conditions: 'Tourism', applicationMethod: 'not-required' },
  { countryCode: 'JOR', countryName: 'Ürdün', visaStatus: 'visa-free', allowedStay: '90 days', conditions: 'Tourism', applicationMethod: 'not-required' },
  { countryCode: 'KAZ', countryName: 'Kazakistan', visaStatus: 'visa-free', allowedStay: '90 days', conditions: 'Tourism', applicationMethod: 'not-required' },
  { countryCode: 'KEN', countryName: 'Kenya', visaStatus: 'eta', allowedStay: '90 days', conditions: 'eTA required', applicationMethod: 'online' },
  { countryCode: 'KIR', countryName: 'Kiribati', visaStatus: 'visa-required', conditions: 'Visa required', applicationMethod: 'embassy' },
  { countryCode: 'XKX', countryName: 'Kosova', visaStatus: 'visa-free', allowedStay: '90 days', conditions: 'Tourism', applicationMethod: 'not-required' },
  { countryCode: 'KWT', countryName: 'Kuveyt', visaStatus: 'visa-on-arrival', allowedStay: '90 days', conditions: 'eVisa or visa on arrival', applicationMethod: 'on-arrival' },
  { countryCode: 'KGZ', countryName: 'Kırgızistan', visaStatus: 'visa-free', allowedStay: '90 days', conditions: 'Tourism', applicationMethod: 'not-required' },
  { countryCode: 'LAO', countryName: 'Laos', visaStatus: 'visa-on-arrival', allowedStay: '30 days', conditions: 'eVisa or visa on arrival', applicationMethod: 'on-arrival' },
  { countryCode: 'LVA', countryName: 'Letonya', visaStatus: 'visa-required', conditions: 'Visa required', applicationMethod: 'embassy' },
  { countryCode: 'LBN', countryName: 'Lübnan', visaStatus: 'visa-on-arrival', allowedStay: '30 days', conditions: 'Visa on arrival', applicationMethod: 'on-arrival' },
  { countryCode: 'LSO', countryName: 'Lesotho', visaStatus: 'visa-required', conditions: 'Visa required', applicationMethod: 'embassy' },
  { countryCode: 'LBR', countryName: 'Liberya', visaStatus: 'visa-required', conditions: 'eVisa available online', applicationMethod: 'online' },
  { countryCode: 'LBY', countryName: 'Libya', visaStatus: 'visa-required', conditions: 'eVisa available online', applicationMethod: 'online' },
  { countryCode: 'LIE', countryName: 'Lihtenştayn', visaStatus: 'visa-required', conditions: 'Visa required', applicationMethod: 'embassy' },
  { countryCode: 'LTU', countryName: 'Litvanya', visaStatus: 'visa-required', conditions: 'Visa required', applicationMethod: 'embassy' },
  { countryCode: 'LUX', countryName: 'Lüksemburg', visaStatus: 'visa-required', conditions: 'Visa required', applicationMethod: 'embassy' },
  { countryCode: 'MAC', countryName: 'Makao', visaStatus: 'visa-free', allowedStay: '30 days', conditions: 'Tourism', applicationMethod: 'not-required' },
  { countryCode: 'MDG', countryName: 'Madagaskar', visaStatus: 'visa-on-arrival', allowedStay: '90 days', conditions: 'eVisa or visa on arrival', applicationMethod: 'on-arrival' },
  { countryCode: 'MWI', countryName: 'Malavi', visaStatus: 'visa-on-arrival', allowedStay: '90 days', conditions: 'eVisa or visa on arrival', applicationMethod: 'on-arrival' },
  { countryCode: 'MYS', countryName: 'Malezya', visaStatus: 'visa-free', allowedStay: '90 days', conditions: 'Tourism', applicationMethod: 'not-required' },
  { countryCode: 'MDV', countryName: 'Maldivler', visaStatus: 'visa-on-arrival', allowedStay: '30 days', conditions: 'Visa on arrival', applicationMethod: 'on-arrival' },
  { countryCode: 'MLI', countryName: 'Mali', visaStatus: 'visa-required', conditions: 'Visa required', applicationMethod: 'embassy' },
  { countryCode: 'MLT', countryName: 'Malta', visaStatus: 'visa-required', conditions: 'Visa required', applicationMethod: 'embassy' },
  { countryCode: 'MHL', countryName: 'Marshall Adaları', visaStatus: 'visa-on-arrival', allowedStay: '90 days', conditions: 'Visa on arrival', applicationMethod: 'on-arrival' },
  { countryCode: 'MRT', countryName: 'Moritanya', visaStatus: 'visa-on-arrival', allowedStay: '90 days', conditions: 'eVisa or visa on arrival', applicationMethod: 'on-arrival' },
  { countryCode: 'MUS', countryName: 'Mauritius', visaStatus: 'visa-free', allowedStay: '90 days', conditions: 'Tourism', applicationMethod: 'not-required' },
  { countryCode: 'MEX', countryName: 'Meksika', visaStatus: 'eta', allowedStay: '180 days', conditions: 'eTA required', applicationMethod: 'online' },
  { countryCode: 'FSM', countryName: 'Mikronezya', visaStatus: 'visa-free', allowedStay: '30 days', conditions: 'Tourism', applicationMethod: 'not-required' },
  { countryCode: 'MDA', countryName: 'Moldova', visaStatus: 'visa-free', allowedStay: '90 days', conditions: 'Tourism', applicationMethod: 'not-required' },
  { countryCode: 'MCO', countryName: 'Monako', visaStatus: 'visa-required', conditions: 'Visa required', applicationMethod: 'embassy' },
  { countryCode: 'MNG', countryName: 'Moğolistan', visaStatus: 'visa-free', allowedStay: '30 days', conditions: 'Tourism', applicationMethod: 'not-required' },
  { countryCode: 'MNE', countryName: 'Karadağ', visaStatus: 'visa-required', conditions: 'Visa required', applicationMethod: 'embassy' },
  { countryCode: 'MAR', countryName: 'Fas', visaStatus: 'visa-free', allowedStay: '90 days', conditions: 'Tourism', applicationMethod: 'not-required' },
  { countryCode: 'MOZ', countryName: 'Mozambik', visaStatus: 'visa-on-arrival', allowedStay: '30 days', conditions: 'eVisa or visa on arrival', applicationMethod: 'on-arrival' },
  { countryCode: 'MMR', countryName: 'Myanmar', visaStatus: 'visa-required', conditions: 'eVisa available online', applicationMethod: 'online' },
  { countryCode: 'NAM', countryName: 'Namibya', visaStatus: 'visa-on-arrival', allowedStay: '90 days', conditions: 'eVisa or visa on arrival', applicationMethod: 'on-arrival' },
  { countryCode: 'NRU', countryName: 'Nauru', visaStatus: 'visa-required', conditions: 'Visa required', applicationMethod: 'embassy' },
  { countryCode: 'NPL', countryName: 'Nepal', visaStatus: 'visa-on-arrival', allowedStay: '150 days', conditions: 'eVisa or visa on arrival', applicationMethod: 'on-arrival' },
  { countryCode: 'NLD', countryName: 'Hollanda', visaStatus: 'visa-required', conditions: 'Visa required', applicationMethod: 'embassy' },
  { countryCode: 'NZL', countryName: 'Yeni Zelanda', visaStatus: 'visa-required', conditions: 'Visa required', applicationMethod: 'embassy' },
  { countryCode: 'NIC', countryName: 'Nikaragua', visaStatus: 'visa-free', allowedStay: '90 days', conditions: 'Tourism', applicationMethod: 'not-required' },
  { countryCode: 'NER', countryName: 'Nijer', visaStatus: 'visa-required', conditions: 'Visa required', applicationMethod: 'embassy' },
  { countryCode: 'NGA', countryName: 'Nijerya', visaStatus: 'visa-on-arrival', allowedStay: '90 days', conditions: 'eVisa or visa on arrival', applicationMethod: 'on-arrival' },
  { countryCode: 'PRK', countryName: 'Kuzey Kore', visaStatus: 'visa-required', conditions: 'Visa required', applicationMethod: 'embassy' },
  { countryCode: 'MKD', countryName: 'Kuzey Makedonya', visaStatus: 'visa-free', allowedStay: '90 days', conditions: 'Tourism', applicationMethod: 'not-required' },
  { countryCode: 'NOR', countryName: 'Norveç', visaStatus: 'visa-required', conditions: 'Visa required', applicationMethod: 'embassy' },
  { countryCode: 'OMN', countryName: 'Umman', visaStatus: 'visa-on-arrival', allowedStay: '30 days', conditions: 'eVisa or visa on arrival', applicationMethod: 'on-arrival' },
  { countryCode: 'PAK', countryName: 'Pakistan', visaStatus: 'visa-on-arrival', allowedStay: '30 days', conditions: 'eVisa or visa on arrival', applicationMethod: 'on-arrival' },
  { countryCode: 'PLW', countryName: 'Palau', visaStatus: 'visa-on-arrival', allowedStay: '30 days', conditions: 'Visa on arrival', applicationMethod: 'on-arrival' },
  { countryCode: 'PSE', countryName: 'Filistin', visaStatus: 'visa-free', conditions: 'Tourism', applicationMethod: 'not-required' },
  { countryCode: 'PAN', countryName: 'Panama', visaStatus: 'visa-free', allowedStay: '90 days', conditions: 'Tourism', applicationMethod: 'not-required' },
  { countryCode: 'PNG', countryName: 'Papua Yeni Gine', visaStatus: 'visa-required', conditions: 'eVisa available online', applicationMethod: 'online' },
  { countryCode: 'PRY', countryName: 'Paraguay', visaStatus: 'visa-free', allowedStay: '90 days', conditions: 'Tourism', applicationMethod: 'not-required' },
  { countryCode: 'PER', countryName: 'Peru', visaStatus: 'visa-free', allowedStay: '180 days', conditions: 'Tourism', applicationMethod: 'not-required' },
  { countryCode: 'PHL', countryName: 'Filipinler', visaStatus: 'visa-free', allowedStay: '30 days', conditions: 'Tourism', applicationMethod: 'not-required' },
  { countryCode: 'POL', countryName: 'Polonya', visaStatus: 'visa-required', conditions: 'Visa required', applicationMethod: 'embassy' },
  { countryCode: 'PRT', countryName: 'Portekiz', visaStatus: 'visa-required', conditions: 'Visa required', applicationMethod: 'embassy' },
  { countryCode: 'QAT', countryName: 'Katar', visaStatus: 'visa-on-arrival', allowedStay: '30 days', conditions: 'eVisa or visa on arrival', applicationMethod: 'on-arrival' },
  { countryCode: 'ROU', countryName: 'Romanya', visaStatus: 'visa-required', conditions: 'Visa required', applicationMethod: 'embassy' },
  { countryCode: 'RUS', countryName: 'Rusya', visaStatus: 'visa-on-arrival', allowedStay: '30 days', conditions: 'eVisa or visa on arrival', applicationMethod: 'on-arrival' },
  { countryCode: 'RWA', countryName: 'Ruanda', visaStatus: 'visa-on-arrival', allowedStay: '30 days', conditions: 'eVisa or visa on arrival', applicationMethod: 'on-arrival' },
  { countryCode: 'KNA', countryName: 'Saint Kitts ve Nevis', visaStatus: 'eta', allowedStay: '90 days', conditions: 'eTA required', applicationMethod: 'online' },
  { countryCode: 'LCA', countryName: 'Saint Lucia', visaStatus: 'visa-free', allowedStay: '42 days', conditions: 'Tourism', applicationMethod: 'not-required' },
  { countryCode: 'WSM', countryName: 'Samoa', visaStatus: 'visa-on-arrival', allowedStay: '90 days', conditions: 'Visa on arrival', applicationMethod: 'on-arrival' },
  { countryCode: 'SMR', countryName: 'San Marino', visaStatus: 'visa-required', conditions: 'Visa required', applicationMethod: 'embassy' },
  { countryCode: 'STP', countryName: 'São Tomé ve Príncipe', visaStatus: 'visa-free', allowedStay: '15 days', conditions: 'Tourism', applicationMethod: 'not-required' },
  { countryCode: 'SAU', countryName: 'Suudi Arabistan', visaStatus: 'visa-on-arrival', allowedStay: '90 days', conditions: 'eVisa or visa on arrival', applicationMethod: 'on-arrival' },
  { countryCode: 'SEN', countryName: 'Senegal', visaStatus: 'visa-on-arrival', allowedStay: '30 days', conditions: 'Visa on arrival', applicationMethod: 'on-arrival' },
  { countryCode: 'SRB', countryName: 'Sırbistan', visaStatus: 'visa-free', allowedStay: '90 days', conditions: 'Tourism', applicationMethod: 'not-required' },
  { countryCode: 'SYC', countryName: 'Seyşeller', visaStatus: 'eta', allowedStay: '90 days', conditions: 'tourist registration', applicationMethod: 'online' },
  { countryCode: 'SLE', countryName: 'Sierra Leone', visaStatus: 'visa-on-arrival', allowedStay: '30 days', conditions: 'eVisa or visa on arrival', applicationMethod: 'on-arrival' },
  { countryCode: 'SGP', countryName: 'Singapur', visaStatus: 'visa-free', allowedStay: '30 days', conditions: 'Tourism', applicationMethod: 'not-required' },
  { countryCode: 'SVK', countryName: 'Slovakya', visaStatus: 'visa-required', conditions: 'Visa required', applicationMethod: 'embassy' },
  { countryCode: 'SVN', countryName: 'Slovenya', visaStatus: 'visa-required', conditions: 'Visa required', applicationMethod: 'embassy' },
  { countryCode: 'SLB', countryName: 'Solomon Adaları', visaStatus: 'visa-required', conditions: 'Visa required', applicationMethod: 'embassy' },
  { countryCode: 'SOM', countryName: 'Somali', visaStatus: 'visa-required', conditions: 'eVisa available online', applicationMethod: 'online' },
  { countryCode: 'ZAF', countryName: 'Güney Afrika', visaStatus: 'visa-free', allowedStay: '30 days', conditions: 'Tourism', applicationMethod: 'not-required' },
  { countryCode: 'KOR', countryName: 'Güney Kore', visaStatus: 'eta', allowedStay: '90 days', conditions: 'eTA required', applicationMethod: 'online' },
  { countryCode: 'SSD', countryName: 'Güney Sudan', visaStatus: 'visa-on-arrival', allowedStay: '90 days', conditions: 'eVisa or visa on arrival', applicationMethod: 'on-arrival' },
  { countryCode: 'ESP', countryName: 'İspanya', visaStatus: 'visa-required', conditions: 'Visa required', applicationMethod: 'embassy' },
  { countryCode: 'LKA', countryName: 'Sri Lanka', visaStatus: 'visa-on-arrival', allowedStay: '30 days', conditions: 'eVisa or visa on arrival', applicationMethod: 'on-arrival' },
  { countryCode: 'VCT', countryName: 'Saint Vincent ve Grenadinler', visaStatus: 'visa-free', allowedStay: '90 days', conditions: 'Tourism', applicationMethod: 'not-required' },
  { countryCode: 'SDN', countryName: 'Sudan', visaStatus: 'visa-on-arrival', allowedStay: '30 days', conditions: 'Visa on arrival', applicationMethod: 'on-arrival' },
  { countryCode: 'SUR', countryName: 'Surinam', visaStatus: 'visa-free', allowedStay: '90 days', conditions: 'Tourism', applicationMethod: 'not-required' },
  { countryCode: 'SWE', countryName: 'İsveç', visaStatus: 'visa-required', conditions: 'Visa required', applicationMethod: 'embassy' },
  { countryCode: 'CHE', countryName: 'İsviçre', visaStatus: 'visa-required', conditions: 'Visa required', applicationMethod: 'embassy' },
  { countryCode: 'SYR', countryName: 'Suriye', visaStatus: 'visa-free', allowedStay: '90 days', conditions: 'Tourism', applicationMethod: 'not-required' },
  { countryCode: 'TWN', countryName: 'Tayvan', visaStatus: 'visa-on-arrival', allowedStay: '30 days', conditions: 'eVisa or visa on arrival', applicationMethod: 'on-arrival' },
  { countryCode: 'TJK', countryName: 'Tacikistan', visaStatus: 'visa-required', conditions: 'Visa required', applicationMethod: 'embassy' },
  { countryCode: 'TZA', countryName: 'Tanzanya', visaStatus: 'visa-on-arrival', conditions: 'eVisa or visa on arrival', applicationMethod: 'on-arrival' },
  { countryCode: 'THA', countryName: 'Tayland', visaStatus: 'visa-free', allowedStay: '60 days', conditions: 'Tourism', applicationMethod: 'not-required' },
  { countryCode: 'TLS', countryName: 'Doğu Timor', visaStatus: 'visa-on-arrival', allowedStay: '30 days', conditions: 'Visa on arrival', applicationMethod: 'on-arrival' },
  { countryCode: 'TGO', countryName: 'Togo', visaStatus: 'visa-on-arrival', allowedStay: '15 days', conditions: 'eVisa or visa on arrival', applicationMethod: 'on-arrival' },
  { countryCode: 'TON', countryName: 'Tonga', visaStatus: 'visa-on-arrival', allowedStay: '31 days', conditions: 'Visa on arrival', applicationMethod: 'on-arrival' },
  { countryCode: 'TTO', countryName: 'Trinidad ve Tobago', visaStatus: 'visa-free', allowedStay: '90 days', conditions: 'Tourism', applicationMethod: 'not-required' },
  { countryCode: 'TUN', countryName: 'Tunus', visaStatus: 'visa-free', allowedStay: '90 days', conditions: 'Tourism', applicationMethod: 'not-required' },
  { countryCode: 'TKM', countryName: 'Türkmenistan', visaStatus: 'visa-required', conditions: 'Visa required', applicationMethod: 'embassy' },
  { countryCode: 'TUV', countryName: 'Tuvalu', visaStatus: 'visa-on-arrival', allowedStay: '30 days', conditions: 'Visa on arrival', applicationMethod: 'on-arrival' },
  { countryCode: 'UGA', countryName: 'Uganda', visaStatus: 'visa-on-arrival', conditions: 'eVisa or visa on arrival', applicationMethod: 'on-arrival' },
  { countryCode: 'UKR', countryName: 'Ukrayna', visaStatus: 'visa-free', allowedStay: '90 days', conditions: 'Tourism', applicationMethod: 'not-required' },
  { countryCode: 'ARE', countryName: 'Birleşik Arap Emirlikleri', visaStatus: 'visa-required', conditions: 'eVisa available online', applicationMethod: 'online' },
  { countryCode: 'GBR', countryName: 'Birleşik Krallık', visaStatus: 'visa-required', conditions: 'Visa required', applicationMethod: 'embassy' },
  { countryCode: 'USA', countryName: 'Amerika Birleşik Devletleri', visaStatus: 'visa-required', conditions: 'Visa required', applicationMethod: 'embassy' },
  { countryCode: 'URY', countryName: 'Uruguay', visaStatus: 'visa-free', allowedStay: '90 days', conditions: 'Tourism', applicationMethod: 'not-required' },
  { countryCode: 'UZB', countryName: 'Özbekistan', visaStatus: 'visa-free', allowedStay: '30 days', conditions: 'Tourism', applicationMethod: 'not-required' },
  { countryCode: 'VUT', countryName: 'Vanuatu', visaStatus: 'visa-free', allowedStay: '120 days', conditions: 'Tourism', applicationMethod: 'not-required' },
  { countryCode: 'VAT', countryName: 'Vatikan', visaStatus: 'visa-required', conditions: 'Visa required', applicationMethod: 'embassy' },
  { countryCode: 'VEN', countryName: 'Venezuela', visaStatus: 'visa-free', allowedStay: '90 days', conditions: 'Tourism', applicationMethod: 'not-required' },
  { countryCode: 'VNM', countryName: 'Vietnam', visaStatus: 'visa-on-arrival', allowedStay: '90 days', conditions: 'eVisa or visa on arrival', applicationMethod: 'on-arrival' },
  { countryCode: 'YEM', countryName: 'Yemen', visaStatus: 'visa-required', conditions: 'Visa required', applicationMethod: 'embassy' },
  { countryCode: 'ZMB', countryName: 'Zambiya', visaStatus: 'visa-free', allowedStay: '90 days', conditions: 'Tourism', applicationMethod: 'not-required' },
  { countryCode: 'ZWE', countryName: 'Zimbabve', visaStatus: 'visa-on-arrival', allowedStay: '90 days', conditions: 'eVisa or visa on arrival', applicationMethod: 'on-arrival' }
];

export async function GET(request: NextRequest) {
  try {
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
