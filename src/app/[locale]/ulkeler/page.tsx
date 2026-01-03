import { Metadata } from "next";
import { getCountries } from "@/lib/queries";
import { CountriesListWithFilters } from "@/components/countries/CountriesListWithFilters";
import { generateItemListSchema, generateBreadcrumbSchema, generateOrganizationSchema } from "@/components/shared/SEOHead";

interface CountriesPageProps {
  params: Promise<{ locale: string }>;
}

// Cache'i 5 dakikada bir yenile
export const revalidate = 300;

export async function generateMetadata({ params }: CountriesPageProps): Promise<Metadata> {
  const { locale } = await params;
  const isEnglish = locale === 'en';
  const countries = await getCountries();
  const countryCount = countries.length;

  return {
    title: isEnglish
      ? `Visa Application for ${countryCount} Countries | Kolay Seyahat`
      : `${countryCount} Ülke için Vize Başvurusu | Kolay Seyahat`,
    description: isEnglish
      ? `Visa applications to ${countryCount} countries for Turkish citizens. All countries requiring visa-free, visa on arrival and e-visa. Professional consultancy for USA, UK, Schengen, Canada visa and more.`
      : `Türk vatandaşları için ${countryCount} ülkeye vize başvurusu. Vizesiz, varışta vize ve e-vize gerektiren tüm ülkeler. Amerika, İngiltere, Schengen, Kanada vizesi ve daha fazlası için profesyonel danışmanlık.`,
    keywords: isEnglish
      ? [
        "visa countries",
        "visa application",
        "visa-free countries",
        "visa on arrival",
        "e-visa countries",
        "usa visa",
        "schengen visa",
        "uk visa",
        "canada visa",
        "australia visa",
        "turkish citizens visa",
        "visa consultancy",
      ].join(", ")
      : [
        "vize ülkeleri",
        "vize başvurusu",
        "vizesiz ülkeler",
        "varışta vize",
        "e-vize ülkeleri",
        "amerika vizesi",
        "schengen vizesi",
        "ingiltere vizesi",
        "kanada vizesi",
        "avustralya vizesi",
        "türk vatandaşları vize",
        "vize danışmanlık",
      ].join(", "),
    openGraph: {
      title: isEnglish
        ? `Visa Application for ${countryCount} Countries | Kolay Seyahat`
        : `${countryCount} Ülke için Vize Başvurusu | Kolay Seyahat`,
      description: isEnglish
        ? `Visa applications to ${countryCount} countries for Turkish citizens. All countries requiring visa-free, visa on arrival and e-visa.`
        : `Türk vatandaşları için ${countryCount} ülkeye vize başvurusu. Vizesiz, varışta vize ve e-vize gerektiren tüm ülkeler.`,
      type: "website",
      url: isEnglish ? "https://www.kolayseyahat.net/en/ulkeler" : "https://www.kolayseyahat.net/ulkeler",
      siteName: "Kolay Seyahat",
      locale: isEnglish ? "en_US" : "tr_TR",
      images: [
        {
          url: "https://www.kolayseyahat.net/opengraph-image",
          width: 1200,
          height: 630,
          alt: isEnglish ? "Countries for Visa Application" : "Vize Başvurusu Yapılabilecek Ülkeler",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: isEnglish
        ? `Visa Application for ${countryCount} Countries`
        : `${countryCount} Ülke için Vize Başvurusu`,
      description: isEnglish
        ? `Visa applications to ${countryCount} countries for Turkish citizens.`
        : `Türk vatandaşları için ${countryCount} ülkeye vize başvurusu.`,
      creator: "@kolayseyahat",
      site: "@kolayseyahat",
    },
    alternates: {
      canonical: "https://www.kolayseyahat.net/ulkeler",
      languages: {
        "tr": "https://www.kolayseyahat.net/ulkeler",
        "en": "https://www.kolayseyahat.net/en/ulkeler",
        "x-default": "https://www.kolayseyahat.net/ulkeler",
      },
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  };
}

export default async function CountriesPage({ params }: CountriesPageProps) {
  const { locale } = await params;
  const isEnglish = locale === 'en';
  const countries = await getCountries();

  // ItemList Schema for SEO
  const itemListSchema = generateItemListSchema(
    countries.map((country: any) => ({
      name: country.name,
      url: `/${country.slug}`,
      image: country.image_url,
      description: country.description,
    }))
  );

  // Breadcrumb Schema
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: isEnglish ? "Home" : "Ana Sayfa", url: isEnglish ? "/en" : "/" },
    { name: isEnglish ? "Countries" : "Ülkeler", url: isEnglish ? "/en/ulkeler" : "/ulkeler" },
  ]);

  // Organization Schema
  const organizationSchema = generateOrganizationSchema();

  return (
    <>
      {/* SEO Structured Data */}
      {itemListSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
        />
      )}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      
      <CountriesListWithFilters initialCountries={countries as any} locale={locale as 'tr' | 'en'} />
    </>
  );
}
