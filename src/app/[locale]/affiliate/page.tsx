import { Metadata } from "next";
import Link from "next/link";
import { Users, TrendingUp, DollarSign, Gift, CheckCircle, ArrowRight } from "lucide-react";
import { AffiliateForm } from "@/components/forms/AffiliateForm";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const isEnglish = locale === 'en';
  
  const title = isEnglish ? "Affiliate Program | Kolay Seyahat" : "Affiliate Programı | Kolay Seyahat";
  const description = isEnglish 
    ? "Join Kolay Seyahat affiliate program and start earning. Earn commission by promoting visa services."
    : "Kolay Seyahat affiliate programına katılın ve kazanmaya başlayın. Vize hizmetlerini tanıtarak komisyon kazanın.";
  const url = `https://www.kolayseyahat.net${isEnglish ? '/en' : ''}/affiliate`;
  
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
        'tr': 'https://www.kolayseyahat.net/affiliate',
        'en': 'https://www.kolayseyahat.net/en/affiliate',
        'x-default': 'https://www.kolayseyahat.net/affiliate',
      },
    },
  };
}

interface AffiliatePageProps {
  params: Promise<{ locale: string }>;
}

export default async function AffiliatePage({ params }: AffiliatePageProps) {
  const { locale } = await params;
  const isEnglish = locale === 'en';

  const benefits = isEnglish ? [
    {
      icon: DollarSign,
      title: "High Commission",
      description: "Earn up to 15% commission for each successful application"
    },
    {
      icon: TrendingUp,
      title: "Passive Income",
      description: "Promote once, earn continuously"
    },
    {
      icon: Gift,
      title: "Special Bonuses",
      description: "Extra bonuses and rewards based on performance"
    },
    {
      icon: Users,
      title: "Support Team",
      description: "Our dedicated affiliate support team is always with you"
    }
  ] : [
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

  const steps = isEnglish ? [
    {
      number: "1",
      title: "Apply",
      description: "Apply for free to our affiliate program and get approved"
    },
    {
      number: "2",
      title: "Promote",
      description: "Share your unique referral link and promote"
    },
    {
      number: "3",
      title: "Earn",
      description: "Earn commission for each successful application"
    }
  ] : [
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
  
  const t = isEnglish ? {
    heroTitle: "Affiliate Program",
    heroSubtitle: "Partner with Kolay Seyahat and start earning by promoting visa services!",
    applyNow: "Apply Now",
    details: "Details",
    whyJoin: "Why Join Our Affiliate Program?",
    whyJoinSubtitle: "A profitable and easy partnership opportunity",
    howItWorks: "How It Works?",
    howItWorksSubtitle: "Start earning in 3 simple steps",
    commissionStructure: "Commission Structure",
    commissionSubtitle: "Increasing commission rates based on your performance",
    starter: "Starter",
    midLevel: "Mid Level",
    premium: "Premium",
    commissionRate: "Commission Rate",
    applicationsMonth: "applications/month",
    basicSupport: "Basic support",
    monthlyPayment: "Monthly payment",
    prioritySupport: "Priority support",
    specialMaterials: "Special promotional materials",
    vipSupport: "VIP support",
    specialBonuses: "Special bonuses",
    whoCanApply: "Who Can Apply?",
    idealCandidates: "Ideal Candidates:",
    requirements: "Requirements:",
    bloggers: "Bloggers and content creators",
    influencers: "Social media influencers",
    travelAgencies: "Travel agencies",
    educationConsultants: "Education consultants",
    websiteOwners: "Website owners",
    ageReq: "18 years or older",
    activePresence: "Active website or social media account",
    qualityContent: "Ability to create quality content",
    ethicalPromotion: "Ethical promotion practices",
    applicationForm: "Affiliate Application Form",
    faq: "Frequently Asked Questions",
    faq1q: "When are payments made?",
    faq1a: "Commissions are calculated monthly and deposited to your bank account on the 15th of each month.",
    faq2q: "Is there a minimum payment amount?",
    faq2a: "Yes, the minimum payment amount is 500 TL. Earnings below this amount are carried over to the next month.",
    faq3q: "Are promotional materials provided?",
    faq3a: "Yes, we provide banners, text links and promotional content to our approved affiliate partners.",
  } : {
    heroTitle: "Affiliate Programı",
    heroSubtitle: "Kolay Seyahat ile ortaklık yapın, vize hizmetlerini tanıtarak kazanmaya başlayın!",
    applyNow: "Hemen Başvur",
    details: "Detaylı Bilgi",
    whyJoin: "Neden Affiliate Programımıza Katılmalısınız?",
    whyJoinSubtitle: "Kazançlı ve kolay bir iş birliği fırsatı",
    howItWorks: "Nasıl Çalışır?",
    howItWorksSubtitle: "3 basit adımda kazanmaya başlayın",
    commissionStructure: "Komisyon Yapısı",
    commissionSubtitle: "Performansınıza göre artan komisyon oranları",
    starter: "Başlangıç",
    midLevel: "Orta Seviye",
    premium: "Premium",
    commissionRate: "Komisyon Oranı",
    applicationsMonth: "başvuru/ay",
    basicSupport: "Temel destek",
    monthlyPayment: "Aylık ödeme",
    prioritySupport: "Öncelikli destek",
    specialMaterials: "Özel tanıtım materyalleri",
    vipSupport: "VIP destek",
    specialBonuses: "Özel bonuslar",
    whoCanApply: "Kimler Başvurabilir?",
    idealCandidates: "İdeal Adaylar:",
    requirements: "Gereksinimler:",
    bloggers: "Blog yazarları ve içerik üreticileri",
    influencers: "Sosyal medya fenomenleri",
    travelAgencies: "Seyahat acenteleri",
    educationConsultants: "Eğitim danışmanları",
    websiteOwners: "Web sitesi sahipleri",
    ageReq: "18 yaş ve üzeri olmak",
    activePresence: "Aktif bir web sitesi veya sosyal medya hesabı",
    qualityContent: "Kaliteli içerik üretme yeteneği",
    ethicalPromotion: "Etik kurallara uygun tanıtım",
    applicationForm: "Affiliate Başvuru Formu",
    faq: "Sıkça Sorulan Sorular",
    faq1q: "Ödemeler ne zaman yapılır?",
    faq1a: "Komisyonlar aylık olarak hesaplanır ve her ayın 15'inde banka hesabınıza yatırılır.",
    faq2q: "Minimum ödeme tutarı var mı?",
    faq2a: "Evet, minimum ödeme tutarı 500 TL'dir. Bu tutarın altındaki kazançlar bir sonraki aya devredilir.",
    faq3q: "Tanıtım materyalleri sağlanıyor mu?",
    faq3a: "Evet, onaylanan affiliate ortaklarımıza banner, metin linkleri ve tanıtım içerikleri sağlıyoruz.",
  };

  return (
    <div className="space-y-12 pb-12">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary to-blue-600 py-16 text-white">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="mb-4 text-4xl font-bold md:text-5xl">
              {t.heroTitle}
            </h1>
            <p className="mb-6 text-lg text-blue-50 md:text-xl">
              {t.heroSubtitle}
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Link
                href="#basvuru"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-8 py-3 font-semibold text-primary shadow-lg transition-all hover:bg-blue-50"
              >
                {t.applyNow}
                <ArrowRight className="h-5 w-5" />
              </Link>
              <a
                href="#detaylar"
                className="inline-flex items-center justify-center gap-2 rounded-lg border-2 border-white px-8 py-3 font-semibold text-white transition-all hover:bg-white/10"
              >
                {t.details}
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="container mx-auto px-4">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold text-slate-900">
            {t.whyJoin}
          </h2>
          <p className="mt-2 text-slate-600">
            {t.whyJoinSubtitle}
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
              {t.howItWorks}
            </h2>
            <p className="mt-2 text-slate-600">
              {t.howItWorksSubtitle}
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
              {t.commissionStructure}
            </h2>
            <p className="mt-2 text-slate-600">
              {t.commissionSubtitle}
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <div className="card border-2 border-slate-200">
              <div className="mb-4 inline-block rounded-lg bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700">
                {t.starter}
              </div>
              <div className="mb-2 text-4xl font-bold text-slate-900">%10</div>
              <p className="mb-4 text-sm text-slate-600">{t.commissionRate}</p>
              <ul className="space-y-2 text-sm text-slate-700">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 flex-shrink-0 text-green-600" />
                  <span>0-10 {t.applicationsMonth}</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 flex-shrink-0 text-green-600" />
                  <span>{t.basicSupport}</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 flex-shrink-0 text-green-600" />
                  <span>{t.monthlyPayment}</span>
                </li>
              </ul>
            </div>

            <div className="card border-2 border-primary bg-primary/5">
              <div className="mb-4 inline-block rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white">
                {t.midLevel}
              </div>
              <div className="mb-2 text-4xl font-bold text-primary">%12</div>
              <p className="mb-4 text-sm text-slate-600">{t.commissionRate}</p>
              <ul className="space-y-2 text-sm text-slate-700">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 flex-shrink-0 text-green-600" />
                  <span>11-25 {t.applicationsMonth}</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 flex-shrink-0 text-green-600" />
                  <span>{t.prioritySupport}</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 flex-shrink-0 text-green-600" />
                  <span>{t.specialMaterials}</span>
                </li>
              </ul>
            </div>

            <div className="card border-2 border-amber-500 bg-gradient-to-br from-amber-50 to-amber-100">
              <div className="mb-4 inline-block rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-white">
                {t.premium}
              </div>
              <div className="mb-2 text-4xl font-bold text-amber-600">%15</div>
              <p className="mb-4 text-sm text-slate-600">{t.commissionRate}</p>
              <ul className="space-y-2 text-sm text-slate-700">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 flex-shrink-0 text-green-600" />
                  <span>26+ {t.applicationsMonth}</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 flex-shrink-0 text-green-600" />
                  <span>{t.vipSupport}</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 flex-shrink-0 text-green-600" />
                  <span>{t.specialBonuses}</span>
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
                {t.whoCanApply}
              </h2>
            </div>

            <div className="card">
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <h3 className="mb-4 font-semibold text-slate-900">{t.idealCandidates}</h3>
                  <ul className="space-y-2 text-slate-700">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 flex-shrink-0 text-green-600" />
                      <span>{t.bloggers}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 flex-shrink-0 text-green-600" />
                      <span>{t.influencers}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 flex-shrink-0 text-green-600" />
                      <span>{t.travelAgencies}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 flex-shrink-0 text-green-600" />
                      <span>{t.educationConsultants}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 flex-shrink-0 text-green-600" />
                      <span>{t.websiteOwners}</span>
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="mb-4 font-semibold text-slate-900">{t.requirements}</h3>
                  <ul className="space-y-2 text-slate-700">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 flex-shrink-0 text-green-600" />
                      <span>{t.ageReq}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 flex-shrink-0 text-green-600" />
                      <span>{t.activePresence}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 flex-shrink-0 text-green-600" />
                      <span>{t.qualityContent}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 flex-shrink-0 text-green-600" />
                      <span>{t.ethicalPromotion}</span>
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
              {t.applicationForm}
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
              {t.faq}
            </h2>
            <div className="space-y-4">
              <details className="card cursor-pointer">
                <summary className="font-semibold text-slate-900">
                  {t.faq1q}
                </summary>
                <p className="mt-3 border-t border-slate-100 pt-3 text-slate-700">
                  {t.faq1a}
                </p>
              </details>
              <details className="card cursor-pointer">
                <summary className="font-semibold text-slate-900">
                  {t.faq2q}
                </summary>
                <p className="mt-3 border-t border-slate-100 pt-3 text-slate-700">
                  {t.faq2a}
                </p>
              </details>
              <details className="card cursor-pointer">
                <summary className="font-semibold text-slate-900">
                  {t.faq3q}
                </summary>
                <p className="mt-3 border-t border-slate-100 pt-3 text-slate-700">
                  {t.faq3a}
                </p>
              </details>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
