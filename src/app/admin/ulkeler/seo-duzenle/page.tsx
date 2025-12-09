"use client";

import { useState, useEffect } from "react";
import { CheckCircle2, AlertCircle, Loader2, RefreshCw, Eye, Save, Sparkles } from "lucide-react";

interface SEOIssue {
  id: number;
  name: string;
  title: string | null;
  meta_title: string | null;
  meta_description: string | null;
  created_at: string;
  problems: {
    title_has_kolay: boolean;
    meta_missing_kolay: boolean;
    meta_desc_missing: boolean;
    meta_title_missing: boolean;
  };
}

interface FixResult {
  id: number;
  name: string;
  before: {
    title: string | null;
    meta_title: string | null;
    meta_description: string | null;
  };
  after: {
    title?: string;
    meta_title?: string;
    meta_description?: string;
  };
}

export default function SEODuzenlePage() {
  const [issues, setIssues] = useState<SEOIssue[]>([]);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);
  const [fixing, setFixing] = useState(false);
  const [previewMode, setPreviewMode] = useState(true);
  const [fixResults, setFixResults] = useState<FixResult[]>([]);
  const [allCountries, setAllCountries] = useState<any[]>([]);
  const [showAllCountries, setShowAllCountries] = useState(false);
  const [selectedCountries, setSelectedCountries] = useState<Set<number>>(new Set());
  const [aiUpdating, setAiUpdating] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    issues_count: 0,
  });

  const checkSEO = async () => {
    setChecking(true);
    try {
      const response = await fetch("/api/admin/countries/check-seo");
      const data = await response.json();
      setIssues(data.issues || []);
      setAllCountries(data.all_countries || []);
      setStats({
        total: data.total_countries || 0,
        issues_count: data.countries_with_issues || 0,
      });
    } catch (error) {
      console.error("Error checking SEO:", error);
      alert("SEO kontrolü sırasında hata oluştu");
    } finally {
      setChecking(false);
      setLoading(false);
    }
  };

  const previewFixes = async () => {
    setFixing(true);
    try {
      const response = await fetch("/api/admin/countries/fix-seo?dry_run=true");
      const data = await response.json();
      setFixResults(data.updates || []);
      setPreviewMode(true);
    } catch (error) {
      console.error("Error previewing fixes:", error);
      alert("Önizleme sırasında hata oluştu");
    } finally {
      setFixing(false);
    }
  };

  const applyFixes = async () => {
    if (!confirm(`${fixResults.length} ülkenin SEO bilgileri güncellenecek. Onaylıyor musunuz?`)) {
      return;
    }

    setFixing(true);
    try {
      const response = await fetch("/api/admin/countries/fix-seo?dry_run=false");
      const data = await response.json();
      
      if (data.success) {
        alert(`✅ ${data.fixed_countries} ülkenin SEO bilgileri güncellendi!`);
        setFixResults([]);
        setPreviewMode(false);
        // Refresh issues
        await checkSEO();
      }
    } catch (error) {
      console.error("Error applying fixes:", error);
      alert("Düzeltmeler uygulanırken hata oluştu");
    } finally {
      setFixing(false);
    }
  };

  useEffect(() => {
    checkSEO();
  }, []);

  const toggleCountry = (id: number) => {
    const newSelected = new Set(selectedCountries);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedCountries(newSelected);
  };

  const toggleAll = () => {
    if (selectedCountries.size === allCountries.length) {
      setSelectedCountries(new Set());
    } else {
      setSelectedCountries(new Set(allCountries.map(c => c.id)));
    }
  };

  const updateWithAI = async () => {
    if (selectedCountries.size === 0) {
      alert("Lütfen en az bir ülke seçin");
      return;
    }

    if (!confirm(`${selectedCountries.size} ülkenin SEO bilgileri AI ile güncellenecek. Onaylıyor musunuz?`)) {
      return;
    }

    setAiUpdating(true);
    try {
      const response = await fetch("/api/admin/countries/ai-update-seo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          country_ids: Array.from(selectedCountries),
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        alert(`✅ ${data.updated_count} ülkenin SEO bilgileri AI ile güncellendi!`);
        setSelectedCountries(new Set());
        await checkSEO();
      } else {
        alert(`❌ Hata: ${data.error}`);
      }
    } catch (error) {
      console.error("Error updating with AI:", error);
      alert("AI güncelleme sırasında hata oluştu");
    } finally {
      setAiUpdating(false);
    }
  };

  const getProblemBadge = (problem: string) => {
    const badges: Record<string, { label: string; color: string }> = {
      title_has_kolay: { label: 'Title\'da "- Kolay Seyahat"', color: "bg-orange-100 text-orange-700" },
      meta_missing_kolay: { label: 'Meta Title\'da marka yok', color: "bg-red-100 text-red-700" },
      meta_desc_missing: { label: 'Meta Description eksik', color: "bg-yellow-100 text-yellow-700" },
      meta_title_missing: { label: 'Meta Title eksik', color: "bg-red-100 text-red-700" },
    };
    return badges[problem] || { label: problem, color: "bg-gray-100 text-gray-700" };
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">SEO Düzenle</h1>
          <p className="mt-2 text-slate-600">
            Ülke sayfalarının SEO başlık ve açıklamalarını toplu olarak düzenleyin
          </p>
        </div>
        <button
          onClick={checkSEO}
          disabled={checking}
          className="inline-flex items-center gap-2 rounded-lg bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-200 disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${checking ? "animate-spin" : ""}`} />
          Yenile
        </button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <div className="text-sm font-semibold text-slate-600">Toplam Ülke</div>
          <div className="mt-2 text-3xl font-bold text-slate-900">{stats.total}</div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <div className="text-sm font-semibold text-slate-600">SEO Sorunu Olan</div>
          <div className="mt-2 text-3xl font-bold text-orange-600">{stats.issues_count}</div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <div className="text-sm font-semibold text-slate-600">Düzeltilecek</div>
          <div className="mt-2 text-3xl font-bold text-green-600">
            {fixResults.length > 0 ? fixResults.length : stats.issues_count}
          </div>
        </div>
      </div>

      {/* Actions */}
      {issues.length > 0 && (
        <div className="flex gap-3">
          <button
            onClick={previewFixes}
            disabled={fixing}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
          >
            {fixing ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                İşleniyor...
              </>
            ) : (
              <>
                <Eye className="h-5 w-5" />
                Düzeltmeleri Önizle
              </>
            )}
          </button>

          {fixResults.length > 0 && (
            <button
              onClick={applyFixes}
              disabled={fixing}
              className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-green-700 disabled:opacity-50"
            >
              <Save className="h-5 w-5" />
              Değişiklikleri Uygula ({fixResults.length})
            </button>
          )}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}

      {/* Preview Results */}
      {fixResults.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 rounded-lg bg-blue-50 p-4">
            <Eye className="h-5 w-5 text-blue-600" />
            <div>
              <div className="font-semibold text-blue-900">Önizleme Modu</div>
              <div className="text-sm text-blue-700">
                Aşağıdaki değişiklikler henüz uygulanmadı. "Değişiklikleri Uygula" butonuna tıklayın.
              </div>
            </div>
          </div>

          {fixResults.map((result) => (
            <div key={result.id} className="rounded-xl border border-slate-200 bg-white p-6">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-900">{result.name}</h3>
                <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                  Önizleme
                </span>
              </div>

              <div className="space-y-4">
                {/* Title */}
                {result.after.title && (
                  <div>
                    <div className="mb-1 text-xs font-semibold text-slate-500">SAYFA BAŞLIĞI (H1)</div>
                    <div className="rounded-lg bg-red-50 p-3">
                      <div className="text-xs text-red-600">Öncesi:</div>
                      <div className="text-sm text-red-900">{result.before.title || <span className="italic text-red-400">Boş</span>}</div>
                    </div>
                    <div className="my-2 text-center text-xs text-slate-400">↓</div>
                    <div className="rounded-lg bg-green-50 p-3">
                      <div className="text-xs text-green-600">Sonrası:</div>
                      <div className="text-sm font-semibold text-green-900">{result.after.title}</div>
                    </div>
                  </div>
                )}

                {/* Meta Title */}
                {result.after.meta_title && (
                  <div>
                    <div className="mb-1 text-xs font-semibold text-slate-500">SEO META TITLE</div>
                    <div className="rounded-lg bg-red-50 p-3">
                      <div className="text-xs text-red-600">Öncesi:</div>
                      <div className="text-sm text-red-900 break-words">
                        {result.before.meta_title || <span className="italic text-red-400">Boş</span>}
                      </div>
                    </div>
                    <div className="my-2 text-center text-xs text-slate-400">↓</div>
                    <div className="rounded-lg bg-green-50 p-3">
                      <div className="text-xs text-green-600">Sonrası:</div>
                      <div className="text-sm font-semibold text-green-900 break-words">{result.after.meta_title}</div>
                    </div>
                  </div>
                )}

                {/* Meta Description */}
                {result.after.meta_description && (
                  <div>
                    <div className="mb-1 text-xs font-semibold text-slate-500">SEO META DESCRIPTION</div>
                    <div className="rounded-lg bg-red-50 p-3">
                      <div className="text-xs text-red-600">Öncesi:</div>
                      <div className="text-sm text-red-900 break-words">
                        {result.before.meta_description ? (
                          <>
                            {result.before.meta_description}
                            <div className="mt-1 text-xs text-red-600">
                              {result.before.meta_description.length} karakter
                            </div>
                          </>
                        ) : (
                          <span className="italic text-red-400">Boş</span>
                        )}
                      </div>
                    </div>
                    <div className="my-2 text-center text-xs text-slate-400">↓</div>
                    <div className="rounded-lg bg-green-50 p-3">
                      <div className="text-xs text-green-600">Sonrası:</div>
                      <div className="text-sm font-semibold text-green-900 break-words">
                        {result.after.meta_description}
                      </div>
                      <div className="mt-1 text-xs text-green-600">
                        {result.after.meta_description.length} karakter
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Issues List */}
      {!loading && fixResults.length === 0 && issues.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-slate-900">SEO Sorunları ({issues.length})</h2>
          {issues.map((issue) => (
            <div key={issue.id} className="rounded-xl border border-slate-200 bg-white p-6">
              <div className="mb-3 flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">{issue.name}</h3>
                  <div className="mt-1 text-xs text-slate-500">ID: {issue.id}</div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(issue.problems)
                    .filter(([_, value]) => value)
                    .map(([key]) => {
                      const badge = getProblemBadge(key);
                      return (
                        <span
                          key={key}
                          className={`rounded-full px-2 py-1 text-xs font-semibold ${badge.color}`}
                        >
                          {badge.label}
                        </span>
                      );
                    })}
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-semibold text-slate-600">Title:</span>{" "}
                  <span className="text-slate-900">{issue.title || "Boş"}</span>
                </div>
                <div>
                  <span className="font-semibold text-slate-600">Meta Title:</span>{" "}
                  <span className="text-slate-900">{issue.meta_title || "Boş"}</span>
                </div>
                <div>
                  <span className="font-semibold text-slate-600">Meta Description:</span>{" "}
                  <span className="text-slate-900">
                    {issue.meta_description
                      ? `${issue.meta_description.substring(0, 100)}... (${issue.meta_description.length} karakter)`
                      : "Boş"}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* No Issues */}
      {!loading && issues.length === 0 && fixResults.length === 0 && (
        <div className="space-y-6">
          <div className="rounded-xl border-2 border-green-200 bg-green-50 p-8 text-center">
            <CheckCircle2 className="mx-auto h-12 w-12 text-green-600" />
            <h3 className="mt-4 text-xl font-bold text-green-900">Tüm Ülkeler SEO Uyumlu!</h3>
            <p className="mt-2 text-green-700">
              Tüm ülke sayfalarının SEO başlık ve açıklamaları düzgün şekilde ayarlanmış.
            </p>
            <button
              onClick={() => setShowAllCountries(!showAllCountries)}
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-green-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-green-700"
            >
              {showAllCountries ? "Listeyi Gizle" : "Tüm Ülkeleri Göster"} ({allCountries.length})
            </button>
          </div>

          {/* All Countries Table */}
          {showAllCountries && (
            <div className="space-y-4">
              {/* AI Update Controls */}
              {selectedCountries.size > 0 && (
                <div className="flex items-center justify-between rounded-lg bg-purple-50 p-4 border border-purple-200">
                  <div>
                    <div className="font-semibold text-purple-900">
                      {selectedCountries.size} ülke seçildi
                    </div>
                    <div className="text-sm text-purple-700">
                      Seçili ülkelerin SEO bilgileri AI ile güncellenecek
                    </div>
                  </div>
                  <button
                    onClick={updateWithAI}
                    disabled={aiUpdating}
                    className="inline-flex items-center gap-2 rounded-lg bg-purple-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-purple-700 disabled:opacity-50"
                  >
                    {aiUpdating ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        AI Güncelliyor...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-5 w-5" />
                        AI ile Güncelle
                      </>
                    )}
                  </button>
                </div>
              )}

              <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="px-6 py-3 text-left">
                          <input
                            type="checkbox"
                            checked={selectedCountries.size === allCountries.length && allCountries.length > 0}
                            onChange={toggleAll}
                            className="h-4 w-4 rounded border-slate-300 text-purple-600 focus:ring-purple-500"
                          />
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                          #
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                          Ülke
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                          SEO Meta Title
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                          SEO Meta Description
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {allCountries.map((country, index) => (
                        <tr key={country.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4">
                            <input
                              type="checkbox"
                              checked={selectedCountries.has(country.id)}
                              onChange={() => toggleCountry(country.id)}
                              className="h-4 w-4 rounded border-slate-300 text-purple-600 focus:ring-purple-500"
                            />
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-500">
                            {index + 1}
                          </td>
                        <td className="px-6 py-4">
                          <div className="font-semibold text-slate-900">{country.name}</div>
                          <div className="text-xs text-slate-500">ID: {country.id}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-slate-900 max-w-md">
                            {country.meta_title || <span className="italic text-slate-400">Boş</span>}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-slate-900 max-w-lg">
                            {country.meta_description ? (
                              <>
                                <div className="line-clamp-2">{country.meta_description}</div>
                                <div className="mt-1 text-xs text-slate-500">
                                  {country.meta_description.length} karakter
                                </div>
                              </>
                            ) : (
                              <span className="italic text-slate-400">Boş</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          )}
        </div>
      )}
    </div>
  );
}

