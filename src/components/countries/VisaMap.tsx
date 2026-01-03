"use client";

import { CheckCircle, Clock, Globe, XCircle, TrendingUp, Lightbulb, Plane, MapPin } from "lucide-react";

interface Country {
  id: number;
  name?: string;
  visa_labels?: string[];
}

interface Props {
  countries: Country[];
  onFilterChange?: (filter: string) => void;
  locale?: 'tr' | 'en';
}

export function VisaMap({ countries, onFilterChange, locale = 'tr' }: Props) {
  // Calculate statistics from visa_labels
  const visaFreeCountries = countries.filter(c => c.visa_labels?.includes("Vizesiz"));
  const visaOnArrivalCountries = countries.filter(c => c.visa_labels?.includes("Varışta Vize"));
  const eVisaCountries = countries.filter(c => c.visa_labels?.includes("E-vize"));
  const visaRequiredCountries = countries.filter(c => c.visa_labels?.includes("Vize Gerekli"));

  const visaFreeCount = visaFreeCountries.length;
  const visaOnArrivalCount = visaOnArrivalCountries.length;
  const eVisaCount = eVisaCountries.length;
  const visaRequiredCount = visaRequiredCountries.length;

  // Vizesiz + Varışta Vize = Kolay seyahat
  const easyTravelCount = visaFreeCount + visaOnArrivalCount;

  const stats = [
    {
      status: 'visa-free',
      filterValue: 'Vizesiz',
      label: locale === 'en' ? 'Visa-Free Entry' : 'Vizesiz Giriş',
      count: visaFreeCount,
      icon: CheckCircle,
      color: 'bg-green-50 border-green-200 hover:bg-green-100',
      iconColor: 'text-green-600',
      textColor: 'text-green-900',
      tip: locale === 'en' ? 'You can travel with passport only' : 'Sadece pasaportla gidebilirsiniz'
    },
    {
      status: 'visa-on-arrival',
      filterValue: 'Varışta Vize',
      label: locale === 'en' ? 'Visa on Arrival' : 'Varışta Vize',
      count: visaOnArrivalCount,
      icon: Clock,
      color: 'bg-blue-50 border-blue-200 hover:bg-blue-100',
      iconColor: 'text-blue-600',
      textColor: 'text-blue-900',
      tip: locale === 'en' ? 'You can get visa at the airport' : 'Havalimanında vize alabilirsiniz'
    },
    {
      status: 'eta',
      filterValue: 'E-vize',
      label: locale === 'en' ? 'E-Visa' : 'E-vize',
      count: eVisaCount,
      icon: Globe,
      color: 'bg-purple-50 border-purple-200 hover:bg-purple-100',
      iconColor: 'text-purple-600',
      textColor: 'text-purple-900',
      tip: locale === 'en' ? 'Obtained in 3-5 days with online application' : 'Online başvuru ile 3-5 günde alınır'
    },
    {
      status: 'visa-required',
      filterValue: 'Vize Gerekli',
      label: locale === 'en' ? 'Visa Required' : 'Vize Gerekli',
      count: visaRequiredCount,
      icon: XCircle,
      color: 'bg-orange-50 border-orange-200 hover:bg-orange-100',
      iconColor: 'text-orange-600',
      textColor: 'text-orange-900',
      tip: locale === 'en' ? 'Consulate application required' : 'Konsolosluk başvurusu gerekir'
    },
  ];

  const totalCountries = countries.length;
  const visaFreePercentage = totalCountries > 0 
    ? Math.round((visaFreeCount / totalCountries) * 100)
    : 0;
  const easyTravelPercentage = totalCountries > 0
    ? Math.round((easyTravelCount / totalCountries) * 100)
    : 0;

  // Popüler vizesiz destinasyonlar (ilk 5)
  const popularVisaFree = visaFreeCountries.slice(0, 5).map(c => c.name).filter(Boolean);

  const handleCardClick = (filterValue: string) => {
    if (onFilterChange) {
      onFilterChange(filterValue);
    }
  };

  return (
    <div className="space-y-4">
      {/* Main Stats Card */}
      <div className="card">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900 mb-1">
              {locale === 'en' ? 'Turkish Passport Visa Statistics' : 'Türkiye Pasaportu Vize İstatistikleri'}
            </h2>
            <p className="text-sm text-slate-600">
              {locale === 'en'
                ? `Visa status information for ${totalCountries} countries`
                : `${totalCountries} ülke için vize durumu bilgisi`}
            </p>
          </div>
          <div className="flex gap-3">
            <div className="flex items-center gap-2 rounded-lg bg-green-50 px-3 py-2 border border-green-200">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <div className="text-right">
                <div className="text-2xl font-bold text-green-900">{visaFreePercentage}%</div>
                <div className="text-xs text-green-600">{locale === 'en' ? 'Visa-Free' : 'Vizesiz'}</div>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-2 border border-blue-200">
              <Plane className="h-5 w-5 text-blue-600" />
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-900">{easyTravelPercentage}%</div>
                <div className="text-xs text-blue-600">{locale === 'en' ? 'Easy Travel' : 'Kolay Seyahat'}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Status Cards Grid - Tıklanabilir */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <button
                key={stat.status}
                onClick={() => handleCardClick(stat.filterValue)}
                className={`rounded-lg border p-4 ${stat.color} transition-all hover:shadow-md cursor-pointer text-left`}
              >
                <div className="flex items-center gap-3">
                  <div className={`rounded-lg bg-white p-2 ${stat.iconColor}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <div className={`text-2xl font-bold ${stat.textColor}`}>
                      {stat.count}
                    </div>
                    <div className="text-xs text-slate-600 mt-0.5">
                      {stat.label}
                    </div>
                  </div>
                </div>
                <div className="mt-2 text-[10px] text-slate-500 flex items-center gap-1">
                  <Lightbulb className="h-3 w-3" />
                  {stat.tip}
                </div>
              </button>
            );
          })}
        </div>

        {/* Popüler Vizesiz Destinasyonlar */}
        {popularVisaFree.length > 0 && (
          <div className="border-t border-slate-100 pt-4">
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-slate-700">
                {locale === 'en' ? 'Popular Visa-Free Destinations' : 'Popüler Vizesiz Destinasyonlar'}
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {popularVisaFree.map((name, idx) => (
                <span key={idx} className="rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700 border border-green-200">
                  {name}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Bilgi Notu */}
        <div className="mt-4 rounded-lg bg-slate-50 p-3 border border-slate-200">
          <div className="flex items-start gap-2">
            <Lightbulb className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-slate-600">
              <strong className="text-slate-700">{locale === 'en' ? 'Tip:' : 'İpucu:'}</strong> {locale === 'en'
                ? `Turkish citizens can travel to ${easyTravelPercentage}% of world countries visa-free or with visa on arrival. Click on cards to filter related countries.`
                : `Türk vatandaşları dünya ülkelerinin %${easyTravelPercentage}'ine vizesiz veya varışta vize ile seyahat edebilir. Kartlara tıklayarak ilgili ülkeleri filtreleyebilirsiniz.`}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
