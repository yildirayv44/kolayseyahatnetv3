import { supabase } from "@/lib/supabase";
import { Eye, Download, Filter, CheckCircle, Clock, XCircle, TrendingUp } from "lucide-react";

export default async function ApplicationsPage() {
  // Fetch applications from Supabase
  const { data: applications, error } = await supabase
    .from("applications")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching applications:", error);
  }

  const statusConfig = {
    pending: { label: "Beklemede", color: "bg-amber-100 text-amber-700", icon: Clock },
    approved: { label: "Onaylandı", color: "bg-emerald-100 text-emerald-700", icon: CheckCircle },
    processing: { label: "İşlemde", color: "bg-blue-100 text-blue-700", icon: TrendingUp },
    rejected: { label: "Reddedildi", color: "bg-red-100 text-red-700", icon: XCircle },
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Başvurular</h2>
          <p className="text-sm text-slate-600">Vize başvurularını yönetin</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
            <Filter className="h-4 w-4" />
            Filtrele
          </button>
          <button className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-lg transition-all hover:bg-primary-dark">
            <Download className="h-4 w-4" />
            Dışa Aktar
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="card">
          <p className="text-sm text-slate-600">Toplam Başvuru</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{applications?.length || 0}</p>
        </div>
        <div className="card">
          <p className="text-sm text-slate-600">Beklemede</p>
          <p className="mt-2 text-3xl font-bold text-amber-600">
            {applications?.filter((a: any) => a.status === "pending").length || 0}
          </p>
        </div>
        <div className="card">
          <p className="text-sm text-slate-600">İşlemde</p>
          <p className="mt-2 text-3xl font-bold text-blue-600">
            {applications?.filter((a: any) => a.status === "processing").length || 0}
          </p>
        </div>
        <div className="card">
          <p className="text-sm text-slate-600">Onaylanan</p>
          <p className="mt-2 text-3xl font-bold text-emerald-600">
            {applications?.filter((a: any) => a.status === "approved").length || 0}
          </p>
        </div>
      </div>

      {/* Applications Table */}
      <div className="card overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr className="border-b border-slate-200 text-left text-sm text-slate-600">
                <th className="px-6 py-4 font-semibold">ID</th>
                <th className="px-6 py-4 font-semibold">Ad Soyad</th>
                <th className="px-6 py-4 font-semibold">E-posta</th>
                <th className="px-6 py-4 font-semibold">Telefon</th>
                <th className="px-6 py-4 font-semibold">Ülke</th>
                <th className="px-6 py-4 font-semibold">Durum</th>
                <th className="px-6 py-4 font-semibold">Tarih</th>
                <th className="px-6 py-4 font-semibold text-right">İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {applications && applications.length > 0 ? (
                applications.map((app: any) => {
                  const status = statusConfig[app.status as keyof typeof statusConfig] || statusConfig.pending;
                  const StatusIcon = status.icon;
                  
                  return (
                    <tr key={app.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="px-6 py-4 text-sm text-slate-600">{app.id}</td>
                      <td className="px-6 py-4 text-sm font-medium text-slate-900">
                        {app.first_name} {app.last_name}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">{app.email}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{app.phone}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{app.country_id || "-"}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold ${status.color}`}>
                          <StatusIcon className="h-3 w-3" />
                          {status.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {new Date(app.created_at).toLocaleDateString("tr-TR")}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100"
                            title="Detayları Gör"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-slate-600">
                    Henüz başvuru bulunmuyor.
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
