"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Globe2, Heart, BookOpen, Phone } from "lucide-react";
import { useFavorites } from "@/hooks/useFavorites";
import { getLocalizedUrl, getLocaleFromPathname } from "@/lib/locale-link";

export function MobileNav() {
  const pathname = usePathname();
  const locale = getLocaleFromPathname(pathname);
  const { count: favoritesCount, isLoaded } = useFavorites();

  const navItems = [
    { path: "", icon: Home, label: "Ana Sayfa" },
    { path: "ulkeler", icon: Globe2, label: "Ülkeler" },
    { path: "favoriler", icon: Heart, label: "Favoriler", badge: isLoaded ? favoritesCount : undefined },
    { path: "blog", icon: BookOpen, label: "Blog" },
    { path: "iletisim", icon: Phone, label: "İletişim" },
  ];

  // Hide on admin pages
  if (pathname?.startsWith("/admin")) {
    return null;
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-200 bg-white/95 backdrop-blur-sm shadow-lg md:hidden">
      <div className="grid grid-cols-5">
        {navItems.map((item) => {
          const href = getLocalizedUrl(item.path, locale);
          const isActive = pathname === href || (item.path === "" && pathname === "/");
          return (
            <Link
              key={item.path}
              href={href}
              className={`relative flex flex-col items-center gap-1 py-3 text-xs font-medium transition-colors ${
                isActive
                  ? "text-primary"
                  : "text-slate-600 hover:text-primary"
              }`}
            >
              <div className="relative flex items-center justify-center w-6 h-6">
                <item.icon className={`h-5 w-5 ${isActive ? "scale-110" : ""}`} />
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white">
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] leading-tight">{item.label}</span>
              {isActive && (
                <div className="absolute bottom-0 left-1/2 h-0.5 w-8 -translate-x-1/2 rounded-full bg-primary" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
