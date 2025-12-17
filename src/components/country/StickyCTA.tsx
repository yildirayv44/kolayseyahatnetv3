"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, PhoneCall, X } from "lucide-react";

interface StickyCTAProps {
  countryName: string;
}

export function StickyCTA({ countryName }: StickyCTAProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show after scrolling 500px
      if (window.scrollY > 500 && !isDismissed) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isDismissed]);

  if (isDismissed) return null;

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-50 mb-16 transition-all duration-300 md:mb-0 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 pointer-events-none translate-y-full"
      }`}
      style={{ containIntrinsicSize: "0 80px", contentVisibility: "auto" }}
    >
      <div className="bg-white shadow-2xl border-t-2 border-primary relative">
        <div className="mx-auto max-w-6xl px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            {/* Left: Text */}
            <div className="flex-1">
              <p className="text-sm font-bold text-slate-900">
                {countryName} Vizesi için Hemen Başvurun
              </p>
              <p className="text-xs text-slate-600">
                %98 onay oranı • 7-14 gün süre • Ücretsiz ön değerlendirme
              </p>
            </div>

            {/* Right: Buttons */}
            <div className="flex items-center gap-2">
              <a
                href="tel:02129099971"
                className="hidden items-center gap-2 rounded-lg border-2 border-primary bg-white px-4 py-2 text-sm font-bold text-primary transition-all hover:bg-primary hover:text-white sm:inline-flex"
              >
                <PhoneCall className="h-4 w-4" />
                <span>Ara</span>
              </a>
              <Link
                href="/vize-basvuru-formu"
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-2 text-sm font-bold text-white shadow-lg transition-all hover:bg-primary/90"
              >
                <span>Başvur</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <button
                onClick={() => setIsDismissed(true)}
                className="ml-2 rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                aria-label="Kapat"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
