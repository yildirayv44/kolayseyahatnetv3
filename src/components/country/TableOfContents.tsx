"use client";

import { useState } from "react";
import { ChevronDown, List } from "lucide-react";
import { t } from "@/i18n/translations";
import type { Locale } from "@/i18n/translations";

interface TOCItem {
  id: string;
  title: string;
  subItems?: Array<{ id: string; title: string }>;
}

interface TableOfContentsProps {
  items: TOCItem[];
  locale?: Locale;
}

export function TableOfContents({ items, locale = "tr" }: TableOfContentsProps) {
  const [isOpen, setIsOpen] = useState(false);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
      setIsOpen(false);
    }
  };

  if (items.length === 0) return null;

  return (
    <div className="rounded-xl border-2 border-slate-200 bg-slate-50">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between p-4 text-left"
      >
        <div className="flex items-center gap-2">
          <List className="h-5 w-5 text-primary" />
          <span className="font-bold text-slate-900">{t(locale, "tableOfContents")}</span>
        </div>
        <ChevronDown
          className={`h-5 w-5 text-slate-400 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>
      <div
        className={`grid transition-all duration-300 ${
          isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className="overflow-hidden">
          <div className="border-t border-slate-200 p-4">
            <ul className="space-y-2">
              {items.map((item, index) => (
                <li key={item.id}>
                  <button
                    onClick={() => scrollToSection(item.id)}
                    className="flex w-full items-start gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-white hover:text-primary"
                  >
                    <span className="font-semibold text-slate-400">
                      {index + 1}.
                    </span>
                    <span className="text-slate-700">{item.title}</span>
                  </button>
                  {item.subItems && item.subItems.length > 0 && (
                    <ul className="ml-8 mt-1 space-y-1">
                      {item.subItems.map((sub, subIndex) => (
                        <li key={sub.id}>
                          <button
                            onClick={() => scrollToSection(sub.id)}
                            className="flex w-full items-start gap-2 rounded px-3 py-1.5 text-left text-xs transition-colors hover:bg-white hover:text-primary"
                          >
                            <span className="text-slate-400">
                              {index + 1}.{subIndex + 1}
                            </span>
                            <span className="text-slate-600">{sub.title}</span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
