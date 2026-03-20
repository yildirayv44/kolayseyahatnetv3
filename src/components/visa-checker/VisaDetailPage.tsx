"use client";

import { ArrowRight, CheckCircle, Clock, DollarSign, FileText, Package, AlertCircle } from "lucide-react";
import { ApplicationFormLink } from "@/components/shared/ApplicationFormLink";
import { Breadcrumb } from "@/components/shared/Breadcrumb";

interface Country {
  id: number;
  name: string;
  country_code: string;
  flag_emoji: string;
}

interface VisaRequirement {
  visa_status: string;
  allowed_stay: string | null;
  conditions: string | null;
  visa_cost: string | null;
  processing_time: string | null;
  application_method: string | null;
  application_url: string | null;
  notes: string | null;
}

interface Package {
  id: number;
  name: string;
  price: string;
  currency_id: number;
  description: string;
  requirements: any;
  process_time: string;
}

interface SEOContent {
  meta_title: string;
  meta_description: string;
  h1_title: string;
  intro_text: string;
  requirements_section: string;
  process_section: string;
  faq_json: Array<{ question: string; answer: string }>;
}

interface VisaDetailPageProps {
  sourceCountry: Country;
  destCountry: Country;
  visaRequirement: VisaRequirement;
  packages: Package[];
  seoContent: SEOContent | null;
  locale: string;
}

