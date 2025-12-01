"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signUp } from "@/lib/auth";
import { UserPlus, Mail, Lock, User, AlertCircle, CheckCircle } from "lucide-react";

export function RegisterForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (password !== confirmPassword) {
      setError("Şifreler eşleşmiyor");
      return;
    }

    if (password.length < 6) {
      setError("Şifre en az 6 karakter olmalıdır");
      return;
    }

    setLoading(true);

    try {
      await signUp(email, password, name);
      setSuccess(true);
      setTimeout(() => {
        router.push("/giris");
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Kayıt olurken bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="card space-y-6">
      {error && (
        <div className="flex items-start gap-3 rounded-lg bg-red-50 p-4 text-sm text-red-800">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {success && (
        <div className="flex items-start gap-3 rounded-lg bg-emerald-50 p-4 text-sm text-emerald-800">
          <CheckCircle className="h-5 w-5 shrink-0" />
          <p>Kayıt başarılı! Giriş sayfasına yönlendiriliyorsunuz...</p>
        </div>
      )}

      <div className="space-y-2">
        <label htmlFor="name" className="block text-sm font-semibold text-slate-900">
          Ad Soyad
        </label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full rounded-lg border border-slate-200 py-3 pl-10 pr-4 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            placeholder="Adınız Soyadınız"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="email" className="block text-sm font-semibold text-slate-900">
          E-posta
        </label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full rounded-lg border border-slate-200 py-3 pl-10 pr-4 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            placeholder="ornek@email.com"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="password" className="block text-sm font-semibold text-slate-900">
          Şifre
        </label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full rounded-lg border border-slate-200 py-3 pl-10 pr-4 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            placeholder="••••••••"
          />
        </div>
        <p className="text-xs text-slate-500">En az 6 karakter</p>
      </div>

      <div className="space-y-2">
        <label htmlFor="confirmPassword" className="block text-sm font-semibold text-slate-900">
          Şifre Tekrar
        </label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="w-full rounded-lg border border-slate-200 py-3 pl-10 pr-4 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            placeholder="••••••••"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading || success}
        className="group relative w-full overflow-hidden rounded-xl bg-primary px-6 py-3 text-base font-bold text-white shadow-lg transition-all hover:bg-primary-dark hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Kayıt yapılıyor...
          </span>
        ) : (
          <span className="flex items-center justify-center gap-2">
            <UserPlus className="h-5 w-5" />
            Kayıt Ol
          </span>
        )}
      </button>

      <p className="text-xs text-slate-500">
        Kayıt olarak{" "}
        <a href="/gizlilik" className="underline hover:text-primary">
          Gizlilik Politikası
        </a>{" "}
        ve{" "}
        <a href="/kullanim-kosullari" className="underline hover:text-primary">
          Kullanım Koşulları
        </a>
        &apos;nı kabul etmiş olursunuz.
      </p>
    </form>
  );
}
