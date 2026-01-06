"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Users, TrendingUp, DollarSign, Link as LinkIcon, Copy, CheckCircle } from "lucide-react";

interface Partner {
  id: number;
  partner_id: string;
  name: string;
  email: string;
  commission_level: string;
  commission_rate: number;
  total_referrals: number;
  total_earnings: number;
}

interface Referral {
  id: number;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  country_code: string;
  visa_type: string;
  application_status: string;
  commission_amount: number;
  commission_paid: boolean;
  referral_source: string;
  created_at: string;
}

export default function PartnerDashboard() {
  const [loading, setLoading] = useState(true);
  const [partner, setPartner] = useState<Partner | null>(null);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    async function loadPartnerData() {
      try {
        // Check localStorage for partner session
        const sessionStr = localStorage.getItem("partner_session");
        if (!sessionStr) {
          window.location.href = "/partner-giris";
          return;
        }

        const session = JSON.parse(sessionStr);
        
        // Verify session is still valid (not older than 7 days)
        const loginDate = new Date(session.logged_in_at);
        const daysSinceLogin = (Date.now() - loginDate.getTime()) / (1000 * 60 * 60 * 24);
        if (daysSinceLogin > 7) {
          localStorage.removeItem("partner_session");
          window.location.href = "/partner-giris";
          return;
        }

        const { data: partnerData } = await supabase
          .from("affiliate_partners")
          .select("*")
          .eq("email", session.email)
          .eq("status", "active")
          .single();

        if (!partnerData) {
          localStorage.removeItem("partner_session");
          window.location.href = "/partner-giris";
          return;
        }

        setPartner(partnerData);

        const { data: referralsData } = await supabase
          .from("affiliate_referrals")
          .select("*")
          .eq("partner_id", partnerData.partner_id)
          .order("created_at", { ascending: false });

        setReferrals(referralsData || []);
      } catch (error) {
        console.error("Error loading partner data:", error);
        localStorage.removeItem("partner_session");
        window.location.href = "/partner-giris";
      } finally {
        setLoading(false);
      }
    }

    loadPartnerData();
  }, []);

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!partner) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="mb-4 text-3xl font-bold text-slate-900">Partner Dashboard</h1>
          <p className="text-slate-600">
            Henüz onaylanmış bir partner hesabınız bulunmamaktadır. Başvurunuz değerlendirme aşamasında olabilir.
          </p>
        </div>
      </div>
    );
  }

  const referralLink = `https://www.kolayseyahat.net?ref=${partner.partner_id}`;

  const stats = [
    {
      icon: Users,
      label: "Toplam Referans",
      value: partner.total_referrals,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      icon: DollarSign,
      label: "Toplam Kazanç",
      value: `₺${partner.total_earnings.toFixed(2)}`,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      icon: TrendingUp,
      label: "Komisyon Oranı",
      value: `%${partner.commission_rate}`,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
  ];

  const levelInfo = {
    standard: { name: "Standart", rate: "10%", color: "bg-slate-100 text-slate-700" },
    enterprise: { name: "Enterprise", rate: "20%", color: "bg-blue-100 text-blue-700" },
    kurumsal: { name: "Kurumsal", rate: "30%", color: "bg-purple-100 text-purple-700" },
  };

  const currentLevel = levelInfo[partner.commission_level as keyof typeof levelInfo] || levelInfo.standard;

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold text-slate-900">Partner Dashboard</h1>
          <p className="text-slate-600">Hoş geldiniz, {partner.name}</p>
        </div>

        <div className="mb-8 grid gap-6 md:grid-cols-3">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="card">
                <div className={`mb-4 inline-flex rounded-lg ${stat.bg} p-3`}>
                  <Icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <p className="text-sm text-slate-600">{stat.label}</p>
                <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
              </div>
            );
          })}
        </div>

        <div className="mb-8 card">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Partner Bilgileriniz</h2>
              <p className="text-sm text-slate-600">Partner ID ve referans linkiniz</p>
            </div>
            <div className={`rounded-lg px-4 py-2 text-sm font-semibold ${currentLevel.color}`}>
              {currentLevel.name} - {currentLevel.rate}
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">Partner ID</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={partner.partner_id}
                  readOnly
                  className="flex-1 rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 font-mono text-sm"
                />
                <button
                  onClick={() => copyToClipboard(partner.partner_id, "id")}
                  className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  {copied === "id" ? <CheckCircle className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">Referans Linkiniz</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={referralLink}
                  readOnly
                  className="flex-1 rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-sm"
                />
                <button
                  onClick={() => copyToClipboard(referralLink, "link")}
                  className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  {copied === "link" ? <CheckCircle className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>
              <p className="mt-2 text-xs text-slate-500">
                Bu linki paylaşarak müşteri yönlendirin. Link üzerinden gelen başvurular otomatik olarak size atanır.
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-slate-900">Referanslar ({referrals.length})</h3>
            <p className="mt-2 text-sm text-slate-600">
              Gizlilik nedeniyle müşteri bilgileri gösterilmemektedir. Komisyon tutarları başvuru onaylandıktan sonra ekibimiz tarafından hesaplanacaktır.
            </p>
          </div>

          {referrals.length === 0 ? (
            <div className="py-12 text-center">
              <LinkIcon className="mx-auto mb-4 h-12 w-12 text-slate-300" />
              <p className="text-slate-600">Henüz referansınız bulunmamaktadır.</p>
              <p className="mt-2 text-sm text-slate-500">
                Referans linkinizi paylaşarak veya müşterilerinize adınızı vererek kazanmaya başlayın.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr className="border-b border-slate-200">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">BAŞVURU</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-slate-600">ÜLKE/VİZE</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-slate-600">DURUM</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-slate-600">KOMİSYON</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-slate-600">TARİH</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {referrals.map((ref, index) => (
                    <tr key={ref.id}>
                      <td className="px-4 py-3">
                        <div className="text-sm font-medium text-slate-900">Başvuru #{index + 1}</div>
                        <div className="text-xs text-slate-500">{ref.referral_source === 'link' ? '🔗 Link' : '📞 Manuel'}</div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="text-sm text-slate-900">{ref.country_code || "-"}</div>
                        <div className="text-xs text-slate-500">{ref.visa_type || "-"}</div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                            ref.application_status === "approved"
                              ? "bg-green-100 text-green-700"
                              : ref.application_status === "pending"
                              ? "bg-yellow-100 text-yellow-700"
                              : ref.application_status === "processing"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {ref.application_status === "pending" ? "İşlem Bekleniyor" :
                           ref.application_status === "processing" ? "İşlemde" :
                           ref.application_status === "approved" ? "Onaylandı" : 
                           ref.application_status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {ref.commission_amount > 0 ? (
                          <div className="text-sm font-semibold text-green-600">
                            ₺{ref.commission_amount.toFixed(2)}
                          </div>
                        ) : (
                          <div className="text-xs text-slate-400">Belirlenmedi</div>
                        )}
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
        </div>

        <div className="mt-8 card bg-blue-50">
          <h3 className="mb-2 font-semibold text-blue-900">💡 İpucu</h3>
          <p className="text-sm text-blue-800">
            Müşterileriniz başvuru sırasında referans olarak sizin adınızı verirse, bu başvurular manuel olarak 
            sisteme eklenecek ve komisyon haklarınız korunacaktır.
          </p>
        </div>
      </div>
    </div>
  );
}
