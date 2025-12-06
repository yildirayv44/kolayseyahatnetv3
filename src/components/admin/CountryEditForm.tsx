"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Save, ArrowLeft, Languages, Loader2 } from "lucide-react";
import Link from "next/link";
import { RichTextEditor } from "./RichTextEditor";
import { ImageUrlFixer } from "./ImageUrlFixer";
import { UnifiedAIAssistant } from "./UnifiedAIAssistant";
import { ImageUpload } from "./ImageUpload";
import { generateSlug } from "@/lib/helpers";

export function CountryEditForm({ country }: { country: any }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [translating, setTranslating] = useState(false);
  const [activeLocale, setActiveLocale] = useState<'tr' | 'en'>('tr');
  const [formData, setFormData] = useState({
    name: country.name || "",
    slug: country.slug || generateSlug(country.name || ""),
    title: country.title || "",
    meta_title: country.meta_title || "",
    description: country.description || "",
    contents: country.contents || "",
    req_document: country.req_document || "",
    price_contents: country.price_contents || "",
    process_time: country.process_time || "7-14 Gün",
    visa_required: country.visa_required !== undefined ? country.visa_required : true,
    visa_type: country.visa_type || "",
    price_range: country.price_range || "",
    title_en: country.title_en || "",
    description_en: country.description_en || "",
    contents_en: country.contents_en || "",
    image_url: country.image_url || "",
    status: country.status || 0,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    console.log("🔄 Updating country:", country.id);
    console.log("📝 Form data:", formData);

    try {
      // Use API route to bypass RLS
      const response = await fetch(`/api/admin/countries/${country.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      console.log("✅ Update result:", result);

      if (!response.ok) {
        throw new Error(result.error || "Güncelleme başarısız");
      }

      alert("Ülke başarıyla güncellendi!");
      router.push("/admin/ulkeler");
      router.refresh();
    } catch (error: any) {
      console.error("❌ Update error:", error);
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
            type: 'country',
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
      {/* Unified AI Assistant */}
      {activeLocale === 'tr' && (
        <UnifiedAIAssistant
          type="country"
          countryName={formData.name}
          currentContent={formData.contents}
          onGenerate={(data) => {
            setFormData({
              ...formData,
              title: data.title || formData.title,
              meta_title: data.title || formData.meta_title,
              description: data.description || formData.description,
              contents: data.contents || formData.contents,
              image_url: data.image_url || formData.image_url,
            });
          }}
        />
      )}

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
            Ülke Adı
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => {
              const name = e.target.value;
              setFormData({ 
                ...formData, 
                name,
                slug: generateSlug(name) // Otomatik slug güncelle
              });
            }}
            required
            className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-semibold text-slate-900">
            URL Slug
          </label>
          <input
            type="text"
            value={formData.slug}
            onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
            required
            className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm font-mono focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          <p className="text-xs text-slate-500">
            URL: /{formData.slug}
          </p>
        </div>

        {activeLocale === 'tr' && (
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-900">
              Meta Başlık (SEO Title)
            </label>
            <input
              type="text"
              value={formData.meta_title}
              onChange={(e) => setFormData({ ...formData, meta_title: e.target.value })}
              className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              placeholder="Örn: Karadağ Vizesi Başvurusu | Kolay Seyahat"
              maxLength={60}
            />
            <p className="text-xs text-slate-500">
              Google'da gösterilecek başlık (Max 60 karakter) • Mevcut: {formData.meta_title.length}/60
            </p>
          </div>
        )}

        <div className="space-y-2">
          <label className="block text-sm font-semibold text-slate-900">
            Sayfa Başlığı (H1) {activeLocale === 'en' && '(English)'}
          </label>
          <input
            type="text"
            value={activeLocale === 'tr' ? formData.title : formData.title_en}
            onChange={(e) => setFormData({ ...formData, [activeLocale === 'tr' ? 'title' : 'title_en']: e.target.value })}
            className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            placeholder={activeLocale === 'en' ? 'Enter English title...' : 'Başlık girin...'}
          />
          <p className="text-xs text-slate-500">
            Sayfada gösterilecek ana başlık
          </p>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-semibold text-slate-900">
            Açıklama {activeLocale === 'en' && '(English)'}
          </label>
          <textarea
            rows={4}
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
            bucket="country-images"
            label="Ülke Kapak Fotoğrafı"
            aspectRatio="16/9"
          />
        )}

        <div className="space-y-2">
          <label className="block text-sm font-semibold text-slate-900">
            Ana İçerik {activeLocale === 'en' && '(English)'}
          </label>
          
          {activeLocale === 'tr' && (
            <>
              <ImageUrlFixer
                content={formData.contents}
                onFix={(fixedContent) => setFormData({ ...formData, contents: fixedContent })}
              />
            </>
          )}
          
          <RichTextEditor
            value={activeLocale === 'tr' ? formData.contents : formData.contents_en}
            onChange={(value) => setFormData({ ...formData, [activeLocale === 'tr' ? 'contents' : 'contents_en']: value })}
            placeholder={activeLocale === 'en' ? 'Write detailed information about the country...' : 'Ülke hakkında detaylı bilgi yazın...'}
          />
        </div>

        {activeLocale === 'tr' && (
          <>
            <div className="space-y-4 rounded-lg border-2 border-blue-200 bg-blue-50/50 p-6">
              <h3 className="text-lg font-bold text-slate-900">📊 Hızlı Bilgiler</h3>
              <p className="text-sm text-slate-600">
                Ülke detay sayfasında gösterilecek temel bilgiler
              </p>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-900">
                    İşlem Süresi
                  </label>
                  <input
                    type="text"
                    value={formData.process_time}
                    onChange={(e) => setFormData({ ...formData, process_time: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder="Örn: 7-14 Gün"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-900">
                    Vize Gerekli mi?
                  </label>
                  <select
                    value={formData.visa_required ? "true" : "false"}
                    onChange={(e) => setFormData({ ...formData, visa_required: e.target.value === "true" })}
                    className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="true">Evet</option>
                    <option value="false">Hayır (Vizesiz)</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-900">
                    Vize Türü
                  </label>
                  <input
                    type="text"
                    value={formData.visa_type}
                    onChange={(e) => setFormData({ ...formData, visa_type: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder="Örn: E-vize, Kapıda Vize, Klasik Vize"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-900">
                    Ücret Aralığı
                  </label>
                  <input
                    type="text"
                    value={formData.price_range}
                    onChange={(e) => setFormData({ ...formData, price_range: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder="Örn: 400 USD - 1.200 USD"
                  />
                </div>
              </div>
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
          </>
        )}

        <div className="space-y-2">
          <label className="block text-sm font-semibold text-slate-900">
            Durum
          </label>
          <select
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: parseInt(e.target.value) })}
            className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value={0}>Pasif</option>
            <option value={1}>Aktif</option>
          </select>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Link
          href="/admin/ulkeler"
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
