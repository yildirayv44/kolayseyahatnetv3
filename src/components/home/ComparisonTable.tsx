"use client";

import { Check, X, Sparkles } from "lucide-react";

export function ComparisonTable() {
  const comparisons = [
    {
      feature: "Başvuru Süreci",
      self: "Karmaşık ve uzun",
      us: "15 dakikada tamamla",
    },
    {
      feature: "Evrak Hazırlığı",
      self: "Kendiniz araştırın",
      us: "Profesyonel destek",
    },
    {
      feature: "Hata Riski",
      self: "Yüksek risk",
      us: "Sıfıra yakın",
    },
    {
      feature: "Onay Oranı",
      self: "Belirsiz",
      us: "%98 başarı",
    },
    {
      feature: "Zaman",
      self: "Günler/haftalar",
      us: "15 dakika",
    },
    {
      feature: "Red Durumunda",
      self: "Kayıp",
      us: "Para iade garantisi",
    },
    {
      feature: "Destek",
      self: "Yok",
      us: "7/24 danışman",
    },
    {
      feature: "Takip",
      self: "Manuel",
      us: "Otomatik bildirim",
    },
  ];

  return (
    <section className="space-y-4">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-slate-900 md:text-3xl">
          Neden Kolay Seyahat?
        </h2>
        <p className="mt-2 text-slate-600">
          Kendiniz yapmak mı, yoksa profesyonel destek mi?
        </p>
      </div>

      {/* Comparison Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg">
        <div className="grid md:grid-cols-3">
          {/* Header Row */}
          <div className="border-b border-slate-200 bg-slate-50 p-4">
            <div className="text-sm font-semibold text-slate-600">Özellik</div>
          </div>
          <div className="border-b border-l border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center gap-2">
              <X className="h-5 w-5 text-red-500" />
              <span className="text-sm font-semibold text-slate-900">
                Kendiniz Yaparsanız
              </span>
            </div>
          </div>
          <div className="relative border-b border-l border-slate-200 bg-gradient-to-br from-primary/10 to-blue-50 p-4">
            <div className="absolute right-2 top-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500 px-2 py-0.5 text-xs font-bold text-white">
                <Sparkles className="h-3 w-3" />
                Önerilen
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-5 w-5 text-emerald-600" />
              <span className="text-sm font-semibold text-slate-900">
                Kolay Seyahat ile
              </span>
            </div>
          </div>

          {/* Comparison Rows */}
          {comparisons.map((item, index) => (
            <div key={index} className="contents">
              {/* Feature Name */}
              <div className="border-b border-slate-200 bg-slate-50 p-4">
                <div className="text-sm font-medium text-slate-700">
                  {item.feature}
                </div>
              </div>

              {/* Self Column */}
              <div className="border-b border-l border-slate-200 p-4">
                <div className="flex items-start gap-2">
                  <X className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-500" />
                  <span className="text-sm text-slate-600">{item.self}</span>
                </div>
              </div>

              {/* Us Column */}
              <div className="border-b border-l border-slate-200 bg-gradient-to-br from-primary/5 to-blue-50/50 p-4">
                <div className="flex items-start gap-2">
                  <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-600" />
                  <span className="text-sm font-semibold text-slate-900">
                    {item.us}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA Footer */}
        <div className="border-t border-slate-200 bg-gradient-to-br from-primary to-blue-600 p-6 text-center">
          <p className="mb-4 text-lg font-semibold text-white">
            Profesyonel destek ile %98 onay oranı!
          </p>
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <a
              href="/basvuru"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-6 py-3 font-semibold text-primary transition-all hover:bg-slate-50 hover:shadow-lg"
            >
              Hemen Başvur
              <Check className="h-5 w-5" />
            </a>
            <a
              href="tel:02129099971"
              className="inline-flex items-center justify-center gap-2 rounded-lg border-2 border-white px-6 py-3 font-semibold text-white transition-all hover:bg-white/10"
            >
              Bizi Arayın
            </a>
          </div>
        </div>
      </div>

      {/* Trust Badges */}
      <div className="grid grid-cols-3 gap-4 text-center">
        <div className="rounded-lg bg-slate-50 p-4">
          <div className="text-2xl font-bold text-primary">%98</div>
          <div className="text-xs text-slate-600">Onay Oranı</div>
        </div>
        <div className="rounded-lg bg-slate-50 p-4">
          <div className="text-2xl font-bold text-primary">15,247</div>
          <div className="text-xs text-slate-600">Mutlu Müşteri</div>
        </div>
        <div className="rounded-lg bg-slate-50 p-4">
          <div className="text-2xl font-bold text-primary">15 dk</div>
          <div className="text-xs text-slate-600">Başvuru Süresi</div>
        </div>
      </div>
    </section>
  );
}
