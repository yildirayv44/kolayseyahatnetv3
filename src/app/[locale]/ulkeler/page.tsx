import Link from "next/link";
import { Globe2, ArrowRight } from "lucide-react";
import { getCountries } from "@/lib/queries";
import { getCountrySlug } from "@/lib/helpers";
import { generateSEOMetadata } from "@/components/shared/SEOHead";

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
        {countries.map((country: any) => (
          <Link
            key={country.id}
            href={`/${getCountrySlug(country.id)}`}
            className="card group hover:border-primary hover:shadow-lg"
          >
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10 transition-colors group-hover:bg-primary/20">
                <Globe2 className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-semibold text-slate-900 group-hover:text-primary">
                    {country.title || `${country.name} Vizesi`}
                  </h2>
                  {country.visa_required === false && (
                    <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-600">
                      Vizesiz
                    </span>
                  )}
                </div>
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
            </div>
          </Link>
        ))}
      </div>

      {countries.length === 0 && (
        <div className="card text-center">
          <p className="text-slate-600">Henüz ülke eklenmemiş.</p>
        </div>
      )}
    </div>
  );
}
