import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, Users, Globe2, Award } from "lucide-react";

interface AboutPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: AboutPageProps): Promise<Metadata> {
  const { locale } = await params;
  const isEnglish = locale === 'en';
  
  const title = isEnglish ? "About Us | Kolay Seyahat" : "Hakkımızda | Kolay Seyahat";
  const description = isEnglish
    ? "As Kolay Seyahat, we provide professional visa consultancy services for 20+ countries. We are with you with years of experience and 98% success rate."
    : "Kolay Seyahat olarak 20+ ülke için profesyonel vize danışmanlığı hizmeti sunuyoruz. Yılların tecrübesi ve %98 başarı oranıyla yanınızdayız.";
  const url = `https://www.kolayseyahat.net${isEnglish ? '/en' : ''}/hakkimizda`;

  return {
    title,
    description,
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
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
      creator: '@kolayseyahat',
      site: '@kolayseyahat',
    },
    alternates: {
      canonical: url,
      languages: {
        'tr': 'https://www.kolayseyahat.net/hakkimizda',
        'en': 'https://www.kolayseyahat.net/en/hakkimizda',
        'x-default': 'https://www.kolayseyahat.net/hakkimizda',
      },
    },
  };
}

export default async function AboutPage({ params }: AboutPageProps) {
  const { locale } = await params;
  const isEnglish = locale === 'en';
  return (
    <div className="space-y-10">
      <section className="space-y-4 border-b border-slate-200 pb-6">
        <h1 className="text-2xl font-semibold text-slate-900 md:text-3xl">
          {isEnglish ? 'About Us' : 'Hakkımızda'}
        </h1>
        <p className="max-w-3xl text-sm leading-relaxed text-slate-600">
          {isEnglish
            ? 'As Kolay Seyahat, we work to simplify visa application processes and provide the best service to our customers. With years of experience and our expert team, we provide reliable visa consultancy services for the USA, UK, Schengen and many other countries.'
            : 'Kolay Seyahat olarak, vize başvuru süreçlerini basitleştirmek ve müşterilerimize en iyi hizmeti sunmak için çalışıyoruz. Yılların tecrübesi ve uzman kadromuzla Amerika, İngiltere, Schengen ve daha birçok ülke için güvenilir vize danışmanlığı hizmeti veriyoruz.'}
        </p>
      </section>

      <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="card space-y-2 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Award className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900">{isEnglish ? '98% Success Rate' : '%98 Başarı Oranı'}</h3>
          <p className="text-xs text-slate-600">
            {isEnglish ? 'Proven reliability with thousands of successful visa applications.' : 'Binlerce başarılı vize başvurusu ile kanıtlanmış güvenilirlik.'}
          </p>
        </div>

        <div className="card space-y-2 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Users className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900">{isEnglish ? 'Expert Team' : 'Uzman Kadro'}</h3>
          <p className="text-xs text-slate-600">
            {isEnglish ? 'Professional support with experienced consultants.' : 'Alanında deneyimli danışmanlarla profesyonel destek.'}
          </p>
        </div>

        <div className="card space-y-2 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Globe2 className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900">{isEnglish ? '20+ Countries' : '20+ Ülke'}</h3>
          <p className="text-xs text-slate-600">
            {isEnglish ? 'Comprehensive visa solutions for different destinations.' : 'Farklı destinasyonlar için kapsamlı vize çözümleri.'}
          </p>
        </div>

        <div className="card space-y-2 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900">{isEnglish ? 'Easy Process' : 'Kolay Süreç'}</h3>
          <p className="text-xs text-slate-600">
            {isEnglish ? 'Step-by-step guidance and transparent communication.' : 'Adım adım rehberlik ve şeffaf iletişim.'}
          </p>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-slate-900">{isEnglish ? 'Our Mission' : 'Misyonumuz'}</h2>
        <p className="text-sm leading-relaxed text-slate-600">
          {isEnglish
            ? 'To make visa application processes accessible and understandable for everyone by removing complexity and stress. To help our customers realize their travel dreams by providing reliable, fast and professional service.'
            : 'Vize başvuru süreçlerini karmaşık ve stresli olmaktan çıkarıp, herkes için erişilebilir ve anlaşılır hale getirmek. Müşterilerimize güvenilir, hızlı ve profesyonel bir hizmet sunarak seyahat hayallerini gerçekleştirmelerine yardımcı olmak.'}
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-slate-900">{isEnglish ? 'Our Vision' : 'Vizyonumuz'}</h2>
        <p className="text-sm leading-relaxed text-slate-600">
          {isEnglish
            ? 'To be Turkey\'s most trusted and preferred visa consultancy firm. To continue making a difference in the industry with our technology and human-oriented approach.'
            : 'Türkiye\'nin en güvenilir ve tercih edilen vize danışmanlık firması olmak. Teknoloji ve insan odaklı yaklaşımımızla sektörde fark yaratmaya devam etmek.'}
        </p>
      </section>

      <section className="card border-primary/10 bg-primary/5">
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-slate-900">
            {isEnglish ? 'We are with you in your visa process' : 'Vize sürecinizde yanınızdayız'}
          </h2>
          <p className="text-sm text-slate-600">
            {isEnglish
              ? 'Contact us immediately for your application, let our expert consultants help you.'
              : 'Başvurunuz için hemen bizimle iletişime geçin, uzman danışmanlarımız size yardımcı olsun.'}
          </p>
          <div className="flex flex-col gap-2 pt-2 sm:flex-row">
            <a
              href="tel:02129099971"
              className="inline-flex items-center justify-center rounded-lg border border-primary bg-white px-4 py-2 text-sm font-semibold text-primary shadow-sm hover:bg-slate-50"
            >
              {isEnglish ? 'Call 0212 909 99 71' : '0212 909 99 71\'i Ara'}
            </a>
            <Link href="/vize-basvuru-formu" className="btn-primary text-xs md:text-sm">
              {isEnglish ? 'Apply Online' : 'Online Başvuru Yap'}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