export function VisaDetailPage({
  sourceCountry,
  destCountry,
  visaRequirement,
  packages,
  seoContent,
  locale,
}: VisaDetailPageProps) {
  const isEnglish = locale === 'en';

  const getVisaStatusColor = (status: string) => {
    switch (status) {
      case 'visa-free':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'visa-on-arrival':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'eta':
        return 'bg-cyan-100 text-cyan-800 border-cyan-300';
      case 'visa-required':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getVisaStatusLabel = (status: string) => {
    const labels: Record<string, { tr: string; en: string }> = {
      'visa-free': { tr: '✅ Vizesiz', en: '✅ Visa Free' },
      'visa-on-arrival': { tr: '🛬 Varışta Vize', en: '🛬 Visa on Arrival' },
      'eta': { tr: '📧 ETA Gerekli', en: '📧 ETA Required' },
      'visa-required': { tr: '🏛️ Vize Gerekli', en: '🏛️ Visa Required' },
      'evisa': { tr: '💻 E-Vize', en: '💻 E-Visa' },
    };
    return isEnglish ? labels[status]?.en || status : labels[status]?.tr || status;
  };

  const breadcrumbItems = [
    { label: isEnglish ? 'Home' : 'Ana Sayfa', href: '/' },
    { label: isEnglish ? 'Visa Checker' : 'Vize Sorgulama', href: '/vize-sorgulama' },
    { label: `${sourceCountry.name} → ${destCountry.name}` },
  ];

  return (
    <div className="space-y-8">
      {/* Breadcrumb */}
      <Breadcrumb items={breadcrumbItems} />

      {/* Hero Section */}
      <section className="space-y-4">
        <div className="flex items-center gap-4 mb-4">
          <span className="text-6xl">{sourceCountry.flag_emoji}</span>
          <ArrowRight className="h-8 w-8 text-slate-400" />
          <span className="text-6xl">{destCountry.flag_emoji}</span>
        </div>

        <h1 className="text-3xl font-bold text-slate-900 md:text-4xl">
          {seoContent?.h1_title || 
            (isEnglish 
              ? `${sourceCountry.name} Citizens ${destCountry.name} Visa`
              : `${sourceCountry.name} Vatandaşları İçin ${destCountry.name} Vizesi`)}
        </h1>

        <div className="flex items-center gap-3">
          <span className={`inline-flex rounded-full border px-4 py-2 text-sm font-semibold ${getVisaStatusColor(visaRequirement.visa_status)}`}>
            {getVisaStatusLabel(visaRequirement.visa_status)}
          </span>
          {visaRequirement.allowed_stay && (
            <span className="inline-flex items-center gap-2 text-sm text-slate-600">
              <Clock className="h-4 w-4" />
              {visaRequirement.allowed_stay}
            </span>
          )}
        </div>
      </section>

      {/* Intro Text */}
      {seoContent?.intro_text && (
        <section className="card">
          <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: seoContent.intro_text }} />
        </section>
      )}

      {/* Visa Information Card */}
      <section className="card border-2">
        <h2 className="text-xl font-bold text-slate-900 mb-4">
          {isEnglish ? 'Visa Information' : 'Vize Bilgileri'}
        </h2>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-slate-400 mt-0.5" />
            <div>
              <div className="text-sm font-medium text-slate-900">
                {isEnglish ? 'Visa Status' : 'Vize Durumu'}
              </div>
              <div className="text-sm text-slate-600">{getVisaStatusLabel(visaRequirement.visa_status)}</div>
            </div>
          </div>

          {visaRequirement.allowed_stay && (
            <div className="flex items-start gap-3">
              <Clock className="h-5 w-5 text-slate-400 mt-0.5" />
              <div>
                <div className="text-sm font-medium text-slate-900">
                  {isEnglish ? 'Allowed Stay' : 'Kalış Süresi'}
                </div>
                <div className="text-sm text-slate-600">{visaRequirement.allowed_stay}</div>
              </div>
            </div>
          )}

          {visaRequirement.visa_cost && (
            <div className="flex items-start gap-3">
              <DollarSign className="h-5 w-5 text-slate-400 mt-0.5" />
              <div>
                <div className="text-sm font-medium text-slate-900">
                  {isEnglish ? 'Visa Cost' : 'Vize Ücreti'}
                </div>
                <div className="text-sm text-slate-600">{visaRequirement.visa_cost}</div>
              </div>
            </div>
          )}

          {visaRequirement.processing_time && (
            <div className="flex items-start gap-3">
              <Clock className="h-5 w-5 text-slate-400 mt-0.5" />
              <div>
                <div className="text-sm font-medium text-slate-900">
                  {isEnglish ? 'Processing Time' : 'İşlem Süresi'}
                </div>
                <div className="text-sm text-slate-600">{visaRequirement.processing_time}</div>
              </div>
            </div>
          )}

          {visaRequirement.application_method && (
            <div className="flex items-start gap-3">
              <FileText className="h-5 w-5 text-slate-400 mt-0.5" />
              <div>
                <div className="text-sm font-medium text-slate-900">
                  {isEnglish ? 'Application Method' : 'Başvuru Yöntemi'}
                </div>
                <div className="text-sm text-slate-600 capitalize">{visaRequirement.application_method}</div>
              </div>
            </div>
          )}
        </div>

        {visaRequirement.conditions && (
          <div className="mt-4 pt-4 border-t border-slate-200">
            <div className="text-sm font-medium text-slate-900 mb-2">
              {isEnglish ? 'Conditions & Requirements' : 'Koşullar ve Gereklilikler'}
            </div>
            <div className="text-sm text-slate-600">{visaRequirement.conditions}</div>
          </div>
        )}

        {visaRequirement.notes && (
          <div className="mt-4 pt-4 border-t border-slate-200">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-blue-500 mt-0.5" />
              <div className="text-sm text-slate-600">{visaRequirement.notes}</div>
            </div>
          </div>
        )}
      </section>

      {/* Requirements Section */}
      {seoContent?.requirements_section && (
        <section className="card">
          <h2 className="text-xl font-bold text-slate-900 mb-4">
            {isEnglish ? 'Required Documents' : 'Gerekli Belgeler'}
          </h2>
          <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: seoContent.requirements_section }} />
        </section>
      )}

      {/* Process Section */}
      {seoContent?.process_section && (
        <section className="card">
          <h2 className="text-xl font-bold text-slate-900 mb-4">
            {isEnglish ? 'Application Process' : 'Başvuru Süreci'}
          </h2>
          <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: seoContent.process_section }} />
        </section>
      )}

      {/* Packages */}
      {packages.length > 0 ? (
        <section className="card bg-gradient-to-br from-primary/5 to-primary/10">
          <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Package className="h-6 w-6 text-primary" />
            {isEnglish ? 'Consultation Packages' : 'Danışmanlık Paketleri'}
          </h2>
          <p className="text-sm text-slate-600 mb-6">
            {isEnglish
              ? 'We offer professional visa consultation services to make your application process easier.'
              : 'Vize başvuru sürecinizi kolaylaştırmak için profesyonel danışmanlık hizmetleri sunuyoruz.'}
          </p>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {packages.map((pkg) => (
              <div key={pkg.id} className="bg-white border border-slate-200 rounded-lg p-6 hover:border-primary transition-colors">
                <h3 className="font-semibold text-slate-900 mb-2">{pkg.name}</h3>
                {pkg.description && (
                  <p className="text-sm text-slate-600 mb-4">{pkg.description}</p>
                )}
                <div className="text-3xl font-bold text-primary mb-4">
                  {pkg.currency_id === 1 ? '₺' : pkg.currency_id === 2 ? '$' : '€'}{pkg.price}
                </div>
                <ApplicationFormLink
                  queryParams={{ package_id: pkg.id }}
                  className="btn-primary w-full text-sm"
                >
                  {isEnglish ? 'Apply Now' : 'Başvuru Yap'}
                </ApplicationFormLink>
              </div>
            ))}
          </div>
        </section>
      ) : (
        <section className="card bg-slate-50">
          <div className="text-center py-8">
            <Package className="h-12 w-12 text-slate-300 mx-auto mb-3" />
            <p className="text-sm text-slate-600">
              {isEnglish
                ? 'Consultation packages are not currently available for this country combination. You can still apply for a visa through official channels.'
                : 'Bu ülke kombinasyonu için şu anda danışmanlık paketi bulunmamaktadır. Vize başvurunuzu resmi kanallardan yapabilirsiniz.'}
            </p>
          </div>
        </section>
      )}

      {/* FAQ Section */}
      {seoContent?.faq_json && seoContent.faq_json.length > 0 && (
        <section className="card">
          <h2 className="text-xl font-bold text-slate-900 mb-6">
            {isEnglish ? 'Frequently Asked Questions' : 'Sık Sorulan Sorular'}
          </h2>
          <div className="space-y-4">
            {seoContent.faq_json.map((faq, index) => (
              <details key={index} className="group border border-slate-200 rounded-lg">
                <summary className="cursor-pointer p-4 font-medium text-slate-900 hover:bg-slate-50">
                  {faq.question}
                </summary>
                <div className="px-4 pb-4 text-sm text-slate-600">
                  {faq.answer}
                </div>
              </details>
            ))}
          </div>
        </section>
      )}

      {/* Disclaimer */}
      <section className="card bg-blue-50 border-blue-200">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
          <div className="text-sm text-blue-800">
            <strong>{isEnglish ? 'Important Notice:' : 'Önemli Uyarı:'}</strong>{' '}
            {isEnglish
              ? 'Visa requirements are subject to change without notice. Always verify current requirements with the official embassy or consulate before making travel arrangements.'
              : 'Vize gereklilikleri önceden haber verilmeksizin değişebilir. Seyahat planlarınızı yapmadan önce güncel gereklilikleri mutlaka resmi büyükelçilik veya konsolosluklardan doğrulayın.'}
          </div>
        </div>
      </section>
    </div>
  );
}
