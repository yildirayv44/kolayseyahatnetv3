"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Edit, Trash2, Eye, EyeOff } from "lucide-react";

interface Product {
  id: number;
  name: string;
  description?: string;
  price?: number;
  processing?: string;
  status: number;
  online: number;
  countries?: { name: string };
}

export function ProductsTable({ products }: { products: Product[] }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState<number | null>(null);

  const handleDelete = async (productId: number, productName: string) => {
    if (!confirm(`"${productName}" paketini silmek istediğinize emin misiniz?`)) {
      return;
    }

    setDeleting(productId);

    try {
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Silme işlemi başarısız");
      }

      alert("Vize paketi başarıyla silindi!");
      router.refresh();
    } catch (error: any) {
      console.error("Delete error:", error);
      alert("Silme hatası: " + error.message);
    } finally {
      setDeleting(null);
    }
  };

  return (
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
            {products && products.length > 0 ? (
              products.map((product) => (
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
                        onClick={() => handleDelete(product.id, product.name)}
                        disabled={deleting === product.id}
                        className="rounded-lg p-2 text-slate-600 transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                        title="Sil"
                      >
                        <Trash2 className={`h-4 w-4 ${deleting === product.id ? 'animate-pulse' : ''}`} />
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
  );
}
