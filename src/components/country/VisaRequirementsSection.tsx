"use client";

import { useEffect, useState } from "react";
import { CheckCircle, XCircle, Clock, DollarSign, FileText, Globe, AlertCircle, Info } from "lucide-react";

interface VisaRequirement {
  country_code: string;
  country_name: string;
  visa_status: string;
  allowed_stay: string | null;
  conditions: string | null;
  visa_cost: string | null;
  processing_time: string | null;
  application_method: string | null;
}

interface VisaRequirementsSectionProps {
  countryCode: string;
  countryName: string;
  locale?: 'tr' | 'en';
}

// Kalış süresi çevirisi
function formatAllowedStay(stay: string | null, locale: 'tr' | 'en'): string {
  if (!stay) return locale === 'tr' ? 'Belirtilmemiş' : 'Not specified';
  
  // "90 days" -> "90 gün" veya "90 days"
  const match = stay.match(/^(\d+)\s*(days?|gün)$/i);
  if (match) {
    const num = match[1];
    return locale === 'tr' ? `${num} gün` : `${num} days`;
  }
  
  // Zaten Türkçe ise
  if (stay.toLowerCase().includes('gün')) {
    if (locale === 'en') {
      return stay.replace(/gün/gi, 'days');
    }
    return stay;
  }
  
  return stay;
}

// Başvuru yöntemi çevirisi
function formatApplicationMethod(method: string | null, locale: 'tr' | 'en'): string {
  if (!method) return locale === 'tr' ? 'Belirtilmemiş' : 'Not specified';
  
  const translations: Record<string, { tr: string; en: string }> = {
    'online': { tr: 'Online başvuru', en: 'Online application' },
    'embassy': { tr: 'Konsolosluk başvurusu', en: 'Embassy/Consulate application' },
    'on-arrival': { tr: 'Varışta başvuru', en: 'On arrival' },
    'not-required': { tr: 'Başvuru gerekmez', en: 'Not required' },
  };
  
  return translations[method]?.[locale] || method;
}

// İşlem süresi tooltip'i
function getProcessTimeTooltip(visaStatus: string, applicationMethod: string | null, locale: 'tr' | 'en'): string | null {
  if (visaStatus === 'visa-required' && applicationMethod === 'embassy') {
    return locale === 'tr' 
      ? 'Bu süre konsolosluk randevusu sonrası başvurunuzun değerlendirilme süresidir. Randevu alma süresi dahil değildir.'
      : 'This is the processing time after your consulate appointment. Appointment scheduling time is not included.';
  }
  
  if (visaStatus === 'eta' || applicationMethod === 'online') {
    return locale === 'tr'
      ? 'Online başvuru sonrası onay süresidir.'
      : 'Processing time after online application.';
  }
  
  if (visaStatus === 'visa-on-arrival' || applicationMethod === 'on-arrival') {
    return locale === 'tr'
      ? 'Havalimanında vize işleminiz tamamlanır.'
      : 'Visa is processed at the airport.';
  }
  
  if (visaStatus === 'visa-free' || applicationMethod === 'not-required') {
    return locale === 'tr'
      ? 'Vize işlemi gerekmez.'
      : 'No visa processing required.';
  }
  
  return null;
}

const VISA_STATUS_CONFIG = {
  'visa-free': {
    icon: CheckCircle,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    label: '✅ Vizesiz Giriş',
    description: 'Türkiye vatandaşları vize almadan seyahat edebilir'
  },
  'visa-on-arrival': {
    icon: Clock,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    label: '🛬 Varışta Vize',
    description: 'Vize havaalanında/sınırda alınabilir'
  },
  'eta': {
    icon: Globe,
    color: 'text-cyan-600',
    bgColor: 'bg-cyan-50',
    borderColor: 'border-cyan-200',
    label: '📧 Elektronik Seyahat İzni (eTA)',
    description: 'Online başvuru gereklidir'
  },
  'visa-required': {
    icon: XCircle,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    label: '🏛️ Vize Gerekli',
    description: 'Önceden vize başvurusu yapılmalıdır'
  },
};

