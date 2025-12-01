import Link from "next/link";
import { getBlogs } from "@/lib/queries";
import { Plus, Edit, Trash2, Eye } from "lucide-react";

export default async function BlogsPage() {
  const blogs = await getBlogs({});

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Bloglar</h2>
          <p className="text-sm text-slate-600">Blog yazılarını yönetin</p>
        </div>
        <Link
          href="/admin/bloglar/yeni"
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-lg transition-all hover:bg-primary-dark"
        >
          <Plus className="h-4 w-4" />
          Yeni Blog Ekle
        </Link>
      </div>

      {/* Blogs Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {blogs.map((blog: any) => (
          <div key={blog.id} className="card group">
            {blog.image && (
              <div className="mb-4 overflow-hidden rounded-lg">
                <img
                  src={blog.image}
                  alt={blog.title}
                  className="h-48 w-full object-cover transition-transform group-hover:scale-105"
                />
              </div>
            )}
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-semibold text-slate-900 line-clamp-2">{blog.title}</h3>
                <span
                  className={`shrink-0 rounded-full px-2 py-1 text-xs font-semibold ${
                    blog.status === 1
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-slate-100 text-slate-700"
                  }`}
                >
                  {blog.status === 1 ? "Aktif" : "Pasif"}
                </span>
              </div>
              
              <p className="text-sm text-slate-600 line-clamp-2">
                {blog.description || "Açıklama yok"}
              </p>

              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span>ID: {blog.id}</span>
                <span>•</span>
                <span>{new Date(blog.created_at).toLocaleDateString("tr-TR")}</span>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <Link
                  href={`/blog/blog/${blog.id}`}
                  target="_blank"
                  className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-center text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  <Eye className="mx-auto h-4 w-4" />
                </Link>
                <Link
                  href={`/admin/bloglar/${blog.id}/duzenle`}
                  className="flex-1 rounded-lg bg-blue-50 px-3 py-2 text-center text-sm font-medium text-blue-600 hover:bg-blue-100"
                >
                  <Edit className="mx-auto h-4 w-4" />
                </Link>
                <button className="flex-1 rounded-lg bg-red-50 px-3 py-2 text-center text-sm font-medium text-red-600 hover:bg-red-100">
                  <Trash2 className="mx-auto h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {blogs.length === 0 && (
        <div className="card text-center">
          <p className="text-slate-600">Henüz blog yazısı bulunmuyor.</p>
          <Link
            href="/admin/bloglar/yeni"
            className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
          >
            <Plus className="h-4 w-4" />
            İlk blog yazısını ekle
          </Link>
        </div>
      )}

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="card">
          <p className="text-sm text-slate-600">Toplam Blog</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{blogs.length}</p>
        </div>
        <div className="card">
          <p className="text-sm text-slate-600">Yayında</p>
          <p className="mt-2 text-3xl font-bold text-emerald-600">
            {blogs.filter((b: any) => b.status === 1).length}
          </p>
        </div>
        <div className="card">
          <p className="text-sm text-slate-600">Taslak</p>
          <p className="mt-2 text-3xl font-bold text-slate-600">
            {blogs.filter((b: any) => b.status !== 1).length}
          </p>
        </div>
      </div>
    </div>
  );
}
