"use client";

import { useState, useEffect } from "react";
import { Globe, ArrowRight, CheckCircle, XCircle, Clock, DollarSign, FileText, Package } from "lucide-react";
import { ApplicationFormLink } from "@/components/shared/ApplicationFormLink";

interface SourceCountry {
  id: number;
  name: string;
  country_code: string;
  flag_emoji: string;
  passport_rank: number | null;
}

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

interface VisaCheckerClientProps {
  locale: string;
}

export function VisaCheckerClient({ locale }: VisaCheckerClientProps) {
  const isEnglish = locale === 'en';
  
  const [sourceCountries, setSourceCountries] = useState<SourceCountry[]>([]);
  const [destinationCountries, setDestinationCountries] = useState<any[]>([]);
  const [selectedSource, setSelectedSource] = useState<string>('TUR');
  const [selectedDestination, setSelectedDestination] = useState<string>('');
  const [result, setResult] = useState<VisaCheckResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  // Fetch source countries on mount
  useEffect(() => {
    fetchSourceCountries();
  }, []);

  // Fetch destination countries when source changes
  useEffect(() => {
    if (selectedSource) {
      fetchDestinationCountries(selectedSource);
    }
  }, [selectedSource]);

  const fetchSourceCountries = async () => {
    try {
      const response = await fetch('/api/mobile/v2/source-countries');
      const data = await response.json();
      if (data.success) {
        setSourceCountries(data.data);
      }
    } catch (err) {
      console.error('Error fetching source countries:', err);
    }
  };

  const fetchDestinationCountries = async (sourceCode: string) => {
    try {
      const response = await fetch(`/api/mobile/v2/countries?source=${sourceCode}`);
      const data = await response.json();
      if (data.success) {
        setDestinationCountries(data.data);
      }
    } catch (err) {
      console.error('Error fetching destination countries:', err);
    }
  };

  const handleCheck = async () => {
    if (!selectedSource || !selectedDestination) {
      setError(isEnglish ? 'Please select both countries' : 'Lütfen her iki ülkeyi de seçin');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch(`/api/mobile/v2/visa-check?source=${selectedSource}&destination=${selectedDestination}`);
      const data = await response.json();
      
      if (data.success) {
        setResult(data.data);
      } else {
        setError(data.error || (isEnglish ? 'Failed to check visa requirements' : 'Vize gereklilikleri kontrol edilemedi'));
      }
    } catch (err) {
      console.error('Error checking visa:', err);
      setError(isEnglish ? 'An error occurred' : 'Bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

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
    <div className="space-y-6">
      {/* Selection Form */}
      <div className="card">
        <div className="grid gap-6 md:grid-cols-2">
          {/* Source Country */}
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2">
              {isEnglish ? 'Your Passport Country' : 'Pasaport Ülkeniz'}
            </label>
            <select
              value={selectedSource}
              onChange={(e) => {
                setSelectedSource(e.target.value);
                setSelectedDestination('');
                setResult(null);
              }}
              className="w-full rounded-lg border border-slate-300 px-4 py-3 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              {sourceCountries.map((country) => (
                <option key={country.country_code} value={country.country_code}>
                  {country.flag_emoji} {country.name}
                </option>
              ))}
            </select>
          </div>

          {/* Destination Country */}
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2">
              {isEnglish ? 'Destination Country' : 'Hedef Ülke'}
            </label>
            <select
              value={selectedDestination}
              onChange={(e) => {
                setSelectedDestination(e.target.value);
                setResult(null);
              }}
              className="w-full rounded-lg border border-slate-300 px-4 py-3 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              disabled={!selectedSource || destinationCountries.length === 0}
            >
              <option value="">
                {isEnglish ? 'Select destination...' : 'Hedef ülke seçin...'}
              </option>
              {destinationCountries.map((country) => (
                <option key={country.country_code} value={country.country_code}>
                  {country.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          onClick={handleCheck}
          disabled={loading || !selectedSource || !selectedDestination}
          className="mt-6 w-full btn-primary inline-flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {loading ? (
            <>
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              {isEnglish ? 'Checking...' : 'Kontrol ediliyor...'}
            </>
          ) : (
            <>
              <Globe className="h-5 w-5" />
              {isEnglish ? 'Check Visa Requirements' : 'Vize Gerekliliklerini Kontrol Et'}
            </>
          )}
        </button>

        {error && (
          <div className="mt-4 rounded-lg bg-red-50 p-4 text-sm text-red-800">
            {error}
          </div>
        )}
      </div>

      {/* Result */}
      {result && (
        <div className="space-y-6">
          {/* Visa Status Card */}
          <div className="card border-2">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="text-4xl">{result.source.flag_emoji}</span>
                <ArrowRight className="h-6 w-6 text-slate-400" />
                <span className="text-4xl">{result.destination.flag_emoji}</span>
              </div>
              <span className={`inline-flex rounded-full border px-4 py-2 text-sm font-semibold ${getVisaStatusColor(result.visa_status)}`}>
                {getVisaStatusLabel(result.visa_status)}
              </span>
            </div>

            <h3 className="text-xl font-bold text-slate-900 mb-4">
              {result.source.name} → {result.destination.name}
            </h3>

            <div className="grid gap-4 md:grid-cols-2">
              {result.allowed_stay && (
                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-slate-400 mt-0.5" />
                  <div>
                    <div className="text-sm font-medium text-slate-900">
                      {isEnglish ? 'Allowed Stay' : 'Kalış Süresi'}
                    </div>
                    <div className="text-sm text-slate-600">{result.allowed_stay}</div>
                  </div>
                </div>
              )}

              {result.visa_cost && (
                <div className="flex items-start gap-3">
                  <DollarSign className="h-5 w-5 text-slate-400 mt-0.5" />
                  <div>
                    <div className="text-sm font-medium text-slate-900">
                      {isEnglish ? 'Visa Cost' : 'Vize Ücreti'}
                    </div>
                    <div className="text-sm text-slate-600">{result.visa_cost}</div>
                  </div>
                </div>
              )}

              {result.processing_time && (
                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-slate-400 mt-0.5" />
                  <div>
                    <div className="text-sm font-medium text-slate-900">
                      {isEnglish ? 'Processing Time' : 'İşlem Süresi'}
                    </div>
                    <div className="text-sm text-slate-600">{result.processing_time}</div>
                  </div>
                </div>
              )}

              {result.application_method && (
                <div className="flex items-start gap-3">
                  <FileText className="h-5 w-5 text-slate-400 mt-0.5" />
                  <div>
                    <div className="text-sm font-medium text-slate-900">
                      {isEnglish ? 'Application Method' : 'Başvuru Yöntemi'}
                    </div>
                    <div className="text-sm text-slate-600 capitalize">{result.application_method}</div>
                  </div>
                </div>
              )}
            </div>

            {result.conditions && (
              <div className="mt-4 pt-4 border-t border-slate-200">
                <div className="text-sm font-medium text-slate-900 mb-2">
                  {isEnglish ? 'Conditions' : 'Koşullar'}
                </div>
                <div className="text-sm text-slate-600">{result.conditions}</div>
              </div>
            )}
          </div>

          {/* Packages */}
          {result.has_packages ? (
            <div className="card">
              <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <Package className="h-5 w-5 text-primary" />
                {isEnglish ? 'Available Consultation Packages' : 'Mevcut Danışmanlık Paketleri'}
              </h3>
              <div className="grid gap-4 md:grid-cols-2">
                {result.packages.map((pkg) => (
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
            <div className="card bg-slate-50">
              <p className="text-sm text-slate-600 text-center">
                {isEnglish
                  ? 'Consultation packages are not currently available for this country combination. You can still apply for a visa through official channels.'
                  : 'Bu ülke kombinasyonu için şu anda danışmanlık paketi bulunmamaktadır. Vize başvurunuzu resmi kanallardan yapabilirsiniz.'}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
