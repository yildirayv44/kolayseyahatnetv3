"use client";

import Link from "next/link";
import { ArrowRight, PhoneCall, Clock, CheckCircle2, Users, Shield, Package, MessageCircleQuestion, FileQuestion } from "lucide-react";
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
  };
  locale?: Locale;
}

export function CountryHero({ country, locale = "tr" }: CountryHeroProps) {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;
      window.scrollTo({ top: offsetPosition, behavior: "smooth" });
    }
  };

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
                {country.title || `${country.name} Vizesi`}
              </h1>
              {country.visa_required === false && (
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

          {/* Additional Info */}
          {(country.visa_type || country.price_range) && (
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              {country.visa_required !== undefined && (
                <div className="rounded-lg bg-white/80 backdrop-blur-sm border border-primary/20 px-4 py-3">
                  <div className="text-xs text-slate-600 mb-1">Vize Durumu</div>
                  <div className="text-sm font-bold text-slate-900">
                    {country.visa_required ? "Vize Gerekli" : "Vizesiz Giriş"}
                  </div>
                </div>
              )}
              {country.visa_type && (
                <div className="rounded-lg bg-white/80 backdrop-blur-sm border border-primary/20 px-4 py-3">
                  <div className="text-xs text-slate-600 mb-1">Vize Türü</div>
                  <div className="text-sm font-bold text-slate-900">{country.visa_type}</div>
                </div>
              )}
              {country.price_range && (
                <div className="rounded-lg bg-white/80 backdrop-blur-sm border border-primary/20 px-4 py-3">
                  <div className="text-xs text-slate-600 mb-1">Ücret Aralığı</div>
                  <div className="text-sm font-bold text-slate-900">{country.price_range}</div>
                </div>
              )}
            </div>
          )}

          {/* CTA Buttons */}
          <div className="grid gap-3 sm:grid-cols-3">
            <Link
              href="/vize-basvuru-formu"
              className="group inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-4 text-base font-bold text-white shadow-xl transition-all hover:bg-primary/90 hover:shadow-2xl hover:scale-105"
            >
              <span>{t(locale, "applyNow")}</span>
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
