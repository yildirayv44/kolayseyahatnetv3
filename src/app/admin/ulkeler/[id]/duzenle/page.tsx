import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { CountryEditForm } from "@/components/admin/CountryEditForm";

export default async function EditCountryPage({ params }: { params: Promise<{ id: string }> }) {
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
        <h2 className="text-2xl font-bold text-slate-900">Ülke Düzenle</h2>
        <p className="text-sm text-slate-600">
          {country.name} bilgilerini düzenleyin
        </p>
      </div>

      <CountryEditForm country={country} />
    </div>
  );
}
