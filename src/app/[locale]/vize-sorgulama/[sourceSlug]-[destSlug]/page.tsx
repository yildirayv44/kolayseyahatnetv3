import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { getVisaRequirement, getCountryProductsBySource, getVisaPageSEO } from "@/lib/queries";
import { VisaDetailPage } from "@/components/visa-checker/VisaDetailPage";

interface PageParams {
  params: Promise<{
    locale: string;
    sourceSlug: string;
    destSlug: string;
  }>;
}

// Helper function to get country by slug
async function getCountryBySlug(slug: string) {
  const { data } = await supabase
    .from('countries')
    .select('id, name, country_code, flag_emoji')
    .eq('slug', slug)
    .eq('status', 1)
    .maybeSingle();
  
  return data;
}

// Helper function to parse slug pattern
function parseVisaSlug(sourceSlug: string, destSlug: string, locale: string) {
  // Pattern: turkmenistan-vatandaslari-amerika-vizesi
  // or: turkmenistan-citizens-united-states-visa
  
  const isEnglish = locale === 'en';
  const separator = isEnglish ? '-citizens-' : '-vatandaslari-';
  const suffix = isEnglish ? '-visa' : '-vizesi';
  
  // Try to parse combined slug first
  const combinedSlug = `${sourceSlug}-${destSlug}`;
  const parts = combinedSlug.split(separator);
  
  if (parts.length === 2) {
    const sourceCountrySlug = parts[0];
    const destCountrySlug = parts[1].replace(suffix, '');
    return { sourceCountrySlug, destCountrySlug };
  }
  
  // Fallback: treat as separate slugs
  return { sourceCountrySlug: sourceSlug, destCountrySlug: destSlug };
}

export async function generateMetadata({ params }: PageParams): Promise<Metadata> {
  const { locale, sourceSlug, destSlug } = await params;
  const isEnglish = locale === 'en';
  
  const { sourceCountrySlug, destCountrySlug } = parseVisaSlug(sourceSlug, destSlug, locale);
  
  const [sourceCountry, destCountry] = await Promise.all([
    getCountryBySlug(sourceCountrySlug),
    getCountryBySlug(destCountrySlug),
  ]);

  if (!sourceCountry || !destCountry) {
    return {
      title: 'Not Found',
      description: 'Page not found',
    };
  }

  // Check for custom SEO content
  const seoContent = await getVisaPageSEO(
    sourceCountry.country_code,
    destCountry.country_code,
    locale
  );

  const title = seoContent?.meta_title || 
    (isEnglish 
      ? `${sourceCountry.name} Citizens ${destCountry.name} Visa | 2026 Requirements`
      : `${sourceCountry.name} Vatandaşları İçin ${destCountry.name} Vizesi | 2026 Güncel Bilgiler`);
  
  const description = seoContent?.meta_description ||
    (isEnglish
      ? `Visa requirements for ${sourceCountry.name} passport holders traveling to ${destCountry.name}. Visa fees, processing time, required documents, and application process.`
      : `${sourceCountry.name} pasaportu ile ${destCountry.name}'ye giriş için vize gereklilikleri. Vize ücreti, işlem süresi, gerekli belgeler ve başvuru süreci.`);

  const url = `https://www.kolayseyahat.net${isEnglish ? '/en' : ''}/vize-sorgulama/${sourceSlug}-${destSlug}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'article',
      url,
      siteName: 'Kolay Seyahat',
      locale: isEnglish ? 'en_US' : 'tr_TR',
      images: [{ url: 'https://www.kolayseyahat.net/opengraph-image.png', width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['https://www.kolayseyahat.net/opengraph-image.png'],
    },
    alternates: {
      canonical: url,
      languages: {
        'tr': `https://www.kolayseyahat.net/vize-sorgulama/${sourceSlug}-${destSlug}`,
        'en': `https://www.kolayseyahat.net/en/vize-sorgulama/${sourceSlug}-${destSlug}`,
        'x-default': `https://www.kolayseyahat.net/vize-sorgulama/${sourceSlug}-${destSlug}`,
      },
    },
  };
}

export default async function VisaDetailPageRoute({ params }: PageParams) {
  const { locale, sourceSlug, destSlug } = await params;
  const isEnglish = locale === 'en';
  
  const { sourceCountrySlug, destCountrySlug } = parseVisaSlug(sourceSlug, destSlug, locale);
  
  // Get countries
  const [sourceCountry, destCountry] = await Promise.all([
    getCountryBySlug(sourceCountrySlug),
    getCountryBySlug(destCountrySlug),
  ]);

  if (!sourceCountry || !destCountry) {
    notFound();
  }

  // Get visa requirement
  const visaReq = await getVisaRequirement(
    sourceCountry.country_code,
    destCountry.country_code
  );

  if (!visaReq) {
    notFound();
  }

  // Get packages
  const packages = await getCountryProductsBySource(
    destCountry.id,
    sourceCountry.country_code
  );

  // Get SEO content if available
  const seoContent = await getVisaPageSEO(
    sourceCountry.country_code,
    destCountry.country_code,
    locale
  );

  return (
    <VisaDetailPage
      sourceCountry={sourceCountry}
      destCountry={destCountry}
      visaRequirement={visaReq}
      packages={packages}
      seoContent={seoContent}
      locale={locale}
    />
  );
}
