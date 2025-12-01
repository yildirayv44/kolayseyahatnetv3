"use client";

import { useState, useEffect } from "react";
import { X, Search } from "lucide-react";

export function SearchTooltip() {
  const [show, setShow] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Check if user has dismissed before
    const isDismissed = localStorage.getItem("searchTooltipDismissed");
    if (isDismissed) {
      setDismissed(true);
      return;
    }

    // Show tooltip after 2 seconds
    const timer = setTimeout(() => {
      setShow(true);
    }, 2000);

    // Auto-hide after 10 seconds
    const autoHide = setTimeout(() => {
      setShow(false);
    }, 12000);

    return () => {
      clearTimeout(timer);
      clearTimeout(autoHide);
    };
  }, []);

  const handleDismiss = () => {
    setShow(false);
    setDismissed(true);
    localStorage.setItem("searchTooltipDismissed", "true");
  };

  if (dismissed || !show) return null;

  return (
    <div className="fixed left-1/2 top-20 z-50 -translate-x-1/2 animate-bounce md:top-24">
      <div className="relative rounded-2xl border-2 border-primary bg-gradient-to-r from-primary to-blue-600 px-6 py-4 shadow-2xl">
        {/* Close Button */}
        <button
          onClick={handleDismiss}
          className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-white text-slate-600 shadow-lg hover:bg-slate-100"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Content */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
            <Search className="h-5 w-5 text-white" />
          </div>
          <div className="text-white">
            <div className="text-sm font-bold">Hangi ülkeye gitmek istiyorsunuz?</div>
            <div className="text-xs opacity-90">Yukarıdaki arama kutusundan ülke seçin 👆</div>
          </div>
        </div>

        {/* Arrow pointing up */}
        <div className="absolute -top-2 left-1/2 h-4 w-4 -translate-x-1/2 rotate-45 border-l-2 border-t-2 border-primary bg-gradient-to-br from-primary to-blue-600"></div>
      </div>
    </div>
  );
}
