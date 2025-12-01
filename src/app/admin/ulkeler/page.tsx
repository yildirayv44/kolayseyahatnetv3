import Link from "next/link";
import { getCountries } from "@/lib/queries";
import { Plus, Edit, Trash2, Eye } from "lucide-react";

export default async function CountriesPage() {
  const countries = await getCountries();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Ülkeler</h2>
          <p className="text-sm text-slate-600">Vize ülkelerini yönetin</p>
        </div>
        <Link
          href="/admin/ulkeler/yeni"
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-lg transition-all hover:bg-primary-dark"
        >
          <Plus className="h-4 w-4" />
          Yeni Ülke Ekle
        </Link>
      </div>

      {/* Countries Table */}
      <div className="card overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr className="border-b border-slate-200 text-left text-sm text-slate-600">
                <th className="px-6 py-4 font-semibold">ID</th>
                <th className="px-6 py-4 font-semibold">Ülke Adı</th>
                <th className="px-6 py-4 font-semibold">Başlık</th>
                <th className="px-6 py-4 font-semibold">Durum</th>
                <th className="px-6 py-4 font-semibold">Web</th>
                <th className="px-6 py-4 font-semibold text-right">İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {countries.map((country: any) => (
                <tr key={country.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="px-6 py-4 text-sm text-slate-600">{country.id}</td>
                  <td className="px-6 py-4 text-sm font-medium text-slate-900">{country.name}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{country.title || "-"}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                        country.status === 1
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {country.status === 1 ? "Aktif" : "Pasif"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                        country.is_web === 1
                          ? "bg-blue-100 text-blue-700"
                          : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {country.is_web === 1 ? "Gösteriliyor" : "Gizli"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/ulkeler/${country.id}`}
                        className="rounded-lg p-2 text-slate-600 hover:bg-slate-100"
                        title="Görüntüle"
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                      <Link
                        href={`/admin/ulkeler/${country.id}/duzenle`}
                        className="rounded-lg p-2 text-blue-600 hover:bg-blue-50"
                        title="Düzenle"
                      >
                        <Edit className="h-4 w-4" />
                      </Link>
                      <button
                        className="rounded-lg p-2 text-red-600 hover:bg-red-50"
                        title="Sil"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="card">
          <p className="text-sm text-slate-600">Toplam Ülke</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{countries.length}</p>
        </div>
        <div className="card">
          <p className="text-sm text-slate-600">Aktif Ülke</p>
          <p className="mt-2 text-3xl font-bold text-emerald-600">
            {countries.filter((c: any) => c.status === 1).length}
          </p>
        </div>
        <div className="card">
          <p className="text-sm text-slate-600">Web'de Gösterilen</p>
          <p className="mt-2 text-3xl font-bold text-blue-600">
            {countries.filter((c: any) => c.is_web === 1).length}
          </p>
        </div>
      </div>
    </div>
  );
}
