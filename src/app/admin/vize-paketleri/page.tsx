import Link from "next/link";
import { Plus } from "lucide-react";
import { createClient } from "@supabase/supabase-js";
import { ProductsTable } from "@/components/admin/ProductsTable";

export default async function ProductsPage() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Fetch products, countries, and users separately
  const [
    { data: products },
    { data: countries },
    { data: users }
  ] = await Promise.all([
    supabase.from("products").select("*").order("created_at", { ascending: false }),
    supabase.from("countries").select("id, name"),
    supabase.from("users").select("id, name")
  ]);

  // Map country and user names to products
  const productsWithRelations = products?.map((product: any) => ({
    ...product,
    countries: countries?.find((c: any) => c.id === product.country_id),
    users: users?.find((u: any) => u.id === product.user_id)
  }));

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Vize Paketleri</h2>
          <p className="text-sm text-slate-600">
            Ülkelere özel vize paketlerini yönetin
          </p>
        </div>
        <Link
          href="/admin/vize-paketleri/yeni"
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-lg transition-all hover:bg-primary-dark"
        >
          <Plus className="h-4 w-4" />
          Yeni Paket
        </Link>
      </div>

      {/* Products Table */}
      <ProductsTable products={productsWithRelations || []} />
    </div>
  );
}
