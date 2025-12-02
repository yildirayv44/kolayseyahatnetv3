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
            <h4 className="mb-3 font-semibold text-slate-900">Hızlı Linkler</h4>
            <ul className="space-y-2 text-slate-600">
              <li>
                <Link href={getLocalizedUrl("neden-biz", locale)} className="hover:text-primary">
                  Neden Biz
                </Link>
              </li>
              <li>
                <Link href={getLocalizedUrl("sikca-sorulan-sorular", locale)} className="hover:text-primary">
                  Sıkça Sorulan Sorular
                </Link>
              </li>
              <li>
                <Link href={getLocalizedUrl("sikayet-ve-oneri", locale)} className="hover:text-primary">
                  Şikayet ve Öneri
                </Link>
              </li>
              <li>
                <Link href={getLocalizedUrl("ucret-politikamiz", locale)} className="hover:text-primary">
                  Ücret Politikamız
                </Link>
              </li>
              <li>
                <Link href={getLocalizedUrl("kosullar-ve-isleyis", locale)} className="hover:text-primary">
                  Koşullar ve İşleyiş
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
                <Link href={getLocalizedUrl("danismanlar", locale)} className="hover:text-primary">
                  Danışmanlar
                </Link>
              </li>
              <li>
                <Link href={getLocalizedUrl("affiliate", locale)} className="hover:text-primary">
                  Affiliate Program
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
        <div className="mx-auto max-w-6xl px-4">
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs text-slate-500 mb-3">
            <Link href={getLocalizedUrl("kvkk", locale)} className="hover:text-primary">
              KVKK
            </Link>
            <span>•</span>
            <Link href={getLocalizedUrl("bilgi-gizliligi", locale)} className="hover:text-primary">
              Bilgi Gizliliği
            </Link>
            <span>•</span>
            <Link href={getLocalizedUrl("mesafeli-satis-sozlesmesi", locale)} className="hover:text-primary">
              Mesafeli Satış Sözleşmesi
            </Link>
            <span>•</span>
            <Link href={getLocalizedUrl("yasal-sorumluluk-reddi", locale)} className="hover:text-primary">
              Yasal Sorumluluk Reddi
            </Link>
          </div>
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>© {year} Kolay Seyahat. Tüm hakları saklıdır.</span>
            <span>Vize işlemlerinizde profesyonel destek.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
