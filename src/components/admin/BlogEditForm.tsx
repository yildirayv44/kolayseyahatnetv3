"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Save, ArrowLeft, Languages, Loader2, Sparkles, Search, CheckCircle } from "lucide-react";
import Link from "next/link";
import { RichTextEditor } from "./RichTextEditor";
import { ImageUrlFixer } from "./ImageUrlFixer";
import { AIContentGenerator } from "./AIContentGenerator";
import { AdvancedAIGenerator } from "./AdvancedAIGenerator";
import { ImageUpload } from "./ImageUpload";

export function BlogEditForm({ blog }: { blog: any }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [translating, setTranslating] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [analyzingSEO, setAnalyzingSEO] = useState(false);
  const [analyzingQuality, setAnalyzingQuality] = useState(false);
  const [seoScore, setSeoScore] = useState<number | null>(null);
  const [qualityScore, setQualityScore] = useState<number | null>(null);
  const [activeLocale, setActiveLocale] = useState<'tr' | 'en'>('tr');
  const [formData, setFormData] = useState({
    title: blog.title || "",
    description: blog.description || "",
    contents: blog.contents || "",
    title_en: blog.title_en || "",
    description_en: blog.description_en || "",
    contents_en: blog.contents_en || "",
    image_url: blog.image_url || "",
    status: blog.status || 0,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    console.log('💾 Saving blog with formData:', formData);
    console.log('🖼️ Image URL being saved:', formData.image_url);

    try {
      const { error } = await supabase
        .from("blogs")
        .update(formData)
        .eq("id", blog.id);

      if (error) {
        console.error('❌ Supabase error:', error);
        throw error;
      }

      console.log('✅ Blog saved successfully!');
      alert("Blog başarıyla güncellendi!");
      router.push("/admin/bloglar");
      router.refresh();
    } catch (error: any) {
      console.error('❌ Save error:', error);
      alert("Hata: " + error.message);
    } finally {
      setLoading(false);
    }
  };

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

  const translateToEnglish = async () => {
    if (!formData.title && !formData.description && !formData.contents) {
      alert("Lütfen önce Türkçe içerik girin!");
      return;
    }

    setTranslating(true);
    try {
      const fields = [
        { key: 'title', value: formData.title, targetKey: 'title_en', type: 'title' },
        { key: 'description', value: formData.description, targetKey: 'description_en', type: 'description' },
        { key: 'contents', value: formData.contents, targetKey: 'contents_en', type: 'content' },
      ];

      for (const field of fields) {
        if (!field.value) continue;

        const response = await fetch('/api/admin/content/translate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: field.value,
            from: 'tr',
            to: 'en',
            type: field.type,
          }),
        });

        const data = await response.json();
        if (data.success) {
          setFormData(prev => ({ ...prev, [field.targetKey]: data.translated_text }));
        }
      }

      alert("✅ İngilizce çeviri tamamlandı! İngilizce sekmesinden kontrol edip düzenleyebilirsiniz.");
      setActiveLocale('en');
    } catch (error: any) {
      alert("Çeviri hatası: " + error.message);
    } finally {
      setTranslating(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Advanced AI Generator */}
      {activeLocale === 'tr' && (
        <AdvancedAIGenerator
          type="blog"
          initialTopic={formData.title}
          onGenerate={(data) => {
            setFormData({
              ...formData,
              title: data.title || formData.title,
              description: data.description || formData.description,
              contents: data.contents,
              image_url: data.image_url || formData.image_url,
            });
          }}
        />
      )}

      {/* AI Tools Bar */}
      {activeLocale === 'tr' && (
        <div className="card bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-600" />
              <h3 className="font-semibold text-slate-900">AI Asistan Araçları</h3>
            </div>
            <div className="flex items-center gap-2">
              {seoScore !== null && (
                <span className={`text-sm font-semibold px-3 py-1 rounded-full ${
                  seoScore >= 80 ? 'bg-green-100 text-green-700' :
                  seoScore >= 60 ? 'bg-yellow-100 text-yellow-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  SEO: {seoScore}/100
                </span>
              )}
              {qualityScore !== null && (
                <span className={`text-sm font-semibold px-3 py-1 rounded-full ${
                  qualityScore >= 80 ? 'bg-green-100 text-green-700' :
                  qualityScore >= 60 ? 'bg-yellow-100 text-yellow-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  Kalite: {qualityScore}/100
                </span>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
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

            <button
              type="button"
              onClick={translateToEnglish}
              disabled={translating}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-3 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {translating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Çevriliyor...
                </>
              ) : (
                <>
                  <Languages className="h-4 w-4" />
                  İngilizce'ye Çevir
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Language Tabs */}
      <div className="card">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setActiveLocale('tr')}
              className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${
                activeLocale === 'tr'
                  ? 'bg-primary text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              🇹🇷 Türkçe
            </button>
            <button
              type="button"
              onClick={() => setActiveLocale('en')}
              className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${
                activeLocale === 'en'
                  ? 'bg-primary text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              🇬🇧 English
            </button>
          </div>
        </div>
      </div>
      <div className="card space-y-6">
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-slate-900">
            Başlık {activeLocale === 'en' && '(English)'}
          </label>
          <input
            type="text"
            value={activeLocale === 'tr' ? formData.title : formData.title_en}
            onChange={(e) => setFormData({ ...formData, [activeLocale === 'tr' ? 'title' : 'title_en']: e.target.value })}
            required={activeLocale === 'tr'}
            className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            placeholder={activeLocale === 'en' ? 'Enter English title...' : 'Başlık girin...'}
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-semibold text-slate-900">
            Açıklama {activeLocale === 'en' && '(English)'}
          </label>
          <textarea
            rows={3}
            value={activeLocale === 'tr' ? formData.description : formData.description_en}
            onChange={(e) => setFormData({ ...formData, [activeLocale === 'tr' ? 'description' : 'description_en']: e.target.value })}
            className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            placeholder={activeLocale === 'en' ? 'Enter English description...' : 'Açıklama girin...'}
          />
        </div>

        {/* Image Upload - Only show in Turkish tab */}
        {activeLocale === 'tr' && (
          <ImageUpload
            currentImageUrl={formData.image_url}
            onImageChange={(url) => {
              console.log('📸 Blog image changed to:', url);
              setFormData({ ...formData, image_url: url });
              console.log('📝 FormData updated, new image_url:', url);
            }}
            bucket="blog-images"
            label="Blog Kapak Fotoğrafı"
            aspectRatio="21/9"
          />
        )}

        <div className="space-y-2">
          <label className="block text-sm font-semibold text-slate-900">
            İçerik {activeLocale === 'en' && '(English)'}
          </label>
          
          {activeLocale === 'tr' && (
            <>
              <AIContentGenerator
                type="blog"
                currentContent={formData.contents}
                onGenerate={(content) => setFormData({ ...formData, contents: content })}
              />
              
              <ImageUrlFixer
                content={formData.contents}
                onFix={(fixedContent) => setFormData({ ...formData, contents: fixedContent })}
              />
            </>
          )}
          
          <RichTextEditor
            value={activeLocale === 'tr' ? formData.contents : formData.contents_en}
            onChange={(value) => setFormData({ ...formData, [activeLocale === 'tr' ? 'contents' : 'contents_en']: value })}
            placeholder={activeLocale === 'en' ? 'Write your blog post here...' : 'Blog yazınızı buraya yazın...'}
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
            <option value={0}>Taslak</option>
            <option value={1}>Yayında</option>
          </select>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Link
          href="/admin/bloglar"
          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          <ArrowLeft className="h-4 w-4" />
          Geri
        </Link>
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:bg-primary-dark disabled:opacity-50"
        >
          <Save className="h-4 w-4" />
          {loading ? "Kaydediliyor..." : "Kaydet"}
        </button>
      </div>
    </form>
  );
}
