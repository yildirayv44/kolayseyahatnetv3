"use client";

import { useState } from "react";
import { ChevronDown, Search } from "lucide-react";

interface FAQItem {
  id: number;
  title: string;
  contents: string;
  answers?: FAQItem[];
}

interface CountryFAQProps {
  questions: FAQItem[];
  locale?: 'tr' | 'en';
}

export function CountryFAQ({ questions, locale = 'tr' }: CountryFAQProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const filteredQuestions = questions.filter((q) =>
    q.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-900">{locale === 'en' ? 'Frequently Asked Questions' : 'Sık Sorulan Sorular'}</h2>
        <span className="text-sm text-slate-500">{filteredQuestions.length} {locale === 'en' ? 'questions' : 'soru'}</span>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder={locale === 'en' ? 'Search questions...' : 'Soru ara...'}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-12 pr-4 text-sm transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>

      {/* FAQ List */}
      <div className="space-y-3">
        {filteredQuestions.map((q, index) => {
          const isOpen = openIndex === index;

          return (
            <div
              key={q.id}
              className={`overflow-hidden rounded-xl border transition-all ${
                isOpen
                  ? "border-primary bg-blue-50 shadow-md"
                  : "border-slate-200 bg-white hover:border-slate-300"
              }`}
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="flex w-full items-center justify-between gap-4 p-5 text-left"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold transition-colors ${
                      isOpen
                        ? "bg-primary text-white"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {index + 1}
                  </div>
                  <span className="font-semibold text-slate-900">{q.title}</span>
                </div>
                <ChevronDown
                  className={`h-5 w-5 shrink-0 text-slate-400 transition-transform duration-200 ${
                    isOpen ? "rotate-180 text-primary" : ""
                  }`}
                />
              </button>
              <div
                className={`grid transition-all duration-300 ease-in-out ${
                  isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                }`}
              >
                <div className="overflow-hidden">
                  <div className="border-t border-slate-200 p-5">
                    <div
                      className="prose prose-sm max-w-none text-slate-700"
                      dangerouslySetInnerHTML={{ __html: q.contents }}
                    />
                    {q.answers && q.answers.map((a: FAQItem) => (
                      <div
                        key={a.id}
                        className="mt-4 border-t border-slate-100 pt-4 prose prose-sm max-w-none text-slate-700"
                        dangerouslySetInnerHTML={{ __html: a.contents }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {filteredQuestions.length === 0 && (
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-8 text-center">
            <p className="text-sm text-slate-600">
              {locale === 'en' ? `No results found for "${searchQuery}".` : `"${searchQuery}" için sonuç bulunamadı.`}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
