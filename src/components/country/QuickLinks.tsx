"use client";

import { Package, MessageCircleQuestion, FileQuestion } from "lucide-react";

export function QuickLinks() {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 80; // Header height
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  };

  return (
    <section className="sticky top-20 z-10 -mx-4 bg-white/95 backdrop-blur-sm border-y border-slate-200 px-4 py-4 shadow-sm md:mx-0 md:rounded-xl md:border">
      <div className="flex items-center justify-center gap-3 overflow-x-auto md:gap-6">
        <button
          onClick={() => scrollToSection("vize-paketleri")}
          className="group flex shrink-0 items-center gap-2 rounded-lg border-2 border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition-all hover:border-primary hover:bg-primary hover:text-white"
        >
          <Package className="h-4 w-4" />
          <span>Vize Paketleri</span>
        </button>
        <button
          onClick={() => scrollToSection("sss")}
          className="group flex shrink-0 items-center gap-2 rounded-lg border-2 border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition-all hover:border-primary hover:bg-primary hover:text-white"
        >
          <MessageCircleQuestion className="h-4 w-4" />
          <span>Sık Sorulan Sorular</span>
        </button>
        <button
          onClick={() => scrollToSection("soru-sor")}
          className="group flex shrink-0 items-center gap-2 rounded-lg border-2 border-primary bg-primary px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-primary/90"
        >
          <FileQuestion className="h-4 w-4" />
          <span>Soru Sor</span>
        </button>
      </div>
    </section>
  );
}
