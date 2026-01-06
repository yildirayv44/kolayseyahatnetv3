"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Users, Search, Filter, Eye, Trash2, CheckCircle, Clock, XCircle } from "lucide-react";

interface Affiliate {
  id: number;
  name: string;
  email: string;
  phone: string;
  website: string | null;
  social_media: string | null;
  experience: string | null;
  traffic_source: string | null;
  monthly_visitors: string | null;
  why_join: string | null;
  status: number;
  created_at: string;
}

export default function AffiliateBasvurularPage() {
  const [affiliates, setAffiliates] = useState<Affiliate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | number>("all");
  const [selectedAffiliate, setSelectedAffiliate] = useState<Affiliate | null>(null);

  useEffect(() => {
    fetchAffiliates();
  }, []);

  const fetchAffiliates = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("user_affiliates")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setAffiliates(data || []);
    } catch (error) {
      console.error("Error fetching affiliates:", error);
      alert("Başvurular yüklenirken hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: number, newStatus: number) => {
    try {
      const affiliate = affiliates.find(a => a.id === id);
      if (!affiliate) return;

      const { error } = await supabase
        .from("user_affiliates")
        .update({ status: newStatus })
        .eq("id", id);

      if (error) throw error;

      // If approved (status = 1), create partner account
      if (newStatus === 1) {
        const shouldCreatePartner = confirm(
          `${affiliate.name} için partner hesabı oluşturulsun mu?\n\nKomisyon seviyesi seçilecek.`
        );

        if (shouldCreatePartner) {
          const level = prompt(
            "Komisyon seviyesi seçin:\n1 - Standard (%10)\n2 - Enterprise (%20)\n3 - Kurumsal (%30)",
            "1"
          );

          const levelMap: Record<string, { name: string; rate: number }> = {
            "1": { name: "standard", rate: 10 },
            "2": { name: "enterprise", rate: 20 },
            "3": { name: "kurumsal", rate: 30 }
          };

          const selectedLevel = levelMap[level || "1"];

          // Generate partner ID by calling the database function
          const { data: partnerData, error: partnerError } = await supabase.rpc(
            'generate_partner_id'
          );

          if (partnerError) throw partnerError;

          const partnerId = partnerData;

          // Create partner (no Supabase Auth needed - they already have password)
          const { error: createError } = await supabase
            .from("affiliate_partners")
            .insert({
              user_affiliate_id: id,
              partner_id: partnerId,
              name: affiliate.name,
              email: affiliate.email,
              phone: affiliate.phone,
              commission_level: selectedLevel.name,
              commission_rate: selectedLevel.rate,
              status: "active"
            });

          if (createError) throw createError;

          // Send approval email
          try {
            const response = await fetch(
              `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/partner-welcome-email`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  "Authorization": `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`
                },
                body: JSON.stringify({
                  email: affiliate.email,
                  name: affiliate.name,
                  partner_id: partnerId,
                  commission_rate: selectedLevel.rate
                })
              }
            );

            if (!response.ok) {
              console.error("Email sending failed");
            }
          } catch (emailError) {
            console.error("Email error:", emailError);
          }

          alert(`Partner hesabı oluşturuldu!\n\nPartner ID: ${partnerId}\nKomisyon: %${selectedLevel.rate}\n\nŞifre sıfırlama linki e-mail ile gönderildi.`);
        }
      }

      fetchAffiliates();
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Durum güncellenirken hata oluştu: " + (error as Error).message);
    }
  };

  const deleteAffiliate = async (id: number) => {
    if (!confirm("Bu başvuruyu silmek istediğinizden emin misiniz?")) return;

    try {
      const { error } = await supabase.from("user_affiliates").delete().eq("id", id);

      if (error) throw error;
      alert("Başvuru silindi");
      fetchAffiliates();
    } catch (error) {
      console.error("Error deleting affiliate:", error);
      alert("Başvuru silinirken hata oluştu");
    }
  };

  const getStatusIcon = (status: number) => {
    switch (status) {
      case 1:
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 0:
        return <Clock className="h-4 w-4 text-amber-600" />;
      case 2:
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-slate-400" />;
    }
  };

  const getStatusColor = (status: number) => {
    switch (status) {
      case 1:
        return "bg-green-100 text-green-700";
      case 0:
        return "bg-amber-100 text-amber-700";
      case 2:
        return "bg-red-100 text-red-700";
      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  const filteredAffiliates = affiliates.filter((a) => {
    const matchesSearch =
      (a.name?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
      (a.email?.toLowerCase() || "").includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || a.status === Number(statusFilter);
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: affiliates.length,
    pending: affiliates.filter((a) => a.status === 0).length,
    approved: affiliates.filter((a) => a.status === 1).length,
    rejected: affiliates.filter((a) => a.status === 2).length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Affiliate Başvuruları</h1>
        <p className="text-sm text-slate-600">
          Affiliate programına yapılan başvuruları yönetin
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        <div className="card">
          <div className="text-sm text-slate-600">Toplam</div>
          <div className="text-2xl font-bold text-slate-900">{stats.total}</div>
        </div>
        <div className="card">
          <div className="text-sm text-slate-600">Beklemede</div>
          <div className="text-2xl font-bold text-amber-600">{stats.pending}</div>
        </div>
        <div className="card">
          <div className="text-sm text-slate-600">Onaylandı</div>
          <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
        </div>
        <div className="card">
          <div className="text-sm text-slate-600">Reddedildi</div>
          <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-slate-200 py-2 pl-10 pr-4 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="all">Tüm Durumlar</option>
              <option value="0">Beklemede</option>
              <option value="1">Onaylandı</option>
              <option value="2">Reddedildi</option>
            </select>
          </div>
        </div>
      </div>

      {/* Affiliates List */}
      <div className="card">
        {loading ? (
          <div className="py-12 text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-primary" />
            <p className="mt-4 text-sm text-slate-600">Yükleniyor...</p>
          </div>
        ) : filteredAffiliates.length === 0 ? (
          <div className="py-12 text-center">
            <Users className="mx-auto h-12 w-12 text-slate-300" />
            <p className="mt-4 text-sm text-slate-600">Başvuru bulunamadı</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">
                    KİŞİ
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">
                    WEBSİTE/SOSYAL MEDYA
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-slate-600">
                    TRAFİK
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-slate-600">
                    DURUM
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-slate-600">
                    TARİH
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600">
                    İŞLEMLER
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredAffiliates.map((affiliate) => (
                  <tr key={affiliate.id} className="hover:bg-slate-50">
                    <td className="px-4 py-4">
                      <div className="font-medium text-slate-900">{affiliate.name}</div>
                      <div className="text-xs text-slate-500">{affiliate.email}</div>
                      <div className="text-xs text-slate-500">{affiliate.phone}</div>
                    </td>
                    <td className="px-4 py-4">
                      {affiliate.website && (
                        <a
                          href={affiliate.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block text-sm text-primary hover:underline"
                        >
                          {affiliate.website}
                        </a>
                      )}
                      {affiliate.social_media && (
                        <div className="text-xs text-slate-500">{affiliate.social_media}</div>
                      )}
                    </td>
                    <td className="px-4 py-4 text-center">
                      <div className="text-sm text-slate-900">{affiliate.traffic_source || "-"}</div>
                      <div className="text-xs text-slate-500">{affiliate.monthly_visitors || "-"}</div>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        {getStatusIcon(affiliate.status)}
                        <select
                          value={affiliate.status}
                          onChange={(e) => updateStatus(affiliate.id, Number(e.target.value))}
                          className="rounded border border-slate-200 px-2 py-1 text-xs focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20"
                        >
                          <option value="0">Beklemede</option>
                          <option value="1">Onaylandı</option>
                          <option value="2">Reddedildi</option>
                        </select>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-center text-sm text-slate-600">
                      {new Date(affiliate.created_at).toLocaleDateString("tr-TR")}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedAffiliate(affiliate)}
                          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 hover:text-primary"
                          title="Görüntüle"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => deleteAffiliate(affiliate.id)}
                          className="rounded-lg p-2 text-slate-600 hover:bg-red-50 hover:text-red-600"
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
        )}
      </div>

      {/* Detail Modal */}
      {selectedAffiliate && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setSelectedAffiliate(null)}
        >
          <div
            className="w-full max-w-2xl rounded-xl bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-start justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Başvuru Detayı</h2>
                <p className="text-sm text-slate-600">ID: {selectedAffiliate.id}</p>
              </div>
              <button
                onClick={() => setSelectedAffiliate(null)}
                className="rounded-lg p-2 hover:bg-slate-100"
              >
                <XCircle className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-sm font-semibold text-slate-900">Ad Soyad</label>
                  <p className="text-slate-700">{selectedAffiliate.name}</p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-900">E-posta</label>
                  <p className="text-slate-700">{selectedAffiliate.email}</p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-sm font-semibold text-slate-900">Telefon</label>
                  <p className="text-slate-700">{selectedAffiliate.phone}</p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-900">Website</label>
                  <p className="text-slate-700">{selectedAffiliate.website || "-"}</p>
                </div>
              </div>

              {selectedAffiliate.social_media && (
                <div>
                  <label className="text-sm font-semibold text-slate-900">Sosyal Medya</label>
                  <p className="text-slate-700">{selectedAffiliate.social_media}</p>
                </div>
              )}

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-sm font-semibold text-slate-900">Trafik Kaynağı</label>
                  <p className="text-slate-700">{selectedAffiliate.traffic_source || "-"}</p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-900">Aylık Ziyaretçi</label>
                  <p className="text-slate-700">{selectedAffiliate.monthly_visitors || "-"}</p>
                </div>
              </div>

              {selectedAffiliate.experience && (
                <div>
                  <label className="text-sm font-semibold text-slate-900">Deneyim</label>
                  <p className="whitespace-pre-wrap rounded-lg bg-slate-50 p-4 text-slate-700">
                    {selectedAffiliate.experience}
                  </p>
                </div>
              )}

              {selectedAffiliate.why_join && (
                <div>
                  <label className="text-sm font-semibold text-slate-900">Katılma Nedeni</label>
                  <p className="whitespace-pre-wrap rounded-lg bg-slate-50 p-4 text-slate-700">
                    {selectedAffiliate.why_join}
                  </p>
                </div>
              )}

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-sm font-semibold text-slate-900">Durum</label>
                  <select
                    value={selectedAffiliate.status}
                    onChange={(e) => {
                      const newStatus = Number(e.target.value);
                      updateStatus(selectedAffiliate.id, newStatus);
                      setSelectedAffiliate({ ...selectedAffiliate, status: newStatus });
                    }}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="0">Beklemede</option>
                    <option value="1">Onaylandı</option>
                    <option value="2">Reddedildi</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-900">Tarih</label>
                  <p className="text-slate-700">
                    {new Date(selectedAffiliate.created_at).toLocaleString("tr-TR")}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setSelectedAffiliate(null)}
                className="rounded-lg border border-slate-200 px-4 py-2 font-semibold text-slate-700 hover:bg-slate-50"
              >
                Kapat
              </button>
              <a
                href={`mailto:${selectedAffiliate.email}`}
                className="rounded-lg bg-primary px-4 py-2 font-semibold text-white hover:bg-primary/90"
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
