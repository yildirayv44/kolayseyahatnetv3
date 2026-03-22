"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { PhoneCall, Mail, LogIn, UserPlus, Search, ChevronDown, Globe2, User, Heart } from "lucide-react";
import { useState, useEffect } from "react";
import { getCountries } from "@/lib/queries";
import { getCountrySlug } from "@/lib/helpers";
import { getCurrentUser, signOut, isAdmin } from "@/lib/auth";
import { useFavorites } from "@/hooks/useFavorites";
import { useApplicationFormType, getApplicationFormLink } from "@/hooks/useApplicationFormType";
import { LanguageSwitcher } from "@/components/shared/LanguageSwitcher";
import { getLocalizedUrl, getLocaleFromPathname } from "@/lib/locale-link";
import { type Locale } from "@/i18n/config";
import { t } from "@/i18n/translations";

const getMenuItems = (locale: 'tr' | 'en') => [
  { path: "ulkeler", label: locale === 'en' ? "Countries" : "Ülkeler" },
  { path: "vize-sorgulama", label: locale === 'en' ? "Visa Query" : "Vize Sorgulama", highlight: true },
  { path: "vize-davet-mektubu-olustur", label: locale === 'en' ? "Invitation Letter" : "Davet Mektubu", highlight: true },
  { path: "vize-dilekcesi-olustur", label: locale === 'en' ? "Cover Letter" : "Vize Dilekçesi", highlight: true },
  { path: "kurumsal-vize-danismanligi", label: locale === 'en' ? "Corporate Visa Consultancy" : "Kurumsal Vize Danışmanlığı" },
  { path: "blog", label: "Blog" },
  { path: "danismanlar", label: locale === 'en' ? "Consultants" : "Danışmanlar" },
  { path: "hakkimizda", label: locale === 'en' ? "About Us" : "Hakkımızda" },
  { path: "affiliate", label: locale === 'en' ? "Become a Partner" : "Partner Ol" },
  { path: "iletisim", label: locale === 'en' ? "Contact" : "İletişim" },
];

