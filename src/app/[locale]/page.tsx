import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Globe2, ShieldCheck, Users, Clock4, PhoneCall } from "lucide-react";
import { getCountries, getBlogs, getConsultants } from "@/lib/queries";
import { getCountrySlug, getBlogSlug } from "@/lib/helpers";
import { getLocalizedUrl } from "@/lib/locale-link";
import { TrustBadges } from "@/components/home/TrustBadges";
import { FavoriteButton } from "@/components/shared/FavoriteButton";
import { SearchTooltip } from "@/components/home/SearchTooltip";
import { UrgencyBanner } from "@/components/home/UrgencyBanner";
import { TestimonialsSlider } from "@/components/home/TestimonialsSlider";
import { ComparisonTable } from "@/components/home/ComparisonTable";
import { translateArray } from "@/lib/translation";
import { type Locale } from "@/i18n/config";

// Cache'i 5 dakikada bir yenile
export const revalidate = 300;

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }): Promise<Metadata> {
  const { locale } = await params;
  const isEnglish = locale === 'en';
  
  const title = isEnglish 
    ? 'Professional Visa Consultancy - Kolay Seyahat'
    : 'Profesyonel Vize Danışmanlığı - Kolay Seyahat';
  const description = isEnglish
    ? 'Professional visa consultancy for USA, UK, Schengen and more. 98% approval rate with 10,000+ successful applications.'
    : 'Amerika, İngiltere, Schengen ve daha birçok ülke için profesyonel vize danışmanlık hizmeti. %98 onay oranı ile 10,000+ başarılı başvuru.';
  
  const url = `https://www.kolayseyahat.net${isEnglish ? '/en' : ''}`;
  
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
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
        'tr': 'https://www.kolayseyahat.net',
        'en': 'https://www.kolayseyahat.net/en',
        'x-default': 'https://www.kolayseyahat.net',
      },
    },
  };
}

// Para birimi sembolü helper fonksiyonu
const getCurrencySymbol = (currencyId: number = 1) => {
  switch (currencyId) {
    case 2: return '$';
    case 3: return '€';
    default: return '₺';
  }
};

interface HomePageProps {
  params: Promise<{ locale: Locale }>;
}

