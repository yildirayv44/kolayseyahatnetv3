"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getLocalizedUrl } from "@/lib/locale-link";
import { t } from "@/i18n/translations";
import type { Locale } from "@/i18n/translations";

interface FooterProps {
  locale?: Locale;
}

export function Footer({ locale = "tr" }: FooterProps) {
  const [year, setYear] = useState(2026); // Default year to avoid hydration mismatch
  
  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);

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
            <h4 className="mb-3 font-semibold text-slate-900">{t(locale, "quickLinks")}</h4>
            <ul className="space-y-2 text-slate-600">
              <li>
                <Link href={getLocalizedUrl("neden-biz", locale)} className="hover:text-primary">
                  Neden Biz
                </Link>
              </li>
              <li>
                <Link href={getLocalizedUrl("duyurular", locale)} className="hover:text-primary">
                  Duyurular
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
            <h4 className="mb-3 font-semibold text-slate-900">{t(locale, "contact")}</h4>
            <ul className="space-y-2 text-slate-600 text-sm">
              <li>0212 909 99 71</li>
            </ul>
          </div>

          <div>
            <h4 className="mb-3 font-semibold text-slate-900">{t(locale, "followUs")}</h4>
            <ul className="space-y-2 text-slate-600">
              <li>
                <a href="https://www.instagram.com/kolayseyahattr/" target="_blank" rel="noopener noreferrer" className="hover:text-primary">
                  Instagram
                </a>
              </li>
              <li>
                <a href="https://www.linkedin.com/company/kolay-seyahat/" target="_blank" rel="noopener noreferrer" className="hover:text-primary">
                  LinkedIn
                </a>
              </li>
            </ul>
            
            {/* Mobile App Download */}
            <div className="mt-4 pt-4 border-t border-slate-200">
              <h4 className="mb-2 font-semibold text-slate-900 text-xs">
                {locale === 'en' ? 'Mobile App' : 'Mobil Uygulama'}
              </h4>
              <a 
                href="https://apps.apple.com/tr/app/kolay-seyahat/id6756451040"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-black text-white px-3 py-2 rounded-lg hover:bg-gray-800 transition-colors"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                </svg>
                <span className="text-xs font-medium">App Store</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-200 bg-slate-50 py-6">
        <div className="mx-auto max-w-6xl px-4">
          {/* Payment Logos and Security Info */}
          <div className="mb-6 flex flex-col items-center gap-4">
            <div className="flex items-center gap-6 flex-wrap justify-center">
              <img 
                src="/images/visa-mastercard.svg" 
                alt="Visa ve Mastercard ile Güvenli Ödeme" 
                className="h-12 md:h-14"
              />
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <span className="font-medium">256-bit SSL Güvenli Bağlantı</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span className="font-medium">3D Secure Ödeme</span>
              </div>
            </div>
            <p className="text-xs text-slate-500 text-center max-w-2xl">
              Tüm ödemeleriniz 256-bit SSL sertifikası ile şifrelenir ve 3D Secure teknolojisi ile korunur. 
              Kredi kartı bilgileriniz güvenle işlenir ve saklanmaz.
            </p>
          </div>

          {/* TÜRSAB Info */}
          <div className="mb-6 border-t border-slate-200 pt-4">
            <div className="text-center text-xs text-slate-600 space-y-1">
              <p className="font-semibold text-slate-700">TÜRSAB Üyesi Seyahat Acentası</p>
              <p>ACENTA / AGENCY: <span className="font-medium">TAMZARA TURİZM</span></p>
              <p>BELGE NO / LICENCE NR: <span className="font-medium">1758</span></p>
              <p className="text-slate-500 italic">Kolay Seyahat&apos;in turizm hizmetleri Tamzara Turizm tarafından sağlanmaktadır.</p>
            </div>
          </div>

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
            <span>© {year} Kolay Seyahat. {t(locale, "allRightsReserved")}</span>
            <span>Vize işlemlerinizde profesyonel destek.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
