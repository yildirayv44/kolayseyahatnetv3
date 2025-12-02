import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, Users, Globe2, Award } from "lucide-react";

export const metadata: Metadata = {
  title: "Hakkımızda | Kolay Seyahat",
  description:
    "Kolay Seyahat olarak 20+ ülke için profesyonel vize danışmanlığı hizmeti sunuyoruz. Yılların tecrübesi ve %98 başarı oranıyla yanınızdayız.",
};

export default function AboutPage() {
  return (
    <div className="space-y-10">
      <section className="space-y-4 border-b border-slate-200 pb-6">
        <h1 className="text-2xl font-semibold text-slate-900 md:text-3xl">
          Hakkımızda
        </h1>
        <p className="max-w-3xl text-sm leading-relaxed text-slate-600">
          Kolay Seyahat olarak, vize başvuru süreçlerini basitleştirmek ve müşterilerimize
          en iyi hizmeti sunmak için çalışıyoruz. Yılların tecrübesi ve uzman kadromuzla
          Amerika, İngiltere, Schengen ve daha birçok ülke için güvenilir vize danışmanlığı
          hizmeti veriyoruz.
        </p>
      </section>

      <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="card space-y-2 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Award className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900">%98 Başarı Oranı</h3>
          <p className="text-xs text-slate-600">
            Binlerce başarılı vize başvurusu ile kanıtlanmış güvenilirlik.
          </p>
        </div>

        <div className="card space-y-2 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Users className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900">Uzman Kadro</h3>
          <p className="text-xs text-slate-600">
            Alanında deneyimli danışmanlarla profesyonel destek.
          </p>
        </div>

        <div className="card space-y-2 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Globe2 className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900">20+ Ülke</h3>
          <p className="text-xs text-slate-600">
            Farklı destinasyonlar için kapsamlı vize çözümleri.
          </p>
        </div>

        <div className="card space-y-2 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900">Kolay Süreç</h3>
          <p className="text-xs text-slate-600">
            Adım adım rehberlik ve şeffaf iletişim.
          </p>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-slate-900">Misyonumuz</h2>
        <p className="text-sm leading-relaxed text-slate-600">
          Vize başvuru süreçlerini karmaşık ve stresli olmaktan çıkarıp, herkes için
          erişilebilir ve anlaşılır hale getirmek. Müşterilerimize güvenilir, hızlı ve
          profesyonel bir hizmet sunarak seyahat hayallerini gerçekleştirmelerine yardımcı
          olmak.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-slate-900">Vizyonumuz</h2>
        <p className="text-sm leading-relaxed text-slate-600">
          Türkiye&apos;nin en güvenilir ve tercih edilen vize danışmanlık firması olmak.
          Teknoloji ve insan odaklı yaklaşımımızla sektörde fark yaratmaya devam etmek.
        </p>
      </section>

      <section className="card border-primary/10 bg-primary/5">
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-slate-900">
            Vize sürecinizde yanınızdayız
          </h2>
          <p className="text-sm text-slate-600">
            Başvurunuz için hemen bizimle iletişime geçin, uzman danışmanlarımız size
            yardımcı olsun.
          </p>
          <div className="flex flex-col gap-2 pt-2 sm:flex-row">
            <a
              href="tel:02129099971"
              className="inline-flex items-center justify-center rounded-lg border border-primary bg-white px-4 py-2 text-sm font-semibold text-primary shadow-sm hover:bg-slate-50"
            >
              0212 909 99 71&apos;i Ara
            </a>
            <Link href="/vize-basvuru-formu" className="btn-primary text-xs md:text-sm">
              Online Başvuru Yap
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
