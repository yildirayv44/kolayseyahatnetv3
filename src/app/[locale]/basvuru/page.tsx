import type { Metadata } from "next";
import { ApplicationForm } from "@/components/forms/ApplicationForm";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Vize Başvurusu | Kolay Seyahat",
  description:
    "Online vize başvuru formu ile hızlı ve güvenli şekilde başvurunuzu tamamlayın. Uzman danışmanlarımız en kısa sürede sizinle iletişime geçecek.",
};

// Dynamic page because it uses searchParams
export const dynamic = "force-dynamic";

export default function ApplicationPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <section className="space-y-4 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 p-6 md:p-8">
        <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
          </span>
          Ortalama 3 dakikada tamamlanır
        </div>
        <h1 className="text-2xl font-bold text-slate-900 md:text-4xl">
          Online Vize Başvuru Formu
        </h1>
        <p className="text-base text-slate-600 md:text-lg">
          Formu doldurun, <strong className="text-slate-900">24 saat içinde</strong> uzman danışmanlarımız sizinle iletişime geçsin.
        </p>
        <a 
          href="https://www.kolayseyahat.tr/vize-degerlendirme.html"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Ücretsiz Ön Değerlendirme için tıklayın
        </a>
        <div className="flex flex-wrap gap-4 text-sm text-slate-600">
          <div className="flex items-center gap-2">
            <svg className="h-5 w-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>Hızlı Yanıt</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="h-5 w-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>Profesyonel Destek</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="h-5 w-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>Güvenli İşlem</span>
          </div>
        </div>
      </section>

      <ApplicationForm />

      <section className="rounded-xl border-2 border-emerald-200 bg-emerald-50 p-6">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100">
            <svg className="h-6 w-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="space-y-2">
            <h3 className="font-bold text-emerald-900">Neden Bizi Tercih Etmelisiniz?</h3>
            <ul className="space-y-2 text-sm text-emerald-800">
              <li className="flex items-start gap-2">
                <span className="text-emerald-600">✓</span>
                <span><strong>24 saat içinde</strong> uzman danışmanımız sizinle iletişime geçer</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-600">✓</span>
                <span><strong>%98 başarı oranı</strong> ile binlerce mutlu müşteri</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-600">✓</span>
                <span><strong>SSL güvenli</strong> veri aktarımı ve gizlilik garantisi</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-600">✓</span>
                <span><strong>Profesyonel</strong> vize danışmanlığı hizmeti</span>
              </li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
