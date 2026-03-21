"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Save,
  Loader2,
  Eye,
  RefreshCw,
  Sparkles,
} from "lucide-react";

interface VisaPage {
  id: number;
  slug: string;
  source_country_code: string;
  destination_country_code: string;
  locale: string;
  meta_title: string;
  meta_description: string;
  h1_title: string;
  intro_text: string;
  requirements_section: string;
  process_section: string;
  faq_json: any;
  important_notes: string;
  travel_tips: string;
  health_requirements: string;
  customs_rules: string;
  why_kolay_seyahat: string;
  country_info: any;
  custom_content: string;
  use_custom_content: boolean;
  content_status: string;
  view_count: number;
  source_country?: { name: string; flag_emoji: string };
  destination_country?: { name: string; flag_emoji: string };
}

export default function VisaPageEditPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [page, setPage] = useState<VisaPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    fetchPage();
  }, [id]);

  const fetchPage = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/visa-pages/${id}`);
      const data = await response.json();
      if (data.success) {
        setPage(data.data);
      } else {
        setMessage({ type: "error", text: "Sayfa bulunamadı" });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Sayfa yüklenirken hata oluştu" });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!page) return;
    setSaving(true);
    setMessage(null);
    try {
      const response = await fetch(`/api/admin/visa-pages/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          meta_title: page.meta_title,
          meta_description: page.meta_description,
          h1_title: page.h1_title,
          intro_text: page.intro_text,
          requirements_section: page.requirements_section,
          process_section: page.process_section,
          faq_json: page.faq_json,
          important_notes: page.important_notes,
          travel_tips: page.travel_tips,
          health_requirements: page.health_requirements,
          customs_rules: page.customs_rules,
          why_kolay_seyahat: page.why_kolay_seyahat,
          custom_content: page.custom_content,
          use_custom_content: page.use_custom_content,
          content_status: page.content_status,
        }),
      });
      const data = await response.json();
      if (data.success) {
        setMessage({ type: "success", text: "Sayfa başarıyla güncellendi" });
        setPage(data.data);
      } else {
        setMessage({ type: "error", text: data.error || "Kaydetme hatası" });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Kaydetme hatası" });
    } finally {
      setSaving(false);
    }
  };

  const handleRegenerate = async () => {
    if (!page) return;
    if (!confirm("İçerik yeniden oluşturulacak. Mevcut içerik kaybolacak. Devam etmek istiyor musunuz?")) return;
    setRegenerating(true);
    setMessage(null);
    try {
      const response = await fetch("/api/admin/visa-pages/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source_country_code: page.source_country_code,
          destination_country_code: page.destination_country_code,
          locale: page.locale,
        }),
      });
      const data = await response.json();
      if (data.success) {
        setMessage({ type: "success", text: "İçerik yeniden oluşturuldu" });
        fetchPage();
      } else {
        setMessage({ type: "error", text: data.error || "Yeniden oluşturma hatası" });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Yeniden oluşturma hatası" });
    } finally {
      setRegenerating(false);
    }
  };

  const updateField = (field: string, value: any) => {
    if (!page) return;
    setPage({ ...page, [field]: value });
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    );
  }

  if (!page) {
    return (
      <div className="p-6 text-center">
        <p className="text-red-600">Sayfa bulunamadı</p>
        <Link href="/admin/ulkeler/vize-sayfalari" className="mt-4 inline-block text-blue-600 hover:underline">
          ← Geri Dön
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/ulkeler/vize-sayfalari"
            className="rounded-lg p-2 hover:bg-slate-100"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              {page.source_country?.flag_emoji} {page.source_country?.name || page.source_country_code}
              {" → "}
              {page.destination_country?.flag_emoji} {page.destination_country?.name || page.destination_country_code}
            </h1>
            <p className="text-sm text-slate-500">
              Slug: <code className="rounded bg-slate-100 px-2 py-0.5">{page.slug}</code>
              {" · "}Dil: {page.locale.toUpperCase()}
              {" · "}Görüntülenme: {page.view_count || 0}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/${page.slug}`}
            target="_blank"
            className="inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm hover:bg-slate-50"
          >
            <Eye className="h-4 w-4" />
            Önizle
          </Link>
          <button
            onClick={handleRegenerate}
            disabled={regenerating}
            className="inline-flex items-center gap-2 rounded-lg border border-purple-200 bg-purple-50 px-4 py-2 text-sm text-purple-700 hover:bg-purple-100 disabled:opacity-50"
          >
            {regenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            Yeniden Oluştur
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Kaydet
          </button>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div
          className={`mb-6 rounded-lg p-4 ${
            message.type === "success"
              ? "bg-green-50 text-green-800"
              : "bg-red-50 text-red-800"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Status */}
      <div className="mb-6 rounded-lg border p-4">
        <label className="mb-2 block text-sm font-semibold">Durum</label>
        <select
          value={page.content_status}
          onChange={(e) => updateField("content_status", e.target.value)}
          className="rounded-lg border px-4 py-2 text-sm"
        >
          <option value="pending">Beklemede</option>
          <option value="generated">Oluşturuldu</option>
          <option value="reviewed">İncelendi</option>
          <option value="published">Yayınlandı</option>
        </select>
      </div>

      {/* SEO */}
      <div className="mb-6 rounded-lg border p-4">
        <h2 className="mb-4 text-lg font-semibold">SEO Bilgileri</h2>
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Meta Title</label>
            <input
              type="text"
              value={page.meta_title || ""}
              onChange={(e) => updateField("meta_title", e.target.value)}
              className="w-full rounded-lg border px-4 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Meta Description</label>
            <textarea
              value={page.meta_description || ""}
              onChange={(e) => updateField("meta_description", e.target.value)}
              className="w-full rounded-lg border px-4 py-2 text-sm"
              rows={3}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">H1 Başlık</label>
            <input
              type="text"
              value={page.h1_title || ""}
              onChange={(e) => updateField("h1_title", e.target.value)}
              className="w-full rounded-lg border px-4 py-2 text-sm"
            />
          </div>
        </div>
      </div>

      {/* Content Sections */}
      <div className="mb-6 rounded-lg border p-4">
        <h2 className="mb-4 text-lg font-semibold">İçerik Bölümleri</h2>
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Giriş Metni</label>
            <textarea
              value={page.intro_text || ""}
              onChange={(e) => updateField("intro_text", e.target.value)}
              className="w-full rounded-lg border px-4 py-2 text-sm"
              rows={6}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Gereksinimler</label>
            <textarea
              value={page.requirements_section || ""}
              onChange={(e) => updateField("requirements_section", e.target.value)}
              className="w-full rounded-lg border px-4 py-2 text-sm"
              rows={8}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Süreç</label>
            <textarea
              value={page.process_section || ""}
              onChange={(e) => updateField("process_section", e.target.value)}
              className="w-full rounded-lg border px-4 py-2 text-sm"
              rows={8}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Önemli Notlar</label>
            <textarea
              value={page.important_notes || ""}
              onChange={(e) => updateField("important_notes", e.target.value)}
              className="w-full rounded-lg border px-4 py-2 text-sm"
              rows={6}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Seyahat İpuçları</label>
            <textarea
              value={page.travel_tips || ""}
              onChange={(e) => updateField("travel_tips", e.target.value)}
              className="w-full rounded-lg border px-4 py-2 text-sm"
              rows={6}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Sağlık Gereksinimleri</label>
            <textarea
              value={page.health_requirements || ""}
              onChange={(e) => updateField("health_requirements", e.target.value)}
              className="w-full rounded-lg border px-4 py-2 text-sm"
              rows={6}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Gümrük Kuralları</label>
            <textarea
              value={page.customs_rules || ""}
              onChange={(e) => updateField("customs_rules", e.target.value)}
              className="w-full rounded-lg border px-4 py-2 text-sm"
              rows={6}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Neden Kolay Seyahat</label>
            <textarea
              value={page.why_kolay_seyahat || ""}
              onChange={(e) => updateField("why_kolay_seyahat", e.target.value)}
              className="w-full rounded-lg border px-4 py-2 text-sm"
              rows={6}
            />
          </div>
        </div>
      </div>

      {/* Custom Content */}
      <div className="mb-6 rounded-lg border p-4">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Özel İçerik</h2>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={page.use_custom_content || false}
              onChange={(e) => updateField("use_custom_content", e.target.checked)}
              className="h-4 w-4"
            />
            <span className="text-sm">Özel içerik kullan (AI yerine)</span>
          </label>
        </div>
        <textarea
          value={page.custom_content || ""}
          onChange={(e) => updateField("custom_content", e.target.value)}
          className="w-full rounded-lg border px-4 py-2 text-sm"
          rows={10}
          placeholder="Özel HTML içerik..."
        />
      </div>

      {/* Save Button */}
      <div className="flex justify-end gap-3">
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Kaydet
        </button>
      </div>
    </div>
  );
}
