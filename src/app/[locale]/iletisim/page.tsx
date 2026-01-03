import type { Metadata } from "next";
import Link from "next/link";
import { Mail, Phone, MapPin, Building2, MessageCircle } from "lucide-react";

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

export default async function ContactPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const isEnglish = locale === 'en';
  return (
    <div className="space-y-10">
      <section className="space-y-4 border-b border-slate-200 pb-6">
        <h1 className="text-2xl font-semibold text-slate-900 md:text-3xl">{isEnglish ? 'Contact' : 'İletişim'}</h1>
        <p className="max-w-2xl text-sm text-slate-600">
          {isEnglish
            ? 'You can contact us for detailed information about your visa application or our consultancy services. Our expert team will be happy to help you.'
            : 'Vize başvurunuz veya danışmanlık hizmetlerimiz hakkında detaylı bilgi almak için bizimle iletişime geçebilirsiniz. Uzman kadromuz size yardımcı olmaktan mutluluk duyacaktır.'}
        </p>
      </section>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="card space-y-3 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Phone className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900">{isEnglish ? 'Call Center' : 'Çağrı Merkezi'}</h3>
            <a
              href="tel:02129099971"
              className="mt-1 block text-sm text-slate-600 hover:text-primary"
            >
              0212 909 99 71
            </a>
          </div>
        </div>

        <div className="card space-y-3 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-500/10 text-green-600">
            <MessageCircle className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900">{isEnglish ? '24/7 WhatsApp Support' : '7/24 WhatsApp Destek'}</h3>
            <a
              href="https://wa.me/12314032205"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 block text-sm text-green-600 hover:text-green-700 font-medium"
            >
              +1 231 403 2205
            </a>
            <p className="text-xs text-slate-500 mt-1">{isEnglish ? '(USA)' : '(Amerika)'}</p>
          </div>
        </div>

        <div className="card space-y-3 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Mail className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900">{isEnglish ? 'Email' : 'E-posta'}</h3>
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
            <h3 className="text-sm font-semibold text-slate-900">{isEnglish ? 'Meeting Address (By Appointment)' : 'Randevuyla Görüşme Adresi'}</h3>
            <div className="mt-1 text-sm text-slate-600 space-y-1">
              <p>Yeniçarşı Cad. Kalkan Han No: 36/4</p>
              <p>Beyoğlu - İstanbul, Türkiye</p>
              <p className="text-xs text-amber-600 font-medium mt-2">⚠️ {isEnglish ? 'Please visit by appointment' : 'Randevu alarak ziyaret ediniz'}</p>
            </div>
          </div>
        </div>

        <div className="card space-y-3 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600">
            <MapPin className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900">{isEnglish ? 'Legal Address' : 'Yasal Adres'}</h3>
            <div className="mt-1 text-sm text-slate-600 space-y-1">
              <p>Cami Mh. Niyaz Sk. No: 5 D: 1</p>
              <p>Darıca - Kocaeli, Türkiye</p>
              <p className="text-xs text-slate-500 font-medium mt-2">MERSİS: 0575107732000001</p>
            </div>
          </div>
        </div>
      </div>

      {/* Company Information */}
      <section className="card border-slate-300 bg-slate-50">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-200 text-slate-700 flex-shrink-0">
            <Building2 className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">{isEnglish ? 'Company Information' : 'Şirket Bilgileri'}</h2>
            <div className="grid gap-3 sm:grid-cols-2 text-sm">
              <div>
                <p className="text-xs text-slate-600 mb-1">{isEnglish ? 'Company Name' : 'Şirket Adı'}</p>
                <p className="font-semibold text-slate-900">Kolay Seyahat Teknoloji Ltd. Şti.</p>
              </div>
              <div>
                <p className="text-xs text-slate-600 mb-1">{isEnglish ? 'Tax Number' : 'Vergi No'}</p>
                <p className="font-semibold text-slate-900">5751077320</p>
              </div>
              <div>
                <p className="text-xs text-slate-600 mb-1">{isEnglish ? 'Tax Office' : 'Vergi Dairesi'}</p>
                <p className="font-semibold text-slate-900">Uluçınar</p>
              </div>
              <div>
                <p className="text-xs text-slate-600 mb-1">MERSİS No</p>
                <p className="font-semibold text-slate-900">0575107732000001</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="card border-primary/10 bg-primary/5">
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-slate-900">
            {isEnglish ? 'Start your application now' : 'Hemen başvurunuzu başlatın'}
          </h2>
          <p className="text-sm text-slate-600">
            {isEnglish
              ? 'You can quickly start your visa process by filling out our online application form. Our consultants will contact you as soon as possible.'
              : 'Online başvuru formumuzu doldurarak vize sürecinizi hızlıca başlatabilirsiniz. Danışmanlarımız en kısa sürede sizinle iletişime geçecektir.'}
          </p>
          <Link href="/vize-basvuru-formu" className="btn-primary inline-flex text-xs md:text-sm">
            {isEnglish ? 'Online Application Form' : 'Online Başvuru Formu'}
          </Link>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-900">{isEnglish ? 'Working Hours' : 'Çalışma Saatleri'}</h2>
        <div className="card space-y-2 text-sm text-slate-700">
          <div className="flex justify-between">
            <span className="font-medium">{isEnglish ? 'Monday - Friday:' : 'Pazartesi - Cuma:'}</span>
            <span>09:00 - 18:00</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">{isEnglish ? 'Saturday:' : 'Cumartesi:'}</span>
            <span>10:00 - 16:00</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">{isEnglish ? 'Sunday:' : 'Pazar:'}</span>
            <span className="text-slate-500">{isEnglish ? 'Closed' : 'Kapalı'}</span>
          </div>
        </div>
      </section>
    </div>
  );
}
