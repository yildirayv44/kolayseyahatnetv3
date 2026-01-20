"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { getCurrentUser } from "@/lib/auth";
import { 
  FileText, 
  Mail, 
  User, 
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
  CreditCard
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

const statusConfig = {
  new: { label: "Yeni", color: "bg-blue-100 text-blue-700", icon: Clock },
  processing: { label: "İşleniyor", color: "bg-yellow-100 text-yellow-700", icon: Clock },
  approved: { label: "Onaylandı", color: "bg-green-100 text-green-700", icon: CheckCircle },
  rejected: { label: "Reddedildi", color: "bg-red-100 text-red-700", icon: XCircle },
};

export default function HesabimPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [activeTab, setActiveTab] = useState<'applications' | 'questions' | 'comments' | 'favorites' | 'settings'>('applications');
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
      // Delete user data
      await supabase.from('favorites').delete().eq('user_id', user.id);
      await supabase.from('user_comments').delete().eq('comment_user_id', user.id);
      await supabase.from('questions').delete().eq('user_id', user.id);
      
      // Sign out
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

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-8">
      <div className="container mx-auto max-w-6xl px-4">
        {/* Header */}
        <div className="mb-8 rounded-2xl bg-white p-6 shadow-lg">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <User className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Hesabım</h1>
              <p className="text-slate-600">{user?.name || user?.email}</p>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mb-6 rounded-2xl bg-white p-2 shadow-lg">
          <div className="flex gap-2 overflow-x-auto">
            <button
              onClick={() => setActiveTab('applications')}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-all ${
                activeTab === 'applications' ? 'bg-primary text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <FileText className="h-4 w-4" />
              Başvurularım ({applications.length})
            </button>
            <button
              onClick={() => setActiveTab('questions')}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-all ${
                activeTab === 'questions' ? 'bg-primary text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <MessageCircle className="h-4 w-4" />
              Sorularım ({questions.length})
            </button>
            <button
              onClick={() => setActiveTab('comments')}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-all ${
                activeTab === 'comments' ? 'bg-primary text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <MessageCircle className="h-4 w-4" />
              Yorumlarım ({comments.length})
            </button>
            <button
              onClick={() => setActiveTab('favorites')}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-all ${
                activeTab === 'favorites' ? 'bg-primary text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Heart className="h-4 w-4" />
              Favorilerim ({favorites.length})
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-all ${
                activeTab === 'settings' ? 'bg-primary text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <User className="h-4 w-4" />
              Ayarlar
            </button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Quick Actions */}
          <div className="space-y-6 lg:col-span-1">
            <div className="rounded-2xl bg-white p-6 shadow-lg">
              <h2 className="mb-4 text-lg font-bold text-slate-900">Hızlı İşlemler</h2>
              <div className="space-y-3">
                <a
                  href="/vize-basvuru-formu"
                  className="flex items-center gap-3 rounded-lg border border-slate-200 p-4 transition-all hover:border-primary hover:bg-primary/5"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Send className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900">Yeni Başvuru</div>
                    <div className="text-xs text-slate-500">Vize başvurusu yap</div>
                  </div>
                </a>

                <a
                  href="/vize-davet-mektubu-olustur"
                  className="flex items-center gap-3 rounded-lg border border-slate-200 p-4 transition-all hover:border-primary hover:bg-primary/5"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                    <Mail className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900">Davet Mektubu</div>
                    <div className="text-xs text-slate-500">Oluştur ve indir</div>
                  </div>
                </a>

                <a
                  href="/vize-dilekcesi-olustur"
                  className="flex items-center gap-3 rounded-lg border border-slate-200 p-4 transition-all hover:border-primary hover:bg-primary/5"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
                    <FileSignature className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900">Vize Dilekçesi</div>
                    <div className="text-xs text-slate-500">Oluştur ve indir</div>
                  </div>
                </a>
              </div>
            </div>

            {/* Profile Info */}
            <div className="rounded-2xl bg-white p-6 shadow-lg">
              <h2 className="mb-4 text-lg font-bold text-slate-900">Profil Bilgileri</h2>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <User className="h-4 w-4 text-slate-400" />
                  <span className="text-slate-600">{user?.name || "İsim belirtilmemiş"}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="h-4 w-4 text-slate-400" />
                  <span className="text-slate-600">{user?.email}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Content Area */}
          <div className="lg:col-span-2">
            {/* Bank Info - Always visible */}
            <div className="mb-6 rounded-2xl bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white shadow-lg">
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
                  <p className="font-mono text-lg font-semibold">TR71 0004 6001 1888 8000 1215 84</p>
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

            {/* Tab Content */}
            <div className="rounded-2xl bg-white p-6 shadow-lg">
              {activeTab === 'applications' && (
                <>
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
                            <div className="mb-2 flex items-center gap-2">
                              <h3 className="font-semibold text-slate-900">{app.country_name}</h3>
                              <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold ${status.color}`}>
                                <StatusIcon className="h-3 w-3" />
                                {status.label}
                              </span>
                            </div>
                            <p className="mb-2 text-sm text-slate-600">{app.package_name}</p>
                            <div className="flex items-center gap-4 text-xs text-slate-500">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {formatDate(app.created_at)}
                              </div>
                              <div className="flex items-center gap-1">
                                <User className="h-3 w-3" />
                                {app.full_name}
                              </div>
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
                </>
              )}

              {/* Questions Tab */}
              {activeTab === 'questions' && (
                <>
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
                </>
              )}

              {/* Comments Tab */}
              {activeTab === 'comments' && (
                <>
                  <h2 className="mb-6 text-lg font-bold text-slate-900">Yorumlarım</h2>
                  {comments.length === 0 ? (
                    <div className="py-12 text-center">
                      <MessageCircle className="mx-auto mb-4 h-16 w-16 text-slate-300" />
                      <p className="text-lg font-semibold text-slate-900">Henüz yorum yapmadınız</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {comments.map((c) => (
                        <div key={c.id} className="rounded-lg border border-slate-200 p-4">
                          <div className="mb-2 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {[...Array(5)].map((_, i) => (
                                <span key={i} className={i < c.star ? 'text-yellow-400' : 'text-slate-300'}>★</span>
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
                </>
              )}

              {/* Favorites Tab */}
              {activeTab === 'favorites' && (
                <>
                  <h2 className="mb-6 text-lg font-bold text-slate-900">Favorilerim</h2>
                  {favorites.length === 0 ? (
                    <div className="py-12 text-center">
                      <Heart className="mx-auto mb-4 h-16 w-16 text-slate-300" />
                      <p className="text-lg font-semibold text-slate-900">Henüz favori eklemediniz</p>
                    </div>
                  ) : (
                    <div className="grid gap-4 sm:grid-cols-2">
                      {favorites.map((fav) => (
                        <a
                          key={fav.id}
                          href={`/${fav.country_slug}`}
                          className="flex items-center gap-3 rounded-lg border border-slate-200 p-4 transition-all hover:border-primary hover:shadow-md"
                        >
                          <Heart className="h-5 w-5 text-red-500" />
                          <div>
                            <h3 className="font-semibold text-slate-900">{fav.country_name}</h3>
                            <p className="text-xs text-slate-500">{formatDate(fav.created_at)}</p>
                          </div>
                        </a>
                      ))}
                    </div>
                  )}
                </>
              )}

              {/* Settings Tab */}
              {activeTab === 'settings' && (
                <>
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
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Application Detail Modal */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
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
                  <label className="text-sm font-semibold text-slate-700">Ad Soyad</label>
                  <p className="text-slate-900">{selectedApp.full_name}</p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-700">E-posta</label>
                  <p className="text-slate-900">{selectedApp.email}</p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-700">Telefon</label>
                  <p className="text-slate-900">{selectedApp.phone}</p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-700">Ülke</label>
                  <p className="text-slate-900">{selectedApp.country_name}</p>
                </div>
                <div className="col-span-2">
                  <label className="text-sm font-semibold text-slate-700">Paket</label>
                  <p className="text-slate-900">{selectedApp.package_name}</p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-700">Durum</label>
                  <p className="text-slate-900">
                    {statusConfig[selectedApp.status as keyof typeof statusConfig]?.label || "Yeni"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-700">Başvuru Tarihi</label>
                  <p className="text-slate-900">{formatDate(selectedApp.created_at)}</p>
                </div>
                {selectedApp.notes && (
                  <div className="col-span-2">
                    <label className="text-sm font-semibold text-slate-700">Notlar</label>
                    <p className="text-slate-900">{selectedApp.notes}</p>
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
