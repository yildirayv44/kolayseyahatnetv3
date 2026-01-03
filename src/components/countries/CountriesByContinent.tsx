"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Globe2, ArrowRight, CheckCircle, Clock, XCircle } from "lucide-react";
import { getCountrySlug } from "@/lib/helpers";
import { getCountryDefaultImage } from "@/lib/image-helpers";
import { getCountriesByContinent, CONTINENTS, type Continent } from "@/lib/continent-data";

interface Country {
  id: number;
  name: string;
  title: string;
  description: string;
  slug: string;
  country_code: string | null;
  price: number | null;
  currency_id?: number;
  visa_labels?: string[];
  visa_label?: string;
}

// Para birimi sembolü helper fonksiyonu
const getCurrencySymbol = (currencyId: number = 1) => {
  switch (currencyId) {
    case 2: return '$';
    case 3: return '€';
    default: return '₺';
  }
};

interface VisaRequirement {
  countryCode: string;
  visaStatus: string;
  allowedStay: string | null;
}

interface Props {
  countries: Country[];
  visaData: Record<string, VisaRequirement>;
  locale?: 'tr' | 'en';
}

export function CountriesByContinent({ countries, visaData, locale = 'tr' }: Props) {
  const [selectedContinent, setSelectedContinent] = useState<Continent | 'all'>('all');
  
  const continentGroups = getCountriesByContinent(countries);
  const continentOrder: Continent[] = [
    CONTINENTS.EUROPE,
    CONTINENTS.ASIA,
    CONTINENTS.MIDDLE_EAST,
    CONTINENTS.NORTH_AMERICA,
    CONTINENTS.SOUTH_AMERICA,
    CONTINENTS.OCEANIA,
    CONTINENTS.AFRICA,
  ];

  const displayedCountries = selectedContinent === 'all' 
    ? countries 
    : continentGroups[selectedContinent] || [];

  // Vize durumu badge'leri - artık country'den gelen visa_labels kullanılıyor
  const getVisaStatusBadges = (country: Country) => {
    if (!country.visa_labels || country.visa_labels.length === 0) return null;

    const getLabelStyle = (label: string) => {
      if (label === "Vizesiz") {
        return { className: "bg-green-100 text-green-700 border-green-200", Icon: CheckCircle };
      } else if (label === "Varışta Vize") {
        return { className: "bg-blue-100 text-blue-700 border-blue-200", Icon: Clock };
      } else if (label === "E-vize") {
        return { className: "bg-purple-100 text-purple-700 border-purple-200", Icon: Globe2 };
      }
      return { className: "bg-orange-100 text-orange-700 border-orange-200", Icon: XCircle };
    };

    return (
      <div className="flex flex-wrap gap-1">
        {country.visa_labels.map((label, idx) => {
          const { className, Icon } = getLabelStyle(label);
          return (
            <div key={idx} className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${className}`}>
              <Icon className="h-3 w-3" />
              {label}
            </div>
          );
        })}
      </div>
    );
  };

  const getContinentIcon = (continent: Continent) => {
    const icons: Record<string, string> = {
      [CONTINENTS.EUROPE]: '🇪🇺',
      [CONTINENTS.ASIA]: '🌏',
      [CONTINENTS.MIDDLE_EAST]: '🕌',
      [CONTINENTS.NORTH_AMERICA]: '🗽',
      [CONTINENTS.SOUTH_AMERICA]: '🌎',
      [CONTINENTS.OCEANIA]: '🦘',
      [CONTINENTS.AFRICA]: '🦁',
    };
    return icons[continent] || '🌍';
  };

  return (
    <div className="space-y-6">
      {/* Continent Filter Tabs */}
      <div className="card">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedContinent('all')}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              selectedContinent === 'all'
                ? 'bg-primary text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            🌍 Tüm Kıtalar ({countries.length})
          </button>
          
          {continentOrder.map(continent => {
            const count = continentGroups[continent]?.length || 0;
            if (count === 0) return null;
            
            return (
              <button
                key={continent}
                onClick={() => setSelectedContinent(continent)}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  selectedContinent === continent
                    ? 'bg-primary text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {getContinentIcon(continent)} {continent} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Countries by Continent */}
      {selectedContinent === 'all' ? (
        // Show grouped by continent
        <div className="space-y-8">
          {continentOrder.map(continent => {
            const continentCountries = continentGroups[continent];
            if (!continentCountries || continentCountries.length === 0) return null;

            return (
              <div key={continent} className="space-y-4">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{getContinentIcon(continent)}</span>
                  <h2 className="text-2xl font-bold text-slate-900">{continent}</h2>
                  <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                    {continentCountries.length} ülke
                  </span>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {continentCountries.map((country) => {
                    // ⚡ FIX: Use database image_url instead of hardcoded defaults
                    const imageUrl = (country as any).image_url || getCountryDefaultImage(country.name);
                    
                    return (
                      <Link
                        key={country.id}
                        href={locale === 'en' ? `/en/${country.slug || getCountrySlug(country.id)}` : `/${country.slug || getCountrySlug(country.id)}`}
                        className="card group overflow-hidden p-0 hover:border-primary hover:shadow-lg"
                      >
                        <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-100">
                          <Image
                            src={imageUrl}
                            alt={country.name}
                            fill
                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          />
                        </div>

                        <div className="space-y-3 p-4">
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="text-lg font-semibold text-slate-900 group-hover:text-primary">
                              {country.title || `${country.name} Vizesi`}
                            </h3>
                          </div>

                          {getVisaStatusBadges(country)}

                          {country.description && (
                            <p className="line-clamp-2 text-sm text-slate-600">
                              {country.description}
                            </p>
                          )}
                          
                          {country.price ? (
                            <div className="flex items-end justify-between border-t border-slate-100 pt-3">
                              <div>
                                <div className="text-2xl font-bold text-emerald-600">
                                  {getCurrencySymbol(country.currency_id)}{country.price.toLocaleString('tr-TR')}
                                </div>
                                <p className="text-[10px] text-slate-500">Başlangıç fiyatı</p>
                              </div>
                              <div className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white group-hover:bg-primary-dark">
                                Başvur
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                              <span className="text-sm text-slate-600">Detaylar için tıklayın</span>
                              <ArrowRight className="h-4 w-4 text-primary transition-transform group-hover:translate-x-1" />
                            </div>
                          )}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        // Show selected continent only
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {displayedCountries.map((country) => {
            // ⚡ FIX: Use database image_url instead of hardcoded defaults
            const imageUrl = (country as any).image_url || getCountryDefaultImage(country.name);
            
            return (
              <Link
                key={country.id}
                href={locale === 'en' ? `/en/${country.slug || getCountrySlug(country.id)}` : `/${country.slug || getCountrySlug(country.id)}`}
                className="card group overflow-hidden p-0 hover:border-primary hover:shadow-lg"
              >
                <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-100">
                  <Image
                    src={imageUrl}
                    alt={country.name}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                </div>

                <div className="space-y-3 p-4">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-lg font-semibold text-slate-900 group-hover:text-primary">
                      {country.title || `${country.name} Vizesi`}
                    </h3>
                  </div>

                  {getVisaStatusBadges(country)}

                  {country.description && (
                    <p className="line-clamp-2 text-sm text-slate-600">
                      {country.description}
                    </p>
                  )}
                  
                  {country.price ? (
                    <div className="flex items-end justify-between border-t border-slate-100 pt-3">
                      <div>
                        <div className="text-2xl font-bold text-emerald-600">
                          {getCurrencySymbol(country.currency_id)}{country.price.toLocaleString('tr-TR')}
                        </div>
                        <p className="text-[10px] text-slate-500">Başlangıç fiyatı</p>
                      </div>
                      <div className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white group-hover:bg-primary-dark">
                        Başvur
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                      <span className="text-sm text-slate-600">Detaylar için tıklayın</span>
                      <ArrowRight className="h-4 w-4 text-primary transition-transform group-hover:translate-x-1" />
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
