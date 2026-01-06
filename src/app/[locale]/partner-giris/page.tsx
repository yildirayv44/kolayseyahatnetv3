"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { LogIn, Mail, Lock, AlertCircle } from "lucide-react";

export default function PartnerLoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resetSent, setResetSent] = useState(false);
  const [showReset, setShowReset] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (error) throw error;

      if (data.user) {
        router.push("/partner");
        router.refresh();
      }
    } catch (err: any) {
      setError(err.message || "Giriş yapılırken hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(formData.email, {
        redirectTo: `${window.location.origin}/partner`,
      });

      if (error) throw error;

      setResetSent(true);
    } catch (err: any) {
      setError(err.message || "Şifre sıfırlama e-postası gönderilemedi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary to-blue-600 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-4xl font-bold text-white">Partner Girişi</h1>
          <p className="text-blue-100">Kolay Seyahat Affiliate Programı</p>
        </div>

        <div className="rounded-2xl bg-white p-8 shadow-2xl">
          {!showReset ? (
            <>
              <div className="mb-6 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <LogIn className="h-8 w-8 text-primary" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900">Hoş Geldiniz</h2>
                <p className="mt-2 text-sm text-slate-600">
                  Partner hesabınıza giriş yapın
                </p>
              </div>

              {error && (
                <div className="mb-4 flex items-start gap-2 rounded-lg bg-red-50 p-4 text-sm text-red-800">
                  <AlertCircle className="h-5 w-5 flex-shrink-0" />
                  <p>{error}</p>
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    E-posta
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="ornek@email.com"
                      className="w-full rounded-lg border border-slate-200 py-3 pl-11 pr-4 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Şifre
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="••••••••"
                      className="w-full rounded-lg border border-slate-200 py-3 pl-11 pr-4 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-lg bg-primary py-3 font-semibold text-white transition-all hover:bg-primary/90 disabled:opacity-50"
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Giriş yapılıyor...
                    </div>
                  ) : (
                    "Giriş Yap"
                  )}
                </button>
              </form>

              <div className="mt-6 text-center">
                <button
                  onClick={() => setShowReset(true)}
                  className="text-sm text-primary hover:underline"
                >
                  Şifremi Unuttum
                </button>
              </div>

              <div className="mt-6 border-t border-slate-200 pt-6 text-center">
                <p className="text-sm text-slate-600">
                  Henüz partner değil misiniz?{" "}
                  <a href="/affiliate" className="font-semibold text-primary hover:underline">
                    Başvuru Yapın
                  </a>
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="mb-6 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-50">
                  <Mail className="h-8 w-8 text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900">Şifre Sıfırlama</h2>
                <p className="mt-2 text-sm text-slate-600">
                  E-posta adresinize şifre sıfırlama linki göndereceğiz
                </p>
              </div>

              {error && (
                <div className="mb-4 flex items-start gap-2 rounded-lg bg-red-50 p-4 text-sm text-red-800">
                  <AlertCircle className="h-5 w-5 flex-shrink-0" />
                  <p>{error}</p>
                </div>
              )}

              {resetSent ? (
                <div className="rounded-lg bg-green-50 p-6 text-center">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                    <Mail className="h-6 w-6 text-green-600" />
                  </div>
                  <h3 className="mb-2 font-semibold text-green-900">E-posta Gönderildi!</h3>
                  <p className="mb-4 text-sm text-green-800">
                    Şifre sıfırlama linki <strong>{formData.email}</strong> adresine gönderildi.
                  </p>
                  <button
                    onClick={() => {
                      setShowReset(false);
                      setResetSent(false);
                    }}
                    className="text-sm text-green-700 hover:underline"
                  >
                    Giriş sayfasına dön
                  </button>
                </div>
              ) : (
                <form onSubmit={handlePasswordReset} className="space-y-4">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      E-posta
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="ornek@email.com"
                        className="w-full rounded-lg border border-slate-200 py-3 pl-11 pr-4 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-lg bg-primary py-3 font-semibold text-white transition-all hover:bg-primary/90 disabled:opacity-50"
                  >
                    {loading ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        Gönderiliyor...
                      </div>
                    ) : (
                      "Şifre Sıfırlama Linki Gönder"
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowReset(false)}
                    className="w-full text-sm text-slate-600 hover:text-slate-900"
                  >
                    ← Geri Dön
                  </button>
                </form>
              )}
            </>
          )}
        </div>

        <div className="mt-6 text-center text-sm text-blue-100">
          <a href="/" className="hover:text-white hover:underline">
            Ana Sayfaya Dön
          </a>
        </div>
      </div>
    </div>
  );
}
