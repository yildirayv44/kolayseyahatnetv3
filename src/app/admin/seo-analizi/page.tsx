"use client";

import { useEffect, useState } from "react";
import { Search, Filter, TrendingUp, TrendingDown, AlertCircle, CheckCircle, ExternalLink, RefreshCw } from "lucide-react";
import Link from "next/link";

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
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("score_desc");
  const [selectedItem, setSelectedItem] = useState<SEOScore | null>(null);

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
  }, [typeFilter, statusFilter, sortBy]);

  const filteredResults = results.filter((item) =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
                    YAYIM
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-slate-600">
                    SKOR
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-slate-600">
                    SEO DURUM
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-slate-600">
                    META
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-slate-600">
                    İÇERİK
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600">
                    İŞLEMLER
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredResults.map((item) => (
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
                      <span className={`inline-block rounded-full px-2 py-1 text-xs font-semibold ${
                        item.publish_status === 'published'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-orange-100 text-orange-700'
                      }`}>
                        {item.publish_status === 'published' ? '✓ Yayında' : '○ Taslak'}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <div className={`text-2xl font-bold ${getScoreColor(item.score)}`}>
                        {item.score}
                      </div>
                      <div className="text-xs text-slate-500">/100</div>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className={`inline-block rounded-lg border px-3 py-1 text-xs font-semibold ${getStatusColor(item.status)}`}>
                        {getStatusText(item.status)}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <div className="space-y-1 text-xs">
                        <div className={item.has_meta_title ? 'text-green-600' : 'text-red-600'}>
                          {item.has_meta_title ? '✓' : '✗'} Title: {item.meta_title_length}
                        </div>
                        <div className={item.has_meta_description ? 'text-green-600' : 'text-red-600'}>
                          {item.has_meta_description ? '✓' : '✗'} Desc: {item.meta_description_length}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <div className={`text-sm font-semibold ${item.content_word_count >= 1000 ? 'text-green-600' : item.content_word_count >= 300 ? 'text-yellow-600' : 'text-red-600'}`}>
                        {item.content_word_count} kelime
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedItem(item)}
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
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setSelectedItem(null)}
        >
          <div
            className="w-full max-w-2xl rounded-xl bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-start justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900">{selectedItem.title}</h2>
                <p className="text-sm text-slate-600">{selectedItem.url}</p>
              </div>
              <button
                onClick={() => setSelectedItem(null)}
                className="rounded-lg p-2 hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            {/* Score */}
            <div className="mb-6 rounded-lg bg-gradient-to-r from-purple-50 to-blue-50 p-6 text-center">
              <div className={`text-5xl font-bold ${getScoreColor(selectedItem.score)}`}>
                {selectedItem.score}/100
              </div>
              <div className={`mt-2 inline-block rounded-lg border px-4 py-2 text-sm font-semibold ${getStatusColor(selectedItem.status)}`}>
                {getStatusText(selectedItem.status)}
              </div>
            </div>

            {/* Metrics */}
            <div className="mb-6 grid gap-4 sm:grid-cols-3">
              <div className="rounded-lg border border-slate-200 p-4">
                <div className="text-xs text-slate-600">Meta Title</div>
                <div className={`text-lg font-bold ${selectedItem.meta_title_length >= 30 && selectedItem.meta_title_length <= 60 ? 'text-green-600' : 'text-yellow-600'}`}>
                  {selectedItem.meta_title_length} karakter
                </div>
                <div className="text-xs text-slate-500">İdeal: 50-60</div>
              </div>
              <div className="rounded-lg border border-slate-200 p-4">
                <div className="text-xs text-slate-600">Meta Description</div>
                <div className={`text-lg font-bold ${selectedItem.meta_description_length >= 100 && selectedItem.meta_description_length <= 160 ? 'text-green-600' : 'text-yellow-600'}`}>
                  {selectedItem.meta_description_length} karakter
                </div>
                <div className="text-xs text-slate-500">İdeal: 150-160</div>
              </div>
              <div className="rounded-lg border border-slate-200 p-4">
                <div className="text-xs text-slate-600">İçerik</div>
                <div className={`text-lg font-bold ${selectedItem.content_word_count >= 1000 ? 'text-green-600' : selectedItem.content_word_count >= 300 ? 'text-yellow-600' : 'text-red-600'}`}>
                  {selectedItem.content_word_count} kelime
                </div>
                <div className="text-xs text-slate-500">İdeal: 1000+</div>
              </div>
            </div>

            {/* Issues */}
            {selectedItem.issues.length > 0 && (
              <div className="mb-6">
                <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-900">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  Sorunlar ({selectedItem.issues.length})
                </h3>
                <div className="space-y-2">
                  {selectedItem.issues.map((issue, idx) => (
                    <div key={idx} className="flex items-start gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">
                      <span className="text-red-600">•</span>
                      <span>{issue}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Suggestions */}
            {selectedItem.suggestions.length > 0 && (
              <div className="mb-6">
                <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-900">
                  <CheckCircle className="h-4 w-4 text-blue-600" />
                  Öneriler ({selectedItem.suggestions.length})
                </h3>
                <div className="space-y-2">
                  {selectedItem.suggestions.map((suggestion, idx) => (
                    <div key={idx} className="flex items-start gap-2 rounded-lg bg-blue-50 p-3 text-sm text-blue-700">
                      <span className="text-blue-600">💡</span>
                      <span>{suggestion}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setSelectedItem(null)}
                className="rounded-lg border border-slate-200 px-4 py-2 font-semibold text-slate-700 hover:bg-slate-50"
              >
                Kapat
              </button>
              <Link
                href={selectedItem.url}
                target="_blank"
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 font-semibold text-white hover:bg-primary/90"
              >
                <ExternalLink className="h-4 w-4" />
                Sayfayı Görüntüle
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
