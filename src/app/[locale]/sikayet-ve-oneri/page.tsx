import { Metadata } from "next";
import { MessageSquare, CheckCircle, Clock, TrendingUp, AlertCircle } from "lucide-react";
import { FeedbackForm } from "@/components/forms/FeedbackForm";

export const metadata: Metadata = {
  title: "Şikayet ve Öneri | Kolay Seyahat",
  description: "Kolay Seyahat hizmetleri hakkında şikayet, öneri ve geri bildirimlerinizi paylaşın. Müşteri memnuniyeti bizim için önemlidir.",
};

export default function SikayetVeOneriPage() {
  return (
    <div className="container mx-auto max-w-4xl space-y-8 px-4 py-8">
      <div className="space-y-4 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <MessageSquare className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-3xl font-bold text-slate-900 md:text-4xl">
          Şikayet ve Öneri
        </h1>
        <p className="text-slate-600">
          Görüşleriniz bizim için değerlidir. Hizmetlerimizi geliştirmek için geri bildirimlerinizi bekliyoruz.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Info Section */}
        <div className="space-y-6">
          <div className="card">
            <h2 className="mb-4 text-xl font-bold text-slate-900">
              Neden Geri Bildirim Önemlidir?
            </h2>
            <div className="space-y-3 text-slate-700">
              <p>
                Kolay Seyahat olarak, müşteri memnuniyetini en üst düzeyde tutmayı 
                hedefliyoruz. Sizin geri bildirimleriniz, hizmet kalitemizi artırmamıza 
                ve eksikliklerimizi gidermemize yardımcı olur.
              </p>
              <p>
                Olumlu veya olumsuz tüm görüşleriniz bizim için değerlidir. Her geri 
                bildirim dikkatle incelenir ve gerekli aksiyonlar alınır.
              </p>
            </div>
          </div>

          <div className="card bg-blue-50">
            <h3 className="mb-3 font-semibold text-slate-900">
              Geri Bildirim Sürecimiz
            </h3>
            <ol className="space-y-2 text-sm text-slate-700">
              <li className="flex gap-2">
                <span className="font-semibold text-primary">1.</span>
                <span>Formunuzu doldurun ve gönderin</span>
              </li>
              <li className="flex gap-2">
                <span className="font-semibold text-primary">2.</span>
                <span>Ekibimiz 24 saat içinde değerlendirir</span>
              </li>
              <li className="flex gap-2">
                <span className="font-semibold text-primary">3.</span>
                <span>48 saat içinde size geri dönüş yaparız</span>
              </li>
              <li className="flex gap-2">
                <span className="font-semibold text-primary">4.</span>
                <span>Gerekli iyileştirmeler yapılır</span>
              </li>
            </ol>
          </div>

          <div className="card border-2 border-amber-200 bg-amber-50">
            <div className="flex gap-3">
              <AlertCircle className="h-5 w-5 flex-shrink-0 text-amber-600" />
              <div className="text-sm text-slate-700">
                <p className="font-semibold text-slate-900">Önemli Not:</p>
                <p className="mt-1">
                  Acil durumlar için lütfen doğrudan telefon ile iletişime geçin: 
                  <a href="tel:02129099971" className="ml-1 font-semibold text-primary hover:underline">
                    0212 909 99 71
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Form Section */}
        <div className="card">
          <h2 className="mb-6 text-xl font-bold text-slate-900">
            Geri Bildirim Formu
          </h2>
          <FeedbackForm />
        </div>
      </div>

      {/* Alternative Contact Methods */}
      <div className="card bg-slate-50">
        <h2 className="mb-4 text-xl font-bold text-slate-900">
          Diğer İletişim Yolları
        </h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-lg bg-white p-4 text-center">
            <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <svg className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </div>
            <h3 className="font-semibold text-slate-900">Telefon</h3>
            <a href="tel:02129099971" className="mt-1 text-sm text-primary hover:underline">
              0212 909 99 71
            </a>
          </div>

          <div className="rounded-lg bg-white p-4 text-center">
            <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <svg className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="font-semibold text-slate-900">E-posta</h3>
            <a href="mailto:info@kolayseyahat.net" className="mt-1 text-sm text-primary hover:underline">
              info@kolayseyahat.net
            </a>
          </div>

          <div className="rounded-lg bg-white p-4 text-center">
            <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <svg className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h3 className="font-semibold text-slate-900">Adres</h3>
            <p className="mt-1 text-sm text-slate-600">İstanbul, Türkiye</p>
          </div>
        </div>
      </div>
    </div>
  );
}
