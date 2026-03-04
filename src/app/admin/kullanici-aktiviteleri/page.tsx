"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import {
    Users,
    Eye,
    MousePointerClick,
    FileText,
    CheckCircle2,
    TrendingUp,
    Monitor,
    Smartphone,
    Tablet,
    Globe,
    Activity,
    ArrowRight,
    User
} from "lucide-react";

interface GlobalStats {
    total_sessions: number;
    unique_visitors: number;
    total_page_views: number;
    total_conversions: number;
    conversion_rate: number;
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
    partner_id: string | null;
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
    partner_id: string | null;
}

export default function GlobalActivitiesPage() {
    const router = useRouter();

    const [stats, setStats] = useState<GlobalStats | null>(null);
    const [activities, setActivities] = useState<ActivityLog[]>([]);
    const [sessions, setSessions] = useState<Session[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<"overview" | "activities" | "sessions">("overview");
    const [dateRange, setDateRange] = useState<"today" | "7d" | "30d" | "90d" | "all">("today");

    useEffect(() => {
        fetchGlobalData();
    }, [dateRange]);

    const fetchGlobalData = async () => {
        try {
            setLoading(true);
            const dateFilter = getDateFilter(dateRange);

            await fetchStats(dateFilter);
            await fetchActivities(dateFilter);
            await fetchSessions(dateFilter);

        } catch (error) {
            console.error("Error fetching global data:", error);
            alert("Kullanıcı verileri yüklenirken hata oluştu");
        } finally {
            setLoading(false);
        }
    };

    const getDateFilter = (range: string) => {
        const now = new Date();
        switch (range) {
            case "today":
                return new Date(now.setHours(0, 0, 0, 0)).toISOString();
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
            let sessionsQuery = supabase.from("partner_sessions").select("*");
            if (dateFilter) sessionsQuery = sessionsQuery.gte("created_at", dateFilter);

            const { data: sessionsData } = await sessionsQuery;

            let activitiesQuery = supabase.from("partner_activities").select("*");
            if (dateFilter) activitiesQuery = activitiesQuery.gte("created_at", dateFilter);

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
                .order("created_at", { ascending: false })
                .limit(200);

            if (dateFilter) query = query.gte("created_at", dateFilter);

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
                .order("created_at", { ascending: false })
                .limit(100);

            if (dateFilter) query = query.gte("created_at", dateFilter);

            const { data, error } = await query;
            if (error) throw error;
            setSessions(data || []);
        } catch (error) {
            console.error("Error fetching sessions:", error);
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
            case "page_view": return <Eye className="h-4 w-4" />;
            case "country_view": return <Globe className="h-4 w-4" />;
            case "package_view": return <FileText className="h-4 w-4" />;
            case "form_start": return <Activity className="h-4 w-4" />;
            case "form_submit": return <CheckCircle2 className="h-4 w-4" />;
            case "button_click": return <MousePointerClick className="h-4 w-4" />;
            default: return <Activity className="h-4 w-4" />;
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
            case "mobile": return <Smartphone className="h-4 w-4" />;
            case "tablet": return <Tablet className="h-4 w-4" />;
            default: return <Monitor className="h-4 w-4" />;
        }
    };

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="text-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
                    <p className="mt-4 text-gray-600">Veriler yükleniyor...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex-col flex overflow-y-auto">
            <div className="p-8 pb-12 w-full max-w-[1200px] mx-auto">
                {/* Header */}
                <div className="mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Kullanıcı Aktiviteleri (Global)</h1>
                        <p className="text-sm text-gray-600 mt-1">
                            Organik ve affiliate kanallarından gelen tüm kullanıcı etkileşimlerini takip edin.
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <select
                            value={dateRange}
                            onChange={(e) => setDateRange(e.target.value as any)}
                            className="rounded-lg border border-gray-300 px-4 py-2 text-sm bg-white"
                        >
                            <option value="today">Bugün</option>
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
                                    <p className="text-sm text-gray-600">Toplam Ziyaret (Oturum)</p>
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
                                <User className="h-8 w-8 text-green-600" />
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
                            className={`border-b-2 px-4 py-2 text-sm font-medium ${activeTab === "overview"
                                    ? "border-blue-600 text-blue-600"
                                    : "border-transparent text-gray-600 hover:text-gray-900"
                                }`}
                        >
                            Genel Bakış
                        </button>
                        <button
                            onClick={() => setActiveTab("activities")}
                            className={`border-b-2 px-4 py-2 text-sm font-medium ${activeTab === "activities"
                                    ? "border-blue-600 text-blue-600"
                                    : "border-transparent text-gray-600 hover:text-gray-900"
                                }`}
                        >
                            Son Aktiviteler ({activities.length})
                        </button>
                        <button
                            onClick={() => setActiveTab("sessions")}
                            className={`border-b-2 px-4 py-2 text-sm font-medium ${activeTab === "sessions"
                                    ? "border-blue-600 text-blue-600"
                                    : "border-transparent text-gray-600 hover:text-gray-900"
                                }`}
                        >
                            Son Oturumlar ({sessions.length})
                        </button>
                    </div>
                </div>

                {/* Tab Content */}
                <div className="rounded-lg bg-white p-6 shadow">
                    {activeTab === "overview" && (
                        <div className="space-y-6">
                            <div>
                                <h3 className="mb-4 text-lg font-semibold border-b pb-2">Hızlı Metrikler</h3>
                                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                                    <div className="rounded-lg border border-gray-100 bg-gray-50/50 p-4">
                                        <p className="text-sm text-gray-500">Sayfa Görüntüleme</p>
                                        <p className="text-xl font-bold text-gray-800">{stats?.total_page_views}</p>
                                    </div>
                                    <div className="rounded-lg border border-gray-100 bg-gray-50/50 p-4">
                                        <p className="text-sm text-gray-500">Form Başlatma</p>
                                        <p className="text-xl font-bold text-gray-800">{stats?.form_starts}</p>
                                    </div>
                                    <div className="rounded-lg border border-gray-100 bg-gray-50/50 p-4">
                                        <p className="text-sm text-gray-500">Form Gönderme</p>
                                        <p className="text-xl font-bold text-gray-800">{stats?.form_submissions}</p>
                                    </div>
                                    <div className="rounded-lg border border-gray-100 bg-gray-50/50 p-4">
                                        <p className="text-sm text-gray-500">Form Dönüşümü</p>
                                        <p className="text-xl font-bold text-gray-800">{stats?.total_conversions}</p>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <div className="flex justify-between items-center mb-4 border-b pb-2">
                                    <h3 className="text-lg font-semibold">Öne Çıkan Aktiviteler</h3>
                                    <button onClick={() => setActiveTab('activities')} className="text-sm text-blue-600 flex items-center gap-1 hover:underline">
                                        Tümünü Gör <ArrowRight className="w-4 h-4" />
                                    </button>
                                </div>
                                <div className="space-y-2">
                                    {activities.slice(0, 8).map((activity) => (
                                        <div
                                            key={activity.id}
                                            className="flex items-center justify-between rounded-lg border border-gray-100 p-3 hover:bg-gray-50 transition-colors"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                                                    {getActivityIcon(activity.activity_type)}
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <p className="text-sm font-medium text-gray-800">
                                                            {getActivityLabel(activity.activity_type)}
                                                        </p>
                                                        {!activity.partner_id ? (
                                                            <span className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded uppercase font-bold tracking-wider">Organik</span>
                                                        ) : (
                                                            <span className="text-[10px] bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded uppercase font-bold tracking-wider cursor-pointer" onClick={() => router.push(`/admin/partnerler/${activity.partner_id}`)}>Partner</span>
                                                        )}
                                                    </div>

                                                    <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                                                        <span className="truncate max-w-[200px] md:max-w-xs">{activity.page_title || activity.page_url}</span>
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4 text-xs text-gray-500">
                                                <div className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded">
                                                    {getDeviceIcon(activity.device_type)}
                                                    <span className="capitalize">{activity.device_type}</span>
                                                </div>
                                                <span className="hidden sm:inline-block">{formatDate(activity.created_at)}</span>
                                            </div>
                                        </div>
                                    ))}
                                    {activities.length === 0 && <p className="text-sm text-gray-500 text-center py-4">Gösterilecek aktivite bulunamadı.</p>}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === "activities" && (
                        <div className="space-y-3">
                            {activities.length === 0 ? (
                                <p className="text-center text-gray-600 py-8">Seçili tarih aralığında aktivite bulunamadı.</p>
                            ) : (
                                activities.map((activity) => (
                                    <div
                                        key={activity.id}
                                        className="rounded-lg border border-gray-200 p-4 hover:bg-gray-50"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-start gap-4">
                                                <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg shrink-0">
                                                    {getActivityIcon(activity.activity_type)}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex flex-wrap items-center gap-2 mb-1">
                                                        <h4 className="font-semibold text-gray-900">
                                                            {getActivityLabel(activity.activity_type)}
                                                        </h4>
                                                        {!activity.partner_id ? (
                                                            <span className="text-[10px] bg-gray-100 text-gray-600 border border-gray-200 px-2 py-0.5 rounded-full font-medium">Organik Trafik</span>
                                                        ) : (
                                                            <span className="text-[10px] bg-purple-50 text-purple-700 border border-purple-200 px-2 py-0.5 rounded-full font-medium flex items-center gap-1 cursor-pointer hover:bg-purple-100" onClick={() => router.push(`/admin/partnerler/${activity.partner_id}`)}>
                                                                Partner: {activity.partner_id}
                                                            </span>
                                                        )}
                                                        {activity.country_name && (
                                                            <span className="rounded-full bg-blue-100/50 border border-blue-200 px-2 py-0.5 text-xs text-blue-700">
                                                                {activity.country_name}
                                                            </span>
                                                        )}
                                                        {activity.package_name && (
                                                            <span className="rounded-full bg-emerald-100/50 border border-emerald-200 px-2 py-0.5 text-xs text-emerald-700">
                                                                {activity.package_name}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-sm text-gray-600 mb-2 truncate max-w-full md:max-w-2xl" title={activity.page_url}>
                                                        {activity.page_title || activity.page_url}
                                                    </p>
                                                    <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                                                        <span className="flex items-center gap-1.5 bg-gray-100 px-2 py-1 rounded">
                                                            {getDeviceIcon(activity.device_type)}
                                                            <span className="capitalize">{activity.device_type}</span>
                                                        </span>
                                                        <span className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded">{activity.browser}</span>
                                                        <span className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded">{activity.os}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right flex flex-col justify-between items-end gap-2 shrink-0">
                                                <p className="text-sm font-medium text-gray-700 bg-gray-50/80 px-2 py-1 rounded border">
                                                    {formatDate(activity.created_at)}
                                                </p>
                                                <p className="text-[11px] text-gray-400 font-mono tracking-wider" title={`Session ID: ${activity.session_id}`}>
                                                    {activity.session_id.slice(-8)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}

                    {activeTab === "sessions" && (
                        <div className="space-y-3">
                            {sessions.length === 0 ? (
                                <p className="text-center text-gray-600 py-8">Seçili tarih aralığında oturum bulunamadı.</p>
                            ) : (
                                sessions.map((session) => (
                                    <div
                                        key={session.id}
                                        className="rounded-lg border border-gray-200 p-4 hover:border-blue-300 transition-colors"
                                    >
                                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <p className="font-semibold text-gray-900 font-mono bg-gray-100 px-2 py-1 rounded text-sm">
                                                        #{session.session_id.slice(-8)}
                                                    </p>
                                                    {!session.partner_id ? (
                                                        <span className="text-[10px] bg-gray-100 text-gray-600 border border-gray-200 px-2 py-0.5 rounded-full font-medium">Organik</span>
                                                    ) : (
                                                        <span className="text-[10px] bg-purple-50 text-purple-700 border border-purple-200 px-2 py-0.5 rounded-full font-medium cursor-pointer hover:bg-purple-100" onClick={() => router.push(`/admin/partnerler/${session.partner_id}`)}>
                                                            {session.partner_id}
                                                        </span>
                                                    )}
                                                    {session.converted && (
                                                        <span className="rounded-full border border-green-200 bg-green-50 px-2.5 py-0.5 text-xs font-semibold text-green-700 flex items-center gap-1 shadow-sm">
                                                            <CheckCircle2 className="w-3 h-3" /> Dönüştü
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="mb-3 space-y-1">
                                                    <p className="text-sm text-gray-600 flex items-center gap-2">
                                                        <span className="text-gray-400 font-medium">Giriş Sayfası:</span>
                                                        <span className="truncate max-w-sm md:max-w-md" title={session.landing_page}>{session.landing_page}</span>
                                                    </p>
                                                </div>
                                                <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                                                    <span className="flex items-center gap-1.5 bg-gray-50 border px-2 py-1 rounded-md">
                                                        {getDeviceIcon(session.device_type)}
                                                        <span className="capitalize">{session.device_type}</span>
                                                    </span>
                                                    <span className="bg-gray-50 border px-2 py-1 rounded-md">{session.browser}</span>
                                                    <span className="bg-gray-50 border px-2 py-1 rounded-md">{session.os}</span>
                                                    <span className="flex items-center gap-1.5 bg-blue-50 text-blue-700 border border-blue-100 px-2 py-1 rounded-md font-medium">
                                                        <Eye className="h-3.5 w-3.5" />
                                                        {session.total_page_views || 0} Sayfa Görüntüleme
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="md:text-right shrink-0 bg-gray-50 rounded-lg p-3 border border-gray-100 flex flex-col gap-2">
                                                <div>
                                                    <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-0.5">İlk Ziyaret</p>
                                                    <p className="text-xs font-medium text-gray-800">
                                                        {formatDate(session.first_visit)}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-0.5">Son Aktivite</p>
                                                    <p className="text-xs font-medium text-gray-800">
                                                        {formatDate(session.last_activity)}
                                                    </p>
                                                </div>
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
