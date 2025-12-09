"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";

const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });
import "react-quill/dist/quill.snow.css";

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
}

export default function EditCountryMenuPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [id, setId] = useState<string>("");
  const [menu, setMenu] = useState<CountryMenu | null>(null);
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

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
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="card space-y-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
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

          {/* Slug */}
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
              required
            />
            <p className="mt-1 text-xs text-slate-500">
              URL: /{menu.slug}
            </p>
          </div>

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
              İçerik
            </label>
            <div className="rounded-lg border border-slate-300">
              <ReactQuill
                value={menu.contents || ""}
                onChange={(value) => setMenu({ ...menu, contents: value })}
                theme="snow"
                className="bg-white"
                modules={{
                  toolbar: [
                    [{ header: [1, 2, 3, false] }],
                    ["bold", "italic", "underline", "strike"],
                    [{ list: "ordered" }, { list: "bullet" }],
                    ["link", "image"],
                    ["clean"],
                  ],
                }}
              />
            </div>
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
