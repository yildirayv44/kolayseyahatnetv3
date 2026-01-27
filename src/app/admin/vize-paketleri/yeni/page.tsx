import { supabaseAdmin } from "@/lib/supabase-admin";
import { ProductCreateForm } from "@/components/admin/ProductCreateForm";

// Admin panelde cache olmamalı - her zaman güncel veri göster
export const dynamic = 'force-dynamic';

export default async function NewProductPage() {
  // Fetch countries for dropdown using admin client
  const { data: countries } = await supabaseAdmin
    .from("countries")
    .select("id, name")
    .eq("status", 1)
    .order("name");

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Yeni Vize Paketi</h2>
        <p className="text-sm text-slate-600">
          Yeni bir vize paketi oluşturun
        </p>
      </div>

      <ProductCreateForm countries={countries || []} />
    </div>
  );
}
