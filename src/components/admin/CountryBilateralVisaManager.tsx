"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Plus, Sparkles, Trash2, Eye, Edit, Loader2 } from "lucide-react";

interface Country {
  id: number;
  name: string;
  country_code: string;
}

interface BilateralVisaPage {
  id: number;
  slug: string;
  source_country_code: string;
  destination_country_code: string;
  locale: string;
  content_status: string;
  view_count: number;
  created_at: string;
  destination_country?: {
    name: string;
    country_code: string;
  };
}

export function CountryBilateralVisaManager({ country }: { country: Country }) {
  const [pages, setPages] = useState<BilateralVisaPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [destinationCode, setDestinationCode] = useState("");
  const [locale, setLocale] = useState<"tr" | "en">("tr");
  const [countries, setCountries] = useState<Country[]>([]);
  const [loadingCountries, setLoadingCountries] = useState(false);

  useEffect(() => {
    fetchPages();
    fetchCountries();
  }, [country.country_code]);

  const fetchCountries = async () => {
    try {
      setLoadingCountries(true);
      const response = await fetch('/api/admin/countries');
      const data = await response.json();
      if (data.success && data.countries) {
        // Filter out the source country and only include countries with country_code
        setCountries(data.countries.filter((c: Country) => 
          c.country_code && c.country_code !== country.country_code
        ));
      }
    } catch (error) {
      console.error('Failed to fetch countries:', error);
    } finally {
      setLoadingCountries(false);
    }
  };

  const fetchPages = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/admin/visa-pages?source_country_code=${country.country_code}`
      );
      const data = await response.json();
      if (data.success) {
        setPages(data.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch pages:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    if (!destinationCode.trim()) {
      alert("Lütfen hedef ülke kodunu girin");
      return;
    }

    try {
      setGenerating(true);
      const response = await fetch("/api/admin/visa-pages/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source_country_code: country.country_code,
          destination_country_code: destinationCode.toUpperCase(),
          locale,
        }),
      });

      const data = await response.json();
      if (data.success) {
        alert("Bilateral vize sayfası başarıyla oluşturuldu!");
        setShowCreateForm(false);
        setDestinationCode("");
        fetchPages();
      } else {
        alert(`Hata: ${data.error}`);
      }
    } catch (error) {
      console.error("Generate error:", error);
      alert("Sayfa oluşturulurken bir hata oluştu");
    } finally {
      setGenerating(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Bu bilateral vize sayfasını silmek istediğinizden emin misiniz?")) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/visa-pages/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();
      if (data.success) {
        alert("Sayfa başarıyla silindi");
        fetchPages();
      } else {
        alert(`Hata: ${data.error}`);
      }
    } catch (error) {
      console.error("Delete error:", error);
      alert("Sayfa silinirken bir hata oluştu");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">
            {country.name} → Diğer Ülkeler
          </h3>
          <p className="text-sm text-slate-600">
            {pages.length} bilateral vize sayfası
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            href={`/admin/ulkeler/${country.id}/duzenle`}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            <ArrowLeft className="h-4 w-4" />
            Ülkeye Dön
          </Link>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-lg transition-all hover:from-purple-700 hover:to-blue-700"
          >
            <Plus className="h-4 w-4" />
            Yeni Bilateral Vize Sayfası
          </button>
        </div>
      </div>

      {/* Create Form */}
      {showCreateForm && (
        <div className="card p-6">
          <h4 className="mb-4 text-lg font-semibold text-slate-900">
            Yeni Bilateral Vize Sayfası Oluştur
          </h4>
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-900">
                  Kaynak Ülke
                </label>
                <input
                  type="text"
                  value={`${country.name} (${country.country_code})`}
                  disabled
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-sm"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-900">
                  Hedef Ülke *
                </label>
                <select
                  value={destinationCode}
                  onChange={(e) => setDestinationCode(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  disabled={loadingCountries}
                >
                  <option value="">Hedef ülke seçin...</option>
                  {countries
                    .filter(c => c.country_code)
                    .sort((a, b) => a.name.localeCompare(b.name, 'tr'))
                    .map((c) => (
                      <option key={c.id} value={c.country_code}>
                        {c.name} ({c.country_code})
                      </option>
                    ))}
                </select>
                {loadingCountries && (
                  <p className="mt-1 text-xs text-slate-500">Ülkeler yükleniyor...</p>
                )}
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-900">
                Dil
              </label>
              <div className="flex gap-3">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    value="tr"
                    checked={locale === "tr"}
                    onChange={(e) => setLocale(e.target.value as "tr" | "en")}
                    className="h-4 w-4 text-primary"
                  />
                  <span className="text-sm">Türkçe</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    value="en"
                    checked={locale === "en"}
                    onChange={(e) => setLocale(e.target.value as "tr" | "en")}
                    className="h-4 w-4 text-primary"
                  />
                  <span className="text-sm">English</span>
                </label>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowCreateForm(false)}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                İptal
              </button>
              <button
                onClick={handleGenerate}
                disabled={generating || !destinationCode.trim()}
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-50"
              >
                {generating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Oluşturuluyor...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    AI ile Oluştur
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pages List */}
      <div className="card">
        {loading ? (
          <div className="flex items-center justify-center p-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : pages.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-slate-600">
              Henüz bilateral vize sayfası oluşturulmamış
            </p>
            <button
              onClick={() => setShowCreateForm(true)}
              className="mt-4 text-sm text-primary hover:underline"
            >
              İlk sayfayı oluşturun →
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-slate-100 bg-slate-50">
                <tr>
                  <th className="px-4 py-4 text-left font-semibold">Hedef Ülke</th>
                  <th className="px-4 py-4 text-left font-semibold">Slug</th>
                  <th className="px-4 py-4 text-left font-semibold">Dil</th>
                  <th className="px-4 py-4 text-left font-semibold">Durum</th>
                  <th className="px-4 py-4 text-left font-semibold">Görüntülenme</th>
                  <th className="px-4 py-4 text-right font-semibold">İşlemler</th>
                </tr>
              </thead>
              <tbody>
                {pages.map((page) => (
                  <tr key={page.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-slate-900">
                          {page.destination_country?.name || page.destination_country_code}
                        </span>
                        <span className="text-xs text-slate-500">
                          ({page.destination_country_code})
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="font-mono text-xs text-slate-600">{page.slug}</span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-700">
                        {page.locale.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-semibold ${
                          page.content_status === "published"
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {page.content_status}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm text-slate-600">{page.view_count || 0}</span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/${page.slug}`}
                          target="_blank"
                          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100"
                          title="Görüntüle"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        <Link
                          href={`/admin/ulkeler/vize-sayfalari/${page.id}`}
                          className="rounded-lg p-2 text-blue-600 hover:bg-blue-50"
                          title="Düzenle"
                        >
                          <Edit className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(page.id)}
                          className="rounded-lg p-2 text-red-600 hover:bg-red-50"
                          title="Sil"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
