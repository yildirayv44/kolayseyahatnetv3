import { Metadata } from "next";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "Giriş Yap | Kolay Seyahat",
  description: "Kolay Seyahat hesabınıza giriş yapın.",
};

export default function LoginPage() {
  return (
    <div className="mx-auto max-w-md space-y-8 py-12">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-slate-900">Giriş Yap</h1>
        <p className="mt-2 text-sm text-slate-600">
          Hesabınıza giriş yaparak başvurularınızı takip edin
        </p>
      </div>

      <LoginForm />

      <p className="text-center text-sm text-slate-600">
        Hesabınız yok mu?{" "}
        <a href="/kayit" className="font-semibold text-primary hover:underline">
          Kayıt Ol
        </a>
      </p>
    </div>
  );
}
