"use client";

import { useEffect, useState } from "react";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { ArrowLeft, AlertCircle, Loader2 } from "lucide-react";

export default function ResetPasswordPage() {
  const [isValidSession, setIsValidSession] = useState<boolean | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error || !session) {
          setError("Geçersiz veya süresi dolmuş bağlantı. Lütfen tekrar şifre sıfırlama talebinde bulunun.");
          setIsValidSession(false);
          return;
        }

        setIsValidSession(true);
      } catch (err) {
        setError("Bir hata oluştu. Lütfen tekrar deneyin.");
        setIsValidSession(false);
      }
    };

    // Listen for auth state changes (recovery event)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY") {
        setIsValidSession(true);
      }
    });

    checkSession();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  if (isValidSession === null) {
    return (
      <div className="mx-auto max-w-md space-y-6 py-12">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-3 text-slate-600">Doğrulanıyor...</span>
        </div>
      </div>
    );
  }

  if (!isValidSession) {
    return (
      <div className="mx-auto max-w-md space-y-6 py-12">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
          <h3 className="mb-2 text-xl font-bold text-slate-900">Geçersiz Bağlantı</h3>
          <p className="mb-6 text-sm text-slate-600">{error}</p>
          <Link
            href="/sifremi-unuttum"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-white hover:bg-primary/90"
          >
            Tekrar Şifre Sıfırlama Talebi Gönder
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md space-y-6 py-12">
      {/* Back Button */}
      <Link
        href="/giris"
        className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-primary"
      >
        <ArrowLeft className="h-4 w-4" />
        Giriş Sayfasına Dön
      </Link>

      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-slate-900">Şifre Sıfırlama</h1>
        <p className="mt-2 text-slate-600">
          Yeni şifrenizi belirleyin
        </p>
      </div>

      {/* Reset Password Form */}
      <ResetPasswordForm />
    </div>
  );
}
