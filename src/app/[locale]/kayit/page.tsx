import { RegisterForm } from "@/components/auth/RegisterForm";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kayıt Ol | Kolay Seyahat",
  description: "Kolay Seyahat'e ücretsiz kayıt olun ve vize başvurularınızı takip edin.",
  robots: {
    index: false,
    follow: false,
  },
  alternates: {
    canonical: 'https://www.kolayseyahat.net/kayit',
  },
};

export default function RegisterPage() {
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
        <h1 className="text-3xl font-bold text-slate-900">Kayıt Ol</h1>
        <p className="mt-2 text-slate-600">
          Ücretsiz hesap oluşturun ve başvurularınızı takip edin
        </p>
      </div>

      {/* Register Form */}
      <RegisterForm />

      {/* Login Link */}
      <div className="text-center text-sm text-slate-600">
        Zaten hesabınız var mı?{" "}
        <Link href="/giris" className="font-semibold text-primary hover:underline">
          Giriş Yapın
        </Link>
      </div>
    </div>
  );
}
