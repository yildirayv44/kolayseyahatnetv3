import type { Metadata } from "next";
import { VisaCheckerClient } from "@/components/visa-checker/VisaCheckerClient";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const isEnglish = locale === 'en';
  
  const title = isEnglish ? "Visa Checker | Check Visa Requirements" : "Vize Sorgulama | Vize Gerekliliklerini Kontrol Edin";
  const description = isEnglish
    ? "Check visa requirements between any two countries. Select your passport country and destination to see visa status, requirements, and available packages."
    : "Herhangi iki ülke arasındaki vize gerekliliklerini kontrol edin. Pasaport ülkenizi ve hedef ülkeyi seçerek vize durumunu, gereklilikleri ve mevcut paketleri görün.";
  const url = `https://www.kolayseyahat.net${isEnglish ? '/en' : ''}/vize-sorgulama`;
  
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
        'tr': 'https://www.kolayseyahat.net/vize-sorgulama',
        'en': 'https://www.kolayseyahat.net/en/vize-sorgulama',
        'x-default': 'https://www.kolayseyahat.net/vize-sorgulama',
      },
    },
  };
}

export default async function VisaCheckerPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const isEnglish = locale === 'en';

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <section className="space-y-4 border-b border-slate-200 pb-6">
        <h1 className="text-3xl font-bold text-slate-900 md:text-4xl">
          {isEnglish ? 'Visa Requirement Checker' : 'Vize Gereklilik Sorgulama'}
        </h1>
        <p className="max-w-3xl text-base text-slate-600">
          {isEnglish
            ? 'Check visa requirements between any two countries. Select your passport country and destination to see visa status, allowed stay, costs, and available consultation packages.'
            : 'Herhangi iki ülke arasındaki vize gerekliliklerini kontrol edin. Pasaport ülkenizi ve hedef ülkeyi seçerek vize durumunu, kalış süresini, ücretleri ve mevcut danışmanlık paketlerini görün.'}
        </p>
      </section>

      {/* Visa Checker Component */}
      <VisaCheckerClient locale={locale} />

      {/* Info Section */}
      <section className="rounded-lg bg-blue-50 p-6 text-sm text-blue-800">
        <h3 className="font-semibold mb-2">
          {isEnglish ? 'ℹ️ Important Information' : 'ℹ️ Önemli Bilgi'}
        </h3>
        <p>
          {isEnglish
            ? 'Visa requirements are subject to change. Always verify current requirements with the official embassy or consulate before traveling. Consultation packages are available for select country combinations.'
            : 'Vize gereklilikleri değişebilir. Seyahat etmeden önce güncel gereklilikleri mutlaka resmi büyükelçilik veya konsolosluklardan doğrulayın. Seçili ülke kombinasyonları için danışmanlık paketleri mevcuttur.'}
        </p>
      </section>
    </div>
  );
}
