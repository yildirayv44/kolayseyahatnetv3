"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Save, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { RichTextEditor } from "./RichTextEditor";
import { AIContentGenerator } from "./AIContentGenerator";

export function CountryCreateForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    title: "",
    description: "",
    contents: "",
    req_document: "",
    price_contents: "",
    status: 1,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from("countries")
        .insert([formData])
        .select()
        .single();

      if (error) throw error;

      alert("Ülke başarıyla eklendi!");
      router.push("/admin/ulkeler");
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
            Ülke Adı *
          </label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            placeholder="Örn: Amerika Birleşik Devletleri"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-semibold text-slate-900">
            Sayfa Başlığı
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            placeholder="Örn: Amerika Vizesi - Kolay Seyahat"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-semibold text-slate-900">
            Kısa Açıklama
          </label>
          <textarea
            rows={4}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            placeholder="SEO için kısa açıklama (meta description)"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-semibold text-slate-900">
            Ana İçerik
          </label>
          
          <AIContentGenerator
            type="country"
            currentContent={formData.contents}
            countryName={formData.name}
            onGenerate={(content) => setFormData({ ...formData, contents: content })}
          />
          
          <RichTextEditor
            value={formData.contents}
            onChange={(value) => setFormData({ ...formData, contents: value })}
            placeholder="Ülke hakkında detaylı bilgi yazın..."
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-semibold text-slate-900">
            Gerekli Belgeler
          </label>
          <RichTextEditor
            value={formData.req_document}
            onChange={(value) => setFormData({ ...formData, req_document: value })}
            placeholder="Vize başvurusu için gerekli belgeler..."
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-semibold text-slate-900">
            Vize Ücretleri
          </label>
          <RichTextEditor
            value={formData.price_contents}
            onChange={(value) => setFormData({ ...formData, price_contents: value })}
            placeholder="Vize ücretleri ve ödeme detayları..."
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
            <option value={1}>Aktif</option>
            <option value={0}>Pasif</option>
          </select>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <Link
          href="/admin/ulkeler"
          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          <ArrowLeft className="h-4 w-4" />
          İptal
        </Link>

        <button
          type="submit"
          disabled={loading || !formData.name.trim()}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-2 text-sm font-semibold text-white hover:bg-primary/90 disabled:opacity-50"
        >
          <Save className="h-4 w-4" />
          {loading ? "Kaydediliyor..." : "Kaydet"}
        </button>
      </div>
    </form>
  );
}
