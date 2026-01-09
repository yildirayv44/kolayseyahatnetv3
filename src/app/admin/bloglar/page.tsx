"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Edit, Trash2, Eye, Sparkles, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { ContentOptimizerModal } from "@/components/admin/ContentOptimizerModal";

export default function BlogsPage() {
  const [blogs, setBlogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBlog, setSelectedBlog] = useState<any>(null);
  const [showOptimizer, setShowOptimizer] = useState(false);

  useEffect(() => {
    loadBlogs();
  }, []);

  const loadBlogs = async () => {
    const { data } = await supabase
      .from("blogs")
      .select("*")
      .order("created_at", { ascending: false });
    setBlogs(data || []);
    setLoading(false);
  };

  const deleteBlog = async (blogId: number) => {
    if (!confirm('Bu blog yazısını silmek istediğinizden emin misiniz?')) return;

    try {
      // Delete taxonomy entry
      await supabase
        .from('taxonomies')
        .delete()
        .eq('model_id', blogId)
        .eq('type', 'Blog\\BlogController@detail');

      // Delete country-blog relation
      await supabase
        .from('country_to_blogs')
        .delete()
        .eq('blog_id', blogId);

      // Delete blog
      const { error } = await supabase
        .from('blogs')
        .delete()
        .eq('id', blogId);

      if (error) throw error;

      alert('Blog başarıyla silindi!');
      loadBlogs();
    } catch (error: any) {
      console.error('Delete error:', error);
      alert('Silme hatası: ' + error.message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    );
  }

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
            {blog.image_url && (
              <div className="mb-4 overflow-hidden rounded-lg">
                <img
                  src={blog.image_url}
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
                <button
                  onClick={() => {
                    setSelectedBlog(blog);
                    setShowOptimizer(true);
                  }}
                  className="flex-1 rounded-lg bg-purple-50 px-3 py-2 text-center text-sm font-medium text-purple-600 hover:bg-purple-100"
                  title="AI Optimizer"
                >
                  <Sparkles className="mx-auto h-4 w-4" />
                </button>
                <Link
                  href={`/admin/bloglar/${blog.id}/duzenle`}
                  className="flex-1 rounded-lg bg-blue-50 px-3 py-2 text-center text-sm font-medium text-blue-600 hover:bg-blue-100"
                >
                  <Edit className="mx-auto h-4 w-4" />
                </Link>
                <button 
                  onClick={() => deleteBlog(blog.id)}
                  className="flex-1 rounded-lg bg-red-50 px-3 py-2 text-center text-sm font-medium text-red-600 hover:bg-red-100"
                >
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

      {/* Content Optimizer Modal */}
      {showOptimizer && selectedBlog && (
        <ContentOptimizerModal
          blog={selectedBlog}
          onClose={() => {
            setShowOptimizer(false);
            setSelectedBlog(null);
          }}
          onOptimized={() => {
            loadBlogs();
          }}
        />
      )}
    </div>
  );
}
