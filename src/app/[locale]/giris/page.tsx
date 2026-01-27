import { LoginForm } from "@/components/auth/LoginForm";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Giriş Yap | Kolay Seyahat",
  description: "Kolay Seyahat hesabınıza giriş yapın ve başvurularınızı takip edin.",
  robots: {
    index: false,
    follow: false,
  },
  alternates: {
    canonical: 'https://www.kolayseyahat.net/giris',
  },
};

export default function LoginPage() {
  return (
    <div className="mx-auto max-w-md space-y-6 py-12">
      {/* Back Button */}
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-primary"
      >
        <ArrowLeft className="h-4 w-4" />
        Ana Sayfaya Dön
      </Link>

      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-slate-900">Giriş Yap</h1>
        <p className="mt-2 text-slate-600">
          Hesabınıza giriş yaparak başvurularınızı takip edin
        </p>
      </div>

      {/* Login Form */}
      <LoginForm />

      {/* Register Link */}
      <div className="text-center text-sm text-slate-600">
        Hesabınız yok mu?{" "}
        <Link href="/kayit" className="font-semibold text-primary hover:underline">
          Hemen Kayıt Olun
        </Link>
      </div>
    </div>
  );
}
