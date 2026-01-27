import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Şifremi Unuttum | Kolay Seyahat",
  description: "Kolay Seyahat hesabınızın şifresini sıfırlayın.",
  robots: {
    index: false,
    follow: false,
  },
  alternates: {
    canonical: 'https://www.kolayseyahat.net/sifremi-unuttum',
  },
};

export default function ForgotPasswordPage() {
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
        <h1 className="text-3xl font-bold text-slate-900">Şifremi Unuttum</h1>
        <p className="mt-2 text-slate-600">
          E-posta adresinizi girin, size şifre sıfırlama bağlantısı gönderelim
        </p>
      </div>

      {/* Forgot Password Form */}
      <ForgotPasswordForm />

      {/* Login Link */}
      <div className="text-center text-sm text-slate-600">
        Şifrenizi hatırladınız mı?{" "}
        <Link href="/giris" className="font-semibold text-primary hover:underline">
          Giriş Yapın
        </Link>
      </div>
    </div>
  );
}
