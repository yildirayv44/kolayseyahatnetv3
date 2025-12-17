"use client";

import { useState, useEffect } from "react";
import { 
  Globe, 
  Plus, 
  Trash2, 
  Search, 
  Loader2, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  ExternalLink,
  Clock,
  Sparkles,
  ChevronDown,
  ChevronUp
} from "lucide-react";

interface Suggestion {
  id: string;
  suggestion_type: string;
  field_name: string;
  current_value: string;
  suggested_value: string;
  source_url: string;
  confidence_score: number;
  status: string;
  created_at: string;
  notes: string;
}

interface SourceUrlManagerProps {
  countryId: string;
  countryName: string;
  initialSourceUrls?: string[];
  lastSourceCheck?: string;
  sourceCheckNotes?: string;
  onSourceUrlsChange?: (urls: string[]) => void;
}

export function SourceUrlManager({
  countryId,
  countryName,
  initialSourceUrls = [],
  lastSourceCheck,
  sourceCheckNotes,
  onSourceUrlsChange,
}: SourceUrlManagerProps) {
  const [sourceUrls, setSourceUrls] = useState<string[]>(
    initialSourceUrls.length > 0 ? initialSourceUrls : [""]
  );
  const [analyzing, setAnalyzing] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [expanded, setExpanded] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  // Load existing suggestions on mount
  useEffect(() => {
    loadSuggestions();
  }, [countryId]);

  const loadSuggestions = async () => {
    setLoadingSuggestions(true);
    try {
      const response = await fetch(`/api/admin/countries/analyze-sources?countryId=${countryId}`);
      const data = await response.json();
      if (data.suggestions) {
        setSuggestions(data.suggestions);
      }
    } catch (error) {
      console.error("Error loading suggestions:", error);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const addUrlField = () => {
    setSourceUrls([...sourceUrls, ""]);
  };

  const removeUrlField = (index: number) => {
    const newUrls = sourceUrls.filter((_, i) => i !== index);
    setSourceUrls(newUrls.length > 0 ? newUrls : [""]);
    onSourceUrlsChange?.(newUrls.filter(u => u.trim()));
  };

  const updateUrl = (index: number, value: string) => {
    const newUrls = [...sourceUrls];
    newUrls[index] = value;
    setSourceUrls(newUrls);
    onSourceUrlsChange?.(newUrls.filter(u => u.trim()));
  };

  const analyzeSourceUrls = async () => {
    const validUrls = sourceUrls.filter(u => u.trim());
    if (validUrls.length === 0) {
      alert("Lütfen en az bir kaynak URL girin");
      return;
    }

    setAnalyzing(true);
    setAnalysisResult(null);

    try {
      const response = await fetch("/api/admin/countries/analyze-sources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          countryId,
          sourceUrls: validUrls,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Analiz başarısız");
      }

      setAnalysisResult(data.analysis);
      await loadSuggestions(); // Reload suggestions after analysis
      
      if (data.analysis.no_changes_needed) {
        alert("✅ Kaynak sayfalar analiz edildi. Güncelleme gerektiren bir değişiklik bulunamadı.");
      } else {
        alert(`✅ Analiz tamamlandı! ${data.analysis.suggestions?.length || 0} öneri oluşturuldu.`);
      }
    } catch (error: any) {
      console.error("Analysis error:", error);
      alert("Hata: " + error.message);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSuggestionAction = async (suggestionId: string, action: "approve" | "reject", applyChanges: boolean = false) => {
    try {
      const response = await fetch(`/api/admin/countries/suggestions/${suggestionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, applyChanges }),
      });

      const data = await response.json();
      console.log("Suggestion action response:", data);

      if (!response.ok) {
        throw new Error(data.error || "İşlem başarısız");
      }

      // Check if the operation was actually successful
      if (data.success === false) {
        throw new Error(data.warning || data.error || "İşlem başarısız");
      }

      // Update local state
      setSuggestions(prev => 
        prev.map(s => 
          s.id === suggestionId 
            ? { ...s, status: action === "approve" ? (applyChanges ? "applied" : "approved") : "rejected" }
            : s
        )
      );

      if (applyChanges && data.applied) {
        alert("✅ Değişiklik başarıyla uygulandı!");
        // Sayfayı yenile
        window.location.reload();
      } else if (applyChanges && !data.applied) {
        alert("⚠️ Öneri onaylandı ancak değişiklik uygulanamadı. Lütfen sayfayı yenileyip tekrar deneyin.");
      }
    } catch (error: any) {
      console.error("Suggestion action error:", error);
      alert("Hata: " + error.message);
    }
  };

  const deleteSuggestion = async (suggestionId: string) => {
    if (!confirm("Bu öneriyi silmek istediğinizden emin misiniz?")) return;

    try {
      const response = await fetch(`/api/admin/countries/suggestions/${suggestionId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Silme başarısız");
      }

      setSuggestions(prev => prev.filter(s => s.id !== suggestionId));
    } catch (error: any) {
      alert("Hata: " + error.message);
    }
  };

  const pendingSuggestions = suggestions.filter(s => s.status === "pending");
  const processedSuggestions = suggestions.filter(s => s.status !== "pending");

  const getConfidenceColor = (score: number) => {
    if (score >= 0.8) return "text-green-600 bg-green-100";
    if (score >= 0.5) return "text-amber-600 bg-amber-100";
    return "text-red-600 bg-red-100";
  };

  const getSuggestionTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      visa_fee: "💰 Vize Ücreti",
      requirements: "📋 Gereksinimler",
      documents: "📄 Belgeler",
      visa_status: "🛂 Vize Durumu",
      processing_time: "⏱️ İşlem Süresi",
      stay_duration: "📅 Kalış Süresi",
      content: "📝 İçerik",
      general: "ℹ️ Genel",
    };
    return labels[type] || type;
  };

  return (
    <div className="rounded-lg border-2 border-purple-200 bg-gradient-to-r from-purple-50 to-indigo-50">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-between p-6"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100">
            <Globe className="h-5 w-5 text-purple-600" />
          </div>
          <div className="text-left">
            <h3 className="text-lg font-bold text-slate-900">🔗 Kaynak URL Yönetimi</h3>
            <p className="text-sm text-slate-600">
              Resmi vize bilgi kaynaklarını ekleyin ve AI ile analiz edin
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {pendingSuggestions.length > 0 && (
            <span className="flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-sm font-semibold text-amber-700">
              <AlertTriangle className="h-4 w-4" />
              {pendingSuggestions.length} bekleyen öneri
            </span>
          )}
          {expanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
        </div>
      </button>

      {expanded && (
        <div className="border-t border-purple-200 p-6 space-y-6">
          {/* Last Check Info */}
          {lastSourceCheck && (
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Clock className="h-4 w-4" />
              <span>Son kontrol: {new Date(lastSourceCheck).toLocaleString("tr-TR")}</span>
              {sourceCheckNotes && (
                <span className="text-slate-500">• {sourceCheckNotes.slice(0, 100)}...</span>
              )}
            </div>
          )}

          {/* Source URL Inputs */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-slate-900">
              Kaynak URL'leri
            </label>
            <p className="text-xs text-slate-600">
              {countryName} vizesi için resmi kaynak sayfalarını ekleyin (e-vize portalları, büyükelçilik siteleri vb.)
            </p>
            
            {sourceUrls.map((url, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="url"
                  value={url}
                  onChange={(e) => updateUrl(index, e.target.value)}
                  placeholder="https://example.gov/visa-info"
                  className="flex-1 rounded-lg border border-slate-200 px-4 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                />
                {url && (
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center rounded-lg border border-slate-200 px-3 text-slate-500 hover:bg-slate-50 hover:text-slate-700"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                )}
                <button
                  type="button"
                  onClick={() => removeUrlField(index)}
                  className="flex items-center justify-center rounded-lg border border-red-200 px-3 text-red-500 hover:bg-red-50"
                  disabled={sourceUrls.length === 1 && !url}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={addUrlField}
                className="inline-flex items-center gap-2 rounded-lg border-2 border-dashed border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 hover:border-purple-400 hover:text-purple-600"
              >
                <Plus className="h-4 w-4" />
                URL Ekle
              </button>

              <button
                type="button"
                onClick={analyzeSourceUrls}
                disabled={analyzing || sourceUrls.every(u => !u.trim())}
                className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-2 text-sm font-semibold text-white hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50"
              >
                {analyzing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Analiz Ediliyor...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    AI ile Analiz Et
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Analysis Result */}
          {analysisResult && (
            <div className="rounded-lg border border-purple-200 bg-white p-4 space-y-4">
              <h4 className="font-semibold text-slate-900">📊 Analiz Sonucu</h4>
              <p className="text-sm text-slate-700">{analysisResult.analysis_summary}</p>
              
              {analysisResult.extracted_info && (
                <div className="grid gap-2 text-sm">
                  {analysisResult.extracted_info.visa_fee && (
                    <div className="flex gap-2">
                      <span className="font-medium text-slate-600">Vize Ücreti:</span>
                      <span>{analysisResult.extracted_info.visa_fee}</span>
                    </div>
                  )}
                  {analysisResult.extracted_info.stay_duration && (
                    <div className="flex gap-2">
                      <span className="font-medium text-slate-600">Kalış Süresi:</span>
                      <span>{analysisResult.extracted_info.stay_duration}</span>
                    </div>
                  )}
                  {analysisResult.extracted_info.processing_time && (
                    <div className="flex gap-2">
                      <span className="font-medium text-slate-600">İşlem Süresi:</span>
                      <span>{analysisResult.extracted_info.processing_time}</span>
                    </div>
                  )}
                  {analysisResult.extracted_info.documents && analysisResult.extracted_info.documents.length > 0 && (
                    <div className="mt-2">
                      <span className="font-medium text-slate-600">Tespit Edilen Belgeler:</span>
                      <ul className="mt-1 list-disc list-inside text-slate-700">
                        {analysisResult.extracted_info.documents.map((doc: string, i: number) => (
                          <li key={i}>{doc}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Content Improvements */}
              {analysisResult.content_improvements && analysisResult.content_improvements.length > 0 && (
                <div className="mt-4 border-t border-purple-100 pt-4">
                  <h5 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                    📝 İçerik İyileştirme Önerileri
                  </h5>
                  <div className="space-y-2">
                    {analysisResult.content_improvements.map((improvement: any, index: number) => (
                      <div 
                        key={index} 
                        className={`rounded-lg p-3 text-sm ${
                          improvement.priority === 'high' 
                            ? 'bg-red-50 border border-red-200' 
                            : improvement.priority === 'medium'
                            ? 'bg-amber-50 border border-amber-200'
                            : 'bg-blue-50 border border-blue-200'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded ${
                            improvement.priority === 'high' 
                              ? 'bg-red-100 text-red-700' 
                              : improvement.priority === 'medium'
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-blue-100 text-blue-700'
                          }`}>
                            {improvement.priority === 'high' ? '🔴 Yüksek' : improvement.priority === 'medium' ? '🟡 Orta' : '🔵 Düşük'}
                          </span>
                          <span className="font-medium text-slate-700">{improvement.section}</span>
                        </div>
                        <p className="text-slate-600 mb-1"><strong>Sorun:</strong> {improvement.issue}</p>
                        <p className="text-slate-800"><strong>Öneri:</strong> {improvement.suggestion}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Pending Suggestions */}
          {pendingSuggestions.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-semibold text-slate-900 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                Bekleyen Öneriler ({pendingSuggestions.length})
              </h4>
              
              <div className="space-y-3">
                {pendingSuggestions.map((suggestion) => (
                  <div
                    key={suggestion.id}
                    className="rounded-lg border border-amber-200 bg-amber-50 p-4 space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold">
                            {getSuggestionTypeLabel(suggestion.suggestion_type)}
                          </span>
                          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${getConfidenceColor(suggestion.confidence_score)}`}>
                            %{Math.round(suggestion.confidence_score * 100)} güven
                          </span>
                        </div>
                        {suggestion.field_name && (
                          <p className="text-xs text-slate-500">
                            Alan: <code className="bg-slate-100 px-1 rounded">{suggestion.field_name}</code>
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => deleteSuggestion(suggestion.id)}
                        className="text-slate-400 hover:text-red-500"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="grid gap-2 text-sm">
                      <div className="rounded bg-red-100 p-2">
                        <span className="font-medium text-red-700">Mevcut: </span>
                        <span className="text-red-900">{suggestion.current_value || "(boş)"}</span>
                      </div>
                      <div className="rounded bg-green-100 p-2">
                        <span className="font-medium text-green-700">Önerilen: </span>
                        <span className="text-green-900">{suggestion.suggested_value}</span>
                      </div>
                    </div>

                    {suggestion.notes && (
                      <p className="text-xs text-slate-600 italic">{suggestion.notes}</p>
                    )}

                    {suggestion.source_url && (
                      <a
                        href={suggestion.source_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-purple-600 hover:underline"
                      >
                        <ExternalLink className="h-3 w-3" />
                        Kaynak
                      </a>
                    )}

                    <div className="flex gap-2 pt-2 border-t border-amber-200">
                      <button
                        onClick={() => handleSuggestionAction(suggestion.id, "approve", true)}
                        className="inline-flex items-center gap-1 rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700"
                      >
                        <CheckCircle className="h-4 w-4" />
                        Onayla ve Uygula
                      </button>
                      <button
                        onClick={() => handleSuggestionAction(suggestion.id, "approve", false)}
                        className="inline-flex items-center gap-1 rounded-lg border border-green-600 px-4 py-2 text-sm font-semibold text-green-600 hover:bg-green-50"
                      >
                        Sadece Onayla
                      </button>
                      <button
                        onClick={() => handleSuggestionAction(suggestion.id, "reject")}
                        className="inline-flex items-center gap-1 rounded-lg border border-red-300 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"
                      >
                        <XCircle className="h-4 w-4" />
                        Reddet
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Processed Suggestions History */}
          {processedSuggestions.length > 0 && (
            <details className="rounded-lg border border-slate-200 bg-white">
              <summary className="cursor-pointer p-4 font-medium text-slate-700">
                📜 Geçmiş Öneriler ({processedSuggestions.length})
              </summary>
              <div className="border-t border-slate-200 p-4 space-y-2">
                {processedSuggestions.map((suggestion) => (
                  <div
                    key={suggestion.id}
                    className={`flex items-center justify-between rounded p-2 text-sm ${
                      suggestion.status === "applied" || suggestion.status === "approved"
                        ? "bg-green-50"
                        : "bg-red-50"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {suggestion.status === "applied" || suggestion.status === "approved" ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-600" />
                      )}
                      <span>{getSuggestionTypeLabel(suggestion.suggestion_type)}</span>
                      <span className="text-slate-500">•</span>
                      <span className="text-slate-600">{suggestion.field_name}</span>
                    </div>
                    <span className={`text-xs ${
                      suggestion.status === "applied" ? "text-green-600" :
                      suggestion.status === "approved" ? "text-blue-600" :
                      "text-red-600"
                    }`}>
                      {suggestion.status === "applied" ? "Uygulandı" :
                       suggestion.status === "approved" ? "Onaylandı" :
                       "Reddedildi"}
                    </span>
                  </div>
                ))}
              </div>
            </details>
          )}

          {/* Loading State */}
          {loadingSuggestions && (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin text-purple-600" />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
