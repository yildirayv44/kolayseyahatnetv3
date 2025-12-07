"use client";

import { useState } from "react";
import { TrendingUp, Loader2, ArrowLeft, Eye, MousePointer, Clock, TrendingDown, Zap, Target } from "lucide-react";
import Link from "next/link";

interface PerformancePrediction {
  monthlyViews: { min: number; max: number };
  ctr: number;
  avgTimeOnPage: string;
  bounceRate: number;
  conversionRate: number;
  viralPotential: 'low' | 'medium' | 'high';
  competitionLevel: 'low' | 'medium' | 'high';
  recommendations: string[];
}

export default function PerformancePage() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [keywords, setKeywords] = useState("");
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(false);
  const [prediction, setPrediction] = useState<PerformancePrediction | null>(null);

  const handlePredict = async () => {
    if (!title.trim() || !content.trim()) {
      alert("Lütfen başlık ve içerik girin!");
      return;
    }

    setLoading(true);
    setPrediction(null);

    try {
      const response = await fetch('/api/admin/ai/predict-performance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          content,
          keywords: keywords ? keywords.split(',').map(k => k.trim()) : undefined,
          category: category || undefined,
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setPrediction(data.prediction);
      } else {
        alert('Tahmin başarısız: ' + data.error);
      }
    } catch (error) {
      console.error('Prediction error:', error);
      alert('Bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const getLevelColor = (level: 'low' | 'medium' | 'high') => {
    if (level === 'high') return 'text-red-600 bg-red-100';
    if (level === 'medium') return 'text-yellow-600 bg-yellow-100';
    return 'text-green-600 bg-green-100';
  };

  const getLevelText = (level: 'low' | 'medium' | 'high') => {
    if (level === 'high') return 'Yüksek';
    if (level === 'medium') return 'Orta';
    return 'Düşük';
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
            <div className="p-3 bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl">
              <TrendingUp className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-slate-900">Performans Tahmini</h1>
              <p className="text-slate-600 mt-1">
                İçeriğinizin performansını önceden tahmin edin
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
                    Başlık *
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Japonya Vizesi 2024 Rehberi"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Kategori (Opsiyonel)
                  </label>
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="Vize, Seyahat, Rehber"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
                    placeholder="japonya vizesi, vize başvurusu"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    İçerik Özeti *
                  </label>
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="İçeriğinizin ilk birkaç paragrafını buraya yapıştırın..."
                    rows={8}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent font-mono text-sm"
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    {content.split(/\s+/).filter(w => w.length > 0).length} kelime
                  </p>
                </div>

                <button
                  onClick={handlePredict}
                  disabled={loading || !title.trim() || !content.trim()}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-lg font-bold hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Tahmin Ediliyor...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Performansı Tahmin Et
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Results Section */}
          <div className="space-y-4">
            {prediction ? (
              <>
                {/* Main Metrics */}
                <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
                  <h2 className="text-xl font-bold text-slate-900 mb-4">📊 Tahmin Edilen Metrikler</h2>
                  
                  <div className="grid grid-cols-2 gap-4">
                    {/* Monthly Views */}
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
                      <div className="flex items-center gap-2 mb-2">
                        <Eye className="h-5 w-5 text-blue-600" />
                        <span className="text-sm font-semibold text-blue-900">Aylık Görüntülenme</span>
                      </div>
                      <p className="text-2xl font-bold text-blue-900">
                        {prediction.monthlyViews.min.toLocaleString()}-{prediction.monthlyViews.max.toLocaleString()}
                      </p>
                    </div>

                    {/* CTR */}
                    <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
                      <div className="flex items-center gap-2 mb-2">
                        <MousePointer className="h-5 w-5 text-green-600" />
                        <span className="text-sm font-semibold text-green-900">CTR</span>
                      </div>
                      <p className="text-2xl font-bold text-green-900">
                        %{prediction.ctr}
                      </p>
                    </div>

                    {/* Avg Time */}
                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="h-5 w-5 text-purple-600" />
                        <span className="text-sm font-semibold text-purple-900">Ort. Süre</span>
                      </div>
                      <p className="text-2xl font-bold text-purple-900">
                        {prediction.avgTimeOnPage}
                      </p>
                    </div>

                    {/* Bounce Rate */}
                    <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4 border border-orange-200">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingDown className="h-5 w-5 text-orange-600" />
                        <span className="text-sm font-semibold text-orange-900">Bounce Rate</span>
                      </div>
                      <p className="text-2xl font-bold text-orange-900">
                        %{prediction.bounceRate}
                      </p>
                    </div>

                    {/* Conversion Rate */}
                    <div className="bg-gradient-to-br from-pink-50 to-pink-100 rounded-lg p-4 border border-pink-200">
                      <div className="flex items-center gap-2 mb-2">
                        <Target className="h-5 w-5 text-pink-600" />
                        <span className="text-sm font-semibold text-pink-900">Conversion</span>
                      </div>
                      <p className="text-2xl font-bold text-pink-900">
                        %{prediction.conversionRate}
                      </p>
                    </div>

                    {/* Viral Potential */}
                    <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-4 border border-yellow-200">
                      <div className="flex items-center gap-2 mb-2">
                        <Zap className="h-5 w-5 text-yellow-600" />
                        <span className="text-sm font-semibold text-yellow-900">Viral Potansiyel</span>
                      </div>
                      <p className={`text-lg font-bold px-3 py-1 rounded-full inline-block ${getLevelColor(prediction.viralPotential)}`}>
                        {getLevelText(prediction.viralPotential)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Competition Level */}
                <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
                  <h3 className="text-lg font-bold text-slate-900 mb-3">⚔️ Rekabet Seviyesi</h3>
                  <div className={`px-4 py-3 rounded-lg ${getLevelColor(prediction.competitionLevel)}`}>
                    <p className="font-bold text-lg">
                      {getLevelText(prediction.competitionLevel)} Rekabet
                    </p>
                    <p className="text-sm mt-1">
                      {prediction.competitionLevel === 'high' && 'Yüksek rekabet - SEO\'ya daha fazla odaklanın'}
                      {prediction.competitionLevel === 'medium' && 'Orta rekabet - İyi bir fırsat'}
                      {prediction.competitionLevel === 'low' && 'Düşük rekabet - Harika bir fırsat!'}
                    </p>
                  </div>
                </div>

                {/* Recommendations */}
                {prediction.recommendations && prediction.recommendations.length > 0 && (
                  <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-900 mb-4">💡 Öneriler</h3>
                    <div className="space-y-2">
                      {prediction.recommendations.map((rec, idx) => (
                        <div key={idx} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                          <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold flex-shrink-0">
                            {idx + 1}
                          </div>
                          <p className="text-sm text-slate-700">{rec}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Performance Summary */}
                <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl p-6 text-white">
                  <h3 className="text-xl font-bold mb-3">📈 Performans Özeti</h3>
                  <div className="space-y-2 text-sm">
                    <p>
                      • Bu içerik <strong>{prediction.monthlyViews.min.toLocaleString()}-{prediction.monthlyViews.max.toLocaleString()}</strong> aylık görüntülenme alabilir
                    </p>
                    <p>
                      • Ortalama <strong>{prediction.avgTimeOnPage}</strong> sayfa süresi bekleniyor
                    </p>
                    <p>
                      • <strong>%{prediction.conversionRate}</strong> conversion rate ile yaklaşık <strong>{Math.round((prediction.monthlyViews.min + prediction.monthlyViews.max) / 2 * prediction.conversionRate / 100)}</strong> conversion
                    </p>
                    <p>
                      • Viral potansiyel: <strong>{getLevelText(prediction.viralPotential)}</strong>
                    </p>
                    <p>
                      • Rekabet: <strong>{getLevelText(prediction.competitionLevel)}</strong>
                    </p>
                  </div>
                </div>
              </>
            ) : (
              <div className="bg-white rounded-xl p-12 border border-slate-200 shadow-sm text-center">
                <div className="bg-gradient-to-br from-green-100 to-emerald-100 rounded-full w-32 h-32 mx-auto mb-4 flex items-center justify-center">
                  <TrendingUp className="h-16 w-16 text-green-600" />
                </div>
                <p className="text-slate-500 mb-2">
                  Henüz tahmin yapılmadı
                </p>
                <p className="text-sm text-slate-400">
                  İçerik bilgilerini girin ve tahmin edin
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
