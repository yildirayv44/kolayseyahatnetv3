import type { Metadata } from "next";
import { ApplicationForm } from "@/components/forms/ApplicationForm";
import { Suspense } from "react";
import { t } from "@/i18n/translations";
import type { Locale } from "@/i18n/translations";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const isEnglish = locale === 'en';
  
  const title = isEnglish ? "Visa Application | Kolay Seyahat" : "Vize Başvurusu | Kolay Seyahat";
  const description = isEnglish
    ? "Complete your application quickly and securely with our online visa application form. Our expert consultants will contact you shortly."
    : "Online vize başvuru formu ile hızlı ve güvenli şekilde başvurunuzu tamamlayın. Uzman danışmanlarımız en kısa sürede sizinle iletişime geçecek.";
  const url = `https://www.kolayseyahat.net${isEnglish ? '/en' : ''}/vize-basvuru-formu`;
  
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
        'tr': 'https://www.kolayseyahat.net/vize-basvuru-formu',
        'en': 'https://www.kolayseyahat.net/en/vize-basvuru-formu',
        'x-default': 'https://www.kolayseyahat.net/vize-basvuru-formu',
      },
    },
  };
}

// Dynamic page because it uses searchParams
export const dynamic = "force-dynamic";

interface ApplicationPageProps {
  params: Promise<{ locale: string }>;
}

export default async function ApplicationPage({ params }: ApplicationPageProps) {
  const { locale } = await params;
  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <section className="space-y-4 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 p-6 md:p-8">
        <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
          </span>
          {t(locale as Locale, "completesIn3Minutes")}
        </div>
        <h1 className="text-2xl font-bold text-slate-900 md:text-4xl">
          {t(locale as Locale, "onlineApplicationForm")}
        </h1>
        <p className="text-base text-slate-600 md:text-lg">
          {t(locale as Locale, "expertContactIn24Hours").split('24 saat içinde').map((part, i) => 
            i === 0 ? <span key={i}>{part}</span> : <span key={i}><strong className="text-slate-900">24 saat içinde</strong>{part}</span>
          )}
        </p>
        <a 
          href="https://www.kolayseyahat.tr/vize-degerlendirme.html"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {t(locale as Locale, "freeEvaluationClick")}
        </a>
        <div className="flex flex-wrap gap-4 text-sm text-slate-600">
          <div className="flex items-center gap-2">
            <svg className="h-5 w-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>{t(locale as Locale, "quickResponse")}</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="h-5 w-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>{t(locale as Locale, "professionalSupport")}</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="h-5 w-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>{t(locale as Locale, "secureTransaction")}</span>
          </div>
        </div>
      </section>

      <ApplicationForm locale={locale as Locale} />

      <section className="rounded-xl border-2 border-emerald-200 bg-emerald-50 p-6">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100">
            <svg className="h-6 w-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="space-y-2">
            <h3 className="font-bold text-emerald-900">{t(locale as Locale, "whyChooseUs")}</h3>
            <ul className="space-y-2 text-sm text-emerald-800">
              <li className="flex items-start gap-2">
                <span className="text-emerald-600">✓</span>
                <span><strong>24 saat içinde</strong> {t(locale as Locale, "expertContactWithin24").replace('24 saat içinde ', '')}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-600">✓</span>
                <span>{t(locale as Locale, "successRate98")}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-600">✓</span>
                <span>{t(locale as Locale, "sslSecure")}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-600">✓</span>
                <span>{t(locale as Locale, "professionalConsulting")}</span>
              </li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
