import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Globe2, ShieldCheck, Users, Clock, PhoneCall, Award, FileCheck } from "lucide-react";
import { getCountries, getBlogs, getConsultants } from "@/lib/queries";
import { getCountrySlug, getBlogSlug } from "@/lib/helpers";
import { getLocalizedUrl } from "@/lib/locale-link";
import { TrustBadges } from "@/components/home/TrustBadges";
import { FavoriteButton } from "@/components/shared/FavoriteButton";
import { SearchTooltip } from "@/components/home/SearchTooltip";
import { UrgencyBanner } from "@/components/home/UrgencyBanner";
import { TestimonialsSlider } from "@/components/home/TestimonialsSlider";
import { ComparisonTable } from "@/components/home/ComparisonTable";
import { AppPromoBanner } from "@/components/home/AppPromoBanner";
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
      title: "Complete Your Visa Application",
      highlight: "With Professionals",
      subtitle: "15 years of experience, 10,000+ successful applications. Access visa information for 194 countries through our platform.",
      cta: "Apply Now",
      ctaFree: "Free Pre-Assessment",
      call: "Call Now",
      process: {
        step1: "Pre-Assessment",
        step1Time: "5 min",
        step2: "Document Check",
        step2Time: "Quick",
        step3: "Application Tracking",
        step3Time: "Ongoing",
      },
      trust: {
        ssl: "256-bit SSL Security",
        member: "TÜRSAB Member",
        support: "24/7 Consultant Support",
        satisfaction: "High Customer Satisfaction",
      },
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
      title: "Vize Başvurunuzu",
      highlight: "Profesyonellerle Tamamlayın",
      subtitle: "15 yıllık deneyim, 10.000+ başarılı başvuru. 194 ülkenin vize bilgilerine sitemiz üzerinden erişilebilir.",
      cta: "Hemen Başvur",
      ctaFree: "Ücretsiz Ön Değerlendirme",
      call: "Hemen Ara",
      process: {
        step1: "Ön Değerlendirme",
        step1Time: "5 dakika",
        step2: "Evrak Kontrolü",
        step2Time: "Hızlı",
        step3: "Başvuru Takibi",
        step3Time: "Sürekli",
      },
      trust: {
        ssl: "256-bit SSL Güvenlik",
        member: "TÜRSAB Üyesi",
        support: "7/24 Danışman Desteği",
        satisfaction: "Yüksek Müşteri Memnuniyeti",
      },
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
      <section className="relative overflow-hidden rounded-xl bg-gradient-to-br from-slate-50 to-blue-50 p-12 md:p-16">
        {/* Subtle pattern overlay */}
        <div 
          className="absolute inset-0 opacity-[0.03]" 
          style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, rgb(30 58 138) 1px, transparent 0)',
            backgroundSize: '24px 24px'
          }} 
        />
        
        <div className="relative z-10 mx-auto max-w-4xl text-center">
          <h1 className="mb-4 text-3xl font-bold leading-tight text-slate-900 tracking-tight sm:text-4xl md:text-6xl">
            {t.hero.title}{" "}
            <span className="text-[#1E3A8A]">
              {t.hero.highlight}
            </span>
          </h1>
          
          <p className="mb-8 text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
            {t.hero.subtitle}
          </p>
          
          {/* 15 Dakika Süreç Bileşeni */}
          <div className="mx-auto max-w-2xl mb-8">
            <div className="grid grid-cols-3 gap-3 rounded-lg bg-white border border-slate-200 p-4 shadow-md">
              {/* Adım 1 */}
              <div className="text-center">
                <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-[#1E3A8A] font-semibold text-sm">
                  1
                </div>
                <div className="text-xs font-semibold text-slate-900 mb-1">
                  {t.hero.process.step1}
                </div>
                <div className="text-[10px] text-slate-500">
                  {t.hero.process.step1Time}
                </div>
              </div>
              
              {/* Adım 2 */}
              <div className="text-center">
                <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-[#1E3A8A] font-semibold text-sm">
                  2
                </div>
                <div className="text-xs font-semibold text-slate-900 mb-1">
                  {t.hero.process.step2}
                </div>
                <div className="text-[10px] text-slate-500">
                  {t.hero.process.step2Time}
                </div>
              </div>
              
              {/* Adım 3 */}
              <div className="text-center">
                <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 font-semibold text-sm">
                  ✓
                </div>
                <div className="text-xs font-semibold text-slate-900 mb-1">
                  {t.hero.process.step3}
                </div>
                <div className="text-[10px] text-slate-500">
                  {t.hero.process.step3Time}
                </div>
              </div>
            </div>
          </div>
          
          {/* CTA Buttons */}
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center mb-8">
            <Link
              href={getLocalizedUrl("vize-basvuru-formu", locale)}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#1E3A8A] px-8 py-4 font-semibold text-white shadow-md transition-all hover:bg-[#1E40AF] hover:shadow-lg hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] focus:ring-offset-2"
            >
              {t.hero.cta}
              <ArrowRight className="h-5 w-5" />
            </Link>
            <a
              href="https://www.kolayseyahat.tr/vize-degerlendirme.html"
              target="_blank"
              rel="nofollow noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-lg border-2 border-[#1E3A8A] bg-white px-8 py-4 font-semibold text-[#1E3A8A] transition-all hover:bg-blue-50 hover:border-[#1E40AF] hover:text-[#1E40AF] focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] focus:ring-offset-2"
            >
              <FileCheck className="h-5 w-5" />
              {t.hero.ctaFree}
            </a>
            <a
              href="tel:+902129099971"
              className="inline-flex items-center justify-center gap-2 rounded-lg border-2 border-slate-300 bg-white px-6 py-4 font-semibold text-slate-700 transition-all hover:border-slate-400 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2"
            >
              <PhoneCall className="h-5 w-5" />
              {t.hero.call}
            </a>
          </div>
          
          {/* Trust Band */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-slate-600">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-600" strokeWidth={2} />
              <span className="font-medium">{t.hero.trust.ssl}</span>
            </div>
            <div className="flex items-center gap-2">
              <Award className="h-4 w-4 text-[#1E3A8A]" strokeWidth={2} />
              <span className="font-medium">{t.hero.trust.member}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-[#1E3A8A]" strokeWidth={2} />
              <span className="font-medium">{t.hero.trust.support}</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-emerald-600" strokeWidth={2} />
              <span className="font-medium">{t.hero.trust.satisfaction}</span>
            </div>
          </div>
        </div>
      </section>

      <TrustBadges />

      {/* Mobile App Promo Banner */}
      <AppPromoBanner locale={locale} />

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
                    <Globe2 className="h-3 w-3 text-[#1E3A8A]" />
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
                      className="rounded-lg bg-[#1E3A8A] px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#1E40AF]"
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
                    className="inline-flex items-center text-xs font-semibold text-[#1E3A8A] hover:text-[#1E40AF]"
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
                className="card group hover:border-blue-300 hover:shadow-lg overflow-hidden p-0"
              >
                {blog.image_url && (
                  <div className="relative w-full aspect-[16/9] overflow-hidden bg-slate-100">
                    <img
                      src={blog.image_url}
                      alt={blog.title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                    />
                  </div>
                )}
                <div className="p-6">
                  <h3 className="font-semibold text-slate-900 group-hover:text-[#1E3A8A]">
                    {blog.title}
                  </h3>
                  <p className="mt-2 line-clamp-2 text-sm text-slate-600">
                    {blog.description}
                  </p>
                  <div className="mt-4 flex items-center gap-2 text-sm font-medium text-[#1E3A8A]">
                    {t.blogs.readMore}
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
