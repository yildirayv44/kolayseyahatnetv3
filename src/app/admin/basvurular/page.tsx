"use client";

import { supabase } from "@/lib/supabase";
import { Eye, Download, Filter, CheckCircle, Clock, XCircle, TrendingUp, X, FileText } from "lucide-react";
import { useState, useEffect } from "react";

// Note: Metadata cannot be exported from client components
// Title is set in parent layout

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<any[]>([]);
  const [selectedApp, setSelectedApp] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    const { data, error } = await supabase
      .from("applications")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching applications:", error);
    } else {
      setApplications(data || []);
    }
  };

  const statusConfig = {
    new: { label: "Yeni", color: "bg-blue-100 text-blue-700", icon: Clock },
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
          <p className="text-sm text-slate-600">Yeni</p>
          <p className="mt-2 text-3xl font-bold text-blue-600">
            {applications?.filter((a: any) => a.status === "new").length || 0}
          </p>
        </div>
        <div className="card">
          <p className="text-sm text-slate-600">İşlemde</p>
          <p className="mt-2 text-3xl font-bold text-amber-600">
            {applications?.filter((a: any) => a.status === "processing" || a.status === "pending").length || 0}
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
                <th className="px-6 py-4 font-semibold">Paket</th>
                <th className="px-6 py-4 font-semibold">Notlar</th>
                <th className="px-6 py-4 font-semibold">Durum</th>
                <th className="px-6 py-4 font-semibold">Tarih & Saat</th>
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
                        {app.full_name}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">{app.email}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{app.phone}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{app.country_name || "-"}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        <div className="max-w-xs truncate" title={app.package_name}>
                          {app.package_name || "-"}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {app.notes ? (
                          <div className="flex items-center gap-1">
                            <FileText className="h-4 w-4 text-primary" />
                            <span className="max-w-xs truncate" title={app.notes}>
                              {app.notes}
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold ${status.color}`}>
                          <StatusIcon className="h-3 w-3" />
                          {status.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        <div>
                          <div>{new Date(app.created_at).toLocaleDateString("tr-TR")}</div>
                          <div className="text-xs text-slate-500">
                            {new Date(app.created_at).toLocaleTimeString("tr-TR", { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              setSelectedApp(app);
                              setIsModalOpen(true);
                            }}
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
                  <td colSpan={10} className="px-6 py-12 text-center text-slate-600">
                    Henüz başvuru bulunmuyor.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      {isModalOpen && selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="relative w-full max-w-2xl rounded-lg bg-white shadow-xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-200 p-6">
              <h3 className="text-xl font-bold text-slate-900">Başvuru Detayı #{selectedApp.id}</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content */}
            <div className="max-h-[70vh] overflow-y-auto p-6">
              <div className="space-y-6">
                {/* Personal Info */}
                <div>
                  <h4 className="mb-3 text-sm font-semibold text-slate-900">Kişisel Bilgiler</h4>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <p className="text-xs text-slate-600">Ad Soyad</p>
                      <p className="font-medium text-slate-900">{selectedApp.full_name}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-600">E-posta</p>
                      <p className="font-medium text-slate-900">{selectedApp.email}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-600">Telefon</p>
                      <p className="font-medium text-slate-900">{selectedApp.phone}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-600">Durum</p>
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold ${statusConfig[selectedApp.status as keyof typeof statusConfig]?.color || statusConfig.pending.color}`}>
                        {statusConfig[selectedApp.status as keyof typeof statusConfig]?.label || "Beklemede"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Application Info */}
                <div>
                  <h4 className="mb-3 text-sm font-semibold text-slate-900">Başvuru Bilgileri</h4>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <p className="text-xs text-slate-600">Ülke</p>
                      <p className="font-medium text-slate-900">{selectedApp.country_name || "-"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-600">Paket</p>
                      <p className="font-medium text-slate-900">{selectedApp.package_name || "-"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-600">Başvuru Tarihi</p>
                      <p className="font-medium text-slate-900">
                        {new Date(selectedApp.created_at).toLocaleDateString("tr-TR")}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-600">Başvuru Saati</p>
                      <p className="font-medium text-slate-900">
                        {new Date(selectedApp.created_at).toLocaleTimeString("tr-TR")}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Notes */}
                {selectedApp.notes && (
                  <div>
                    <h4 className="mb-3 text-sm font-semibold text-slate-900">Notlar / Ek Bilgiler</h4>
                    <div className="rounded-lg bg-slate-50 p-4">
                      <p className="whitespace-pre-wrap text-sm text-slate-700">{selectedApp.notes}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 border-t border-slate-200 p-6">
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Kapat
              </button>
              <a
                href={`mailto:${selectedApp.email}`}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90"
              >
                E-posta Gönder
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
