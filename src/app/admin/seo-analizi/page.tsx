"use client";

import { useEffect, useState } from "react";
import { Search, Filter, TrendingUp, TrendingDown, AlertCircle, CheckCircle, ExternalLink, RefreshCw, Edit3, Save, X, Globe, Languages, Sparkles, Loader2 } from "lucide-react";
import Link from "next/link";

interface RichSnippet {
  type: string;
  available: boolean;
  fields?: string[];
}

interface SEOScore {
  id: number;
  type: 'blog' | 'country' | 'page';
  title: string;
  slug?: string;
  url: string;
  score: number;
  issues: string[];
  suggestions: string[];
  meta_title_length: number;
  meta_description_length: number;
  content_word_count: number;
  has_meta_title: boolean;
  has_meta_description: boolean;
  has_content: boolean;
  status: 'excellent' | 'good' | 'needs_improvement' | 'poor';
  publish_status: 'published' | 'draft';
  locale: 'tr' | 'en';
  tr_score?: number;
  en_score?: number;
  tr_issues?: string[];
  en_issues?: string[];
  rich_snippets?: RichSnippet[];
  raw_data?: {
    meta_title?: string;
    meta_title_en?: string;
    meta_description?: string;
    meta_description_en?: string;
    description?: string;
    description_en?: string;
    title?: string;
    title_en?: string;
    contents?: string;
    contents_en?: string;
  };
}

interface Stats {
  total: number;
  excellent: number;
  good: number;
  needs_improvement: number;
  poor: number;
  average_score: number;
}

