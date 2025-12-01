"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Save, ArrowLeft, Languages, Loader2 } from "lucide-react";
import Link from "next/link";
import { RichTextEditor } from "./RichTextEditor";
import { ImageUrlFixer } from "./ImageUrlFixer";
import { AIContentGenerator } from "./AIContentGenerator";
import { ImageUpload } from "./ImageUpload";

export function BlogEditForm({ blog }: { blog: any }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [translating, setTranslating] = useState(false);
  const [activeLocale, setActiveLocale] = useState<'tr' | 'en'>('tr');
  const [formData, setFormData] = useState({
    title: blog.title || "",
    description: blog.description || "",
    contents: blog.contents || "",
    title_en: blog.title_en || "",
    description_en: blog.description_en || "",
    contents_en: blog.contents_en || "",
    image: blog.image || "",
    image_url: blog.image_url || "",
    status: blog.status || 0,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from("blogs")
        .update(formData)
        .eq("id", blog.id);

      if (error) throw error;

      alert("Blog başarıyla güncellendi!");
      router.push("/admin/bloglar");
      router.refresh();
    } catch (error: any) {
      alert("Hata: " + error.message);
    } finally {
      setLoading(false);
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
        { key: 'title', value: formData.title, targetKey: 'title_en' },
        { key: 'description', value: formData.description, targetKey: 'description_en' },
        { key: 'contents', value: formData.contents, targetKey: 'contents_en' },
      ];

      for (const field of fields) {
        if (!field.value) continue;

        const response = await fetch('/api/translate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: field.value,
            type: 'blog',
            field: field.key,
          }),
        });

        const data = await response.json();
        if (data.success) {
          setFormData(prev => ({ ...prev, [field.targetKey]: data.translated }));
        }
      }

      alert("İngilizce çeviri tamamlandı! İngilizce sekmesinden kontrol edip düzenleyebilirsiniz.");
      setActiveLocale('en');
    } catch (error: any) {
      alert("Çeviri hatası: " + error.message);
    } finally {
      setTranslating(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
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
          
          <button
            type="button"
            onClick={translateToEnglish}
            disabled={translating || activeLocale === 'en'}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-500 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
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
            onImageChange={(url) => setFormData({ ...formData, image_url: url })}
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
            Görsel URL
          </label>
          <input
            type="url"
            value={formData.image}
            onChange={(e) => setFormData({ ...formData, image: e.target.value })}
            className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            placeholder="https://..."
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
