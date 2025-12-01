import { MessageSquare, CheckCircle, XCircle, Clock, User, Globe2, FileText } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default async function CommentsPage() {
  // Fetch all comments from all tables
  const [userCommentsResult, blogCommentsResult, countryCommentsResult] = await Promise.all([
    supabase
      .from("user_comments")
      .select("id, contents, star, status, created_at, user_id, comment_user_id")
      .order("created_at", { ascending: false }),
    supabase
      .from("blog_comments")
      .select("id, contents, status, created_at, user_name, blog_id")
      .order("created_at", { ascending: false }),
    supabase
      .from("country_comments")
      .select("id, contents, status, created_at, user_name, country_id")
      .order("created_at", { ascending: false }),
  ]);

  const userComments = userCommentsResult.data || [];
  const blogComments = blogCommentsResult.data || [];
  const countryComments = countryCommentsResult.data || [];

  // Fetch user names for consultant comments
  const userIds = [...new Set(userComments.map(c => c.user_id).filter(Boolean))];
  const consultantIds = [...new Set(userComments.map(c => c.comment_user_id).filter(Boolean))];
  
  const { data: users } = await supabase
    .from("users")
    .select("id, name")
    .in("id", [...userIds, ...consultantIds]);

  const userMap = new Map(users?.map(u => [u.id, u.name]) || []);

  // Combine and format all comments
  const allComments = [
    ...userComments.map(c => ({
      id: c.id,
      type: "consultant" as const,
      typeLabel: "Danışman",
      typeIcon: User,
      content: c.contents,
      rating: c.star,
      status: c.status,
      created_at: c.created_at,
      userName: userMap.get(c.user_id) || "Anonim",
      entityName: userMap.get(c.comment_user_id) || "Bilinmiyor",
    })),
    ...blogComments.map(c => ({
      id: c.id,
      type: "blog" as const,
      typeLabel: "Blog",
      typeIcon: FileText,
      content: c.contents,
      rating: 0,
      status: c.status,
      created_at: c.created_at,
      userName: c.user_name || "Anonim",
      entityName: `Blog #${c.blog_id}`,
    })),
    ...countryComments.map(c => ({
      id: c.id,
      type: "country" as const,
      typeLabel: "Ülke",
      typeIcon: Globe2,
      content: c.contents,
      rating: 0,
      status: c.status,
      created_at: c.created_at,
      userName: c.user_name || "Anonim",
      entityName: `Ülke #${c.country_id}`,
    })),
  ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const stats = {
    total: allComments.length,
    pending: allComments.filter(c => c.status === 0).length,
    approved: allComments.filter(c => c.status === 1).length,
    rejected: allComments.filter(c => c.status === 2).length,
  };

  const statusConfig = {
    0: { label: "Beklemede", color: "bg-amber-100 text-amber-700", icon: Clock },
    1: { label: "Onaylandı", color: "bg-emerald-100 text-emerald-700", icon: CheckCircle },
    2: { label: "Reddedildi", color: "bg-red-100 text-red-700", icon: XCircle },
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Yorum Yönetimi</h2>
        <p className="text-sm text-slate-600">Tüm yorumları görüntüle ve yönet</p>
      </div>

      {/* Stats */}
      <div className="grid gap-6 md:grid-cols-4">
        <div className="card">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-slate-600">Toplam Yorum</p>
              <p className="mt-2 text-3xl font-bold text-slate-900">{stats.total}</p>
            </div>
            <div className="rounded-lg bg-blue-500 p-3">
              <MessageSquare className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-slate-600">Bekleyen</p>
              <p className="mt-2 text-3xl font-bold text-amber-600">{stats.pending}</p>
            </div>
            <div className="rounded-lg bg-amber-500 p-3">
              <Clock className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-slate-600">Onaylanan</p>
              <p className="mt-2 text-3xl font-bold text-emerald-600">{stats.approved}</p>
            </div>
            <div className="rounded-lg bg-emerald-500 p-3">
              <CheckCircle className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-slate-600">Reddedilen</p>
              <p className="mt-2 text-3xl font-bold text-red-600">{stats.rejected}</p>
            </div>
            <div className="rounded-lg bg-red-500 p-3">
              <XCircle className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Comments List */}
      <div className="card">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-slate-900">Tüm Yorumlar</h3>
        </div>

        <div className="space-y-4">
          {allComments.length > 0 ? (
            allComments.map((comment) => {
              const status = statusConfig[comment.status as keyof typeof statusConfig];
              const StatusIcon = status.icon;
              const TypeIcon = comment.typeIcon;

              return (
                <div
                  key={`${comment.type}-${comment.id}`}
                  className="rounded-lg border border-slate-200 p-4 hover:border-slate-300"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      {/* Header */}
                      <div className="mb-2 flex items-center gap-3">
                        <div className="flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                          <TypeIcon className="h-3 w-3" />
                          {comment.typeLabel}
                        </div>
                        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold ${status.color}`}>
                          <StatusIcon className="h-3 w-3" />
                          {status.label}
                        </span>
                        {comment.rating > 0 && (
                          <div className="flex items-center gap-1 text-amber-500">
                            {"⭐".repeat(comment.rating)}
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <p className="mb-2 text-sm text-slate-900">{comment.content}</p>

                      {/* Meta */}
                      <div className="flex items-center gap-4 text-xs text-slate-500">
                        <span>👤 {comment.userName}</span>
                        <span>→ {comment.entityName}</span>
                        <span>📅 {new Date(comment.created_at).toLocaleDateString("tr-TR")}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    {comment.status === 0 && (
                      <div className="flex gap-2">
                        <form action={`/admin/yorumlar/approve`} method="POST">
                          <input type="hidden" name="id" value={comment.id} />
                          <input type="hidden" name="type" value={comment.type} />
                          <button
                            type="submit"
                            className="rounded-lg bg-emerald-500 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-600"
                          >
                            Onayla
                          </button>
                        </form>
                        <form action={`/admin/yorumlar/reject`} method="POST">
                          <input type="hidden" name="id" value={comment.id} />
                          <input type="hidden" name="type" value={comment.type} />
                          <button
                            type="submit"
                            className="rounded-lg bg-red-500 px-3 py-2 text-xs font-semibold text-white hover:bg-red-600"
                          >
                            Reddet
                          </button>
                        </form>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="py-12 text-center text-sm text-slate-500">
              Henüz yorum bulunmuyor
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
