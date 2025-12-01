"use client";

import Link from "next/link";
import { ArrowRight, ChevronDown } from "lucide-react";
import { useState } from "react";
import { getMenuSlug } from "@/lib/helpers";

interface Menu {
  id: number;
  name: string;
  description: string;
  url?: string;
  slug?: string;
  parent_id?: number;
}

interface RelatedPagesProps {
  menus: Menu[];
}

export function RelatedPages({ menus }: RelatedPagesProps) {
  // Kategorilere göre grupla
  const categories = menus.filter((m) => !m.parent_id || m.parent_id === 0);
  const subPages = menus.filter((m) => m.parent_id && m.parent_id > 0);

  const getSubPages = (categoryId: number) =>
    subPages.filter((s) => s.parent_id === categoryId);

  if (menus.length === 0) return null;

  // Eğer sadece alt sayfalar varsa (kategori yok)
  if (categories.length === 0) {
    return (
      <section id="vize-turleri" className="scroll-mt-20">
        <div className="rounded-xl border-2 border-slate-200 bg-slate-50 p-6">
          <h2 className="mb-4 text-xl font-bold text-slate-900">
            İlişkili Sayfalar
          </h2>
          <div className="space-y-2">
            {menus.map((menu) => (
              <Link
                key={menu.id}
                href={getMenuSlug(menu)}
                className="group flex items-center justify-between rounded-lg border border-slate-200 bg-white px-4 py-3 transition-all hover:border-primary hover:bg-primary/5"
              >
                <span className="text-sm font-semibold text-slate-900 group-hover:text-primary">
                  {menu.name}
                </span>
                <ArrowRight className="h-4 w-4 text-slate-400 transition-all group-hover:translate-x-1 group-hover:text-primary" />
              </Link>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Kategori + alt sayfa yapısı
  return (
    <section id="vize-turleri" className="scroll-mt-20">
      <div className="rounded-xl border-2 border-slate-200 bg-slate-50 p-6">
        <h2 className="mb-4 text-xl font-bold text-slate-900">
          İlişkili Sayfalar
        </h2>
        <div className="space-y-3">
          {categories.map((category) => {
            const subs = getSubPages(category.id);
            
            if (subs.length === 0) {
              // Kategori ama alt sayfa yok - direkt link
              return (
                <Link
                  key={category.id}
                  href={getMenuSlug(category)}
                  className="group flex items-center justify-between rounded-lg border border-slate-200 bg-white px-4 py-3 transition-all hover:border-primary hover:bg-primary/5"
                >
                  <span className="text-sm font-semibold text-slate-900 group-hover:text-primary">
                    {category.name}
                  </span>
                  <ArrowRight className="h-4 w-4 text-slate-400 transition-all group-hover:translate-x-1 group-hover:text-primary" />
                </Link>
              );
            }

            // Kategori + alt sayfalar - accordion
            return (
              <CategoryAccordion
                key={category.id}
                category={category}
                subPages={subs}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}

function CategoryAccordion({
  category,
  subPages,
}: {
  category: Menu;
  subPages: Menu[];
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between px-4 py-3 text-left transition-colors hover:bg-slate-50"
      >
        <div>
          <div className="text-sm font-bold text-slate-900">{category.name}</div>
          {category.description && (
            <div className="mt-0.5 text-xs text-slate-500 line-clamp-1">
              {category.description}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500">
            {subPages.length}
          </span>
          <ChevronDown
            className={`h-4 w-4 text-slate-400 transition-transform ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </div>
      </button>
      <div
        className={`grid transition-all duration-300 ${
          isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className="overflow-hidden">
          <div className="border-t border-slate-100 bg-slate-50 p-2">
            <div className="space-y-1">
              {subPages.map((sub) => (
                <Link
                  key={sub.id}
                  href={getMenuSlug(sub)}
                  className="group flex items-center justify-between rounded px-3 py-2 text-sm transition-colors hover:bg-white"
                >
                  <span className="text-slate-700 group-hover:text-primary">
                    {sub.name}
                  </span>
                  <ArrowRight className="h-3 w-3 text-slate-400 transition-all group-hover:translate-x-1 group-hover:text-primary" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
