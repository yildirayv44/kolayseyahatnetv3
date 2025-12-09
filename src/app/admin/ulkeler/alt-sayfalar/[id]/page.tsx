"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Save, Loader2, Sparkles, Languages } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { TiptapEditor } from "@/components/admin/TiptapEditor";

interface Country {
  id: number;
  name: string;
  slug: string;
}

interface CountryMenu {
  id: number;
  name: string;
  slug: string;
  parent_id: number;
  contents: string | null;
  description: string | null;
  status: number;
  sorted: number;
  country_id: number | null;
  meta_title?: string | null;
  meta_description?: string | null;
  name_en?: string | null;
  contents_en?: string | null;
  description_en?: string | null;
  meta_title_en?: string | null;
  meta_description_en?: string | null;
}

export default function EditCountryMenuPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [id, setId] = useState<string>("");
  const [menu, setMenu] = useState<CountryMenu | null>(null);
  const [countries, setCountries] = useState<Country[]>([]);
  const [categories, setCategories] = useState<CountryMenu[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [translating, setTranslating] = useState(false);

  useEffect(() => {
    params.then((p) => {
      setId(p.id);
      fetchData(p.id);
    });
  }, []);

  const fetchData = async (menuId: string) => {
    try {
      setLoading(true);

      // Fetch countries
      const countriesRes = await fetch("/api/admin/countries/list");
      const countriesData = await countriesRes.json();
      setCountries(countriesData.countries || []);

      // Fetch categories (parent menus)
      const categoriesRes = await fetch("/api/admin/country-menus/list");
      const categoriesData = await categoriesRes.json();
      const allMenus = categoriesData.menus || [];
      // Filter only categories (parent_id = 0 or null)
      const cats = allMenus.filter((m: CountryMenu) => !m.parent_id || m.parent_id === 0);
      setCategories(cats);

      // Fetch menu
      const menuRes = await fetch(`/api/admin/country-menus/${menuId}`);
      const menuData = await menuRes.json();
      
      if (menuData.menu) {
        setMenu(menuData.menu);
      } else {
        alert("Alt sayfa bulunamadı!");
        router.push("/admin/ulkeler/alt-sayfalar");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      alert("Hata oluştu!");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!menu) return;

    try {
      setSaving(true);

      const res = await fetch(`/api/admin/country-menus/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(menu),
      });

      if (res.ok) {
        alert("Alt sayfa güncellendi!");
        router.push("/admin/ulkeler/alt-sayfalar");
      } else {
        const data = await res.json();
        alert(`Hata: ${data.error || "Bilinmeyen hata"}`);
      }
    } catch (error) {
      console.error("Error saving menu:", error);
      alert("Hata oluştu!");
    } finally {
      setSaving(false);
    }
  };

  const generateSlug = (name: string, countryId: number | null) => {
    const country = countries.find(c => c.id === countryId);
    const countrySlug = country?.slug || "";
    const nameSlug = name
      .toLowerCase()
      .replace(/ğ/g, "g")
      .replace(/ü/g, "u")
      .replace(/ş/g, "s")
      .replace(/ı/g, "i")
      .replace(/ö/g, "o")
      .replace(/ç/g, "c")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    
    return countrySlug ? `${countrySlug}-${nameSlug}` : nameSlug;
  };

  const handleTranslate = async () => {
    if (!menu?.name) {
      alert("Lütfen önce Türkçe içeriği doldurun!");
      return;
    }

    if (!confirm("AI ile İngilizce çeviri yapılsın mı? Mevcut İngilizce içerik değiştirilecek.")) {
      return;
    }

    try {
      setTranslating(true);

      const res = await fetch("/api/admin/ai/translate-country-menu", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: menu.name,
          description: menu.description,
          contents: menu.contents,
          meta_title: menu.meta_title,
          meta_description: menu.meta_description,
        }),
      });

      if (!res.ok) {
        throw new Error("Çeviri yapılamadı");
      }

      const data = await res.json();

      setMenu({
        ...menu,
        name_en: data.name_en,
        description_en: data.description_en,
        contents_en: data.contents_en,
        meta_title_en: data.meta_title_en,
        meta_description_en: data.meta_description_en,
      });

      alert("✨ İngilizce çeviri başarıyla oluşturuldu!");
    } catch (error) {
      console.error("Error translating:", error);
      alert("Hata: Çeviri yapılamadı");
    } finally {
      setTranslating(false);
    }
  };

  const handleGenerateContent = async () => {
    if (!menu?.country_id || !menu?.name) {
      alert("Lütfen önce ülke ve sayfa adı seçin!");
      return;
    }

    if (!confirm("AI ile içerik oluşturulsun mu? Mevcut içerik değiştirilecek.")) {
      return;
    }

    try {
      setGenerating(true);

      const country = countries.find(c => c.id === menu.country_id);
      const parentCategory = menu.parent_id ? categories.find(c => c.id === menu.parent_id) : null;

      const res = await fetch("/api/admin/ai/generate-country-menu", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          countryName: country?.name || "",
          menuName: menu.name,
          menuType: menu.parent_id ? "page" : "category",
          parentCategory: parentCategory?.name || "",
          keywords: [],
          tone: "professional",
          length: "medium",
        }),
      });

      if (!res.ok) {
        throw new Error("İçerik oluşturulamadı");
      }

      const data = await res.json();

      setMenu({
        ...menu,
        contents: data.content,
        meta_title: data.metadata.meta_title,
        meta_description: data.metadata.meta_description,
        description: data.metadata.short_description,
      });

      alert("✨ AI içerik başarıyla oluşturuldu!");
    } catch (error) {
      console.error("Error generating content:", error);
      alert("Hata: İçerik oluşturulamadı");
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="mt-4 text-sm text-slate-600">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!menu) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/ulkeler/alt-sayfalar"
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white hover:bg-slate-50"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Alt Sayfa Düzenle</h1>
            <p className="text-sm text-slate-600">{menu.name}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleTranslate}
            disabled={translating}
            className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-green-600 to-emerald-600 px-4 py-2 text-white hover:from-green-700 hover:to-emerald-700 disabled:opacity-50"
          >
            {translating ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Çevriliyor...
              </>
            ) : (
              <>
                <Languages className="h-5 w-5" />
                İngilizce Çevir
              </>
            )}
          </button>
          <button
            type="button"
            onClick={handleGenerateContent}
            disabled={generating}
            className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 px-4 py-2 text-white hover:from-purple-700 hover:to-blue-700 disabled:opacity-50"
          >
            {generating ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                AI Oluşturuyor...
              </>
            ) : (
              <>
                <Sparkles className="h-5 w-5" />
                AI ile Oluştur
              </>
            )}
          </button>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="card space-y-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {/* Country */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Ülke <span className="text-red-500">*</span>
              </label>
              <select
                value={menu.country_id || ""}
                onChange={(e) => {
                  const countryId = e.target.value ? Number(e.target.value) : null;
                  setMenu({
                    ...menu,
                    country_id: countryId,
                    slug: generateSlug(menu.name, countryId),
                  });
                }}
                className="w-full rounded-lg border border-slate-300 px-4 py-2"
                required
              >
                <option value="">Ülke Seçin</option>
                {countries.map((country) => (
                  <option key={country.id} value={country.id}>
                    {country.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Category */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Kategori
              </label>
              <select
                value={menu.parent_id || ""}
                onChange={(e) => setMenu({ ...menu, parent_id: e.target.value ? Number(e.target.value) : 0 })}
                className="w-full rounded-lg border border-slate-300 px-4 py-2"
              >
                <option value="">Kategori Yok (Ana Sayfa)</option>
                {categories
                  .filter(c => c.country_id === menu.country_id)
                  .map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
              </select>
              <p className="mt-1 text-xs text-slate-500">
                Kategori seçilmezse bu sayfa ana kategori olur
              </p>
            </div>

            {/* Status */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Durum
              </label>
              <select
                value={menu.status}
                onChange={(e) => setMenu({ ...menu, status: Number(e.target.value) })}
                className="w-full rounded-lg border border-slate-300 px-4 py-2"
              >
                <option value={1}>Aktif</option>
                <option value={0}>Pasif</option>
              </select>
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Sayfa Adı <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={menu.name}
              onChange={(e) => {
                const name = e.target.value;
                setMenu({
                  ...menu,
                  name,
                  slug: generateSlug(name, menu.country_id),
                });
              }}
              className="w-full rounded-lg border border-slate-300 px-4 py-2"
              placeholder="Örn: Çalışma Vizesi"
              required
            />
          </div>

          {/* Slug - Only for sub-pages */}
          {menu.parent_id !== 0 && (
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Slug <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={menu.slug}
                onChange={(e) => setMenu({ ...menu, slug: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-4 py-2"
                placeholder="Örn: amerika-calisma-vizesi"
                required={menu.parent_id !== 0}
              />
              <p className="mt-1 text-xs text-slate-500">
                URL: /{menu.slug}
              </p>
            </div>
          )}

          {/* Meta Title - Only for sub-pages */}
          {menu.parent_id !== 0 && (
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                SEO Başlık (Meta Title)
              </label>
              <input
                type="text"
                value={menu.meta_title || ""}
                onChange={(e) => setMenu({ ...menu, meta_title: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-4 py-2"
                placeholder="Örn: Amerika Çalışma Vizesi - Kolay Seyahat"
                maxLength={60}
              />
              <p className="mt-1 text-xs text-slate-500">
                {menu.meta_title?.length || 0}/60 karakter (Google'da gösterilecek başlık)
              </p>
            </div>
          )}

          {/* Meta Description - Only for sub-pages */}
          {menu.parent_id !== 0 && (
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                SEO Açıklama (Meta Description)
              </label>
              <textarea
                value={menu.meta_description || ""}
                onChange={(e) => setMenu({ ...menu, meta_description: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-4 py-2"
                rows={3}
                placeholder="Örn: Amerika çalışma vizesi başvurusu için gerekli belgeler, süreç ve detaylı bilgiler..."
                maxLength={160}
              />
              <p className="mt-1 text-xs text-slate-500">
                {menu.meta_description?.length || 0}/160 karakter (Google'da gösterilecek açıklama)
              </p>
            </div>
          )}

          {/* Description */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Kısa Açıklama
            </label>
            <textarea
              value={menu.description || ""}
              onChange={(e) => setMenu({ ...menu, description: e.target.value })}
              className="w-full rounded-lg border border-slate-300 px-4 py-2"
              rows={3}
              placeholder="Sayfa hakkında kısa açıklama..."
            />
          </div>

          {/* Sorted */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Sıralama
            </label>
            <input
              type="number"
              value={menu.sorted}
              onChange={(e) => setMenu({ ...menu, sorted: Number(e.target.value) })}
              className="w-full rounded-lg border border-slate-300 px-4 py-2"
              placeholder="0"
            />
            <p className="mt-1 text-xs text-slate-500">
              Küçük sayı önce gösterilir
            </p>
          </div>

          {/* Contents */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              İçerik (Türkçe)
            </label>
            <TiptapEditor
              value={menu.contents || ""}
              onChange={(value: string) => setMenu({ ...menu, contents: value })}
            />
          </div>

          {/* English Section */}
          <div className="col-span-full border-t-2 border-slate-200 pt-6">
            <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-slate-900">
              <Languages className="h-5 w-5" />
              İngilizce Çeviri
            </h3>
            <p className="mb-4 text-sm text-slate-600">
              İngilizce alanları manuel doldurabilir veya "İngilizce Çevir" butonuyla AI ile otomatik çevirebilirsiniz.
            </p>
          </div>

          {/* Name EN */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Sayfa Adı (English)
            </label>
            <input
              type="text"
              value={menu.name_en || ""}
              onChange={(e) => setMenu({ ...menu, name_en: e.target.value })}
              className="w-full rounded-lg border border-slate-300 px-4 py-2"
              placeholder="E.g: Work Visa"
            />
          </div>

          {/* Meta Title EN - Only for sub-pages */}
          {menu.parent_id !== 0 && (
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                SEO Title (English)
              </label>
              <input
                type="text"
                value={menu.meta_title_en || ""}
                onChange={(e) => setMenu({ ...menu, meta_title_en: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-4 py-2"
                placeholder="E.g: USA Work Visa - Kolay Seyahat"
                maxLength={60}
              />
              <p className="mt-1 text-xs text-slate-500">
                {menu.meta_title_en?.length || 0}/60 characters
              </p>
            </div>
          )}

          {/* Meta Description EN - Only for sub-pages */}
          {menu.parent_id !== 0 && (
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                SEO Description (English)
              </label>
              <textarea
                value={menu.meta_description_en || ""}
                onChange={(e) => setMenu({ ...menu, meta_description_en: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-4 py-2"
                rows={3}
                placeholder="E.g: USA work visa application requirements, process and detailed information..."
                maxLength={160}
              />
              <p className="mt-1 text-xs text-slate-500">
                {menu.meta_description_en?.length || 0}/160 characters
              </p>
            </div>
          )}

          {/* Description EN */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Short Description (English)
            </label>
            <textarea
              value={menu.description_en || ""}
              onChange={(e) => setMenu({ ...menu, description_en: e.target.value })}
              className="w-full rounded-lg border border-slate-300 px-4 py-2"
              rows={3}
              placeholder="Brief description about the page..."
            />
          </div>

          {/* Contents EN */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Content (English)
            </label>
            <TiptapEditor
              value={menu.contents_en || ""}
              onChange={(value: string) => setMenu({ ...menu, contents_en: value })}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-4">
          <Link
            href="/admin/ulkeler/alt-sayfalar"
            className="rounded-lg border border-slate-300 px-6 py-2 hover:bg-slate-50"
          >
            İptal
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 rounded-lg bg-primary px-6 py-2 text-white hover:bg-primary-dark disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Kaydediliyor...
              </>
            ) : (
              <>
                <Save className="h-5 w-5" />
                Kaydet
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
