"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export function PageLoadingBar() {
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Start loading animation
    setLoading(true);
    setProgress(20);

    // Simulate progress
    const timer1 = setTimeout(() => setProgress(40), 100);
    const timer2 = setTimeout(() => setProgress(60), 300);
    const timer3 = setTimeout(() => setProgress(80), 500);
    const timer4 = setTimeout(() => {
      setProgress(100);
      setTimeout(() => setLoading(false), 200);
    }, 800);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, [pathname]);

  if (!loading) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] h-1 bg-slate-200">
      <div
        className="h-full bg-gradient-to-r from-primary via-primary-dark to-primary transition-all duration-300 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
