import { Metadata } from "next";
import { RegisterForm } from "@/components/auth/RegisterForm";

export const metadata: Metadata = {
  title: "Kayıt Ol | Kolay Seyahat",
  description: "Kolay Seyahat'a üye olun ve vize başvurularınızı kolayca takip edin.",
};

export default function RegisterPage() {
  return (
    <div className="mx-auto max-w-md space-y-8 py-12">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-slate-900">Kayıt Ol</h1>
        <p className="mt-2 text-sm text-slate-600">
          Ücretsiz hesap oluşturun ve başvurularınızı takip edin
        </p>
      </div>

      <RegisterForm />

      <p className="text-center text-sm text-slate-600">
        Zaten hesabınız var mı?{" "}
        <a href="/giris" className="font-semibold text-primary hover:underline">
          Giriş Yap
        </a>
      </p>
    </div>
  );
}
