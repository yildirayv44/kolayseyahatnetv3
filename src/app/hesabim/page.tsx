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
  Loader2
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
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);

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
      <div className="mx-auto max-w-6xl px-4">
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

          {/* Applications List */}
          <div className="lg:col-span-2">
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
