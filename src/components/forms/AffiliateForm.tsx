"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Send } from "lucide-react";

export function AffiliateForm() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    password_confirm: "",
    website: "",
    social_media: "",
    experience: "",
    traffic_source: "",
    monthly_visitors: "",
    why_join: "",
    terms_accepted: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.email.trim() || !formData.phone.trim()) {
      alert("Lütfen zorunlu alanları doldurun");
      return;
    }

    if (!formData.password || formData.password.length < 6) {
      alert("Şifre en az 6 karakter olmalıdır");
      return;
    }

    if (formData.password !== formData.password_confirm) {
      alert("Şifreler eşleşmiyor");
      return;
    }

    if (!formData.terms_accepted) {
      alert("Lütfen şartları ve koşulları kabul edin");
      return;
    }

    try {
      setLoading(true);

      const { error } = await supabase.from("user_affiliates").insert({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password_hash: formData.password,
        website: formData.website || null,
        social_media: formData.social_media || null,
        experience: formData.experience || null,
        traffic_source: formData.traffic_source || null,
        monthly_visitors: formData.monthly_visitors || null,
        why_join: formData.why_join || null,
        status: 0,
        created_at: new Date().toISOString(),
      });

      if (error) throw error;

      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/affiliate-application-notification`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              name: formData.name,
              email: formData.email,
              phone: formData.phone,
              website: formData.website,
              social_media: formData.social_media,
              experience: formData.experience,
              traffic_source: formData.traffic_source,
              monthly_visitors: formData.monthly_visitors,
              why_join: formData.why_join,
            }),
          }
        );

        if (!response.ok) {
          console.error("Email notification failed:", await response.text());
        }
      } catch (emailError) {
        console.error("Email notification error:", emailError);
      }

      alert("Başvurunuz başarıyla gönderildi! En kısa sürede size geri dönüş yapacağız.");
      
      setFormData({
        name: "",
        email: "",
        phone: "",
        password: "",
        password_confirm: "",
        website: "",
        social_media: "",
        experience: "",
        traffic_source: "",
        monthly_visitors: "",
        why_join: "",
        terms_accepted: false,
      });
    } catch (error) {
      console.error("Error submitting affiliate application:", error);
      alert("Başvuru gönderilirken hata oluştu. Lütfen tekrar deneyin.");
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
            Telefon <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            id="phone"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            placeholder="0555 123 45 67"
            className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            required
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="password" className="block text-sm font-semibold text-slate-900">
            Şifre <span className="text-red-500">*</span>
          </label>
          <input
            type="password"
            id="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            placeholder="En az 6 karakter"
            className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            required
            minLength={6}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="password_confirm" className="block text-sm font-semibold text-slate-900">
            Şifre Tekrar <span className="text-red-500">*</span>
          </label>
          <input
            type="password"
            id="password_confirm"
            value={formData.password_confirm}
            onChange={(e) => setFormData({ ...formData, password_confirm: e.target.value })}
            placeholder="Şifrenizi tekrar girin"
            className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            required
            minLength={6}
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="website" className="block text-sm font-semibold text-slate-900">
            Website / Blog
          </label>
          <input
            type="url"
            id="website"
            value={formData.website}
            onChange={(e) => setFormData({ ...formData, website: e.target.value })}
            placeholder="https://www.example.com"
            className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="social_media" className="block text-sm font-semibold text-slate-900">
          Sosyal Medya Hesapları
        </label>
        <input
          type="text"
          id="social_media"
          value={formData.social_media}
          onChange={(e) => setFormData({ ...formData, social_media: e.target.value })}
          placeholder="Instagram, YouTube, TikTok vb. hesap linkleriniz"
          className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="traffic_source" className="block text-sm font-semibold text-slate-900">
            Trafik Kaynağınız
          </label>
          <select
            id="traffic_source"
            value={formData.traffic_source}
            onChange={(e) => setFormData({ ...formData, traffic_source: e.target.value })}
            className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="">Seçiniz</option>
            <option value="website">Website/Blog</option>
            <option value="social_media">Sosyal Medya</option>
            <option value="youtube">YouTube</option>
            <option value="email">E-posta Listesi</option>
            <option value="other">Diğer</option>
          </select>
        </div>

        <div className="space-y-2">
          <label htmlFor="monthly_visitors" className="block text-sm font-semibold text-slate-900">
            Aylık Ziyaretçi/Takipçi Sayısı
          </label>
          <select
            id="monthly_visitors"
            value={formData.monthly_visitors}
            onChange={(e) => setFormData({ ...formData, monthly_visitors: e.target.value })}
            className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="">Seçiniz</option>
            <option value="0-1000">0 - 1,000</option>
            <option value="1000-5000">1,000 - 5,000</option>
            <option value="5000-10000">5,000 - 10,000</option>
            <option value="10000-50000">10,000 - 50,000</option>
            <option value="50000+">50,000+</option>
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="experience" className="block text-sm font-semibold text-slate-900">
          Affiliate Deneyiminiz
        </label>
        <textarea
          id="experience"
          value={formData.experience}
          onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
          rows={4}
          placeholder="Daha önce affiliate programlarında çalıştınız mı? Deneyimlerinizi paylaşın..."
          className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="why_join" className="block text-sm font-semibold text-slate-900">
          Neden Katılmak İstiyorsunuz?
        </label>
        <textarea
          id="why_join"
          value={formData.why_join}
          onChange={(e) => setFormData({ ...formData, why_join: e.target.value })}
          rows={4}
          placeholder="Affiliate programımıza neden katılmak istediğinizi kısaca açıklayın..."
          className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>

      <div className="flex items-start gap-2">
        <input
          type="checkbox"
          id="terms"
          checked={formData.terms_accepted}
          onChange={(e) => setFormData({ ...formData, terms_accepted: e.target.checked })}
          className="mt-1 h-4 w-4 rounded border-slate-300 text-primary focus:ring-2 focus:ring-primary/20"
          required
        />
        <label htmlFor="terms" className="text-xs text-slate-600">
          Affiliate program şartlarını ve koşullarını okudum ve kabul ediyorum. <span className="text-red-500">*</span>
        </label>
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
            Başvuru Gönder
          </>
        )}
      </button>
    </form>
  );
}
