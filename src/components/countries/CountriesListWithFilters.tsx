"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Globe2, ArrowRight, Search, Filter, CheckCircle, Clock, Globe, XCircle, Grid3x3, Map } from "lucide-react";
import { getCountrySlug } from "@/lib/helpers";
import { getCountryDefaultImage } from "@/lib/image-helpers";
import { CountriesByContinent } from "./CountriesByContinent";
import { VisaMap } from "./VisaMap";

interface Country {
  id: number;
  name: string;
  title: string;
  description: string;
  slug: string;
  country_code: string | null;
  visa_required: boolean;
  price: number | null;
  currency_id?: number;
  visa_labels?: string[];
  visa_label?: string;
  visa_status?: string;
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

interface CountriesListWithFiltersProps {
  initialCountries: Country[];
  locale?: 'tr' | 'en';
}

export function CountriesListWithFilters({ initialCountries, locale = 'tr' }: CountriesListWithFiltersProps) {
  const [countries] = useState<Country[]>(initialCountries);
  const [filteredCountries, setFilteredCountries] = useState<Country[]>(initialCountries);
  
  // View mode - default to continent view
  const [viewMode, setViewMode] = useState<'grid' | 'continent'>('continent');
  
  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [visaStatusFilter, setVisaStatusFilter] = useState<"all" | "visa-free" | "visa-on-arrival" | "eta" | "visa-required">("all");

  // Apply filters - artık getCountries'den gelen visa_labels kullanılıyor
  useEffect(() => {
    let filtered = [...countries];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(c => 
        c.name.toLowerCase().includes(query) ||
        c.title?.toLowerCase().includes(query)
      );
    }

    // Visa status filter - visa_labels kullan
    if (visaStatusFilter !== "all") {
      filtered = filtered.filter(c => {
        if (!c.visa_labels || c.visa_labels.length === 0) return false;
        
        const visaFreeLabel = locale === 'en' ? 'Visa-Free' : 'Vizesiz';
        const visaOnArrivalLabel = locale === 'en' ? 'Visa on Arrival' : 'Varışta Vize';
        const eVisaLabel = locale === 'en' ? 'E-Visa' : 'E-vize';
        const visaRequiredLabel = locale === 'en' ? 'Visa Required' : 'Vize Gerekli';
        
        if (visaStatusFilter === "visa-free") {
          return c.visa_labels.includes(visaFreeLabel) || c.visa_labels.includes("Vizesiz");
        } else if (visaStatusFilter === "visa-on-arrival") {
          return c.visa_labels.includes(visaOnArrivalLabel) || c.visa_labels.includes("Varışta Vize");
        } else if (visaStatusFilter === "eta") {
          return c.visa_labels.includes(eVisaLabel) || c.visa_labels.includes("E-vize");
        } else if (visaStatusFilter === "visa-required") {
          return c.visa_labels.includes(visaRequiredLabel) || c.visa_labels.includes("Vize Gerekli");
        }
        return false;
      });
    }

    setFilteredCountries(filtered);
  }, [searchQuery, visaStatusFilter, countries]);