export function VisaRequirementsSection({ countryCode, countryName, locale = 'tr' }: VisaRequirementsSectionProps) {
  const [visaData, setVisaData] = useState<VisaRequirement | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!countryCode) {
      setLoading(false);
      return;
    }

    fetch(`/api/admin/visa-requirements/fetch-passportindex`)
      .then(res => res.json())
      .then(data => {
        const visa = data.data?.find((v: any) => v.countryCode === countryCode);
        if (visa) {
          setVisaData({
            country_code: visa.countryCode,
            country_name: visa.countryName,
            visa_status: visa.visaStatus,
            allowed_stay: visa.allowedStay,
            conditions: visa.conditions,
            visa_cost: visa.visaCost,
            processing_time: visa.processingTime,
            application_method: visa.applicationMethod,
          });
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load visa requirements:', err);
        setError('Vize bilgileri yüklenemedi');
        setLoading(false);
      });
  }, [countryCode]);

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-slate-200 rounded w-1/3"></div>
          <div className="h-4 bg-slate-200 rounded w-2/3"></div>
          <div className="h-4 bg-slate-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (error || !visaData) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-yellow-900 mb-1">
              Vize Bilgisi Bulunamadı
            </h3>
            <p className="text-sm text-yellow-700">
              {countryName} için güncel vize gereklilikleri bilgisi sistemde bulunmamaktadır. 
              Detaylı bilgi için lütfen danışmanlarımızla iletişime geçin.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const config = VISA_STATUS_CONFIG[visaData.visa_status as keyof typeof VISA_STATUS_CONFIG];
  const Icon = config?.icon || FileText;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className={`${config?.bgColor} ${config?.borderColor} border-b p-6`}>
        <div className="flex items-start gap-4">
          <div className={`${config?.bgColor} p-3 rounded-lg`}>
            <Icon className={`h-8 w-8 ${config?.color}`} />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">
              Vize Gereklilikleri
            </h2>
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white border-2 ${config?.borderColor}`}>
              <span className={`text-lg font-bold ${config?.color}`}>
                {config?.label}
              </span>
            </div>
            <p className="text-sm text-slate-600 mt-2">
              {config?.description}
            </p>
          </div>
        </div>
      </div>

      {/* Details */}
      <div className="p-6 space-y-6">
        {/* Kalış Süresi */}
        {visaData.allowed_stay && (
          <div className="flex items-start gap-3">
            <Clock className="h-5 w-5 text-slate-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-slate-900 mb-1">
                {locale === 'tr' ? 'Kalış Süresi' : 'Allowed Stay'}
              </h3>
              <p className="text-slate-700">{formatAllowedStay(visaData.allowed_stay, locale)}</p>
            </div>
          </div>
        )}

        {/* Koşullar */}
        {visaData.conditions && (
          <div className="flex items-start gap-3">
            <FileText className="h-5 w-5 text-slate-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-slate-900 mb-1">Koşullar</h3>
              <p className="text-slate-700">{visaData.conditions}</p>
            </div>
          </div>
        )}

        {/* Vize Ücreti */}
        {visaData.visa_cost && (
          <div className="flex items-start gap-3">
            <DollarSign className="h-5 w-5 text-slate-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-slate-900 mb-1">Vize Ücreti</h3>
              <p className="text-slate-700">{visaData.visa_cost}</p>
              <p className="text-xs text-slate-500 mt-1">
                * Danışmanlık hizmet bedelleri hariçtir
              </p>
            </div>
          </div>
        )}

        {/* İşlem Süresi */}
        {visaData.processing_time && (
          <div className="flex items-start gap-3">
            <Clock className="h-5 w-5 text-slate-400 flex-shrink-0 mt-0.5" />
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-slate-900">
                  {locale === 'tr' ? 'İşlem Süresi' : 'Processing Time'}
                </h3>
                {getProcessTimeTooltip(visaData.visa_status, visaData.application_method, locale) && (
                  <div className="group relative">
                    <Info className="h-4 w-4 text-slate-400 cursor-help hover:text-primary transition-colors" />
                    <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-3 py-2 bg-slate-800 text-white text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 w-64 z-50 shadow-lg">
                      {getProcessTimeTooltip(visaData.visa_status, visaData.application_method, locale)}
                      <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-slate-800"></div>
                    </div>
                  </div>
                )}
              </div>
              <p className="text-slate-700">{visaData.processing_time}</p>
            </div>
          </div>
        )}

        {/* Başvuru Yöntemi */}
        {visaData.application_method && (
          <div className="flex items-start gap-3">
            <Globe className="h-5 w-5 text-slate-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-slate-900 mb-1">
                {locale === 'tr' ? 'Başvuru Yöntemi' : 'Application Method'}
              </h3>
              <p className="text-slate-700">
                {formatApplicationMethod(visaData.application_method, locale)}
              </p>
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="mt-8 p-4 bg-gradient-to-r from-primary/10 to-blue-50 rounded-lg border border-primary/20">
          <h3 className="font-semibold text-slate-900 mb-2">
            🎯 Kolay Seyahat ile Vize Başvurunuz
          </h3>
          <p className="text-sm text-slate-700 mb-4">
            Uzman danışmanlarımız vize başvuru sürecinizde size yardımcı olur. 
            Tüm evrak hazırlığı, randevu alma ve takip işlemlerini biz hallederiz.
          </p>
          <a
            href="/iletisim"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium"
          >
            Hemen Başvur
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </a>
        </div>

        {/* Disclaimer */}
        <div className="mt-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
          <p className="text-xs text-slate-600">
            <strong>Not:</strong> Vize gereklilikleri değişebilir. Güncel bilgi için lütfen ilgili ülkenin 
            resmi konsolosluk web sitesini kontrol edin veya danışmanlarımızla iletişime geçin. 
            Bu bilgiler PassportIndex kaynaklıdır ve referans amaçlıdır.
          </p>
        </div>
      </div>
    </div>
  );
}
