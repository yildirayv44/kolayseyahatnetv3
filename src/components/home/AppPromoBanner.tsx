"use client";

import { useState, useEffect } from "react";
import { X, Smartphone, Bell, Zap, Download } from "lucide-react";

interface AppPromoBannerProps {
  locale?: 'tr' | 'en';
}

export function AppPromoBanner({ locale = 'tr' }: AppPromoBannerProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Check if user already dismissed the banner
    const dismissed = localStorage.getItem('app-promo-dismissed');
    if (dismissed) {
      const dismissedDate = new Date(dismissed);
      const now = new Date();
      const daysDiff = (now.getTime() - dismissedDate.getTime()) / (1000 * 60 * 60 * 24);
      
      // Show again after 7 days
      if (daysDiff < 7) {
        setIsDismissed(true);
        return;
      }
    }

    // Don't show on iOS devices that already have the app
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    
    if (isStandalone) {
      setIsDismissed(true);
      return;
    }

    // Show banner after 2 seconds
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem('app-promo-dismissed', new Date().toISOString());
  };

  const handleDownload = () => {
    window.open('https://apps.apple.com/tr/app/kolay-seyahat/id6756451040', '_blank');
  };

  if (isDismissed || !isVisible) return null;

  const content = {
    tr: {
      title: "Kolay Seyahat Uygulaması",
      subtitle: "Vize işlemlerinizi artık cebinizden takip edin!",
      features: [
        { icon: Bell, text: "Anlık bildirimler" },
        { icon: Zap, text: "Hızlı başvuru" },
        { icon: Smartphone, text: "Offline erişim" },
      ],
      cta: "Ücretsiz İndir",
      dismiss: "Daha sonra",
    },
    en: {
      title: "Kolay Seyahat App",
      subtitle: "Track your visa applications from your pocket!",
      features: [
        { icon: Bell, text: "Instant notifications" },
        { icon: Zap, text: "Quick application" },
        { icon: Smartphone, text: "Offline access" },
      ],
      cta: "Download Free",
      dismiss: "Maybe later",
    },
  };

  const t = content[locale];

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white shadow-xl mb-8">
      {/* Background decoration */}
      <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10" />
      <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-white/5" />
      
      {/* Close button */}
      <button
        onClick={handleDismiss}
        className="absolute right-3 top-3 rounded-full p-1 hover:bg-white/20 transition-colors"
        aria-label="Kapat"
      >
        <X className="h-5 w-5" />
      </button>

      <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        {/* Content */}
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur">
              <Smartphone className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold">{t.title}</h3>
              <p className="text-sm text-blue-100">{t.subtitle}</p>
            </div>
          </div>

          {/* Features */}
          <div className="flex flex-wrap gap-4 mt-4">
            {t.features.map((feature, index) => (
              <div key={index} className="flex items-center gap-2 text-sm text-blue-100">
                <feature.icon className="h-4 w-4" />
                <span>{feature.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleDownload}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3 font-semibold text-blue-600 shadow-lg hover:bg-blue-50 transition-colors"
          >
            <Download className="h-5 w-5" />
            {t.cta}
          </button>
          <button
            onClick={handleDismiss}
            className="text-sm text-blue-200 hover:text-white transition-colors underline underline-offset-2"
          >
            {t.dismiss}
          </button>
        </div>
      </div>

      {/* App Store badge */}
      <div className="mt-4 flex items-center gap-2 text-xs text-blue-200">
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
        </svg>
        <span>App Store{locale === 'tr' ? "'da mevcut" : " available"}</span>
      </div>
    </div>
  );
}
