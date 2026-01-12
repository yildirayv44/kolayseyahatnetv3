"use client";

import { supabase } from "@/lib/supabase";
import { Eye, Download, Filter, CheckCircle, Clock, XCircle, TrendingUp, X, FileText, CreditCard, Building2, Trash2 } from "lucide-react";
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

  const handleDelete = async (id: number, fullName: string) => {
    if (!confirm(`"${fullName}" adlı başvuruyu silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`)) {
      return;
    }

    const { error } = await supabase
      .from("applications")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting application:", error);
      alert("Başvuru silinirken bir hata oluştu.");
    } else {
      alert("Başvuru başarıyla silindi.");
      fetchApplications();
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
                <th className="px-6 py-4 font-semibold">Ödeme</th>
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
                      <td className="px-6 py-4 text-sm">
                        {app.wants_payment ? (
                          <div className="flex items-center gap-1">
                            {app.payment_method === 'credit_card' ? (
                              <>
                                <CreditCard className="h-4 w-4 text-blue-600" />
                                <span className="text-blue-700 font-medium">Kredi Kartı</span>
                              </>
                            ) : app.payment_method === 'bank_transfer' ? (
                              <>
                                <Building2 className="h-4 w-4 text-emerald-600" />
                                <span className="text-emerald-700 font-medium">Havale</span>
                              </>
                            ) : (
                              <span className="text-slate-500">Bekliyor</span>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-400">Sonra ödeme</span>
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
                          <button
                            onClick={() => handleDelete(app.id, app.full_name)}
                            className="rounded-lg p-2 text-red-600 hover:bg-red-50"
                            title="Sil"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center text-slate-600">
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
                      <p className="text-xs text-slate-600">Kişi Sayısı</p>
                      <p className="font-medium text-slate-900">{selectedApp.person_count || 1} kişi</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-600">Toplam Tutar</p>
                      <p className="font-medium text-slate-900">
                        {selectedApp.total_amount ? `${Number(selectedApp.total_amount).toFixed(2)} ${selectedApp.package_currency || 'TRY'}` : "-"}
                      </p>
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

                {/* Currency & Pricing Info */}
                {selectedApp.package_currency && (
                  <div>
                    <h4 className="mb-3 text-sm font-semibold text-slate-900">Fiyat ve Kur Bilgileri</h4>
                    <div className="grid gap-4 sm:grid-cols-2 rounded-lg border-2 border-slate-200 p-4">
                      <div>
                        <p className="text-xs text-slate-600">Para Birimi</p>
                        <p className="font-medium text-slate-900">{selectedApp.package_currency}</p>
                      </div>
                      {selectedApp.usd_rate && (
                        <div>
                          <p className="text-xs text-slate-600">USD Kuru (TCMB)</p>
                          <p className="font-medium text-slate-900">{Number(selectedApp.usd_rate).toFixed(4)} ₺</p>
                        </div>
                      )}
                      {selectedApp.eur_rate && (
                        <div>
                          <p className="text-xs text-slate-600">EUR Kuru (TCMB)</p>
                          <p className="font-medium text-slate-900">{Number(selectedApp.eur_rate).toFixed(4)} ₺</p>
                        </div>
                      )}
                      {selectedApp.tl_amount && (
                        <div>
                          <p className="text-xs text-slate-600">TL Karşılığı</p>
                          <p className="font-medium text-primary text-lg">{Number(selectedApp.tl_amount).toFixed(2)} ₺</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Payment Info */}
                <div>
                  <h4 className="mb-3 text-sm font-semibold text-slate-900">Ödeme Bilgileri</h4>
                  <div className="rounded-lg border-2 border-slate-200 p-4">
                    {selectedApp.wants_payment ? (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-5 w-5 text-emerald-600" />
                          <span className="font-semibold text-emerald-900">Şimdi ödeme yapmak istiyor</span>
                        </div>
                        
                        <div className="grid gap-4 sm:grid-cols-2">
                          <div>
                            <p className="text-xs text-slate-600">Ödeme Yöntemi</p>
                            <div className="flex items-center gap-2 mt-1">
                              {selectedApp.payment_method === 'credit_card' ? (
                                <>
                                  <CreditCard className="h-5 w-5 text-blue-600" />
                                  <span className="font-medium text-blue-900">Kredi Kartı ile Ödeme</span>
                                </>
                              ) : selectedApp.payment_method === 'bank_transfer' ? (
                                <>
                                  <Building2 className="h-5 w-5 text-emerald-600" />
                                  <span className="font-medium text-emerald-900">Banka Havalesi / EFT</span>
                                </>
                              ) : (
                                <span className="text-slate-500">Belirtilmemiş</span>
                              )}
                            </div>
                          </div>
                          
                          <div>
                            <p className="text-xs text-slate-600">Ödeme Durumu</p>
                            <p className="font-medium text-slate-900 mt-1">
                              {selectedApp.payment_status === 'completed' ? (
                                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-700">
                                  <CheckCircle className="h-3 w-3" />
                                  Tamamlandı
                                </span>
                              ) : selectedApp.payment_status === 'pending' ? (
                                <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-1 text-xs font-semibold text-amber-700">
                                  <Clock className="h-3 w-3" />
                                  Bekliyor
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700">
                                  <Clock className="h-3 w-3" />
                                  Bekliyor
                                </span>
                              )}
                            </p>
                          </div>
                        </div>

                        {selectedApp.payment_method === 'bank_transfer' && (
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-3">
                            <p className="text-xs font-semibold text-blue-900 mb-2">İşlem Notları:</p>
                            <ul className="text-xs text-blue-800 space-y-1">
                              <li>• Müşteriden dekont/makbuz bekleniyor</li>
                              <li>• IBAN: TR71 0004 6001 1888 8000 1215 84</li>
                              <li>• Ödeme onaylanması gerekiyor</li>
                            </ul>
                          </div>
                        )}

                        {selectedApp.payment_method === 'credit_card' && (
                          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mt-3">
                            <p className="text-xs font-semibold text-amber-900 mb-2">İşlem Notları:</p>
                            <ul className="text-xs text-amber-800 space-y-1">
                              <li>• Kredi kartı ödemesi şu anda kapalı</li>
                              <li>• Müşteriye ödeme linki gönderilmeli</li>
                              <li>• 3D Secure ile güvenli ödeme</li>
                            </ul>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-slate-600">
                        <Clock className="h-5 w-5" />
                        <span>Müşteri daha sonra ödeme yapmak istiyor</span>
                      </div>
                    )}
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
