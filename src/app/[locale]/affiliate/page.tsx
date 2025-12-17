import { Metadata } from "next";
import Link from "next/link";
import { Users, TrendingUp, DollarSign, Gift, CheckCircle, ArrowRight } from "lucide-react";
import { AffiliateForm } from "@/components/forms/AffiliateForm";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const isEnglish = locale === 'en';
  
  return {
    title: isEnglish ? "Affiliate Program | Kolay Seyahat" : "Affiliate Programı | Kolay Seyahat",
    description: isEnglish 
      ? "Join Kolay Seyahat affiliate program and start earning. Earn commission by promoting visa services."
      : "Kolay Seyahat affiliate programına katılın ve kazanmaya başlayın. Vize hizmetlerini tanıtarak komisyon kazanın.",
    alternates: {
      canonical: `https://www.kolayseyahat.net${isEnglish ? '/en' : ''}/affiliate`,
      languages: {
        'tr': 'https://www.kolayseyahat.net/affiliate',
        'en': 'https://www.kolayseyahat.net/en/affiliate',
        'x-default': 'https://www.kolayseyahat.net/affiliate',
      },
    },
  };
}

export default function AffiliatePage() {
  const benefits = [
    {
      icon: DollarSign,
      title: "Yüksek Komisyon",
      description: "Her başarılı başvuru için %15'e varan komisyon kazanın"
    },
    {
      icon: TrendingUp,
      title: "Pasif Gelir",
      description: "Bir kez tanıtın, sürekli kazanın"
    },
    {
      icon: Gift,
      title: "Özel Bonuslar",
      description: "Performansa göre ekstra bonuslar ve ödüller"
    },
    {
      icon: Users,
      title: "Destek Ekibi",
      description: "Özel affiliate destek ekibimiz her zaman yanınızda"
    }
  ];

  const steps = [
    {
      number: "1",
      title: "Başvuru Yapın",
      description: "Affiliate programımıza ücretsiz başvurun ve onay alın"
    },
    {
      number: "2",
      title: "Tanıtım Yapın",
      description: "Size özel referans linkini paylaşın ve tanıtım yapın"
    },
    {
      number: "3",
      title: "Kazanın",
      description: "Her başarılı başvuru için komisyon kazanın"
    }
  ];

  return (
    <div className="space-y-12 pb-12">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary to-blue-600 py-16 text-white">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="mb-4 text-4xl font-bold md:text-5xl">
              Affiliate Programı
            </h1>
            <p className="mb-6 text-lg text-blue-50 md:text-xl">
              Kolay Seyahat ile ortaklık yapın, vize hizmetlerini tanıtarak kazanmaya başlayın!
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Link
                href="#basvuru"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-8 py-3 font-semibold text-primary shadow-lg transition-all hover:bg-blue-50"
              >
                Hemen Başvur
                <ArrowRight className="h-5 w-5" />
              </Link>
              <a
                href="#detaylar"
                className="inline-flex items-center justify-center gap-2 rounded-lg border-2 border-white px-8 py-3 font-semibold text-white transition-all hover:bg-white/10"
              >
                Detaylı Bilgi
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="container mx-auto px-4">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold text-slate-900">
            Neden Affiliate Programımıza Katılmalısınız?
          </h2>
          <p className="mt-2 text-slate-600">
            Kazançlı ve kolay bir iş birliği fırsatı
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <div key={index} className="card text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <Icon className="h-8 w-8 text-primary" />
                </div>
                <h3 className="mt-4 text-xl font-bold text-slate-900">
                  {benefit.title}
                </h3>
                <p className="mt-2 text-slate-600">
                  {benefit.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* How It Works */}
      <section id="detaylar" className="bg-slate-50 py-12">
        <div className="container mx-auto px-4">
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-bold text-slate-900">
              Nasıl Çalışır?
            </h2>
            <p className="mt-2 text-slate-600">
              3 basit adımda kazanmaya başlayın
            </p>
          </div>

          <div className="mx-auto max-w-4xl">
            <div className="grid gap-6 md:grid-cols-3">
              {steps.map((step, index) => (
                <div key={index} className="card text-center">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary text-2xl font-bold text-white">
                    {step.number}
                  </div>
                  <h3 className="mt-4 text-xl font-bold text-slate-900">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-slate-600">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Commission Structure */}
      <section className="container mx-auto px-4">
        <div className="mx-auto max-w-4xl">
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-bold text-slate-900">
              Komisyon Yapısı
            </h2>
            <p className="mt-2 text-slate-600">
              Performansınıza göre artan komisyon oranları
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <div className="card border-2 border-slate-200">
              <div className="mb-4 inline-block rounded-lg bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700">
                Başlangıç
              </div>
              <div className="mb-2 text-4xl font-bold text-slate-900">%10</div>
              <p className="mb-4 text-sm text-slate-600">Komisyon Oranı</p>
              <ul className="space-y-2 text-sm text-slate-700">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 flex-shrink-0 text-green-600" />
                  <span>0-10 başvuru/ay</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 flex-shrink-0 text-green-600" />
                  <span>Temel destek</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 flex-shrink-0 text-green-600" />
                  <span>Aylık ödeme</span>
                </li>
              </ul>
            </div>

            <div className="card border-2 border-primary bg-primary/5">
              <div className="mb-4 inline-block rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white">
                Orta Seviye
              </div>
              <div className="mb-2 text-4xl font-bold text-primary">%12</div>
              <p className="mb-4 text-sm text-slate-600">Komisyon Oranı</p>
              <ul className="space-y-2 text-sm text-slate-700">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 flex-shrink-0 text-green-600" />
                  <span>11-25 başvuru/ay</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 flex-shrink-0 text-green-600" />
                  <span>Öncelikli destek</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 flex-shrink-0 text-green-600" />
                  <span>Özel tanıtım materyalleri</span>
                </li>
              </ul>
            </div>

            <div className="card border-2 border-amber-500 bg-gradient-to-br from-amber-50 to-amber-100">
              <div className="mb-4 inline-block rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-white">
                Premium
              </div>
              <div className="mb-2 text-4xl font-bold text-amber-600">%15</div>
              <p className="mb-4 text-sm text-slate-600">Komisyon Oranı</p>
              <ul className="space-y-2 text-sm text-slate-700">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 flex-shrink-0 text-green-600" />
                  <span>26+ başvuru/ay</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 flex-shrink-0 text-green-600" />
                  <span>VIP destek</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 flex-shrink-0 text-green-600" />
                  <span>Özel bonuslar</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Requirements */}
      <section className="bg-slate-50 py-12">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl">
            <div className="mb-8 text-center">
              <h2 className="text-3xl font-bold text-slate-900">
                Kimler Başvurabilir?
              </h2>
            </div>

            <div className="card">
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <h3 className="mb-4 font-semibold text-slate-900">İdeal Adaylar:</h3>
                  <ul className="space-y-2 text-slate-700">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 flex-shrink-0 text-green-600" />
                      <span>Blog yazarları ve içerik üreticileri</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 flex-shrink-0 text-green-600" />
                      <span>Sosyal medya fenomenleri</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 flex-shrink-0 text-green-600" />
                      <span>Seyahat acenteleri</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 flex-shrink-0 text-green-600" />
                      <span>Eğitim danışmanları</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 flex-shrink-0 text-green-600" />
                      <span>Web sitesi sahipleri</span>
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="mb-4 font-semibold text-slate-900">Gereksinimler:</h3>
                  <ul className="space-y-2 text-slate-700">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 flex-shrink-0 text-green-600" />
                      <span>18 yaş ve üzeri olmak</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 flex-shrink-0 text-green-600" />
                      <span>Aktif bir web sitesi veya sosyal medya hesabı</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 flex-shrink-0 text-green-600" />
                      <span>Kaliteli içerik üretme yeteneği</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 flex-shrink-0 text-green-600" />
                      <span>Etik kurallara uygun tanıtım</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Application Form */}
      <section id="basvuru" className="container mx-auto px-4">
        <div className="mx-auto max-w-2xl">
          <div className="card">
            <h2 className="mb-6 text-2xl font-bold text-slate-900">
              Affiliate Başvuru Formu
            </h2>
            <AffiliateForm />
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-slate-50 py-12">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl">
            <h2 className="mb-8 text-center text-3xl font-bold text-slate-900">
              Sıkça Sorulan Sorular
            </h2>
            <div className="space-y-4">
              <details className="card cursor-pointer">
                <summary className="font-semibold text-slate-900">
                  Ödemeler ne zaman yapılır?
                </summary>
                <p className="mt-3 border-t border-slate-100 pt-3 text-slate-700">
                  Komisyonlar aylık olarak hesaplanır ve her ayın 15'inde banka hesabınıza yatırılır.
                </p>
              </details>
              <details className="card cursor-pointer">
                <summary className="font-semibold text-slate-900">
                  Minimum ödeme tutarı var mı?
                </summary>
                <p className="mt-3 border-t border-slate-100 pt-3 text-slate-700">
                  Evet, minimum ödeme tutarı 500 TL'dir. Bu tutarın altındaki kazançlar bir sonraki aya devredilir.
                </p>
              </details>
              <details className="card cursor-pointer">
                <summary className="font-semibold text-slate-900">
                  Tanıtım materyalleri sağlanıyor mu?
                </summary>
                <p className="mt-3 border-t border-slate-100 pt-3 text-slate-700">
                  Evet, onaylanan affiliate ortaklarımıza banner, metin linkleri ve tanıtım içerikleri sağlıyoruz.
                </p>
              </details>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
