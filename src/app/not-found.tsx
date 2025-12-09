"use client";

import Link from "next/link";
import { Home, Search, Phone, Mail, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 px-4 py-16">
      <div className="w-full max-w-2xl text-center">
        {/* 404 Illustration */}
        <div className="mb-8">
          <div className="mx-auto mb-6 flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br from-primary/10 to-blue-100">
            <span className="text-6xl font-bold text-primary">404</span>
          </div>
          <h1 className="mb-4 text-4xl font-bold text-slate-900 md:text-5xl">
            Sayfa Bulunamadı
          </h1>
          <p className="mx-auto max-w-md text-lg text-slate-600">
            Aradığınız sayfa kaldırılmış, adı değiştirilmiş veya geçici olarak kullanılamıyor olabilir.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="mb-12 grid gap-4 sm:grid-cols-2">
          <Link
            href="/"
            className="flex items-center justify-center gap-3 rounded-xl border-2 border-primary bg-primary px-6 py-4 font-semibold text-white shadow-lg transition-all hover:bg-primary/90 hover:shadow-xl"
          >
            <Home className="h-5 w-5" />
            <span>Ana Sayfaya Dön</span>
          </Link>
          
          <Link
            href="/ulkeler"
            className="flex items-center justify-center gap-3 rounded-xl border-2 border-slate-300 bg-white px-6 py-4 font-semibold text-slate-700 shadow-md transition-all hover:border-primary hover:bg-slate-50"
          >
            <Search className="h-5 w-5" />
            <span>Ülkeleri İncele</span>
          </Link>
        </div>

        {/* Popular Links */}
        <div className="mb-12 rounded-2xl border border-slate-200 bg-white p-8 shadow-lg">
          <h2 className="mb-6 text-xl font-bold text-slate-900">
            Popüler Sayfalar
          </h2>
          <div className="grid gap-3 text-left sm:grid-cols-2">
            <Link
              href="/amerika"
              className="flex items-center gap-3 rounded-lg border border-slate-200 p-3 transition-all hover:border-primary hover:bg-primary/5"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                <span className="text-xl">🇺🇸</span>
              </div>
              <div>
                <p className="font-semibold text-slate-900">Amerika Vizesi</p>
                <p className="text-xs text-slate-600">En çok aranan</p>
              </div>
            </Link>

            <Link
              href="/ingiltere"
              className="flex items-center gap-3 rounded-lg border border-slate-200 p-3 transition-all hover:border-primary hover:bg-primary/5"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                <span className="text-xl">🇬🇧</span>
              </div>
              <div>
                <p className="font-semibold text-slate-900">İngiltere Vizesi</p>
                <p className="text-xs text-slate-600">Popüler</p>
              </div>
            </Link>

            <Link
              href="/kanada-vizesi"
              className="flex items-center gap-3 rounded-lg border border-slate-200 p-3 transition-all hover:border-primary hover:bg-primary/5"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                <span className="text-xl">🇨🇦</span>
              </div>
              <div>
                <p className="font-semibold text-slate-900">Kanada Vizesi</p>
                <p className="text-xs text-slate-600">Çok aranan</p>
              </div>
            </Link>

            <Link
              href="/almanya"
              className="flex items-center gap-3 rounded-lg border border-slate-200 p-3 transition-all hover:border-primary hover:bg-primary/5"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                <span className="text-xl">🇩🇪</span>
              </div>
              <div>
                <p className="font-semibold text-slate-900">Almanya Vizesi</p>
                <p className="text-xs text-slate-600">Schengen vizesi</p>
              </div>
            </Link>
          </div>
        </div>

        {/* Contact Section */}
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-lg">
          <h2 className="mb-4 text-xl font-bold text-slate-900">
            Yardıma mı İhtiyacınız Var?
          </h2>
          <p className="mb-6 text-slate-600">
            Aradığınız sayfayı bulamadıysanız, size yardımcı olmaktan mutluluk duyarız.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <a
              href="tel:02129099971"
              className="inline-flex items-center justify-center gap-2 rounded-lg border-2 border-primary bg-white px-6 py-3 font-semibold text-primary transition-all hover:bg-primary hover:text-white"
            >
              <Phone className="h-5 w-5" />
              <span>0212 909 99 71</span>
            </a>
            <Link
              href="/iletisim"
              className="inline-flex items-center justify-center gap-2 rounded-lg border-2 border-slate-300 bg-white px-6 py-3 font-semibold text-slate-700 transition-all hover:border-primary hover:bg-slate-50"
            >
              <Mail className="h-5 w-5" />
              <span>İletişim</span>
            </Link>
          </div>
        </div>

        {/* Back Button */}
        <button
          onClick={() => window.history.back()}
          className="mt-8 inline-flex items-center gap-2 text-slate-600 transition-colors hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Önceki Sayfaya Dön</span>
        </button>
      </div>
    </div>
  );
}
