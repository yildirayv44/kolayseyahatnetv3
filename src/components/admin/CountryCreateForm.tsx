"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Save, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { RichTextEditor } from "./RichTextEditor";
import { UnifiedAIAssistant } from "./UnifiedAIAssistant";
import { ImageUpload } from "./ImageUpload";
import { AIToolsQuickAccess } from "./AIToolsQuickAccess";
import { generateSlug } from "@/lib/helpers";

export function CountryCreateForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    title: "",
    meta_title: "",
    description: "",
    contents: "",
    req_document: "",
    price_contents: "",
    process_time: "7-14 Gün",
    visa_required: true,
    visa_type: "",
    price_range: "",
    image_url: "",
    price: "",
    original_price: "",
    discount_percentage: "",
    sorted: 0,
    status: 1,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Ülkeyi kaydet (slug hariç - o taxonomies'e gidecek)
      const { slug, ...countryData } = formData;
      const { data: country, error: countryError } = await supabase
        .from("countries")
        .insert([countryData])
        .select()
        .single();

      if (countryError) throw countryError;

      // 2. Taxonomy kaydı oluştur (slug için)
      const { error: taxonomyError } = await supabase
        .from("taxonomies")
        .insert([
          {
            model_id: country.id,
            slug: formData.slug,
            type: "Country\\CountryController@detail",
          },
        ]);

      if (taxonomyError) {
        console.error("Taxonomy error:", taxonomyError);
        // Taxonomy hatası olsa bile devam et
      }

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
      {/* Header with AI Tools Quick Access */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/ulkeler"
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Geri
          </Link>
          <h1 className="text-2xl font-bold text-slate-900">Yeni Ülke Ekle</h1>
        </div>
        <AIToolsQuickAccess
          currentContent={formData.contents}
          currentTitle={formData.name || formData.title}
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
        type="country"
        currentContent={formData.contents}
        onGenerate={(data) => {
          setFormData({
            ...formData,
            name: data.title || formData.name,
            slug: data.title ? generateSlug(data.title) : formData.slug,
            title: data.title || formData.title,
            meta_title: data.title || formData.meta_title,
            description: data.description || formData.description,
            contents: data.contents || formData.contents,
            image_url: data.image_url || formData.image_url,
          });
        }}
      />

      <div className="card">
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-slate-900">
            Ülke Adı *
          </label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => {
              const name = e.target.value;
              setFormData({ 
                ...formData, 
                name,
                slug: generateSlug(name) // Otomatik slug oluştur
              });
            }}
            className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            placeholder="Örn: Karadağ"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-semibold text-slate-900">
            URL Slug *
          </label>
          <input
            type="text"
            required
            value={formData.slug}
            onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
            className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm font-mono focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            placeholder="Örn: karadag"
          />
          <p className="text-xs text-slate-500">
            URL: /{formData.slug || "karadag"}
          </p>
        </div>

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

        <div className="space-y-2">
          <label className="block text-sm font-semibold text-slate-900">
            Sayfa Başlığı (H1)
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            placeholder="Örn: Karadağ Vizesi"
          />
          <p className="text-xs text-slate-500">
            Sayfada gösterilecek ana başlık
          </p>
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

        <ImageUpload
          currentImageUrl={formData.image_url}
          onImageChange={(url) => setFormData({ ...formData, image_url: url })}
          bucket="country-images"
          label="Ülke Kapak Fotoğrafı"
          aspectRatio="16/9"
        />

        {/* Fiyatlandırma */}
        <div className="grid grid-cols-3 gap-4 rounded-lg border border-slate-200 p-4">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-900">
              Güncel Fiyat (₺)
            </label>
            <input
              type="number"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              placeholder="6800"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-900">
              Eski Fiyat (₺)
            </label>
            <input
              type="number"
              value={formData.original_price}
              onChange={(e) => setFormData({ ...formData, original_price: e.target.value })}
              className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              placeholder="8500"
            />
            <p className="text-xs text-slate-500">Üstü çizili gösterilir</p>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-900">
              İndirim (%)
            </label>
            <input
              type="number"
              value={formData.discount_percentage}
              onChange={(e) => setFormData({ ...formData, discount_percentage: e.target.value })}
              className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              placeholder="20"
              max="100"
            />
            <p className="text-xs text-slate-500">Badge olarak gösterilir</p>
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-semibold text-slate-900">
            Ana İçerik
          </label>
          
          <RichTextEditor
            value={formData.contents}
            onChange={(value) => setFormData({ ...formData, contents: value })}
            placeholder="Ülke hakkında detaylı bilgi yazın..."
          />
        </div>

        {/* Hızlı Bilgiler */}
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
