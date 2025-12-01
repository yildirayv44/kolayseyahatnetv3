"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Save, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { RichTextEditor } from "./RichTextEditor";

export function ProductCreateForm({ countries }: { countries: any[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    contents: "",
    price: "",
    currency_id: 1, // Default: TL
    processing: "",
    country_id: 0,
    status: 1,
    online: 1,
    req_document: "",
    price_contents: "",
    warning_notes: "",
    offer_text: "",
    alert_text: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from("products")
        .insert([formData]);

      if (error) throw error;

      alert("Vize paketi başarıyla oluşturuldu!");
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
          {loading ? "Oluşturuluyor..." : "Oluştur"}
        </button>
      </div>
    </form>
  );
}
