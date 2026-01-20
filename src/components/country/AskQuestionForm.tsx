"use client";

import { useState, useEffect } from "react";
import { Send, CheckCircle2 } from "lucide-react";
import { t } from "@/i18n/translations";
import type { Locale } from "@/i18n/translations";
import { getCurrentUser } from "@/lib/auth";

interface AskQuestionFormProps {
  countryId: number;
  countryName: string;
  locale?: Locale;
}

export function AskQuestionForm({ countryId, countryName, locale = "tr" }: AskQuestionFormProps) {
  const [userId, setUserId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    question: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showAccountPrompt, setShowAccountPrompt] = useState(false);

  // Auto-fill user data if logged in
  useEffect(() => {
    getCurrentUser().then(user => {
      if (user) {
        setUserId(user.id);
        setFormData(prev => ({
          ...prev,
          name: user.name || "",
          email: user.email || "",
          phone: user.phone || "",
        }));
      }
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          country_id: countryId,
          question: formData.question,
          user_id: userId,
        }),
      });

      if (response.ok) {
        setIsSuccess(true);
        
        // If user is not logged in, show account creation prompt
        if (!userId) {
          setShowAccountPrompt(true);
        }
        
        // Reset form after 5 seconds
        setTimeout(() => {
          setIsSuccess(false);
          setShowAccountPrompt(false);
          setFormData({ name: "", email: "", phone: "", question: "" });
        }, 5000);
      } else {
        const errorData = await response.json();
        console.error('Question submission error:', errorData);
        alert(`Hata: ${errorData.error || 'Soru gönderilirken bir hata oluştu.'}`);
      }
    } catch (error) {
      console.error("Question submit error:", error);
      alert(locale === 'en' ? 'An error occurred while sending your question. Please try again.' : 'Soru gönderilirken bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="space-y-4">
        <div className="rounded-2xl border-2 border-emerald-200 bg-emerald-50 p-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
            <CheckCircle2 className="h-8 w-8 text-emerald-600" />
          </div>
          <h3 className="mb-2 text-xl font-bold text-slate-900">
            {t(locale, "successTitle")}
          </h3>
          <p className="text-sm text-slate-600">
            {t(locale, "successMessage")}
          </p>
        </div>

        {/* Account Creation Prompt for Non-Logged Users */}
        {showAccountPrompt && (
          <div className="rounded-2xl border-2 border-blue-200 bg-blue-50 p-6">
            <h4 className="mb-3 text-lg font-bold text-slate-900">
              {locale === 'en' ? 'Create Your Account' : 'Hesap Oluşturun'}
            </h4>
            <p className="mb-4 text-sm text-slate-700">
              {locale === 'en' 
                ? 'Create an account to track your questions and receive personalized visa consultancy services.'
                : 'Sorularınızı takip etmek ve kişiselleştirilmiş vize danışmanlık hizmeti almak için hesap oluşturun.'}
            </p>
            <a
              href="/kayit"
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-blue-700"
            >
              {locale === 'en' ? 'Create Free Account' : 'Ücretsiz Hesap Oluştur'}
              <Send className="h-4 w-4" />
            </a>
          </div>
        )}

        {/* Consultancy Service Promotion */}
        <div className="rounded-2xl border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-blue-50 p-6">
          <h4 className="mb-3 text-lg font-bold text-slate-900">
            {locale === 'en' ? 'Professional Visa Consultancy' : 'Profesyonel Vize Danışmanlığı'}
          </h4>
          <p className="mb-4 text-sm text-slate-700">
            {locale === 'en'
              ? 'Get expert guidance throughout your visa application process. Our consultants have helped thousands of successful applications with a 98% approval rate.'
              : 'Vize başvuru sürecinizde uzman rehberliği alın. Danışmanlarımız %98 onay oranı ile binlerce başarılı başvuruya yardımcı oldu.'}
          </p>
          <div className="flex flex-wrap gap-3">
            <a
              href="/vize-basvuru-formu"
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 font-semibold text-white transition-colors hover:bg-primary/90"
            >
              {locale === 'en' ? 'Start Application' : 'Başvuru Yap'}
              <Send className="h-4 w-4" />
            </a>
            <a
              href="/danismanlar"
              className="inline-flex items-center gap-2 rounded-lg border-2 border-primary bg-white px-6 py-3 font-semibold text-primary transition-colors hover:bg-primary/5"
            >
              {locale === 'en' ? 'Meet Our Consultants' : 'Danışmanlarımız'}
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border-2 border-slate-200 bg-white p-6 md:p-8">
      <div className="mb-6">
        <h3 className="mb-2 text-2xl font-bold text-slate-900">
          {locale === 'en' ? `Ask a Question About ${countryName} Visa` : `${countryName} Vizesi Hakkında Soru Sor`}
        </h3>
        <p className="text-sm text-slate-600">
          {locale === 'en' ? 'Our expert consultants will answer your questions as soon as possible.' : 'Uzman danışmanlarımız sorularınızı en kısa sürede yanıtlayacak.'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label
              htmlFor="name"
              className="mb-1.5 block text-sm font-semibold text-slate-700"
            >
              {locale === 'en' ? 'Your Name *' : 'Adınız Soyadınız *'}
            </label>
            <input
              type="text"
              id="name"
              required
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              disabled={!!userId}
              className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:bg-slate-50 disabled:text-slate-600"
              placeholder={t(locale, "namePlaceholder")}
            />
          </div>
          <div>
            <label
              htmlFor="phone"
              className="mb-1.5 block text-sm font-semibold text-slate-700"
            >
              {locale === 'en' ? 'Phone Number *' : 'Telefon Numaranız *'}
            </label>
            <input
              type="tel"
              id="phone"
              required={!userId}
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
              disabled={!!userId}
              className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:bg-slate-50 disabled:text-slate-600"
              placeholder={t(locale, "phonePlaceholder")}
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="email"
            className="mb-1.5 block text-sm font-semibold text-slate-700"
          >
            {locale === 'en' ? 'Email Address *' : 'E-posta Adresiniz *'}
          </label>
          <input
            type="email"
            id="email"
            required
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            disabled={!!userId}
            className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:bg-slate-50 disabled:text-slate-600"
            placeholder={t(locale, "emailPlaceholder")}
          />
        </div>

        <div>
          <label
            htmlFor="question"
            className="mb-1.5 block text-sm font-semibold text-slate-700"
          >
            {locale === 'en' ? 'Your Question *' : 'Sorunuz *'}
          </label>
          <textarea
            id="question"
            required
            rows={5}
            value={formData.question}
            onChange={(e) =>
              setFormData({ ...formData, question: e.target.value })
            }
            className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            placeholder={t(locale, "questionPlaceholder")}
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-8 py-4 font-bold text-white shadow-lg transition-all hover:bg-primary/90 hover:shadow-xl disabled:opacity-50"
        >
          {isSubmitting ? (
            <>
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              <span>{t(locale, "submittingButton")}</span>
            </>
          ) : (
            <>
              <span>{t(locale, "submitButton")}</span>
              <Send className="h-5 w-5" />
            </>
          )}
        </button>

        <p className="text-center text-xs text-slate-500">
          {locale === 'en' ? 'By submitting this form, you agree to our ' : 'Formunu göndererek '}
          <a href="/gizlilik" className="text-primary hover:underline">
            {locale === 'en' ? 'Privacy Policy' : 'Gizlilik Politikası'}
          </a>
          {locale === 'en' ? '.' : "'nı kabul etmiş olursunuz."}
        </p>
      </form>
    </div>
  );
}
