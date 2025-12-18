import type { Metadata } from "next";
import Link from "next/link";
import { Mail, Phone, MapPin } from "lucide-react";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const isEnglish = locale === 'en';
  
  const title = isEnglish ? "Contact | Kolay Seyahat" : "İletişim | Kolay Seyahat";
  const description = isEnglish
    ? "Contact Kolay Seyahat. Reach us by phone, email or online application form for your visa application."
    : "Kolay Seyahat ile iletişime geçin. Vize başvurunuz için telefon, e-posta veya online başvuru formu ile bize ulaşabilirsiniz.";
  const url = `https://www.kolayseyahat.net${isEnglish ? '/en' : ''}/iletisim`;
  
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
        'tr': 'https://www.kolayseyahat.net/iletisim',
        'en': 'https://www.kolayseyahat.net/en/iletisim',
        'x-default': 'https://www.kolayseyahat.net/iletisim',
      },
    },
  };
}

export default function ContactPage() {
  return (
    <div className="space-y-10">
      <section className="space-y-4 border-b border-slate-200 pb-6">
        <h1 className="text-2xl font-semibold text-slate-900 md:text-3xl">İletişim</h1>
        <p className="max-w-2xl text-sm text-slate-600">
          Vize başvurunuz veya danışmanlık hizmetlerimiz hakkında detaylı bilgi almak için
          bizimle iletişime geçebilirsiniz. Uzman kadromuz size yardımcı olmaktan mutluluk
          duyacaktır.
        </p>
      </section>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="card space-y-3 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Phone className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Telefon</h3>
            <a
              href="tel:02129099971"
              className="mt-1 block text-sm text-slate-600 hover:text-primary"
            >
              0212 909 99 71
            </a>
          </div>
        </div>

        <div className="card space-y-3 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Mail className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900">E-posta</h3>
            <a
              href="mailto:vize@kolayseyahat.net"
              className="mt-1 block text-sm text-slate-600 hover:text-primary"
            >
              vize@kolayseyahat.net
            </a>
          </div>
        </div>

        <div className="card space-y-3 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <MapPin className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Adres</h3>
            <p className="mt-1 text-sm text-slate-600">İstanbul, Türkiye</p>
          </div>
        </div>
      </div>

      <section className="card border-primary/10 bg-primary/5">
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-slate-900">
            Hemen başvurunuzu başlatın
          </h2>
          <p className="text-sm text-slate-600">
            Online başvuru formumuzu doldurarak vize sürecinizi hızlıca başlatabilirsiniz.
            Danışmanlarımız en kısa sürede sizinle iletişime geçecektir.
          </p>
          <Link href="/vize-basvuru-formu" className="btn-primary inline-flex text-xs md:text-sm">
            Online Başvuru Formu
          </Link>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-900">Çalışma Saatleri</h2>
        <div className="card space-y-2 text-sm text-slate-700">
          <div className="flex justify-between">
            <span className="font-medium">Pazartesi - Cuma:</span>
            <span>09:00 - 18:00</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">Cumartesi:</span>
            <span>10:00 - 16:00</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">Pazar:</span>
            <span className="text-slate-500">Kapalı</span>
          </div>
        </div>
      </section>
    </div>
  );
}
