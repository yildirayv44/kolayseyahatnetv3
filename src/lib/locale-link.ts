import { defaultLocale, type Locale } from "@/i18n/config";

/**
 * Generate locale-aware URL
 * - Turkish (default): /bahreyn
 * - English: /en/bahreyn
 */
export function getLocalizedUrl(path: string, locale: Locale): string {
  // Remove leading slash if present
  const cleanPath = path.startsWith("/") ? path.slice(1) : path;
  
  // For default locale (Turkish), return path without prefix
  if (locale === defaultLocale) {
    return `/${cleanPath}`;
  }
  
  // For other locales, add prefix
  return `/${locale}/${cleanPath}`;
}

/**
 * Get locale from pathname
 * /en/bahreyn -> en
 * /bahreyn -> tr (default)
 */
export function getLocaleFromPathname(pathname: string): Locale {
  const segments = pathname.split("/").filter(Boolean);
  
  if (segments[0] === "en") {
    return "en";
  }
  
  return defaultLocale;
}
