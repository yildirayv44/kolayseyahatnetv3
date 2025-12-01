import Link from "next/link";
import { getConsultants } from "@/lib/queries";
import { Plus, Edit, Trash2, Eye, Mail, Phone } from "lucide-react";

export default async function ConsultantsPage() {
  const consultants = await getConsultants();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Danışmanlar</h2>
          <p className="text-sm text-slate-600">Vize danışmanlarını yönetin</p>
        </div>
        <Link
          href="/admin/danismanlar/yeni"
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-lg transition-all hover:bg-primary-dark"
        >
          <Plus className="h-4 w-4" />
          Yeni Danışman Ekle
        </Link>
      </div>

      {/* Consultants Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {consultants.map((consultant: any) => (
          <div key={consultant.id} className="card">
            <div className="flex items-start gap-4">
              {consultant.avatar ? (
                <img
                  src={consultant.avatar}
                  alt={consultant.name}
                  className="h-16 w-16 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-2xl font-bold text-white">
                  {consultant.name?.charAt(0) || "?"}
                </div>
              )}
              <div className="flex-1">
                <h3 className="font-semibold text-slate-900">{consultant.name}</h3>
                <p className="mt-1 text-sm text-slate-600 line-clamp-2">
                  {consultant.description || "Açıklama yok"}
                </p>
              </div>
            </div>

            <div className="mt-4 space-y-2 border-t border-slate-200 pt-4">
              {consultant.email && (
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Mail className="h-4 w-4" />
                  <a href={`mailto:${consultant.email}`} className="hover:text-primary">
                    {consultant.email}
                  </a>
                </div>
              )}
              {consultant.phone && (
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Phone className="h-4 w-4" />
                  <a href={`tel:${consultant.phone}`} className="hover:text-primary">
                    {consultant.phone}
                  </a>
                </div>
              )}
            </div>

            <div className="mt-4 flex items-center gap-2">
              <Link
                href={`/danisman/${consultant.id}`}
                target="_blank"
                className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-center text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                <Eye className="mx-auto h-4 w-4" />
              </Link>
              <Link
                href={`/admin/danismanlar/${consultant.id}/duzenle`}
                className="flex-1 rounded-lg bg-blue-50 px-3 py-2 text-center text-sm font-medium text-blue-600 hover:bg-blue-100"
              >
                <Edit className="mx-auto h-4 w-4" />
              </Link>
              <button className="flex-1 rounded-lg bg-red-50 px-3 py-2 text-center text-sm font-medium text-red-600 hover:bg-red-100">
                <Trash2 className="mx-auto h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {consultants.length === 0 && (
        <div className="card text-center">
          <p className="text-slate-600">Henüz danışman bulunmuyor.</p>
          <Link
            href="/admin/danismanlar/yeni"
            className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
          >
            <Plus className="h-4 w-4" />
            İlk danışmanı ekle
          </Link>
        </div>
      )}

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="card">
          <p className="text-sm text-slate-600">Toplam Danışman</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{consultants.length}</p>
        </div>
        <div className="card">
          <p className="text-sm text-slate-600">Aktif Danışman</p>
          <p className="mt-2 text-3xl font-bold text-emerald-600">{consultants.length}</p>
        </div>
      </div>
    </div>
  );
}
