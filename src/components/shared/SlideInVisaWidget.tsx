"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Search, CheckCircle, Clock, Globe, XCircle, ArrowRight, X, ChevronLeft } from "lucide-react";

interface Package {
  id: number;
  name: string;
  price: number;
  currency_id?: number;
}

interface Country {
  id: number;
  name: string;
  slug: string;
  visa_labels?: string[];
  price: number | null;
  currency_id?: number;
  visa_required: boolean;
  packages?: Package[];
}

interface SlideInVisaWidgetProps {
  countries?: Country[];
  locale?: 'tr' | 'en';
  currentCountry?: string;
  autoOpen?: boolean;
}

export function SlideInVisaWidget({ countries: initialCountries, locale = 'tr', currentCountry, autoOpen = true }: SlideInVisaWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [countries, setCountries] = useState<Country[]>(initialCountries || []);
  const [isLoadingCountries, setIsLoadingCountries] = useState(!initialCountries);

  // Fetch countries client-side if not provided
  useEffect(() => {
    if (!initialCountries) {
      fetch('/api/countries')
        .then(res => res.json())
        .then(response => {
          // API returns { success: true, data: [...] }
          const countriesData = response.success && response.data ? response.data : [];
          setCountries(countriesData);
          setIsLoadingCountries(false);
        })
        .catch(err => {
          console.error('Failed to fetch countries:', err);
          setCountries([]);
          setIsLoadingCountries(false);
        });
    }
  }, [initialCountries]);

  // Detect mobile on mount
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024); // lg breakpoint
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Auto-select current country on mount
  useEffect(() => {
    if (currentCountry && countries.length > 0) {
      console.log("🔍 Looking for country:", currentCountry);
      const country = countries.find(c => c.slug === currentCountry);
      if (country) {
        console.log("✅ Found country:", country.name);
        console.log("📦 Packages:", country.packages?.length || 0);
        setSelectedCountry(country);
        setSearchQuery(country.name);
        // Auto-select first package if available
        if (country.packages && country.packages.length > 0) {
          console.log("✅ Auto-selecting first package:", country.packages[0]);
          setSelectedPackage(country.packages[0]);
        } else {
          console.log("❌ No packages found for this country");
        }
      }
    }
  }, [currentCountry, countries]);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPercentage = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
      
      if (scrollPercentage > 20 && !hasScrolled) {
        setHasScrolled(true);
        // Auto-open logic: Desktop always opens, Mobile only if autoOpen is true
        const shouldAutoOpen = !isMobile || autoOpen;
        if (shouldAutoOpen) {
          setIsOpen(true);
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [hasScrolled, autoOpen, isMobile]);

  // Swipe gesture handlers - Right swipe to close
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const currentTouch = e.targetTouches[0].clientX;
    const diff = currentTouch - touchStart;
    
    // Only allow rightward swipe to close
    if (diff > 0) {
      setDragOffset(diff);
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    
    // If swiped right more than 100px, close the widget
    if (dragOffset > 100) {
      setIsOpen(false);
    }
    
    setDragOffset(0);
    setTouchStart(0);
    setTouchEnd(0);
  };

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
    total: countries.length,
  };

  const visaFreePercentage = stats.total > 0 ? Math.round((stats.visaFree / stats.total) * 100) : 0;

  return (
    <>
      {/* Backdrop overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-[59] bg-black/40 backdrop-blur-sm transition-opacity duration-300"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Widget - Slide-in from right (both mobile & desktop) */}
      <div
        className={`fixed right-0 top-0 z-[60] h-full w-[85%] max-w-md transform transition-all duration-500 ease-in-out sm:w-96
          ${isOpen ? 'translate-x-0' : 'translate-x-full'}
        `}
        style={{
          transform: isDragging && dragOffset > 0 
            ? `translateX(${dragOffset}px)` 
            : undefined
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="relative flex h-full flex-col overflow-hidden border-l-2 border-slate-200 bg-white shadow-[-10px_0_50px_rgba(0,0,0,0.3)]">
          
          {/* Header with close button */}
          <div className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3">
            <h3 className="text-base font-bold text-slate-900">
              {locale === 'en' ? '🌍 Quick Visa Check!' : '🌍 Hızlı Vize Sorgula!'}
            </h3>
            <button
              onClick={() => setIsOpen(false)}
              className="rounded-lg bg-slate-100 p-1.5 transition-colors hover:bg-slate-200"
            >
              <X className="h-4 w-4 text-slate-600" />
            </button>
          </div>

          {/* Content - Scrollable */}
          <div className="flex-1 overflow-y-auto p-4">
            {isLoadingCountries ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                  <p className="text-sm text-slate-600">{locale === 'en' ? 'Loading countries...' : 'Ülkeler yükleniyor...'}</p>
                </div>
              </div>
            ) : (
            <div className="space-y-4">

              {/* Mini Stats - Compact */}
              <div className="flex items-center justify-center gap-4 rounded-lg bg-slate-50 p-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                    <span className="text-lg font-bold text-green-700">{stats.visaFree}</span>
                  </div>
                  <span className="text-xs font-semibold text-green-700">{locale === 'en' ? 'Visa Free' : 'Vizesiz'}</span>
                </div>
                <div className="h-8 w-px bg-slate-300"></div>
                <div className="flex items-center gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100">
                    <span className="text-lg font-bold text-orange-700">{stats.visaRequired}</span>
                  </div>
                  <span className="text-xs font-semibold text-orange-700">{locale === 'en' ? 'Visa Req.' : 'Vize Gerekli'}</span>
                </div>
              </div>

              {/* Progress Bar */}
              <div>
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700">{locale === 'en' ? 'Easy Travel' : 'Kolay Seyahat'}</span>
                  <span className="font-bold text-green-600">{visaFreePercentage}%</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-slate-200">
                  <div className="h-full bg-gradient-to-r from-green-500 to-green-600 transition-all duration-500" style={{ width: `${visaFreePercentage}%` }} />
                </div>
              </div>

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder={locale === 'en' ? 'Search country...' : 'Ülke ara...'}
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setShowDropdown(true); }}
                  onFocus={() => setShowDropdown(true)}
                  onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                  className="w-full rounded-lg border-2 border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
                
                {showDropdown && searchQuery && filteredCountries.length > 0 && (
                  <div className="absolute z-10 mt-2 w-full rounded-lg border-2 border-slate-200 bg-white shadow-xl max-h-60 overflow-y-auto">
                    {filteredCountries.map((country) => (
                      <button
                        key={country.id}
                        onClick={() => handleCountrySelect(country)}
                        className="flex w-full items-center gap-3 border-b border-slate-100 px-3 py-3 text-left transition-colors hover:bg-slate-50 last:border-b-0"
                      >
                        <span className="flex-1 text-sm font-medium text-slate-900 truncate">{country.name}</span>
                        {country.visa_labels && country.visa_labels.length > 0 && (
                          <span className={`flex-shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap ${
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
                <div className={`space-y-3 rounded-xl border-2 p-4 ${getVisaStatusInfo(selectedCountry).borderColor} ${getVisaStatusInfo(selectedCountry).bgColor}`}>
                  {/* Country Header */}
                  <div>
                    <h4 className="text-base font-bold text-slate-900 mb-2">{selectedCountry.name}</h4>
                    <div className="flex items-center gap-1.5">
                      {(() => { const Icon = getVisaStatusInfo(selectedCountry).icon; return <Icon className={`h-4 w-4 flex-shrink-0 ${getVisaStatusInfo(selectedCountry).textColor}`} />; })()}
                      <span className={`text-sm font-semibold ${getVisaStatusInfo(selectedCountry).textColor}`}>{getVisaStatusInfo(selectedCountry).label}</span>
                    </div>
                  </div>

                  {/* Packages */}
                  {selectedCountry.packages && selectedCountry.packages.length > 0 && (
                    <div className="space-y-2">
                      <h5 className="text-xs font-semibold text-slate-600 uppercase">
                        {locale === 'en' ? 'Available Packages' : 'Vize Paketleri'}
                      </h5>
                      <div className="max-h-[240px] space-y-2 overflow-y-auto">
                        {selectedCountry.packages.map((pkg) => (
                          <button
                            key={pkg.id}
                            onClick={() => setSelectedPackage(pkg)}
                            className={`w-full rounded-lg border-2 p-3 text-left transition-all ${
                              selectedPackage?.id === pkg.id
                                ? 'border-primary bg-primary/5'
                                : 'border-slate-200 bg-white hover:border-primary/50'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-sm font-bold text-slate-900">{pkg.name}</span>
                                  {selectedCountry.packages && pkg.id === selectedCountry.packages[0]?.id && (
                                    <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-700">
                                      {locale === 'en' ? 'Popular' : 'Popüler'}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="text-right flex-shrink-0">
                                <div className="text-lg font-bold text-primary">
                                  {getCurrencySymbol(pkg.currency_id)}{pkg.price}
                                </div>
                                <div className="text-xs text-slate-500">
                                  {locale === 'en' ? '/ application' : '/ başvuru'}
                                </div>
                              </div>
                            </div>
                            {selectedPackage?.id === pkg.id && (
                              <div className="mt-2 text-xs text-primary font-semibold">
                                ✓ {locale === 'en' ? 'Selected' : 'Seçili'}
                              </div>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-2">
                    <Link 
                      href={`/${selectedCountry.slug}`} 
                      className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border-2 border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition-all hover:border-primary hover:bg-slate-50"
                    >
                      {locale === 'en' ? 'Details' : 'Detay'}
                    </Link>
                    <Link 
                      href={`/vize-basvuru-formu?country_id=${selectedCountry.id}&country_name=${encodeURIComponent(selectedCountry.name)}${selectedPackage ? `&package_id=${selectedPackage.id}&package_name=${encodeURIComponent(selectedPackage.name)}` : ''}`}
                      className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-lg transition-all hover:bg-primary/90 hover:shadow-xl"
                    >
                      {locale === 'en' ? 'Apply' : 'Başvur'}
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              )}

              {/* CTA & Close Buttons */}
              <div className="flex gap-2">
                <Link 
                  href="/ulkeler" 
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg border-2 border-primary bg-primary/5 px-4 py-3 text-sm font-bold text-primary transition-all hover:bg-primary hover:text-white hover:shadow-lg"
                >
                  {locale === 'en' ? 'View All Countries' : 'Tüm Ülkeleri Görüntüle'}
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <button
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-center rounded-lg border-2 border-slate-300 bg-white px-4 py-3 text-sm font-bold text-slate-700 transition-all hover:border-slate-400 hover:bg-slate-50"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
            )}
          </div>
        </div>
      </div>

      {/* Reopen Button - Side tab (both mobile & desktop) */}
      {!isOpen && hasScrolled && (
        <button
          onClick={() => setIsOpen(true)}
          className="group fixed right-0 top-1/2 z-40 -translate-y-1/2 rounded-l-lg bg-gradient-to-b from-primary to-blue-600 px-2 py-8 text-white shadow-lg transition-all hover:px-3 hover:shadow-xl active:scale-95"
        >
          <div className="flex flex-col items-center gap-2">
            <ChevronLeft className="h-5 w-5 animate-bounce" />
            <span className="text-xs font-bold" style={{ writingMode: 'vertical-rl' }}>
              {locale === 'en' ? '🌍 Quick Check' : '🌍 Hızlı Sorgula'}
            </span>
          </div>
        </button>
      )}
    </>
  );
}
