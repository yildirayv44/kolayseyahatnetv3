"use client";

import { useState, useEffect } from "react";
import {
  Search,
  Sparkles,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  TrendingUp,
  FileText,
  Target,
  Shield,
  Zap,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Globe,
  Users,
  Clock,
  BarChart3,
  Lightbulb,
  ListChecks,
  RefreshCw,
} from "lucide-react";

interface Country {
  id: number;
  name: string;
  slug: string;
  country_code: string;
  status: number;
}

interface ContentSummary {
  countryName: string;
  title: string;
  visaStatus: string;
  allowedStay: string;
  applicationMethod: string;
  processTime: string;
  capital: string;
  currency: string;
  language: string;
  timezone: string;
  popularCities: number;
  bestTimeToVisit: string;
  travelTips: number;
  applicationSteps: number;
  requiredDocuments: number;
  importantNotes: number;
  healthRequirements: string;
  customsRegulations: string;
  emergencyContacts: string;
  whyKolaySeyahat: string;
  faqCount: number;
  commentsCount: number;
  relatedBlogs: number;
  subPages: number;
  subPageNames: string[];
  hasEnglishTitle: boolean;
  hasEnglishDescription: boolean;
}

interface MissingContent {
  title: string;
  description: string;
  priority: "high" | "medium" | "low";
  impact: string;
}

interface Improvement {
  section: string;
  current: string;
  suggestion: string;
  priority: "high" | "medium" | "low";
}

interface EngagementSuggestion {
  element: string;
  description: string;
  expectedImpact: string;
}

interface EEATRecommendation {
  aspect: string;
  recommendation: string;
  implementation: string;
}

interface TechnicalSEO {
  item: string;
  status: "good" | "warning" | "missing";
  recommendation: string;
}

interface ActionItem {
  rank: number;
  action: string;
  effort: "low" | "medium" | "high";
  impact: "low" | "medium" | "high";
  timeline: string;
}

interface ContentScores {
  sufficiency: number;
  diversity: number;
  engagement: number;
  eeat: number;
  semanticSEO: number;
}

interface Analysis {
  overallScore: number;
  summary: string;
  strengths: string[];
  missingContent: MissingContent[];
  improvements: Improvement[];
  engagementSuggestions: EngagementSuggestion[];
  eeatRecommendations: EEATRecommendation[];
  technicalSEO: TechnicalSEO[];
  actionPlan: ActionItem[];
  contentScores: ContentScores;
}

