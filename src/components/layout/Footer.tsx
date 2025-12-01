"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { getLocalizedUrl, getLocaleFromPathname } from "@/lib/locale-link";

export function Footer() {
  const year = new Date().getFullYear();
  const pathname = usePathname();
  const locale = getLocaleFromPathname(pathname);

  return (
    <footer className="border-t border-slate-200 bg-slate-50 mt-10">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-10 md:flex-row md:justify-between">
        <div className="space-y-3 max-w-sm">
          <h3 className="text-lg font-semibold text-slate-900">Kolay Seyahat</h3>
          <p className="text-sm text-slate-600">
            Türkiye merkezli profesyonel vize danışmanlık hizmeti. Amerika, İngiltere,
            Schengen ve daha birçok ülke için başvuru sürecinizi kolaylaştırıyoruz.
          </p>
        </div>

        <div className="grid flex-1 grid-cols-2 gap-8 text-sm md:grid-cols-4">
          <div>
            <h4 className="mb-3 font-semibold text-slate-900">Hakkımızda</h4>
            <ul className="space-y-2 text-slate-600">
              <li>
                <Link href={getLocalizedUrl("hakkimizda", locale)} className="hover:text-primary">
                  Hakkımızda
                </Link>
              </li>
              <li>
                <Link href={getLocalizedUrl("kurumsal-vize-danismanligi", locale)} className="hover:text-primary">
                  Kurumsal Vize Danışmanlığı
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-3 font-semibold text-slate-900">Kurumsal</h4>
            <ul className="space-y-2 text-slate-600">
              <li>
                <Link href={getLocalizedUrl("iletisim", locale)} className="hover:text-primary">
                  İletişim
                </Link>
              </li>
              <li>
                <Link href={getLocalizedUrl("danisman", locale)} className="hover:text-primary">
                  Danışmanlar
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-3 font-semibold text-slate-900">İletişim</h4>
            <ul className="space-y-2 text-slate-600 text-sm">
              <li>Telefon: 0212 909 99 71</li>
              <li>E-posta: vize@kolayseyahat.net</li>
              <li>İstanbul, Türkiye</li>
            </ul>
          </div>

          <div>
            <h4 className="mb-3 font-semibold text-slate-900">Sosyal Medya</h4>
            <ul className="space-y-2 text-slate-600">
              <li>
                <a href="#" className="hover:text-primary">
                  Instagram
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary">
                  Facebook
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-200 bg-slate-50 py-4">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 text-xs text-slate-500">
          <span>© {year} Kolay Seyahat. Tüm hakları saklıdır.</span>
          <span>Vize işlemlerinizde profesyonel destek.</span>
        </div>
      </div>
    </footer>
  );
}
