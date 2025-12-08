"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, RefreshCw, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import Link from "next/link";
import { getCountryCode } from "@/lib/country-codes";

interface Country {
  id: number;
  name: string;
  country_code: string | null;
}

interface UpdateResult {
  id: number;
  name: string;
  oldCode: string | null;
  newCode: string | null;
  status: 'pending' | 'success' | 'error' | 'skipped';
  message?: string;
}

export default function BulkCountryCodeAssignmentPage() {
  const [countries, setCountries] = useState<Country[]>([]);
  const [results, setResults] = useState<UpdateResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [step, setStep] = useState<'prepare' | 'preview' | 'processing' | 'complete'>('prepare');

  useEffect(() => {
    fetchCountries();
  }, []);

  const fetchCountries = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/countries');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch countries');
      }
      
      setCountries(data.countries || []);
      
      // Prepare preview
      const preview = (data.countries || []).map((c: Country) => ({
        id: c.id,
        name: c.name,
        oldCode: c.country_code,
        newCode: getCountryCode(c.name),
        status: c.country_code ? 'skipped' : 'pending' as const,
        message: c.country_code ? 'Kod zaten var' : undefined
      }));
      setResults(preview);
      setStep('preview');
    } catch (error: any) {
      console.error('Failed to fetch countries:', error);
      alert('Ülkeler yüklenirken hata oluştu: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const startBulkUpdate = async () => {
    setProcessing(true);
    setStep('processing');

    const countriesToUpdate = results.filter(r => r.status === 'pending' && r.newCode);

    for (let i = 0; i < countriesToUpdate.length; i++) {
      const country = countriesToUpdate[i];
      
      try {
        const response = await fetch(`/api/admin/countries/${country.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ country_code: country.newCode }),
        });

        if (response.ok) {
          setResults(prev => prev.map(r => 
            r.id === country.id 
              ? { ...r, status: 'success', message: 'Başarıyla güncellendi' }
              : r
          ));
        } else {
          throw new Error('Update failed');
        }
      } catch (error) {
        setResults(prev => prev.map(r => 
          r.id === country.id 
            ? { ...r, status: 'error', message: 'Güncelleme hatası' }
            : r
        ));
      }

      // Small delay to avoid overwhelming the server
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    setProcessing(false);
    setStep('complete');
  };

  const stats = {
    total: results.length,
    pending: results.filter(r => r.status === 'pending').length,
    success: results.filter(r => r.status === 'success').length,
    error: results.filter(r => r.status === 'error').length,
    skipped: results.filter(r => r.status === 'skipped').length,
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <RefreshCw className="mx-auto h-8 w-8 animate-spin text-primary" />
          <p className="mt-4 text-slate-600">Ülkeler yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/admin/ulkeler"
            className="mb-2 inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Ülkelere Dön
          </Link>
          <h2 className="text-2xl font-bold text-slate-900">Toplu Ülke Kodu Ataması</h2>
          <p className="text-sm text-slate-600">
            Ülke adlarına göre otomatik ISO 3166-1 alpha-3 kod ataması
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-5">
        <div className="card">
          <p className="text-sm text-slate-600">Toplam</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{stats.total}</p>
        </div>
        <div className="card">
          <p className="text-sm text-slate-600">Güncellenecek</p>
          <p className="mt-2 text-3xl font-bold text-blue-600">{stats.pending}</p>
        </div>
        <div className="card">
          <p className="text-sm text-slate-600">Başarılı</p>
          <p className="mt-2 text-3xl font-bold text-green-600">{stats.success}</p>
        </div>
        <div className="card">
          <p className="text-sm text-slate-600">Hata</p>
          <p className="mt-2 text-3xl font-bold text-red-600">{stats.error}</p>
        </div>
        <div className="card">
          <p className="text-sm text-slate-600">Atlandı</p>
          <p className="mt-2 text-3xl font-bold text-slate-600">{stats.skipped}</p>
        </div>
      </div>

      {/* Action Button */}
      {step === 'preview' && stats.pending > 0 && (
        <div className="card border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-blue-50">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-slate-900">
                {stats.pending} ülkeye kod atanacak
              </h3>
              <p className="text-sm text-slate-600">
                Otomatik eşleştirme yapılacak. Devam etmek istiyor musunuz?
              </p>
            </div>
            <button
              onClick={startBulkUpdate}
              disabled={processing}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 font-semibold text-white shadow-lg transition-all hover:bg-primary/90 disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${processing ? 'animate-spin' : ''}`} />
              Toplu Güncellemeyi Başlat
            </button>
          </div>
        </div>
      )}

      {step === 'complete' && (
        <div className="card border-2 border-green-200 bg-green-50">
          <div className="flex items-start gap-3">
            <CheckCircle className="h-6 w-6 flex-shrink-0 text-green-600" />
            <div>
              <h3 className="font-semibold text-green-900">Güncelleme Tamamlandı!</h3>
              <p className="text-sm text-green-700">
                {stats.success} ülke başarıyla güncellendi.
                {stats.error > 0 && ` ${stats.error} ülkede hata oluştu.`}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Results Table */}
      <div className="card overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr className="border-b border-slate-200 text-left text-sm text-slate-600">
                <th className="px-6 py-4 font-semibold">ID</th>
                <th className="px-6 py-4 font-semibold">Ülke Adı</th>
                <th className="px-6 py-4 font-semibold">Mevcut Kod</th>
                <th className="px-6 py-4 font-semibold">Yeni Kod</th>
                <th className="px-6 py-4 font-semibold">Durum</th>
                <th className="px-6 py-4 font-semibold">Mesaj</th>
              </tr>
            </thead>
            <tbody>
              {results.map((result) => (
                <tr key={result.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="px-6 py-4 text-sm text-slate-600">{result.id}</td>
                  <td className="px-6 py-4 text-sm font-medium text-slate-900">{result.name}</td>
                  <td className="px-6 py-4">
                    {result.oldCode ? (
                      <span className="font-mono text-xs font-semibold text-slate-700">
                        {result.oldCode}
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {result.newCode ? (
                      <span className="font-mono text-xs font-semibold text-green-700">
                        {result.newCode}
                      </span>
                    ) : (
                      <span className="text-xs text-red-600">Bulunamadı</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {result.status === 'pending' && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-700">
                        <AlertCircle className="h-3 w-3" />
                        Bekliyor
                      </span>
                    )}
                    {result.status === 'success' && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-1 text-xs font-semibold text-green-700">
                        <CheckCircle className="h-3 w-3" />
                        Başarılı
                      </span>
                    )}
                    {result.status === 'error' && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-1 text-xs font-semibold text-red-700">
                        <XCircle className="h-3 w-3" />
                        Hata
                      </span>
                    )}
                    {result.status === 'skipped' && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600">
                        Atlandı
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-600">
                    {result.message || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
