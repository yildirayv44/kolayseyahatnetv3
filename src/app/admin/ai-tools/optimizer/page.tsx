"use client";

import { useState } from "react";
import { Sparkles, Loader2, CheckCircle, AlertCircle, TrendingUp, FileText, ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { ContentAnalysis } from "@/lib/content-optimizer";

export default function ContentOptimizerPage() {
  const [content, setContent] = useState("");
  const [title, setTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [keywords, setKeywords] = useState("");
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<ContentAnalysis | null>(null);
  const [optimizedContent, setOptimizedContent] = useState("");
  const [autoFix, setAutoFix] = useState(false);

  const handleAnalyze = async () => {
    if (!content.trim()) {
      alert("Lütfen içerik girin!");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/admin/ai/optimize-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content,
          title: title || undefined,
          metaDescription: metaDescription || undefined,
          keywords: keywords ? keywords.split(',').map(k => k.trim()) : undefined,
          autoFix,
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setAnalysis(data.analysis);
        if (data.optimizedContent) {
          setOptimizedContent(data.optimizedContent);
        }
      } else {
        alert('Analiz başarısız: ' + data.error);
      }
    } catch (error) {
      console.error('Optimization error:', error);
      alert('Bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'bg-green-100';
    if (score >= 60) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/admin/ai-tools"
            className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            AI Araçlar
          </Link>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-slate-900">İçerik Optimizer</h1>
              <p className="text-slate-600 mt-1">
                İçeriğinizi analiz edin, SEO ve okunabilirlik skorları alın
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Section */}
          <div className="space-y-4">
            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900 mb-4">İçerik Bilgileri</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Başlık (Opsiyonel)
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Japonya Vizesi 2024 Rehberi"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Meta Açıklama (Opsiyonel)
                  </label>
                  <textarea
                    value={metaDescription}
                    onChange={(e) => setMetaDescription(e.target.value)}
                    placeholder="Japonya vizesi başvurusu için gerekli evraklar, süreç ve ücretler hakkında detaylı rehber."
                    rows={2}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Anahtar Kelimeler (Virgülle ayırın)
                  </label>
                  <input
                    type="text"
                    value={keywords}
                    onChange={(e) => setKeywords(e.target.value)}
                    placeholder="japonya vizesi, vize başvurusu, gerekli evraklar"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    İçerik *
                  </label>
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="İçeriğinizi buraya yapıştırın..."
                    rows={12}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono text-sm"
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    {content.split(/\s+/).filter(w => w.length > 0).length} kelime
                  </p>
                </div>

                <div className="flex items-center gap-2 p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <input
                    type="checkbox"
                    id="autoFix"
                    checked={autoFix}
                    onChange={(e) => setAutoFix(e.target.checked)}
                    className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                  />
                  <label htmlFor="autoFix" className="text-sm font-medium text-slate-700">
                    🤖 Otomatik Düzeltme (AI ile iyileştir)
                  </label>
                </div>

                <button
                  onClick={handleAnalyze}
                  disabled={loading || !content.trim()}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-lg font-bold hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Analiz Ediliyor...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <Sparkles className="h-5 w-5" />
                      İçeriği Analiz Et
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Results Section */}
          <div className="space-y-4">
            {analysis ? (
              <>
                {/* Overall Score */}
                <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
                  <h2 className="text-xl font-bold text-slate-900 mb-4">Genel Skor</h2>
                  <div className="flex items-center justify-center">
                    <div className="relative">
                      <svg className="w-32 h-32 transform -rotate-90">
                        <circle
                          cx="64"
                          cy="64"
                          r="56"
                          stroke="#e5e7eb"
                          strokeWidth="8"
                          fill="none"
                        />
                        <circle
                          cx="64"
                          cy="64"
                          r="56"
                          stroke={analysis.overallScore >= 80 ? '#10b981' : analysis.overallScore >= 60 ? '#f59e0b' : '#ef4444'}
                          strokeWidth="8"
                          fill="none"
                          strokeDasharray={`${(analysis.overallScore / 100) * 351.86} 351.86`}
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className={`text-4xl font-bold ${getScoreColor(analysis.overallScore)}`}>
                          {analysis.overallScore}
                        </span>
                      </div>
                    </div>
                  </div>
                  <p className="text-center text-slate-600 mt-4">
                    {analysis.overallScore >= 80 && '🎉 Mükemmel! İçerik çok iyi optimize edilmiş.'}
                    {analysis.overallScore >= 60 && analysis.overallScore < 80 && '👍 İyi! Birkaç iyileştirme yapılabilir.'}
                    {analysis.overallScore < 60 && '⚠️ İyileştirme gerekiyor.'}
                  </p>
                </div>

                {/* Detailed Scores */}
                <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm space-y-4">
                  <h2 className="text-xl font-bold text-slate-900 mb-4">Detaylı Skorlar</h2>
                  
                  {/* Readability */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-slate-700">📖 Okunabilirlik</span>
                      <span className={`font-bold ${getScoreColor(analysis.readability.score)}`}>
                        {analysis.readability.score}/100
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${getScoreBg(analysis.readability.score)}`}
                        style={{ width: `${analysis.readability.score}%` }}
                      />
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      Seviye: {analysis.readability.level === 'easy' ? 'Kolay' : analysis.readability.level === 'medium' ? 'Orta' : 'Zor'}
                      {' • '}
                      Ort. cümle: {analysis.readability.avgSentenceLength} kelime
                    </p>
                  </div>

                  {/* SEO */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-slate-700">🔍 SEO</span>
                      <span className={`font-bold ${getScoreColor(analysis.seo.score)}`}>
                        {analysis.seo.score}/100
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${getScoreBg(analysis.seo.score)}`}
                        style={{ width: `${analysis.seo.score}%` }}
                      />
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      Keyword: %{analysis.seo.keywordDensity}
                      {' • '}
                      İç link: {analysis.seo.internalLinks}
                      {' • '}
                      Görsel alt: {analysis.seo.imageAltTexts}
                    </p>
                  </div>

                  {/* Quality */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-slate-700">✨ Kalite</span>
                      <span className={`font-bold ${getScoreColor(analysis.quality.score)}`}>
                        {analysis.quality.score}/100
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${getScoreBg(analysis.quality.score)}`}
                        style={{ width: `${analysis.quality.score}%` }}
                      />
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      {analysis.quality.wordCount} kelime
                      {' • '}
                      Sentiment: {analysis.quality.sentiment === 'positive' ? '😊 Pozitif' : analysis.quality.sentiment === 'negative' ? '😔 Negatif' : '😐 Nötr'}
                      {' • '}
                      Ton: {analysis.quality.tone === 'formal' ? 'Resmi' : analysis.quality.tone === 'casual' ? 'Samimi' : 'Karışık'}
                    </p>
                  </div>
                </div>

                {/* Suggestions */}
                {analysis.suggestions.length > 0 && (
                  <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
                    <h2 className="text-xl font-bold text-slate-900 mb-4">💡 Öneriler</h2>
                    <div className="space-y-2">
                      {analysis.suggestions.map((suggestion, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-sm text-slate-700 p-3 bg-blue-50 rounded-lg border border-blue-200">
                          <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                          <span>{suggestion}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Optimized Content */}
                {optimizedContent && (
                  <div className="bg-white rounded-xl p-6 border border-green-200 shadow-sm">
                    <h2 className="text-xl font-bold text-green-900 mb-4 flex items-center gap-2">
                      <CheckCircle className="h-6 w-6" />
                      Optimize Edilmiş İçerik
                    </h2>
                    <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                      <pre className="whitespace-pre-wrap text-sm text-slate-700 font-mono">
                        {optimizedContent}
                      </pre>
                    </div>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(optimizedContent);
                        alert('İçerik kopyalandı!');
                      }}
                      className="mt-4 w-full bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors"
                    >
                      📋 Kopyala
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="bg-white rounded-xl p-12 border border-slate-200 shadow-sm text-center">
                <FileText className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500">
                  İçeriğinizi girin ve analiz edin
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
