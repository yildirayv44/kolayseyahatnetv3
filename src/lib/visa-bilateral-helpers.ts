/**
 * Helper functions for bilateral visa pages
 */

import { supabase } from './supabase';

/**
 * Check if a slug is a bilateral visa page
 * Patterns: 
 * - English: {source-country}-to-{destination-country}-visa
 * - Turkish: {source-country}-vatandaslari-{destination-country}-vizesi
 */
export function isBilateralVisaSlug(slug: string): boolean {
  return (
    (slug.includes('-to-') && slug.endsWith('-visa')) ||
    (slug.includes('-vatandaslari-') && slug.endsWith('-vizesi'))
  );
}

/**
 * Parse bilateral visa slug to extract country slugs
 * Examples: 
 * - "montenegro-to-kuwait-visa" -> { source: "montenegro", destination: "kuwait", locale: "en" }
 * - "karadag-vatandaslari-kuveyt-vizesi" -> { source: "karadag", destination: "kuveyt", locale: "tr" }
 */
export function parseBilateralVisaSlug(slug: string): { source: string; destination: string; locale: 'tr' | 'en' } | null {
  // Check for Turkish SEO format: source-vatandaslari-destination-vizesi
  if (slug.includes('-vatandaslari-') && slug.endsWith('-vizesi')) {
    const withoutSuffix = slug.replace('-vizesi', '');
    const parts = withoutSuffix.split('-vatandaslari-');
    if (parts.length === 2) {
      return { source: parts[0], destination: parts[1], locale: 'tr' };
    }
  }
  
  // Check for English format: source-to-destination-visa
  if (slug.includes('-to-') && slug.endsWith('-visa')) {
    const withoutSuffix = slug.replace('-visa', '');
    const parts = withoutSuffix.split('-to-');
    if (parts.length === 2) {
      return { source: parts[0], destination: parts[1], locale: 'en' };
    }
  }
  
  // Fallback to old format (for backward compatibility)
  const suffix = slug.endsWith('-vize') ? '-vize' : slug.endsWith('-visa') ? '-visa' : null;
  
  if (!suffix) return null;
  
  const locale = suffix === '-vize' ? 'tr' : 'en';
  const withoutSuffix = slug.replace(suffix, '');
  const parts = withoutSuffix.split('-');
  
  if (parts.length < 2) return null;
  
  // Find the split point - last part is destination, rest is source
  const destination = parts[parts.length - 1];
  const source = parts.slice(0, -1).join('-');
  
  return { source, destination, locale };
}

/**
 * Get bilateral visa page data from countries table
 * Bilateral pages are stored in countries table with source_country_code
 */
export async function getBilateralVisaPage(slug: string) {
  // Parse slug to get source and destination
  const parsed = parseBilateralVisaSlug(slug);
  if (!parsed) return null;
  
  const { source, destination } = parsed;
  
  // Get country codes from slugs
  const [sourceCode, destCode] = await Promise.all([
    getCountryCodeFromSlug(source),
    getCountryCodeFromSlug(destination)
  ]);
  
  if (!sourceCode || !destCode) return null;
  
  // Fetch bilateral country page from countries table
  const { data: bilateralCountry, error } = await supabase
    .from('countries')
    .select('*')
    .eq('country_code', destCode)
    .eq('source_country_code', sourceCode)
    .eq('status', 1)
    .maybeSingle();

  if (error) {
    console.error('Error fetching bilateral visa page:', error);
    return null;
  }

  if (!bilateralCountry) {
    return null;
  }

  // Fetch source and destination country names
  const { data: countries } = await supabase
    .from('countries')
    .select('name, name_en, country_code, flag_emoji')
    .in('country_code', [sourceCode, destCode])
    .is('source_country_code', null);

  const sourceCountry = countries?.find(c => c.country_code === sourceCode);
  const destinationCountry = countries?.find(c => c.country_code === destCode);

  return {
    ...bilateralCountry,
    source_country_code: sourceCode,
    destination_country_code: destCode,
    source_country: sourceCountry,
    destination_country: destinationCountry,
    slug: slug
  };
}

/**
 * Get country code from country slug
 * Supports both database slugs and dynamically generated slugs from country names
 */
export async function getCountryCodeFromSlug(countrySlug: string): Promise<string | null> {
  // First try direct slug match in countries table
  const { data: directMatch } = await supabase
    .from('countries')
    .select('country_code')
    .eq('slug', countrySlug)
    .eq('status', 1)
    .maybeSingle();

  if (directMatch) {
    return directMatch.country_code;
  }

  // Second try: find by taxonomy slug
  const { data: taxonomy } = await supabase
    .from('taxonomies')
    .select('model_id')
    .eq('slug', countrySlug)
    .eq('type', 'Country\\CountryController@detail')
    .maybeSingle();

  if (taxonomy) {
    const { data: country } = await supabase
      .from('countries')
      .select('country_code')
      .eq('id', taxonomy.model_id)
      .maybeSingle();
    
    return country?.country_code || null;
  }

  // Fallback: Get all countries and match by slugified name
  const { data: countries } = await supabase
    .from('countries')
    .select('country_code, name, name_en')
    .eq('status', 1);

  if (countries) {
    const slugify = (text: string) => 
      text.toLowerCase()
        .replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's')
        .replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ç/g, 'c')
        .replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').trim();

    for (const country of countries) {
      // Check Turkish name
      if (slugify(country.name) === countrySlug) {
        return country.country_code;
      }
      // Check English name
      if (country.name_en && slugify(country.name_en) === countrySlug) {
        return country.country_code;
      }
    }
  }

  return null;
}

/**
 * Increment view count for a bilateral visa page
 */
export async function incrementVisaPageViews(slug: string) {
  try {
    await supabase.rpc('increment_visa_page_views', { page_slug: slug });
  } catch (error) {
    console.error('Error incrementing visa page views:', error);
  }
}

/**
 * Generate bilateral visa page slug from country codes
 */
export async function generateBilateralVisaSlug(
  sourceCode: string,
  destinationCode: string,
  locale: 'tr' | 'en'
): Promise<string | null> {
  // Get country names
  const { data: countries } = await supabase
    .from('countries')
    .select('country_code, name, name_en')
    .in('country_code', [sourceCode, destinationCode]);

  if (!countries || countries.length !== 2) return null;

  const source = countries.find(c => c.country_code === sourceCode);
  const destination = countries.find(c => c.country_code === destinationCode);

  if (!source || !destination) return null;

  const sourceName = locale === 'en' ? (source.name_en || source.name) : source.name;
  const destinationName = locale === 'en' ? (destination.name_en || destination.name) : destination.name;
  const suffix = locale === 'tr' ? 'vize' : 'visa';

  // Slugify with Turkish character support
  const slugify = (text: string) => 
    text.toLowerCase()
      .replace(/ğ/g, 'g')
      .replace(/ü/g, 'u')
      .replace(/ş/g, 's')
      .replace(/ı/g, 'i')
      .replace(/ö/g, 'o')
      .replace(/ç/g, 'c')
      .replace(/Ğ/g, 'g')
      .replace(/Ü/g, 'u')
      .replace(/Ş/g, 's')
      .replace(/İ/g, 'i')
      .replace(/Ö/g, 'o')
      .replace(/Ç/g, 'c')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();

  return `${slugify(sourceName)}-${slugify(destinationName)}-${suffix}`;
}
