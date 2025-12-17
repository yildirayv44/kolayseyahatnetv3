import type { Metadata } from "next";
import Link from "next/link";
import { Mail, Phone, User } from "lucide-react";
import { getConsultants } from "@/lib/queries";
import { getConsultantSlug } from "@/lib/helpers";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const isEnglish = locale === 'en';
  
  return {
    title: isEnglish ? "Expert Consultants | Kolay Seyahat" : "Uzman Danışmanlarımız | Kolay Seyahat",
    description: isEnglish
      ? "Meet our experienced consultant team who will help you with your visa applications."
      : "Vize başvurularınızda size yardımcı olacak deneyimli danışman kadromuzla tanışın.",
    alternates: {
      canonical: `https://www.kolayseyahat.net${isEnglish ? '/en' : ''}/danismanlar`,
      languages: {
        'tr': 'https://www.kolayseyahat.net/danismanlar',
        'en': 'https://www.kolayseyahat.net/en/danismanlar',
        'x-default': 'https://www.kolayseyahat.net/danismanlar',
      },
    },
  };
}

export default async function ConsultantsPage() {
  const consultants = await getConsultants();

  return (
    <div className="space-y-8">
      <section className="space-y-3 border-b border-slate-200 pb-6">
        <h1 className="text-2xl font-semibold text-slate-900 md:text-3xl">
          Uzman Danışmanlarımız
        </h1>
        <p className="max-w-2xl text-sm text-slate-600">
          Vize başvuru süreçlerinizde size rehberlik edecek, yılların tecrübesine sahip
          danışman kadromuzla tanışın.
        </p>
      </section>

      {consultants.length === 0 && (
        <div className="rounded-xl border border-slate-200 bg-slate-50 px-6 py-12 text-center">
          <p className="text-sm text-slate-600">
            Henüz danışman bilgisi bulunmuyor.
          </p>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {consultants.map((consultant: any) => (
          <Link
            key={consultant.id}
            href={getConsultantSlug(consultant)}
            className="card group space-y-4"
          >
            <div className="flex items-start gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                <User className="h-8 w-8" />
              </div>
              <div className="flex-1 space-y-1">
                <h2 className="text-base font-semibold text-slate-900 group-hover:text-primary">
                  {consultant.name}
                </h2>
                <p className="text-xs text-slate-600 line-clamp-2">
                  {consultant.description || "Vize danışmanı"}
                </p>
              </div>
            </div>

            <div className="space-y-2 border-t border-slate-100 pt-3 text-xs text-slate-600">
              {consultant.email && (
                <div className="flex items-center gap-2">
                  <Mail className="h-3 w-3 text-primary" />
                  <span className="truncate">{consultant.email}</span>
                </div>
              )}
              {consultant.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-3 w-3 text-primary" />
                  <span>{consultant.phone}</span>
                </div>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
