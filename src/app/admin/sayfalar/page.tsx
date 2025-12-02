"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { Plus, Edit, Trash2, Eye, EyeOff, Menu } from "lucide-react";

interface Page {
  id: string;
  slug: string;
  title: string;
  title_en: string | null;
  is_published: boolean;
  show_in_menu: boolean;
  page_type: string;
  created_at: string;
  updated_at: string;
}

export default function SayfalarPage() {
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    fetchPages();
  }, []);

  const fetchPages = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("custom_pages")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPages(data || []);
    } catch (error: any) {
      console.error("Error fetching pages:", error);
      alert("Sayfalar yüklenirken hata oluştu: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const deletePage = async (id: string, slug: string) => {
    if (!confirm(`"${slug}" sayfasını silmek istediğinizden emin misiniz?`)) {
      return;
    }

    try {
      const { error } = await supabase.from("custom_pages").delete().eq("id", id);

      if (error) throw error;

      alert("Sayfa başarıyla silindi!");
      fetchPages();
    } catch (error: any) {
      console.error("Error deleting page:", error);
      alert("Sayfa silinirken hata oluştu: " + error.message);
    }
  };

  const togglePublish = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from("custom_pages")
        .update({ is_published: !currentStatus })
        .eq("id", id);

      if (error) throw error;

      fetchPages();
    } catch (error: any) {
      console.error("Error toggling publish:", error);
      alert("Durum değiştirilirken hata oluştu: " + error.message);
    }
  };

  const filteredPages = pages.filter((page) => {
    if (filter === "all") return true;
    if (filter === "published") return page.is_published;
    if (filter === "draft") return !page.is_published;
    return page.page_type === filter;
  });

  const getTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      custom: "Özel",
      legal: "Yasal",
      corporate: "Kurumsal",
      info: "Bilgilendirme",
    };
    return types[type] || type;
  };

  const getTypeBadgeColor = (type: string) => {
    const colors: Record<string, string> = {
      custom: "bg-blue-100 text-blue-700",
      legal: "bg-amber-100 text-amber-700",
      corporate: "bg-green-100 text-green-700",
      info: "bg-purple-100 text-purple-700",
    };
    return colors[type] || "bg-slate-100 text-slate-700";
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-slate-600">Yükleniyor...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Sayfa Yönetimi</h1>
          <p className="text-sm text-slate-600">
            Özel sayfaları oluşturun ve yönetin
          </p>
        </div>
        <Link
          href="/admin/sayfalar/yeni"
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-lg transition-all hover:bg-primary-dark"
        >
          <Plus className="h-4 w-4" />
          Yeni Sayfa
        </Link>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilter("all")}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition-all ${
              filter === "all"
                ? "bg-primary text-white"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            Tümü ({pages.length})
          </button>
          <button
            onClick={() => setFilter("published")}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition-all ${
              filter === "published"
                ? "bg-primary text-white"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            Yayında ({pages.filter((p) => p.is_published).length})
          </button>
          <button
            onClick={() => setFilter("draft")}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition-all ${
              filter === "draft"
                ? "bg-primary text-white"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            Taslak ({pages.filter((p) => !p.is_published).length})
          </button>
          <button
            onClick={() => setFilter("legal")}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition-all ${
              filter === "legal"
                ? "bg-primary text-white"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            Yasal
          </button>
          <button
            onClick={() => setFilter("corporate")}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition-all ${
              filter === "corporate"
                ? "bg-primary text-white"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            Kurumsal
          </button>
        </div>
      </div>

      {/* Pages List */}
      {filteredPages.length === 0 ? (
        <div className="card text-center">
          <p className="text-slate-600">Henüz sayfa bulunmuyor.</p>
          <Link
            href="/admin/sayfalar/yeni"
            className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
          >
            <Plus className="h-4 w-4" />
            İlk Sayfayı Oluştur
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredPages.map((page) => (
            <div key={page.id} className="card">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex-1">
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <h3 className="text-lg font-semibold text-slate-900">
                      {page.title}
                    </h3>
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-semibold ${getTypeBadgeColor(
                        page.page_type
                      )}`}
                    >
                      {getTypeLabel(page.page_type)}
                    </span>
                    {page.show_in_menu && (
                      <span className="flex items-center gap-1 rounded-full bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-700">
                        <Menu className="h-3 w-3" />
                        Menüde
                      </span>
                    )}
                  </div>
                  <div className="space-y-1 text-sm text-slate-600">
                    <p>
                      <strong>Slug:</strong> /{page.slug}
                    </p>
                    {page.title_en && (
                      <p>
                        <strong>İngilizce:</strong> {page.title_en}
                      </p>
                    )}
                    <p>
                      <strong>Durum:</strong>{" "}
                      <span
                        className={
                          page.is_published ? "text-green-600" : "text-amber-600"
                        }
                      >
                        {page.is_published ? "Yayında" : "Taslak"}
                      </span>
                    </p>
                    <p className="text-xs text-slate-500">
                      Oluşturulma: {new Date(page.created_at).toLocaleDateString("tr-TR")}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Link
                    href={`/${page.slug}`}
                    target="_blank"
                    className="rounded-lg border border-slate-200 p-2 text-slate-700 transition-all hover:bg-slate-50"
                    title="Görüntüle"
                  >
                    <Eye className="h-4 w-4" />
                  </Link>
                  <button
                    onClick={() => togglePublish(page.id, page.is_published)}
                    className={`rounded-lg border p-2 transition-all ${
                      page.is_published
                        ? "border-amber-200 text-amber-600 hover:bg-amber-50"
                        : "border-green-200 text-green-600 hover:bg-green-50"
                    }`}
                    title={page.is_published ? "Yayından Kaldır" : "Yayınla"}
                  >
                    {page.is_published ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                  <Link
                    href={`/admin/sayfalar/${page.id}/duzenle`}
                    className="rounded-lg border border-blue-200 p-2 text-blue-600 transition-all hover:bg-blue-50"
                    title="Düzenle"
                  >
                    <Edit className="h-4 w-4" />
                  </Link>
                  <button
                    onClick={() => deletePage(page.id, page.slug)}
                    className="rounded-lg border border-red-200 p-2 text-red-600 transition-all hover:bg-red-50"
                    title="Sil"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
