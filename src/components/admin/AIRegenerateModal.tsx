"use client";

import { useState } from "react";
import { X, Sparkles, Loader2, CheckCircle2 } from "lucide-react";

interface AIRegenerateModalProps {
  countryId: number;
  countryName: string;
  sourceUrls?: string[];
  onClose: () => void;
  onSuccess: () => void;
}

const AVAILABLE_FIELDS = [
  // İçerik
  { id: "contents", label: "Ana İçerik (Genel Bilgiler)", category: "content" },
  { id: "description", label: "Kısa Açıklama", category: "content" },
  { id: "why_kolay_seyahat", label: "Neden Kolay Seyahat", category: "content" },
  { id: "req_document", label: "Gerekli Belgeler (HTML)", category: "content" },
  { id: "price_contents", label: "Fiyat İçeriği (HTML)", category: "content" },
  // SEO
  { id: "meta_title", label: "Meta Title (SEO)", category: "seo" },
  { id: "meta_description", label: "Meta Description (SEO)", category: "seo" },
  // Vize Bilgileri
  { id: "visa_fee", label: "Vize Ücreti", category: "visa" },
  { id: "max_stay_duration", label: "Maksimum Kalış Süresi", category: "visa" },
  { id: "processing_time", label: "İşlem Süresi", category: "visa" },
  { id: "application_steps", label: "Başvuru Adımları", category: "visa" },
  { id: "required_documents", label: "Gerekli Belgeler (Liste)", category: "visa" },
  { id: "important_notes", label: "Önemli Notlar", category: "visa" },
  // Seyahat Bilgileri
  { id: "travel_tips", label: "Seyahat İpuçları", category: "travel" },
  { id: "popular_cities", label: "Popüler Şehirler", category: "travel" },
  { id: "best_time_to_visit", label: "En İyi Ziyaret Zamanı", category: "travel" },
  { id: "health_requirements", label: "Sağlık Gereksinimleri", category: "travel" },
  { id: "customs_regulations", label: "Gümrük Kuralları", category: "travel" },
  { id: "emergency_contacts", label: "Acil Durum Bilgileri", category: "travel" },
  // Ülke Bilgileri
  { id: "capital", label: "Başkent", category: "info" },
  { id: "currency", label: "Para Birimi", category: "info" },
  { id: "language", label: "Dil", category: "info" },
  { id: "timezone", label: "Saat Dilimi", category: "info" },
];

