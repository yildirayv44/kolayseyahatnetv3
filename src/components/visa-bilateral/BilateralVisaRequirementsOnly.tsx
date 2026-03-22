"use client";

import { useState, useEffect } from 'react';
import { Breadcrumb } from '@/components/shared/Breadcrumb';
import { CheckCircle2, XCircle, AlertCircle, ArrowRight } from 'lucide-react';

interface BilateralVisaRequirementsOnlyProps {
  sourceCountryCode: string;
  destinationCountryCode: string;
  sourceCountryName: string;
  destinationCountryName: string;
  locale: 'tr' | 'en';
}

export function BilateralVisaRequirementsOnly({
  sourceCountryCode,
  destinationCountryCode,
  sourceCountryName,
  destinationCountryName,
  locale
}: BilateralVisaRequirementsOnlyProps) {
  const [visaRequirement, setVisaRequirement] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const isEnglish = locale === 'en';

  useEffect(() => {
    fetch(`/api/admin/visa-requirements/check?source=${sourceCountryCode}&destination=${destinationCountryCode}`)
      .then(res => res.json())
      .then(data => {
        setVisaRequirement(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Visa requirement fetch error:', err);
        setLoading(false);
      });
  }, [sourceCountryCode, destinationCountryCode]);

  const breadcrumbItems = [
    { label: isEnglish ? 'Home' : 'Anasayfa', href: '/' },
    { label: isEnglish ? 'Countries' : 'Ülkeler', href: '/ulkeler' },
    { label: `${sourceCountryName} → ${destinationCountryName}` }
  ];

  const getVisaStatusIcon = (status: string) => {
    if (status?.includes('visa-free') || status?.includes('vizesiz')) {
      return <CheckCircle2 className="h-8 w-8 text-green-600" />;
    } else if (status?.includes('visa-required') || status?.includes('vize-gerekli')) {
      return <XCircle className="h-8 w-8 text-red-600" />;
    } else {
      return <AlertCircle className="h-8 w-8 text-yellow-600" />;
    }
  };

  const getVisaStatusText = (status: string) => {
    if (status?.includes('visa-free') || status?.includes('vizesiz')) {
      return isEnglish ? 'Visa-Free Entry' : 'Vizesiz Giriş';
    } else if (status?.includes('visa-required') || status?.includes('vize-gerekli')) {
      return isEnglish ? 'Visa Required' : 'Vize Gerekli';
    } else if (status?.includes('evisa') || status?.includes('e-vize')) {
      return isEnglish ? 'E-Visa Available' : 'E-Vize Mevcut';
    } else {
      return status || (isEnglish ? 'Unknown' : 'Bilinmiyor');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Breadcrumb items={breadcrumbItems} />

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary to-blue-600 py-16 text-white">
        <div className="mx-auto max-w-4xl px-4">
          <h1 className="mb-4 text-4xl font-bold">
            {sourceCountryName} → {destinationCountryName} {isEnglish ? 'Visa' : 'Vizesi'}
          </h1>
          <p className="text-lg opacity-90">
            {isEnglish 
              ? `Visa requirements for ${sourceCountryName} citizens traveling to ${destinationCountryName}`
              : `${sourceCountryName} vatandaşları için ${destinationCountryName} vize gereklilikleri`}
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-8">
        {loading ? (
          <div className="rounded-lg bg-white p-8 text-center shadow-md">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            <p className="mt-4 text-slate-600">
              {isEnglish ? 'Loading visa requirements...' : 'Vize gereklilikleri yükleniyor...'}
            </p>
          </div>
        ) : visaRequirement?.found ? (
          <>
            {/* Visa Status Card */}
            <div className="mb-8 rounded-lg bg-white p-8 shadow-md">
              <div className="mb-6 flex items-center gap-4">
                {getVisaStatusIcon(visaRequirement.visa_status)}
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">
                    {getVisaStatusText(visaRequirement.visa_status)}
                  </h2>
                  <p className="text-slate-600">
                    {isEnglish ? 'Current visa requirement status' : 'Güncel vize gereklilik durumu'}
                  </p>
                </div>
              </div>

              {/* Visa Details Grid */}
              <div className="grid gap-4 md:grid-cols-2">
                {visaRequirement.allowed_stay && (
                  <div className="rounded-lg border border-slate-200 p-4">
                    <div className="mb-1 text-sm font-semibold text-slate-600">
                      {isEnglish ? 'Allowed Stay' : 'İzin Verilen Kalış Süresi'}
                    </div>
                    <div className="text-lg font-bold text-slate-900">
                      {visaRequirement.allowed_stay}
                    </div>
                  </div>
                )}

                {visaRequirement.processing_time && (
                  <div className="rounded-lg border border-slate-200 p-4">
                    <div className="mb-1 text-sm font-semibold text-slate-600">
                      {isEnglish ? 'Processing Time' : 'İşlem Süresi'}
                    </div>
                    <div className="text-lg font-bold text-slate-900">
                      {visaRequirement.processing_time}
                    </div>
                  </div>
                )}

                {visaRequirement.visa_cost && (
                  <div className="rounded-lg border border-slate-200 p-4">
                    <div className="mb-1 text-sm font-semibold text-slate-600">
                      {isEnglish ? 'Visa Cost' : 'Vize Ücreti'}
                    </div>
                    <div className="text-lg font-bold text-slate-900">
                      {visaRequirement.visa_cost}
                    </div>
                  </div>
                )}

                {visaRequirement.application_method && (
                  <div className="rounded-lg border border-slate-200 p-4">
                    <div className="mb-1 text-sm font-semibold text-slate-600">
                      {isEnglish ? 'Application Method' : 'Başvuru Yöntemi'}
                    </div>
                    <div className="text-lg font-bold text-slate-900">
                      {visaRequirement.application_method}
                    </div>
                  </div>
                )}
              </div>

              {visaRequirement.conditions && (
                <div className="mt-6 rounded-lg bg-blue-50 p-4">
                  <div className="mb-2 font-semibold text-blue-900">
                    {isEnglish ? 'Conditions & Notes' : 'Koşullar ve Notlar'}
                  </div>
                  <p className="text-sm text-blue-800">{visaRequirement.conditions}</p>
                </div>
              )}
            </div>

            {/* CTA Section */}
            <div className="rounded-lg bg-gradient-to-r from-primary to-blue-600 p-8 text-white shadow-md">
              <h2 className="mb-4 text-2xl font-bold">
                {isEnglish ? 'Need Help with Your Visa Application?' : 'Vize Başvurunuzda Yardıma mı İhtiyacınız Var?'}
              </h2>
              <p className="mb-6 text-lg opacity-90">
                {isEnglish
                  ? 'Our expert team is ready to assist you with your visa application process.'
                  : 'Uzman ekibimiz vize başvuru sürecinizde size yardımcı olmaya hazır.'}
              </p>
              <div className="flex flex-col gap-4 sm:flex-row">
                <a
                  href="tel:02129099971"
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-8 py-3 font-semibold text-primary transition-colors hover:bg-blue-50"
                >
                  📞 0212 909 99 71 {isEnglish ? 'Call' : 'Ara'}
                </a>
                <a
                  href={`${isEnglish ? '/en' : ''}/vize-basvuru-formu-std?from=${sourceCountryCode}&to=${destinationCountryCode}`}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-8 py-3 font-semibold text-primary transition-colors hover:bg-blue-50"
                >
                  {isEnglish ? 'Apply Online' : 'Online Başvuru Yap'}
                  <ArrowRight className="h-5 w-5" />
                </a>
              </div>
            </div>
          </>
        ) : (
          <div className="rounded-lg bg-white p-8 text-center shadow-md">
            <AlertCircle className="mx-auto mb-4 h-16 w-16 text-yellow-600" />
            <h2 className="mb-4 text-2xl font-bold text-slate-900">
              {isEnglish ? 'Visa Information Not Available' : 'Vize Bilgisi Mevcut Değil'}
            </h2>
            <p className="mb-6 text-slate-600">
              {isEnglish
                ? `We don't have detailed visa information for ${sourceCountryName} citizens traveling to ${destinationCountryName} yet.`
                : `${sourceCountryName} vatandaşları için ${destinationCountryName} vize bilgisi henüz mevcut değil.`}
            </p>
            <a
              href={`${isEnglish ? '/en' : ''}/vize-basvuru-formu-std?from=${sourceCountryCode}&to=${destinationCountryCode}`}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-8 py-3 font-semibold text-white transition-colors hover:bg-primary/90"
            >
              {isEnglish ? 'Contact Us for Information' : 'Bilgi İçin Bize Ulaşın'}
              <ArrowRight className="h-5 w-5" />
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
