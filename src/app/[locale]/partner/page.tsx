"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import {
  Users,
  TrendingUp,
  DollarSign,
  Link as LinkIcon,
  Copy,
  CheckCircle,
  Eye,
  MousePointerClick,
  Monitor,
  Smartphone,
  Tablet,
  Globe,
  Rocket,
  Target,
  Zap,
  Share2,
  MessageCircle,
  Star,
  ArrowUpRight,
  BarChart3,
  Calendar,
} from "lucide-react";

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

interface Analytics {
  totalPageViews: number;
  uniqueVisitors: number;
  totalSessions: number;
  last7DaysViews: number;
  last30DaysViews: number;
  last7DaysVisitors: number;
  deviceBreakdown: { desktop: number; mobile: number; tablet: number };
  topPages: { page: string; views: number }[];
  dailyViews: { date: string; views: number }[];
  conversionRate: number;
  avgPagesPerSession: number;
}

export default function PartnerDashboard() {
  const [loading, setLoading] = useState(true);
  const [partner, setPartner] = useState<Partner | null>(null);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
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

        // Load referrals
        const { data: referralsData } = await supabase
          .from("affiliate_referrals")
          .select("*")
          .eq("partner_id", partnerData.partner_id)
          .order("created_at", { ascending: false });

        setReferrals(referralsData || []);

        // Load analytics from partner_activities
        const { data: activities } = await supabase
          .from("partner_activities")
          .select("*")
          .eq("partner_id", partnerData.partner_id)
          .order("created_at", { ascending: false });

        const { data: sessions } = await supabase
          .from("partner_sessions")
          .select("*")
          .eq("partner_id", partnerData.partner_id);

        const allActivities = activities || [];
        const allSessions = sessions || [];

        const now = new Date();
        const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

        const last7DaysActivities = allActivities.filter(
          (a) => new Date(a.created_at) >= last7Days
        );
        const last30DaysActivities = allActivities.filter(
          (a) => new Date(a.created_at) >= last30Days
        );

        // Device breakdown
        const deviceBreakdown = { desktop: 0, mobile: 0, tablet: 0 };
        allSessions.forEach((s) => {
          const dt = (s.device_type || "").toLowerCase();
          if (dt.includes("mobile")) deviceBreakdown.mobile++;
          else if (dt.includes("tablet")) deviceBreakdown.tablet++;
          else deviceBreakdown.desktop++;
        });

        // Top pages
        const pageCounts: Record<string, number> = {};
        allActivities.forEach((a) => {
          const page = a.page_url || a.page_title || "Bilinmiyor";
          pageCounts[page] = (pageCounts[page] || 0) + 1;
        });
        const topPages = Object.entries(pageCounts)
          .map(([page, views]) => ({ page, views }))
          .sort((a, b) => b.views - a.views)
          .slice(0, 5);

        // Daily views (last 14 days)
        const dailyViews: Record<string, number> = {};
        for (let i = 13; i >= 0; i--) {
          const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
          dailyViews[d.toISOString().split("T")[0]] = 0;
        }
        allActivities.forEach((a) => {
          const date = new Date(a.created_at).toISOString().split("T")[0];
          if (dailyViews[date] !== undefined) {
            dailyViews[date]++;
          }
        });

        const uniqueVisitorIds = new Set(allActivities.map((a) => a.visitor_id).filter(Boolean));
        const last7UniqueVisitors = new Set(
          last7DaysActivities.map((a) => a.visitor_id).filter(Boolean)
        );

        const conversions = allSessions.filter((s) => s.converted).length;
        const totalSessionCount = allSessions.length || 1;

        setAnalytics({
          totalPageViews: allActivities.length,
          uniqueVisitors: uniqueVisitorIds.size,
          totalSessions: allSessions.length,
          last7DaysViews: last7DaysActivities.length,
          last30DaysViews: last30DaysActivities.length,
          last7DaysVisitors: last7UniqueVisitors.size,
          deviceBreakdown,
          topPages,
          dailyViews: Object.entries(dailyViews).map(([date, views]) => ({ date, views })),
          conversionRate: (conversions / totalSessionCount) * 100,
          avgPagesPerSession:
            allSessions.length > 0
              ? allActivities.length / allSessions.length
              : 0,
        });
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

  const levelInfo = {
    standard: { name: "Standart", rate: "10%", color: "bg-slate-100 text-slate-700" },
    enterprise: { name: "Enterprise", rate: "20%", color: "bg-blue-100 text-blue-700" },
    kurumsal: { name: "Kurumsal", rate: "30%", color: "bg-purple-100 text-purple-700" },
  };

  const currentLevel = levelInfo[partner.commission_level as keyof typeof levelInfo] || levelInfo.standard;

  // Motivational messages based on analytics
  const getMotivationalMessage = () => {
    if (!analytics) return null;
    const { totalPageViews, uniqueVisitors } = analytics;

    if (totalPageViews === 0) {
      return {
        emoji: "🚀",
        title: "Hadi Başlayalım!",
        message: "Referans linkinizi paylaşarak ilk ziyaretçinizi kazanın. Her paylaşım bir fırsat!",
        color: "from-blue-500 to-indigo-600",
      };
    }
    if (uniqueVisitors < 5) {
      return {
        emoji: "🌱",
        title: "Harika Bir Başlangıç!",
        message: `${uniqueVisitors} kişi linkinizi ziyaret etti. Daha fazla paylaşım yaparak bu sayıyı artırabilirsiniz!`,
        color: "from-emerald-500 to-teal-600",
      };
    }
    if (uniqueVisitors < 20) {
      return {
        emoji: "🔥",
        title: "Momentum Kazanıyorsunuz!",
        message: `${uniqueVisitors} tekil ziyaretçi ve ${totalPageViews} sayfa görüntüleme! Paylaşımlarınız sonuç veriyor, devam edin!`,
        color: "from-orange-500 to-red-500",
      };
    }
    return {
      emoji: "⭐",
      title: "Süper Partner!",
      message: `${uniqueVisitors} tekil ziyaretçi ile harika bir performans gösteriyorsunuz! Kazancınızı artırmaya devam edin!`,
      color: "from-purple-500 to-pink-500",
    };
  };

  const motivational = getMotivationalMessage();

  // Max value for chart bars
  const maxDailyView = analytics
    ? Math.max(...analytics.dailyViews.map((d) => d.views), 1)
    : 1;

  // Sharing tips
  const sharingTips = [
    {
      icon: Share2,
      title: "Sosyal Medyada Paylaşın",
      desc: "WhatsApp, Instagram, Facebook ve Twitter'da referans linkinizi paylaşın.",
      color: "text-blue-600 bg-blue-50",
    },
    {
      icon: MessageCircle,
      title: "Kişisel Mesaj Gönderin",
      desc: "Vize ihtiyacı olan tanıdıklarınıza doğrudan mesaj atın.",
      color: "text-green-600 bg-green-50",
    },
    {
      icon: Globe,
      title: "Blog veya Web Sitenize Ekleyin",
      desc: "Kendi web siteniz veya blogunuz varsa, linkinizi oraya ekleyin.",
      color: "text-purple-600 bg-purple-50",
    },
    {
      icon: Star,
      title: "Deneyiminizi Paylaşın",
      desc: "Vize deneyimlerinizi anlatırken Kolay Seyahat'i tavsiye edin.",
      color: "text-amber-600 bg-amber-50",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 py-8 md:py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="mb-1 text-2xl font-bold text-slate-900 md:text-3xl">Partner Dashboard</h1>
            <p className="text-slate-600">Hoş geldiniz, {partner.name}</p>
          </div>
          <div className={`rounded-xl px-5 py-2.5 text-sm font-semibold ${currentLevel.color}`}>
            {currentLevel.name} - {currentLevel.rate}
          </div>
        </div>

        {/* Motivational Banner */}
        {motivational && (
          <div className={`mb-8 overflow-hidden rounded-2xl bg-gradient-to-r ${motivational.color} p-6 text-white shadow-lg md:p-8`}>
            <div className="flex items-start gap-4">
              <span className="text-4xl">{motivational.emoji}</span>
              <div>
                <h2 className="mb-1 text-xl font-bold md:text-2xl">{motivational.title}</h2>
                <p className="text-sm text-white/90 md:text-base">{motivational.message}</p>
              </div>
            </div>
          </div>
        )}

        {/* Main Stats Grid */}
        <div className="mb-8 grid gap-4 grid-cols-2 md:grid-cols-5">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-3 inline-flex rounded-lg bg-blue-50 p-2.5">
              <Eye className="h-5 w-5 text-blue-600" />
            </div>
            <p className="text-xs font-medium text-slate-500">Toplam Görüntülenme</p>
            <p className="text-2xl font-bold text-slate-900">{analytics?.totalPageViews || 0}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-3 inline-flex rounded-lg bg-emerald-50 p-2.5">
              <Users className="h-5 w-5 text-emerald-600" />
            </div>
            <p className="text-xs font-medium text-slate-500">Tekil Ziyaretçi</p>
            <p className="text-2xl font-bold text-slate-900">{analytics?.uniqueVisitors || 0}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-3 inline-flex rounded-lg bg-violet-50 p-2.5">
              <MousePointerClick className="h-5 w-5 text-violet-600" />
            </div>
            <p className="text-xs font-medium text-slate-500">Toplam Oturum</p>
            <p className="text-2xl font-bold text-slate-900">{analytics?.totalSessions || 0}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-3 inline-flex rounded-lg bg-amber-50 p-2.5">
              <DollarSign className="h-5 w-5 text-amber-600" />
            </div>
            <p className="text-xs font-medium text-slate-500">Toplam Kazanç</p>
            <p className="text-2xl font-bold text-slate-900">₺{partner.total_earnings.toFixed(2)}</p>
          </div>
          <div className="col-span-2 md:col-span-1 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-3 inline-flex rounded-lg bg-rose-50 p-2.5">
              <TrendingUp className="h-5 w-5 text-rose-600" />
            </div>
            <p className="text-xs font-medium text-slate-500">Komisyon Oranı</p>
            <p className="text-2xl font-bold text-slate-900">%{partner.commission_rate}</p>
          </div>
        </div>

        {/* Analytics Section */}
        {analytics && analytics.totalPageViews > 0 && (
          <div className="mb-8 grid gap-6 md:grid-cols-2">
            {/* Daily Views Chart */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-slate-600" />
                <h3 className="font-semibold text-slate-900">Son 14 Gün - Günlük Ziyaret</h3>
              </div>
              <div className="flex items-end gap-1.5" style={{ height: "140px" }}>
                {analytics.dailyViews.map((day, i) => {
                  const height = maxDailyView > 0 ? (day.views / maxDailyView) * 100 : 0;
                  const dateObj = new Date(day.date);
                  const dayLabel = dateObj.toLocaleDateString("tr-TR", { day: "numeric", month: "short" });
                  return (
                    <div key={i} className="group relative flex flex-1 flex-col items-center justify-end h-full">
                      <div className="absolute -top-6 hidden rounded bg-slate-800 px-2 py-1 text-xs text-white group-hover:block whitespace-nowrap z-10">
                        {dayLabel}: {day.views} ziyaret
                      </div>
                      <div
                        className={`w-full rounded-t transition-all ${
                          day.views > 0 ? "bg-primary hover:bg-primary/80" : "bg-slate-100"
                        }`}
                        style={{ height: `${Math.max(height, 4)}%`, minHeight: "4px" }}
                      />
                      {i % 2 === 0 && (
                        <span className="mt-1 text-[9px] text-slate-400 leading-none">
                          {dateObj.getDate()}/{dateObj.getMonth() + 1}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                <div className="text-xs text-slate-500">
                  <span className="font-semibold text-slate-700">{analytics.last7DaysViews}</span> son 7 gün
                </div>
                <div className="text-xs text-slate-500">
                  <span className="font-semibold text-slate-700">{analytics.last30DaysViews}</span> son 30 gün
                </div>
              </div>
            </div>

            {/* Device & Session Stats */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center gap-2">
                <Monitor className="h-5 w-5 text-slate-600" />
                <h3 className="font-semibold text-slate-900">Ziyaretçi Profili</h3>
              </div>

              {/* Device breakdown */}
              <div className="mb-5">
                <p className="mb-2 text-xs font-medium text-slate-500">Cihaz Dağılımı</p>
                <div className="flex gap-3">
                  {[
                    { icon: Monitor, label: "Masaüstü", count: analytics.deviceBreakdown.desktop, color: "text-blue-600 bg-blue-50" },
                    { icon: Smartphone, label: "Mobil", count: analytics.deviceBreakdown.mobile, color: "text-green-600 bg-green-50" },
                    { icon: Tablet, label: "Tablet", count: analytics.deviceBreakdown.tablet, color: "text-purple-600 bg-purple-50" },
                  ].map((device) => {
                    const DeviceIcon = device.icon;
                    const total = analytics.totalSessions || 1;
                    const pct = Math.round((device.count / total) * 100);
                    return (
                      <div key={device.label} className="flex-1 rounded-xl border border-slate-100 p-3 text-center">
                        <div className={`mx-auto mb-1.5 inline-flex rounded-lg p-2 ${device.color}`}>
                          <DeviceIcon className="h-4 w-4" />
                        </div>
                        <p className="text-lg font-bold text-slate-900">{pct}%</p>
                        <p className="text-[10px] text-slate-500">{device.label}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Quick metrics */}
              <div className="space-y-3">
                <div className="flex items-center justify-between rounded-lg bg-slate-50 px-4 py-2.5">
                  <span className="text-sm text-slate-600">Ort. Sayfa/Oturum</span>
                  <span className="font-semibold text-slate-900">{analytics.avgPagesPerSession.toFixed(1)}</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-slate-50 px-4 py-2.5">
                  <span className="text-sm text-slate-600">Son 7 Gün Ziyaretçi</span>
                  <span className="font-semibold text-slate-900">{analytics.last7DaysVisitors}</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-slate-50 px-4 py-2.5">
                  <span className="text-sm text-slate-600">Toplam Referans</span>
                  <span className="font-semibold text-slate-900">{partner.total_referrals}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Top Pages */}
        {analytics && analytics.topPages.length > 0 && (
          <div className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <Globe className="h-5 w-5 text-slate-600" />
              <h3 className="font-semibold text-slate-900">En Çok Ziyaret Edilen Sayfalar</h3>
            </div>
            <div className="space-y-2">
              {analytics.topPages.map((page, i) => {
                const pct = analytics.totalPageViews > 0
                  ? (page.views / analytics.totalPageViews) * 100
                  : 0;
                return (
                  <div key={i} className="relative overflow-hidden rounded-lg bg-slate-50 px-4 py-3">
                    <div
                      className="absolute inset-y-0 left-0 bg-primary/10"
                      style={{ width: `${pct}%` }}
                    />
                    <div className="relative flex items-center justify-between">
                      <span className="text-sm text-slate-700 truncate max-w-[70%]">
                        {page.page.replace("https://www.kolayseyahat.net", "").replace("https://kolayseyahat.net", "") || "/"}
                      </span>
                      <span className="text-sm font-semibold text-slate-900">{page.views} ziyaret</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Partner Info & Referral Link */}
        <div className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4">
            <h2 className="text-lg font-bold text-slate-900">Partner Bilgileriniz</h2>
            <p className="text-sm text-slate-600">Partner ID ve referans linkiniz</p>
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

            {/* Quick Share Buttons */}
            <div className="flex flex-wrap gap-2 pt-2">
              <a
                href={`https://wa.me/?text=${encodeURIComponent(`Vize başvurunuzu kolayca yapın! ${referralLink}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg bg-green-500 px-4 py-2 text-sm font-semibold text-white hover:bg-green-600 transition-colors"
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                WhatsApp
              </a>
              <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Vize başvurunuzu kolayca yapın! ${referralLink}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg bg-slate-800 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-900 transition-colors"
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                X (Twitter)
              </a>
              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralLink)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                Facebook
              </a>
              <button
                onClick={() => copyToClipboard(referralLink, "share")}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                {copied === "share" ? <CheckCircle className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                Linki Kopyala
              </button>
            </div>
          </div>
        </div>

        {/* Sharing Tips - Always show for encouragement */}
        <div className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-2">
            <Rocket className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-slate-900">Kazancınızı Artırmanın Yolları</h3>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {sharingTips.map((tip, i) => {
              const TipIcon = tip.icon;
              return (
                <div key={i} className="flex gap-3 rounded-xl border border-slate-100 p-4 transition-colors hover:bg-slate-50">
                  <div className={`flex-shrink-0 rounded-lg p-2.5 ${tip.color}`}>
                    <TipIcon className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900">{tip.title}</h4>
                    <p className="mt-0.5 text-xs text-slate-500">{tip.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Referrals Section */}
        <div className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-slate-900">Referanslar ({referrals.length})</h3>
            <p className="mt-2 text-sm text-slate-600">
              Gizlilik nedeniyle müşteri bilgileri gösterilmemektedir. Komisyon tutarları başvuru onaylandıktan sonra ekibimiz tarafından hesaplanacaktır.
            </p>
          </div>

          {referrals.length === 0 ? (
            <div className="rounded-xl bg-gradient-to-br from-slate-50 to-blue-50 py-10 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
                <Target className="h-8 w-8 text-blue-600" />
              </div>
              <h4 className="mb-2 text-lg font-semibold text-slate-900">Henüz referansınız bulunmamaktadır</h4>
              <p className="mx-auto max-w-md text-sm text-slate-600">
                Referans linkinizi paylaşarak veya müşterilerinize adınızı vererek kazanmaya başlayın.
                Her başarılı başvurudan <strong>%{partner.commission_rate} komisyon</strong> kazanırsınız!
              </p>
              {analytics && analytics.totalPageViews > 0 && (
                <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-emerald-100 px-4 py-2 text-sm font-medium text-emerald-700">
                  <Zap className="h-4 w-4" />
                  {analytics.uniqueVisitors} kişi linkinizi ziyaret etti - başvuru yakın!
                </div>
              )}
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

        {/* Bottom Tips */}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5">
            <h3 className="mb-2 flex items-center gap-2 font-semibold text-blue-900">
              <Zap className="h-4 w-4" />
              İpucu
            </h3>
            <p className="text-sm text-blue-800">
              Müşterileriniz başvuru sırasında referans olarak sizin adınızı verirse, bu başvurular manuel olarak 
              sisteme eklenecek ve komisyon haklarınız korunacaktır.
            </p>
          </div>
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
            <h3 className="mb-2 flex items-center gap-2 font-semibold text-emerald-900">
              <ArrowUpRight className="h-4 w-4" />
              Seviye Atlayın
            </h3>
            <p className="text-sm text-emerald-800">
              {partner.commission_level === "standard"
                ? "Daha fazla referans getirerek Enterprise seviyesine yükselin ve %20 komisyon kazanın!"
                : partner.commission_level === "enterprise"
                ? "Harika gidiyorsunuz! Kurumsal seviyeye yükselerek %30 komisyon kazanabilirsiniz!"
                : "En üst seviyedesiniz! %30 komisyon oranıyla kazancınızı maksimize edin!"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
