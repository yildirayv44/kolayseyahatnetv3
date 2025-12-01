import { 
  Users, 
  Globe2, 
  FileText, 
  ClipboardList, 
  MessageSquare,
  TrendingUp,
  CheckCircle,
  Clock,
  XCircle,
  Mail
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { getCountries, getBlogs, getConsultants } from "@/lib/queries";

export default async function AdminDashboard() {
  // Fetch real stats from Supabase
  const [countries, blogs, consultants, applicationsResult, commentsResult] = await Promise.all([
    getCountries(),
    getBlogs({}),
    getConsultants(),
    supabase.from("applications").select("*", { count: "exact" }),
    Promise.all([
      supabase.from("user_comments").select("status", { count: "exact" }),
      supabase.from("blog_comments").select("status", { count: "exact" }),
      supabase.from("country_comments").select("status", { count: "exact" }),
    ]),
  ]);

  const [userCommentsResult, blogCommentsResult, countryCommentsResult] = commentsResult;
  const totalComments = 
    (userCommentsResult.count || 0) + 
    (blogCommentsResult.count || 0) + 
    (countryCommentsResult.count || 0);
  
  const pendingComments = 
    (userCommentsResult.data?.filter(c => c.status === 0).length || 0) +
    (blogCommentsResult.data?.filter(c => c.status === 0).length || 0) +
    (countryCommentsResult.data?.filter(c => c.status === 0).length || 0);

  const stats = [
    {
      label: "Toplam Başvuru",
      value: applicationsResult.count?.toString() || "0",
      change: "+12%",
      icon: ClipboardList,
      color: "bg-blue-500",
    },
    {
      label: "Toplam Yorum",
      value: totalComments.toString(),
      change: `${pendingComments} beklemede`,
      icon: MessageSquare,
      color: "bg-purple-500",
    },
    {
      label: "Aktif Ülkeler",
      value: countries.filter((c: any) => c.status === 1).length.toString(),
      change: `${countries.length} toplam`,
      icon: Globe2,
      color: "bg-emerald-500",
    },
    {
      label: "Blog Yazıları",
      value: blogs.length.toString(),
      change: `${blogs.filter((b: any) => b.status === 1).length} yayında`,
      icon: FileText,
      color: "bg-teal-500",
    },
    {
      label: "Danışmanlar",
      value: consultants.length.toString(),
      change: "Aktif",
      icon: Users,
      color: "bg-amber-500",
    },
  ];

  // Fetch recent applications
  const { data: recentApplications } = await supabase
    .from("applications")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(5);

  const statusConfig = {
    pending: { label: "Beklemede", color: "bg-amber-100 text-amber-700", icon: Clock },
    approved: { label: "Onaylandı", color: "bg-emerald-100 text-emerald-700", icon: CheckCircle },
    processing: { label: "İşlemde", color: "bg-blue-100 text-blue-700", icon: TrendingUp },
    rejected: { label: "Reddedildi", color: "bg-red-100 text-red-700", icon: XCircle },
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Dashboard</h2>
        <p className="text-sm text-slate-600">Genel bakış ve istatistikler</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="card">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-slate-600">{stat.label}</p>
                  <p className="mt-2 text-3xl font-bold text-slate-900">{stat.value}</p>
                  <p className="mt-1 text-xs text-emerald-600">{stat.change} bu ay</p>
                </div>
                <div className={`rounded-lg ${stat.color} p-3`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Applications */}
      <div className="card">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900">Son Başvurular</h3>
          <a href="/admin/basvurular" className="text-sm font-semibold text-primary hover:underline">
            Tümünü Gör
          </a>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 text-left text-sm text-slate-600">
                <th className="pb-3 font-semibold">Başvuran</th>
                <th className="pb-3 font-semibold">Ülke</th>
                <th className="pb-3 font-semibold">Durum</th>
                <th className="pb-3 font-semibold">Tarih</th>
              </tr>
            </thead>
            <tbody>
              {recentApplications && recentApplications.length > 0 ? (
                recentApplications.map((app: any) => {
                  const status = statusConfig[app.status as keyof typeof statusConfig] || statusConfig.pending;
                  const StatusIcon = status.icon;
                  return (
                    <tr key={app.id} className="border-b border-slate-100 last:border-0">
                      <td className="py-3 text-sm font-medium text-slate-900">
                        {app.first_name} {app.last_name}
                      </td>
                      <td className="py-3 text-sm text-slate-600">{app.country_id || "-"}</td>
                      <td className="py-3">
                        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold ${status.color}`}>
                          <StatusIcon className="h-3 w-3" />
                          {status.label}
                        </span>
                      </td>
                      <td className="py-3 text-sm text-slate-600">
                        {new Date(app.created_at).toLocaleDateString("tr-TR")}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-sm text-slate-500">
                    Henüz başvuru bulunmuyor
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-6 md:grid-cols-4">
        <a href="/admin/ulkeler" className="card group hover:border-primary">
          <Globe2 className="h-8 w-8 text-primary" />
          <h3 className="mt-4 font-semibold text-slate-900">Ülke Yönetimi</h3>
          <p className="mt-1 text-sm text-slate-600">Ülkeleri düzenle, ekle veya sil</p>
        </a>

        <a href="/admin/bloglar" className="card group hover:border-primary">
          <FileText className="h-8 w-8 text-primary" />
          <h3 className="mt-4 font-semibold text-slate-900">Blog Yönetimi</h3>
          <p className="mt-1 text-sm text-slate-600">Blog yazılarını yönet</p>
        </a>

        <a href="/admin/basvurular" className="card group hover:border-primary">
          <ClipboardList className="h-8 w-8 text-primary" />
          <h3 className="mt-4 font-semibold text-slate-900">Başvuru Yönetimi</h3>
          <p className="mt-1 text-sm text-slate-600">Başvuruları incele ve işle</p>
        </a>

        <a href="/admin/yorumlar" className="card group hover:border-primary">
          <MessageSquare className="h-8 w-8 text-primary" />
          <h3 className="mt-4 font-semibold text-slate-900">Yorum Yönetimi</h3>
          <p className="mt-1 text-sm text-slate-600">Yorumları onayla veya reddet</p>
          {pendingComments > 0 && (
            <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-1 text-xs font-semibold text-amber-700">
              <Clock className="h-3 w-3" />
              {pendingComments} bekliyor
            </span>
          )}
        </a>

        <a href="/admin/email-subscribers" className="card group hover:border-primary">
          <Mail className="h-8 w-8 text-emerald-600" />
          <h3 className="mt-4 font-semibold text-slate-900">Email Aboneleri</h3>
          <p className="mt-1 text-sm text-slate-600">Exit intent ve diğer kaynaklardan emailler</p>
        </a>
      </div>
    </div>
  );
}
