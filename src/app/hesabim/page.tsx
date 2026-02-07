"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { getCurrentUser } from "@/lib/auth";
import type { User } from "@/lib/auth";
import {
  FileText,
  Mail,
  User as UserIcon,
  Calendar,
  CheckCircle,
  Clock,
  XCircle,
  FileSignature,
  Send,
  Eye,
  Loader2,
  MessageCircle,
  Heart,
  Copy,
  Download,
  Trash2,
  AlertTriangle,
  Building2,
  CreditCard,
  Plane,
  MapPin,
  Globe,
  TrendingUp,
  Search,
  History,
  Star,
  ArrowRight,
  Sparkles,
  Shield,
  LogIn,
} from "lucide-react";

interface Application {
  id: number;
  full_name: string;
  email: string;
  phone: string;
  country_name: string;
  package_name: string;
  status: string;
  created_at: string;
  notes?: string;
  payment_status?: string;
  total_amount?: number;
  tl_amount?: number;
  package_currency?: string;
  person_count?: number;
}

interface Question {
  id: number;
  title: string;
  contents: string;
  status: number;
  created_at: string;
  replies?: any[];
}

interface Comment {
  id: number;
  contents: string;
  star: number;
  status: number;
  created_at: string;
  user_id: number;
}

interface Favorite {
  id: number;
  country_id: number;
  country_name: string;
  country_slug: string;
  created_at: string;
}

interface SearchHistoryItem {
  id: number;
  country_name: string;
  country_slug: string;
  page_url: string;
  search_type: string;
  created_at: string;
}

const statusConfig = {
  new: { label: "Yeni", color: "bg-blue-100 text-blue-700", icon: Clock },
  processing: { label: "İşleniyor", color: "bg-yellow-100 text-yellow-700", icon: Clock },
  approved: { label: "Onaylandı", color: "bg-green-100 text-green-700", icon: CheckCircle },
  rejected: { label: "Reddedildi", color: "bg-red-100 text-red-700", icon: XCircle },
};