// Helper function to generate bilateral visa URL
const getBilateralVisaUrl = (sourceSlug: string, destSlug: string, locale: string) => {
  let bilateralSlug: string;
  
  if (locale === 'en') {
    // English: source-to-destination-visa
    bilateralSlug = `${sourceSlug}-to-${destSlug}-visa`;
  } else {
    // Turkish SEO: source-vatandaslari-destination-vizesi
    bilateralSlug = `${sourceSlug}-vatandaslari-${destSlug}-vizesi`;
  }
  
  return locale === 'en' ? `/en/${bilateralSlug}` : `/${bilateralSlug}`;
};

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const locale = getLocaleFromPathname(pathname);
  const formType = useApplicationFormType();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sourceQuery, setSourceQuery] = useState(""); // Kaynak ülke arama
  const [sourceCountryCode, setSourceCountryCode] = useState("TUR"); // Seçili kaynak ülke kodu
  const [sourceCountryName, setSourceCountryName] = useState("Türkiye"); // Seçili kaynak ülke adı
  const [sourceCountrySlug, setSourceCountrySlug] = useState("turkiye"); // Seçili kaynak ülke slug
  const [countries, setCountries] = useState<any[]>([]);
  const [filteredSourceCountries, setFilteredSourceCountries] = useState<any[]>([]); // Kaynak ülke sonuçları
  const [filteredDestCountries, setFilteredDestCountries] = useState<any[]>([]); // Hedef ülke sonuçları
  const [sourceSearchOpen, setSourceSearchOpen] = useState(false);
  const [destSearchOpen, setDestSearchOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isUserAdmin, setIsUserAdmin] = useState(false);
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
    
    // Load source country from localStorage or set based on locale
    const savedSourceCountry = localStorage.getItem('sourceCountryCode');
    const savedSourceName = localStorage.getItem('sourceCountryName');
    const savedSourceSlug = localStorage.getItem('sourceCountrySlug');
    
    if (savedSourceCountry && savedSourceName && savedSourceSlug) {
      setSourceCountryCode(savedSourceCountry);
      setSourceCountryName(savedSourceName);
      setSourceCountrySlug(savedSourceSlug);
    } else if (locale === 'tr') {
      // Türkçe dil için varsayılan Türkiye
      setSourceCountryCode('TUR');
      setSourceCountryName('Türkiye');
      setSourceCountrySlug('turkiye');
      localStorage.setItem('sourceCountryCode', 'TUR');
      localStorage.setItem('sourceCountryName', 'Türkiye');
      localStorage.setItem('sourceCountrySlug', 'turkiye');
    }
    // İngilizce için varsayılan yok, kullanıcı seçmeli
  }, []);

  // Update source country name and slug when locale changes
  useEffect(() => {
    if (!sourceCountryCode || !countries.length) return;
    
    const country = countries.find(c => c.country_code === sourceCountryCode);
    if (country) {
      const displayName = locale === 'en' ? (country.name_en || country.name) : country.name;
      // Generate slug from display name
      const slugify = (text: string) => 
        text.toLowerCase()
          .replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's')
          .replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ç/g, 'c')
          .replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').trim();
      
      const newSlug = slugify(displayName);
      setSourceCountryName(displayName);
      setSourceCountrySlug(newSlug);
      localStorage.setItem('sourceCountryName', displayName);
      localStorage.setItem('sourceCountrySlug', newSlug);
    }
  }, [locale, sourceCountryCode, countries]);

  useEffect(() => {
    getCurrentUser().then(async (userData) => {
      setUser(userData);
      if (userData) {
        const adminStatus = await isAdmin();
        setIsUserAdmin(adminStatus);
      }
    });
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
        setSourceSearchOpen(false);
        setDestSearchOpen(false);
      }
    };

    if (sourceSearchOpen || destSearchOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [sourceSearchOpen, destSearchOpen]);

  // Filter source countries
  useEffect(() => {
    if (sourceQuery.trim()) {
      const query = sourceQuery.toLocaleLowerCase('tr');
      const allCountries = countries.filter(c => c.source_country_code === 'TUR');
      const uniqueCountries = Array.from(new Set(allCountries.map(c => c.country_code)))
        .map(code => allCountries.find(c => c.country_code === code))
        .filter(c => c && (c.name.toLocaleLowerCase('tr').includes(query) || 
                          (c.slug && c.slug.toLocaleLowerCase('tr').includes(query))))
        .slice(0, 5);
      setFilteredSourceCountries(uniqueCountries);
    } else {
      setFilteredSourceCountries([]);
    }
  }, [sourceQuery, countries]);

  // Filter destination countries
  useEffect(() => {
    if (searchQuery.trim()) {
      const query = searchQuery.toLocaleLowerCase('tr');
      // Get unique countries (regardless of source_country_code)
      const uniqueCountries = Array.from(new Set(countries.map(c => c.country_code)))
        .map(code => countries.find(c => c.country_code === code))
        .filter(c => c && (c.name.toLocaleLowerCase('tr').includes(query) ||
          (c.slug && c.slug.toLocaleLowerCase('tr').includes(query))));
      
      const filtered = uniqueCountries
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
      setFilteredDestCountries(filtered.slice(0, 5));
    } else {
      setFilteredDestCountries([]);
    }
  }, [searchQuery, countries, sourceCountryCode]);

  const handleSignOut = async () => {
    await signOut();
    setUser(null);
    router.push("/");
    router.refresh();
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
                {!isUserAdmin && (
                  <a href="/hesabim" className="flex items-center gap-1 text-slate-700 hover:text-primary">
                    <User className="h-3 w-3" />
                    Hesabım
                  </a>
                )}
                {isUserAdmin && (
                  <a href="/admin" className="flex items-center gap-1 text-slate-700 hover:text-primary">
                    <User className="h-3 w-3" />
                    {t(locale as Locale, "adminPanel")}
                  </a>
                )}
                <button
                  onClick={async () => {
                    await signOut();
                    setUser(null);
                    setIsUserAdmin(false);
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

        {/* Search Bar - Split into From and To */}
        <div className="search-container relative flex-1 max-w-2xl">
          <div className="grid grid-cols-[1fr_1.5fr] gap-2">
            {/* From (Source Country) */}
            <div className="relative">
              <label className="mb-1 block text-xs font-semibold text-slate-600">
                {locale === 'en' ? 'From:' : 'Nereden:'}
              </label>
              <div className="relative">
                <div className="relative">
                  <input
                    type="text"
                    placeholder={locale === 'en' ? 'Select country...' : 'Ülke seçin...'}
                    value={sourceQuery || sourceCountryName}
                    onChange={(e) => {
                      setSourceQuery(e.target.value);
                      if (e.target.value !== sourceCountryName) {
                        setSourceCountryName('');
                      }
                    }}
                    onFocus={() => {
                      setSourceSearchOpen(true);
                      if (sourceCountryName && !sourceQuery) {
                        setSourceQuery('');
                      }
                    }}
                    onBlur={() => setTimeout(() => setSourceSearchOpen(false), 200)}
                    className="w-full rounded-lg border-2 border-slate-300 bg-white py-2 pl-3 pr-8 text-sm font-medium placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                  {sourceCountryName && !sourceQuery && (
                    <div className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-green-600">
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Source Country Dropdown */}
              {sourceSearchOpen && filteredSourceCountries.length > 0 && (
                <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-60 overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-xl">
                  {filteredSourceCountries.map((country: any) => {
                    const displayName = locale === 'en' ? (country.name_en || country.name) : country.name;
                    // Generate slug from display name for locale-appropriate URLs
                    const slugify = (text: string) => 
                      text.toLowerCase()
                        .replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's')
                        .replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ç/g, 'c')
                        .replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').trim();
                    const newSlug = slugify(displayName);
                    
                    return (
                    <button
                      key={country.id}
                      type="button"
                      onClick={() => {
                        setSourceCountryCode(country.country_code);
                        setSourceCountryName(displayName);
                        setSourceCountrySlug(newSlug);
                        setSourceQuery('');
                        setSourceSearchOpen(false);
                        localStorage.setItem('sourceCountryCode', country.country_code);
                        localStorage.setItem('sourceCountryName', displayName);
                        localStorage.setItem('sourceCountrySlug', newSlug);
                        setSearchQuery('');
                      }}
                      className="flex w-full items-center gap-3 border-b border-slate-100 px-4 py-2 text-left hover:bg-slate-50 last:border-0"
                    >
                      <div className="text-sm font-medium text-slate-900">{displayName}</div>
                    </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* To (Destination Country) */}
            <div className="relative">
              <label className="mb-1 block text-xs font-semibold text-primary">
                {locale === 'en' ? 'To:' : 'Nereye:'}
              </label>
              <div className="relative">
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
                    setDestSearchOpen(true);
                    setIsFocused(true);
                  }}
                  onBlur={() => {
                    setTimeout(() => {
                      setDestSearchOpen(false);
                      setIsFocused(false);
                    }, 200);
                  }}
                  className="w-full rounded-lg border-2 border-primary/40 bg-white py-2 pl-10 pr-3 text-sm font-medium placeholder:text-slate-600 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary" />
              </div>
              
              {/* Destination Country Dropdown */}
              {destSearchOpen && (
                <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-96 overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-xl">
              {/* Popular Countries - Show when no search */}
              {!searchQuery && (
                <>
                  <div className="border-b border-slate-200 bg-gradient-to-r from-primary/10 to-blue-50 px-4 py-2">
                    <h3 className="text-xs font-semibold text-primary">⭐ {t(locale as Locale, "popularCountries")}</h3>
                  </div>
                  {Array.from(new Set(countries.map(c => c.country_code)))
                    .map(code => countries.find(c => c.country_code === code))
                    .filter((c: any) => c && ['Amerika', 'İngiltere', 'Kanada', 'Almanya', 'Fransa', 'İtalya'].includes(c.name))
                    .slice(0, 6)
                    .map((country: any) => {
                      const displayName = locale === 'en' ? (country.name_en || country.name) : country.name;
                      // Generate slug from display name for locale-appropriate URLs
                      const slugify = (text: string) => 
                        text.toLowerCase()
                          .replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's')
                          .replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ç/g, 'c')
                          .replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').trim();
                      const destSlug = slugify(displayName);
                      
                      // If source country is not Turkey, create bilateral URL
                      const href = sourceCountryCode !== 'TUR' 
                        ? getBilateralVisaUrl(sourceCountrySlug, destSlug, locale)
                        : getLocalizedUrl(country.slug || getCountrySlug(country.id), locale);
                      
                      return (
                      <Link
                        key={country.id}
                        href={href}
                        onClick={() => {
                          setDestSearchOpen(false);
                          setSearchQuery("");
                        }}
                        prefetch={false}
                        className="flex w-full items-center gap-3 border-b border-slate-100 px-4 py-3 text-left hover:bg-primary/5 last:border-0"
                      >
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                          <Globe2 className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-semibold text-slate-900">{displayName}</div>
                          <div className="text-xs text-slate-500 line-clamp-1">
                            {country.description || `${country.name} vizesi başvurunuz için bizi hemen...`}
                          </div>
                        </div>
                      </Link>
                      );
                    })}
                </>
              )}

              {/* Search Results */}
              {searchQuery && filteredDestCountries.length > 0 && (
                <>
                  <div className="border-b border-slate-200 bg-slate-50 px-4 py-2">
                    <h3 className="text-xs font-semibold text-slate-700">{t(locale as Locale, "searchResults")} ({filteredDestCountries.length})</h3>
                  </div>
                  {filteredDestCountries.map((country) => {
                    const displayName = locale === 'en' ? (country.name_en || country.name) : country.name;
                    // Generate slug from display name for locale-appropriate URLs
                    const slugify = (text: string) => 
                      text.toLowerCase()
                        .replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's')
                        .replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ç/g, 'c')
                        .replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').trim();
                    const destSlug = slugify(displayName);
                    
                    // If source country is not Turkey, create bilateral URL
                    const href = sourceCountryCode !== 'TUR' 
                      ? getBilateralVisaUrl(sourceCountrySlug, destSlug, locale)
                      : getLocalizedUrl(country.slug || getCountrySlug(country.id), locale);
                    
                    return (
                    <Link
                      key={country.id}
                      href={href}
                      onClick={() => {
                        setDestSearchOpen(false);
                        setSearchQuery("");
                      }}
                      prefetch={false}
                      className="flex w-full items-center gap-3 border-b border-slate-100 px-4 py-3 text-left hover:bg-slate-50 last:border-0"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                        <Globe2 className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-semibold text-slate-900">{displayName}</div>
                        <div className="text-xs text-slate-500 line-clamp-1">
                          {country.description || `${country.name} vizesi başvurunuz için bizi hemen...`}
                        </div>
                      </div>
                      <Search className="h-4 w-4 text-slate-400" />
                    </Link>
                    );
                  })}
                </>
              )}

              {/* No Results */}
              {searchQuery && filteredDestCountries.length === 0 && (
                <div className="px-4 py-8 text-center">
                  <p className="text-sm text-slate-500">{t(locale as Locale, "noResults")}</p>
                </div>
              )}
                </div>
              )}
            </div>
          </div>
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
                    className={`block border-b border-slate-100 px-4 py-3 text-sm last:border-0 ${
                      item.highlight 
                        ? "bg-gradient-to-r from-primary/5 to-blue-50 font-semibold text-primary hover:from-primary/10 hover:to-blue-100" 
                        : "text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    {item.highlight && "✨ "}{item.label}
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

            <a
              href={getApplicationFormLink(formType).href}
              target={getApplicationFormLink(formType).target}
              rel={formType === 'standalone' ? 'noopener noreferrer' : undefined}
              className="btn-primary text-sm"
            >
              {t(locale as Locale, "applyNow")}
            </a>
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
                className={`border-b border-slate-100 py-3 text-sm last:border-0 ${
                  item.highlight 
                    ? "font-semibold text-primary" 
                    : "text-slate-700 hover:text-primary"
                }`}
              >
                {item.highlight && "✨ "}{item.label}
              </Link>
            ))}
            
            {/* Language Switcher in Mobile Menu */}
            <div className="border-b border-slate-100 py-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-700">Dil / Language</span>
                <LanguageSwitcher />
              </div>
            </div>

            <a
              href={getApplicationFormLink(formType).href}
              target={getApplicationFormLink(formType).target}
              rel={formType === 'standalone' ? 'noopener noreferrer' : undefined}
              onClick={() => setMenuOpen(false)}
              className="mt-3 inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white"
            >
              Hemen Başvur
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}
