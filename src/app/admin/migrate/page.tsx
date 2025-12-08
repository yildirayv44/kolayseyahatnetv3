'use client';

import { useState } from 'react';
import { Database, CheckCircle2, XCircle, Loader2 } from 'lucide-react';

export default function MigratePage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const runMigration = async () => {
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/admin/migrate', {
        method: 'POST',
      });

      const data = await response.json();
      setResult(data);
    } catch (error: any) {
      setResult({
        success: false,
        error: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <div className="mb-4 flex items-center gap-3">
            <Database className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold text-slate-900">Database Migration</h1>
          </div>
          <p className="text-slate-600">
            Add extended fields to countries table for AI-generated content
          </p>
        </div>

        {/* Migration Info */}
        <div className="mb-6 rounded-lg bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-bold text-slate-900">Eklenecek Kolonlar</h2>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="rounded-lg border border-slate-200 p-3">
              <h3 className="mb-2 font-semibold text-slate-900">SEO</h3>
              <ul className="space-y-1 text-sm text-slate-600">
                <li>• meta_description</li>
              </ul>
            </div>
            <div className="rounded-lg border border-slate-200 p-3">
              <h3 className="mb-2 font-semibold text-slate-900">Vize Detayları</h3>
              <ul className="space-y-1 text-sm text-slate-600">
                <li>• visa_type</li>
                <li>• max_stay_duration</li>
                <li>• visa_fee</li>
                <li>• processing_time</li>
              </ul>
            </div>
            <div className="rounded-lg border border-slate-200 p-3">
              <h3 className="mb-2 font-semibold text-slate-900">Listeler (JSONB)</h3>
              <ul className="space-y-1 text-sm text-slate-600">
                <li>• application_steps</li>
                <li>• required_documents</li>
                <li>• important_notes</li>
                <li>• travel_tips</li>
                <li>• popular_cities</li>
              </ul>
            </div>
            <div className="rounded-lg border border-slate-200 p-3">
              <h3 className="mb-2 font-semibold text-slate-900">Ek Bilgiler</h3>
              <ul className="space-y-1 text-sm text-slate-600">
                <li>• best_time_to_visit</li>
                <li>• health_requirements</li>
                <li>• customs_regulations</li>
                <li>• why_kolay_seyahat</li>
                <li>• emergency_contacts (JSONB)</li>
              </ul>
            </div>
            <div className="rounded-lg border border-slate-200 p-3">
              <h3 className="mb-2 font-semibold text-slate-900">Ülke Bilgileri</h3>
              <ul className="space-y-1 text-sm text-slate-600">
                <li>• capital</li>
                <li>• currency</li>
                <li>• language</li>
                <li>• timezone</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Run Migration Button */}
        <div className="mb-6 text-center">
          <button
            onClick={runMigration}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 font-semibold text-white transition-colors hover:bg-primary/90 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Migration Çalıştırılıyor...
              </>
            ) : (
              <>
                <Database className="h-5 w-5" />
                Migration'ı Çalıştır
              </>
            )}
          </button>
        </div>

        {/* Result */}
        {result && (
          <div
            className={`rounded-lg border-2 p-6 ${
              result.success
                ? 'border-green-500 bg-green-50'
                : 'border-red-500 bg-red-50'
            }`}
          >
            <div className="mb-4 flex items-center gap-3">
              {result.success ? (
                <>
                  <CheckCircle2 className="h-6 w-6 text-green-600" />
                  <h3 className="text-lg font-bold text-green-900">Migration Başarılı!</h3>
                </>
              ) : (
                <>
                  <XCircle className="h-6 w-6 text-red-600" />
                  <h3 className="text-lg font-bold text-red-900">Migration Başarısız</h3>
                </>
              )}
            </div>

            {result.message && (
              <p className={`mb-4 ${result.success ? 'text-green-800' : 'text-red-800'}`}>
                {result.message}
              </p>
            )}

            {result.columnsAdded && (
              <div className="mb-4">
                <h4 className="mb-2 font-semibold text-green-900">Eklenen Kolonlar:</h4>
                <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
                  {result.columnsAdded.map((col: string) => (
                    <div
                      key={col}
                      className="rounded bg-green-100 px-2 py-1 text-sm text-green-800"
                    >
                      ✓ {col}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {result.error && (
              <div className="mb-4">
                <h4 className="mb-2 font-semibold text-red-900">Hata:</h4>
                <pre className="overflow-x-auto rounded bg-red-100 p-3 text-sm text-red-800">
                  {result.error}
                </pre>
              </div>
            )}

            {result.sql && (
              <div>
                <h4 className="mb-2 font-semibold text-yellow-900">
                  Manuel Çalıştırma Gerekli:
                </h4>
                <p className="mb-2 text-sm text-yellow-800">
                  Supabase Dashboard → SQL Editor'da aşağıdaki SQL'i çalıştırın:
                </p>
                <pre className="overflow-x-auto rounded bg-yellow-100 p-3 text-xs text-yellow-900">
                  {result.sql}
                </pre>
              </div>
            )}

            {result.hint && (
              <p className="mt-4 text-sm italic text-slate-600">{result.hint}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
