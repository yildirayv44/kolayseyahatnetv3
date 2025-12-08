"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Globe2, ArrowRight, TrendingDown, Search, Filter, CheckCircle, Clock, Globe, XCircle, Grid3x3, Map } from "lucide-react";
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
  price: number;
  original_price: number;
  discount_percentage: number;
}

interface VisaRequirement {
  countryCode: string;
  visaStatus: string;
  allowedStay: string | null;
}

export function CountriesListWithFilters({ initialCountries }: { initialCountries: Country[] }) {
  const [countries, setCountries] = useState<Country[]>(initialCountries);
  const [filteredCountries, setFilteredCountries] = useState<Country[]>(initialCountries);
  const [visaData, setVisaData] = useState<Record<string, VisaRequirement>>({});
  const [loading, setLoading] = useState(false);
  
  // View mode - default to continent view
  const [viewMode, setViewMode] = useState<'grid' | 'continent'>('continent');
  
  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [visaStatusFilter, setVisaStatusFilter] = useState<"all" | "visa-free" | "visa-on-arrival" | "eta" | "visa-required">("all");

  // Load visa requirements
  useEffect(() => {
    fetch('/api/admin/visa-requirements/fetch-passportindex')
      .then(res => res.json())
      .then(data => {
        const visaMap: Record<string, VisaRequirement> = {};
        data.data?.forEach((v: any) => {
          visaMap[v.countryCode] = {
            countryCode: v.countryCode,
            visaStatus: v.visaStatus,
            allowedStay: v.allowedStay
          };
        });
        setVisaData(visaMap);
      })
      .catch(console.error);
  }, []);

  // Apply filters
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

    // Visa status filter
    if (visaStatusFilter !== "all") {
      filtered = filtered.filter(c => {
        if (!c.country_code) return false;
        const visa = visaData[c.country_code];
        return visa?.visaStatus === visaStatusFilter;
      });
    }

    setFilteredCountries(filtered);
  }, [searchQuery, visaStatusFilter, countries, visaData]);

  const getVisaStatusBadge = (countryCode: string | null) => {
    if (!countryCode) return null;

    const visa = visaData[countryCode];
    if (!visa) return null;

    const statusConfig: Record<string, { label: string; className: string; icon: any }> = {
      'visa-free': { 
        label: 'Vizesiz', 
        className: 'bg-green-100 text-green-700 border-green-200',
        icon: CheckCircle
      },
      'visa-on-arrival': { 
        label: 'Varışta Vize', 
        className: 'bg-blue-100 text-blue-700 border-blue-200',
        icon: Clock
      },
      'eta': { 
        label: 'eTA', 
        className: 'bg-cyan-100 text-cyan-700 border-cyan-200',
        icon: Globe
      },
      'visa-required': { 
        label: 'Vize Gerekli', 
        className: 'bg-orange-100 text-orange-700 border-orange-200',
        icon: XCircle
      },
    };

    const config = statusConfig[visa.visaStatus];
    if (!config) return null;

    const Icon = config.icon;

    return (
      <div className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${config.className}`}>
        <Icon className="h-3.5 w-3.5" />
        <span>{config.label}</span>
        {visa.allowedStay && (
          <span className="text-[10px] opacity-75">• {visa.allowedStay}</span>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <section className="space-y-4">
        <h1 className="text-3xl font-bold text-slate-900">
          Vize Başvurusu Yapılabilecek Ülkeler
        </h1>
        <p className="text-lg text-slate-600">
          {filteredCountries.length} ülke için profesyonel vize danışmanlık hizmeti sunuyoruz.
        </p>
      </section>

      {/* Visa Map */}
      <VisaMap visaData={visaData} />

      {/* View Mode Toggle & Filters */}
      <div className="card space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-slate-400" />
            <h2 className="text-lg font-semibold text-slate-900">Filtrele</h2>
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
              Liste
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
              Kıtalara Göre
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Ülke adı ara..."
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
            <option value="all">Tüm Vize Durumları</option>
            <option value="visa-free">✅ Vizesiz Giriş</option>
            <option value="visa-on-arrival">🛬 Varışta Vize</option>
            <option value="eta">📧 eTA Gerekli</option>
            <option value="visa-required">🏛️ Vize Gerekli</option>
          </select>
        </div>

        {/* Active Filters */}
        {(searchQuery || visaStatusFilter !== "all") && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-600">Aktif filtreler:</span>
            {searchQuery && (
              <span className="rounded-full bg-primary/10 px-2 py-1 text-xs text-primary">
                Arama: "{searchQuery}"
              </span>
            )}
            {visaStatusFilter !== "all" && (
              <span className="rounded-full bg-primary/10 px-2 py-1 text-xs text-primary">
                {visaStatusFilter === "visa-free" && "Vizesiz"}
                {visaStatusFilter === "visa-on-arrival" && "Varışta Vize"}
                {visaStatusFilter === "eta" && "eTA"}
                {visaStatusFilter === "visa-required" && "Vize Gerekli"}
              </span>
            )}
            <button
              onClick={() => {
                setSearchQuery("");
                setVisaStatusFilter("all");
              }}
              className="text-xs text-slate-600 hover:text-slate-900"
            >
              Temizle
            </button>
          </div>
        )}
      </div>

      {/* Countries Display */}
      {filteredCountries.length === 0 ? (
        <div className="card py-12 text-center">
          <Globe2 className="mx-auto h-12 w-12 text-slate-300" />
          <h3 className="mt-4 text-lg font-semibold text-slate-900">
            Ülke bulunamadı
          </h3>
          <p className="mt-2 text-sm text-slate-600">
            Filtrelerinize uygun ülke bulunamadı. Lütfen farklı kriterler deneyin.
          </p>
        </div>
      ) : viewMode === 'continent' ? (
        <CountriesByContinent countries={filteredCountries} visaData={visaData} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredCountries.map((country) => {
            const imageUrl = getCountryDefaultImage(country.name);
            
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

                  {/* Visa Status Badge */}
                  {getVisaStatusBadge(country.country_code)}

                  {country.description && (
                    <p className="line-clamp-2 text-sm text-slate-600">
                      {country.description}
                    </p>
                  )}
                  
                  {/* Fiyat Gösterimi */}
                  {country.price ? (
                    <div className="flex items-end justify-between border-t border-slate-100 pt-3">
                      <div>
                        {country.original_price && country.original_price > country.price && (
                          <div className="flex items-center gap-1 mb-1">
                            <span className="text-xs text-slate-400 line-through">
                              ₺{country.original_price.toLocaleString('tr-TR')}
                            </span>
                            {country.discount_percentage && (
                              <span className="inline-flex items-center gap-0.5 rounded-full bg-red-50 px-1.5 py-0.5 text-[10px] font-bold text-red-600">
                                <TrendingDown className="h-2.5 w-2.5" />
                                %{country.discount_percentage}
                              </span>
                            )}
                          </div>
                        )}
                        <div className="text-2xl font-bold text-emerald-600">
                          ₺{country.price.toLocaleString('tr-TR')}
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
