"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, CheckCircle, Clock, Globe, XCircle, ArrowRight, ChevronDown, ChevronUp } from "lucide-react";

interface Country {
  id: number;
  name: string;
  slug: string;
  visa_labels?: string[];
  price: number | null;
  currency_id?: number;
  visa_required: boolean;
}

interface CompactVisaWidgetProps {
  countries: Country[];
  locale?: 'tr' | 'en';
  currentCountry?: string;
}

export function CompactVisaWidget({ countries, locale = 'tr', currentCountry }: CompactVisaWidgetProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);

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
    <div className="rounded-xl border-2 border-slate-200 bg-white shadow-lg lg:sticky lg:top-24">
      {/* Header - Collapsible */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex w-full items-center justify-between p-4 transition-colors hover:bg-slate-50"
      >
        <div className="text-left">
          <h3 className="text-sm font-bold text-slate-900">
            {locale === 'en' ? 'Visa Check' : 'Vize Kontrolü'}
          </h3>
          <p className="text-xs text-slate-600">
            {stats.total} {locale === 'en' ? 'countries' : 'ülke'}
          </p>
        </div>
        {isExpanded ? (
          <ChevronUp className="h-4 w-4 text-slate-400" />
        ) : (
          <ChevronDown className="h-4 w-4 text-slate-400" />
        )}
      </button>

      {/* Content */}
      {isExpanded && (
        <div className="border-t border-slate-200 p-4 space-y-4">
          {/* Mini Stats */}
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg bg-green-50 p-2 text-center">
              <div className="text-lg font-bold text-green-700">{stats.visaFree}</div>
              <div className="text-xs text-green-600">
                {locale === 'en' ? 'Visa Free' : 'Vizesiz'}
              </div>
            </div>
            <div className="rounded-lg bg-orange-50 p-2 text-center">
              <div className="text-lg font-bold text-orange-700">{stats.visaRequired}</div>
              <div className="text-xs text-orange-600">
                {locale === 'en' ? 'Visa Req.' : 'Vize Gerekli'}
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div>
            <div className="mb-1 flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-700">
                {locale === 'en' ? 'Easy Travel' : 'Kolay Seyahat'}
              </span>
              <span className="font-bold text-green-600">{visaFreePercentage}%</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-slate-200">
              <div 
                className="h-full bg-gradient-to-r from-green-500 to-green-600 transition-all duration-500"
                style={{ width: `${visaFreePercentage}%` }}
              />
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-2 top-1/2 h-3 w-3 -translate-y-1/2 text-slate-400" />
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
              className="w-full rounded-lg border border-slate-200 bg-white py-1.5 pl-7 pr-2 text-xs transition-colors focus:border-primary focus:outline-none"
            />
            
            {/* Dropdown */}
            {showDropdown && searchQuery && filteredCountries.length > 0 && (
              <div className="absolute z-10 mt-1 w-full rounded-lg border border-slate-200 bg-white shadow-xl max-h-48 overflow-y-auto">
                {filteredCountries.map((country) => (
                  <button
                    key={country.id}
                    onClick={() => handleCountrySelect(country)}
                    className="flex w-full items-center justify-between border-b border-slate-100 px-3 py-2 text-left transition-colors hover:bg-slate-50 last:border-b-0"
                  >
                    <span className="text-xs font-medium text-slate-900">{country.name}</span>
                    {country.visa_labels && country.visa_labels.length > 0 && (
                      <span className={`rounded-full px-1.5 py-0.5 text-xs font-semibold ${
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

          {/* Selected Country */}
          {selectedCountry && (
            <div className={`rounded-lg border p-3 ${getVisaStatusInfo(selectedCountry).borderColor} ${getVisaStatusInfo(selectedCountry).bgColor}`}>
              <div className="mb-2 flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-slate-900">{selectedCountry.name}</h4>
                  <div className="mt-1 flex items-center gap-1">
                    {(() => {
                      const Icon = getVisaStatusInfo(selectedCountry).icon;
                      return <Icon className={`h-3 w-3 ${getVisaStatusInfo(selectedCountry).textColor}`} />;
                    })()}
                    <span className={`text-xs font-semibold ${getVisaStatusInfo(selectedCountry).textColor}`}>
                      {getVisaStatusInfo(selectedCountry).label}
                    </span>
                  </div>
                </div>
                {selectedCountry.price && (
                  <div className="text-right">
                    <div className="text-lg font-bold text-slate-900">
                      {getCurrencySymbol(selectedCountry.currency_id)}{selectedCountry.price}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <Link
                  href={`/${selectedCountry.slug}`}
                  className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition-all hover:bg-slate-50"
                >
                  {locale === 'en' ? 'Details' : 'Detay'}
                </Link>
                <Link
                  href="/vize-basvuru-formu"
                  className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-white transition-all hover:bg-primary/90"
                >
                  {locale === 'en' ? 'Apply' : 'Başvur'}
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </div>
          )}

          {/* CTA */}
          <Link
            href="/ulkeler"
            className="flex w-full items-center justify-center gap-1 rounded-lg border border-primary bg-primary/5 px-3 py-2 text-xs font-bold text-primary transition-all hover:bg-primary hover:text-white"
          >
            {locale === 'en' ? 'All Countries' : 'Tüm Ülkeler'}
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      )}
    </div>
  );
}
