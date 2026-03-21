'use client';

import { useState, useEffect } from 'react';
import { Loader2, Eye, Edit, Trash2, Sparkles, RefreshCw } from 'lucide-react';
import Link from 'next/link';

interface BilateralVisaPage {
  id: number;
  slug: string;
  source_country_code: string;
  destination_country_code: string;
  locale: string;
  meta_title: string;
  content_status: string;
  view_count: number;
  source_country?: { name: string; flag_emoji: string };
  destination_country?: { name: string; flag_emoji: string };
}

export function BilateralVisaPagesManager() {
  const [pages, setPages] = useState<BilateralVisaPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  const fetchPages = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/visa-pages');
      const data = await response.json();
      if (data.success) setPages(data.data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPages();
  }, []);

  const generatePage = async () => {
    const source = prompt('Kaynak ülke kodu (örn: TUR):');
    const dest = prompt('Hedef ülke kodu (örn: USA):');
    const locale = prompt('Dil (tr/en):', 'tr');
    
    if (!source || !dest || !locale) return;
    
    setGenerating(true);
    try {
      const response = await fetch('/api/admin/visa-pages/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ source_country_code: source, destination_country_code: dest, locale })
      });
      const data = await response.json();
      if (data.success) {
        alert('Sayfa oluşturuldu!');
        fetchPages();
      } else {
        alert('Hata: ' + data.error);
      }
    } catch (error) {
      alert('Hata oluştu');
    } finally {
      setGenerating(false);
    }
  };

  const deletePage = async (id: number) => {
    if (!confirm('Silmek istediğinizden emin misiniz?')) return;
    try {
      const response = await fetch(`/api/admin/visa-pages/${id}`, { method: 'DELETE' });
      const data = await response.json();
      if (data.success) {
        alert('Silindi');
        fetchPages();
      }
    } catch (error) {
      alert('Hata oluştu');
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">İki Yönlü Vize Sayfaları</h1>
        <div className="flex gap-2">
          <button onClick={fetchPages} className="px-4 py-2 border rounded hover:bg-gray-50">
            <RefreshCw className="h-4 w-4" />
          </button>
          <button 
            onClick={generatePage} 
            disabled={generating}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
          >
            {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            AI ile Oluştur
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium">Kaynak → Hedef</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Slug</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Dil</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Durum</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Görüntülenme</th>
                <th className="px-4 py-3 text-right text-sm font-medium">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {pages.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-gray-500">
                    Henüz sayfa oluşturulmamış
                  </td>
                </tr>
              ) : (
                pages.map((page) => (
                  <tr key={page.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 text-sm">
                        <span>{page.source_country?.flag_emoji || '🌍'}</span>
                        <span className="font-medium">{page.source_country?.name || page.source_country_code}</span>
                        <span className="text-gray-400">→</span>
                        <span>{page.destination_country?.flag_emoji || '🌍'}</span>
                        <span className="font-medium">{page.destination_country?.name || page.destination_country_code}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <code className="text-xs bg-gray-100 px-2 py-1 rounded">{page.slug}</code>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs px-2 py-1 bg-gray-100 rounded">{page.locale.toUpperCase()}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded ${
                        page.content_status === 'published' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {page.content_status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">{page.view_count || 0}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/${page.slug}`} target="_blank" className="p-1 hover:bg-gray-100 rounded">
                          <Eye className="h-4 w-4" />
                        </Link>
                        <Link href={`/admin/ulkeler/vize-sayfalari/${page.id}`} className="p-1 hover:bg-gray-100 rounded">
                          <Edit className="h-4 w-4" />
                        </Link>
                        <button onClick={() => deletePage(page.id)} className="p-1 hover:bg-gray-100 rounded">
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {pages.length > 0 && (
        <div className="mt-4 text-sm text-gray-600">
          Toplam {pages.length} sayfa • Toplam görüntülenme: {pages.reduce((sum, p) => sum + (p.view_count || 0), 0)}
        </div>
      )}
    </div>
  );
}
