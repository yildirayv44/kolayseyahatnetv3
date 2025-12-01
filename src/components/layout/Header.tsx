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

const menuItems = [
  { path: "kurumsal-vize-danismanligi", label: "Kurumsal Vize Danışmanlığı" },
  { path: "blog", label: "Blog" },
  { path: "danisman", label: "Danışmanlar" },
  { path: "hakkimizda", label: "Hakkımızda" },
  { path: "iletisim", label: "İletişim" },
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
  const { count: favoritesCount } = useFavorites();

  useEffect(() => {
    getCurrentUser().then(setUser);
  }, []);

  useEffect(() => {
    getCountries().then(setCountries);
  }, []);

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
      const filtered = countries.filter((c) =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredCountries(filtered.slice(0, 5));
    } else {
      setFilteredCountries([]);
    }
  }, [searchQuery, countries]);

  const handleCountrySelect = (countryId: number) => {
    router.push(getLocalizedUrl(getCountrySlug(countryId), locale));
    setSearchOpen(false);
    setSearchQuery("");
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
                  Admin Panel
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
                  Çıkış
                </button>
              </>
            ) : (
              <>
                <Link href={getLocalizedUrl("giris", locale)} className="flex items-center gap-1 text-slate-700 hover:text-primary">
                  <LogIn className="h-3 w-3" />
                  Giriş Yap
                </Link>
                <Link href={getLocalizedUrl("kayit", locale)} className="flex items-center gap-1 text-slate-700 hover:text-primary">
                  <UserPlus className="h-3 w-3" />
                  Kayıt Ol
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-2 px-4 py-4 md:gap-4">
        <Link href={getLocalizedUrl("", locale)} className="shrink-0 text-xl font-bold text-slate-800 md:text-2xl">
          KolaySeyahat
        </Link>

        {/* Search Bar */}
        <div className="search-container relative flex-1 max-w-md">
          <div className="relative">
            {/* Pulse Animation Ring */}
            <div className="absolute -inset-1 rounded-lg bg-primary/20 opacity-75 blur-sm animate-pulse pointer-events-none"></div>
            
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 z-10" />
            <input
              type="text"
              placeholder="Ülke ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setSearchOpen(true)}
              className="relative z-10 w-full rounded-lg border-2 border-primary/30 bg-white py-2 pl-10 pr-2 text-xs focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 md:pr-4 md:text-sm"
            />
          </div>

          {searchOpen && (
            <div className="absolute left-0 right-0 top-full z-50 mt-2 max-h-96 overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-xl">
              {/* Popular Countries - Show when no search */}
              {!searchQuery && (
                <>
                  <div className="border-b border-slate-200 bg-gradient-to-r from-primary/10 to-blue-50 px-4 py-2">
                    <h3 className="text-xs font-semibold text-primary">⭐ Popüler Ülkeler</h3>
                  </div>
                  {countries
                    .filter((c: any) => ['Amerika', 'İngiltere', 'Kanada', 'Almanya', 'Fransa', 'İtalya'].includes(c.name))
                    .slice(0, 6)
                    .map((country: any) => (
                      <button
                        key={country.id}
                        onClick={() => handleCountrySelect(country.id)}
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
                    <h3 className="text-xs font-semibold text-slate-700">Arama Sonuçları ({filteredCountries.length})</h3>
                  </div>
                  {filteredCountries.map((country) => (
                    <button
                      key={country.id}
                      onClick={() => handleCountrySelect(country.id)}
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
                  <p className="text-sm text-slate-500">Sonuç bulunamadı</p>
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
              Menü
              <ChevronDown className="h-4 w-4" />
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-full mt-2 w-56 rounded-lg border border-slate-200 bg-white shadow-lg">
                {menuItems.map((item) => (
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
              Hemen Başvur
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
            {menuItems.map((item) => (
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
    </header>
  );
}
