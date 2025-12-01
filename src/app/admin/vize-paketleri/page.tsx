import Link from "next/link";
import { Plus, Edit, Trash2, Eye, EyeOff } from "lucide-react";
import { createClient } from "@supabase/supabase-js";

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

  console.log("🔍 Admin Products Query:", { 
    productsCount: productsWithRelations?.length || 0,
    firstProduct: productsWithRelations?.[0]
  });

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
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700">
                  Paket Adı
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700">
                  Ülke
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700">
                  Fiyat
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700">
                  İşlem Süresi
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700">
                  Durum
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700">
                  Online
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-700">
                  İşlemler
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {productsWithRelations && productsWithRelations.length > 0 ? (
                productsWithRelations.map((product: any) => (
                  <tr key={product.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-900">
                        {product.name}
                      </div>
                      {product.description && (
                        <div className="text-xs text-slate-500 line-clamp-1">
                          {product.description}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-slate-700">
                        {product.countries?.name || "-"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-semibold text-slate-900">
                        {product.price ? `${product.price} ₺` : "-"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-slate-600">
                        {product.processing || "-"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {product.status === 1 ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-700">
                          <Eye className="h-3 w-3" />
                          Aktif
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700">
                          <EyeOff className="h-3 w-3" />
                          Pasif
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {product.online === 1 ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-700">
                          Online
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700">
                          Offline
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/vize-paketleri/${product.id}/duzenle`}
                          className="rounded-lg p-2 text-slate-600 transition-colors hover:bg-slate-100 hover:text-primary"
                          title="Düzenle"
                        >
                          <Edit className="h-4 w-4" />
                        </Link>
                        <button
                          className="rounded-lg p-2 text-slate-600 transition-colors hover:bg-red-50 hover:text-red-600"
                          title="Sil"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                    Henüz vize paketi bulunmuyor
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
