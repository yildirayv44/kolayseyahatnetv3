import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { CountryBilateralVisaManager } from "@/components/admin/CountryBilateralVisaManager";

export const dynamic = 'force-dynamic';

export default async function CountryBilateralVisaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const { data: country, error } = await supabase
    .from("countries")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !country) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">
          {country.name} - Bilateral Vize Sayfaları
        </h2>
        <p className="text-sm text-slate-600">
          {country.name} vatandaşlarının diğer ülkelere seyahat ederken ihtiyaç duyduğu vize sayfalarını yönetin
        </p>
      </div>

      <CountryBilateralVisaManager country={country} />
    </div>
  );
}
