"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Save, ArrowLeft, Languages, Loader2 } from "lucide-react";
import Link from "next/link";
import { RichTextEditor } from "./RichTextEditor";

export function ProductEditForm({ product, countries }: { product: any; countries: any[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [translating, setTranslating] = useState(false);
  const [activeLocale, setActiveLocale] = useState<'tr' | 'en'>('tr');
  const [formData, setFormData] = useState({
    name: product.name || "",
    description: product.description || "",
    contents: product.contents || "",
    price: product.price || "",
    currency_id: product.currency_id || 1,
    processing: product.processing || "",
    country_id: product.country_id || "",
    status: product.status || 0,
    online: product.online || 0,
    req_document: product.req_document || "",
    price_contents: product.price_contents || "",
    warning_notes: product.warning_notes || "",
    offer_text: product.offer_text || "",
    alert_text: product.alert_text || "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from("products")
        .update(formData)
        .eq("id", product.id);

      if (error) throw error;

      alert("Vize paketi başarıyla güncellendi!");
      router.push("/admin/vize-paketleri");
      router.refresh();
    } catch (error: any) {
      alert("Hata: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="card space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-900">
              Paket Adı *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              placeholder="Örn: Standart Turist Vizesi"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-900">
              Ülke *
            </label>
            <select
              value={formData.country_id}
              onChange={(e) => setFormData({ ...formData, country_id: parseInt(e.target.value) })}
              required
              className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="">Ülke Seçin</option>
              {countries.map((country) => (
                <option key={country.id} value={country.id}>
                  {country.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-900">
              Fiyat
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              placeholder="Örn: 2500"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-900">
              Para Birimi
            </label>
            <select
              value={formData.currency_id}
              onChange={(e) => setFormData({ ...formData, currency_id: parseInt(e.target.value) })}
              className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value={1}>₺ TL (Türk Lirası)</option>
              <option value={2}>$ USD (Amerikan Doları)</option>
              <option value={3}>€ EUR (Euro)</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-900">
              İşlem Süresi
            </label>
            <input
              type="text"
              value={formData.processing}
              onChange={(e) => setFormData({ ...formData, processing: e.target.value })}
              className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              placeholder="Örn: 7-14 gün"
            />
          </div>
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
            placeholder="Paketin kısa açıklaması..."
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-semibold text-slate-900">
            Detaylı İçerik
          </label>
          <RichTextEditor
            value={formData.contents}
            onChange={(value) => setFormData({ ...formData, contents: value })}
            placeholder="Paket hakkında detaylı bilgi..."
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-semibold text-slate-900">
            Gerekli Belgeler
          </label>
          <RichTextEditor
            value={formData.req_document}
            onChange={(value) => setFormData({ ...formData, req_document: value })}
            placeholder="Gerekli belgeler listesi..."
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-semibold text-slate-900">
            Fiyata Dahil Olanlar
          </label>
          <RichTextEditor
            value={formData.price_contents}
            onChange={(value) => setFormData({ ...formData, price_contents: value })}
            placeholder="Fiyata dahil olan hizmetler..."
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-semibold text-slate-900">
            Kampanya Metni
          </label>
          <textarea
            rows={2}
            value={formData.offer_text}
            onChange={(e) => setFormData({ ...formData, offer_text: e.target.value })}
            className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            placeholder="Örn: %20 İndirim"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-semibold text-slate-900">
            Uyarı Notu
          </label>
          <textarea
            rows={2}
            value={formData.alert_text}
            onChange={(e) => setFormData({ ...formData, alert_text: e.target.value })}
            className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            placeholder="Önemli uyarı..."
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-semibold text-slate-900">
            Uyarı Notları
          </label>
          <RichTextEditor
            value={formData.warning_notes}
            onChange={(value) => setFormData({ ...formData, warning_notes: value })}
            placeholder="Detaylı uyarı notları..."
          />
        </div>

        <div className="grid gap-6 md:grid-cols-2">
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

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-900">
              Online Başvuru
            </label>
            <select
              value={formData.online}
              onChange={(e) => setFormData({ ...formData, online: parseInt(e.target.value) })}
              className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value={0}>Kapalı</option>
              <option value={1}>Açık</option>
            </select>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Link
          href="/admin/vize-paketleri"
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
