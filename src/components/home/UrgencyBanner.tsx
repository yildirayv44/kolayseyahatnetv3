"use client";

import { useState, useEffect } from "react";
import { TrendingUp, Users, Clock, Zap, X } from "lucide-react";

export function UrgencyBanner() {
  const [isVisible, setIsVisible] = useState(true);
  const [currentStat, setCurrentStat] = useState(0);

  // Rotasyon için stats
  const stats = [
    {
      icon: Users,
      text: "Son 24 saatte 47 kişi başvuru yaptı!",
      color: "bg-blue-50 text-blue-700 border-blue-200",
    },
    {
      icon: Clock,
      text: "Bu ay için sadece 12 kontenjan kaldı!",
      color: "bg-orange-50 text-orange-700 border-orange-200",
    },
    {
      icon: Zap,
      text: "Bugün başvuranlar %15 indirim kazanıyor!",
      color: "bg-emerald-50 text-emerald-700 border-emerald-200",
    },
    {
      icon: TrendingUp,
      text: "Bu hafta 127 başarılı vize onayı aldık!",
      color: "bg-purple-50 text-purple-700 border-purple-200",
    },
  ];

  // Her 5 saniyede bir değiştir
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStat((prev) => (prev + 1) % stats.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [stats.length]);

  // LocalStorage'dan kapatma durumunu kontrol et
  useEffect(() => {
    const isClosed = localStorage.getItem("urgency-banner-closed");
    if (isClosed === "true") {
      setIsVisible(false);
    }
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    localStorage.setItem("urgency-banner-closed", "true");
    // 24 saat sonra tekrar göster
    setTimeout(() => {
      localStorage.removeItem("urgency-banner-closed");
    }, 24 * 60 * 60 * 1000);
  };

  if (!isVisible) return null;

  const current = stats[currentStat];
  const Icon = current.icon;

  return (
    <div className={`relative overflow-hidden border-b ${current.color} transition-colors duration-500`}>
      <div className="mx-auto max-w-6xl px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/50">
              <Icon className="h-4 w-4" />
            </div>
            <p className="text-sm font-semibold">
              {current.text}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="flex h-6 w-6 items-center justify-center rounded-full hover:bg-white/50 transition-colors"
            aria-label="Kapat"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Animasyon efekti */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
    </div>
  );
}
