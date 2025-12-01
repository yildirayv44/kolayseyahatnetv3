"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Save, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { RichTextEditor } from "./RichTextEditor";
import { AIContentGenerator } from "./AIContentGenerator";
import { ImageUpload } from "./ImageUpload";

export function BlogCreateForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    contents: "",
    image: "",
    image_url: "",
    sorted: 0,
    status: 1,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from("blogs")
        .insert([formData])
        .select()
        .single();

      if (error) throw error;

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
          
          <AIContentGenerator
            type="blog"
            currentContent={formData.contents}
            onGenerate={(content) => setFormData({ ...formData, contents: content })}
          />
          
          <RichTextEditor
            value={formData.contents}
            onChange={(value) => setFormData({ ...formData, contents: value })}
            placeholder="Blog yazınızı buraya yazın..."
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
