import Link from "next/link";
import Image from "next/image";
import { Globe2, ArrowRight } from "lucide-react";
import { getCountries } from "@/lib/queries";
import { getCountrySlug } from "@/lib/helpers";
import { generateSEOMetadata } from "@/components/shared/SEOHead";
import { getCountryDefaultImage } from "@/lib/image-helpers";

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
    <div className="space-y-8">
      <section className="space-y-4">
        <h1 className="text-3xl font-bold text-slate-900">
          Vize Başvurusu Yapılabilecek Ülkeler
        </h1>
        <p className="text-lg text-slate-600">
          20+ ülke için profesyonel vize danışmanlık hizmeti sunuyoruz.
          Başvuru sürecinizi kolaylaştırıyoruz.
        </p>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {countries.map((country: any) => {
          const imageUrl = getCountryDefaultImage(country.name);
          
          return (
            <Link
              key={country.id}
              href={`/${country.slug || getCountrySlug(country.id)}`}
              className="card group overflow-hidden p-0 hover:border-primary hover:shadow-lg"
            >
              {/* Country Image */}
              <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-100">
                <Image
                  src={imageUrl}
                  alt={country.name}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
                {country.visa_required === false && (
                  <div className="absolute right-3 top-3 rounded-full bg-emerald-500 px-3 py-1 text-xs font-bold text-white shadow-lg">
                    Vizesiz
                  </div>
                )}
              </div>

              {/* Country Content */}
              <div className="space-y-3 p-4">
                <h2 className="text-lg font-semibold text-slate-900 group-hover:text-primary">
                  {country.title || `${country.name} Vizesi`}
                </h2>
                {country.description && (
                  <p className="line-clamp-2 text-sm text-slate-600">
                    {country.description}
                  </p>
                )}
                <div className="flex items-center gap-2 text-sm font-medium text-primary">
                  Detayları Gör
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {countries.length === 0 && (
        <div className="card text-center">
          <p className="text-slate-600">Henüz ülke eklenmemiş.</p>
        </div>
      )}
    </div>
  );
}
