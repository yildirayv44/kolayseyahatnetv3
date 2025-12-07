"use client";

import { useState } from "react";
import { Target, Loader2, ArrowLeft, Lightbulb, TrendingUp, Users } from "lucide-react";
import Link from "next/link";

interface IntentAnalysis {
  primaryIntent: 'informational' | 'navigational' | 'transactional' | 'commercial';
  confidence: number;
  secondaryIntent?: 'informational' | 'navigational' | 'transactional' | 'commercial';
  userJourneyStage: 'awareness' | 'consideration' | 'decision';
  recommendedContentStructure: string[];
  recommendedCTA: string[];
  keywords: string[];
  optimizationTips: string[];
}

export default function IntentPage() {
  const [topic, setTopic] = useState("");
  const [keywords, setKeywords] = useState("");
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<IntentAnalysis | null>(null);

  const intentTypes = {
    informational: {
      name: 'Bilgilendirici',
      emoji: '📚',
      color: 'blue',
      desc: 'Kullanıcı bilgi arıyor',
      examples: '"nasıl", "nedir", "ne zaman"'
    },
    navigational: {
      name: 'Yönlendirici',
      emoji: '🧭',
      color: 'purple',
      desc: 'Belirli sayfa arıyor',
      examples: 'Marka, yer adı'
    },
    transactional: {
      name: 'İşlemsel',
      emoji: '💳',
      color: 'green',
      desc: 'İşlem yapmak istiyor',
      examples: '"başvuru", "satın al"'
    },
    commercial: {
      name: 'Ticari',
      emoji: '🛒',
      color: 'orange',
      desc: 'Karşılaştırma yapıyor',
      examples: '"en iyi", "vs", "fiyat"'
    },
  };

  const journeyStages = {
    awareness: {
      name: 'Farkındalık',
      emoji: '💡',
      color: 'yellow',
      desc: 'Problemi yeni keşfetti'
    },
    consideration: {
      name: 'Değerlendirme',
      emoji: '🤔',
      color: 'blue',
      desc: 'Seçenekleri araştırıyor'
    },
    decision: {
      name: 'Karar',
      emoji: '✅',
      color: 'green',
      desc: 'Karar vermeye hazır'
    },
  };

  const handleAnalyze = async () => {
    if (!topic.trim()) {
      alert("Lütfen bir konu girin!");
      return;
    }

    setLoading(true);
    setAnalysis(null);

    try {
      const response = await fetch('/api/admin/ai/analyze-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic,
          keywords: keywords ? keywords.split(',').map(k => k.trim()) : undefined,
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setAnalysis(data.analysis);
      } else {
        alert('Analiz başarısız: ' + data.error);
      }
    } catch (error) {
      console.error('Intent analysis error:', error);
      alert('Bir hata oluştu');
    } finally {
      setLoading(false);
    }
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
            <div className="p-3 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl">
              <Target className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-slate-900">Kullanıcı Niyet Analizi</h1>
              <p className="text-slate-600 mt-1">
                Kullanıcı niyetini analiz edin ve içeriği optimize edin
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Section */}
          <div className="space-y-4">
            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900 mb-4">Konu Bilgileri</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Konu / Arama Terimi *
                  </label>
                  <input
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="Örn: japonya vizesi nasıl alınır"
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-lg"
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    Kullanıcıların arama yapabileceği terimi girin
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Anahtar Kelimeler (Opsiyonel)
                  </label>
                  <input
                    type="text"
                    value={keywords}
                    onChange={(e) => setKeywords(e.target.value)}
                    placeholder="vize, başvuru, evraklar"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                <button
                  onClick={handleAnalyze}
                  disabled={loading || !topic.trim()}
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-lg font-bold hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Analiz Ediliyor...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <Target className="h-5 w-5" />
                      Niyeti Analiz Et
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* Intent Types Info */}
            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Niyet Türleri</h3>
              <div className="space-y-3">
                {Object.entries(intentTypes).map(([key, intent]) => (
                  <div key={key} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                    <span className="text-2xl">{intent.emoji}</span>
                    <div>
                      <div className="font-semibold text-slate-900">{intent.name}</div>
                      <div className="text-xs text-slate-600">{intent.desc}</div>
                      <div className="text-xs text-slate-500 mt-1">Örnek: {intent.examples}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Results Section */}
          <div className="space-y-4">
            {analysis ? (
              <>
                {/* Primary Intent */}
                <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
                  <h2 className="text-xl font-bold text-slate-900 mb-4">🎯 Niyet Analizi</h2>
                  
                  <div className="space-y-4">
                    <div className={`bg-${intentTypes[analysis.primaryIntent].color}-50 rounded-lg p-4 border-2 border-${intentTypes[analysis.primaryIntent].color}-200`}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-3xl">{intentTypes[analysis.primaryIntent].emoji}</span>
                          <div>
                            <div className="font-bold text-lg text-slate-900">
                              {intentTypes[analysis.primaryIntent].name}
                            </div>
                            <div className="text-sm text-slate-600">
                              Birincil Niyet
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-3xl font-bold text-slate-900">
                            %{analysis.confidence}
                          </div>
                          <div className="text-xs text-slate-600">Güven</div>
                        </div>
                      </div>
                      <p className="text-sm text-slate-700">
                        {intentTypes[analysis.primaryIntent].desc}
                      </p>
                    </div>

                    {analysis.secondaryIntent && (
                      <div className={`bg-${intentTypes[analysis.secondaryIntent].color}-50 rounded-lg p-3 border border-${intentTypes[analysis.secondaryIntent].color}-200`}>
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{intentTypes[analysis.secondaryIntent].emoji}</span>
                          <div>
                            <div className="font-semibold text-sm text-slate-900">
                              {intentTypes[analysis.secondaryIntent].name}
                            </div>
                            <div className="text-xs text-slate-600">
                              İkincil Niyet
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* User Journey Stage */}
                <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
                  <h3 className="text-lg font-bold text-slate-900 mb-3">
                    <Users className="h-5 w-5 inline mr-2" />
                    Kullanıcı Yolculuğu
                  </h3>
                  <div className={`bg-${journeyStages[analysis.userJourneyStage].color}-50 rounded-lg p-4 border-2 border-${journeyStages[analysis.userJourneyStage].color}-200`}>
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{journeyStages[analysis.userJourneyStage].emoji}</span>
                      <div>
                        <div className="font-bold text-lg text-slate-900">
                          {journeyStages[analysis.userJourneyStage].name}
                        </div>
                        <div className="text-sm text-slate-600">
                          {journeyStages[analysis.userJourneyStage].desc}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Content Structure */}
                {analysis.recommendedContentStructure.length > 0 && (
                  <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-900 mb-3">
                      📋 Önerilen İçerik Yapısı
                    </h3>
                    <div className="space-y-2">
                      {analysis.recommendedContentStructure.map((item, idx) => (
                        <div key={idx} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                          <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold flex-shrink-0">
                            {idx + 1}
                          </div>
                          <span className="text-sm text-slate-700">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* CTA Recommendations */}
                {analysis.recommendedCTA.length > 0 && (
                  <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-900 mb-3">
                      🎯 Önerilen CTA'lar
                    </h3>
                    <div className="space-y-2">
                      {analysis.recommendedCTA.map((cta, idx) => (
                        <div key={idx} className="p-3 bg-green-50 rounded-lg border border-green-200 text-center">
                          <button className="bg-green-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors">
                            {cta}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Keywords */}
                {analysis.keywords.length > 0 && (
                  <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-900 mb-3">
                      🔑 Anahtar Kelimeler
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {analysis.keywords.map((keyword, idx) => (
                        <span key={idx} className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-medium">
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Optimization Tips */}
                {analysis.optimizationTips.length > 0 && (
                  <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-6 border-2 border-indigo-200">
                    <h3 className="text-lg font-bold text-indigo-900 mb-3 flex items-center gap-2">
                      <Lightbulb className="h-5 w-5" />
                      Optimizasyon İpuçları
                    </h3>
                    <div className="space-y-2">
                      {analysis.optimizationTips.map((tip, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-sm text-indigo-900">
                          <TrendingUp className="h-4 w-4 mt-0.5 flex-shrink-0" />
                          <span>{tip}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="bg-white rounded-xl p-12 border border-slate-200 shadow-sm text-center">
                <div className="bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full w-32 h-32 mx-auto mb-4 flex items-center justify-center">
                  <Target className="h-16 w-16 text-indigo-600" />
                </div>
                <p className="text-slate-500 mb-2">
                  Henüz analiz yapılmadı
                </p>
                <p className="text-sm text-slate-400">
                  Konu girin ve niyeti analiz edin
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
