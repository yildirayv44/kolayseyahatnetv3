"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, PhoneCall, Clock, CheckCircle2, Users, Shield, Package, MessageCircleQuestion, FileQuestion, Globe, DollarSign, Info } from "lucide-react";
import { t } from "@/i18n/translations";
import type { Locale } from "@/i18n/translations";

interface CountryHeroProps {
  country: {
    id: number;
    name: string;
    title?: string;
    description?: string;
    process_time?: string;
    visa_required?: boolean;
    visa_type?: string;
    price_range?: string;
    country_code?: string;
    visa_requirement?: Array<{
      visa_status: string;
      allowed_stay: string | null;
      conditions: string | null;
      notes: string | null;
      application_method: string | null;
      available_methods?: string[];
    }>;
  };
  locale?: Locale;
  products?: Array<{
    id: number;
    name: string;
    price: string;
    currency_id: number;
  }>;
}

export function CountryHero({ country, locale = "tr", products = [] }: CountryHeroProps) {
  const [selectedPackage, setSelectedPackage] = useState<any>(products[0] || null);

  // Get visa requirement from database (for Turkish citizens)
  const visaReq = country.visa_requirement?.[0];
  
  // Selected visa method state (for multi-method countries)
  // Default to evisa if available (recommended), otherwise first method
  const [selectedMethod, setSelectedMethod] = useState<string>(() => {
    if (visaReq?.available_methods && visaReq.available_methods.length > 1) {
      // Prioritize evisa as default
      return visaReq.available_methods.includes('evisa') 
        ? 'evisa' 
        : visaReq.available_methods[0];
    }
    return visaReq?.visa_status || 'visa-required';
  });

  // Auto-select first package
  useEffect(() => {
    if (products.length > 0 && !selectedPackage) {
      setSelectedPackage(products[0]);
    }
  }, [products, selectedPackage]);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;
      window.scrollTo({ top: offsetPosition, behavior: "smooth" });
    }
  };

  const getConditionTooltip = (condition: string): string => {
    const tooltips: Record<string, string> = {
      'eVisa available online': 'Online olarak elektronik vize başvurusu yapabilirsiniz. Hızlı ve pratik bir süreçtir.',
      'eTA required': 'Elektronik Seyahat İzni (eTA) gereklidir. Online başvuru yapılır, genellikle dakikalar içinde onaylanır.',
      'Schengen area': 'Schengen bölgesi ülkesidir. 180 gün içinde 90 gün kalış hakkı sağlar.',
      'Schengen visa': 'Schengen vizesi gereklidir. Tüm Schengen ülkelerine geçerlidir.',
      'Visa on arrival': 'Vizenizi havaalanında/sınır kapısında alabilirsiniz. Önceden başvuru gerekmez.',
      'Tourist visa required': 'Turist vizesi başvurusu gereklidir. Konsolosluk randevusu alınmalıdır.',
      'Business visa available': 'İş vizesi için ayrı başvuru yapılabilir. Davet mektubu gerekebilir.',
      'Multiple entry possible': 'Çoklu giriş vizesi alınabilir. Vize süresi içinde birden fazla giriş yapabilirsiniz.',
    };
    
    // Check for partial matches
    for (const [key, value] of Object.entries(tooltips)) {
      if (condition.toLowerCase().includes(key.toLowerCase())) {
        return value;
      }
    }
    
    return condition;  // Determine visa status from database
  };

  const getVisaStatus = () => {
    if (!visaReq) return 'visa-required';
    
    // If multi-method, use selected method
    if (visaReq.available_methods && visaReq.available_methods.length > 1) {
      return selectedMethod === 'visa-free' ? 'visa-free' :
             selectedMethod === 'visa-on-arrival' ? 'visa-on-arrival' :
             selectedMethod === 'evisa' ? 'eta' : 'visa-required';
    }
    
    // visa_status from PassportIndex: 'visa-free', 'visa-on-arrival', 'eta', 'visa-required'
    return visaReq.visa_status || 'visa-required';
  };

  const getVisaStatusConfig = (status: string) => {
    const configs: Record<string, any> = {
      'visa-free': { 
        label: 'Vizesiz Giriş', 
        color: 'text-green-700', 
        bgColor: 'bg-green-50 border-green-200', 
        icon: '✅',
        description: 'Pasaportunuzla doğrudan seyahat edebilirsiniz. Ancak seyahat planlaması, otel rezervasyonu ve sigorta konularında uzman desteğimizden faydalanabilirsiniz.',
        cta: 'Seyahat danışmanlığı almak ister misiniz?',
        allowedStay: visaReq?.allowed_stay || null
      },
      'visa-on-arrival': { 
        label: 'Varışta Vize', 
        color: 'text-blue-700', 
        bgColor: 'bg-blue-50 border-blue-200', 
        icon: '🛬',
        description: 'Vizenizi havaalanında alabilirsiniz. Ancak doğru evraklar ve ön hazırlık için profesyonel destek almanızı öneririz. Reddedilme riskini sıfırlayın!',
        cta: 'Garantili geçiş için danışmanlık alın',
        allowedStay: visaReq?.allowed_stay || null
      },
      'eta': { 
        label: 'eVisa / eTA', 
        color: 'text-cyan-700', 
        bgColor: 'bg-cyan-50 border-cyan-200', 
        icon: '📧',
        description: 'Online başvuru hızlı görünse de hata yapma riski yüksektir. Uzman desteğimizle ilk seferde onay alın, zaman ve para kaybetmeyin!',
        cta: 'Hatasız başvuru için destek alın',
        allowedStay: visaReq?.allowed_stay || null
      },
      'visa-required': { 
        label: 'Vize Gerekli', 
        color: 'text-orange-700', 
        bgColor: 'bg-orange-50 border-orange-200', 
        icon: '🏛️',
        description: 'Vize başvurusu karmaşık ve zaman alıcıdır. Evrak eksikliği veya hata reddedilme sebebidir. %98 başarı oranımızla vizenizi garantiye alın!',
        cta: 'Garantili vize için hemen başlayın',
        allowedStay: null
      },
    };
    return configs[status] || configs['visa-required'];
  };

  const visaStatus = getVisaStatus();
  const visaConfig = getVisaStatusConfig(visaStatus);

  return (
    <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/5 via-blue-50 to-white p-6 md:p-10">
      {/* Background decoration */}
      <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-primary/10 blur-3xl" />
      
      <div className="relative">
        {/* Content */}
        <div className="space-y-6">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
            </span>
            {t(locale, "today")} 12 {t(locale, "peopleApplied")}
          </div>

          {/* Title */}
          <div>
            <div className="mb-3 flex items-center gap-3">
              <h1 className="text-3xl font-bold text-slate-900 md:text-4xl">
                {(country.title || `${country.name} Vizesi`)
                  .replace(/\s*[-|]\s*Kolay Seyahat\s*$/i, '')
                  .trim()}
              </h1>
              {visaReq && visaReq.visa_status === 'visa-free' && (
                <span className="rounded-full bg-emerald-500 px-3 py-1 text-sm font-bold text-white">
                  Vizesiz Giriş
                </span>
              )}
            </div>
            <p className="text-base leading-relaxed text-slate-600 md:text-lg">
              {country.description ||
                `${country.name} vizesi başvurularınız için profesyonel danışmanlık. Evrak hazırlığı, randevu ve süreç takibi tek noktadan.`}
            </p>
          </div>

          {/* Quick Stats with Icons */}
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-100">
                <Clock className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <div className="text-sm font-bold text-slate-900">
                  {country.process_time || "7-14 Gün"}
                </div>
                <div className="text-xs text-slate-600">{t(locale, "processingTime")}</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-emerald-100">
                <CheckCircle2 className="h-6 w-6 text-emerald-600" />
              </div>
              <div>
                <div className="text-sm font-bold text-slate-900">%98</div>
                <div className="text-xs text-slate-600">{t(locale, "successRate")}</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-purple-100">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <div className="text-sm font-bold text-slate-900">{t(locale, "expert")}</div>
                <div className="text-xs text-slate-600">{t(locale, "experts")}</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-amber-100">
                <Shield className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <div className="text-sm font-bold text-slate-900">7/24</div>
                <div className="text-xs text-slate-600">{t(locale, "support")}</div>
              </div>
            </div>
          </div>

          {/* Visa Requirements from Database (Turkish Citizens) */}
          {visaReq && (
            <div className="rounded-xl border-2 bg-white p-4">
              <div className="mb-3 flex items-center gap-2">
                <Globe className="h-5 w-5 text-primary" />
                <h3 className="font-bold text-slate-900">Vize Gereklilikleri</h3>
              </div>
              
              {/* User-friendly description */}
              <p className="mb-3 text-sm text-slate-600">
                {visaConfig.description}
              </p>

              {/* Multiple Methods - Side by Side Cards */}
              {visaReq.available_methods && visaReq.available_methods.length > 1 && (
                <div className="mb-4">
                  <div className="mb-2 text-xs font-semibold text-slate-700">
                    Başvuru Yöntemlerini Seçin:
                  </div>
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    {visaReq.available_methods.map((method: string) => {
                      const methodConfig = getVisaStatusConfig(
                        method === 'visa-free' ? 'visa-free' :
                        method === 'visa-on-arrival' ? 'visa-on-arrival' :
                        method === 'evisa' ? 'eta' : 'visa-required'
                      );
                      
                      const isRecommended = method === 'evisa';
                      const isSelected = selectedMethod === method;
                      
                      return (
                        <button
                          key={method}
                          onClick={() => setSelectedMethod(method)}
                          className={`relative rounded-lg border-2 p-4 text-left transition-all hover:shadow-md ${
                            isSelected
                              ? 'border-primary bg-primary/5 shadow-md'
                              : isRecommended
                              ? 'border-emerald-400 bg-gradient-to-br from-emerald-50 to-cyan-50'
                              : 'border-slate-200 bg-white hover:border-slate-300'
                          }`}
                        >
                          {isRecommended && (
                            <div className="absolute -top-2 left-3 rounded-full bg-emerald-500 px-2 py-0.5 text-xs font-bold text-white">
                              ÖNERİLEN
                            </div>
                          )}
                          <div className="mb-2 flex items-center gap-2">
                            <span className="text-2xl">{methodConfig.icon}</span>
                            <span className={`font-bold ${methodConfig.color}`}>
                              {methodConfig.label}
                            </span>
                          </div>
                          <div className="space-y-1 text-xs text-slate-700">
                            {method === 'evisa' && (
                              <>
                                <div className="flex items-center gap-1">
                                  <span className="text-emerald-600">✓</span>
                                  <span>Online başvuru</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <span className="text-emerald-600">✓</span>
                                  <span>Hızlı işlem</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <span className="text-emerald-600">✓</span>
                                  <span>Evden başvuru</span>
                                </div>
                              </>
                            )}
                            {method === 'visa-on-arrival' && (
                              <>
                                <div className="flex items-center gap-1">
                                  <span className="text-blue-600">✓</span>
                                  <span>Havaalanında alınır</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <span className="text-blue-600">✓</span>
                                  <span>Ön başvuru gerekmez</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <span className="text-amber-600">!</span>
                                  <span>Kuyruk olabilir</span>
                                </div>
                              </>
                            )}
                            {method === 'visa-free' && (
                              <>
                                <div className="flex items-center gap-1">
                                  <span className="text-green-600">✓</span>
                                  <span>Vize gerekmez</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <span className="text-green-600">✓</span>
                                  <span>Direkt giriş</span>
                                </div>
                              </>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                <div className={`rounded-lg border-2 px-4 py-3 ${visaConfig.bgColor}`}>
                  <div className="text-xs text-slate-600 mb-1">Vize Durumu</div>
                  <div className={`text-sm font-bold ${visaConfig.color}`}>
                    {visaConfig.icon} {visaConfig.label}
                  </div>
                </div>
                {visaConfig.allowedStay && (
                  <div className="rounded-lg bg-white/80 backdrop-blur-sm border border-slate-200 px-4 py-3">
                    <div className="text-xs text-slate-600 mb-1">Kalış Süresi</div>
                    <div className="text-sm font-bold text-slate-900">{visaConfig.allowedStay}</div>
                  </div>
                )}
                <div className="rounded-lg bg-white/80 backdrop-blur-sm border border-slate-200 px-4 py-3">
                  <div className="text-xs text-slate-600 mb-1">Başvuru Yöntemi</div>
                  <div className="text-sm font-bold text-slate-900">
                    {(() => {
                      // Use selected method if multi-method country
                      const method = (visaReq.available_methods && visaReq.available_methods.length > 1)
                        ? selectedMethod
                        : visaReq.application_method;
                      
                      if (method === 'embassy') return '🏛️ Konsolosluk';
                      if (method === 'online') return '💻 Online';
                      if (method === 'on-arrival' || method === 'visa-on-arrival') return '✈️ Varışta';
                      if (method === 'evisa') return '📧 E-Vize';
                      return method || '✈️ Varışta';
                    })()}
                  </div>
                </div>
                {visaReq.notes && (
                  <div className="group relative rounded-lg bg-white/80 backdrop-blur-sm border border-slate-200 px-4 py-3">
                    <div className="flex items-center gap-1 text-xs text-slate-600 mb-1">
                      <span>Notlar</span>
                      <div className="relative">
                        <Info className="h-3 w-3 text-slate-400 cursor-help" />
                        <div className="invisible group-hover:visible absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 rounded-lg bg-slate-900 px-3 py-2 text-xs text-white shadow-lg z-10">
                          {visaReq.notes}
                          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-slate-900"></div>
                        </div>
                      </div>
                    </div>
                    <div className="text-sm font-bold text-slate-900 line-clamp-1">{visaReq.notes}</div>
                  </div>
                )}
              </div>
              
              {/* Disclaimer */}
              <div className="mt-3 flex items-start gap-2 rounded-lg bg-amber-50 border border-amber-200 p-3">
                <Info className="h-4 w-4 flex-shrink-0 text-amber-600 mt-0.5" />
                <p className="text-xs text-amber-800 leading-relaxed">
                  <strong>Önemli:</strong> Vize gereklilikleri değişebilir ve burada verilen bilgiler kesin değildir. 
                  Güncel ve detaylı bilgi için lütfen{' '}
                  <a href="tel:02129099971" className="font-semibold underline hover:text-amber-900">
                    0212 909 99 71
                  </a>
                  {' '}numaralı telefondan bizimle iletişime geçin.
                </p>
              </div>
            </div>
          )}

          {/* Visa Packages - Compact */}
          {products.length > 0 && (
            <div className="rounded-xl border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-blue-50 p-4">
              <div className="mb-2 flex items-center gap-2">
                <Package className="h-5 w-5 text-primary" />
                <h3 className="font-bold text-slate-900">Vize Paketleri</h3>
              </div>
              <p className="mb-3 text-xs text-slate-600">
                💻 Online başvuru formu ile hemen işleme başlayabilirsiniz
              </p>
              <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
                {products.slice(0, 3).map((product, index) => (
                  <button
                    key={product.id}
                    onClick={() => setSelectedPackage(product)}
                    className={`group relative rounded-lg border-2 p-3 text-left transition-all hover:shadow-lg ${
                      selectedPackage?.id === product.id
                        ? 'border-primary bg-primary/5 shadow-md'
                        : 'border-white bg-white hover:border-primary'
                    }`}
                  >
                    {index === 0 && (
                      <div className="absolute -right-1 -top-1 rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold text-white">
                        ⭐ Popüler
                      </div>
                    )}
                    {selectedPackage?.id === product.id && (
                      <div className="absolute -left-1 -top-1 rounded-full bg-green-500 p-1">
                        <CheckCircle2 className="h-3 w-3 text-white" />
                      </div>
                    )}
                    <div className="mb-2">
                      <div className="text-sm font-bold text-slate-900">{product.name}</div>
                    </div>
                    <div className="flex items-baseline justify-between">
                      <div className="flex items-baseline gap-1">
                        <span className="text-lg font-bold text-primary">
                          {product.currency_id === 1 ? '₺' : product.currency_id === 2 ? '$' : '€'}
                          {Number(product.price).toFixed(0)}
                        </span>
                        <span className="text-xs text-slate-500">/ başvuru</span>
                      </div>
                      {selectedPackage?.id === product.id && (
                        <span className="text-xs font-semibold text-green-600">Seçili</span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
              {products.length > 3 && (
                <button
                  onClick={() => scrollToSection('vize-paketleri')}
                  className="mt-2 text-xs text-primary hover:underline"
                >
                  Tüm paketleri gör →
                </button>
              )}
            </div>
          )}

          {/* CTA Buttons */}
          <div className="grid gap-3 sm:grid-cols-3">
            <Link
              href={{
                pathname: '/vize-basvuru-formu',
                query: selectedPackage ? {
                  country_id: country.id,
                  country_name: country.name,
                  package_id: selectedPackage.id,
                  package_name: selectedPackage.name,
                } : {
                  country_id: country.id,
                  country_name: country.name,
                },
              }}
              className="group inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-4 text-base font-bold text-white shadow-xl transition-all hover:bg-primary/90 hover:shadow-2xl hover:scale-105"
            >
              <span>{selectedPackage ? `${selectedPackage.name} - Hemen Başvur` : t(locale, "applyNow")}</span>
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
            <a
              href="tel:02129099971"
              className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-primary bg-white px-6 py-4 text-base font-bold text-primary transition-all hover:bg-primary hover:text-white"
            >
              <PhoneCall className="h-5 w-5" />
              <span>0212 909 99 71</span>
            </a>
            <a
              href="https://www.kolayseyahat.tr/vize-degerlendirme.html"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 px-6 py-4 text-base font-bold text-white shadow-xl transition-all hover:from-emerald-600 hover:to-emerald-700 hover:shadow-2xl hover:scale-105"
            >
              <CheckCircle2 className="h-5 w-5" />
              <span>{t(locale, "freeEvaluation")}</span>
            </a>
          </div>

          {/* Sub text */}
          <p className="text-sm text-slate-500">
            ⚡ <strong>{t(locale, "fastProcess")}:</strong> {t(locale, "fastProcessDesc")}
          </p>

          {/* Quick Links */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => scrollToSection("vize-paketleri")}
              className="group flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition-all hover:border-primary hover:bg-primary hover:text-white"
            >
              <Package className="h-3.5 w-3.5" />
              <span>{t(locale, "packages")}</span>
            </button>
            <button
              onClick={() => scrollToSection("sss")}
              className="group flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition-all hover:border-primary hover:bg-primary hover:text-white"
            >
              <MessageCircleQuestion className="h-3.5 w-3.5" />
              <span>{t(locale, "sss")}</span>
            </button>
            <button
              onClick={() => scrollToSection("soru-sor")}
              className="group flex items-center gap-1.5 rounded-lg border border-primary bg-primary px-3 py-2 text-xs font-semibold text-white transition-all hover:bg-primary/90"
            >
              <FileQuestion className="h-3.5 w-3.5" />
              <span>{t(locale, "askQuestion")}</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
