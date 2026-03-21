/**
 * Helper functions for bilateral visa pages
 */

import { supabase } from './supabase';

/**
 * Check if a slug is a bilateral visa page
 * Pattern: {source-country}-{destination-country}-vize or -visa
 */
export function isBilateralVisaSlug(slug: string): boolean {
  return slug.endsWith('-vize') || slug.endsWith('-visa');
}

/**
 * Parse bilateral visa slug to extract country slugs
 * Example: "turkiye-amerika-vize" -> { source: "turkiye", destination: "amerika" }
 */
export function parseBilateralVisaSlug(slug: string): { source: string; destination: string; locale: 'tr' | 'en' } | null {
  const suffix = slug.endsWith('-vize') ? '-vize' : slug.endsWith('-visa') ? '-visa' : null;
  
  if (!suffix) return null;
  
  const locale = suffix === '-vize' ? 'tr' : 'en';
  const withoutSuffix = slug.replace(suffix, '');
  const parts = withoutSuffix.split('-');
  
  if (parts.length < 2) return null;
  
  // Find the split point - last part is destination, rest is source
  // Handle multi-word countries like "birlesik-arap-emirlikleri"
  const destination = parts[parts.length - 1];
  const source = parts.slice(0, -1).join('-');
  
  return { source, destination, locale };
}

/**
 * Get bilateral visa page data from database
 */
export async function getBilateralVisaPage(slug: string) {
  const { data: visaPage, error } = await supabase
    .from('visa_pages_seo')
    .select('*')
    .eq('slug', slug)
    .eq('content_status', 'published')
    .maybeSingle();

  if (error) {
    console.error('Error fetching bilateral visa page:', error);
    return null;
  }

  if (!visaPage) {
    return null;
  }

  // Manually fetch country data
  const { data: countries } = await supabase
    .from('countries')
    .select('name, name_en, country_code, flag_emoji')
    .in('country_code', [visaPage.source_country_code, visaPage.destination_country_code]);

  const sourceCountry = countries?.find(c => c.country_code === visaPage.source_country_code);
  const destinationCountry = countries?.find(c => c.country_code === visaPage.destination_country_code);

  return {
    ...visaPage,
    source_country: sourceCountry,
    destination_country: destinationCountry
  };
}

/**
 * Get country code from country slug
 */
export async function getCountryCodeFromSlug(countrySlug: string): Promise<string | null> {
  // First try to find by taxonomy slug
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

  // Fallback: try direct country name match
  const { data: country } = await supabase
    .from('countries')
    .select('country_code')
    .or(`name.ilike.%${countrySlug}%,name_en.ilike.%${countrySlug}%`)
    .maybeSingle();

  return country?.country_code || null;
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

  // Slugify: lowercase, replace spaces with hyphens, remove special chars
  const slugify = (text: string) => 
    text.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();

  return `${slugify(sourceName)}-${slugify(destinationName)}-${suffix}`;
}
