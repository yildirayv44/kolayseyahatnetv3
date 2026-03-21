"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Save, ArrowLeft, ChevronDown, ChevronUp } from "lucide-react";
import Link from "next/link";
import { RichTextEditor } from "./RichTextEditor";
import { ArrayInput } from "./ArrayInput";
import { UnifiedAIAssistant } from "./UnifiedAIAssistant";
import { ImageUpload } from "./ImageUpload";
import { AIToolsQuickAccess } from "./AIToolsQuickAccess";
import { generateSlug } from "@/lib/helpers";
import { getCountryCode, getAllCountryCodes } from "@/lib/country-codes";

export function CountryCreateForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
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
    name: "",
    slug: "",
    country_code: "", // ISO 3166-1 alpha-3 code (destination/hedef ülke)
    source_country_code: "TUR", // Kaynak ülke (default: Türkiye)
    title: "",
    meta_title: "",
    meta_description: "",
    description: "",
    contents: "",
    req_document: "",
    price_contents: "",
    process_time: "7-14 Gün",
    image_url: "",
    sorted: 0,
    status: 1,
    // Extended fields from migration
    max_stay_duration: "",
    visa_fee: "",
    processing_time: "",
    application_steps: [] as string[],
    required_documents: [] as string[],
    important_notes: [] as string[],
    travel_tips: [] as string[],
    popular_cities: [] as string[],
    best_time_to_visit: "",
    health_requirements: "",
    customs_regulations: "",
    emergency_contacts: { embassy: "", emergencyNumber: "", police: "", ambulance: "" },
    why_kolay_seyahat: "",
    capital: "",
    currency: "",
    language: "",
    timezone: "",
  });
  
  const [visaRequirementPreview, setVisaRequirementPreview] = useState<any>(null);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Ülke adı zorunludur';
    }
    
    if (!formData.slug.trim()) {
      newErrors.slug = 'Slug zorunludur';
    } else if (!/^[a-z0-9-]+$/.test(formData.slug)) {
      newErrors.slug = 'Slug sadece küçük harf, rakam ve tire içerebilir';
    }
    
    if (!formData.title.trim()) {
      newErrors.title = 'Sayfa başlığı zorunludur';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Açıklama zorunludur';
    }
    
    if (!formData.contents.trim()) {
      newErrors.contents = 'Ana içerik zorunludur';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!validateForm()) {
      alert('Lütfen tüm zorunlu alanları doldurun');
      setExpandedSections({ basic: true, seo: true, visa: true, extended: false, country: false });
      return;
    }
    
    setLoading(true);

    try {
      // 1. Ülkeyi kaydet (slug hariç - o taxonomies'e gidecek)
      const { slug, ...countryData } = formData;
      
      // Vize gerekliliklerini kontrol et (kaynak ve hedef ülkeye göre)
      const visaReqResponse = await fetch(
        `/api/admin/visa-requirements/check?source=${formData.source_country_code}&destination=${formData.country_code}`
      );
      const visaReqData = await visaReqResponse.json();
      
      const { data: country, error: countryError } = await supabase
        .from("countries")
        .insert([{
          ...countryData,
          // Vize gerekliliklerini ekle
          visa_requirement: visaReqData?.visa_status || null,
        }])
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

      {/* AI Assistant with Explanation */}
      <div className="rounded-lg border-2 border-purple-200 bg-gradient-to-r from-purple-50 to-blue-50 p-6">
        <div className="mb-4">
          <h3 className="mb-2 text-lg font-bold text-purple-900">
            🤖 AI Asistan ile Hızlı Başla
          </h3>
          <p className="text-sm text-purple-700">
            Sadece ülke adını girin, AI tüm bilgileri otomatik oluştursun. 
            Vize detayları, SEO başlıkları, içerik ve daha fazlası AI tarafından hazırlanır.
          </p>
          <ul className="mt-2 space-y-1 text-xs text-purple-600">
            <li>• Ülke adı, başlık ve açıklama</li>
            <li>• SEO optimize edilmiş meta başlıklar</li>
            <li>• Detaylı vize bilgileri ve içerik</li>
            <li>• Pexels'ten otomatik kapak fotoğrafı</li>
          </ul>
        </div>
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
            setHasUnsavedChanges(true);
          }}
        />
      </div>

      {/* Basic Info & Image Upload Side by Side */}
      <div className="card">
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Left Column - Basic Info */}
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="flex items-center gap-1 text-sm font-semibold text-slate-900">
                Ülke Adı
                <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => {
                  const name = e.target.value;
                  setHasUnsavedChanges(true);
                  if (errors.name) setErrors({ ...errors, name: '' });
                  
                  // Otomatik country_code ataması
                  const autoCode = getCountryCode(name);
                  
                  setFormData({ 
                    ...formData, 
                    name,
                    slug: generateSlug(name), // Otomatik slug oluştur
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
                className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="Örn: Karadağ"
              />
              {errors.name && (
                <p className="text-xs text-red-600 mt-1">{errors.name}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-1 text-sm font-semibold text-slate-900">
                URL Slug
                <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.slug}
                onChange={(e) => {
                  setFormData({ ...formData, slug: e.target.value });
                  setHasUnsavedChanges(true);
                  if (errors.slug) setErrors({ ...errors, slug: '' });
                }}
                className={`w-full rounded-lg border px-4 py-2 text-sm font-mono focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                  errors.slug ? 'border-red-500' : 'border-slate-200'
                }`}
                placeholder="Örn: karadag"
              />
              {errors.slug ? (
                <p className="text-xs text-red-600 mt-1">{errors.slug}</p>
              ) : (
                <p className="text-xs text-slate-500">
                  URL: /{formData.slug || "karadag"}
                </p>
              )}
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
                  setHasUnsavedChanges(true);
                  
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
                Otomatik atanır. Ülke adı girildiğinde ISO kodu bulunur.
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

            <div className="space-y-2">
              <label className="flex items-center gap-1 text-sm font-semibold text-slate-900">
                Kaynak Ülke
                <span className="text-xs text-slate-500 font-normal ml-1">(Hangi ülkeden?)</span>
              </label>
              <select
                value={formData.source_country_code}
                onChange={(e) => {
                  setFormData({ ...formData, source_country_code: e.target.value });
                  setHasUnsavedChanges(true);
                }}
                className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="TUR">🇹🇷 Türkiye (Varsayılan)</option>
                <option value="MNE">🇲🇪 Karadağ</option>
                <option value="USA">🇺🇸 Amerika</option>
                <option value="GBR">🇬🇧 İngiltere</option>
                <option value="DEU">🇩🇪 Almanya</option>
                <option value="FRA">🇫🇷 Fransa</option>
                <option value="ITA">🇮🇹 İtalya</option>
                <option value="ESP">🇪🇸 İspanya</option>
                <option value="NLD">🇳🇱 Hollanda</option>
                <option value="BEL">🇧🇪 Belçika</option>
                <option value="CHE">🇨🇭 İsviçre</option>
                <option value="AUT">🇦🇹 Avusturya</option>
                <option value="SWE">🇸🇪 İsveç</option>
                <option value="NOR">🇳🇴 Norveç</option>
                <option value="DNK">🇩🇰 Danimarka</option>
                <option value="FIN">🇫🇮 Finlandiya</option>
                <option value="POL">🇵🇱 Polonya</option>
                <option value="CZE">🇨🇿 Çekya</option>
                <option value="HUN">🇭🇺 Macaristan</option>
                <option value="ROU">🇷🇴 Romanya</option>
                <option value="BGR">🇧🇬 Bulgaristan</option>
                <option value="GRC">🇬🇷 Yunanistan</option>
                <option value="HRV">🇭🇷 Hırvatistan</option>
                <option value="SRB">🇷🇸 Sırbistan</option>
                <option value="BIH">🇧🇦 Bosna Hersek</option>
                <option value="MKD">🇲🇰 Kuzey Makedonya</option>
                <option value="ALB">🇦🇱 Arnavutluk</option>
                <option value="KOS">🇽🇰 Kosova</option>
              </select>
              <p className="text-xs text-slate-500">
                Türkiye dışındaki ülkeler için bilateral vize sayfası oluşturulur.
                Örn: Karadağ → Kuveyt vize sayfası
              </p>
            </div>
          </div>

          {/* Right Column - Image Upload */}
          <div>
            <ImageUpload
              currentImageUrl={formData.image_url}
              onImageChange={(url) => {
                setFormData({ ...formData, image_url: url });
                setHasUnsavedChanges(true);
              }}
              bucket="country-images"
              label="Ülke Kapak Fotoğrafı"
              aspectRatio="16/9"
            />
          </div>
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
              otomatik olarak gösterilmektedir. Ülkeyi kaydettikten sonra{" "}
              <a href="/admin/vize-paketleri/yeni" className="text-emerald-800 underline hover:text-emerald-900">
                Vize Paketleri
              </a>{" "}
              sayfasından fiyat ekleyebilirsiniz.
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

      {/* Sticky Save Button */}
      <div className="sticky bottom-0 z-10 border-t border-slate-200 bg-white px-6 py-4 shadow-lg">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/admin/ulkeler"
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              <ArrowLeft className="h-4 w-4" />
              İptal
            </Link>
            {hasUnsavedChanges && (
              <span className="text-sm text-amber-600">
                ⚠️ Kaydedilmemiş değişiklikler var
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <div className="text-sm text-slate-600">
              {Object.keys(errors).length > 0 && (
                <span className="text-red-600">
                  ❌ {Object.keys(errors).length} hata var
                </span>
              )}
            </div>
            <button
              type="submit"
              disabled={loading || !formData.name.trim()}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-white hover:bg-primary/90 disabled:opacity-50 shadow-md"
            >
              <Save className="h-4 w-4" />
              {loading ? "Kaydediliyor..." : "Kaydet"}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
