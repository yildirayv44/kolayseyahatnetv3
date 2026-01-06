"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { PhoneCall, Mail, LogIn, UserPlus, Search, ChevronDown, Globe2, User, Heart } from "lucide-react";
import { useState, useEffect } from "react";
import { getCountries } from "@/lib/queries";
import { getCountrySlug } from "@/lib/helpers";
import { getCurrentUser, signOut } from "@/lib/auth";
import { useFavorites } from "@/hooks/useFavorites";
import { LanguageSwitcher } from "@/components/shared/LanguageSwitcher";
import { getLocalizedUrl, getLocaleFromPathname } from "@/lib/locale-link";
import { type Locale } from "@/i18n/config";
import { t } from "@/i18n/translations";

const getMenuItems = (locale: 'tr' | 'en') => [
  { path: "ulkeler", label: locale === 'en' ? "Countries" : "Ülkeler" },
  { path: "kurumsal-vize-danismanligi", label: locale === 'en' ? "Corporate Visa Consultancy" : "Kurumsal Vize Danışmanlığı" },
  { path: "blog", label: "Blog" },
  { path: "danismanlar", label: locale === 'en' ? "Consultants" : "Danışmanlar" },
  { path: "hakkimizda", label: locale === 'en' ? "About Us" : "Hakkımızda" },
  { path: "affiliate", label: locale === 'en' ? "Become a Partner" : "Partner Ol" },
  { path: "iletisim", label: locale === 'en' ? "Contact" : "İletişim" },
];

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const locale = getLocaleFromPathname(pathname);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [countries, setCountries] = useState<any[]>([]);
  const [filteredCountries, setFilteredCountries] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [isNavigating, setIsNavigating] = useState(false);
  const { count: favoritesCount } = useFavorites();
  
  // Typewriter effect states
  const [placeholderText, setPlaceholderText] = useState("");
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  
  const phrases = [
    "Ülke Ara...",
    "Yolculuk Nereye?",
    "Vize Bilgilerini Öğren...",
    "Hangi Ülkeye Gidiyorsunuz?",
    "Rüya Tatilinizi Planlayın..."
  ];

  // Set mounted flag to prevent hydration mismatch
  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    getCurrentUser().then(setUser);
  }, []);

  useEffect(() => {
    getCountries().then(setCountries);
  }, []);

  // Typewriter effect
  useEffect(() => {
    // Don't run typewriter if user is typing, focused, or not mounted yet
    if (searchQuery || isFocused || !isMounted) return;

    const currentPhrase = phrases[currentPhraseIndex];
    const typingSpeed = isDeleting ? 50 : 100;
    const pauseAfterComplete = 2000; // 2 seconds pause after completing
    const pauseAfterDelete = 500; // 0.5 seconds pause after deleting

    const timeout = setTimeout(() => {
      if (!isDeleting) {
        // Typing
        if (placeholderText.length < currentPhrase.length) {
          setPlaceholderText(currentPhrase.slice(0, placeholderText.length + 1));
        } else {
          // Finished typing, wait then start deleting
          setTimeout(() => setIsDeleting(true), pauseAfterComplete);
        }
      } else {
        // Deleting
        if (placeholderText.length > 0) {
          setPlaceholderText(placeholderText.slice(0, -1));
        } else {
          // Finished deleting, move to next phrase
          setIsDeleting(false);
          setCurrentPhraseIndex((prev) => (prev + 1) % phrases.length);
          setTimeout(() => {}, pauseAfterDelete);
        }
      }
    }, typingSpeed);

    return () => clearTimeout(timeout);
  }, [placeholderText, isDeleting, currentPhraseIndex, searchQuery, isFocused, phrases, isMounted]);

  // Close search dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.search-container')) {
        setSearchOpen(false);
      }
    };

    if (searchOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [searchOpen]);

  useEffect(() => {
    if (searchQuery.trim()) {
      const query = searchQuery.toLocaleLowerCase('tr');
      const filtered = countries
        .filter((c) => 
          c.name.toLocaleLowerCase('tr').includes(query) ||
          (c.slug && c.slug.toLocaleLowerCase('tr').includes(query))
        )
        .sort((a, b) => {
          const aName = a.name.toLocaleLowerCase('tr');
          const bName = b.name.toLocaleLowerCase('tr');
          const aSlug = (a.slug || '').toLocaleLowerCase('tr');
          const bSlug = (b.slug || '').toLocaleLowerCase('tr');
          
          // Exact match in name first
          if (aName === query) return -1;
          if (bName === query) return 1;
          
          // Exact match in slug second
          if (aSlug === query) return -1;
          if (bSlug === query) return 1;
          
          // Starts with query in name
          const aNameStarts = aName.startsWith(query);
          const bNameStarts = bName.startsWith(query);
          if (aNameStarts && !bNameStarts) return -1;
          if (!aNameStarts && bNameStarts) return 1;
          
          // Starts with query in slug
          const aSlugStarts = aSlug.startsWith(query);
          const bSlugStarts = bSlug.startsWith(query);
          if (aSlugStarts && !bSlugStarts) return -1;
          if (!aSlugStarts && bSlugStarts) return 1;
          
          // Position of match in name
          const aNameIndex = aName.indexOf(query);
          const bNameIndex = bName.indexOf(query);
          const aSlugIndex = aSlug.indexOf(query);
          const bSlugIndex = bSlug.indexOf(query);
          
          // Prefer name match over slug match
          const aIndex = aNameIndex !== -1 ? aNameIndex : aSlugIndex + 1000;
          const bIndex = bNameIndex !== -1 ? bNameIndex : bSlugIndex + 1000;
          if (aIndex !== bIndex) return aIndex - bIndex;
          
          // Finally alphabetically
          return aName.localeCompare(bName, 'tr');
        });
      setFilteredCountries(filtered.slice(0, 5));
    } else {
      setFilteredCountries([]);
    }
  }, [searchQuery, countries]);

  const handleCountrySelect = (country: any) => {
    setIsNavigating(true);
    router.push(getLocalizedUrl(country.slug || getCountrySlug(country.id), locale));
    setSearchOpen(false);
    setSearchQuery("");
    // Reset after navigation (fallback)
    setTimeout(() => setIsNavigating(false), 3000);
  };

  return (
    <header className="sticky top-0 z-40 bg-white shadow-sm">
      {/* Top Bar */}
      <div className="hidden border-b border-slate-200 bg-slate-50 md:block">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-2 text-xs">
          <div className="flex items-center gap-4">
            <a href="tel:02129099971" className="flex items-center gap-1 text-slate-700 hover:text-primary">
              <PhoneCall className="h-3 w-3" />
              0212 909 99 71
            </a>
            <a href="mailto:vize@kolayseyahat.net" className="flex items-center gap-1 text-slate-700 hover:text-primary">
              <Mail className="h-3 w-3" />
              vize@kolayseyahat.net
            </a>
          </div>
          <div className="flex items-center gap-3">
            {user ? (
              <>
                <Link href="/admin" className="flex items-center gap-1 text-slate-700 hover:text-primary">
                  <User className="h-3 w-3" />
                  {t(locale as Locale, "adminPanel")}
                </Link>
                <button
                  onClick={async () => {
                    await signOut();
                    setUser(null);
                    router.push("/");
                    router.refresh();
                  }}
                  className="flex items-center gap-1 text-red-600 hover:text-red-700"
                >
                  <LogIn className="h-3 w-3" />
                  {t(locale as Locale, "logout")}
                </button>
              </>
            ) : (
              <>
                <Link href={getLocalizedUrl("giris", locale)} className="flex items-center gap-1 text-slate-700 hover:text-primary">
                  <LogIn className="h-3 w-3" />
                  {t(locale as Locale, "login")}
                </Link>
                <Link href={getLocalizedUrl("kayit", locale)} className="flex items-center gap-1 text-slate-700 hover:text-primary">
                  <UserPlus className="h-3 w-3" />
                  {t(locale as Locale, "register")}
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-2 px-4 py-4 md:gap-4">
        <Link href={getLocalizedUrl("", locale)} className="shrink-0 font-bold text-slate-800">
          <span className="text-2xl md:hidden">KS</span>
          <span className="hidden text-2xl md:inline">KolaySeyahat</span>
        </Link>

        {/* Search Bar */}
        <div className="search-container relative flex-1 max-w-md md:max-w-md">
          <div className="relative">
            {/* Pulse Animation Ring */}
            <div className="absolute -inset-1 rounded-lg bg-primary/20 opacity-75 blur-sm animate-pulse pointer-events-none"></div>
            
            <input
              type="text"
              placeholder={
                isFocused 
                  ? t(locale as Locale, "searchCountry")
                  : isMounted && placeholderText
                  ? `${placeholderText}${!searchQuery && !isDeleting ? '|' : ''}`
                  : t(locale as Locale, "searchCountry")
              }
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => {
                setSearchOpen(true);
                setIsFocused(true);
              }}
              onBlur={() => {
                // Delay to allow click on results
                setTimeout(() => setIsFocused(false), 200);
              }}
              className="relative w-full rounded-lg border-2 border-primary/40 bg-white py-3 pl-11 pr-3 text-sm font-medium placeholder:text-slate-600 placeholder:font-semibold focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 md:py-2 md:pl-14 md:pr-4 md:text-sm"
            />
            
            {/* Search Icon - Larger and more prominent - After input for proper z-index */}
            <Search className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-primary stroke-[2.5]" />
            <span className="pointer-events-none absolute left-9 top-1/2 -translate-y-1/2 hidden md:inline text-sm font-semibold text-primary/80">|</span>
          </div>

          {searchOpen && (
            <div className="absolute left-0 right-0 top-full z-50 mt-2 max-h-96 overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-xl">
              {/* Popular Countries - Show when no search */}
              {!searchQuery && (
                <>
                  <div className="border-b border-slate-200 bg-gradient-to-r from-primary/10 to-blue-50 px-4 py-2">
                    <h3 className="text-xs font-semibold text-primary">⭐ {t(locale as Locale, "popularCountries")}</h3>
                  </div>
                  {countries
                    .filter((c: any) => ['Amerika', 'İngiltere', 'Kanada', 'Almanya', 'Fransa', 'İtalya'].includes(c.name))
                    .slice(0, 6)
                    .map((country: any) => (
                      <button
                        key={country.id}
                        onClick={() => handleCountrySelect(country)}
                        className="flex w-full items-center gap-3 border-b border-slate-100 px-4 py-3 text-left hover:bg-primary/5 last:border-0"
                      >
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                          <Globe2 className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-semibold text-slate-900">{country.name} Vizesi</div>
                          <div className="text-xs text-slate-500 line-clamp-1">
                            {country.description || `${country.name} vizesi başvurunuz için bizi hemen...`}
                          </div>
                        </div>
                      </button>
                    ))}
                </>
              )}

              {/* Search Results */}
              {searchQuery && filteredCountries.length > 0 && (
                <>
                  <div className="border-b border-slate-200 bg-slate-50 px-4 py-2">
                    <h3 className="text-xs font-semibold text-slate-700">{t(locale as Locale, "searchResults")} ({filteredCountries.length})</h3>
                  </div>
                  {filteredCountries.map((country) => (
                    <button
                      key={country.id}
                      onClick={() => handleCountrySelect(country)}
                      className="flex w-full items-center gap-3 border-b border-slate-100 px-4 py-3 text-left hover:bg-slate-50 last:border-0"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                        <Globe2 className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-semibold text-slate-900">{country.name} Vizesi</div>
                        <div className="text-xs text-slate-500 line-clamp-1">
                          {country.description || `${country.name} vizesi başvurunuz için bizi hemen...`}
                        </div>
                      </div>
                      <Search className="h-4 w-4 text-slate-400" />
                    </button>
                  ))}
                </>
              )}

              {/* No Results */}
              {searchQuery && filteredCountries.length === 0 && (
                <div className="px-4 py-8 text-center">
                  <p className="text-sm text-slate-500">{t(locale as Locale, "noResults")}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Desktop Menu */}
        <div className="hidden items-center gap-4 md:flex">
          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex items-center gap-1 text-sm font-medium text-slate-700 hover:text-primary"
            >
              {t(locale as Locale, "menu")}
              <ChevronDown className="h-4 w-4" />
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-full mt-2 w-56 rounded-lg border border-slate-200 bg-white shadow-lg">
                {getMenuItems(locale).map((item) => (
                  <Link
                    key={item.path}
                    href={getLocalizedUrl(item.path, locale)}
                    onClick={() => setMenuOpen(false)}
                    className="block border-b border-slate-100 px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 last:border-0"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="hidden items-center gap-3 md:flex">
            <LanguageSwitcher />
            
            <Link
              href={getLocalizedUrl("favoriler", locale)}
              className="relative rounded-full p-2 text-slate-600 transition-colors hover:bg-slate-100 hover:text-primary"
              title="Favorilerim"
            >
              <Heart className="h-5 w-5" />
              {favoritesCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                  {favoritesCount}
                </span>
              )}
            </Link>

            <Link href={getLocalizedUrl("basvuru", locale)} className="btn-primary text-sm">
              {t(locale as Locale, "applyNow")}
            </Link>
          </div>
        </div>

        {/* Mobile Actions */}
        <div className="flex items-center gap-2 md:hidden">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="rounded-lg border border-slate-200 p-2 text-slate-700"
          >
            <ChevronDown className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="border-t border-slate-200 bg-white shadow-lg md:hidden">
          <nav className="mx-auto flex max-w-6xl flex-col px-4 py-3">
            {getMenuItems(locale).map((item) => (
              <Link
                key={item.path}
                href={getLocalizedUrl(item.path, locale)}
                onClick={() => setMenuOpen(false)}
                className="border-b border-slate-100 py-3 text-sm text-slate-700 hover:text-primary last:border-0"
              >
                {item.label}
              </Link>
            ))}
            
            {/* Language Switcher in Mobile Menu */}
            <div className="border-b border-slate-100 py-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-700">Dil / Language</span>
                <LanguageSwitcher />
              </div>
            </div>

            <Link
              href={getLocalizedUrl("basvuru", locale)}
              onClick={() => setMenuOpen(false)}
              className="mt-3 inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white"
            >
              Hemen Başvur
            </Link>
          </nav>
        </div>
      )}

      {/* Loading Overlay */}
      {isNavigating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="rounded-lg bg-white p-6 shadow-xl">
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-primary" />
                <div className="absolute inset-0 h-12 w-12 animate-ping rounded-full bg-primary/20" />
              </div>
              <div className="text-center">
                <p className="text-lg font-semibold text-slate-900">Sayfa Yükleniyor</p>
                <p className="text-sm text-slate-600">Lütfen bekleyiniz...</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