export default function SEOAnaliziPage() {
  const [results, setResults] = useState<SEOScore[]>([]);
  const [stats, setStats] = useState<Stats>({
    total: 0,
    excellent: 0,
    good: 0,
    needs_improvement: 0,
    poor: 0,
    average_score: 0,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("score_desc");
  const [selectedItem, setSelectedItem] = useState<SEOScore | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState<Record<string, string>>({});
  const [showOnlyMissing, setShowOnlyMissing] = useState(false);
  const [translating, setTranslating] = useState(false);
  const [translateSingleId, setTranslateSingleId] = useState<number | null>(null);
  const [missingCount, setMissingCount] = useState({ countries: 0, blogs: 0, total: 0 });

  // Fetch missing translation count
  const fetchMissingCount = async () => {
    try {
      const response = await fetch('/api/admin/seo/translate-missing');
      const data = await response.json();
      if (data.success) {
        setMissingCount(data.missing);
      }
    } catch (error) {
      console.error('Error fetching missing count:', error);
    }
  };

  // Translate all missing content
  const translateAllMissing = async (type?: string) => {
    if (!confirm(`${type ? (type === 'country' ? 'Ülkeler' : 'Bloglar') : 'Tüm içerikler'} için eksik İngilizce içerikler AI ile çevrilecek. Devam etmek istiyor musunuz?`)) {
      return;
    }

    setTranslating(true);
    try {
      const response = await fetch('/api/admin/seo/translate-missing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ translateAll: true, type }),
      });
      const data = await response.json();
      
      if (data.success) {
        alert(`✅ ${data.total_translated} içerik başarıyla çevrildi!\n\nDetaylar:\n${data.results.map((r: any) => `• ${r.name}: ${r.fields_translated.join(', ') || 'Zaten çevrilmiş'}`).join('\n')}`);
        fetchAnalysis();
        fetchMissingCount();
      } else {
        alert('❌ Çeviri hatası: ' + data.error);
      }
    } catch (error: any) {
      alert('❌ Çeviri hatası: ' + error.message);
    } finally {
      setTranslating(false);
    }
  };

  // Translate single item
  const translateSingle = async (item: SEOScore) => {
    setTranslateSingleId(item.id);
    try {
      const response = await fetch('/api/admin/seo/translate-missing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: item.type, id: item.id }),
      });
      const data = await response.json();
      
      if (data.success && data.results[0]) {
        const result = data.results[0];
        if (result.fields_translated.length > 0) {
          alert(`✅ ${result.name} çevrildi!\nAlanlar: ${result.fields_translated.join(', ')}`);
          fetchAnalysis();
          fetchMissingCount();
        } else {
          alert('ℹ️ Çevrilecek eksik alan bulunamadı.');
        }
      } else {
        alert('❌ Çeviri hatası: ' + (data.error || data.results[0]?.error));
      }
    } catch (error: any) {
      alert('❌ Çeviri hatası: ' + error.message);
    } finally {
      setTranslateSingleId(null);
    }
  };

  const fetchAnalysis = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        type: typeFilter,
        status: statusFilter,
        sort: sortBy,
      });

      const response = await fetch(`/api/admin/seo/analyze-all?${params}`);
      const data = await response.json();

      if (data.success) {
        setResults(data.results);
        setStats(data.stats);
      }
    } catch (error) {
      console.error("Error fetching SEO analysis:", error);
      alert("SEO analizi yüklenirken hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalysis();
    fetchMissingCount();
  }, [typeFilter, statusFilter, sortBy]);

  // Filter results
  const filteredResults = results.filter((item) => {
    // Search filter
    if (searchQuery && !item.title.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    // Show only missing EN content filter - only truly missing content, not quality issues
    if (showOnlyMissing) {
      const hasTrulyMissingEN = item.en_issues && item.en_issues.some(issue => 
        issue.includes('Meta title eksik') || 
        issue.includes('Meta description eksik') || 
        issue.includes('İçerik eksik')
      );
      if (!hasTrulyMissingEN) return false;
    }
    
    return true;
  });

  // Start editing
  const startEdit = (item: SEOScore) => {
    setSelectedItem(item);
    setEditMode(true);
    
    // Set edit data based on content type
    if (item.type === 'country') {
      setEditData({
        meta_title: item.raw_data?.meta_title || '',
        meta_title_en: item.raw_data?.meta_title_en || '',
        meta_description: item.raw_data?.meta_description || '',
        meta_description_en: item.raw_data?.meta_description_en || '',
        title_en: item.raw_data?.title_en || '',
      });
    } else if (item.type === 'page') {
      setEditData({
        meta_title: item.raw_data?.meta_title || item.raw_data?.title || '',
        meta_title_en: item.raw_data?.meta_title_en || item.raw_data?.title_en || '',
        meta_description: item.raw_data?.meta_description || '',
        meta_description_en: item.raw_data?.meta_description_en || '',
        title_en: item.raw_data?.title_en || '',
      });
    } else {
      // blog
      setEditData({
        meta_title: item.raw_data?.meta_title || '',
        meta_title_en: item.raw_data?.meta_title_en || '',
        description: item.raw_data?.description || '',
        description_en: item.raw_data?.description_en || '',
        title_en: item.raw_data?.title_en || '',
      });
    }
  };

  // Save changes
  const saveChanges = async () => {
    if (!selectedItem) return;
    
    setSaving(true);
    try {
      // Map field names for different types
      const fieldMap: Record<string, Record<string, string>> = {
        page: {
          description: 'meta_description',
          description_en: 'meta_description_en',
        },
      };
      
      const updates: Record<string, string> = {};
      for (const [key, value] of Object.entries(editData)) {
        if (value && value.trim()) {
          const mappedKey = fieldMap[selectedItem.type]?.[key] || key;
          updates[mappedKey] = value;
        }
      }
      
      const response = await fetch('/api/admin/seo/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedItem.id,
          type: selectedItem.type,
          updates,
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        alert('Değişiklikler kaydedildi!');
        setEditMode(false);
        setSelectedItem(null);
        fetchAnalysis(); // Refresh data
      } else {
        alert(`Hata: ${data.error}`);
      }
    } catch (error) {
      console.error('Save error:', error);
      alert('Kaydetme sırasında hata oluştu');
    } finally {
      setSaving(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'good':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'needs_improvement':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'poor':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'excellent':
        return 'Mükemmel';
      case 'good':
        return 'İyi';
      case 'needs_improvement':
        return 'İyileştirilebilir';
      case 'poor':
        return 'Zayıf';
      default:
        return status;
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'blog':
        return 'Blog';
      case 'country':
        return 'Ülke';
      case 'page':
        return 'Sayfa';
      default:
        return type;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'blog':
        return 'bg-purple-100 text-purple-700';
      case 'country':
        return 'bg-blue-100 text-blue-700';
      case 'page':
        return 'bg-indigo-100 text-indigo-700';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-blue-600';
    if (score >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">SEO Analizi</h1>
          <p className="text-sm text-slate-600">
            Tüm içeriklerinizin SEO performansını analiz edin
          </p>
        </div>
        <button
          onClick={fetchAnalysis}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90 disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Yenile
        </button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
        <div className="card">
          <div className="text-sm text-slate-600">Toplam</div>
          <div className="text-2xl font-bold text-slate-900">{stats.total}</div>
        </div>
        <div className="card">
          <div className="text-sm text-slate-600">Ortalama Skor</div>
          <div className={`text-2xl font-bold ${getScoreColor(stats.average_score)}`}>
            {stats.average_score}/100
          </div>
        </div>
        <div className="card">
          <div className="text-sm text-green-600">Mükemmel</div>
          <div className="text-2xl font-bold text-green-600">{stats.excellent}</div>
        </div>
        <div className="card">
          <div className="text-sm text-blue-600">İyi</div>
          <div className="text-2xl font-bold text-blue-600">{stats.good}</div>
        </div>
        <div className="card">
          <div className="text-sm text-yellow-600">İyileştirilebilir</div>
          <div className="text-2xl font-bold text-yellow-600">{stats.needs_improvement}</div>
        </div>
        <div className="card">
          <div className="text-sm text-red-600">Zayıf</div>
          <div className="text-2xl font-bold text-red-600">{stats.poor}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="İçerik ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-slate-200 py-2 pl-10 pr-4 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {/* Filters */}
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-slate-400" />
            
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="all">Tüm Tipler</option>
              <option value="blog">Blog</option>
              <option value="country">Ülke</option>
              <option value="page">Sayfa</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="all">Tüm Durumlar</option>
              <option value="excellent">Mükemmel</option>
              <option value="good">İyi</option>
              <option value="needs_improvement">İyileştirilebilir</option>
              <option value="poor">Zayıf</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="score_desc">Skor (Yüksek → Düşük)</option>
              <option value="score_asc">Skor (Düşük → Yüksek)</option>
              <option value="title_asc">Başlık (A → Z)</option>
              <option value="title_desc">Başlık (Z → A)</option>
            </select>

            <label className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm cursor-pointer hover:bg-slate-50">
              <input
                type="checkbox"
                checked={showOnlyMissing}
                onChange={(e) => setShowOnlyMissing(e.target.checked)}
                className="rounded border-slate-300 text-primary focus:ring-primary"
              />
              <Languages className="h-4 w-4 text-slate-500" />
              <span className="text-slate-700">Sadece EN Eksik</span>
            </label>
          </div>

          {/* AI Translation Buttons */}
          <div className="flex items-center gap-2">
            {missingCount.total > 0 && (
              <>
                <span className="text-sm text-slate-500">
                  Eksik: {missingCount.countries} ülke, {missingCount.blogs} blog
                </span>
                <button
                  onClick={() => translateAllMissing()}
                  disabled={translating}
                  className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-purple-500 to-indigo-500 px-4 py-2 text-sm font-semibold text-white hover:from-purple-600 hover:to-indigo-600 disabled:opacity-50"
                >
                  {translating ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="h-4 w-4" />
                  )}
                  {translating ? 'Çevriliyor...' : 'AI ile Meta Çevir'}
                </button>
              </>
            )}
            <button
              onClick={async () => {
                if (!confirm('Tüm ülkelerin travel_tips ve application_steps alanları İngilizce\'ye çevrilecek. Devam?')) return;
                setTranslating(true);
                try {
                  const res = await fetch('/api/admin/seo/translate-json-fields', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ limit: 20 }),
                  });
                  const data = await res.json();
                  if (data.success) {
                    alert(`✅ ${data.total_translated} ülke çevrildi!`);
                    fetchAnalysis();
                  } else {
                    alert('❌ Hata: ' + data.error);
                  }
                } catch (e: any) {
                  alert('❌ Hata: ' + e.message);
                } finally {
                  setTranslating(false);
                }
              }}
              disabled={translating}
              className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-green-500 to-teal-500 px-4 py-2 text-sm font-semibold text-white hover:from-green-600 hover:to-teal-600 disabled:opacity-50"
            >
              {translating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              Tips & Steps Çevir
            </button>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="card">
        {loading ? (
          <div className="py-12 text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-primary" />
            <p className="mt-4 text-sm text-slate-600">Analiz ediliyor...</p>
          </div>
        ) : filteredResults.length === 0 ? (
          <div className="py-12 text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-slate-300" />
            <p className="mt-4 text-sm text-slate-600">İçerik bulunamadı</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">
                    BAŞLIK
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-slate-600">
                    TİP
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-slate-600">
                    TR SKOR
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-slate-600">
                    EN SKOR
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-slate-600">
                    SEO DURUM
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-slate-600">
                    EKSİKLER
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-slate-600">
                    RICH SNIPPETS
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600">
                    İŞLEMLER
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredResults.map((item) => {
                  const trIssueCount = item.tr_issues?.filter(i => i.includes('eksik')).length || 0;
                  const enIssueCount = item.en_issues?.filter(i => i.includes('eksik')).length || 0;
                  
                  return (
                    <tr key={`${item.type}-${item.id}`} className="hover:bg-slate-50">
                      <td className="px-4 py-4">
                        <div className="font-medium text-slate-900">{item.title}</div>
                        <div className="text-xs text-slate-500">{item.url}</div>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className={`inline-block rounded-full px-2 py-1 text-xs font-semibold ${getTypeColor(item.type)}`}>
                          {getTypeText(item.type)}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <div className={`text-xl font-bold ${getScoreColor(item.tr_score || 0)}`}>
                          {item.tr_score || 0}
                        </div>
                        <div className="text-xs text-slate-500">🇹🇷 TR</div>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <div className={`text-xl font-bold ${getScoreColor(item.en_score || 0)}`}>
                          {item.en_score || 0}
                        </div>
                        <div className="text-xs text-slate-500">🇬🇧 EN</div>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className={`inline-block rounded-lg border px-3 py-1 text-xs font-semibold ${getStatusColor(item.status)}`}>
                          {getStatusText(item.status)}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <div className="space-y-1 text-xs">
                          {trIssueCount > 0 && (
                            <div className="text-orange-600">
                              🇹🇷 {trIssueCount} sorun
                            </div>
                          )}
                          {enIssueCount > 0 && (
                            <div className="text-red-600">
                              🇬🇧 {enIssueCount} sorun
                            </div>
                          )}
                          {trIssueCount === 0 && enIssueCount === 0 && (
                            <div className="text-green-600">✓ Tamam</div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-center">
                        {item.rich_snippets && (
                          <div className="flex flex-wrap justify-center gap-1">
                            {item.rich_snippets.slice(0, 4).map((snippet, idx) => (
                              <span
                                key={idx}
                                className={`inline-block rounded px-1.5 py-0.5 text-[10px] font-medium ${
                                  snippet.available
                                    ? 'bg-green-100 text-green-700'
                                    : 'bg-slate-100 text-slate-400'
                                }`}
                                title={snippet.available ? `✓ ${snippet.type}: ${snippet.fields?.join(', ')}` : `✗ ${snippet.type}: Eksik`}
                              >
                                {snippet.available ? '✓' : '✗'} {snippet.type}
                              </span>
                            ))}
                            {item.rich_snippets.length > 4 && (
                              <span className="text-[10px] text-slate-500">+{item.rich_snippets.length - 4}</span>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center justify-end gap-2">
                          {/* AI Translate Button - show only if EN content truly missing */}
                          {item.en_issues && item.en_issues.some(i => 
                            i.includes('Meta title eksik') || 
                            i.includes('Meta description eksik') || 
                            i.includes('İçerik eksik')
                          ) && (
                            <button
                              onClick={() => translateSingle(item)}
                              disabled={translateSingleId === item.id}
                              className="rounded-lg p-2 text-purple-600 hover:bg-purple-100 disabled:opacity-50"
                              title="AI ile Çevir"
                            >
                              {translateSingleId === item.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Sparkles className="h-4 w-4" />
                              )}
                            </button>
                          )}
                          <button
                            onClick={() => startEdit(item)}
                            className="rounded-lg p-2 text-slate-600 hover:bg-blue-100 hover:text-blue-600"
                            title="Düzenle"
                          >
                            <Edit3 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => { setSelectedItem(item); setEditMode(false); }}
                            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 hover:text-primary"
                            title="Detayları Gör"
                          >
                            <AlertCircle className="h-4 w-4" />
                          </button>
                          <Link
                            href={item.url}
                            target="_blank"
                            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 hover:text-primary"
                            title="Sayfayı Görüntüle"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail/Edit Modal */}
      {selectedItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => { setSelectedItem(null); setEditMode(false); }}
        >
          <div
            className="w-full max-w-4xl rounded-xl bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-start justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  {editMode ? '✏️ Düzenle: ' : ''}{selectedItem.title}
                </h2>
                <p className="text-sm text-slate-600">{selectedItem.url}</p>
              </div>
              <button
                onClick={() => { setSelectedItem(null); setEditMode(false); }}
                className="rounded-lg p-2 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* TR/EN Score Comparison */}
            <div className="mb-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-lg bg-gradient-to-r from-red-50 to-orange-50 p-4 text-center">
                <div className="text-xs text-slate-600 mb-1">🇹🇷 Türkçe Skor</div>
                <div className={`text-4xl font-bold ${getScoreColor(selectedItem.tr_score || 0)}`}>
                  {selectedItem.tr_score || 0}/100
                </div>
              </div>
              <div className="rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 p-4 text-center">
                <div className="text-xs text-slate-600 mb-1">🇬🇧 İngilizce Skor</div>
                <div className={`text-4xl font-bold ${getScoreColor(selectedItem.en_score || 0)}`}>
                  {selectedItem.en_score || 0}/100
                </div>
              </div>
            </div>

            {editMode ? (
              /* Edit Form */
              <div className="space-y-6">
                {/* Meta Title */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-slate-700">
                      🇹🇷 Meta Title ({editData.meta_title?.length || 0}/60)
                    </label>
                    <input
                      type="text"
                      value={editData.meta_title || ''}
                      onChange={(e) => setEditData({ ...editData, meta_title: e.target.value })}
                      className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                        (editData.meta_title?.length || 0) >= 30 && (editData.meta_title?.length || 0) <= 60
                          ? 'border-green-300 bg-green-50'
                          : 'border-slate-200'
                      }`}
                      placeholder="Meta title (50-60 karakter)"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-slate-700">
                      🇬🇧 Meta Title EN ({editData.meta_title_en?.length || 0}/60)
                    </label>
                    <input
                      type="text"
                      value={editData.meta_title_en || ''}
                      onChange={(e) => setEditData({ ...editData, meta_title_en: e.target.value })}
                      className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                        (editData.meta_title_en?.length || 0) >= 30 && (editData.meta_title_en?.length || 0) <= 60
                          ? 'border-green-300 bg-green-50'
                          : (editData.meta_title_en?.length || 0) === 0
                          ? 'border-red-300 bg-red-50'
                          : 'border-slate-200'
                      }`}
                      placeholder="Meta title in English (50-60 chars)"
                    />
                  </div>
                </div>

                {/* Description - country/page için meta_description, blog için description */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-slate-700">
                      🇹🇷 Description ({(selectedItem?.type === 'blog' ? editData.description?.length : editData.meta_description?.length) || 0}/160)
                    </label>
                    <textarea
                      value={(selectedItem?.type === 'blog' ? editData.description : editData.meta_description) || ''}
                      onChange={(e) => setEditData({ 
                        ...editData, 
                        ...(selectedItem?.type === 'blog' 
                          ? { description: e.target.value } 
                          : { meta_description: e.target.value })
                      })}
                      rows={3}
                      className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                        ((selectedItem?.type === 'blog' ? editData.description?.length : editData.meta_description?.length) || 0) >= 100 && 
                        ((selectedItem?.type === 'blog' ? editData.description?.length : editData.meta_description?.length) || 0) <= 160
                          ? 'border-green-300 bg-green-50'
                          : 'border-slate-200'
                      }`}
                      placeholder="Meta description (150-160 karakter)"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-slate-700">
                      🇬🇧 Description EN ({(selectedItem?.type === 'blog' ? editData.description_en?.length : editData.meta_description_en?.length) || 0}/160)
                    </label>
                    <textarea
                      value={(selectedItem?.type === 'blog' ? editData.description_en : editData.meta_description_en) || ''}
                      onChange={(e) => setEditData({ 
                        ...editData, 
                        ...(selectedItem?.type === 'blog' 
                          ? { description_en: e.target.value } 
                          : { meta_description_en: e.target.value })
                      })}
                      rows={3}
                      className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                        ((selectedItem?.type === 'blog' ? editData.description_en?.length : editData.meta_description_en?.length) || 0) >= 100 && 
                        ((selectedItem?.type === 'blog' ? editData.description_en?.length : editData.meta_description_en?.length) || 0) <= 160
                          ? 'border-green-300 bg-green-50'
                          : ((selectedItem?.type === 'blog' ? editData.description_en?.length : editData.meta_description_en?.length) || 0) === 0
                          ? 'border-red-300 bg-red-50'
                          : 'border-slate-200'
                      }`}
                      placeholder="Meta description in English (150-160 chars)"
                    />
                  </div>
                </div>

                {/* Title EN (for content) */}
                <div>
                  <label className="mb-1 block text-sm font-semibold text-slate-700">
                    🇬🇧 Title EN (İçerik Başlığı)
                  </label>
                  <input
                    type="text"
                    value={editData.title_en || ''}
                    onChange={(e) => setEditData({ ...editData, title_en: e.target.value })}
                    className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                      (editData.title_en?.length || 0) === 0
                        ? 'border-red-300 bg-red-50'
                        : 'border-green-300 bg-green-50'
                    }`}
                    placeholder="Content title in English"
                  />
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-4 border-t">
                  <button
                    onClick={() => { setEditMode(false); }}
                    className="rounded-lg border border-slate-200 px-4 py-2 font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    İptal
                  </button>
                  <button
                    onClick={saveChanges}
                    disabled={saving}
                    className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 font-semibold text-white hover:bg-primary/90 disabled:opacity-50"
                  >
                    <Save className="h-4 w-4" />
                    {saving ? 'Kaydediliyor...' : 'Kaydet'}
                  </button>
                </div>
              </div>
            ) : (
              /* View Mode */
              <>
                {/* TR Issues */}
                {selectedItem.tr_issues && selectedItem.tr_issues.length > 0 && (
                  <div className="mb-4">
                    <h3 className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-900">
                      🇹🇷 Türkçe Sorunlar ({selectedItem.tr_issues.length})
                    </h3>
                    <div className="space-y-1">
                      {selectedItem.tr_issues.map((issue, idx) => (
                        <div key={idx} className="flex items-start gap-2 rounded-lg bg-orange-50 p-2 text-sm text-orange-700">
                          <span>•</span>
                          <span>{issue.replace('[TR] ', '')}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* EN Issues */}
                {selectedItem.en_issues && selectedItem.en_issues.length > 0 && (
                  <div className="mb-4">
                    <h3 className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-900">
                      🇬🇧 İngilizce Sorunlar ({selectedItem.en_issues.length})
                    </h3>
                    <div className="space-y-1">
                      {selectedItem.en_issues.map((issue, idx) => (
                        <div key={idx} className="flex items-start gap-2 rounded-lg bg-red-50 p-2 text-sm text-red-700">
                          <span>•</span>
                          <span>{issue.replace('[EN] ', '')}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Rich Snippets */}
                {selectedItem.rich_snippets && selectedItem.rich_snippets.length > 0 && (
                  <div className="mb-4 rounded-lg border border-slate-200 p-4">
                    <h3 className="mb-3 text-sm font-bold text-slate-900">🎯 Rich Snippets (Structured Data)</h3>
                    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                      {selectedItem.rich_snippets.map((snippet, idx) => (
                        <div
                          key={idx}
                          className={`rounded-lg border p-3 ${
                            snippet.available
                              ? 'border-green-200 bg-green-50'
                              : 'border-slate-200 bg-slate-50'
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`text-lg ${snippet.available ? 'text-green-600' : 'text-slate-400'}`}>
                              {snippet.available ? '✓' : '✗'}
                            </span>
                            <span className={`font-semibold ${snippet.available ? 'text-green-700' : 'text-slate-500'}`}>
                              {snippet.type}
                            </span>
                          </div>
                          {snippet.available && snippet.fields && snippet.fields.length > 0 && (
                            <div className="text-xs text-slate-600">
                              {snippet.fields.join(' • ')}
                            </div>
                          )}
                          {!snippet.available && (
                            <div className="text-xs text-slate-400">
                              Veri eksik - aktif değil
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Current Values */}
                {selectedItem.raw_data && (
                  <div className="mb-4 rounded-lg border border-slate-200 p-4">
                    <h3 className="mb-3 text-sm font-bold text-slate-900">Mevcut Değerler</h3>
                    <div className="space-y-3 text-sm">
                      <div className="grid gap-2 sm:grid-cols-2">
                        <div>
                          <span className="text-slate-500">🇹🇷 Meta Title:</span>
                          <p className="font-medium text-slate-900 truncate">{selectedItem.raw_data.meta_title || '(boş)'}</p>
                        </div>
                        <div>
                          <span className="text-slate-500">🇬🇧 Meta Title EN:</span>
                          <p className={`font-medium truncate ${selectedItem.raw_data.meta_title_en ? 'text-slate-900' : 'text-red-600'}`}>
                            {selectedItem.raw_data.meta_title_en || '(boş - EKSİK!)'}
                          </p>
                        </div>
                      </div>
                      <div className="grid gap-2 sm:grid-cols-2">
                        <div>
                          <span className="text-slate-500">🇹🇷 Description:</span>
                          <p className="font-medium text-slate-900 line-clamp-2">{selectedItem.raw_data.description || '(boş)'}</p>
                        </div>
                        <div>
                          <span className="text-slate-500">🇬🇧 Description EN:</span>
                          <p className={`font-medium line-clamp-2 ${selectedItem.raw_data.description_en ? 'text-slate-900' : 'text-red-600'}`}>
                            {selectedItem.raw_data.description_en || '(boş - EKSİK!)'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => { setSelectedItem(null); setEditMode(false); }}
                    className="rounded-lg border border-slate-200 px-4 py-2 font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Kapat
                  </button>
                  <button
                    onClick={() => startEdit(selectedItem)}
                    className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700"
                  >
                    <Edit3 className="h-4 w-4" />
                    Düzenle
                  </button>
                  <Link
                    href={selectedItem.url}
                    target="_blank"
                    className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 font-semibold text-white hover:bg-primary/90"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Görüntüle
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
