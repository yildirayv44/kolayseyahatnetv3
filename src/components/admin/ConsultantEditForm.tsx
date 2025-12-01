"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Save, ArrowLeft, Languages, Loader2 } from "lucide-react";
import Link from "next/link";

export function ConsultantEditForm({ consultant }: { consultant: any }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [translating, setTranslating] = useState(false);
  const [activeLocale, setActiveLocale] = useState<'tr' | 'en'>('tr');
  const [formData, setFormData] = useState({
    name: consultant.name || "",
    email: consultant.email || "",
    phone: consultant.phone || "",
    description: consultant.description || "",
    aboutme: consultant.aboutme || "",
    description_en: consultant.description_en || "",
    aboutme_en: consultant.aboutme_en || "",
    avatar: consultant.avatar || "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from("users")
        .update(formData)
        .eq("id", consultant.id);

      if (error) throw error;

      alert("Danışman başarıyla güncellendi!");
      router.push("/admin/danismanlar");
      router.refresh();
    } catch (error: any) {
      alert("Hata: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const translateToEnglish = async () => {
    if (!formData.description && !formData.aboutme) {
      alert("Lütfen önce Türkçe içerik girin!");
      return;
    }

    setTranslating(true);
    try {
      const fields = [
        { key: 'description', value: formData.description, targetKey: 'description_en' },
        { key: 'aboutme', value: formData.aboutme, targetKey: 'aboutme_en' },
      ];

      for (const field of fields) {
        if (!field.value) continue;

        const response = await fetch('/api/translate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: field.value,
            type: 'consultant',
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
            Ad Soyad
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-900">
              E-posta
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-900">
              Telefon
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-semibold text-slate-900">
            Kısa Açıklama {activeLocale === 'en' && '(English)'}
          </label>
          <textarea
            rows={3}
            value={activeLocale === 'tr' ? formData.description : formData.description_en}
            onChange={(e) => setFormData({ ...formData, [activeLocale === 'tr' ? 'description' : 'description_en']: e.target.value })}
            className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            placeholder={activeLocale === 'en' ? 'Enter short description...' : 'Kısa açıklama girin...'}
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-semibold text-slate-900">
            Hakkında (HTML) {activeLocale === 'en' && '(English)'}
          </label>
          <textarea
            rows={8}
            value={activeLocale === 'tr' ? formData.aboutme : formData.aboutme_en}
            onChange={(e) => setFormData({ ...formData, [activeLocale === 'tr' ? 'aboutme' : 'aboutme_en']: e.target.value })}
            className="w-full rounded-lg border border-slate-200 px-4 py-2 font-mono text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            placeholder={activeLocale === 'en' ? '<p>About me...</p>' : '<p>Hakkımda bilgisi...</p>'}
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-semibold text-slate-900">
            Avatar URL
          </label>
          <input
            type="url"
            value={formData.avatar}
            onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
            className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            placeholder="https://..."
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Link
          href="/admin/danismanlar"
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