export default async function Home({ params }: HomePageProps) {
  const { locale } = await params;
  
  const [countries, blogs] = await Promise.all([
    getCountries(),
    getBlogs({ home: 1, limit: 3 }),
  ]);

  // Translate content if locale is English
  const translatedCountries = locale === "en" 
    ? await translateArray(countries.slice(0, 8), "en", ["name", "title", "description"])
    : countries.slice(0, 8);

  const translatedBlogs = locale === "en"
    ? await translateArray(blogs, "en", ["title", "description"])
    : blogs;

  const popularCountries = translatedCountries;

  const t = locale === "en" ? {
    hero: {
      title: "Visa Application in",
      highlight: "15 Minutes",
      subtitle: "Professional visa consultancy with 98% approval rate. We have successfully processed 10,000+ visa applications.",
      cta: "Apply Now",
      call: "Call Now",
    },
    popular: {
      title: "Popular Visa Services",
      subtitle: "Featured countries",
      visaFree: "Visa Free",
      visaFreeEntry: "Visa Free Entry",
      secureApplication: "Secure Application",
      details: "Details",
    },
    blogs: {
      title: "Travel Blog",
      subtitle: "Tips and guides",
      readMore: "Read More",
    },
  } : {
    hero: {
      title: "Vize Başvurunuz",
      highlight: "15 Dakikada",
      subtitle: "%98 onay oranı ile profesyonel vize danışmanlığı. 10,000+ başarılı vize başvurusu.",
      cta: "Hemen Başvur",
      call: "Hemen Ara",
    },
    popular: {
      title: "Popüler Vize İşlemleri",
      subtitle: "Öne çıkan ülkeler",
      visaFree: "Vizesiz",
      visaFreeEntry: "Vizesiz Giriş",
      secureApplication: "Güvenli Başvuru",
      details: "Detaylar",
    },
    blogs: {
      title: "Seyahat Blogu",
      subtitle: "İpuçları ve rehberler",
      readMore: "Devamını Oku",
    },
  };

  return (
    <div className="space-y-12 md:space-y-16">
      {/* Urgency Banner */}
      <UrgencyBanner />

      {/* Search Tooltip */}
      <SearchTooltip />

      {/* HERO SECTION */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/5 via-blue-50 to-white p-8 md:p-12">
        <div className="relative z-10 mx-auto max-w-4xl text-center">
          <h1 className="mb-6 text-4xl font-bold leading-tight text-slate-900 md:text-5xl lg:text-6xl">
            {t.hero.title}{" "}
            <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
              {t.hero.highlight}
            </span>
          </h1>
          <p className="mb-8 text-lg text-slate-600 md:text-xl">
            {t.hero.subtitle}
          </p>
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Link
              href={getLocalizedUrl("basvuru", locale)}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-8 py-4 font-semibold text-white shadow-xl transition-all hover:bg-primary/90 hover:shadow-2xl"
            >
              {t.hero.cta}
              <ArrowRight className="h-5 w-5" />
            </Link>
            <a
              href="tel:+902129099971"
              className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-primary bg-white px-8 py-4 font-semibold text-primary transition-all hover:bg-primary hover:text-white"
            >
              <PhoneCall className="h-5 w-5" />
              {t.hero.call}
            </a>
          </div>
        </div>
      </section>

      <TrustBadges />

      {/* POPULAR COUNTRIES */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">
            {t.popular.title}
          </h2>
          <span className="text-xs text-slate-500">{t.popular.subtitle}</span>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {popularCountries.map((country: any) => (
            <div key={country.id} className="card relative flex flex-col justify-between">
              <div className="absolute right-3 top-3 z-10">
                <FavoriteButton id={country.id} type="country" size="sm" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 pr-10">
                  <div className="inline-flex items-center gap-1 rounded-full bg-slate-50 px-2 py-1 text-[11px] font-medium text-slate-600">
                    <Globe2 className="h-3 w-3 text-primary" />
                    <span>{country.name}</span>
                  </div>
                </div>
                {country.visa_labels && country.visa_labels.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {country.visa_labels.map((label: string, idx: number) => (
                      <span key={idx} className={`rounded-full px-1.5 py-0.5 text-[9px] font-semibold ${
                        label === "Vizesiz" 
                          ? "bg-emerald-50 text-emerald-600" 
                          : label === "Varışta Vize"
                          ? "bg-blue-50 text-blue-600"
                          : label === "E-vize"
                          ? "bg-purple-50 text-purple-600"
                          : "bg-orange-50 text-orange-600"
                      }`}>
                        {label}
                      </span>
                    ))}
                  </div>
                )}
                <h3 className="text-sm font-semibold text-slate-900">
                  {country.title || `${country.name} ${locale === "en" ? "Visa" : "Vizesi"}`}
                </h3>
                <p className="line-clamp-2 text-xs text-slate-600">
                  {country.description}
                </p>
              </div>

              {/* Fiyat Gösterimi */}
              {country.price && (
                <div className="mt-3 border-t border-slate-100 pt-3">
                  <div className="flex items-end justify-between">
                    <div>
                      <div className="text-2xl font-bold text-emerald-600">
                        {getCurrencySymbol(country.currency_id)}{country.price.toLocaleString('tr-TR')}
                      </div>
                      <p className="text-[10px] text-slate-500">Başlangıç fiyatı</p>
                    </div>
                    <Link
                      href={getLocalizedUrl(country.slug || "", locale)}
                      className="rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-primary-dark"
                    >
                      Başvur
                    </Link>
                  </div>
                </div>
              )}

              {/* Fiyat yoksa eski görünüm */}
              {!country.price && (
                <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
                  <span className="inline-flex items-center gap-1">
                    <ShieldCheck className="h-3 w-3 text-emerald-500" />
                    {t.popular.secureApplication}
                  </span>
                  <Link
                    href={getLocalizedUrl(country.slug || "", locale)}
                    className="inline-flex items-center text-xs font-semibold text-primary hover:text-primary-dark"
                  >
                    {t.popular.details}
                    <ArrowRight className="ml-1 h-3 w-3" />
                  </Link>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* TESTIMONIALS SECTION */}
      <TestimonialsSlider />

      {/* COMPARISON TABLE */}
      <ComparisonTable />

      {/* BLOG SECTION */}
      {translatedBlogs.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">
              {t.blogs.title}
            </h2>
            <span className="text-xs text-slate-500">{t.blogs.subtitle}</span>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {translatedBlogs.map((blog: any) => (
              <Link
                key={blog.id}
                href={`/${locale}${getBlogSlug(blog)}`}
                className="card group hover:border-primary hover:shadow-lg"
              >
                <h3 className="font-semibold text-slate-900 group-hover:text-primary">
                  {blog.title}
                </h3>
                <p className="mt-2 line-clamp-2 text-sm text-slate-600">
                  {blog.description}
                </p>
                <div className="mt-4 flex items-center gap-2 text-sm font-medium text-primary">
                  {t.blogs.readMore}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
