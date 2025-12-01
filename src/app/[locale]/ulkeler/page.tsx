import Link from "next/link";
import Image from "next/image";
import { Globe2, ArrowRight, TrendingDown } from "lucide-react";
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
                
                {/* Fiyat Gösterimi */}
                {country.price ? (
                  <div className="flex items-end justify-between border-t border-slate-100 pt-3">
                    <div>
                      {country.original_price && country.original_price > country.price && (
                        <div className="flex items-center gap-1 mb-1">
                          <span className="text-xs text-slate-400 line-through">
                            ₺{country.original_price.toLocaleString('tr-TR')}
                          </span>
                          {country.discount_percentage && (
                            <span className="inline-flex items-center gap-0.5 rounded-full bg-red-50 px-1.5 py-0.5 text-[10px] font-bold text-red-600">
                              <TrendingDown className="h-2.5 w-2.5" />
                              %{country.discount_percentage}
                            </span>
                          )}
                        </div>
                      )}
                      <div className="text-2xl font-bold text-emerald-600">
                        ₺{country.price.toLocaleString('tr-TR')}
                      </div>
                      <p className="text-[10px] text-slate-500">Başlangıç fiyatı</p>
                    </div>
                    <div className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white group-hover:bg-primary-dark">
                      Başvur
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-sm font-medium text-primary">
                    Detayları Gör
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </div>
                )}
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
