"use client";

import { useEffect, useState } from "react";
import { CheckCircle, XCircle, Clock, DollarSign, FileText, Globe, AlertCircle } from "lucide-react";

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

export function VisaRequirementsSection({ countryCode, countryName }: VisaRequirementsSectionProps) {
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
              <h3 className="font-semibold text-slate-900 mb-1">Kalış Süresi</h3>
              <p className="text-slate-700">{visaData.allowed_stay}</p>
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
              <h3 className="font-semibold text-slate-900 mb-1">İşlem Süresi</h3>
              <p className="text-slate-700">{visaData.processing_time}</p>
            </div>
          </div>
        )}

        {/* Başvuru Yöntemi */}
        {visaData.application_method && (
          <div className="flex items-start gap-3">
            <Globe className="h-5 w-5 text-slate-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-slate-900 mb-1">Başvuru Yöntemi</h3>
              <p className="text-slate-700">
                {visaData.application_method === 'online' && 'Online başvuru'}
                {visaData.application_method === 'embassy' && 'Elçilik/Konsolosluk başvurusu'}
                {visaData.application_method === 'on-arrival' && 'Varışta başvuru'}
                {visaData.application_method === 'not-required' && 'Başvuru gerekmez'}
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
