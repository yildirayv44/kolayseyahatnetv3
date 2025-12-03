"use client";

import { useState } from "react";
import { Send, CheckCircle2 } from "lucide-react";
import { t } from "@/i18n/translations";
import type { Locale } from "@/i18n/translations";

interface AskQuestionFormProps {
  countryId: number;
  countryName: string;
  locale?: Locale;
}

export function AskQuestionForm({ countryId, countryName, locale = "tr" }: AskQuestionFormProps) {

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    question: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          country_id: countryId,
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          question: formData.question,
        }),
      });

      if (response.ok) {
        setIsSuccess(true);
        // Reset form after 3 seconds
        setTimeout(() => {
          setIsSuccess(false);
          setFormData({ name: "", email: "", phone: "", question: "" });
        }, 3000);
      } else {
        alert("Soru gönderilirken bir hata oluştu. Lütfen tekrar deneyin.");
      }
    } catch (error) {
      console.error("Question submit error:", error);
      alert("Soru gönderilirken bir hata oluştu. Lütfen tekrar deneyin.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
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
    );
  }

  return (
    <div className="rounded-2xl border-2 border-slate-200 bg-white p-6 md:p-8">
      <div className="mb-6">
        <h3 className="mb-2 text-2xl font-bold text-slate-900">
          {countryName} Vizesi Hakkında Soru Sor
        </h3>
        <p className="text-sm text-slate-600">
          Uzman danışmanlarımız sorularınızı en kısa sürede yanıtlayacak.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label
              htmlFor="name"
              className="mb-1.5 block text-sm font-semibold text-slate-700"
            >
              Adınız Soyadınız *
            </label>
            <input
              type="text"
              id="name"
              required
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              placeholder={t(locale, "namePlaceholder")}
            />
          </div>
          <div>
            <label
              htmlFor="phone"
              className="mb-1.5 block text-sm font-semibold text-slate-700"
            >
              Telefon Numaranız *
            </label>
            <input
              type="tel"
              id="phone"
              required
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
              className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              placeholder={t(locale, "phonePlaceholder")}
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="email"
            className="mb-1.5 block text-sm font-semibold text-slate-700"
          >
            E-posta Adresiniz *
          </label>
          <input
            type="email"
            id="email"
            required
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            placeholder={t(locale, "emailPlaceholder")}
          />
        </div>

        <div>
          <label
            htmlFor="question"
            className="mb-1.5 block text-sm font-semibold text-slate-700"
          >
            Sorunuz *
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
          Formunu göndererek{" "}
          <a href="/gizlilik" className="text-primary hover:underline">
            Gizlilik Politikası
          </a>
          &apos;nı kabul etmiş olursunuz.
        </p>
      </form>
    </div>
  );
}
