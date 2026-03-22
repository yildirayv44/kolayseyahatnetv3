import { Breadcrumb } from '@/components/shared/Breadcrumb';
import { CheckCircle2, XCircle, AlertCircle, ArrowRight, Clock, DollarSign, FileText, Package } from 'lucide-react';
import { ApplicationFormLink } from '@/components/shared/ApplicationFormLink';

interface VisaCheckResult {
  source: {
    code: string;
    name: string;
    flag_emoji: string;
  };
  destination: {
    code: string;
    name: string;
    flag_emoji: string;
  };
  visa_status: string;
  allowed_stay: string | null;
  conditions: string | null;
  visa_cost: string | null;
  processing_time: string | null;
  application_method: string | null;
  packages: Array<{
    id: number;
    name: string;
    price: string;
    currency_id: number;
    description: string;
  }>;
  has_packages: boolean;
}

interface BilateralVisaRequirementsServerProps {
  sourceCountryCode: string;
  destinationCountryCode: string;
  sourceCountryName: string;
  destinationCountryName: string;
  locale: 'tr' | 'en';
  visaResult: VisaCheckResult | null;
}

export function BilateralVisaRequirementsServer({
  sourceCountryCode,
  destinationCountryCode,
  sourceCountryName,
  destinationCountryName,
  locale,
  visaResult
}: BilateralVisaRequirementsServerProps) {
  const isEnglish = locale === 'en';

  const breadcrumbItems = [
    { label: isEnglish ? 'Countries' : 'Ülkeler', href: '/ulkeler' },
    { label: `${sourceCountryName} → ${destinationCountryName}` }
  ];

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
      'unknown': { tr: '❓ Bilinmiyor', en: '❓ Unknown' },
    };
    return isEnglish ? labels[status]?.en || status : labels[status]?.tr || status;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="container mx-auto px-4 py-6 md:py-8 max-w-5xl">
        <Breadcrumb items={breadcrumbItems} />
        
        <div className="mt-6 md:mt-8 space-y-8">
          {/* Header */}
          <div className="text-center space-y-3">
            <h1 className="text-3xl md:text-5xl font-bold text-slate-900 tracking-tight">
              {sourceCountryName} → {destinationCountryName} {isEnglish ? 'Visa' : 'Vizesi'}
            </h1>
            <p className="text-base md:text-lg text-slate-600 max-w-2xl mx-auto">
              {isEnglish 
                ? `Visa requirements for ${sourceCountryName} citizens traveling to ${destinationCountryName}`
                : `${sourceCountryName} vatandaşları için ${destinationCountryName} vize gereklilikleri`
              }
            </p>
          </div>

          {/* Visa Status Card */}
          {visaResult ? (
            <div className="card border-2 shadow-lg">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6 pb-6 border-b border-slate-200">
                <div className="flex items-center gap-4">
                  <span className="text-5xl">{visaResult.source.flag_emoji}</span>
                  <ArrowRight className="h-8 w-8 text-slate-400" />
                  <span className="text-5xl">{visaResult.destination.flag_emoji}</span>
                </div>
                <span className={`inline-flex rounded-full border-2 px-6 py-3 text-base font-bold ${getVisaStatusColor(visaResult.visa_status)} shadow-sm`}>
                  {getVisaStatusLabel(visaResult.visa_status)}
                </span>
              </div>

              <h3 className="text-2xl font-bold text-slate-900 mb-6">
                {visaResult.source.name} → {visaResult.destination.name}
              </h3>

              <div className="grid gap-6 md:grid-cols-2">
                {visaResult.allowed_stay && (
                  <div className="flex items-start gap-4 p-4 rounded-lg bg-slate-50 border border-slate-200">
                    <div className="flex-shrink-0 p-2 rounded-lg bg-blue-100">
                      <Clock className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-slate-700 mb-1">
                        {isEnglish ? 'Allowed Stay' : 'Kalış Süresi'}
                      </div>
                      <div className="text-base font-medium text-slate-900">{visaResult.allowed_stay}</div>
                    </div>
                  </div>
                )}

                {visaResult.visa_cost && (
                  <div className="flex items-start gap-4 p-4 rounded-lg bg-slate-50 border border-slate-200">
                    <div className="flex-shrink-0 p-2 rounded-lg bg-green-100">
                      <DollarSign className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-slate-700 mb-1">
                        {isEnglish ? 'Visa Cost' : 'Vize Ücreti'}
                      </div>
                      <div className="text-base font-medium text-slate-900">{visaResult.visa_cost}</div>
                    </div>
                  </div>
                )}

                {visaResult.processing_time && (
                  <div className="flex items-start gap-4 p-4 rounded-lg bg-slate-50 border border-slate-200">
                    <div className="flex-shrink-0 p-2 rounded-lg bg-orange-100">
                      <Clock className="h-6 w-6 text-orange-600" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-slate-700 mb-1">
                        {isEnglish ? 'Processing Time' : 'İşlem Süresi'}
                      </div>
                      <div className="text-base font-medium text-slate-900">{visaResult.processing_time}</div>
                    </div>
                  </div>
                )}

                {visaResult.application_method && (
                  <div className="flex items-start gap-4 p-4 rounded-lg bg-slate-50 border border-slate-200">
                    <div className="flex-shrink-0 p-2 rounded-lg bg-purple-100">
                      <FileText className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-slate-700 mb-1">
                        {isEnglish ? 'Application Method' : 'Başvuru Yöntemi'}
                      </div>
                      <div className="text-base font-medium text-slate-900 capitalize">{visaResult.application_method}</div>
                    </div>
                  </div>
                )}
              </div>

              {visaResult.conditions && (
                <div className="mt-6 pt-6 border-t border-slate-200">
                  <div className="flex items-start gap-3 p-4 rounded-lg bg-amber-50 border border-amber-200">
                    <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="text-sm font-semibold text-amber-900 mb-2">
                        {isEnglish ? 'Important Conditions' : 'Önemli Koşullar'}
                      </div>
                      <div className="text-sm text-amber-800">{visaResult.conditions}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="card border-2 border-slate-200 shadow-lg">
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-slate-100 mb-6">
                  <AlertCircle className="h-10 w-10 text-slate-400" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-3">
                  {isEnglish ? 'Visa Information Not Available' : 'Vize Bilgisi Bulunamadı'}
                </h2>
                <p className="text-slate-600 max-w-md mx-auto mb-6">
                  {isEnglish 
                    ? 'We could not find visa requirement information for this country combination. Please contact us for detailed information.'
                    : 'Bu ülke kombinasyonu için vize gereklilik bilgisi bulunamadı. Detaylı bilgi için lütfen bizimle iletişime geçin.'
                  }
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <a
                    href="tel:02129099971"
                    className="inline-flex items-center justify-center gap-2 rounded-lg border-2 border-primary bg-white px-6 py-3 font-semibold text-primary transition-all hover:bg-primary hover:text-white"
                  >
                    0212 909 99 71
                  </a>
                  <a
                    href="/vize-basvuru-formu"
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 font-semibold text-white shadow-lg transition-all hover:bg-primary/90"
                  >
                    {isEnglish ? 'Contact Us' : 'İletişime Geç'}
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* Packages */}
          {visaResult?.has_packages ? (
            <div className="card">
              <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <Package className="h-5 w-5 text-primary" />
                {isEnglish ? 'Available Consultation Packages' : 'Mevcut Danışmanlık Paketleri'}
              </h3>
              <div className="grid gap-4 md:grid-cols-2">
                {visaResult.packages.map((pkg) => (
                  <div key={pkg.id} className="border border-slate-200 rounded-lg p-4 hover:border-primary transition-colors">
                    <h4 className="font-semibold text-slate-900 mb-2">{pkg.name}</h4>
                    {pkg.description && (
                      <p className="text-sm text-slate-600 mb-3">{pkg.description}</p>
                    )}
                    <div className="text-2xl font-bold text-primary mb-3">
                      {pkg.currency_id === 1 ? '₺' : pkg.currency_id === 2 ? '$' : '€'}{pkg.price}
                    </div>
                    <ApplicationFormLink
                      queryParams={{
                        package_id: pkg.id,
                      }}
                      className="btn-primary w-full text-sm"
                    >
                      {isEnglish ? 'Apply Now' : 'Başvuru Yap'}
                    </ApplicationFormLink>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="card border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-blue-50 p-8 text-center">
              <h3 className="text-2xl font-bold text-slate-900 mb-4">
                {isEnglish ? 'Need Professional Help?' : 'Profesyonel Yardıma mı İhtiyacınız Var?'}
              </h3>
              <p className="text-slate-600 mb-6">
                {isEnglish 
                  ? 'Our expert consultants can help you with your visa application process.'
                  : 'Uzman danışmanlarımız vize başvuru sürecinizde size yardımcı olabilir.'
                }
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="/vize-basvuru-formu"
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-8 py-3 font-semibold text-white shadow-lg transition-all hover:bg-primary/90"
                >
                  {isEnglish ? 'Apply Now' : 'Hemen Başvur'}
                  <ArrowRight className="h-5 w-5" />
                </a>
                <a
                  href="tel:02129099971"
                  className="inline-flex items-center justify-center gap-2 rounded-lg border-2 border-primary bg-white px-8 py-3 font-semibold text-primary transition-all hover:bg-primary hover:text-white"
                >
                  0212 909 99 71
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
