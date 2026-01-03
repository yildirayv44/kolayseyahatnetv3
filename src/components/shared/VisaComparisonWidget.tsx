"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, CheckCircle, Clock, Globe, XCircle, ArrowRight, TrendingUp, Users } from "lucide-react";

interface Country {
  id: number;
  name: string;
  slug: string;
  visa_labels?: string[];
  price: number | null;
  currency_id?: number;
  visa_required: boolean;
}

interface VisaComparisonWidgetProps {
  countries: Country[];
  locale?: 'tr' | 'en';
  currentCountry?: string;
}

export function VisaComparisonWidget({ countries, locale = 'tr', currentCountry }: VisaComparisonWidgetProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);

  const filteredCountries = countries.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  ).slice(0, 5);

  const handleCountrySelect = (country: Country) => {
    setSelectedCountry(country);
    setSearchQuery(country.name);
    setShowDropdown(false);
  };

  const getCurrencySymbol = (currencyId: number = 1) => {
    switch (currencyId) {
      case 2: return '$';
      case 3: return '€';
      default: return '₺';
    }
  };

  const getVisaStatusInfo = (country: Country) => {
    if (!country.visa_labels || country.visa_labels.length === 0) {
      return {
        label: locale === 'en' ? 'Visa Required' : 'Vize Gerekli',
        icon: XCircle,
        bgColor: 'bg-orange-50',
        textColor: 'text-orange-700',
        borderColor: 'border-orange-200',
      };
    }

    const primaryLabel = country.visa_labels[0];
    
    if (primaryLabel === "Vizesiz") {
      return {
        label: locale === 'en' ? 'Visa Free' : 'Vizesiz',
        icon: CheckCircle,
        bgColor: 'bg-green-50',
        textColor: 'text-green-700',
        borderColor: 'border-green-200',
      };
    } else if (primaryLabel === "Varışta Vize") {
      return {
        label: locale === 'en' ? 'Visa on Arrival' : 'Varışta Vize',
        icon: Clock,
        bgColor: 'bg-blue-50',
        textColor: 'text-blue-700',
        borderColor: 'border-blue-200',
      };
    } else if (primaryLabel === "E-vize") {
      return {
        label: locale === 'en' ? 'E-Visa' : 'E-vize',
        icon: Globe,
        bgColor: 'bg-purple-50',
        textColor: 'text-purple-700',
        borderColor: 'border-purple-200',
      };
    }

    return {
      label: locale === 'en' ? 'Visa Required' : 'Vize Gerekli',
      icon: XCircle,
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-700',
      borderColor: 'border-orange-200',
    };
  };

  const stats = {
    visaFree: countries.filter(c => c.visa_labels?.includes("Vizesiz")).length,
    visaRequired: countries.filter(c => c.visa_labels?.includes("Vize Gerekli")).length,
    eVisa: countries.filter(c => c.visa_labels?.includes("E-vize")).length,
    onArrival: countries.filter(c => c.visa_labels?.includes("Varışta Vize")).length,
    total: countries.length,
  };

  const visaFreePercentage = stats.total > 0 ? Math.round((stats.visaFree / stats.total) * 100) : 0;

  return (
    <div className="rounded-2xl border-2 border-slate-200 bg-gradient-to-br from-white to-slate-50 p-6 shadow-lg">
      {/* Header */}
      <div className="mb-6">
        <div className="mb-2 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-bold text-slate-900">
            {locale === 'en' ? 'Turkish Passport Visa Statistics' : 'Türkiye Pasaportu Vize İstatistikleri'}
          </h3>
        </div>
        <p className="text-sm text-slate-600">
          {locale === 'en' 
            ? `Visa status information for ${stats.total} countries`
            : `${stats.total} ülke için vize durumu bilgisi`}
        </p>
      </div>

      {/* Quick Stats */}
      <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        <div className="rounded-xl bg-green-50 p-3 text-center">
          <div className="flex items-center justify-center gap-1 text-2xl font-bold text-green-700">
            <CheckCircle className="h-5 w-5" />
            {stats.visaFree}
          </div>
          <div className="mt-1 text-xs text-green-600">
            {locale === 'en' ? 'Visa Free' : 'Vizesiz Giriş'}
          </div>
        </div>

        <div className="rounded-xl bg-blue-50 p-3 text-center">
          <div className="flex items-center justify-center gap-1 text-2xl font-bold text-blue-700">
            <Clock className="h-5 w-5" />
            {stats.onArrival}
          </div>
          <div className="mt-1 text-xs text-blue-600">
            {locale === 'en' ? 'On Arrival' : 'Varışta Vize'}
          </div>
        </div>

        <div className="rounded-xl bg-purple-50 p-3 text-center">
          <div className="flex items-center justify-center gap-1 text-2xl font-bold text-purple-700">
            <Globe className="h-5 w-5" />
            {stats.eVisa}
          </div>
          <div className="mt-1 text-xs text-purple-600">
            {locale === 'en' ? 'E-Visa' : 'E-vize'}
          </div>
        </div>

        <div className="rounded-xl bg-orange-50 p-3 text-center">
          <div className="flex items-center justify-center gap-1 text-2xl font-bold text-orange-700">
            <XCircle className="h-5 w-5" />
            {stats.visaRequired}
          </div>
          <div className="mt-1 text-xs text-orange-600">
            {locale === 'en' ? 'Visa Required' : 'Vize Gerekli'}
          </div>
        </div>
      </div>

      {/* Percentage Bar */}
      <div className="mb-6">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="font-semibold text-slate-700">
            {locale === 'en' ? 'Easy Travel' : 'Kolay Seyahat'}
          </span>
          <span className="font-bold text-green-600">{visaFreePercentage}%</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-slate-200">
          <div 
            className="h-full bg-gradient-to-r from-green-500 to-green-600 transition-all duration-500"
            style={{ width: `${visaFreePercentage}%` }}
          />
        </div>
        <p className="mt-1 text-xs text-slate-500">
          {locale === 'en'
            ? `You can travel to ${stats.visaFree + stats.onArrival} countries without prior visa`
            : `${stats.visaFree + stats.onArrival} ülkeye önceden vize almadan seyahat edebilirsiniz`}
        </p>
      </div>

      {/* Country Search */}
      <div className="mb-4">
        <label className="mb-2 block text-sm font-semibold text-slate-700">
          {locale === 'en' ? 'Check Visa Status' : 'Vize Durumunu Kontrol Et'}
        </label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder={locale === 'en' ? 'Search country...' : 'Ülke ara...'}
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowDropdown(true);
            }}
            onFocus={() => setShowDropdown(true)}
            onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
            className="w-full rounded-lg border-2 border-slate-200 bg-white py-2 pl-10 pr-4 text-sm transition-colors focus:border-primary focus:outline-none"
          />
          
          {/* Dropdown */}
          {showDropdown && searchQuery && filteredCountries.length > 0 && (
            <div className="absolute z-10 mt-2 w-full rounded-lg border-2 border-slate-200 bg-white shadow-xl">
              {filteredCountries.map((country) => (
                <button
                  key={country.id}
                  onClick={() => handleCountrySelect(country)}
                  className="flex w-full items-center justify-between border-b border-slate-100 px-4 py-3 text-left transition-colors hover:bg-slate-50 last:border-b-0"
                >
                  <span className="font-medium text-slate-900">{country.name}</span>
                  {country.visa_labels && country.visa_labels.length > 0 && (
                    <span className={`rounded-full px-2 py-1 text-xs font-semibold ${
                      country.visa_labels[0] === "Vizesiz" ? 'bg-green-100 text-green-700' :
                      country.visa_labels[0] === "E-vize" ? 'bg-purple-100 text-purple-700' :
                      country.visa_labels[0] === "Varışta Vize" ? 'bg-blue-100 text-blue-700' :
                      'bg-orange-100 text-orange-700'
                    }`}>
                      {country.visa_labels[0]}
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Selected Country Info */}
      {selectedCountry && (
        <div className={`mb-4 rounded-xl border-2 p-4 ${getVisaStatusInfo(selectedCountry).borderColor} ${getVisaStatusInfo(selectedCountry).bgColor}`}>
          <div className="mb-3 flex items-start justify-between">
            <div>
              <h4 className="text-lg font-bold text-slate-900">{selectedCountry.name}</h4>
              <div className="mt-1 flex items-center gap-2">
                {(() => {
                  const Icon = getVisaStatusInfo(selectedCountry).icon;
                  return <Icon className={`h-4 w-4 ${getVisaStatusInfo(selectedCountry).textColor}`} />;
                })()}
                <span className={`text-sm font-semibold ${getVisaStatusInfo(selectedCountry).textColor}`}>
                  {getVisaStatusInfo(selectedCountry).label}
                </span>
              </div>
            </div>
            {selectedCountry.price && (
              <div className="text-right">
                <div className="text-2xl font-bold text-slate-900">
                  {getCurrencySymbol(selectedCountry.currency_id)}{selectedCountry.price}
                </div>
                <div className="text-xs text-slate-600">
                  {locale === 'en' ? 'Starting from' : 'Başlangıç'}
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <Link
              href={`/${selectedCountry.slug}`}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition-all hover:bg-slate-50"
            >
              {locale === 'en' ? 'Details' : 'Detaylar'}
            </Link>
            <Link
              href="/vize-basvuru-formu"
              className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-primary/90"
            >
              {locale === 'en' ? 'Apply' : 'Başvur'}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      )}

      {/* Popular Visa-Free Destinations */}
      {stats.visaFree > 0 && (
        <div className="mb-4">
          <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700">
            <Users className="h-4 w-4 text-primary" />
            {locale === 'en' ? 'Popular Visa-Free Destinations' : 'Popüler Vizesiz Destinasyonlar'}
          </h4>
          <div className="flex flex-wrap gap-2">
            {countries
              .filter(c => c.visa_labels?.includes("Vizesiz"))
              .slice(0, 5)
              .map((country) => (
                <Link
                  key={country.id}
                  href={`/${country.slug}`}
                  className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700 transition-all hover:bg-green-200"
                >
                  {country.name}
                </Link>
              ))}
          </div>
        </div>
      )}

      {/* CTA to All Countries */}
      <Link
        href="/ulkeler"
        className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-primary bg-primary/5 px-4 py-3 text-sm font-bold text-primary transition-all hover:bg-primary hover:text-white"
      >
        {locale === 'en' ? 'View All Countries' : 'Tüm Ülkeleri Görüntüle'}
        <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}