export default function HesabimPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'applications' | 'questions' | 'comments' | 'favorites' | 'settings'>('overview');
  const [copied, setCopied] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const userData = await getCurrentUser();
    if (!userData) {
      router.push("/giris");
      return;
    }
    setUser(userData);
    fetchApplications(userData.email);
    fetchQuestions(userData.id);
    fetchComments(userData.id);
    fetchFavorites(userData.id);
    fetchSearchHistory(userData.id);
  };

  const fetchApplications = async (email: string) => {
    try {
      const { data, error } = await supabase
        .from("applications")
        .select("*")
        .eq("email", email)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setApplications(data || []);
    } catch (error) {
      console.error("Error fetching applications:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchQuestions = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("questions")
        .select("*")
        .eq("user_id", parseInt(userId))
        .order("created_at", { ascending: false });

      if (error) throw error;
      setQuestions(data || []);
    } catch (error) {
      console.error("Error fetching questions:", error);
    }
  };

  const fetchComments = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("user_comments")
        .select("*")
        .eq("comment_user_id", parseInt(userId))
        .order("created_at", { ascending: false });

      if (error) throw error;
      setComments(data || []);
    } catch (error) {
      console.error("Error fetching comments:", error);
    }
  };

  const fetchFavorites = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("favorites")
        .select(`
          id,
          country_id,
          created_at,
          countries (name, slug)
        `)
        .eq("user_id", parseInt(userId))
        .order("created_at", { ascending: false });

      if (error) throw error;

      const formattedFavorites = (data || []).map((fav: any) => ({
        id: fav.id,
        country_id: fav.country_id,
        country_name: fav.countries?.name || '',
        country_slug: fav.countries?.slug || '',
        created_at: fav.created_at,
      }));

      setFavorites(formattedFavorites);
    } catch (error) {
      console.error("Error fetching favorites:", error);
    }
  };

  const fetchSearchHistory = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("user_search_history")
        .select("*")
        .eq("user_id", parseInt(userId))
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) throw error;
      setSearchHistory(data || []);
    } catch (error) {
      console.error("Error fetching search history:", error);
    }
  };

  const copyIBAN = () => {
    navigator.clipboard.writeText('TR71 0004 6001 1888 8000 1215 84');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadData = async () => {
    const userData = {
      profile: user,
      applications,
      questions,
      comments,
      favorites,
    };

    const blob = new Blob([JSON.stringify(userData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hesabim-verileri-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const deleteAccount = async () => {
    if (!user) return;

    try {
      await supabase.from('favorites').delete().eq('user_id', user.id);
      await supabase.from('user_comments').delete().eq('comment_user_id', user.id);
      await supabase.from('questions').delete().eq('user_id', user.id);
      await supabase.from('user_search_history').delete().eq('user_id', user.id);

      await supabase.auth.signOut();

      router.push('/');
    } catch (error) {
      console.error('Error deleting account:', error);
      alert('Hesap silinirken bir hata oluştu.');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("tr-TR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatDateShort = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("tr-TR", {
      day: "numeric",
      month: "short",
    });
  };

  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return "Bugün";
    if (diffDays === 1) return "Dün";
    if (diffDays < 7) return `${diffDays} gün önce`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} hafta önce`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} ay önce`;
    return `${Math.floor(diffDays / 365)} yıl önce`;
  };

  const getMemberDuration = () => {
    if (!user?.created_at) return "";
    const created = new Date(user.created_at);
    const now = new Date();
    const diffMs = now.getTime() - created.getTime();
    const months = Math.floor(diffMs / (1000 * 60 * 60 * 24 * 30));
    if (months < 1) return "Yeni üye";
    if (months < 12) return `${months} aydır üye`;
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;
    return remainingMonths > 0 ? `${years} yıl ${remainingMonths} aydır üye` : `${years} yıldır üye`;
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Parse visited/want to visit countries
  const visitedCountries = user?.ivisited ? user.ivisited.split(",").map(c => c.trim()).filter(Boolean) : [];
  const wantToVisitCountries = user?.iwanttovisit ? user.iwanttovisit.split(",").map(c => c.trim()).filter(Boolean) : [];

  // Stats
  const activeApps = applications.filter(a => a.status === "processing" || a.status === "new").length;
  const approvedApps = applications.filter(a => a.status === "approved").length;

  const tabs = [
    { id: 'overview' as const, label: 'Genel Bakış', icon: TrendingUp },
    { id: 'applications' as const, label: `Başvurular (${applications.length})`, icon: FileText },
    { id: 'questions' as const, label: `Sorular (${questions.length})`, icon: MessageCircle },
    { id: 'comments' as const, label: `Yorumlar (${comments.length})`, icon: Star },
    { id: 'favorites' as const, label: `Favoriler (${favorites.length})`, icon: Heart },
    { id: 'settings' as const, label: 'Ayarlar', icon: Shield },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-8">
      <div className="container mx-auto max-w-6xl px-4">
        {/* Profile Header */}
        <div className="mb-8 overflow-hidden rounded-2xl bg-white shadow-lg">
          <div className="bg-gradient-to-r from-primary to-blue-600 px-6 py-8 text-white">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/20 text-2xl font-bold backdrop-blur-sm">
                  {user?.name ? user.name.charAt(0).toUpperCase() : "?"}
                </div>
                <div>
                  <h1 className="text-2xl font-bold">{user?.name || "Kullanıcı"}</h1>
                  <p className="text-sm text-blue-100">{user?.email}</p>
                  {user?.created_at && (
                    <p className="mt-0.5 text-xs text-blue-200">{getMemberDuration()}</p>
                  )}
                </div>
              </div>
              <div className="flex gap-3">
                <div className="rounded-xl bg-white/15 px-4 py-2 text-center backdrop-blur-sm">
                  <p className="text-2xl font-bold">{applications.length}</p>
                  <p className="text-[10px] text-blue-100">Başvuru</p>
                </div>
                <div className="rounded-xl bg-white/15 px-4 py-2 text-center backdrop-blur-sm">
                  <p className="text-2xl font-bold">{visitedCountries.length}</p>
                  <p className="text-[10px] text-blue-100">Ziyaret</p>
                </div>
                <div className="rounded-xl bg-white/15 px-4 py-2 text-center backdrop-blur-sm">
                  <p className="text-2xl font-bold">{user?.login_count || 0}</p>
                  <p className="text-[10px] text-blue-100">Giriş</p>
                </div>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-1 overflow-x-auto px-2 py-2">
            {tabs.map((tab) => {
              const TabIcon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-semibold transition-all ${
                    activeTab === tab.id ? 'bg-primary text-white' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <TabIcon className="h-4 w-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="mb-2 inline-flex rounded-lg bg-blue-50 p-2.5">
                  <FileText className="h-5 w-5 text-blue-600" />
                </div>
                <p className="text-xs font-medium text-slate-500">Toplam Başvuru</p>
                <p className="text-2xl font-bold text-slate-900">{applications.length}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="mb-2 inline-flex rounded-lg bg-amber-50 p-2.5">
                  <Clock className="h-5 w-5 text-amber-600" />
                </div>
                <p className="text-xs font-medium text-slate-500">Aktif Başvuru</p>
                <p className="text-2xl font-bold text-slate-900">{activeApps}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="mb-2 inline-flex rounded-lg bg-green-50 p-2.5">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <p className="text-xs font-medium text-slate-500">Onaylanan</p>
                <p className="text-2xl font-bold text-slate-900">{approvedApps}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="mb-2 inline-flex rounded-lg bg-purple-50 p-2.5">
                  <Globe className="h-5 w-5 text-purple-600" />
                </div>
                <p className="text-xs font-medium text-slate-500">Ziyaret Edilen</p>
                <p className="text-2xl font-bold text-slate-900">{visitedCountries.length}</p>
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
              {/* Left Column */}
              <div className="space-y-6 lg:col-span-2">
                {/* Recent Applications */}
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="mb-4 flex items-center justify-between">
                    <h2 className="flex items-center gap-2 font-bold text-slate-900">
                      <FileText className="h-5 w-5 text-primary" />
                      Son Başvurular
                    </h2>
                    {applications.length > 0 && (
                      <button
                        onClick={() => setActiveTab('applications')}
                        className="text-xs font-semibold text-primary hover:underline"
                      >
                        Tümünü Gör →
                      </button>
                    )}
                  </div>
                  {applications.length === 0 ? (
                    <div className="rounded-xl bg-slate-50 py-8 text-center">
                      <Plane className="mx-auto mb-3 h-10 w-10 text-slate-300" />
                      <p className="mb-1 font-semibold text-slate-700">Henüz başvurunuz yok</p>
                      <p className="mb-4 text-sm text-slate-500">İlk vize başvurunuzu yaparak yolculuğunuza başlayın</p>
                      <a
                        href="/vize-basvuru-formu"
                        className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary/90"
                      >
                        <Send className="h-4 w-4" />
                        Başvuru Yap
                      </a>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {applications.slice(0, 3).map((app) => {
                        const status = statusConfig[app.status as keyof typeof statusConfig] || statusConfig.new;
                        const StatusIcon = status.icon;
                        return (
                          <div
                            key={app.id}
                            onClick={() => setSelectedApp(app)}
                            className="flex cursor-pointer items-center justify-between rounded-xl border border-slate-100 p-4 transition-all hover:border-primary/30 hover:bg-primary/5"
                          >
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-lg">
                                🌍
                              </div>
                              <div>
                                <p className="font-semibold text-slate-900">{app.country_name || "Ülke belirtilmemiş"}</p>
                                <p className="text-xs text-slate-500">{app.package_name || app.full_name} · {getTimeAgo(app.created_at)}</p>
                              </div>
                            </div>
                            <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${status.color}`}>
                              <StatusIcon className="h-3 w-3" />
                              {status.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Travel Map - Visited & Want to Visit */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-900">
                      <MapPin className="h-4 w-4 text-green-600" />
                      Ziyaret Ettiğim Ülkeler
                    </h3>
                    {visitedCountries.length === 0 ? (
                      <p className="text-xs text-slate-400">Henüz eklenmemiş</p>
                    ) : (
                      <div className="flex flex-wrap gap-1.5">
                        {visitedCountries.map((country, i) => (
                          <span key={i} className="rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700">
                            {country}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-900">
                      <Plane className="h-4 w-4 text-blue-600" />
                      Gitmek İstediğim Ülkeler
                    </h3>
                    {wantToVisitCountries.length === 0 ? (
                      <p className="text-xs text-slate-400">Henüz eklenmemiş</p>
                    ) : (
                      <div className="flex flex-wrap gap-1.5">
                        {wantToVisitCountries.map((country, i) => (
                          <span key={i} className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
                            {country}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Bank Info */}
                <div className="rounded-2xl bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white shadow-lg">
                  <div className="mb-4 flex items-center gap-3">
                    <Building2 className="h-6 w-6" />
                    <div>
                      <h3 className="font-bold">Kolay Seyahat Teknoloji Ltd. Şti.</h3>
                      <p className="text-sm text-blue-100">Akbank TL Hesabı</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between rounded-lg bg-white/10 p-4 backdrop-blur-sm">
                    <div>
                      <p className="text-xs text-blue-100">IBAN</p>
                      <p className="font-mono text-sm font-semibold sm:text-lg">TR71 0004 6001 1888 8000 1215 84</p>
                    </div>
                    <button
                      onClick={copyIBAN}
                      className="flex items-center gap-2 rounded-lg bg-white/20 px-4 py-2 text-sm font-semibold transition-all hover:bg-white/30"
                    >
                      {copied ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      {copied ? 'Kopyalandı!' : 'Kopyala'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                {/* Quick Actions */}
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <h2 className="mb-4 flex items-center gap-2 font-bold text-slate-900">
                    <Sparkles className="h-5 w-5 text-primary" />
                    Hızlı İşlemler
                  </h2>
                  <div className="space-y-2">
                    <a
                      href="/vize-basvuru-formu"
                      className="flex items-center gap-3 rounded-xl border border-slate-100 p-3 transition-all hover:border-primary hover:bg-primary/5"
                    >
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                        <Send className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-slate-900">Yeni Başvuru</p>
                        <p className="text-[10px] text-slate-500">Vize başvurusu yap</p>
                      </div>
                      <ArrowRight className="h-4 w-4 text-slate-400" />
                    </a>
                    <a
                      href="/vize-davet-mektubu-olustur"
                      className="flex items-center gap-3 rounded-xl border border-slate-100 p-3 transition-all hover:border-blue-300 hover:bg-blue-50"
                    >
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100">
                        <Mail className="h-4 w-4 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-slate-900">Davet Mektubu</p>
                        <p className="text-[10px] text-slate-500">Oluştur ve indir</p>
                      </div>
                      <ArrowRight className="h-4 w-4 text-slate-400" />
                    </a>
                    <a
                      href="/vize-dilekcesi-olustur"
                      className="flex items-center gap-3 rounded-xl border border-slate-100 p-3 transition-all hover:border-green-300 hover:bg-green-50"
                    >
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-100">
                        <FileSignature className="h-4 w-4 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-slate-900">Vize Dilekçesi</p>
                        <p className="text-[10px] text-slate-500">Oluştur ve indir</p>
                      </div>
                      <ArrowRight className="h-4 w-4 text-slate-400" />
                    </a>
                  </div>
                </div>

                {/* Recent Searches */}
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <h2 className="mb-4 flex items-center gap-2 font-bold text-slate-900">
                    <History className="h-5 w-5 text-slate-600" />
                    Son Aramalar
                  </h2>
                  {searchHistory.length === 0 ? (
                    <div className="rounded-xl bg-slate-50 py-6 text-center">
                      <Search className="mx-auto mb-2 h-8 w-8 text-slate-300" />
                      <p className="text-xs text-slate-500">Henüz arama geçmişiniz yok</p>
                      <a href="/" className="mt-2 inline-block text-xs font-semibold text-primary hover:underline">
                        Ülkeleri Keşfedin →
                      </a>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {searchHistory.slice(0, 5).map((item) => (
                        <a
                          key={item.id}
                          href={item.country_slug ? `/${item.country_slug}` : item.page_url || '/'}
                          className="flex items-center gap-2.5 rounded-lg p-2 transition-all hover:bg-slate-50"
                        >
                          <Globe className="h-4 w-4 text-slate-400" />
                          <div className="flex-1 min-w-0">
                            <p className="truncate text-sm font-medium text-slate-700">{item.country_name || item.page_url}</p>
                            <p className="text-[10px] text-slate-400">{getTimeAgo(item.created_at)}</p>
                          </div>
                        </a>
                      ))}
                    </div>
                  )}
                </div>

                {/* Profile Info */}
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <h2 className="mb-4 flex items-center gap-2 font-bold text-slate-900">
                    <UserIcon className="h-5 w-5 text-slate-600" />
                    Profil Bilgileri
                  </h2>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-sm">
                      <UserIcon className="h-4 w-4 text-slate-400" />
                      <span className="text-slate-600">{user?.name || "İsim belirtilmemiş"}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <Mail className="h-4 w-4 text-slate-400" />
                      <span className="text-slate-600 truncate">{user?.email}</span>
                    </div>
                    {user?.phone && (
                      <div className="flex items-center gap-3 text-sm">
                        <CreditCard className="h-4 w-4 text-slate-400" />
                        <span className="text-slate-600">{user.phone}</span>
                      </div>
                    )}
                    {user?.login_count && user.login_count > 0 && (
                      <div className="flex items-center gap-3 text-sm">
                        <LogIn className="h-4 w-4 text-slate-400" />
                        <span className="text-slate-600">{user.login_count} giriş yapıldı</span>
                      </div>
                    )}
                    {user?.created_at && (
                      <div className="flex items-center gap-3 text-sm">
                        <Calendar className="h-4 w-4 text-slate-400" />
                        <span className="text-slate-600">Üyelik: {formatDate(user.created_at)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* APPLICATIONS TAB */}
        {activeTab === 'applications' && (
          <div className="rounded-2xl bg-white p-6 shadow-lg">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">Başvurularım</h2>
              <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">
                {applications.length} Başvuru
              </span>
            </div>

            {applications.length === 0 ? (
              <div className="py-12 text-center">
                <FileText className="mx-auto mb-4 h-16 w-16 text-slate-300" />
                <p className="mb-2 text-lg font-semibold text-slate-900">Henüz başvurunuz yok</p>
                <p className="mb-6 text-sm text-slate-500">
                  Vize başvurusu yaparak işleme başlayabilirsiniz
                </p>
                <a
                  href="/vize-basvuru-formu"
                  className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 font-semibold text-white transition-colors hover:bg-primary/90"
                >
                  <Send className="h-5 w-5" />
                  Yeni Başvuru Yap
                </a>
              </div>
            ) : (
              <div className="space-y-4">
                {applications.map((app) => {
                  const status = statusConfig[app.status as keyof typeof statusConfig] || statusConfig.new;
                  const StatusIcon = status.icon;

                  return (
                    <div
                      key={app.id}
                      className="rounded-lg border border-slate-200 p-4 transition-all hover:border-primary hover:shadow-md"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="mb-2 flex flex-wrap items-center gap-2">
                            <h3 className="font-semibold text-slate-900">{app.country_name || "Ülke belirtilmemiş"}</h3>
                            <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold ${status.color}`}>
                              <StatusIcon className="h-3 w-3" />
                              {status.label}
                            </span>
                            {app.payment_status && app.payment_status !== 'pending' && (
                              <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold ${
                                app.payment_status === 'paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-700'
                              }`}>
                                <CreditCard className="h-3 w-3" />
                                {app.payment_status === 'paid' ? 'Ödendi' : 'Ödeme Bekliyor'}
                              </span>
                            )}
                          </div>
                          <p className="mb-2 text-sm text-slate-600">{app.package_name}</p>
                          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {formatDate(app.created_at)}
                            </div>
                            <div className="flex items-center gap-1">
                              <UserIcon className="h-3 w-3" />
                              {app.full_name}
                            </div>
                            {app.person_count && app.person_count > 1 && (
                              <div className="flex items-center gap-1">
                                👥 {app.person_count} kişi
                              </div>
                            )}
                            {app.tl_amount && app.tl_amount > 0 && (
                              <div className="flex items-center gap-1 font-semibold text-slate-700">
                                ₺{Number(app.tl_amount).toLocaleString('tr-TR')}
                              </div>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => setSelectedApp(app)}
                          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100"
                          title="Detayları Gör"
                        >
                          <Eye className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* QUESTIONS TAB */}
        {activeTab === 'questions' && (
          <div className="rounded-2xl bg-white p-6 shadow-lg">
            <h2 className="mb-6 text-lg font-bold text-slate-900">Sorularım</h2>
            {questions.length === 0 ? (
              <div className="py-12 text-center">
                <MessageCircle className="mx-auto mb-4 h-16 w-16 text-slate-300" />
                <p className="text-lg font-semibold text-slate-900">Henüz soru sormadınız</p>
              </div>
            ) : (
              <div className="space-y-4">
                {questions.map((q) => (
                  <div key={q.id} className="rounded-lg border border-slate-200 p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <h3 className="font-semibold text-slate-900">{q.title}</h3>
                      <span className={`rounded-full px-2 py-1 text-xs font-semibold ${
                        q.status === 1 ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {q.status === 1 ? 'Cevaplandı' : 'Beklemede'}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600">{q.contents}</p>
                    <p className="mt-2 text-xs text-slate-400">{formatDate(q.created_at)}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* COMMENTS TAB */}
        {activeTab === 'comments' && (
          <div className="rounded-2xl bg-white p-6 shadow-lg">
            <h2 className="mb-6 text-lg font-bold text-slate-900">Yorumlarım</h2>
            {comments.length === 0 ? (
              <div className="py-12 text-center">
                <Star className="mx-auto mb-4 h-16 w-16 text-slate-300" />
                <p className="text-lg font-semibold text-slate-900">Henüz yorum yapmadınız</p>
              </div>
            ) : (
              <div className="space-y-4">
                {comments.map((c) => (
                  <div key={c.id} className="rounded-lg border border-slate-200 p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <span key={i} className={`text-sm ${i < c.star ? 'text-yellow-400' : 'text-slate-300'}`}>★</span>
                        ))}
                      </div>
                      <span className={`rounded-full px-2 py-1 text-xs font-semibold ${
                        c.status === 1 ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {c.status === 1 ? 'Onaylandı' : 'Beklemede'}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600">{c.contents}</p>
                    <p className="mt-2 text-xs text-slate-400">{formatDate(c.created_at)}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* FAVORITES TAB */}
        {activeTab === 'favorites' && (
          <div className="rounded-2xl bg-white p-6 shadow-lg">
            <h2 className="mb-6 text-lg font-bold text-slate-900">Favorilerim</h2>
            {favorites.length === 0 ? (
              <div className="py-12 text-center">
                <Heart className="mx-auto mb-4 h-16 w-16 text-slate-300" />
                <p className="mb-2 text-lg font-semibold text-slate-900">Henüz favori eklemediniz</p>
                <p className="mb-4 text-sm text-slate-500">Ülke sayfalarında kalp ikonuna tıklayarak favorilerinize ekleyin</p>
                <a href="/" className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary/90">
                  <Globe className="h-4 w-4" />
                  Ülkeleri Keşfet
                </a>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {favorites.map((fav) => (
                  <a
                    key={fav.id}
                    href={`/${fav.country_slug}`}
                    className="flex items-center gap-3 rounded-xl border border-slate-200 p-4 transition-all hover:border-red-200 hover:bg-red-50 hover:shadow-md"
                  >
                    <Heart className="h-5 w-5 flex-shrink-0 text-red-500" />
                    <div>
                      <h3 className="font-semibold text-slate-900">{fav.country_name}</h3>
                      <p className="text-xs text-slate-500">{formatDate(fav.created_at)}</p>
                    </div>
                  </a>
                ))}
              </div>
            )}
          </div>
        )}

        {/* SETTINGS TAB */}
        {activeTab === 'settings' && (
          <div className="rounded-2xl bg-white p-6 shadow-lg">
            <h2 className="mb-6 text-lg font-bold text-slate-900">Hesap Ayarları</h2>
            <div className="space-y-6">
              {/* GDPR Data Download */}
              <div className="rounded-lg border border-slate-200 p-4">
                <div className="mb-3 flex items-center gap-3">
                  <Download className="h-5 w-5 text-blue-600" />
                  <h3 className="font-semibold text-slate-900">Verilerimi İndir</h3>
                </div>
                <p className="mb-4 text-sm text-slate-600">
                  KVKK ve GDPR kapsamında tüm verilerinizi JSON formatında indirebilirsiniz.
                </p>
                <button
                  onClick={downloadData}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
                >
                  Verileri İndir
                </button>
              </div>

              {/* Account Deletion */}
              <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                <div className="mb-3 flex items-center gap-3">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                  <h3 className="font-semibold text-red-900">Hesabı Sil</h3>
                </div>
                <p className="mb-4 text-sm text-red-700">
                  Hesabınızı ve tüm verilerinizi kalıcı olarak silebilirsiniz. Bu işlem geri alınamaz.
                </p>
                {!showDeleteConfirm ? (
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-700"
                  >
                    Hesabı Sil
                  </button>
                ) : (
                  <div className="space-y-3">
                    <p className="text-sm font-semibold text-red-900">Emin misiniz? Bu işlem geri alınamaz!</p>
                    <div className="flex gap-2">
                      <button
                        onClick={deleteAccount}
                        className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-700"
                      >
                        Evet, Hesabı Sil
                      </button>
                      <button
                        onClick={() => setShowDeleteConfirm(false)}
                        className="rounded-lg bg-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-300"
                      >
                        İptal
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Application Detail Modal */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setSelectedApp(null)}>
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">Başvuru Detayları</h2>
              <button
                onClick={() => setSelectedApp(null)}
                className="rounded-lg p-2 text-slate-600 hover:bg-slate-100"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-500">Ad Soyad</label>
                  <p className="font-medium text-slate-900">{selectedApp.full_name}</p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500">E-posta</label>
                  <p className="font-medium text-slate-900">{selectedApp.email}</p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500">Telefon</label>
                  <p className="font-medium text-slate-900">{selectedApp.phone}</p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500">Ülke</label>
                  <p className="font-medium text-slate-900">{selectedApp.country_name || "-"}</p>
                </div>
                <div className="col-span-2">
                  <label className="text-xs font-semibold text-slate-500">Paket</label>
                  <p className="font-medium text-slate-900">{selectedApp.package_name || "-"}</p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500">Durum</label>
                  <p className="font-medium text-slate-900">
                    {statusConfig[selectedApp.status as keyof typeof statusConfig]?.label || "Yeni"}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500">Başvuru Tarihi</label>
                  <p className="font-medium text-slate-900">{formatDate(selectedApp.created_at)}</p>
                </div>
                {selectedApp.person_count && selectedApp.person_count > 1 && (
                  <div>
                    <label className="text-xs font-semibold text-slate-500">Kişi Sayısı</label>
                    <p className="font-medium text-slate-900">{selectedApp.person_count}</p>
                  </div>
                )}
                {selectedApp.tl_amount && selectedApp.tl_amount > 0 && (
                  <div>
                    <label className="text-xs font-semibold text-slate-500">Tutar</label>
                    <p className="font-medium text-slate-900">₺{Number(selectedApp.tl_amount).toLocaleString('tr-TR')}</p>
                  </div>
                )}
                {selectedApp.payment_status && (
                  <div>
                    <label className="text-xs font-semibold text-slate-500">Ödeme Durumu</label>
                    <p className="font-medium text-slate-900">
                      {selectedApp.payment_status === 'paid' ? '✅ Ödendi' : selectedApp.payment_status === 'pending' ? '⏳ Bekliyor' : selectedApp.payment_status}
                    </p>
                  </div>
                )}
                {selectedApp.notes && (
                  <div className="col-span-2">
                    <label className="text-xs font-semibold text-slate-500">Notlar</label>
                    <p className="font-medium text-slate-900">{selectedApp.notes}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
