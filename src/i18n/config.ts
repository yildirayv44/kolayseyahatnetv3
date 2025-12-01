export const locales = ["tr", "en"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "tr";

// Locale prefix configuration
// tr: no prefix (default) - /bahreyn
// en: with prefix - /en/bahreyn
export const localePrefix = "as-needed" as const;

export const localeNames: Record<Locale, string> = {
  tr: "Türkçe",
  en: "English",
};

export const localeFlags: Record<Locale, string> = {
  tr: "🇹🇷",
  en: "🇬🇧",
};
