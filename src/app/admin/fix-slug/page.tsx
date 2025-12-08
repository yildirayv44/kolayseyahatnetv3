"use client";

import { useState } from "react";
import { Link2, CheckCircle, XCircle, Loader2, ArrowRight } from "lucide-react";

export default function FixSlugPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleFix = async () => {
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch("/api/admin/fix-slug", {
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
        <h1 className="text-2xl font-bold text-slate-900">Slug Düzeltme</h1>
        <p className="mt-1 text-sm text-slate-600">
          Türkçe karakter sorunları nedeniyle yanlış oluşturulmuş slug'ları düzelt
        </p>
      </div>

      <div className="card">
        <div className="space-y-4">
          <div className="flex items-start gap-3 rounded-lg border border-blue-200 bg-blue-50 p-4">
            <Link2 className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-blue-900">Ne Yapılacak?</h3>
              <p className="mt-1 text-sm text-blue-700">
                Bu işlem, tüm ülkelerin slug'larını kontrol edecek ve yanlış olanları düzeltecek.
              </p>
              <div className="mt-3 space-y-1 text-sm">
                <div className="flex items-center gap-2 text-blue-700">
                  <span className="font-mono text-xs">❌ i-talya</span>
                  <ArrowRight className="h-3 w-3" />
                  <span className="font-mono text-xs">✅ italya</span>
                </div>
                <div className="flex items-center gap-2 text-blue-700">
                  <span className="font-mono text-xs">❌ i-spanya</span>
                  <ArrowRight className="h-3 w-3" />
                  <span className="font-mono text-xs">✅ ispanya</span>
                </div>
              </div>
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
                <Link2 className="h-4 w-4" />
                Slug'ları Düzelt
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
                <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                  <div className="text-sm font-semibold text-green-600">Düzeltildi</div>
                  <div className="mt-1 text-2xl font-bold text-green-900">{result.updated}</div>
                </div>
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <div className="text-sm font-semibold text-slate-600">Zaten Doğru</div>
                  <div className="mt-1 text-2xl font-bold text-slate-900">{result.unchanged}</div>
                </div>
                <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                  <div className="text-sm font-semibold text-red-600">Başarısız</div>
                  <div className="mt-1 text-2xl font-bold text-red-900">{result.failed}</div>
                </div>
              </div>

              {result.details?.updated?.length > 0 && (
                <div>
                  <h4 className="mb-2 font-semibold text-slate-900">
                    ✅ Düzeltilen Slug'lar ({result.details.updated.length})
                  </h4>
                  <div className="max-h-60 space-y-2 overflow-y-auto rounded-lg border border-slate-200 bg-slate-50 p-3">
                    {result.details.updated.map((item: any) => (
                      <div key={item.id} className="flex items-center justify-between rounded bg-white p-2 text-sm">
                        <span className="font-semibold text-slate-700">
                          {item.name} (ID: {item.id})
                        </span>
                        <div className="flex items-center gap-2 text-xs">
                          <span className="font-mono text-red-600 line-through">{item.oldSlug}</span>
                          <ArrowRight className="h-3 w-3 text-slate-400" />
                          <span className="font-mono text-green-600">{item.newSlug}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {result.details?.unchanged?.length > 0 && (
                <div>
                  <h4 className="mb-2 font-semibold text-slate-900">
                    ✓ Zaten Doğru Slug'lar ({result.details.unchanged.length})
                  </h4>
                  <div className="max-h-40 overflow-y-auto rounded-lg border border-slate-200 bg-slate-50 p-3">
                    <div className="flex flex-wrap gap-2">
                      {result.details.unchanged.map((item: any) => (
                        <span
                          key={item.id}
                          className="inline-flex items-center gap-1 rounded bg-white px-2 py-1 text-xs"
                        >
                          <span className="text-slate-700">{item.name}</span>
                          <span className="font-mono text-slate-500">/{item.slug}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {result.details?.failed?.length > 0 && (
                <div>
                  <h4 className="mb-2 font-semibold text-red-900">
                    ❌ Başarısız Slug'lar ({result.details.failed.length})
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
