"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Send } from "lucide-react";
import { trackFormSubmit } from "@/lib/gtag";

export function FeedbackForm() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    type: "suggestion",
    subject: "",
    message: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      alert("Lütfen zorunlu alanları doldurun");
      return;
    }

    try {
      setLoading(true);

      const { error } = await supabase.from("feedback").insert({
        name: formData.name,
        email: formData.email,
        phone: formData.phone || null,
        type: formData.type,
        subject: formData.subject || null,
        message: formData.message,
        status: "pending",
        created_at: new Date().toISOString(),
      });

      if (error) throw error;

      alert("Geri bildiriminiz başarıyla gönderildi. Teşekkür ederiz!");
      trackFormSubmit(); // Google Ads conversion tracking
      
      // Reset form
      setFormData({
        name: "",
        email: "",
        phone: "",
        type: "suggestion",
        subject: "",
        message: "",
      });
    } catch (error) {
      console.error("Error submitting feedback:", error);
      alert("Geri bildirim gönderilirken hata oluştu. Lütfen tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="name" className="block text-sm font-semibold text-slate-900">
            Ad Soyad <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Adınız ve soyadınız"
            className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            required
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="email" className="block text-sm font-semibold text-slate-900">
            E-posta <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            id="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="ornek@email.com"
            className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            required
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="phone" className="block text-sm font-semibold text-slate-900">
            Telefon
          </label>
          <input
            type="tel"
            id="phone"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            placeholder="0555 123 45 67"
            className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="type" className="block text-sm font-semibold text-slate-900">
            Geri Bildirim Türü <span className="text-red-500">*</span>
          </label>
          <select
            id="type"
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            required
          >
            <option value="suggestion">Öneri</option>
            <option value="complaint">Şikayet</option>
            <option value="compliment">Teşekkür</option>
            <option value="question">Soru</option>
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="subject" className="block text-sm font-semibold text-slate-900">
          Konu
        </label>
        <input
          type="text"
          id="subject"
          value={formData.subject}
          onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
          placeholder="Geri bildiriminizin konusu"
          className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="message" className="block text-sm font-semibold text-slate-900">
          Mesajınız <span className="text-red-500">*</span>
        </label>
        <textarea
          id="message"
          value={formData.message}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          rows={6}
          placeholder="Geri bildiriminizi detaylı bir şekilde yazın..."
          className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          required
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 font-semibold text-white hover:bg-primary/90 disabled:opacity-50"
      >
        {loading ? (
          <>
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
            Gönderiliyor...
          </>
        ) : (
          <>
            <Send className="h-5 w-5" />
            Gönder
          </>
        )}
      </button>
    </form>
  );
}
