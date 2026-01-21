import { Award, Globe2, Clock, ShieldCheck, Users, Calendar } from "lucide-react";

export function TrustBadges() {
  return (
    <section className="py-8">
      <div className="mx-auto max-w-6xl px-4">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            Neden Kolay Seyahat?
          </h2>
          <p className="text-slate-600">
            Binlerce mutlu müşterimizin güvendiği profesyonel hizmet
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {/* Ana Kanıt Kartı - Büyük, Featured */}
          <div className="col-span-2 md:col-span-1 md:row-span-2 rounded-xl border-2 border-[#1E3A8A] bg-white p-8 shadow-lg">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-lg bg-[#1E3A8A]">
              <ShieldCheck className="h-8 w-8 text-white" strokeWidth={2.5} />
            </div>
            <div className="text-5xl font-bold text-[#1E3A8A] mb-2">
              10.000+
            </div>
            <div className="text-lg font-semibold text-slate-900 mb-2">
              Başarılı Başvuru
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">
              2010'dan beri 10.000'den fazla müşterimize profesyonel vize danışmanlığı sağladık. Uzman ekibimiz her başvuruyu titizlikle inceler.
            </p>
          </div>

          {/* Destek Kartları */}
          <div className="rounded-lg border border-slate-200 bg-white p-6 hover:border-blue-300 hover:shadow-md transition-all">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-50">
              <Award className="h-6 w-6 text-[#1E3A8A]" strokeWidth={2} />
            </div>
            <div className="text-3xl font-bold text-slate-900 mb-1">
              15 Yıl
            </div>
            <div className="text-sm font-semibold text-slate-700">
              Sektör Deneyimi
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-6 hover:border-blue-300 hover:shadow-md transition-all">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-50">
              <Users className="h-6 w-6 text-[#1E3A8A]" strokeWidth={2} />
            </div>
            <div className="text-3xl font-bold text-slate-900 mb-1">
              1000+
            </div>
            <div className="text-sm font-semibold text-slate-700">
              Mutlu Müşteri
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-6 hover:border-blue-300 hover:shadow-md transition-all">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-50">
              <Globe2 className="h-6 w-6 text-[#1E3A8A]" strokeWidth={2} />
            </div>
            <div className="text-3xl font-bold text-slate-900 mb-1">
              194
            </div>
            <div className="text-sm font-semibold text-slate-700">
              Ülke Bilgisi
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-6 hover:border-blue-300 hover:shadow-md transition-all">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-50">
              <Clock className="h-6 w-6 text-emerald-600" strokeWidth={2} />
            </div>
            <div className="text-3xl font-bold text-slate-900 mb-1">
              7/24
            </div>
            <div className="text-sm font-semibold text-slate-700">
              Danışman Desteği
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
