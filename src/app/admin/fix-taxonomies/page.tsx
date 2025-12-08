"use client";

import { useState } from "react";
import { Wrench, CheckCircle, XCircle, Loader2 } from "lucide-react";

export default function FixTaxonomiesPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleFix = async () => {
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch("/api/admin/fix-taxonomies", {
        method: "POST",
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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Taxonomy Düzeltme</h1>
        <p className="mt-1 text-sm text-slate-600">
          Taxonomy kaydı olmayan ülkeler için otomatik slug oluştur
        </p>
      </div>

      <div className="card">
        <div className="space-y-4">
          <div className="flex items-start gap-3 rounded-lg border border-yellow-200 bg-yellow-50 p-4">
            <Wrench className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-yellow-900">Ne Yapılacak?</h3>
              <p className="mt-1 text-sm text-yellow-700">
                Bu işlem, taxonomy kaydı olmayan tüm ülkeler için otomatik olarak slug oluşturacak.
                Örnek: "Almanya" → "almanya"
              </p>
            </div>
          </div>

          <button
            onClick={handleFix}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-white hover:bg-primary/90 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Düzeltiliyor...
              </>
            ) : (
              <>
                <Wrench className="h-4 w-4" />
                Taxonomies'i Düzelt
              </>
            )}
          </button>
        </div>
      </div>

      {result && (
        <div className="card">
          {result.success ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <h3 className="font-semibold text-green-900">Başarılı!</h3>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <div className="text-sm font-semibold text-slate-600">Toplam Ülke</div>
                  <div className="mt-1 text-2xl font-bold text-slate-900">{result.total}</div>
                </div>
                <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                  <div className="text-sm font-semibold text-green-600">Düzeltildi</div>
                  <div className="mt-1 text-2xl font-bold text-green-900">{result.fixed}</div>
                </div>
                <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                  <div className="text-sm font-semibold text-red-600">Başarısız</div>
                  <div className="mt-1 text-2xl font-bold text-red-900">{result.failed}</div>
                </div>
              </div>

              {result.details?.success?.length > 0 && (
                <div>
                  <h4 className="mb-2 font-semibold text-slate-900">
                    ✅ Düzeltilen Ülkeler ({result.details.success.length})
                  </h4>
                  <div className="max-h-60 space-y-1 overflow-y-auto rounded-lg border border-slate-200 bg-slate-50 p-3">
                    {result.details.success.map((item: any) => (
                      <div key={item.id} className="flex items-center justify-between text-sm">
                        <span className="text-slate-700">
                          {item.name} (ID: {item.id})
                        </span>
                        <span className="font-mono text-xs text-slate-500">/{item.slug}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {result.details?.failed?.length > 0 && (
                <div>
                  <h4 className="mb-2 font-semibold text-red-900">
                    ❌ Başarısız Ülkeler ({result.details.failed.length})
                  </h4>
                  <div className="max-h-60 space-y-1 overflow-y-auto rounded-lg border border-red-200 bg-red-50 p-3">
                    {result.details.failed.map((item: any) => (
                      <div key={item.id} className="text-sm">
                        <div className="font-semibold text-red-900">
                          {item.name} (ID: {item.id})
                        </div>
                        <div className="text-xs text-red-600">{item.error}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4">
              <XCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-red-900">Hata!</h3>
                <p className="mt-1 text-sm text-red-700">{result.error}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
