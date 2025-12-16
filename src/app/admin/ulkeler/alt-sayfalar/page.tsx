"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Plus, Edit, Trash2, Search, Globe, FileText, Languages, Loader2, CheckSquare, Square } from "lucide-react";
import Link from "next/link";

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
  contents_en: string | null;
  name_en: string | null;
  description: string | null;
  status: number;
  sorted: number;
  country_id: number | null;
  country?: Country;
}

export default function CountryMenusPage() {
  const [menus, setMenus] = useState<CountryMenu[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);
  const [translating, setTranslating] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCountry, setSelectedCountry] = useState<number | null>(null);
  const [enFilter, setEnFilter] = useState<"all" | "missing-en">("all");
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch countries
      const countriesRes = await fetch("/api/admin/countries/list");
      const countriesData = await countriesRes.json();
      setCountries(countriesData.countries || []);

      // Fetch menus
      const menusRes = await fetch("/api/admin/country-menus/list");
      const menusData = await menusRes.json();
      setMenus(menusData.menus || []);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Bu alt sayfayı silmek istediğinizden emin misiniz?")) return;

    try {
      const res = await fetch(`/api/admin/country-menus/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setMenus(menus.filter(m => m.id !== id));
        alert("Alt sayfa silindi!");
      } else {
        alert("Hata oluştu!");
      }
    } catch (error) {
      console.error("Error deleting menu:", error);
      alert("Hata oluştu!");
    }
  };

  // Separate categories (parent_id = 0 or null) and sub-pages
  const categories = menus.filter(m => !m.parent_id || m.parent_id === 0);
  const subPages = menus.filter(m => m.parent_id && m.parent_id !== 0);

  const filteredMenus = menus.filter(menu => {
    const matchesSearch = menu.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         menu.slug?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCountry = !selectedCountry || menu.country_id === selectedCountry;
    const matchesEn = enFilter === "all" || (!menu.name_en || !menu.contents_en);
    return matchesSearch && matchesCountry && matchesEn;
  });

  // Toggle selection
  const toggleSelect = (id: number) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  // Select all filtered sub-pages (not categories)
  const selectAllSubPages = () => {
    const subPageIds = filteredMenus.filter(m => m.parent_id && m.parent_id !== 0).map(m => m.id);
    if (selectedIds.size === subPageIds.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(subPageIds));
    }
  };

  // Translate selected menus
  const translateSelected = async () => {
    if (selectedIds.size === 0) {
      alert("Lütfen çevirmek istediğiniz alt sayfaları seçin!");
      return;
    }

    if (!confirm(`${selectedIds.size} alt sayfa İngilizce'ye çevrilecek. Devam etmek istiyor musunuz?`)) {
      return;
    }

    setTranslating(true);
    let successCount = 0;
    let errorCount = 0;

    for (const id of selectedIds) {
      try {
        // First get the menu data
        const menuRes = await fetch(`/api/admin/country-menus/${id}`);
        const menuData = await menuRes.json();
        const menu = menuData.menu;

        if (!menu) {
          errorCount++;
          continue;
        }

        // Translate using AI
        const translateRes = await fetch("/api/admin/ai/translate-country-menu", {
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

        if (!translateRes.ok) {
          errorCount++;
          continue;
        }

        const translation = await translateRes.json();

        // Update the menu with translations
        const updateRes = await fetch(`/api/admin/country-menus/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...menu,
            name_en: translation.name_en,
            description_en: translation.description_en,
            contents_en: translation.contents_en,
            meta_title_en: translation.meta_title_en,
            meta_description_en: translation.meta_description_en,
          }),
        });

        if (updateRes.ok) {
          successCount++;
        } else {
          errorCount++;
        }
      } catch {
        errorCount++;
      }
    }

    setTranslating(false);
    setSelectedIds(new Set());
    alert(`✅ ${successCount} alt sayfa başarıyla çevrildi${errorCount > 0 ? `, ${errorCount} hata oluştu` : ''}!`);
    
    // Refresh data
    fetchData();
  };

  // Group sub-pages by category
  const groupedMenus = filteredMenus.reduce((acc, menu) => {
    if (!menu.parent_id || menu.parent_id === 0) {
      // This is a category
      if (!acc[menu.id]) {
        acc[menu.id] = { category: menu, children: [] };
      }
    } else {
      // This is a sub-page
      if (!acc[menu.parent_id]) {
        const parentCategory = categories.find(c => c.id === menu.parent_id);
        acc[menu.parent_id] = { 
          category: parentCategory || { id: menu.parent_id, name: 'Bilinmeyen Kategori' }, 
          children: [] 
        };
      }
      acc[menu.parent_id].children.push(menu);
    }
    return acc;
  }, {} as Record<number, { category: CountryMenu | any; children: CountryMenu[] }>);

  const groupedArray = Object.values(groupedMenus).sort((a, b) => 
    (a.category?.sorted || 0) - (b.category?.sorted || 0)
  );

  const getCountryName = (menu: CountryMenu) => {
    // Use country from API (from pivot table)
    if (menu.country) {
      return menu.country.name;
    }
    
    // Fallback: find by country_id
    if (menu.country_id) {
      const country = countries.find(c => c.id === menu.country_id);
      if (country) return country.name;
    }
    
    return "Bilinmiyor";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/ulkeler"
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white hover:bg-slate-50"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Ülke Alt Sayfaları</h1>
            <p className="text-sm text-slate-600">
              Ülkelere ait vize türleri ve alt sayfaları yönetin
            </p>
          </div>
        </div>
        <Link
          href="/admin/ulkeler/alt-sayfalar/yeni"
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-white hover:bg-primary-dark"
        >
          <Plus className="h-5 w-5" />
          Yeni Alt Sayfa
        </Link>
      </div>

      {/* Filters */}
      <div className="card space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Arama
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Sayfa adı veya slug ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-slate-300 py-2 pl-10 pr-4"
              />
            </div>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Ülke Filtrele
            </label>
            <select
              value={selectedCountry || ""}
              onChange={(e) => setSelectedCountry(e.target.value ? Number(e.target.value) : null)}
              className="w-full rounded-lg border border-slate-300 px-4 py-2"
            >
              <option value="">Tüm Ülkeler</option>
              {countries.map((country) => (
                <option key={country.id} value={country.id}>
                  {country.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              İngilizce Durumu
            </label>
            <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-300 px-4 py-2 hover:bg-slate-50">
              <input
                type="checkbox"
                checked={enFilter === "missing-en"}
                onChange={(e) => setEnFilter(e.target.checked ? "missing-en" : "all")}
                className="rounded border-slate-300 text-primary focus:ring-primary"
              />
              <Languages className="h-4 w-4 text-orange-500" />
              <span className="text-slate-700">İngilizce Eksik</span>
            </label>
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedIds.size > 0 && (
        <div className="card flex items-center justify-between bg-blue-50 border-blue-200">
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-blue-900">
              {selectedIds.size} alt sayfa seçildi
            </span>
            <button
              onClick={() => setSelectedIds(new Set())}
              className="text-xs text-blue-600 hover:text-blue-800"
            >
              Seçimi Temizle
            </button>
          </div>
          <button
            onClick={translateSelected}
            disabled={translating}
            className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 px-4 py-2 text-sm font-semibold text-white hover:from-purple-700 hover:to-blue-700 disabled:opacity-50"
          >
            {translating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Çevriliyor...
              </>
            ) : (
              <>
                <Languages className="h-4 w-4" />
                Seçilenleri İngilizce'ye Çevir
              </>
            )}
          </button>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-100 p-3">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-900">{menus.length}</div>
              <div className="text-sm text-slate-600">Toplam Alt Sayfa</div>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-green-100 p-3">
              <Globe className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-900">
                {menus.filter(m => m.status === 1).length}
              </div>
              <div className="text-sm text-slate-600">Aktif Sayfa</div>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-purple-100 p-3">
              <Globe className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-900">
                {new Set(menus.map(m => m.parent_id)).size}
              </div>
              <div className="text-sm text-slate-600">Ülke Sayısı</div>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
              <p className="mt-4 text-sm text-slate-600">Yükleniyor...</p>
            </div>
          </div>
        ) : filteredMenus.length === 0 ? (
          <div className="py-12 text-center">
            <FileText className="mx-auto h-12 w-12 text-slate-300" />
            <p className="mt-4 text-slate-600">Alt sayfa bulunamadı</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3">
                    <button
                      onClick={selectAllSubPages}
                      className="flex items-center justify-center text-slate-600 hover:text-primary"
                      title="Tümünü Seç/Kaldır"
                    >
                      {selectedIds.size > 0 && selectedIds.size === filteredMenus.filter(m => m.parent_id && m.parent_id !== 0).length ? (
                        <CheckSquare className="h-5 w-5 text-primary" />
                      ) : (
                        <Square className="h-5 w-5" />
                      )}
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-700">
                    Sayfa Adı
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-700">
                    Ülke
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-700">
                    Slug
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-700">
                    EN
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-700">
                    Durum
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-700">
                    Sıra
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-slate-700">
                    İşlemler
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {groupedArray.map(({ category, children }) => (
                  <>
                    {/* Category Row */}
                    <tr key={`cat-${category.id}`} className="bg-slate-50">
                      <td className="px-4 py-4" colSpan={8}>
                        <div className="flex items-center gap-3">
                          <div className="rounded-lg bg-primary/10 p-2">
                            <FileText className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <div className="font-bold text-slate-900">{category.name}</div>
                            <div className="text-xs text-slate-600">
                              {getCountryName(category)} • {children.length} alt sayfa
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                    
                    {/* Sub-pages */}
                    {children.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="px-4 py-4 text-center text-sm text-slate-500">
                          Bu kategoride alt sayfa yok
                        </td>
                      </tr>
                    ) : (
                      children.map((menu) => (
                        <tr key={menu.id} className={`hover:bg-slate-50 ${selectedIds.has(menu.id) ? 'bg-blue-50' : ''}`}>
                          <td className="px-4 py-4">
                            <button
                              onClick={() => toggleSelect(menu.id)}
                              className="flex items-center justify-center text-slate-600 hover:text-primary"
                            >
                              {selectedIds.has(menu.id) ? (
                                <CheckSquare className="h-5 w-5 text-primary" />
                              ) : (
                                <Square className="h-5 w-5" />
                              )}
                            </button>
                          </td>
                          <td className="px-4 py-4 pl-12">
                            <div className="flex items-center gap-2">
                              <div className="h-px w-4 bg-slate-300"></div>
                              <div>
                                <div className="font-medium text-slate-900">{menu.name}</div>
                                {menu.description && (
                                  <div className="text-sm text-slate-500 line-clamp-1">
                                    {menu.description}
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4 text-sm text-slate-600">
                            {getCountryName(menu)}
                          </td>
                          <td className="px-4 py-4">
                            <code className="rounded bg-slate-100 px-2 py-1 text-xs text-slate-700">
                              {menu.slug || "-"}
                            </code>
                          </td>
                          <td className="px-4 py-4">
                            {menu.name_en && menu.contents_en ? (
                              <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-1 text-xs font-semibold text-green-700">
                                ✓ Var
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-2 py-1 text-xs font-semibold text-orange-700">
                                ✗ Eksik
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-4">
                            <span
                              className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                                menu.status === 1
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {menu.status === 1 ? "Aktif" : "Pasif"}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-sm text-slate-600">
                            {menu.sorted || 0}
                          </td>
                          <td className="px-4 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Link
                                href={`/admin/ulkeler/alt-sayfalar/${menu.id}`}
                                className="rounded-lg border border-slate-300 p-2 hover:bg-slate-50"
                              >
                                <Edit className="h-4 w-4 text-slate-600" />
                              </Link>
                              <button
                                onClick={() => handleDelete(menu.id)}
                                className="rounded-lg border border-red-300 p-2 hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4 text-red-600" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
