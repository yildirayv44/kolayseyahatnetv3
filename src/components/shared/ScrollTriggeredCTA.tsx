"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, PhoneCall, Sparkles } from "lucide-react";

interface ScrollTriggeredCTAProps {
  title: string;
  description: string;
  primaryButtonText?: string;
  primaryButtonHref?: string;
  showPhoneButton?: boolean;
  triggerPercentage?: number; // At what scroll % to show (default: 50%)
  locale?: 'tr' | 'en';
}

export function ScrollTriggeredCTA({
  title,
  description,
  primaryButtonText,
  primaryButtonHref = "/vize-basvuru-formu",
  showPhoneButton = true,
  triggerPercentage = 50,
  locale = 'tr',
}: ScrollTriggeredCTAProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [hasShown, setHasShown] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = (scrollTop / docHeight) * 100;

      // Show when user reaches trigger percentage
      if (scrollPercent >= triggerPercentage && !hasShown) {
        setIsVisible(true);
        setHasShown(true);
        
        // Auto-hide after 10 seconds
        setTimeout(() => {
          setIsVisible(false);
        }, 10000);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [triggerPercentage, hasShown]);

  if (!isVisible) return null;

  const defaultPrimaryText = locale === 'en' ? 'Apply Now' : 'Hemen Başvur';

  return (
    <div className="fixed bottom-20 left-4 right-4 z-[55] animate-in slide-in-from-bottom-4 duration-500 md:bottom-4 md:left-auto md:right-8 md:w-96">
      <div className="relative overflow-hidden rounded-2xl border-2 border-primary/20 bg-gradient-to-br from-white via-blue-50/50 to-white p-6 shadow-2xl backdrop-blur-sm">
        {/* Sparkle icon */}
        <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-primary/5" />
        <Sparkles className="absolute right-4 top-4 h-6 w-6 text-primary/40" />
        
        {/* Close button */}
        <button
          onClick={() => setIsVisible(false)}
          className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition-colors hover:bg-slate-200 hover:text-slate-700"
          aria-label={locale === 'en' ? 'Close' : 'Kapat'}
        >
          ×
        </button>

        <div className="relative space-y-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              {title}
            </h3>
            <p className="mt-1 text-sm text-slate-600">
              {description}
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <Link
              href={primaryButtonHref}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-white shadow-lg transition-all hover:bg-primary/90 hover:shadow-xl"
            >
              <span>{primaryButtonText || defaultPrimaryText}</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            
            {showPhoneButton && (
              <a
                href="tel:02129099971"
                className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-primary bg-white px-6 py-3 text-sm font-bold text-primary transition-all hover:bg-primary hover:text-white"
              >
                <PhoneCall className="h-4 w-4" />
                <span>0212 909 99 71</span>
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
