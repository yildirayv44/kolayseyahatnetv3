import { getCountries } from "@/lib/queries";
import { generateSEOMetadata } from "@/components/shared/SEOHead";
import { CountriesListWithFilters } from "@/components/countries/CountriesListWithFilters";

// Cache'i 5 dakikada bir yenile
export const revalidate = 300;

export const metadata = generateSEOMetadata({
  title: "Vize Başvurusu Yapılabilecek Ülkeler",
  description:
    "Amerika, İngiltere, Schengen ve 20+ ülke için profesyonel vize danışmanlık hizmeti. Başvuru sürecinizi kolaylaştırıyoruz.",
  keywords: [
    "vize ülkeleri",
    "vize başvurusu",
    "amerika vizesi",
    "schengen vizesi",
    "ingiltere vizesi",
  ],
  url: "/ulkeler",
});

export default async function CountriesPage() {
  const countries = await getCountries();

  return (
    <CountriesListWithFilters initialCountries={countries as any} />
  );
}
