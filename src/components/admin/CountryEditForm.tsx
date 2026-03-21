"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Save, ArrowLeft, Languages, Loader2, ChevronDown, ChevronUp, Sparkles } from "lucide-react";
import Link from "next/link";
import { RichTextEditor } from "./RichTextEditor";
import { ImageUrlFixer } from "./ImageUrlFixer";
import { UnifiedAIAssistant } from "./UnifiedAIAssistant";
import { ImageUpload } from "./ImageUpload";
import { AIToolsQuickAccess } from "./AIToolsQuickAccess";
import { ArrayInput } from "./ArrayInput";
import { AIRegenerateModal } from "./AIRegenerateModal";
import { SourceUrlManager } from "./SourceUrlManager";
import { generateSlug } from "@/lib/helpers";
import { getCountryCode, getAllCountryCodes } from "@/lib/country-codes";

export function CountryEditForm({ country }: { country: any }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [translating, setTranslating] = useState(false);
  const [showRegenerateModal, setShowRegenerateModal] = useState(false);
  const [activeLocale, setActiveLocale] = useState<'tr' | 'en'>('tr');
  const [visaRequirementPreview, setVisaRequirementPreview] = useState<any>(null);
  const [expandedSections, setExpandedSections] = useState({
    basic: true,
    seo: false,
    visa: false,
    extended: false,
    country: false,
    bilateral: false,
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const [formData, setFormData] = useState({
    name: country.name || "",
    slug: country.slug || generateSlug(country.name || ""),
    country_code: country.country_code || "",
    title: country.title || "",
    meta_title: country.meta_title || "",
    meta_description: country.meta_description || "",
    description: country.description || "",
    contents: country.contents || "",
    req_document: country.req_document || "",
    price_contents: country.price_contents || "",
    process_time: country.process_time || "7-14 Gün",
    title_en: country.title_en || "",
    description_en: country.description_en || "",
    contents_en: country.contents_en || "",
    image_url: country.image_url || "",
    status: country.status || 0,
    // Extended fields from migration
    max_stay_duration: country.max_stay_duration || "",
    visa_fee: country.visa_fee || "",
    processing_time: country.processing_time || "",
    application_steps: Array.isArray(country.application_steps) ? country.application_steps : [],
    required_documents: Array.isArray(country.required_documents) ? country.required_documents : [],
    required_documents_en: Array.isArray(country.required_documents_en) ? country.required_documents_en : [],
    important_notes: Array.isArray(country.important_notes) ? country.important_notes : [],
    important_notes_en: Array.isArray(country.important_notes_en) ? country.important_notes_en : [],
    travel_tips: Array.isArray(country.travel_tips) ? country.travel_tips : [],
    travel_tips_en: Array.isArray(country.travel_tips_en) ? country.travel_tips_en : [],
    popular_cities: Array.isArray(country.popular_cities) ? country.popular_cities : [],
    popular_cities_en: Array.isArray(country.popular_cities_en) ? country.popular_cities_en : [],
    application_steps_en: Array.isArray(country.application_steps_en) ? country.application_steps_en : [],
    best_time_to_visit: country.best_time_to_visit || "",
    health_requirements: country.health_requirements || "",
    customs_regulations: country.customs_regulations || "",
    emergency_contacts: country.emergency_contacts || { embassy: "", emergencyNumber: "", police: "", ambulance: "" },
    why_kolay_seyahat: country.why_kolay_seyahat || "",
    capital: country.capital || "",
    currency: country.currency || "",
    language: country.language || "",
    timezone: country.timezone || "",
    // Source URL fields
    source_urls: Array.isArray(country.source_urls) ? country.source_urls : [],
  });

  // Load visa requirements on mount
  useEffect(() => {
    console.log('🏞️ Country Edit Form - Initial country data:', {
      id: country.id,
      name: country.name,
      country_code: country.country_code,
      image_url: country.image_url,
    });
    
    // Load visa requirements if country_code exists
    if (formData.country_code) {
      fetch(`/api/admin/visa-requirements/fetch-passportindex`)
        .then(res => res.json())
        .then(data => {
          const visaReq = data.data?.find((v: any) => v.countryCode === formData.country_code);
          if (visaReq) {
            setVisaRequirementPreview(visaReq);
          }
        })
        .catch(console.error);
    }
  }, []);

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
      // Text fields to translate
      const textFields = [
        { key: 'title', value: formData.title, targetKey: 'title_en' },
        { key: 'description', value: formData.description, targetKey: 'description_en' },
        { key: 'contents', value: formData.contents, targetKey: 'contents_en' },
        { key: 'meta_title', value: formData.meta_title, targetKey: 'meta_title_en' },
        { key: 'meta_description', value: formData.meta_description, targetKey: 'meta_description_en' },
        { key: 'best_time_to_visit', value: formData.best_time_to_visit, targetKey: 'best_time_to_visit_en' },
        { key: 'health_requirements', value: formData.health_requirements, targetKey: 'health_requirements_en' },
        { key: 'customs_regulations', value: formData.customs_regulations, targetKey: 'customs_regulations_en' },
        { key: 'why_kolay_seyahat', value: formData.why_kolay_seyahat, targetKey: 'why_kolay_seyahat_en' },
      ];

      for (const field of textFields) {
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

      // JSON array fields to translate via dedicated API
      const jsonArrayFields = [
        { key: 'travel_tips', value: formData.travel_tips, targetKey: 'travel_tips_en' },
        { key: 'application_steps', value: formData.application_steps, targetKey: 'application_steps_en' },
        { key: 'important_notes', value: formData.important_notes, targetKey: 'important_notes_en' },
        { key: 'popular_cities', value: formData.popular_cities, targetKey: 'popular_cities_en' },
        { key: 'required_documents', value: formData.required_documents, targetKey: 'required_documents_en' },
      ];

      // Collect all translations first, then update formData once
      const translatedFields: Record<string, string[]> = {};
      
      for (const field of jsonArrayFields) {
        if (!field.value || field.value.length === 0) {
          console.log(`⏭️ Skipping ${field.key} - empty or no value`);
          continue;
        }

        console.log(`🔄 Translating ${field.key}:`, field.value);

        const response = await fetch('/api/admin/content/translate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: JSON.stringify(field.value),
            from: 'tr',
            to: 'en',
            type: 'content',
          }),
        });

        const data = await response.json();
        console.log(`📥 Response for ${field.key}:`, data);
        
        if (data.success) {
          try {
            const translated = JSON.parse(data.translated_text);
            console.log(`✅ Parsed ${field.targetKey}:`, translated);
            translatedFields[field.targetKey] = translated;
          } catch (parseError) {
            console.error(`❌ Parse error for ${field.key}:`, parseError, data.translated_text);
            // Try to use as-is if it's already an array
            if (Array.isArray(data.translated_text)) {
              translatedFields[field.targetKey] = data.translated_text;
            }
          }
        } else {
          console.error(`❌ Translation failed for ${field.key}:`, data.error);
        }
      }

      // Update formData with all translated fields at once
      console.log("🎯 All translated fields:", translatedFields);
      setFormData(prev => ({ ...prev, ...translatedFields }));
      
      alert("İngilizce çeviri tamamlandı! Lütfen 'Kaydet' butonuna basarak değişiklikleri kaydedin.");
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
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setShowRegenerateModal(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 px-4 py-2 text-sm font-semibold text-white hover:from-purple-700 hover:to-blue-700"
          >
            <Sparkles className="h-4 w-4" />
            AI ile Yenile
          </button>
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

      {/* Source URL Manager - AI ile kaynak analizi */}
      <SourceUrlManager
        countryId={country.id}
        countryName={formData.name}
        initialSourceUrls={formData.source_urls}
        lastSourceCheck={country.last_source_check}
        sourceCheckNotes={country.source_check_notes}
        onSourceUrlsChange={(urls) => setFormData({ ...formData, source_urls: urls })}
      />

      {/* Language Selector & Translation */}
      <div className="rounded-lg border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h3 className="mb-2 text-lg font-bold text-slate-900">🌍 Dil Seçimi</h3>
            <p className="mb-4 text-sm text-slate-600">
              {activeLocale === 'tr' 
                ? 'Şu anda Türkçe içeriği düzenliyorsunuz' 
                : 'Şu anda İngilizce içeriği düzenliyorsunuz'}
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setActiveLocale('tr')}
                className={`flex items-center gap-2 rounded-lg px-6 py-3 font-semibold transition-all ${
                  activeLocale === 'tr'
                    ? 'bg-primary text-white shadow-lg scale-105'
                    : 'bg-white text-slate-700 border-2 border-slate-200 hover:border-primary'
                }`}
              >
                <span className="text-2xl">🇹🇷</span>
                <div className="text-left">
                  <div className="text-sm">Türkçe</div>
                  {activeLocale === 'tr' && (
                    <div className="text-xs opacity-90">✓ Aktif</div>
                  )}
                </div>
              </button>
              <button
                type="button"
                onClick={() => setActiveLocale('en')}
                className={`flex items-center gap-2 rounded-lg px-6 py-3 font-semibold transition-all ${
                  activeLocale === 'en'
                    ? 'bg-primary text-white shadow-lg scale-105'
                    : 'bg-white text-slate-700 border-2 border-slate-200 hover:border-primary'
                }`}
              >
                <span className="text-2xl">🇬🇧</span>
                <div className="text-left">
                  <div className="text-sm">English</div>
                  {activeLocale === 'en' && (
                    <div className="text-xs opacity-90">✓ Active</div>
                  )}
                  {!formData.title_en && activeLocale !== 'en' && (
                    <div className="text-xs text-amber-600">⚠️ Boş</div>
                  )}
                </div>
              </button>
            </div>
          </div>
          
          {activeLocale === 'tr' && (
            <div className={`ml-6 rounded-lg border-2 ${formData.title_en ? 'border-green-300' : 'border-blue-300'} bg-white p-4`}>
              <div className="mb-2 text-sm font-semibold text-blue-900">
                🌍 {formData.title_en ? 'İngilizce Çeviri Mevcut' : 'İngilizce Çeviri Yok'}
              </div>
              <p className="mb-3 text-xs text-blue-700">
                {formData.title_en 
                  ? 'Türkçe içeriği tekrar çevirmek için butona tıklayın' 
                  : 'Türkçe içeriği otomatik olarak İngilizce\'ye çevirebilirsiniz'}
              </p>
              <button
                type="button"
                onClick={translateToEnglish}
                disabled={translating}
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {translating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Çevriliyor...
                  </>
                ) : (
                  <>
                    <Languages className="h-4 w-4" />
                    {formData.title_en ? 'Tekrar Çevir' : 'İngilizce\'ye Çevir'}
                  </>
                )}
              </button>
            </div>
          )}
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
              const autoCode = getCountryCode(name);
              
              setFormData({ 
                ...formData, 
                name,
                slug: generateSlug(name), // Otomatik slug güncelle
                country_code: autoCode || formData.country_code // Otomatik kod ataması
              });
              
              // Vize gerekliliklerini yükle
              if (autoCode) {
                fetch(`/api/admin/visa-requirements/fetch-passportindex`)
                  .then(res => res.json())
                  .then(data => {
                    const visaReq = data.data?.find((v: any) => v.countryCode === autoCode);
                    setVisaRequirementPreview(visaReq);
                  })
                  .catch(console.error);
              }
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

        <div className="space-y-2">
          <label className="flex items-center gap-1 text-sm font-semibold text-slate-900">
            Ülke Kodu (ISO 3166-1 alpha-3)
            {visaRequirementPreview && <span className="text-green-600 text-xs">✓ Vize bilgisi bulundu</span>}
          </label>
          <input
            type="text"
            value={formData.country_code}
            onChange={(e) => {
              const code = e.target.value.toUpperCase();
              setFormData({ ...formData, country_code: code });
              
              // Vize gerekliliklerini yükle
              if (code.length === 3) {
                fetch(`/api/admin/visa-requirements/fetch-passportindex`)
                  .then(res => res.json())
                  .then(data => {
                    const visaReq = data.data?.find((v: any) => v.countryCode === code);
                    setVisaRequirementPreview(visaReq);
                  })
                  .catch(console.error);
              }
            }}
            className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm font-mono uppercase focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            placeholder="Örn: MNE"
            maxLength={3}
          />
          <p className="text-xs text-slate-500">
            Otomatik atanır. Ülke adı değiştirildiğinde ISO kodu bulunur.
          </p>
          {visaRequirementPreview && (
            <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-xs font-semibold text-green-900 mb-1">
                📋 Vize Gerekliliği Bulundu:
              </p>
              <div className="text-xs text-green-800 space-y-1">
                <p><strong>Durum:</strong> {visaRequirementPreview.visaStatus}</p>
                {visaRequirementPreview.allowedStay && (
                  <p><strong>Kalış Süresi:</strong> {visaRequirementPreview.allowedStay}</p>
                )}
                {visaRequirementPreview.conditions && (
                  <p><strong>Koşullar:</strong> {visaRequirementPreview.conditions}</p>
                )}
              </div>
            </div>
          )}
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
          <div className="space-y-3">
            <ImageUpload
              currentImageUrl={formData.image_url}
              onImageChange={(url) => setFormData({ ...formData, image_url: url })}
              bucket="country-images"
              label="Ülke Kapak Fotoğrafı"
              aspectRatio="16/9"
            />
            
            {/* Current Image URL Display for Debugging */}
            {formData.image_url && (
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <p className="mb-1 text-xs font-semibold text-slate-700">Mevcut URL:</p>
                <p className="break-all text-xs text-slate-600">{formData.image_url}</p>
              </div>
            )}
          </div>
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

              <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
                <p className="text-sm font-semibold text-emerald-900 mb-2">
                  ℹ️ Otomatik Bilgiler
                </p>
                <p className="text-xs text-emerald-700">
                  <strong>Vize gereklilikleri</strong> (vize durumu, kalış süresi, başvuru yöntemi vb.) 
                  ülke kodu ile <code className="bg-emerald-100 px-1 rounded">visa_requirements</code> tablosundan 
                  otomatik olarak çekilmektedir.
                </p>
                <p className="text-xs text-emerald-700 mt-2">
                  <strong>Fiyat bilgisi</strong> ise bu ülkeye tanımlı vize paketlerinden (en düşük fiyatlı paket) 
                  otomatik olarak gösterilmektedir. Fiyat düzenlemek için{" "}
                  <a href="/admin/vize-paketleri" className="text-emerald-800 underline hover:text-emerald-900">
                    Vize Paketleri
                  </a>{" "}
                  sayfasını kullanın.
                </p>
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

            {activeLocale === 'tr' ? (
              <>
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
              </>
            ) : (
              <>
                <ArrayInput
                  label="Application Steps (EN)"
                  value={formData.application_steps_en}
                  onChange={(value) => setFormData({ ...formData, application_steps_en: value })}
                  placeholder="E.g.: Step 1: Contact Kolay Seyahat expert consultants"
                  helpText="Step-by-step description of the visa application process"
                />

                <ArrayInput
                  label="Required Documents (EN)"
                  value={formData.required_documents_en}
                  onChange={(value) => setFormData({ ...formData, required_documents_en: value })}
                  placeholder="E.g.: Passport copy"
                  helpText="Add each document separately"
                />

                <ArrayInput
                  label="Important Notes (EN)"
                  value={formData.important_notes_en}
                  onChange={(value) => setFormData({ ...formData, important_notes_en: value })}
                  placeholder="E.g.: Passport must be valid for at least 6 months"
                  helpText="Important points applicants should pay attention to"
                />
              </>
            )}
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
            {activeLocale === 'tr' ? (
              <>
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
              </>
            ) : (
              <>
                <ArrayInput
                  label="Travel Tips (EN)"
                  value={formData.travel_tips_en}
                  onChange={(value) => setFormData({ ...formData, travel_tips_en: value })}
                  placeholder="E.g.: Using local currency is more advantageous"
                  helpText="Helpful tips for travelers"
                />

                <ArrayInput
                  label="Popular Cities (EN)"
                  value={formData.popular_cities_en}
                  onChange={(value) => setFormData({ ...formData, popular_cities_en: value })}
                  placeholder="E.g.: Paris, Lyon, Nice"
                  helpText="Cities frequently visited by tourists"
                />
              </>
            )}

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

      {/* Bilateral Visa Pages Section */}
      <div className="card">
        <button
          type="button"
          onClick={() => toggleSection('bilateral')}
          className="flex w-full items-center justify-between p-6"
        >
          <div className="flex items-center gap-3">
            <Sparkles className="h-5 w-5 text-purple-600" />
            <div className="text-left">
              <h3 className="text-lg font-semibold text-slate-900">
                İki Yönlü Vize Sayfaları
              </h3>
              <p className="text-sm text-slate-600">
                {country.name} → Diğer ülkeler vize sayfalarını yönetin
              </p>
            </div>
          </div>
          {expandedSections.bilateral ? (
            <ChevronUp className="h-5 w-5 text-slate-400" />
          ) : (
            <ChevronDown className="h-5 w-5 text-slate-400" />
          )}
        </button>

        {expandedSections.bilateral && (
          <div className="border-t border-slate-100 p-6">
            <div className="mb-4 rounded-lg bg-blue-50 p-4">
              <p className="text-sm text-blue-800">
                💡 <strong>Bilateral Vize Sayfaları:</strong> {country.name} vatandaşlarının diğer ülkelere seyahat ederken ihtiyaç duyduğu vize bilgilerini içeren sayfalar oluşturun. Mevcut güçlü AI içerik üretimi sisteminiz kullanılacak.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-slate-900">
                    Mevcut Bilateral Vize Sayfaları
                  </h4>
                  <p className="text-sm text-slate-600">
                    {country.name} → Hedef ülke vize sayfaları
                  </p>
                </div>
                <Link
                  href={`/admin/ulkeler/${country.id}/bilateral-vize`}
                  className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-lg transition-all hover:from-purple-700 hover:to-blue-700"
                >
                  <Sparkles className="h-4 w-4" />
                  Bilateral Vize Sayfalarını Yönet
                </Link>
              </div>

              <div className="rounded-lg border border-slate-200 p-4">
                <p className="text-sm text-slate-600">
                  Bu ülke için bilateral vize sayfalarını görüntülemek, düzenlemek ve yeni sayfalar oluşturmak için yukarıdaki butona tıklayın.
                </p>
                <div className="mt-3 flex gap-2">
                  <Link
                    href="/admin/ulkeler/vize-sayfalari"
                    className="text-sm text-blue-600 hover:underline"
                  >
                    Tüm Bilateral Vize Sayfaları →
                  </Link>
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

      {/* AI Regenerate Modal */}
      {showRegenerateModal && (
        <AIRegenerateModal
          countryId={country.id}
          countryName={country.name}
          sourceUrls={formData.source_urls}
          onClose={() => setShowRegenerateModal(false)}
          onSuccess={() => {
            // Refresh page to load new data
            router.refresh();
          }}
        />
      )}
    </form>
  );
}