export default function SEOContentAnalysisPage() {
  const [countries, setCountries] = useState<Country[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingCountries, setLoadingCountries] = useState(true);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [contentSummary, setContentSummary] = useState<ContentSummary | null>(null);
  const [countryInfo, setCountryInfo] = useState<{ id: number; name: string; slug: string } | null>(null);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    strengths: true,
    missing: true,
    improvements: true,
    engagement: false,
    eeat: false,
    technical: false,
    actionPlan: true,
  });

  useEffect(() => {
    fetchCountries();
  }, []);

  const fetchCountries = async () => {
    try {
      const response = await fetch("/api/admin/seo/content-analysis");
      const data = await response.json();
      if (data.success) {
        setCountries(data.countries);
      }
    } catch (error) {
      console.error("Error fetching countries:", error);
    } finally {
      setLoadingCountries(false);
    }
  };

  const runAnalysis = async () => {
    if (!selectedCountry) return;
    setLoading(true);
    setAnalysis(null);
    setContentSummary(null);

    try {
      const response = await fetch("/api/admin/seo/content-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ countryId: selectedCountry }),
      });
      const data = await response.json();
      if (data.success) {
        setAnalysis(data.analysis);
        setContentSummary(data.contentSummary);
        setCountryInfo(data.country);
      } else {
        alert(data.error || "Analiz basarisiz oldu");
      }
    } catch (error) {
      console.error("Analysis error:", error);
      alert("Analiz sirasinda bir hata olustu");
    } finally {
      setLoading(false);
    }
  };

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const filteredCountries = countries.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    if (score >= 40) return "text-orange-600";
    return "text-red-600";
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return "bg-green-100";
    if (score >= 60) return "bg-yellow-100";
    if (score >= 40) return "bg-orange-100";
    return "bg-red-100";
  };

  const getPriorityBadge = (priority: string) => {
    const colors: Record<string, string> = {
      high: "bg-red-100 text-red-700",
      medium: "bg-yellow-100 text-yellow-700",
      low: "bg-blue-100 text-blue-700",
    };
    return colors[priority] || colors.medium;
  };

  const getEffortImpactBadge = (level: string, type: "effort" | "impact") => {
    if (type === "effort") {
      const colors: Record<string, string> = { low: "bg-green-100 text-green-700", medium: "bg-yellow-100 text-yellow-700", high: "bg-red-100 text-red-700" };
      return colors[level] || colors.medium;
    } else {
      const colors: Record<string, string> = { high: "bg-green-100 text-green-700", medium: "bg-yellow-100 text-yellow-700", low: "bg-gray-100 text-gray-700" };
      return colors[level] || colors.medium;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "good": return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case "warning": return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case "missing": return <XCircle className="h-5 w-5 text-red-600" />;
      default: return null;
    }
  };

  const SectionHeader = ({ title, icon: Icon, section, count }: { title: string; icon: any; section: string; count?: number }) => (
    <button
      onClick={() => toggleSection(section)}
      className="w-full flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
    >
      <div className="flex items-center gap-3">
        <Icon className="h-5 w-5 text-purple-600" />
        <span className="font-bold text-slate-900">{title}</span>
        {count !== undefined && (
          <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-semibold rounded-full">
            {count}
          </span>
        )}
      </div>
      {expandedSections[section] ? (
        <ChevronUp className="h-5 w-5 text-slate-400" />
      ) : (
        <ChevronDown className="h-5 w-5 text-slate-400" />
      )}
    </button>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl">
              <Target className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-slate-900">SEO Icerik Analizi</h1>
              <p className="text-slate-600 mt-1">OpenAI GPT-4 ile ulke sayfalarinin detayli SEO ve icerik analizi</p>
            </div>
          </div>
        </div>

        {/* Country Selection */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 mb-8">
          <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Globe className="h-5 w-5 text-purple-600" />
            Ulke Secimi
          </h2>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                type="text"
                placeholder="Ulke ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <div className="flex-1">
              <select
                value={selectedCountry || ""}
                onChange={(e) => setSelectedCountry(Number(e.target.value) || null)}
                className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                disabled={loadingCountries}
              >
                <option value="">{loadingCountries ? "Yukleniyor..." : "Ulke secin..."}</option>
                {filteredCountries.map((country) => (
                  <option key={country.id} value={country.id}>{country.name}</option>
                ))}
              </select>
            </div>
            <button
              onClick={runAnalysis}
              disabled={!selectedCountry || loading}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all"
            >
              {loading ? (
                <><Loader2 className="h-5 w-5 animate-spin" />Analiz Ediliyor...</>
              ) : (
                <><Sparkles className="h-5 w-5" />Analiz Et</>
              )}
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-12 text-center">
            <Loader2 className="h-12 w-12 animate-spin text-purple-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-900 mb-2">Icerik Analiz Ediliyor</h3>
            <p className="text-slate-600">GPT-4 ile detayli SEO analizi yapiliyor, bu islem 15-30 saniye surebilir...</p>
          </div>
        )}

        {/* Analysis Results */}
        {analysis && contentSummary && (
          <div className="space-y-6">
            {/* Overall Score Card */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-1">{countryInfo?.name} - SEO Analiz Sonucu</h2>
                  <p className="text-slate-600">{analysis.summary}</p>
                </div>
                <div className={`flex items-center gap-3 px-6 py-4 rounded-xl ${getScoreBg(analysis.overallScore)}`}>
                  <div className="text-center">
                    <div className={`text-4xl font-bold ${getScoreColor(analysis.overallScore)}`}>{analysis.overallScore}</div>
                    <div className="text-sm text-slate-600">Genel Skor</div>
                  </div>
                </div>
              </div>

              {/* Score Breakdown */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-6">
                {[
                  { label: "Icerik Yeterliligi", score: analysis.contentScores.sufficiency, icon: FileText },
                  { label: "Icerik Cesitliligi", score: analysis.contentScores.diversity, icon: BarChart3 },
                  { label: "Engagement", score: analysis.contentScores.engagement, icon: Users },
                  { label: "E-E-A-T", score: analysis.contentScores.eeat, icon: Shield },
                  { label: "Semantik SEO", score: analysis.contentScores.semanticSEO, icon: TrendingUp },
                ].map((item) => (
                  <div key={item.label} className="bg-slate-50 rounded-lg p-4 text-center">
                    <item.icon className="h-5 w-5 text-slate-400 mx-auto mb-2" />
                    <div className={`text-2xl font-bold ${getScoreColor(item.score)}`}>{item.score}</div>
                    <div className="text-xs text-slate-600 mt-1">{item.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Content Summary */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <FileText className="h-5 w-5 text-purple-600" />
                Mevcut Icerik Durumu
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {[
                  { label: "Populer Sehirler", value: contentSummary.popularCities },
                  { label: "Seyahat Ipuclari", value: contentSummary.travelTips },
                  { label: "Basvuru Adimlari", value: contentSummary.applicationSteps },
                  { label: "Gerekli Belgeler", value: contentSummary.requiredDocuments },
                  { label: "Onemli Notlar", value: contentSummary.importantNotes },
                  { label: "SSS", value: contentSummary.faqCount },
                  { label: "Yorumlar", value: contentSummary.commentsCount },
                  { label: "Blog Yazilari", value: contentSummary.relatedBlogs },
                  { label: "Alt Sayfalar", value: contentSummary.subPages },
                ].map((item) => (
                  <div key={item.label} className={`p-3 rounded-lg text-center ${item.value > 0 ? "bg-green-50" : "bg-red-50"}`}>
                    <div className={`text-xl font-bold ${item.value > 0 ? "text-green-600" : "text-red-600"}`}>{item.value}</div>
                    <div className="text-xs text-slate-600">{item.label}</div>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                {[
                  { label: "Ziyaret Zamani", value: contentSummary.bestTimeToVisit === "Var" },
                  { label: "Saglik Gereksinimleri", value: contentSummary.healthRequirements === "Var" },
                  { label: "Gumruk Kurallari", value: contentSummary.customsRegulations === "Var" },
                  { label: "Acil Durum Bilgileri", value: contentSummary.emergencyContacts === "Var" },
                ].map((item) => (
                  <div key={item.label} className={`p-3 rounded-lg flex items-center gap-2 ${item.value ? "bg-green-50" : "bg-red-50"}`}>
                    {item.value ? <CheckCircle2 className="h-4 w-4 text-green-600" /> : <XCircle className="h-4 w-4 text-red-600" />}
                    <span className="text-sm text-slate-700">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Strengths */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <SectionHeader title="Guclu Yonler" icon={CheckCircle2} section="strengths" count={analysis.strengths.length} />
              {expandedSections.strengths && (
                <div className="p-4 space-y-2">
                  {analysis.strengths.map((strength, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                      <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-slate-700">{strength}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Missing Content */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <SectionHeader title="Eksik Icerik Onerileri" icon={AlertTriangle} section="missing" count={analysis.missingContent.length} />
              {expandedSections.missing && (
                <div className="p-4 space-y-3">
                  {analysis.missingContent.map((item, idx) => (
                    <div key={idx} className="border border-slate-200 rounded-lg p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-bold text-slate-900">{item.title}</h4>
                            <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${getPriorityBadge(item.priority)}`}>
                              {item.priority === "high" ? "Yuksek" : item.priority === "medium" ? "Orta" : "Dusuk"}
                            </span>
                          </div>
                          <p className="text-sm text-slate-600 mb-2">{item.description}</p>
                          <p className="text-xs text-purple-600"><strong>Beklenen Etki:</strong> {item.impact}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Improvements */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <SectionHeader title="Iyilestirme Onerileri" icon={Lightbulb} section="improvements" count={analysis.improvements.length} />
              {expandedSections.improvements && (
                <div className="p-4 space-y-3">
                  {analysis.improvements.map((item, idx) => (
                    <div key={idx} className="border border-slate-200 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-bold text-slate-900">{item.section}</h4>
                        <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${getPriorityBadge(item.priority)}`}>
                          {item.priority === "high" ? "Yuksek" : item.priority === "medium" ? "Orta" : "Dusuk"}
                        </span>
                      </div>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="bg-red-50 rounded-lg p-3">
                          <div className="text-xs font-semibold text-red-600 mb-1">Mevcut Durum</div>
                          <p className="text-sm text-slate-700">{item.current}</p>
                        </div>
                        <div className="bg-green-50 rounded-lg p-3">
                          <div className="text-xs font-semibold text-green-600 mb-1">Oneri</div>
                          <p className="text-sm text-slate-700">{item.suggestion}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Engagement Suggestions */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <SectionHeader title="Engagement Artirici Elementler" icon={Users} section="engagement" count={analysis.engagementSuggestions.length} />
              {expandedSections.engagement && (
                <div className="p-4 space-y-3">
                  {analysis.engagementSuggestions.map((item, idx) => (
                    <div key={idx} className="border border-slate-200 rounded-lg p-4">
                      <h4 className="font-bold text-slate-900 mb-2">{item.element}</h4>
                      <p className="text-sm text-slate-600 mb-2">{item.description}</p>
                      <p className="text-xs text-purple-600"><strong>Beklenen Etki:</strong> {item.expectedImpact}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* E-E-A-T Recommendations */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <SectionHeader title="E-E-A-T Onerileri" icon={Shield} section="eeat" count={analysis.eeatRecommendations.length} />
              {expandedSections.eeat && (
                <div className="p-4 space-y-3">
                  {analysis.eeatRecommendations.map((item, idx) => (
                    <div key={idx} className="border border-slate-200 rounded-lg p-4">
                      <h4 className="font-bold text-slate-900 mb-2">{item.aspect}</h4>
                      <p className="text-sm text-slate-600 mb-2">{item.recommendation}</p>
                      <div className="bg-blue-50 rounded-lg p-3">
                        <div className="text-xs font-semibold text-blue-600 mb-1">Nasil Uygulanir</div>
                        <p className="text-sm text-slate-700">{item.implementation}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Technical SEO */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <SectionHeader title="Teknik SEO" icon={Zap} section="technical" count={analysis.technicalSEO.length} />
              {expandedSections.technical && (
                <div className="p-4 space-y-2">
                  {analysis.technicalSEO.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-3 border border-slate-200 rounded-lg">
                      {getStatusIcon(item.status)}
                      <div className="flex-1">
                        <h4 className="font-semibold text-slate-900">{item.item}</h4>
                        <p className="text-sm text-slate-600">{item.recommendation}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Action Plan */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <SectionHeader title="Onceliklendirilmis Aksiyon Plani" icon={ListChecks} section="actionPlan" count={analysis.actionPlan.length} />
              {expandedSections.actionPlan && (
                <div className="p-4">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-slate-200">
                          <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">#</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">Aksiyon</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">Efor</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">Etki</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">Sure</th>
                        </tr>
                      </thead>
                      <tbody>
                        {analysis.actionPlan.map((item) => (
                          <tr key={item.rank} className="border-b border-slate-100 hover:bg-slate-50">
                            <td className="py-3 px-4">
                              <span className="flex items-center justify-center w-6 h-6 bg-purple-100 text-purple-700 text-sm font-bold rounded-full">
                                {item.rank}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-sm text-slate-700">{item.action}</td>
                            <td className="py-3 px-4">
                              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getEffortImpactBadge(item.effort, "effort")}`}>
                                {item.effort === "low" ? "Dusuk" : item.effort === "medium" ? "Orta" : "Yuksek"}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getEffortImpactBadge(item.impact, "impact")}`}>
                                {item.impact === "high" ? "Yuksek" : item.impact === "medium" ? "Orta" : "Dusuk"}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-sm text-slate-600">{item.timeline}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {/* Re-analyze Button */}
            <div className="flex justify-center">
              <button
                onClick={runAnalysis}
                disabled={loading}
                className="px-6 py-3 bg-slate-100 text-slate-700 font-semibold rounded-lg hover:bg-slate-200 flex items-center gap-2 transition-all"
              >
                <RefreshCw className="h-5 w-5" />
                Yeniden Analiz Et
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
