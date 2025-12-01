import type { Metadata } from "next";
import Link from "next/link";
import { Building2, Users, FileCheck, Headphones } from "lucide-react";

export const metadata: Metadata = {
  title: "Kurumsal Vize Danışmanlığı | Kolay Seyahat",
  description:
    "Şirketinizin çalışanları için toplu vize başvuruları, kurumsal anlaşmalar ve özel hizmetler. Kolay Seyahat ile kurumsal vize çözümleri.",
};

export default function CorporatePage() {
  return (
    <div className="space-y-10">
      <section className="space-y-4 border-b border-slate-200 pb-6">
        <h1 className="text-2xl font-semibold text-slate-900 md:text-3xl">
          Kurumsal Vize Danışmanlığı
        </h1>
        <p className="max-w-3xl text-sm leading-relaxed text-slate-600">
          Şirketinizin iş seyahatleri ve çalışan vize başvuruları için özel çözümler
          sunuyoruz. Toplu başvurular, öncelikli hizmet ve kurumsal anlaşmalarla vize
          süreçlerinizi kolaylaştırıyoruz.
        </p>
      </section>

      <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="card space-y-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Building2 className="h-5 w-5" />
          </div>
          <h3 className="text-sm font-semibold text-slate-900">Toplu Başvuru</h3>
          <p className="text-xs text-slate-600">
            Çalışanlarınız için toplu vize başvurusu ve hızlı işlem.
          </p>
        </div>

        <div className="card space-y-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Users className="h-5 w-5" />
          </div>
          <h3 className="text-sm font-semibold text-slate-900">Özel Danışman</h3>
          <p className="text-xs text-slate-600">
            Şirketinize özel atanmış danışman ile kesintisiz destek.
          </p>
        </div>

        <div className="card space-y-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
            <FileCheck className="h-5 w-5" />
          </div>
          <h3 className="text-sm font-semibold text-slate-900">Evrak Yönetimi</h3>
          <p className="text-xs text-slate-600">
            Tüm evrakların düzenlenmesi ve takibi tek noktadan.
          </p>
        </div>

        <div className="card space-y-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Headphones className="h-5 w-5" />
          </div>
          <h3 className="text-sm font-semibold text-slate-900">7/24 Destek</h3>
          <p className="text-xs text-slate-600">
            Acil durumlarda öncelikli iletişim ve çözüm.
          </p>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-slate-900">
          Kurumsal Hizmetlerimiz
        </h2>
        <ul className="space-y-3 text-sm text-slate-700">
          <li className="flex items-start gap-2">
            <span className="mt-0.5 text-primary">•</span>
            <span>
              <strong>İş Vizesi Başvuruları:</strong> Çalışanlarınızın iş seyahatleri için
              hızlı vize işlemleri.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-0.5 text-primary">•</span>
            <span>
              <strong>Toplu Başvuru Yönetimi:</strong> Birden fazla çalışan için aynı anda
              başvuru ve takip.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-0.5 text-primary">•</span>
            <span>
              <strong>Kurumsal Anlaşmalar:</strong> Şirketinize özel indirimli paketler ve
              esnek ödeme seçenekleri.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-0.5 text-primary">•</span>
            <span>
              <strong>Randevu Koordinasyonu:</strong> Konsolosluk randevularının
              planlanması ve yönetimi.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-0.5 text-primary">•</span>
            <span>
              <strong>Raporlama:</strong> Başvuru süreçleri hakkında düzenli raporlama ve
              bilgilendirme.
            </span>
          </li>
        </ul>
      </section>

      <section className="card border-primary/10 bg-primary/5">
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-slate-900">
            Kurumsal çözümler için bizimle iletişime geçin
          </h2>
          <p className="text-sm text-slate-600">
            Şirketinizin vize ihtiyaçları için özel bir teklif almak ve detaylı bilgi için
            bizi arayabilir veya e-posta gönderebilirsiniz.
          </p>
          <div className="flex flex-col gap-2 pt-2 sm:flex-row">
            <a
              href="tel:02129099971"
              className="inline-flex items-center justify-center rounded-lg border border-primary bg-white px-4 py-2 text-sm font-semibold text-primary shadow-sm hover:bg-slate-50"
            >
              0212 909 99 71&apos;i Ara
            </a>
            <a
              href="mailto:vize@kolayseyahat.net"
              className="btn-primary text-xs md:text-sm"
            >
              E-posta Gönder
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
