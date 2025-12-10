"use client";

import { useState, useEffect } from "react";
import { 
  Search, 
  CheckCircle, 
  XCircle, 
  Loader2, 
  ExternalLink,
  RefreshCw,
  AlertTriangle,
  Globe,
  Database,
  Zap
} from "lucide-react";

interface SlugData {
  id: number;
  slug: string;
  type: string;
  model_id: number;
  content_name: string;
  status: number;
  url: string;
  is_indexed?: boolean;
  checking?: boolean;
}

export default function SlugManagerPage() {
  const [slugs, setSlugs] = useState<SlugData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [checkingAll, setCheckingAll] = useState(false);

  useEffect(() => {
    loadSlugs();
  }, []);

  const loadSlugs = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/slugs/list");
      const data = await response.json();
      setSlugs(data.slugs || []);
    } catch (error) {
      console.error("Error loading slugs:", error);
    } finally {
      setLoading(false);
    }
  };

  const checkGoogleIndex = async (slug: SlugData) => {
    setSlugs(prev => prev.map(s => 
      s.id === slug.id ? { ...s, checking: true } : s
    ));

    try {
      const response = await fetch("/api/admin/slugs/check-index", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: slug.url }),
      });
      const data = await response.json();
      
      setSlugs(prev => prev.map(s => 
        s.id === slug.id ? { ...s, is_indexed: data.indexed, checking: false } : s
      ));
    } catch (error) {
      setSlugs(prev => prev.map(s => 
        s.id === slug.id ? { ...s, checking: false } : s
      ));
    }
  };

  const checkAllIndexes = async () => {
    setCheckingAll(true);
    const filtered = getFilteredSlugs();
    
    for (const slug of filtered) {
      await checkGoogleIndex(slug);
      // Add delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    setCheckingAll(false);
  };

  const quickFix = async (slug: SlugData) => {
    try {
      const response = await fetch("/api/admin/slugs/quick-fix", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: slug.id, slug: slug.slug }),
      });
      const data = await response.json();
      
      if (data.success) {
        await loadSlugs();
      }
    } catch (error) {
      console.error("Error fixing slug:", error);
    }
  };

  const getFilteredSlugs = () => {
    return slugs.filter(slug => {
      const matchesSearch = slug.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           slug.content_name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = typeFilter === "all" || slug.type === typeFilter;
      const matchesStatus = statusFilter === "all" || 
                           (statusFilter === "active" && slug.status === 1) ||
                           (statusFilter === "inactive" && slug.status !== 1);
      
      return matchesSearch && matchesType && matchesStatus;
    });
  };

  const filteredSlugs = getFilteredSlugs();
  const types = [...new Set(slugs.map(s => s.type))];

  const stats = {
    total: slugs.length,
    active: slugs.filter(s => s.status === 1).length,
    inactive: slugs.filter(s => s.status !== 1).length,
    indexed: slugs.filter(s => s.is_indexed === true).length,
    notIndexed: slugs.filter(s => s.is_indexed === false).length,
    unchecked: slugs.filter(s => s.is_indexed === undefined).length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Slug Yöneticisi</h1>
        <p className="mt-1 text-sm text-slate-600">
          Tüm slug'ları görüntüle, Google indeksini kontrol et ve hızlıca düzelt
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-6">
        <div className="card">
          <div className="flex items-center gap-2">
            <Database className="h-4 w-4 text-slate-600" />
            <div className="text-xs font-semibold text-slate-600">Toplam</div>
          </div>
          <div className="mt-1 text-2xl font-bold text-slate-900">{stats.total}</div>
        </div>
        <div className="card">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <div className="text-xs font-semibold text-green-600">Aktif</div>
          </div>
          <div className="mt-1 text-2xl font-bold text-green-900">{stats.active}</div>
        </div>
        <div className="card">
          <div className="flex items-center gap-2">
            <XCircle className="h-4 w-4 text-red-600" />
            <div className="text-xs font-semibold text-red-600">Pasif</div>
          </div>
          <div className="mt-1 text-2xl font-bold text-red-900">{stats.inactive}</div>
        </div>
        <div className="card">
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-blue-600" />
            <div className="text-xs font-semibold text-blue-600">İndeksli</div>
          </div>
          <div className="mt-1 text-2xl font-bold text-blue-900">{stats.indexed}</div>
        </div>
        <div className="card">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-orange-600" />
            <div className="text-xs font-semibold text-orange-600">İndekssiz</div>
          </div>
          <div className="mt-1 text-2xl font-bold text-orange-900">{stats.notIndexed}</div>
        </div>
        <div className="card">
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-slate-600" />
            <div className="text-xs font-semibold text-slate-600">Kontrol Edilmedi</div>
          </div>
          <div className="mt-1 text-2xl font-bold text-slate-900">{stats.unchecked}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <label className="mb-1 block text-sm font-semibold text-slate-700">Ara</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Slug veya içerik adı..."
                className="w-full rounded-lg border border-slate-300 py-2 pl-10 pr-4 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          <div className="min-w-[180px]">
            <label className="mb-1 block text-sm font-semibold text-slate-700">Tip</label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full rounded-lg border border-slate-300 py-2 px-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="all">Tümü</option>
              {types.map(type => (
                <option key={type} value={type}>{type.split('\\').pop()}</option>
              ))}
            </select>
          </div>

          <div className="min-w-[150px]">
            <label className="mb-1 block text-sm font-semibold text-slate-700">Durum</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full rounded-lg border border-slate-300 py-2 px-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="all">Tümü</option>
              <option value="active">Aktif</option>
              <option value="inactive">Pasif</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={checkAllIndexes}
              disabled={checkingAll || filteredSlugs.length === 0}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {checkingAll ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Kontrol Ediliyor...
                </>
              ) : (
                <>
                  <Globe className="h-4 w-4" />
                  Tümünü Kontrol Et
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Slugs Table */}
      <div className="card overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">İçerik</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">Slug</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">Tip</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">Durum</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">Google İndeks</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredSlugs.map((slug) => (
                <tr key={slug.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <div className="text-sm font-semibold text-slate-900">{slug.content_name}</div>
                    <div className="text-xs text-slate-500">ID: {slug.model_id}</div>
                  </td>
                  <td className="px-4 py-3">
                    <code className="text-xs font-mono text-slate-700">{slug.slug}</code>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700">
                      {slug.type.split('\\').pop()?.replace('@', ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {slug.status === 1 ? (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-600">
                        <CheckCircle className="h-3 w-3" />
                        Aktif
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-600">
                        <XCircle className="h-3 w-3" />
                        Pasif
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {slug.checking ? (
                      <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
                    ) : slug.is_indexed === true ? (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600">
                        <Globe className="h-3 w-3" />
                        İndeksli
                      </span>
                    ) : slug.is_indexed === false ? (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-orange-600">
                        <AlertTriangle className="h-3 w-3" />
                        İndekssiz
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400">Kontrol edilmedi</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => checkGoogleIndex(slug)}
                        disabled={slug.checking}
                        className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-semibold text-blue-600 hover:bg-blue-50"
                        title="Google indeksini kontrol et"
                      >
                        <RefreshCw className="h-3 w-3" />
                      </button>
                      <a
                        href={slug.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-100"
                        title="Sayfayı aç"
                      >
                        <ExternalLink className="h-3 w-3" />
                      </a>
                      <button
                        onClick={() => quickFix(slug)}
                        className="inline-flex items-center gap-1 rounded bg-green-600 px-2 py-1 text-xs font-semibold text-white hover:bg-green-700"
                        title="Hızlı düzelt"
                      >
                        <Zap className="h-3 w-3" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredSlugs.length === 0 && (
          <div className="py-12 text-center">
            <Search className="mx-auto h-12 w-12 text-slate-300" />
            <p className="mt-2 text-sm text-slate-600">Sonuç bulunamadı</p>
          </div>
        )}
      </div>

      <div className="text-xs text-slate-500">
        Toplam {filteredSlugs.length} slug gösteriliyor
      </div>
    </div>
  );
}
