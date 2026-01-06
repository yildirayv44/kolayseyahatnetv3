"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Users, Search, Edit, Trash2, TrendingUp, DollarSign, Eye } from "lucide-react";

interface Partner {
  id: number;
  partner_id: string;
  name: string;
  email: string;
  phone: string;
  commission_level: string;
  commission_rate: number;
  status: string;
  total_referrals: number;
  total_earnings: number;
  created_at: string;
}

interface Referral {
  id: number;
  partner_id: string;
  customer_name: string;
  customer_email: string;
  application_status: string;
  commission_amount: number;
  created_at: string;
}

export default function PartnersPage() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);
  const [referrals, setReferrals] = useState<Referral[]>([]);

  useEffect(() => {
    fetchPartners();
  }, []);

  const fetchPartners = async () => {
    try {
      setLoading(true);
      const { data: partnersData, error } = await supabase
        .from("affiliate_partners")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Fetch referral counts for each partner
      const partnersWithStats = await Promise.all(
        (partnersData || []).map(async (partner) => {
          const { data: referrals, error: refError } = await supabase
            .from("affiliate_referrals")
            .select("commission_amount, commission_paid")
            .eq("partner_id", partner.partner_id);

          if (refError) {
            console.error("Error fetching referrals for partner:", partner.partner_id, refError);
            return {
              ...partner,
              total_referrals: 0,
              total_earnings: 0,
            };
          }

          const total_referrals = referrals?.length || 0;
          const total_earnings = referrals?.reduce((sum, ref) => sum + (Number(ref.commission_amount) || 0), 0) || 0;

          return {
            ...partner,
            total_referrals,
            total_earnings,
          };
        })
      );

      setPartners(partnersWithStats);
    } catch (error) {
      console.error("Error fetching partners:", error);
      alert("Partnerlar yüklenirken hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  const fetchReferrals = async (partnerId: string) => {
    try {
      const { data, error } = await supabase
        .from("affiliate_referrals")
        .select("*")
        .eq("partner_id", partnerId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setReferrals(data || []);
    } catch (error) {
      console.error("Error fetching referrals:", error);
    }
  };

  const updatePartner = async (id: number, updates: Partial<Partner>) => {
    try {
      const { error } = await supabase
        .from("affiliate_partners")
        .update(updates)
        .eq("id", id);

      if (error) throw error;
      fetchPartners();
      alert("Partner güncellendi");
    } catch (error) {
      console.error("Error updating partner:", error);
      alert("Partner güncellenirken hata oluştu");
    }
  };

  const deletePartner = async (id: number) => {
    if (!confirm("Bu partneri silmek istediğinizden emin misiniz? Tüm referansları da silinecek.")) return;

    try {
      const { error } = await supabase.from("affiliate_partners").delete().eq("id", id);

      if (error) throw error;
      alert("Partner silindi");
      fetchPartners();
    } catch (error) {
      console.error("Error deleting partner:", error);
      alert("Partner silinirken hata oluştu");
    }
  };

  const viewPartnerDetails = async (partner: Partner) => {
    setSelectedPartner(partner);
    await fetchReferrals(partner.partner_id);
  };

  const filteredPartners = partners.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.partner_id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = {
    total: partners.length,
    active: partners.filter((p) => p.status === "active").length,
    totalReferrals: partners.reduce((sum, p) => sum + p.total_referrals, 0),
    totalEarnings: partners.reduce((sum, p) => sum + p.total_earnings, 0),
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case "standard":
        return "bg-slate-100 text-slate-700";
      case "enterprise":
        return "bg-blue-100 text-blue-700";
      case "kurumsal":
        return "bg-purple-100 text-purple-700";
      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  const getLevelName = (level: string) => {
    switch (level) {
      case "standard":
        return "Standart";
      case "enterprise":
        return "Enterprise";
      case "kurumsal":
        return "Kurumsal";
      default:
        return level;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Partner Yönetimi</h1>
        <p className="text-sm text-slate-600">Aktif partnerleri yönetin ve performanslarını takip edin</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        <div className="card">
          <div className="text-sm text-slate-600">Toplam Partner</div>
          <div className="text-2xl font-bold text-slate-900">{stats.total}</div>
        </div>
        <div className="card">
          <div className="text-sm text-slate-600">Aktif Partner</div>
          <div className="text-2xl font-bold text-green-600">{stats.active}</div>
        </div>
        <div className="card">
          <div className="text-sm text-slate-600">Toplam Referans</div>
          <div className="text-2xl font-bold text-blue-600">{stats.totalReferrals}</div>
        </div>
        <div className="card">
          <div className="text-sm text-slate-600">Toplam Kazanç</div>
          <div className="text-2xl font-bold text-purple-600">₺{stats.totalEarnings.toFixed(2)}</div>
        </div>
      </div>

      <div className="card">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Partner ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-slate-200 py-2 pl-10 pr-4 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </div>

      <div className="card">
        {loading ? (
          <div className="py-12 text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-primary" />
            <p className="mt-4 text-sm text-slate-600">Yükleniyor...</p>
          </div>
        ) : filteredPartners.length === 0 ? (
          <div className="py-12 text-center">
            <Users className="mx-auto h-12 w-12 text-slate-300" />
            <p className="mt-4 text-sm text-slate-600">Partner bulunamadı</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">PARTNER</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-slate-600">PARTNER ID</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-slate-600">SEVİYE</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-slate-600">KOMİSYON</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-slate-600">REFERANS</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-slate-600">KAZANÇ</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-slate-600">DURUM</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600">İŞLEMLER</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredPartners.map((partner) => (
                  <tr key={partner.id} className="hover:bg-slate-50">
                    <td className="px-4 py-4">
                      <div className="font-medium text-slate-900">{partner.name}</div>
                      <div className="text-xs text-slate-500">{partner.email}</div>
                      <div className="text-xs text-slate-500">{partner.phone}</div>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <code className="rounded bg-slate-100 px-2 py-1 text-xs font-mono text-slate-900">
                        {partner.partner_id}
                      </code>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getLevelColor(partner.commission_level)}`}>
                        {getLevelName(partner.commission_level)}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <div className="font-semibold text-slate-900">%{partner.commission_rate}</div>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <div className="flex items-center justify-center gap-1 text-blue-600">
                        <TrendingUp className="h-4 w-4" />
                        <span className="font-semibold">{partner.total_referrals}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <div className="flex items-center justify-center gap-1 text-green-600">
                        <DollarSign className="h-4 w-4" />
                        <span className="font-semibold">₺{partner.total_earnings.toFixed(2)}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <select
                        value={partner.status}
                        onChange={(e) => updatePartner(partner.id, { status: e.target.value })}
                        className="rounded border border-slate-200 px-2 py-1 text-xs focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20"
                      >
                        <option value="active">Aktif</option>
                        <option value="inactive">Pasif</option>
                        <option value="suspended">Askıda</option>
                      </select>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => viewPartnerDetails(partner)}
                          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 hover:text-primary"
                          title="Detayları Görüntüle"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {
                            const newLevel = prompt(
                              `${partner.name} için yeni seviye:\n1 - Standard (%10)\n2 - Enterprise (%20)\n3 - Kurumsal (%30)`,
                              partner.commission_level === "standard" ? "1" : partner.commission_level === "enterprise" ? "2" : "3"
                            );
                            const levelMap: Record<string, { name: string; rate: number }> = {
                              "1": { name: "standard", rate: 10 },
                              "2": { name: "enterprise", rate: 20 },
                              "3": { name: "kurumsal", rate: 30 }
                            };
                            if (newLevel && levelMap[newLevel]) {
                              updatePartner(partner.id, {
                                commission_level: levelMap[newLevel].name,
                                commission_rate: levelMap[newLevel].rate
                              });
                            }
                          }}
                          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 hover:text-blue-600"
                          title="Seviye Değiştir"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => deletePartner(partner.id)}
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

      {selectedPartner && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setSelectedPartner(null)}
        >
          <div
            className="w-full max-w-4xl rounded-xl bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-6 flex items-start justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900">{selectedPartner.name}</h2>
                <p className="text-sm text-slate-600">Partner ID: {selectedPartner.partner_id}</p>
              </div>
              <button
                onClick={() => setSelectedPartner(null)}
                className="rounded-lg p-2 hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            <div className="mb-6 grid gap-4 sm:grid-cols-3">
              <div className="card">
                <div className="text-sm text-slate-600">Komisyon Oranı</div>
                <div className="text-2xl font-bold text-slate-900">%{selectedPartner.commission_rate}</div>
              </div>
              <div className="card">
                <div className="text-sm text-slate-600">Toplam Referans</div>
                <div className="text-2xl font-bold text-blue-600">{selectedPartner.total_referrals}</div>
              </div>
              <div className="card">
                <div className="text-sm text-slate-600">Toplam Kazanç</div>
                <div className="text-2xl font-bold text-green-600">₺{selectedPartner.total_earnings.toFixed(2)}</div>
              </div>
            </div>

            <div className="mb-4">
              <h3 className="text-lg font-semibold text-slate-900">Referanslar ({referrals.length})</h3>
            </div>

            {referrals.length === 0 ? (
              <div className="py-8 text-center text-slate-600">Henüz referans bulunmamaktadır</div>
            ) : (
              <div className="max-h-96 overflow-y-auto">
                <table className="w-full">
                  <thead className="sticky top-0 bg-white">
                    <tr className="border-b border-slate-200 bg-slate-50">
                      <th className="px-4 py-2 text-left text-xs font-semibold text-slate-600">MÜŞTERİ</th>
                      <th className="px-4 py-2 text-center text-xs font-semibold text-slate-600">ÜLKE/VİZE</th>
                      <th className="px-4 py-2 text-center text-xs font-semibold text-slate-600">DURUM</th>
                      <th className="px-4 py-2 text-center text-xs font-semibold text-slate-600">KOMİSYON (₺)</th>
                      <th className="px-4 py-2 text-center text-xs font-semibold text-slate-600">ÖDENDİ</th>
                      <th className="px-4 py-2 text-center text-xs font-semibold text-slate-600">TARİH</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {referrals.map((ref: any) => (
                      <tr key={ref.id}>
                        <td className="px-4 py-3">
                          <div className="text-sm font-medium text-slate-900">{ref.customer_name || "-"}</div>
                          <div className="text-xs text-slate-500">{ref.customer_email || "-"}</div>
                          <div className="text-xs text-slate-400">{ref.customer_phone || "-"}</div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="text-sm text-slate-900">{ref.country_code || "-"}</div>
                          <div className="text-xs text-slate-500">{ref.visa_type || "-"}</div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <select
                            value={ref.application_status}
                            onChange={async (e) => {
                              const newStatus = e.target.value;
                              try {
                                const { error } = await supabase
                                  .from("affiliate_referrals")
                                  .update({ application_status: newStatus })
                                  .eq("id", ref.id);
                                
                                if (error) throw error;
                                await fetchReferrals(selectedPartner.partner_id);
                              } catch (error) {
                                console.error("Error updating status:", error);
                                alert("Durum güncellenirken hata oluştu");
                              }
                            }}
                            className="rounded border border-slate-200 px-2 py-1 text-xs"
                          >
                            <option value="pending">İşlem Bekleniyor</option>
                            <option value="processing">İşlemde</option>
                            <option value="approved">Onaylandı</option>
                            <option value="rejected">Reddedildi</option>
                          </select>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <input
                            type="number"
                            step="0.01"
                            value={ref.commission_amount}
                            onChange={async (e) => {
                              const newAmount = parseFloat(e.target.value) || 0;
                              try {
                                const { error } = await supabase
                                  .from("affiliate_referrals")
                                  .update({ commission_amount: newAmount })
                                  .eq("id", ref.id);
                                
                                if (error) throw error;
                                
                                // Update partner total earnings
                                const totalEarnings = referrals.reduce((sum: number, r: any) => 
                                  sum + (r.id === ref.id ? newAmount : r.commission_amount), 0
                                );
                                
                                await supabase
                                  .from("affiliate_partners")
                                  .update({ total_earnings: totalEarnings })
                                  .eq("id", selectedPartner.id);
                                
                                await fetchReferrals(selectedPartner.partner_id);
                              } catch (error) {
                                console.error("Error updating commission:", error);
                                alert("Komisyon güncellenirken hata oluştu");
                              }
                            }}
                            className="w-24 rounded border border-slate-200 px-2 py-1 text-sm text-center"
                            placeholder="0.00"
                          />
                        </td>
                        <td className="px-4 py-3 text-center">
                          <input
                            type="checkbox"
                            checked={ref.commission_paid}
                            onChange={async (e) => {
                              try {
                                const { error } = await supabase
                                  .from("affiliate_referrals")
                                  .update({ commission_paid: e.target.checked })
                                  .eq("id", ref.id);
                                
                                if (error) throw error;
                                await fetchReferrals(selectedPartner.partner_id);
                              } catch (error) {
                                console.error("Error updating payment status:", error);
                              }
                            }}
                            className="h-4 w-4 rounded border-slate-300 text-primary"
                          />
                        </td>
                        <td className="px-4 py-3 text-center text-xs text-slate-600">
                          {new Date(ref.created_at).toLocaleDateString("tr-TR")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setSelectedPartner(null)}
                className="rounded-lg border border-slate-200 px-4 py-2 font-semibold text-slate-700 hover:bg-slate-50"
              >
                Kapat
              </button>
              <a
                href={`mailto:${selectedPartner.email}`}
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
