import { Metadata } from "next";
import { getCountries } from "@/lib/queries";
import { CountriesListWithFilters } from "@/components/countries/CountriesListWithFilters";
import { generateItemListSchema, generateBreadcrumbSchema, generateOrganizationSchema } from "@/components/shared/SEOHead";

// Cache'i 5 dakikada bir yenile
export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const countries = await getCountries();
  const countryCount = countries.length;

  return {
    title: `${countryCount} Ülke için Vize Başvurusu | Kolay Seyahat`,
    description: `Türk vatandaşları için ${countryCount} ülkeye vize başvurusu. Vizesiz, varışta vize ve e-vize gerektiren tüm ülkeler. Amerika, İngiltere, Schengen, Kanada vizesi ve daha fazlası için profesyonel danışmanlık.`,
    keywords: [
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
      title: `${countryCount} Ülke için Vize Başvurusu | Kolay Seyahat`,
      description: `Türk vatandaşları için ${countryCount} ülkeye vize başvurusu. Vizesiz, varışta vize ve e-vize gerektiren tüm ülkeler.`,
      type: "website",
      url: "https://www.kolayseyahat.net/ulkeler",
      siteName: "Kolay Seyahat",
      locale: "tr_TR",
      images: [
        {
          url: "https://www.kolayseyahat.net/opengraph-image",
          width: 1200,
          height: 630,
          alt: "Vize Başvurusu Yapılabilecek Ülkeler",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${countryCount} Ülke için Vize Başvurusu`,
      description: `Türk vatandaşları için ${countryCount} ülkeye vize başvurusu.`,
      creator: "@kolayseyahat",
      site: "@kolayseyahat",
    },
    alternates: {
      canonical: "https://www.kolayseyahat.net/ulkeler",
      languages: {
        "tr": "https://www.kolayseyahat.net/ulkeler",
        "en": "https://www.kolayseyahat.net/en/ulkeler",
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

export default async function CountriesPage() {
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
    { name: "Ana Sayfa", url: "/" },
    { name: "Ülkeler", url: "/ulkeler" },
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
      
      <CountriesListWithFilters initialCountries={countries as any} />
    </>
  );
}