  // Vize durumu badge'i - artık country'den gelen visa_labels kullanılıyor
  const getVisaStatusBadges = (country: Country) => {
    if (!country.visa_labels || country.visa_labels.length === 0) return null;

    const getLabelStyle = (label: string) => {
      if (label === "Vizesiz") {
        return { className: "bg-green-100 text-green-700 border-green-200", Icon: CheckCircle };
      } else if (label === "Varışta Vize") {
        return { className: "bg-blue-100 text-blue-700 border-blue-200", Icon: Clock };
      } else if (label === "E-vize") {
        return { className: "bg-purple-100 text-purple-700 border-purple-200", Icon: Globe };
      }
      return { className: "bg-orange-100 text-orange-700 border-orange-200", Icon: XCircle };
    };

    return (
      <div className="flex flex-wrap gap-1">
        {country.visa_labels.map((label, idx) => {
          const { className, Icon } = getLabelStyle(label);
          return (
            <div key={idx} className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${className}`}>
              <Icon className="h-3.5 w-3.5" />
              <span>{label}</span>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Header - SEO Optimized */}
      <section className="space-y-4">
        <h1 className="text-3xl font-bold text-slate-900 md:text-4xl">
          {locale === 'en'
            ? `Visa Application for ${countries.length} Countries for Turkish Citizens`
            : `Türk Vatandaşları İçin ${countries.length} Ülkeye Vize Başvurusu`}
        </h1>
        <p className="text-lg text-slate-600 max-w-3xl">
          {locale === 'en'
            ? 'Professional visa consultancy service for all countries requiring visa-free entry, visa on arrival, e-visa and consulate application. Apply with confidence with 98% success rate.'
            : 'Vizesiz giriş, varışta vize, e-vize ve konsolosluk başvurusu gerektiren tüm ülkeler için profesyonel vize danışmanlık hizmeti. %98 başarı oranıyla güvenle başvurun.'}
        </p>
      </section>

      {/* Visa Statistics - VisaMap bileşeni */}
      <VisaMap 
        countries={countries}
        locale={locale}
        onFilterChange={(filterValue) => {
          // Filtre değerini dropdown formatına çevir
          if (filterValue === "Vizesiz") setVisaStatusFilter("visa-free");
          else if (filterValue === "Varışta Vize") setVisaStatusFilter("visa-on-arrival");
          else if (filterValue === "E-vize") setVisaStatusFilter("eta");
          else if (filterValue === "Vize Gerekli") setVisaStatusFilter("visa-required");
        }}
      />

      {/* View Mode Toggle & Filters */}
      <div className="card space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-slate-400" />
            <h2 className="text-lg font-semibold text-slate-900">{locale === 'en' ? 'Filter' : 'Filtrele'}</h2>
          </div>
          
          {/* View Mode Toggle */}
          <div className="flex items-center gap-2 rounded-lg bg-slate-100 p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                viewMode === 'grid'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Grid3x3 className="h-4 w-4" />
              {locale === 'en' ? 'List' : 'Liste'}
            </button>
            <button
              onClick={() => setViewMode('continent')}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                viewMode === 'continent'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Map className="h-4 w-4" />
              {locale === 'en' ? 'By Continent' : 'Kıtalara Göre'}
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder={locale === 'en' ? 'Search country name...' : 'Ülke adı ara...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-slate-200 py-2 pl-10 pr-4 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {/* Visa Status Filter */}
          <select
            value={visaStatusFilter}
            onChange={(e) => setVisaStatusFilter(e.target.value as any)}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="all">{locale === 'en' ? 'All Visa Statuses' : 'Tüm Vize Durumları'}</option>
            <option value="visa-free">✅ {locale === 'en' ? 'Visa-Free' : 'Vizesiz'}</option>
            <option value="visa-on-arrival">🛬 {locale === 'en' ? 'Visa on Arrival' : 'Varışta Vize'}</option>
            <option value="eta">📧 {locale === 'en' ? 'E-Visa' : 'E-vize'}</option>
            <option value="visa-required">🏛️ {locale === 'en' ? 'Visa Required' : 'Vize Gerekli'}</option>
          </select>
        </div>

        {/* Active Filters */}
        {(searchQuery || visaStatusFilter !== "all") && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-600">{locale === 'en' ? 'Active filters:' : 'Aktif filtreler:'}</span>
            {searchQuery && (
              <span className="rounded-full bg-primary/10 px-2 py-1 text-xs text-primary">
                {locale === 'en' ? 'Search' : 'Arama'}: "{searchQuery}"
              </span>
            )}
            {visaStatusFilter !== "all" && (
              <span className="rounded-full bg-primary/10 px-2 py-1 text-xs text-primary">
                {visaStatusFilter === "visa-free" && (locale === 'en' ? 'Visa-Free' : 'Vizesiz')}
                {visaStatusFilter === "visa-on-arrival" && (locale === 'en' ? 'Visa on Arrival' : 'Varışta Vize')}
                {visaStatusFilter === "eta" && (locale === 'en' ? 'E-Visa' : 'E-vize')}
                {visaStatusFilter === "visa-required" && (locale === 'en' ? 'Visa Required' : 'Vize Gerekli')}
              </span>
            )}
            <button
              onClick={() => {
                setSearchQuery("");
                setVisaStatusFilter("all");
              }}
              className="text-xs text-slate-600 hover:text-slate-900"
            >
              {locale === 'en' ? 'Clear' : 'Temizle'}
            </button>
          </div>
        )}
      </div>

      {/* Countries Display */}
      {filteredCountries.length === 0 ? (
        <div className="card py-12 text-center">
          <Globe2 className="mx-auto h-12 w-12 text-slate-300" />
          <h3 className="mt-4 text-lg font-semibold text-slate-900">
            {locale === 'en' ? 'No country found' : 'Ülke bulunamadı'}
          </h3>
          <p className="mt-2 text-sm text-slate-600">
            {locale === 'en'
              ? 'No country found matching your filters. Please try different criteria.'
              : 'Filtrelerinize uygun ülke bulunamadı. Lütfen farklı kriterler deneyin.'}
          </p>
        </div>
      ) : viewMode === 'continent' ? (
        <CountriesByContinent countries={filteredCountries} visaData={{}} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredCountries.map((country) => {
            // ⚡ FIX: Use database image_url instead of hardcoded defaults
            const imageUrl = (country as any).image_url || getCountryDefaultImage(country.name);
            
            return (
              <Link
                key={country.id}
                href={`/${country.slug || getCountrySlug(country.id)}`}
                className="card group overflow-hidden p-0 hover:border-primary hover:shadow-lg"
              >
                {/* Country Image */}
                <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-100">
                  <Image
                    src={imageUrl}
                    alt={country.name}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                </div>

                {/* Country Content */}
                <div className="space-y-3 p-4">
                  <div className="flex items-start justify-between gap-2">
                    <h2 className="text-lg font-semibold text-slate-900 group-hover:text-primary">
                      {country.title || `${country.name} Vizesi`}
                    </h2>
                  </div>

                  {/* Visa Status Badges */}
                  {getVisaStatusBadges(country)}

                  {country.description && (
                    <p className="line-clamp-2 text-sm text-slate-600">
                      {country.description}
                    </p>
                  )}
                  
                  {/* Fiyat Gösterimi */}
                  {country.price ? (
                    <div className="flex items-end justify-between border-t border-slate-100 pt-3">
                      <div>
                        <div className="text-2xl font-bold text-emerald-600">
                          {getCurrencySymbol(country.currency_id)}{country.price.toLocaleString('tr-TR')}
                        </div>
                        <p className="text-[10px] text-slate-500">{locale === 'en' ? 'Starting price' : 'Başlangıç fiyatı'}</p>
                      </div>
                      <div className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white group-hover:bg-primary-dark">
                        {locale === 'en' ? 'Apply' : 'Başvur'}
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                      <span className="text-sm text-slate-600">{locale === 'en' ? 'Click for details' : 'Detaylar için tıklayın'}</span>
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