export function AIRegenerateModal({ countryId, countryName, sourceUrls = [], onClose, onSuccess }: AIRegenerateModalProps) {
  const [selectedFields, setSelectedFields] = useState<string[]>([]);
  const [aiProvider, setAiProvider] = useState<'openai' | 'gemini'>('openai');
  const [useSourceUrls, setUseSourceUrls] = useState(sourceUrls.length > 0);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  
  const validSourceUrls = sourceUrls.filter(url => url && url.trim());

  const toggleField = (fieldId: string) => {
    setSelectedFields(prev =>
      prev.includes(fieldId)
        ? prev.filter(id => id !== fieldId)
        : [...prev, fieldId]
    );
  };

  const selectAll = () => {
    setSelectedFields(AVAILABLE_FIELDS.map(f => f.id));
  };

  const deselectAll = () => {
    setSelectedFields([]);
  };

  const handleRegenerate = async () => {
    if (selectedFields.length === 0) {
      alert("Lütfen en az bir alan seçin");
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const response = await fetch("/api/admin/countries/regenerate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          countryId,
          fields: selectedFields,
          aiProvider,
          sourceUrls: useSourceUrls ? validSourceUrls : [],
        }),
      });

      const data = await response.json();

      if (data.success) {
        setResult({ success: true, message: data.message });
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 2000);
      } else {
        setResult({ success: false, error: data.error });
      }
    } catch (error: any) {
      setResult({ success: false, error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const categories = {
    content: "İçerik",
    seo: "SEO",
    visa: "Vize Bilgileri",
    travel: "Seyahat Bilgileri",
    info: "Ülke Bilgileri",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-3xl rounded-xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-blue-500">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">AI ile İçerik Yenile</h2>
              <p className="text-sm text-slate-600">{countryName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="max-h-[70vh] overflow-y-auto p-6">
          {/* AI Provider Selection */}
          <div className="mb-6">
            <label className="mb-2 block text-sm font-semibold text-slate-900">
              AI Modeli Seç
            </label>
            <div className="flex gap-3">
              <button
                onClick={() => setAiProvider('openai')}
                className={`flex-1 rounded-lg border-2 p-3 text-sm font-medium transition-all ${
                  aiProvider === 'openai'
                    ? 'border-primary bg-primary/5 text-primary'
                    : 'border-slate-200 text-slate-700 hover:border-slate-300'
                }`}
              >
                OpenAI GPT-4o Mini
              </button>
              <button
                onClick={() => setAiProvider('gemini')}
                className={`flex-1 rounded-lg border-2 p-3 text-sm font-medium transition-all ${
                  aiProvider === 'gemini'
                    ? 'border-primary bg-primary/5 text-primary'
                    : 'border-slate-200 text-slate-700 hover:border-slate-300'
                }`}
              >
                Google Gemini 1.5 Flash
              </button>
            </div>
          </div>

          {/* Source URLs Option */}
          {validSourceUrls.length > 0 && (
            <div className="mb-6 rounded-lg border-2 border-purple-200 bg-purple-50 p-4">
              <label className="flex cursor-pointer items-center gap-3">
                <input
                  type="checkbox"
                  checked={useSourceUrls}
                  onChange={(e) => setUseSourceUrls(e.target.checked)}
                  className="h-5 w-5 rounded border-purple-300 text-purple-600 focus:ring-2 focus:ring-purple-500/20"
                />
                <div>
                  <span className="font-semibold text-purple-900">🔗 Kaynak URL'leri Kullan</span>
                  <p className="text-sm text-purple-700">
                    AI, içerik oluştururken aşağıdaki resmi kaynak sayfalarını baz alacak:
                  </p>
                </div>
              </label>
              {useSourceUrls && (
                <ul className="mt-3 space-y-1 pl-8">
                  {validSourceUrls.map((url, index) => (
                    <li key={index} className="text-xs text-purple-600 truncate">
                      • {url}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* Field Selection */}
          <div className="mb-4 flex items-center justify-between">
            <label className="text-sm font-semibold text-slate-900">
              Yenilenecek Alanları Seç ({selectedFields.length} seçili)
            </label>
            <div className="flex gap-2">
              <button
                onClick={selectAll}
                className="text-xs font-medium text-primary hover:underline"
              >
                Tümünü Seç
              </button>
              <span className="text-slate-300">|</span>
              <button
                onClick={deselectAll}
                className="text-xs font-medium text-slate-600 hover:underline"
              >
                Temizle
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {Object.entries(categories).map(([categoryKey, categoryLabel]) => {
              const categoryFields = AVAILABLE_FIELDS.filter(f => f.category === categoryKey);
              if (categoryFields.length === 0) return null;

              return (
                <div key={categoryKey} className="rounded-lg border border-slate-200 p-4">
                  <h3 className="mb-3 text-sm font-semibold text-slate-700">{categoryLabel}</h3>
                  <div className="grid gap-2 md:grid-cols-2">
                    {categoryFields.map(field => (
                      <label
                        key={field.id}
                        className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 p-3 transition-all hover:border-primary hover:bg-primary/5"
                      >
                        <input
                          type="checkbox"
                          checked={selectedFields.includes(field.id)}
                          onChange={() => toggleField(field.id)}
                          className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-2 focus:ring-primary/20"
                        />
                        <span className="text-sm text-slate-700">{field.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Result */}
          {result && (
            <div className={`mt-4 rounded-lg border-2 p-4 ${
              result.success
                ? 'border-green-200 bg-green-50'
                : 'border-red-200 bg-red-50'
            }`}>
              <div className="flex items-center gap-2">
                {result.success ? (
                  <>
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    <span className="font-semibold text-green-900">{result.message}</span>
                  </>
                ) : (
                  <>
                    <X className="h-5 w-5 text-red-600" />
                    <span className="font-semibold text-red-900">{result.error}</span>
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-slate-200 p-6">
          <button
            onClick={onClose}
            disabled={loading}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            İptal
          </button>
          <button
            onClick={handleRegenerate}
            disabled={loading || selectedFields.length === 0}
            className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-2 text-sm font-semibold text-white hover:from-purple-700 hover:to-blue-700 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Oluşturuluyor...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                İçeriği Yenile
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
