"use client";

import { useState } from "react";
import { ArrowLeft, Upload, Image as ImageIcon, CheckCircle, XCircle, Loader2 } from "lucide-react";
import Link from "next/link";

export default function CountryCoverImagesPage() {
  const [loading, setLoading] = useState(false);
  const [limit, setLimit] = useState(10);
  const [overwrite, setOverwrite] = useState(false);
  const [results, setResults] = useState<any>(null);

  const handleUpload = async () => {
    if (!confirm(`${limit} ülke için Pexels'ten kapak fotoğrafı yüklenecek. Devam edilsin mi?`)) {
      return;
    }

    setLoading(true);
    setResults(null);

    try {
      const response = await fetch('/api/admin/countries/upload-cover-images', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          limit,
          overwrite
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Upload failed');
      }

      setResults(data);
    } catch (error: any) {
      alert(`Hata: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/ulkeler"
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-50"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Kapak Fotoğrafları</h1>
            <p className="text-sm text-slate-600">
              Pexels API ile otomatik ülke kapak fotoğrafı yükleme
            </p>
          </div>
        </div>
      </div>

      {/* Settings Card */}
      <div className="card space-y-6">
        <div className="flex items-center gap-3 border-b border-slate-200 pb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
            <ImageIcon className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h2 className="font-semibold text-slate-900">Yükleme Ayarları</h2>
            <p className="text-sm text-slate-600">
              Pexels'ten otomatik fotoğraf çekme ve yükleme
            </p>
          </div>
        </div>

        {/* Settings */}
        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              İşlenecek Ülke Sayısı
            </label>
            <input
              type="number"
              min="1"
              max="50"
              value={limit}
              onChange={(e) => setLimit(parseInt(e.target.value) || 10)}
              className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              disabled={loading}
            />
            <p className="mt-1 text-xs text-slate-500">
              Bir seferde maksimum 50 ülke işlenebilir
            </p>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="overwrite"
              checked={overwrite}
              onChange={(e) => setOverwrite(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-2 focus:ring-primary/20"
              disabled={loading}
            />
            <label htmlFor="overwrite" className="text-sm text-slate-700">
              Mevcut fotoğrafların üzerine yaz
            </label>
          </div>
        </div>

        {/* Info Box */}
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
          <h3 className="mb-2 font-medium text-blue-900">ℹ️ Nasıl Çalışır?</h3>
          <ul className="space-y-1 text-sm text-blue-800">
            <li>• Pexels API'den ülke adına göre fotoğraf aranır</li>
            <li>• En iyi eşleşen fotoğraf indirilir</li>
            <li>• Supabase Storage'a yüklenir</li>
            <li>• Ülke kaydı güncellenir</li>
            <li>• Fotoğraf bulunamazsa atlanır</li>
          </ul>
        </div>

        {/* Upload Button */}
        <button
          onClick={handleUpload}
          disabled={loading}
          className="btn-primary w-full disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Yükleniyor...</span>
            </>
          ) : (
            <>
              <Upload className="h-5 w-5" />
              <span>Fotoğrafları Yükle</span>
            </>
          )}
        </button>
      </div>

      {/* Results */}
      {results && (
        <div className="card space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-4">
            <h2 className="font-semibold text-slate-900">Sonuçlar</h2>
            <div className="flex items-center gap-4 text-sm">
              <span className="flex items-center gap-1 text-green-600">
                <CheckCircle className="h-4 w-4" />
                {results.success_count} Başarılı
              </span>
              <span className="flex items-center gap-1 text-red-600">
                <XCircle className="h-4 w-4" />
                {results.fail_count} Başarısız
              </span>
            </div>
          </div>

          {/* Results List */}
          <div className="max-h-96 space-y-2 overflow-y-auto">
            {results.results.map((result: any, index: number) => (
              <div
                key={index}
                className={`flex items-center justify-between rounded-lg border p-3 ${
                  result.success
                    ? 'border-green-200 bg-green-50'
                    : 'border-red-200 bg-red-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  {result.success ? (
                    <CheckCircle className="h-5 w-5 flex-shrink-0 text-green-600" />
                  ) : (
                    <XCircle className="h-5 w-5 flex-shrink-0 text-red-600" />
                  )}
                  <div>
                    <p className="font-medium text-slate-900">
                      {result.country_name}
                    </p>
                    {result.success ? (
                      <p className="text-xs text-slate-600">
                        Fotoğraf: {result.photographer}
                      </p>
                    ) : (
                      <p className="text-xs text-red-600">{result.error}</p>
                    )}
                  </div>
                </div>
                {result.success && result.image_url && (
                  <img
                    src={result.image_url}
                    alt={result.country_name}
                    className="h-12 w-20 rounded object-cover"
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
