import { notFound } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { ProductEditForm } from "@/components/admin/ProductEditForm";

// Admin panelde cache olmamalı - her zaman güncel veri göster
export const dynamic = 'force-dynamic';

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const { data: product, error } = await supabaseAdmin
    .from("products")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !product) {
    console.error("Product fetch error:", error);
    notFound();
  }

  // Fetch countries for dropdown
  const { data: countries } = await supabaseAdmin
    .from("countries")
    .select("id, name")
    .eq("status", 1)
    .order("name");

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Vize Paketi Düzenle</h2>
        <p className="text-sm text-slate-600">
          {product.name} paketini düzenleyin
        </p>
      </div>

      <ProductEditForm product={product} countries={countries || []} />
    </div>
  );
}
