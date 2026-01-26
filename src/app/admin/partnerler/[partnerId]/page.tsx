"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import {
  ArrowLeft,
  Users,
  Eye,
  MousePointerClick,
  FileText,
  CheckCircle2,
  Clock,
  TrendingUp,
  Monitor,
  Smartphone,
  Tablet,
  Globe,
  Calendar,
  Activity,
} from "lucide-react";

interface PartnerStats {
  total_sessions: number;
  unique_visitors: number;
  total_page_views: number;
  total_conversions: number;
  conversion_rate: number;
  avg_session_duration: number;
  form_starts: number;
  form_submissions: number;
  form_completion_rate: number;
}

interface ActivityLog {
  id: number;
  activity_type: string;
  page_url: string;
  page_title: string;
  country_name: string;
  package_name: string;
  device_type: string;
  browser: string;
  os: string;
  created_at: string;
  session_id: string;
  visitor_id: string;
}

interface Session {
  id: number;
  session_id: string;
  visitor_id: string;
  first_visit: string;
  last_activity: string;
  total_page_views: number;
  converted: boolean;
  landing_page: string;
  device_type: string;
  browser: string;
  os: string;
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
  created_at: string;
}

export default function PartnerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const partnerId = params.partnerId as string;

  const [partner, setPartner] = useState<any>(null);
  const [stats, setStats] = useState<PartnerStats | null>(null);
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "activities" | "sessions" | "referrals">("overview");
  const [dateRange, setDateRange] = useState<"7d" | "30d" | "90d" | "all">("30d");

  useEffect(() => {
    if (partnerId) {
      fetchPartnerData();
    }
  }, [partnerId, dateRange]);

  const fetchPartnerData = async () => {
    try {
      setLoading(true);

      // Fetch partner info
      const { data: partnerData, error: partnerError } = await supabase
        .from("affiliate_partners")
        .select("*")
        .eq("partner_id", partnerId)
        .single();

      if (partnerError) throw partnerError;
      setPartner(partnerData);

      // Calculate date filter
      const dateFilter = getDateFilter(dateRange);

      // Fetch statistics
      await fetchStats(dateFilter);
      
      // Fetch activities
      await fetchActivities(dateFilter);
      
      // Fetch sessions
      await fetchSessions(dateFilter);
      
      // Fetch referrals
      await fetchReferrals(dateFilter);

    } catch (error) {
      console.error("Error fetching partner data:", error);
      alert("Partner bilgileri yüklenirken hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  const getDateFilter = (range: string) => {
    const now = new Date();
    switch (range) {
      case "7d":
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
      case "30d":
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
      case "90d":
        return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString();
      default:
        return null;
    }
  };

  const fetchStats = async (dateFilter: string | null) => {
    try {
      let sessionsQuery = supabase
        .from("partner_sessions")
        .select("*")
        .eq("partner_id", partnerId);

      if (dateFilter) {
        sessionsQuery = sessionsQuery.gte("created_at", dateFilter);
      }

      const { data: sessionsData } = await sessionsQuery;

      let activitiesQuery = supabase
        .from("partner_activities")
        .select("*")
        .eq("partner_id", partnerId);

      if (dateFilter) {
        activitiesQuery = activitiesQuery.gte("created_at", dateFilter);
      }

      const { data: activitiesData } = await activitiesQuery;

      const totalSessions = sessionsData?.length || 0;
      const uniqueVisitors = new Set(sessionsData?.map(s => s.visitor_id)).size;
      const totalPageViews = activitiesData?.filter(a => a.activity_type === "page_view").length || 0;
      const totalConversions = sessionsData?.filter(s => s.converted).length || 0;
      const formStarts = activitiesData?.filter(a => a.activity_type === "form_start").length || 0;
      const formSubmissions = activitiesData?.filter(a => a.activity_type === "form_submit").length || 0;

      setStats({
        total_sessions: totalSessions,
        unique_visitors: uniqueVisitors,
        total_page_views: totalPageViews,
        total_conversions: totalConversions,
        conversion_rate: totalSessions > 0 ? (totalConversions / totalSessions) * 100 : 0,
        avg_session_duration: 0,
        form_starts: formStarts,
        form_submissions: formSubmissions,
        form_completion_rate: formStarts > 0 ? (formSubmissions / formStarts) * 100 : 0,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const fetchActivities = async (dateFilter: string | null) => {
    try {
      let query = supabase
        .from("partner_activities")
        .select("*")
        .eq("partner_id", partnerId)
        .order("created_at", { ascending: false })
        .limit(100);

      if (dateFilter) {
        query = query.gte("created_at", dateFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      setActivities(data || []);
    } catch (error) {
      console.error("Error fetching activities:", error);
    }
  };

  const fetchSessions = async (dateFilter: string | null) => {
    try {
      let query = supabase
        .from("partner_sessions")
        .select("*")
        .eq("partner_id", partnerId)
        .order("created_at", { ascending: false })
        .limit(50);

      if (dateFilter) {
        query = query.gte("created_at", dateFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      setSessions(data || []);
    } catch (error) {
      console.error("Error fetching sessions:", error);
    }
  };

  const fetchReferrals = async (dateFilter: string | null) => {
    try {
      let query = supabase
        .from("affiliate_referrals")
        .select("*")
        .eq("partner_id", partnerId)
        .order("created_at", { ascending: false });

      if (dateFilter) {
        query = query.gte("created_at", dateFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      setReferrals(data || []);
    } catch (error) {
      console.error("Error fetching referrals:", error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("tr-TR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "page_view":
        return <Eye className="h-4 w-4" />;
      case "country_view":
        return <Globe className="h-4 w-4" />;
      case "package_view":
        return <FileText className="h-4 w-4" />;
      case "form_start":
        return <Activity className="h-4 w-4" />;
      case "form_submit":
        return <CheckCircle2 className="h-4 w-4" />;
      case "button_click":
        return <MousePointerClick className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const getActivityLabel = (type: string) => {
    const labels: Record<string, string> = {
      page_view: "Sayfa Görüntüleme",
      country_view: "Ülke Görüntüleme",
      package_view: "Paket Görüntüleme",
      form_start: "Form Başlatma",
      form_submit: "Form Gönderme",
      button_click: "Buton Tıklama",
    };
    return labels[type] || type;
  };

  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType) {
      case "mobile":
        return <Smartphone className="h-4 w-4" />;
      case "tablet":
        return <Tablet className="h-4 w-4" />;
      default:
        return <Monitor className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
          <p className="mt-4 text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!partner) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-gray-600">Partner bulunamadı</p>
          <button
            onClick={() => router.push("/admin/partnerler")}
            className="mt-4 text-blue-600 hover:underline"
          >
            Geri Dön
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push("/admin/partnerler")}
              className="rounded-lg p-2 hover:bg-gray-200"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{partner.name}</h1>
              <p className="text-sm text-gray-600">
                Partner ID: {partner.partner_id} • {partner.email}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value as any)}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm"
            >
              <option value="7d">Son 7 Gün</option>
              <option value="30d">Son 30 Gün</option>
              <option value="90d">Son 90 Gün</option>
              <option value="all">Tüm Zamanlar</option>
            </select>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg bg-white p-6 shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Toplam Ziyaret</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total_sessions}</p>
                </div>
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </div>

            <div className="rounded-lg bg-white p-6 shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Benzersiz Ziyaretçi</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.unique_visitors}</p>
                </div>
                <Eye className="h-8 w-8 text-green-600" />
              </div>
            </div>

            <div className="rounded-lg bg-white p-6 shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Dönüşüm Oranı</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.conversion_rate.toFixed(1)}%
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-600" />
              </div>
            </div>

            <div className="rounded-lg bg-white p-6 shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Form Tamamlama</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.form_completion_rate.toFixed(1)}%
                  </p>
                </div>
                <CheckCircle2 className="h-8 w-8 text-emerald-600" />
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200">
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab("overview")}
              className={`border-b-2 px-4 py-2 text-sm font-medium ${
                activeTab === "overview"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              Genel Bakış
            </button>
            <button
              onClick={() => setActiveTab("activities")}
              className={`border-b-2 px-4 py-2 text-sm font-medium ${
                activeTab === "activities"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              Aktiviteler ({activities.length})
            </button>
            <button
              onClick={() => setActiveTab("sessions")}
              className={`border-b-2 px-4 py-2 text-sm font-medium ${
                activeTab === "sessions"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              Oturumlar ({sessions.length})
            </button>
            <button
              onClick={() => setActiveTab("referrals")}
              className={`border-b-2 px-4 py-2 text-sm font-medium ${
                activeTab === "referrals"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              Başvurular ({referrals.length})
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="rounded-lg bg-white p-6 shadow">
          {activeTab === "overview" && (
            <div className="space-y-6">
              <div>
                <h3 className="mb-4 text-lg font-semibold">İstatistikler</h3>
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                  <div className="rounded-lg border border-gray-200 p-4">
                    <p className="text-sm text-gray-600">Sayfa Görüntüleme</p>
                    <p className="text-xl font-bold">{stats?.total_page_views}</p>
                  </div>
                  <div className="rounded-lg border border-gray-200 p-4">
                    <p className="text-sm text-gray-600">Form Başlatma</p>
                    <p className="text-xl font-bold">{stats?.form_starts}</p>
                  </div>
                  <div className="rounded-lg border border-gray-200 p-4">
                    <p className="text-sm text-gray-600">Form Gönderme</p>
                    <p className="text-xl font-bold">{stats?.form_submissions}</p>
                  </div>
                  <div className="rounded-lg border border-gray-200 p-4">
                    <p className="text-sm text-gray-600">Dönüşüm</p>
                    <p className="text-xl font-bold">{stats?.total_conversions}</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="mb-4 text-lg font-semibold">Son Aktiviteler</h3>
                <div className="space-y-2">
                  {activities.slice(0, 10).map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-center justify-between rounded-lg border border-gray-200 p-3"
                    >
                      <div className="flex items-center gap-3">
                        {getActivityIcon(activity.activity_type)}
                        <div>
                          <p className="text-sm font-medium">
                            {getActivityLabel(activity.activity_type)}
                          </p>
                          <p className="text-xs text-gray-600">
                            {activity.page_title || activity.page_url}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        {getDeviceIcon(activity.device_type)}
                        <span>{formatDate(activity.created_at)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "activities" && (
            <div className="space-y-2">
              {activities.length === 0 ? (
                <p className="text-center text-gray-600">Henüz aktivite yok</p>
              ) : (
                activities.map((activity) => (
                  <div
                    key={activity.id}
                    className="rounded-lg border border-gray-200 p-4 hover:bg-gray-50"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        {getActivityIcon(activity.activity_type)}
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium">
                              {getActivityLabel(activity.activity_type)}
                            </p>
                            {activity.country_name && (
                              <span className="rounded bg-blue-100 px-2 py-0.5 text-xs text-blue-700">
                                {activity.country_name}
                              </span>
                            )}
                            {activity.package_name && (
                              <span className="rounded bg-green-100 px-2 py-0.5 text-xs text-green-700">
                                {activity.package_name}
                              </span>
                            )}
                          </div>
                          <p className="mt-1 text-sm text-gray-600">
                            {activity.page_title || activity.page_url}
                          </p>
                          <div className="mt-2 flex items-center gap-4 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              {getDeviceIcon(activity.device_type)}
                              {activity.device_type}
                            </span>
                            <span>{activity.browser}</span>
                            <span>{activity.os}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">
                          {formatDate(activity.created_at)}
                        </p>
                        <p className="mt-1 text-xs text-gray-500">
                          Session: {activity.session_id.slice(-8)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === "sessions" && (
            <div className="space-y-2">
              {sessions.length === 0 ? (
                <p className="text-center text-gray-600">Henüz oturum yok</p>
              ) : (
                sessions.map((session) => (
                  <div
                    key={session.id}
                    className="rounded-lg border border-gray-200 p-4 hover:bg-gray-50"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">
                            Oturum #{session.session_id.slice(-8)}
                          </p>
                          {session.converted && (
                            <span className="rounded bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                              Dönüştü ✓
                            </span>
                          )}
                        </div>
                        <p className="mt-1 text-sm text-gray-600">
                          Landing: {session.landing_page}
                        </p>
                        <div className="mt-2 flex items-center gap-4 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            {getDeviceIcon(session.device_type)}
                            {session.device_type}
                          </span>
                          <span>{session.browser}</span>
                          <span>{session.os}</span>
                          <span className="flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            {session.total_page_views} sayfa
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">
                          {formatDate(session.first_visit)}
                        </p>
                        <p className="mt-1 text-xs text-gray-500">
                          Son: {formatDate(session.last_activity)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === "referrals" && (
            <div className="space-y-2">
              {referrals.length === 0 ? (
                <p className="text-center text-gray-600">Henüz başvuru yok</p>
              ) : (
                referrals.map((referral) => (
                  <div
                    key={referral.id}
                    className="rounded-lg border border-gray-200 p-4 hover:bg-gray-50"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium">{referral.customer_name}</p>
                        <p className="text-sm text-gray-600">{referral.customer_email}</p>
                        <p className="text-sm text-gray-600">{referral.customer_phone}</p>
                        <div className="mt-2 flex items-center gap-2">
                          <span className="rounded bg-blue-100 px-2 py-0.5 text-xs text-blue-700">
                            {referral.country_code}
                          </span>
                          <span className="rounded bg-purple-100 px-2 py-0.5 text-xs text-purple-700">
                            {referral.visa_type}
                          </span>
                          <span
                            className={`rounded px-2 py-0.5 text-xs ${
                              referral.application_status === "approved"
                                ? "bg-green-100 text-green-700"
                                : referral.application_status === "rejected"
                                ? "bg-red-100 text-red-700"
                                : "bg-yellow-100 text-yellow-700"
                            }`}
                          >
                            {referral.application_status}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">
                          {referral.commission_amount > 0
                            ? `₺${referral.commission_amount.toFixed(2)}`
                            : "Belirlenmedi"}
                        </p>
                        {referral.commission_paid && (
                          <span className="mt-1 inline-block rounded bg-green-100 px-2 py-0.5 text-xs text-green-700">
                            Ödendi ✓
                          </span>
                        )}
                        <p className="mt-2 text-xs text-gray-500">
                          {formatDate(referral.created_at)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
