import type { Metadata } from "next";
import Link from "next/link";
import { Building2, Users, FileCheck, Headphones } from "lucide-react";

interface CorporatePageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: CorporatePageProps): Promise<Metadata> {
  const { locale } = await params;
  const isEnglish = locale === 'en';
  
  const title = isEnglish 
    ? "Corporate Visa Consultancy | Kolay Seyahat"
    : "Kurumsal Vize Danışmanlığı | Kolay Seyahat";
  const description = isEnglish
    ? "Bulk visa applications, corporate agreements and special services for your company's employees. Corporate visa solutions with Kolay Seyahat."
    : "Şirketinizin çalışanları için toplu vize başvuruları, kurumsal anlaşmalar ve özel hizmetler. Kolay Seyahat ile kurumsal vize çözümleri.";
  const url = `https://www.kolayseyahat.net${isEnglish ? '/en' : ''}/kurumsal-vize-danismanligi`;

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
        'tr': 'https://www.kolayseyahat.net/kurumsal-vize-danismanligi',
        'en': 'https://www.kolayseyahat.net/en/kurumsal-vize-danismanligi',
        'x-default': 'https://www.kolayseyahat.net/kurumsal-vize-danismanligi',
      },
    },
  };
}

export default async function CorporatePage({ params }: CorporatePageProps) {
  const { locale } = await params;
  const isEnglish = locale === 'en';
  return (
    <div className="space-y-10">
      <section className="space-y-4 border-b border-slate-200 pb-6">
        <h1 className="text-2xl font-semibold text-slate-900 md:text-3xl">
          {isEnglish ? 'Corporate Visa Consultancy' : 'Kurumsal Vize Danışmanlığı'}
        </h1>
        <p className="max-w-3xl text-sm leading-relaxed text-slate-600">
          {isEnglish
            ? 'We offer special solutions for your company\'s business travel and employee visa applications. We simplify your visa processes with bulk applications, priority service and corporate agreements.'
            : 'Şirketinizin iş seyahatleri ve çalışan vize başvuruları için özel çözümler sunuyoruz. Toplu başvurular, öncelikli hizmet ve kurumsal anlaşmalarla vize süreçlerinizi kolaylaştırıyoruz.'}
        </p>
      </section>

      <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="card space-y-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Building2 className="h-5 w-5" />
          </div>
          <h3 className="text-sm font-semibold text-slate-900">{isEnglish ? 'Bulk Application' : 'Toplu Başvuru'}</h3>
          <p className="text-xs text-slate-600">
            {isEnglish ? 'Bulk visa application and fast processing for your employees.' : 'Çalışanlarınız için toplu vize başvurusu ve hızlı işlem.'}
          </p>
        </div>

        <div className="card space-y-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Users className="h-5 w-5" />
          </div>
          <h3 className="text-sm font-semibold text-slate-900">{isEnglish ? 'Dedicated Consultant' : 'Özel Danışman'}</h3>
          <p className="text-xs text-slate-600">
            {isEnglish ? 'Uninterrupted support with a dedicated consultant assigned to your company.' : 'Şirketinize özel atanmış danışman ile kesintisiz destek.'}
          </p>
        </div>

        <div className="card space-y-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
            <FileCheck className="h-5 w-5" />
          </div>
          <h3 className="text-sm font-semibold text-slate-900">{isEnglish ? 'Document Management' : 'Evrak Yönetimi'}</h3>
          <p className="text-xs text-slate-600">
            {isEnglish ? 'Organization and tracking of all documents from a single point.' : 'Tüm evrakların düzenlenmesi ve takibi tek noktadan.'}
          </p>
        </div>

        <div className="card space-y-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Headphones className="h-5 w-5" />
          </div>
          <h3 className="text-sm font-semibold text-slate-900">{isEnglish ? '24/7 Support' : '7/24 Destek'}</h3>
          <p className="text-xs text-slate-600">
            {isEnglish ? 'Priority communication and solutions in emergencies.' : 'Acil durumlarda öncelikli iletişim ve çözüm.'}
          </p>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-slate-900">
          {isEnglish ? 'Our Corporate Services' : 'Kurumsal Hizmetlerimiz'}
        </h2>
        <ul className="space-y-3 text-sm text-slate-700">
          <li className="flex items-start gap-2">
            <span className="mt-0.5 text-primary">•</span>
            <span>
              <strong>{isEnglish ? 'Business Visa Applications:' : 'İş Vizesi Başvuruları:'}</strong> {isEnglish ? 'Fast visa processing for your employees\' business travel.' : 'Çalışanlarınızın iş seyahatleri için hızlı vize işlemleri.'}
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-0.5 text-primary">•</span>
            <span>
              <strong>{isEnglish ? 'Bulk Application Management:' : 'Toplu Başvuru Yönetimi:'}</strong> {isEnglish ? 'Application and tracking for multiple employees simultaneously.' : 'Birden fazla çalışan için aynı anda başvuru ve takip.'}
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-0.5 text-primary">•</span>
            <span>
              <strong>{isEnglish ? 'Corporate Agreements:' : 'Kurumsal Anlaşmalar:'}</strong> {isEnglish ? 'Discounted packages and flexible payment options tailored to your company.' : 'Şirketinize özel indirimli paketler ve esnek ödeme seçenekleri.'}
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-0.5 text-primary">•</span>
            <span>
              <strong>{isEnglish ? 'Appointment Coordination:' : 'Randevu Koordinasyonu:'}</strong> {isEnglish ? 'Planning and management of consulate appointments.' : 'Konsolosluk randevularının planlanması ve yönetimi.'}
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-0.5 text-primary">•</span>
            <span>
              <strong>{isEnglish ? 'Reporting:' : 'Raporlama:'}</strong> {isEnglish ? 'Regular reporting and information about application processes.' : 'Başvuru süreçleri hakkında düzenli raporlama ve bilgilendirme.'}
            </span>
          </li>
        </ul>
      </section>

      <section className="card border-primary/10 bg-primary/5">
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-slate-900">
            {isEnglish ? 'Contact us for corporate solutions' : 'Kurumsal çözümler için bizimle iletişime geçin'}
          </h2>
          <p className="text-sm text-slate-600">
            {isEnglish
              ? 'You can call us or send an email to get a special offer and detailed information for your company\'s visa needs.'
              : 'Şirketinizin vize ihtiyaçları için özel bir teklif almak ve detaylı bilgi için bizi arayabilir veya e-posta gönderebilirsiniz.'}
          </p>
          <div className="flex flex-col gap-2 pt-2 sm:flex-row">
            <a
              href="tel:02129099971"
              className="inline-flex items-center justify-center rounded-lg border border-primary bg-white px-4 py-2 text-sm font-semibold text-primary shadow-sm hover:bg-slate-50"
            >
              {isEnglish ? 'Call 0212 909 99 71' : '0212 909 99 71\'i Ara'}
            </a>
            <a
              href="mailto:vize@kolayseyahat.net"
              className="btn-primary text-xs md:text-sm"
            >
              {isEnglish ? 'Send Email' : 'E-posta Gönder'}
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
