"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save, ArrowLeft, Sparkles, Search, CheckCircle, Languages, Loader2 } from "lucide-react";
import Link from "next/link";
import { RichTextEditor } from "./RichTextEditor";
import { UnifiedAIAssistant } from "./UnifiedAIAssistant";
import { ImageUpload } from "./ImageUpload";
import { AIToolsQuickAccess } from "./AIToolsQuickAccess";

export function BlogCreateForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [analyzingSEO, setAnalyzingSEO] = useState(false);
  const [analyzingQuality, setAnalyzingQuality] = useState(false);
  const [seoScore, setSeoScore] = useState<number | null>(null);
  const [qualityScore, setQualityScore] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    contents: "",
    image: "",
    image_url: "",
    sorted: 0,
    status: 1,
  });

  const generateBlogContent = async () => {
    if (!formData.title) {
      alert("Lütfen önce başlık girin!");
      return;
    }

    if (!confirm(`"${formData.title}" başlığı için AI ile blog içeriği oluşturulsun mu?`)) {
      return;
    }

    setGenerating(true);
    try {
      const response = await fetch('/api/admin/content/generate-blog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          keywords: [],
          tone: 'informative',
          language: 'tr',
        }),
      });

      const data = await response.json();
      if (data.success) {
        setFormData(prev => ({
          ...prev,
          contents: data.content,
          description: data.meta_description || prev.description,
        }));
        alert(`✅ Blog içeriği oluşturuldu!\n📝 ${data.word_count} kelime\n⏱️ ${data.reading_time} dakika okuma süresi`);
      } else {
        alert("Hata: " + data.error);
      }
    } catch (error: any) {
      alert("İçerik oluşturma hatası: " + error.message);
    } finally {
      setGenerating(false);
    }
  };

  const analyzeSEO = async () => {
    if (!formData.title || !formData.contents) {
      alert("Lütfen başlık ve içerik girin!");
      return;
    }

    setAnalyzingSEO(true);
    try {
      const response = await fetch('/api/admin/content/optimize-seo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          content: formData.contents,
          meta_title: formData.title,
          meta_description: formData.description,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setSeoScore(data.score);

        let message = `📊 SEO Skoru: ${data.score}/100\n\n`;

        if (data.meta_title) {
          message += `📝 Meta Title: ${data.meta_title.status === 'good' ? '✅' : '⚠️'} ${data.meta_title.length} karakter\n`;
          if (data.meta_title.suggestion) message += `   💡 ${data.meta_title.suggestion}\n`;
        }

        if (data.content) {
          message += `\n📄 İçerik: ${data.content.status === 'good' ? '✅' : '⚠️'} ${data.content.word_count} kelime\n`;
          if (data.content.suggestion) message += `   💡 ${data.content.suggestion}\n`;
        }

        if (data.improvements && data.improvements.length > 0) {
          message += `\n🔧 İyileştirmeler:\n`;
          data.improvements.forEach((imp: string) => {
            message += `   • ${imp}\n`;
          });
        }

        alert(message);
      } else {
        alert("Hata: " + data.error);
      }
    } catch (error: any) {
      alert("SEO analizi hatası: " + error.message);
    } finally {
      setAnalyzingSEO(false);
    }
  };

  const analyzeQuality = async () => {
    if (!formData.title || !formData.contents) {
      alert("Lütfen başlık ve içerik girin!");
      return;
    }

    setAnalyzingQuality(true);
    try {
      const response = await fetch('/api/admin/content/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          content: formData.contents,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setQualityScore(data.overall_score);

        let message = `📊 Kalite Skoru: ${data.overall_score}/100\n\n`;

        if (data.grammar) {
          message += `✍️ Gramer: ${data.grammar.score}/100 (${data.grammar.status})\n`;
          if (data.grammar.errors && data.grammar.errors.length > 0) {
            message += `   ⚠️ ${data.grammar.errors.length} hata bulundu\n`;
          }
        }

        if (data.spelling) {
          message += `📝 Yazım: ${data.spelling.score}/100 (${data.spelling.status})\n`;
          if (data.spelling.errors && data.spelling.errors.length > 0) {
            message += `   ⚠️ ${data.spelling.errors.length} hata bulundu\n`;
          }
        }

        if (data.readability) {
          message += `📖 Okunabilirlik: ${data.readability.score}/100 (${data.readability.status})\n`;
        }

        if (data.suggestions && data.suggestions.length > 0) {
          message += `\n💡 Öneriler:\n`;
          data.suggestions.slice(0, 5).forEach((sug: string) => {
            message += `   • ${sug}\n`;
          });
        }

        if (data.strengths && data.strengths.length > 0) {
          message += `\n✨ Güçlü Yönler:\n`;
          data.strengths.slice(0, 3).forEach((str: string) => {
            message += `   • ${str}\n`;
          });
        }

        alert(message);
      } else {
        alert("Hata: " + data.error);
      }
    } catch (error: any) {
      alert("Kalite analizi hatası: " + error.message);
    } finally {
      setAnalyzingQuality(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/admin/blogs/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || result.details || 'Bilinmeyen hata');
      }

      alert("Blog yazısı başarıyla eklendi!");
      router.push("/admin/bloglar");
      router.refresh();
    } catch (error: any) {
      console.error("Create error:", error);
      alert("Hata: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header with AI Tools Quick Access */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/bloglar"
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Geri
          </Link>
          <h1 className="text-2xl font-bold text-slate-900">Yeni Blog Yazısı</h1>
        </div>
        <AIToolsQuickAccess
          currentContent={formData.contents}
          currentTitle={formData.title}
          onOptimize={(optimizedContent) => {
            setFormData({ ...formData, contents: optimizedContent });
          }}
          onImageGenerated={(imageUrl) => {
            setFormData({ ...formData, image_url: imageUrl });
          }}
        />
      </div>

      {/* Unified AI Assistant */}
      <UnifiedAIAssistant
        type="blog"
        currentContent={formData.contents}
        onGenerate={(data) => {
          setFormData({
            ...formData,
            title: data.title || formData.title,
            description: data.description || formData.description,
            contents: data.contents || formData.contents,
            image_url: data.image_url || formData.image_url,
          });
        }}
      />

      {/* AI Tools Bar */}
      <div className="card bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-600" />
            <h3 className="font-semibold text-slate-900">AI Asistan Araçları</h3>
          </div>
          <div className="flex items-center gap-2">
            {seoScore !== null && (
              <span className={`text-sm font-semibold px-3 py-1 rounded-full ${seoScore >= 80 ? 'bg-green-100 text-green-700' :
                seoScore >= 60 ? 'bg-yellow-100 text-yellow-700' :
                  'bg-red-100 text-red-700'
                }`}>
                SEO: {seoScore}/100
              </span>
            )}
            {qualityScore !== null && (
              <span className={`text-sm font-semibold px-3 py-1 rounded-full ${qualityScore >= 80 ? 'bg-green-100 text-green-700' :
                qualityScore >= 60 ? 'bg-yellow-100 text-yellow-700' :
                  'bg-red-100 text-red-700'
                }`}>
                Kalite: {qualityScore}/100
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <button
            type="button"
            onClick={generateBlogContent}
            disabled={generating || !formData.title}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-purple-600 px-4 py-3 text-sm font-semibold text-white hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {generating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Oluşturuluyor...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                İçerik Oluştur
              </>
            )}
          </button>

          <button
            type="button"
            onClick={analyzeSEO}
            disabled={analyzingSEO || !formData.title || !formData.contents}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {analyzingSEO ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Analiz ediliyor...
              </>
            ) : (
              <>
                <Search className="h-4 w-4" />
                SEO Analizi
              </>
            )}
          </button>

          <button
            type="button"
            onClick={analyzeQuality}
            disabled={analyzingQuality || !formData.title || !formData.contents}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-3 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {analyzingQuality ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Analiz ediliyor...
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4" />
                Kalite Kontrolü
              </>
            )}
          </button>
        </div>
      </div>

      <div className="card">
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-slate-900">
            Başlık *
          </label>
          <input
            type="text"
            required
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            placeholder="Örn: Schengen Vizesi Başvuru İpuçları"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-semibold text-slate-900">
            Kısa Açıklama
          </label>
          <textarea
            rows={3}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            placeholder="Blog yazısının özeti"
          />
        </div>

        <ImageUpload
          currentImageUrl={formData.image_url}
          onImageChange={(url) => setFormData({ ...formData, image_url: url })}
          bucket="blog-images"
          label="Blog Kapak Fotoğrafı"
          aspectRatio="21/9"
        />

        <div className="space-y-2">
          <label className="block text-sm font-semibold text-slate-900">
            İçerik
          </label>

          <RichTextEditor
            value={formData.contents}
            onChange={(value) => setFormData({ ...formData, contents: value })}
            placeholder="Blog yazınızı buraya yazın..."
            onCoverImageChange={(url) => setFormData({ ...formData, image_url: url })}
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-semibold text-slate-900">
            Görsel URL
          </label>
          <input
            type="url"
            value={formData.image}
            onChange={(e) => setFormData({ ...formData, image: e.target.value })}
            className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            placeholder="https://example.com/image.jpg"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-semibold text-slate-900">
            Durum
          </label>
          <select
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: parseInt(e.target.value) })}
            className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value={1}>Yayında</option>
            <option value={0}>Taslak</option>
          </select>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <Link
          href="/admin/bloglar"
          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          <ArrowLeft className="h-4 w-4" />
          İptal
        </Link>

        <button
          type="submit"
          disabled={loading || !formData.title.trim()}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-2 text-sm font-semibold text-white hover:bg-primary/90 disabled:opacity-50"
        >
          <Save className="h-4 w-4" />
          {loading ? "Kaydediliyor..." : "Yayınla"}
        </button>
      </div>
    </form>
  );
}
