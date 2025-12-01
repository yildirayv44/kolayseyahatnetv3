"use client";

import { usePathname, useRouter } from "next/navigation";
import { Globe } from "lucide-react";
import { locales, localeNames, localeFlags, type Locale, defaultLocale } from "@/i18n/config";
import { useState } from "react";
import { getLocalizedUrl, getLocaleFromPathname } from "@/lib/locale-link";

export function LanguageSwitcher() {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  // Get current locale from pathname
  const currentLocale = getLocaleFromPathname(pathname);

  const switchLocale = (locale: Locale) => {
    // Get path without locale prefix
    let pathWithoutLocale = pathname;
    
    // Remove /en prefix if exists
    if (pathname.startsWith('/en/')) {
      pathWithoutLocale = pathname.replace(/^\/en/, '');
    } else if (pathname === '/en') {
      pathWithoutLocale = '/';
    }
    // For Turkish (no prefix), keep as is
    
    // Set cookie for locale preference
    document.cookie = `NEXT_LOCALE=${locale}; path=/; max-age=31536000`;
    
    // Navigate to new locale
    const newPath = getLocalizedUrl(pathWithoutLocale.startsWith('/') ? pathWithoutLocale.slice(1) : pathWithoutLocale, locale);
    router.push(newPath);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
        aria-label="Change language"
      >
        <Globe className="h-4 w-4" />
        <span className="hidden md:inline">{localeNames[currentLocale]}</span>
        <span className="md:hidden">{localeFlags[currentLocale]}</span>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-full z-50 mt-2 w-40 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg">
            {locales.map((locale) => (
              <button
                key={locale}
                onClick={() => switchLocale(locale)}
                className={`flex w-full items-center gap-3 px-4 py-3 text-sm transition-colors hover:bg-slate-50 ${
                  locale === currentLocale
                    ? "bg-primary/5 font-semibold text-primary"
                    : "text-slate-700"
                }`}
              >
                <span className="text-lg">{localeFlags[locale]}</span>
                <span>{localeNames[locale]}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
