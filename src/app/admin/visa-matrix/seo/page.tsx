"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { 
  FileText, 
  RefreshCw, 
  CheckCircle,
  Clock,
  Sparkles,
  Eye,
  Edit
} from "lucide-react";

interface SEOPage {
  id: number;
  source_country_code: string;
  destination_country_code: string;
  locale: string;
  meta_title: string;
  content_status: string;
  generated_at: string;
  published_at: string | null;
}

interface SourceCountry {
  country_code: string;
  name: string;
  flag_emoji: string;
}

export default function VisaMatrixSEOPage() {
  const [seoPages, setSeoPages] = useState<SEOPage[]>([]);
  const [sourceCountries, setSourceCountries] = useState<SourceCountry[]>([]);
  const [selectedSource, setSelectedSource] = useState<string>('TUR');
  const [selectedLocale, setSelectedLocale] = useState<string>('tr');
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [generationStatus, setGenerationStatus] = useState<string>('');
  const [stats, setStats] = useState({
    total: 0,
    generated: 0,
    published: 0,
    pending: 0,
  });

  useEffect(() => {
    fetchSourceCountries();
  }, []);

  useEffect(() => {
    if (selectedSource && selectedLocale) {
      fetchSEOPages();
    }
  }, [selectedSource, selectedLocale]);

  const fetchSourceCountries = async () => {
    try {
      const { data, error } = await supabase
        .from('countries')
        .select('country_code, name, flag_emoji')
        .eq('is_source_country', true)
        .eq('status', 1)
        .order('name', { ascending: true });

      if (error) throw error;
      setSourceCountries(data || []);
    } catch (error: any) {
      console.error('Error fetching countries:', error);
    }
  };

  const fetchSEOPages = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('visa_pages_seo')
        .select('*')
        .eq('source_country_code', selectedSource)
        .eq('locale', selectedLocale)
        .order('destination_country_code', { ascending: true });

      if (error) throw error;
      setSeoPages(data || []);

      // Calculate stats
      const total = data?.length || 0;
      const generated = data?.filter(p => p.content_status === 'generated').length || 0;
      const published = data?.filter(p => p.content_status === 'published').length || 0;
      const pending = data?.filter(p => p.content_status === 'pending').length || 0;

      setStats({ total, generated, published, pending });
    } catch (error: any) {
      console.error('Error fetching SEO pages:', error);
      alert('SEO sayfaları yüklenirken hata oluştu: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBulkGenerate = async () => {
    if (!selectedSource || !selectedLocale) {
      alert('Lütfen kaynak ülke ve dil seçin');
      return;
    }

    if (!confirm(`${selectedSource} için ${selectedLocale} dilinde toplu SEO içerik üretmek istediğinizden emin misiniz?`)) {
      return;
    }

    setGenerating(true);
    setGenerationStatus('SEO içerik üretimi başlatılıyor...');

    try {
      const response = await fetch('/api/admin/visa-matrix/bulk-generate-seo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceCountryCode: selectedSource,
          locale: selectedLocale,
          limit: 100,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setGenerationStatus(`✅ Başarılı: ${data.generated} sayfa oluşturuldu, ${data.skipped} sayfa atlandı`);
        fetchSEOPages();
      } else {
        setGenerationStatus(`❌ Hata: ${data.error}`);
      }
    } catch (error: any) {
      console.error('Generation error:', error);
      setGenerationStatus(`❌ Hata: ${error.message}`);
    } finally {
      setGenerating(false);
    }
  };

  const handlePublish = async (pageId: number) => {
    try {
      const { error } = await supabase
        .from('visa_pages_seo')
        .update({
          content_status: 'published',
          published_at: new Date().toISOString(),
        })
        .eq('id', pageId);

      if (error) throw error;

      alert('Sayfa yayınlandı');
      fetchSEOPages();
    } catch (error: any) {
      console.error('Error publishing page:', error);
      alert('Yayınlama hatası: ' + error.message);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-800">
            <CheckCircle className="h-3 w-3" />
            Yayında
          </span>
        );
      case 'generated':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-800">
            <Clock className="h-3 w-3" />
            Oluşturuldu
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">
            <Clock className="h-3 w-3" />
            Bekliyor
          </span>
        );
      default:
        return status;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">SEO İçerik Yönetimi</h1>
          <p className="mt-1 text-sm text-gray-500">
            Vize sayfaları için SEO içeriklerini yönetin
          </p>
        </div>
        <button
          onClick={fetchSEOPages}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm ring-1 ring-gray-300 hover:bg-gray-50 disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Yenile
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-lg bg-white p-4 shadow-sm ring-1 ring-gray-200">
          <div className="text-sm font-medium text-gray-500">Toplam Sayfa</div>
          <div className="mt-1 text-2xl font-bold text-gray-900">{stats.total}</div>
        </div>
        <div className="rounded-lg bg-blue-50 p-4 shadow-sm ring-1 ring-blue-200">
          <div className="text-sm font-medium text-blue-700">Oluşturuldu</div>
          <div className="mt-1 text-2xl font-bold text-blue-900">{stats.generated}</div>
        </div>
        <div className="rounded-lg bg-green-50 p-4 shadow-sm ring-1 ring-green-200">
          <div className="text-sm font-medium text-green-700">Yayında</div>
          <div className="mt-1 text-2xl font-bold text-green-900">{stats.published}</div>
        </div>
        <div className="rounded-lg bg-gray-50 p-4 shadow-sm ring-1 ring-gray-200">
          <div className="text-sm font-medium text-gray-700">Bekliyor</div>
          <div className="mt-1 text-2xl font-bold text-gray-900">{stats.pending}</div>
        </div>
      </div>

      {/* Generation Section */}
      <div className="rounded-lg bg-white p-6 shadow-sm ring-1 ring-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Toplu SEO İçerik Üretimi</h2>
        
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Kaynak Ülke
            </label>
            <select
              value={selectedSource}
              onChange={(e) => setSelectedSource(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              {sourceCountries.map(country => (
                <option key={country.country_code} value={country.country_code}>
                  {country.flag_emoji} {country.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Dil
            </label>
            <select
              value={selectedLocale}
              onChange={(e) => setSelectedLocale(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="tr">🇹🇷 Türkçe</option>
              <option value="en">🇬🇧 English</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={handleBulkGenerate}
              disabled={generating}
              className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary/90 disabled:opacity-50"
            >
              <Sparkles className={`h-4 w-4 ${generating ? 'animate-pulse' : ''}`} />
              {generating ? 'Üretiliyor...' : 'Toplu Üret'}
            </button>
          </div>
        </div>

        {generationStatus && (
          <div className={`mt-4 rounded-lg p-4 ${
            generationStatus.includes('✅') ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
          }`}>
            {generationStatus}
          </div>
        )}
      </div>

      {/* SEO Pages List */}
      <div className="rounded-lg bg-white shadow-sm ring-1 ring-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">SEO Sayfaları</h2>
          <p className="text-sm text-gray-500 mt-1">
            {selectedSource} → Tüm Hedef Ülkeler ({selectedLocale})
          </p>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Hedef Ülke
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Başlık
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Durum
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Oluşturma
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  İşlem
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <RefreshCw className="mx-auto h-8 w-8 animate-spin text-gray-400" />
                    <p className="mt-2 text-sm text-gray-500">Yükleniyor...</p>
                  </td>
                </tr>
              ) : seoPages.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <FileText className="mx-auto h-12 w-12 text-gray-300" />
                    <p className="mt-2 text-sm text-gray-500">SEO sayfası bulunamadı</p>
                    <p className="text-xs text-gray-400 mt-1">Toplu üretim ile sayfalar oluşturabilirsiniz</p>
                  </td>
                </tr>
              ) : (
                seoPages.map((page) => (
                  <tr key={page.id} className="hover:bg-gray-50">
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                      {page.destination_country_code}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700 max-w-md truncate">
                      {page.meta_title}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      {getStatusBadge(page.content_status)}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      {page.generated_at ? new Date(page.generated_at).toLocaleDateString('tr-TR') : '-'}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm">
                      <div className="flex items-center gap-2">
                        {page.content_status === 'generated' && (
                          <button
                            onClick={() => handlePublish(page.id)}
                            className="text-green-600 hover:text-green-800 font-medium"
                          >
                            Yayınla
                          </button>
                        )}
                        <a
                          href={`/vize-sorgulama/${selectedSource.toLowerCase()}-${page.destination_country_code.toLowerCase()}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:text-primary/80 font-medium inline-flex items-center gap-1"
                        >
                          <Eye className="h-4 w-4" />
                          Görüntüle
                        </a>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
