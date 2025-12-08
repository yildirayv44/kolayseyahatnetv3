"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Save, ArrowLeft, Languages, Loader2, ChevronDown, ChevronUp } from "lucide-react";
import Link from "next/link";
import { RichTextEditor } from "./RichTextEditor";
import { ImageUrlFixer } from "./ImageUrlFixer";
import { UnifiedAIAssistant } from "./UnifiedAIAssistant";
import { ImageUpload } from "./ImageUpload";
import { AIToolsQuickAccess } from "./AIToolsQuickAccess";
import { ArrayInput } from "./ArrayInput";
import { generateSlug } from "@/lib/helpers";

export function CountryEditForm({ country }: { country: any }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [translating, setTranslating] = useState(false);
  const [activeLocale, setActiveLocale] = useState<'tr' | 'en'>('tr');
  const [expandedSections, setExpandedSections] = useState({
    basic: true,
    seo: false,
    visa: false,
    extended: false,
    country: false,
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const [formData, setFormData] = useState({
    name: country.name || "",
    slug: country.slug || generateSlug(country.name || ""),
    title: country.title || "",
    meta_title: country.meta_title || "",
    meta_description: country.meta_description || "",
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
    // Extended fields from migration
    max_stay_duration: country.max_stay_duration || "",
    visa_fee: country.visa_fee || "",
    processing_time: country.processing_time || "",
    application_steps: country.application_steps || [],
    required_documents: country.required_documents || [],
    important_notes: country.important_notes || [],
    travel_tips: country.travel_tips || [],
    popular_cities: country.popular_cities || [],
    best_time_to_visit: country.best_time_to_visit || "",
    health_requirements: country.health_requirements || "",
    customs_regulations: country.customs_regulations || "",
    emergency_contacts: country.emergency_contacts || { embassy: "", emergencyNumber: "", police: "", ambulance: "" },
    why_kolay_seyahat: country.why_kolay_seyahat || "",
    capital: country.capital || "",
    currency: country.currency || "",
    language: country.language || "",
    timezone: country.timezone || "",
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
          <h1 className="text-2xl font-bold text-slate-900">Ülke Düzenle</h1>
        </div>
        <AIToolsQuickAccess
          currentContent={activeLocale === 'tr' ? formData.contents : formData.contents_en}
          currentTitle={formData.name}
          onOptimize={(optimizedContent) => {
            if (activeLocale === 'tr') {
              setFormData({ ...formData, contents: optimizedContent });
            } else {
              setFormData({ ...formData, contents_en: optimizedContent });
            }
          }}
          onImageGenerated={(imageUrl) => {
            setFormData({ ...formData, image_url: imageUrl });
          }}
        />
      </div>

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

      {/* Extended Fields - SEO */}
      <div className="card">
        <button
          type="button"
          onClick={() => toggleSection('seo')}
          className="flex w-full items-center justify-between"
        >
          <h3 className="text-lg font-bold text-slate-900">🔍 SEO & Meta Bilgileri</h3>
          {expandedSections.seo ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
        </button>
        
        {expandedSections.seo && (
          <div className="mt-4 space-y-4">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-900">
                Meta Description (SEO)
              </label>
              <textarea
                rows={3}
                value={formData.meta_description}
                onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })}
                className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="Google'da gösterilecek açıklama (Max 160 karakter)"
                maxLength={160}
              />
              <p className="text-xs text-slate-500">
                Mevcut: {formData.meta_description.length}/160
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Extended Fields - Visa Details */}
      <div className="card">
        <button
          type="button"
          onClick={() => toggleSection('visa')}
          className="flex w-full items-center justify-between"
        >
          <h3 className="text-lg font-bold text-slate-900">📋 Detaylı Vize Bilgileri</h3>
          {expandedSections.visa ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
        </button>
        
        {expandedSections.visa && (
          <div className="mt-4 space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-900">
                  Maksimum Kalış Süresi
                </label>
                <input
                  type="text"
                  value={formData.max_stay_duration}
                  onChange={(e) => setFormData({ ...formData, max_stay_duration: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="Örn: 90 gün"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-900">
                  Vize Ücreti
                </label>
                <input
                  type="text"
                  value={formData.visa_fee}
                  onChange={(e) => setFormData({ ...formData, visa_fee: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="Örn: 80 USD (Danışmanlık hizmet bedelleri hariçtir)"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-900">
                  İşlem Süresi (Detaylı)
                </label>
                <input
                  type="text"
                  value={formData.processing_time}
                  onChange={(e) => setFormData({ ...formData, processing_time: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="Örn: 3-5 iş günü"
                />
              </div>
            </div>

            <ArrayInput
              label="Başvuru Adımları"
              value={formData.application_steps}
              onChange={(value) => setFormData({ ...formData, application_steps: value })}
              placeholder="Örn: Adım 1: Kolay Seyahat uzman danışmanlarıyla iletişime geçin"
              helpText="Vize başvuru sürecinin adım adım açıklaması"
            />

            <ArrayInput
              label="Gerekli Belgeler (Liste)"
              value={formData.required_documents}
              onChange={(value) => setFormData({ ...formData, required_documents: value })}
              placeholder="Örn: Pasaport fotokopisi"
              helpText="Her belgeyi ayrı ayrı ekleyin"
            />

            <ArrayInput
              label="Önemli Notlar"
              value={formData.important_notes}
              onChange={(value) => setFormData({ ...formData, important_notes: value })}
              placeholder="Örn: Pasaport en az 6 ay geçerli olmalıdır"
              helpText="Başvuru sahiplerinin dikkat etmesi gereken önemli noktalar"
            />
          </div>
        )}
      </div>

      {/* Extended Fields - Travel Info */}
      <div className="card">
        <button
          type="button"
          onClick={() => toggleSection('extended')}
          className="flex w-full items-center justify-between"
        >
          <h3 className="text-lg font-bold text-slate-900">✈️ Seyahat Bilgileri</h3>
          {expandedSections.extended ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
        </button>
        
        {expandedSections.extended && (
          <div className="mt-4 space-y-4">
            <ArrayInput
              label="Seyahat İpuçları"
              value={formData.travel_tips}
              onChange={(value) => setFormData({ ...formData, travel_tips: value })}
              placeholder="Örn: Yerel para birimi kullanmak daha avantajlıdır"
              helpText="Seyahat eden kişilere faydalı ipuçları"
            />

            <ArrayInput
              label="Popüler Şehirler"
              value={formData.popular_cities}
              onChange={(value) => setFormData({ ...formData, popular_cities: value })}
              placeholder="Örn: Paris, Lyon, Nice"
              helpText="Turistlerin sıkça ziyaret ettiği şehirler"
            />

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-900">
                En İyi Ziyaret Zamanı
              </label>
              <textarea
                rows={2}
                value={formData.best_time_to_visit}
                onChange={(e) => setFormData({ ...formData, best_time_to_visit: e.target.value })}
                className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="Örn: Nisan-Ekim arası en ideal dönemdir"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-900">
                Sağlık Gereksinimleri
              </label>
              <textarea
                rows={3}
                value={formData.health_requirements}
                onChange={(e) => setFormData({ ...formData, health_requirements: e.target.value })}
                className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="Aşı gereksinimleri, sağlık sigortası vb."
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-900">
                Gümrük Kuralları
              </label>
              <textarea
                rows={3}
                value={formData.customs_regulations}
                onChange={(e) => setFormData({ ...formData, customs_regulations: e.target.value })}
                className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="Gümrükte dikkat edilmesi gerekenler"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-900">
                Neden Kolay Seyahat?
              </label>
              <textarea
                rows={3}
                value={formData.why_kolay_seyahat}
                onChange={(e) => setFormData({ ...formData, why_kolay_seyahat: e.target.value })}
                className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="Bu ülke için Kolay Seyahat ile çalışmanın avantajları"
              />
            </div>
          </div>
        )}
      </div>

      {/* Extended Fields - Country Info */}
      <div className="card">
        <button
          type="button"
          onClick={() => toggleSection('country')}
          className="flex w-full items-center justify-between"
        >
          <h3 className="text-lg font-bold text-slate-900">🌍 Ülke Bilgileri & Acil Durum</h3>
          {expandedSections.country ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
        </button>
        
        {expandedSections.country && (
          <div className="mt-4 space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-900">
                  Başkent
                </label>
                <input
                  type="text"
                  value={formData.capital}
                  onChange={(e) => setFormData({ ...formData, capital: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="Örn: Paris"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-900">
                  Para Birimi
                </label>
                <input
                  type="text"
                  value={formData.currency}
                  onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="Örn: Euro (EUR) - 1 EUR ≈ 35 TRY"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-900">
                  Resmi Dil
                </label>
                <input
                  type="text"
                  value={formData.language}
                  onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="Örn: Fransızca"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-900">
                  Saat Dilimi
                </label>
                <input
                  type="text"
                  value={formData.timezone}
                  onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="Örn: GMT+1 (Türkiye'den 2 saat geri)"
                />
              </div>
            </div>

            <div className="space-y-4 rounded-lg border-2 border-red-200 bg-red-50/50 p-4">
              <h4 className="font-semibold text-slate-900">🚨 Acil Durum İletişim Bilgileri</h4>
              
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-900">
                    Türk Elçiliği/Konsolosluğu
                  </label>
                  <input
                    type="text"
                    value={formData.emergency_contacts.embassy}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      emergency_contacts: { ...formData.emergency_contacts, embassy: e.target.value }
                    })}
                    className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder="Telefon ve adres"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-900">
                    Acil Durum Numarası
                  </label>
                  <input
                    type="text"
                    value={formData.emergency_contacts.emergencyNumber}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      emergency_contacts: { ...formData.emergency_contacts, emergencyNumber: e.target.value }
                    })}
                    className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder="Örn: 112"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-900">
                    Polis
                  </label>
                  <input
                    type="text"
                    value={formData.emergency_contacts.police}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      emergency_contacts: { ...formData.emergency_contacts, police: e.target.value }
                    })}
                    className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder="Örn: 155"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-900">
                    Ambulans
                  </label>
                  <input
                    type="text"
                    value={formData.emergency_contacts.ambulance}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      emergency_contacts: { ...formData.emergency_contacts, ambulance: e.target.value }
                    })}
                    className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder="Örn: 112"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
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
