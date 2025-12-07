"use client";

import { useState } from "react";
import { X, Sparkles, Loader2, CheckCircle, AlertCircle } from "lucide-react";

interface ContentOptimizerModalProps {
  blog: any;
  onClose: () => void;
  onOptimized?: () => void;
}

export function ContentOptimizerModal({ blog, onClose, onOptimized }: ContentOptimizerModalProps) {
  const [analyzing, setAnalyzing] = useState(false);
  const [optimizing, setOptimizing] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);

  const analyzeContent = async () => {
    setAnalyzing(true);
    try {
      const response = await fetch("/api/admin/ai/analyze-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: blog.title,
          content: blog.contents,
          description: blog.description,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setAnalysis(data.analysis);
      }
    } catch (error) {
      console.error("Analysis error:", error);
    } finally {
      setAnalyzing(false);
    }
  };

  const optimizeContent = async () => {
    setOptimizing(true);
    try {
      const response = await fetch("/api/admin/ai/optimize-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: blog.title,
          content: blog.contents,
          description: blog.description,
          analysis: analysis,
        }),
      });

      const data = await response.json();
      if (data.success) {
        // Update blog with optimized content
        onOptimized?.();
        onClose();
      }
    } catch (error) {
      console.error("Optimization error:", error);
    } finally {
      setOptimizing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white rounded-xl shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Sparkles className="h-6 w-6" />
              İçerik Optimizer
            </h2>
            <p className="text-purple-100 mt-1">{blog.title}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {!analysis ? (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
                <Sparkles className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">
                İçeriğinizi Analiz Edelim
              </h3>
              <p className="text-slate-600 mb-6">
                AI ile SEO, okunabilirlik ve içerik kalitesi analizi
              </p>
              <button
                onClick={analyzeContent}
                disabled={analyzing}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 disabled:opacity-50"
              >
                {analyzing ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Analiz Ediliyor...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-5 w-5" />
                    Analizi Başlat
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Scores */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
                  <p className="text-sm text-purple-700 font-semibold mb-1">SEO Skoru</p>
                  <p className="text-3xl font-bold text-purple-900">
                    {analysis.seoScore || 0}/100
                  </p>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
                  <p className="text-sm text-blue-700 font-semibold mb-1">Okunabilirlik</p>
                  <p className="text-3xl font-bold text-blue-900">
                    {analysis.readabilityScore || 0}/100
                  </p>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
                  <p className="text-sm text-green-700 font-semibold mb-1">Kalite</p>
                  <p className="text-3xl font-bold text-green-900">
                    {analysis.qualityScore || 0}/100
                  </p>
                </div>
              </div>

              {/* Issues */}
              {analysis.issues && analysis.issues.length > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                  <h4 className="font-semibold text-amber-900 mb-3 flex items-center gap-2">
                    <AlertCircle className="h-5 w-5" />
                    Tespit Edilen Sorunlar ({analysis.issues.length})
                  </h4>
                  <ul className="space-y-2">
                    {analysis.issues.map((issue: string, idx: number) => (
                      <li key={idx} className="text-sm text-amber-800 flex items-start gap-2">
                        <span className="text-amber-600">•</span>
                        {issue}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Suggestions */}
              {analysis.suggestions && analysis.suggestions.length > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                    <CheckCircle className="h-5 w-5" />
                    İyileştirme Önerileri ({analysis.suggestions.length})
                  </h4>
                  <ul className="space-y-2">
                    {analysis.suggestions.map((suggestion: string, idx: number) => (
                      <li key={idx} className="text-sm text-blue-800 flex items-start gap-2">
                        <span className="text-blue-600">✓</span>
                        {suggestion}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t">
                <button
                  onClick={optimizeContent}
                  disabled={optimizing}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {optimizing ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Optimize Ediliyor...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-5 w-5" />
                      Otomatik Optimize Et
                    </>
                  )}
                </button>
                <button
                  onClick={onClose}
                  className="px-6 py-3 rounded-lg font-semibold border-2 border-slate-300 text-slate-700 hover:bg-slate-50"
                >
                  Kapat
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
