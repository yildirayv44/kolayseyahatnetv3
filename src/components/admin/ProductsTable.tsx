"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Edit, Trash2, Eye, EyeOff, Search, Filter, X } from "lucide-react";

interface Product {
  id: number;
  name: string;
  description?: string;
  price?: number;
  currency_id?: number;
  processing?: string;
  status: number;
  online: number;
  country_id?: number;
  countries?: { name: string };
}

// Para birimi sembolü helper fonksiyonu
const getCurrencySymbol = (currencyId: number = 1) => {
  switch (currencyId) {
    case 2: return '$';
    case 3: return '€';
    default: return '₺';
  }
};

export function ProductsTable({ products }: { products: Product[] }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState<number | null>(null);
  
  // Filtre state'leri
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCountry, setSelectedCountry] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedOnline, setSelectedOnline] = useState<string>("all");

  // Benzersiz ülkeleri çıkar
  const uniqueCountries = useMemo(() => {
    const countries = products
      .map(p => p.countries?.name)
      .filter((name): name is string => !!name);
    return [...new Set(countries)].sort();
  }, [products]);

  // Filtrelenmiş ürünler
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      // Arama filtresi
      const matchesSearch = searchTerm === "" || 
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Ülke filtresi
      const matchesCountry = selectedCountry === "all" || 
        product.countries?.name === selectedCountry;
      
      // Durum filtresi
      const matchesStatus = selectedStatus === "all" || 
        (selectedStatus === "active" && product.status === 1) ||
        (selectedStatus === "passive" && product.status === 0);
      
      // Online filtresi
      const matchesOnline = selectedOnline === "all" || 
        (selectedOnline === "online" && product.online === 1) ||
        (selectedOnline === "offline" && product.online === 0);
      
      return matchesSearch && matchesCountry && matchesStatus && matchesOnline;
    });
  }, [products, searchTerm, selectedCountry, selectedStatus, selectedOnline]);

  // Filtreleri temizle
  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCountry("all");
    setSelectedStatus("all");
    setSelectedOnline("all");
  };

  const hasActiveFilters = searchTerm !== "" || selectedCountry !== "all" || 
    selectedStatus !== "all" || selectedOnline !== "all";

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
    <div className="space-y-4">
      {/* Filtreler */}
      <div className="card">
        <div className="flex flex-wrap items-center gap-4">
          {/* Arama */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Paket adı veya açıklama ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-slate-200 py-2 pl-10 pr-4 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {/* Ülke Filtresi */}
          <select
            value={selectedCountry}
            onChange={(e) => setSelectedCountry(e.target.value)}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="all">Tüm Ülkeler</option>
            {uniqueCountries.map((country) => (
              <option key={country} value={country}>
                {country}
              </option>
            ))}
          </select>

          {/* Durum Filtresi */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="all">Tüm Durumlar</option>
            <option value="active">Aktif</option>
            <option value="passive">Pasif</option>
          </select>

          {/* Online Filtresi */}
          <select
            value={selectedOnline}
            onChange={(e) => setSelectedOnline(e.target.value)}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="all">Tümü</option>
            <option value="online">Online</option>
            <option value="offline">Offline</option>
          </select>

          {/* Filtreleri Temizle */}
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50"
            >
              <X className="h-4 w-4" />
              Temizle
            </button>
          )}
        </div>

        {/* Sonuç sayısı */}
        <div className="mt-3 flex items-center gap-2 text-sm text-slate-500">
          <Filter className="h-4 w-4" />
          <span>
            {filteredProducts.length} / {products.length} paket gösteriliyor
          </span>
        </div>
      </div>

      {/* Tablo */}
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
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product) => (
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
                      {product.price ? `${product.price} ${getCurrencySymbol(product.currency_id)}` : "-"}
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
                    {hasActiveFilters 
                      ? "Filtrelere uygun paket bulunamadı" 
                      : "Henüz vize paketi bulunmuyor"}
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
