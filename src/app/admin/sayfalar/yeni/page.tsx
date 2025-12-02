"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";
import { RichTextEditor } from "@/components/admin/RichTextEditor";

export default function YeniSayfaPage() {
  const router = useRouter();
  const [activeLocale, setActiveLocale] = useState<"tr" | "en">("tr");
  const [formData, setFormData] = useState({
    slug: "",
    title: "",
    title_en: "",
    content: "",
    content_en: "",
    meta_description: "",
    meta_description_en: "",
    is_published: false,
    show_in_menu: false,
    menu_order: 0,
    page_type: "custom",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.slug || !formData.title || !formData.content) {
      alert("Lütfen zorunlu alanları doldurun (Slug, Başlık, İçerik)");
      return;
    }

    try {
      const { data: user } = await supabase.auth.getUser();

      const { error } = await supabase.from("custom_pages").insert({
        ...formData,
        created_by: user.user?.id,
        updated_by: user.user?.id,
      });

      if (error) throw error;

      alert("Sayfa başarıyla oluşturuldu!");
      router.push("/admin/sayfalar");
      router.refresh();
    } catch (error: any) {
      console.error("Error creating page:", error);
      alert("Hata: " + error.message);
    }
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/ğ/g, "g")
      .replace(/ü/g, "u")
      .replace(/ş/g, "s")
      .replace(/ı/g, "i")
      .replace(/ö/g, "o")
      .replace(/ç/g, "c")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Yeni Sayfa Oluştur</h1>
          <p className="text-sm text-slate-600">
            Özel bir sayfa oluşturun ve içeriğini düzenleyin
          </p>
        </div>
        <Link
          href="/admin/sayfalar"
          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          <ArrowLeft className="h-4 w-4" />
          Geri
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Language Toggle */}
        <div className="card">
          <div className="mb-4 flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveLocale("tr")}
              className={`rounded-lg px-4 py-2 text-sm font-semibold transition-all ${
                activeLocale === "tr"
                  ? "bg-primary text-white"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              🇹🇷 Türkçe
            </button>
            <button
              type="button"
              onClick={() => setActiveLocale("en")}
              className={`rounded-lg px-4 py-2 text-sm font-semibold transition-all ${
                activeLocale === "en"
                  ? "bg-primary text-white"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              🇬🇧 English
            </button>
          </div>

          {/* Basic Info */}
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-900">
                Slug (URL) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) =>
                  setFormData({ ...formData, slug: e.target.value })
                }
                className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="ornek-sayfa"
                required
              />
              <p className="text-xs text-slate-500">
                URL: /{formData.slug || "ornek-sayfa"}
              </p>
            </div>

            {activeLocale === "tr" ? (
              <>
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-900">
                    Başlık (Türkçe) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => {
                      const title = e.target.value;
                      setFormData({
                        ...formData,
                        title,
                        slug: formData.slug || generateSlug(title),
                      });
                    }}
                    className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder="Sayfa Başlığı"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-900">
                    Meta Açıklama (Türkçe)
                  </label>
                  <textarea
                    value={formData.meta_description}
                    onChange={(e) =>
                      setFormData({ ...formData, meta_description: e.target.value })
                    }
                    rows={2}
                    className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder="SEO için meta açıklama (150-160 karakter)"
                  />
                </div>
              </>
            ) : (
              <>
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-900">
                    Title (English)
                  </label>
                  <input
                    type="text"
                    value={formData.title_en}
                    onChange={(e) =>
                      setFormData({ ...formData, title_en: e.target.value })
                    }
                    className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder="Page Title"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-900">
                    Meta Description (English)
                  </label>
                  <textarea
                    value={formData.meta_description_en}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        meta_description_en: e.target.value,
                      })
                    }
                    rows={2}
                    className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder="Meta description for SEO (150-160 characters)"
                  />
                </div>
              </>
            )}
          </div>
        </div>

        {/* Content Editor */}
        <div className="card space-y-4">
          <h3 className="text-lg font-bold text-slate-900">
            İçerik ({activeLocale === "tr" ? "Türkçe" : "English"})
          </h3>
          <RichTextEditor
            value={activeLocale === "tr" ? formData.content : formData.content_en}
            onChange={(value) =>
              setFormData({
                ...formData,
                [activeLocale === "tr" ? "content" : "content_en"]: value,
              })
            }
            placeholder={
              activeLocale === "tr"
                ? "Sayfa içeriğini buraya yazın..."
                : "Write page content here..."
            }
          />
        </div>

        {/* Settings */}
        <div className="card space-y-4">
          <h3 className="text-lg font-bold text-slate-900">Ayarlar</h3>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-900">
              Sayfa Tipi
            </label>
            <select
              value={formData.page_type}
              onChange={(e) =>
                setFormData({ ...formData, page_type: e.target.value })
              }
              className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="custom">Özel</option>
              <option value="legal">Yasal</option>
              <option value="corporate">Kurumsal</option>
              <option value="info">Bilgilendirme</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_published"
              checked={formData.is_published}
              onChange={(e) =>
                setFormData({ ...formData, is_published: e.target.checked })
              }
              className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-2 focus:ring-primary/20"
            />
            <label htmlFor="is_published" className="text-sm font-semibold text-slate-900">
              Sayfayı yayınla
            </label>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="show_in_menu"
              checked={formData.show_in_menu}
              onChange={(e) =>
                setFormData({ ...formData, show_in_menu: e.target.checked })
              }
              className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-2 focus:ring-primary/20"
            />
            <label htmlFor="show_in_menu" className="text-sm font-semibold text-slate-900">
              Menüde göster
            </label>
          </div>

          {formData.show_in_menu && (
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-900">
                Menü Sırası
              </label>
              <input
                type="number"
                value={formData.menu_order}
                onChange={(e) =>
                  setFormData({ ...formData, menu_order: parseInt(e.target.value) })
                }
                className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                min="0"
              />
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div className="flex items-center gap-3">
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 font-semibold text-white shadow-lg transition-all hover:bg-primary-dark"
          >
            <Save className="h-4 w-4" />
            Sayfayı Kaydet
          </button>
          <Link
            href="/admin/sayfalar"
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-6 py-3 font-semibold text-slate-700 hover:bg-slate-50"
          >
            İptal
          </Link>
        </div>
      </form>
    </div>
  );
}
