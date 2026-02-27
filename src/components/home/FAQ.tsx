"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { ApplicationFormLink } from "@/components/shared/ApplicationFormLink";

interface FAQItem {
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    question: "Vize başvurusu ne kadar sürer?",
    answer:
      "Vize başvuru süresi ülkeye göre değişmektedir. Ortalama olarak Amerika vizesi 7-14 gün, Schengen vizesi 10-15 gün, İngiltere vizesi 15-20 gün sürmektedir. Evraklarınız eksiksiz olduğunda randevu sürecini 48 saat içinde başlatıyoruz.",
  },
  {
    question: "Hangi belgeler gereklidir?",
    answer:
      "Gerekli belgeler ülkeye ve vize türüne göre değişir. Genel olarak pasaport, fotoğraf, banka hesap özeti, iş belgesi, seyahat sigortası ve otel rezervasyonu gereklidir. Detaylı bilgi için ilgili ülke sayfasını ziyaret edebilir veya danışmanlarımızla iletişime geçebilirsiniz.",
  },
  {
    question: "Vize ücreti ne kadardır?",
    answer:
      "Vize ücretleri ülkeye ve vize türüne göre değişmektedir. Amerika vizesi yaklaşık 185$, Schengen vizesi 80€, İngiltere vizesi 115£ civarındadır. Danışmanlık hizmet ücretimiz için lütfen bizimle iletişime geçin.",
  },
  {
    question: "Vize reddedilirse ne olur?",
    answer:
      "Vize reddedilmesi durumunda red sebebini analiz eder ve yeniden başvuru için gerekli adımları planlarız. Evraklarınızı güçlendirerek tekrar başvuru yapabilirsiniz. Danışmanlık hizmetimiz bu süreçte size rehberlik eder.",
  },
  {
    question: "Online başvuru nasıl yapılır?",
    answer:
      "Web sitemizden 'Başvuru Yap' butonuna tıklayarak online başvuru formunu doldurabilirsiniz. Formunuzu aldıktan sonra danışmanlarımız 24 saat içinde sizinle iletişime geçecektir. Evraklarınızı hazırlama ve randevu alma sürecinde size yardımcı olacağız.",
  },
  {
    question: "Randevu tarihini değiştirebilir miyim?",
    answer:
      "Evet, randevu tarihinizi değiştirebilirsiniz. Ancak bu durum ülkeye ve konsolosluk yoğunluğuna göre değişiklik gösterebilir. Randevu değişikliği için en kısa sürede danışmanlarımızla iletişime geçmenizi öneririz.",
  },
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-12">
      <div className="mx-auto max-w-4xl px-4">
        <div className="mb-8 text-center">
          <h2 className="mb-2 text-2xl font-bold text-slate-900">
            Sıkça Sorulan Sorular
          </h2>
          <p className="text-slate-600">
            Vize başvurusu hakkında merak ettikleriniz
          </p>
        </div>

        <div className="space-y-2">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                className={`overflow-hidden rounded-lg border bg-white transition-all ${
                  isOpen
                    ? "border-slate-300 shadow-sm"
                    : "border-slate-200 hover:border-slate-300"
                }`}
              >
                <button
                  onClick={() => toggleFAQ(index)}
                  className="flex w-full items-center justify-between gap-4 px-5 py-3.5 text-left"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-slate-500">
                      {index + 1}
                    </span>
                    <span className="text-sm font-medium text-slate-900">
                      {faq.question}
                    </span>
                  </div>
                  <ChevronDown
                    className={`h-4 w-4 shrink-0 text-slate-400 transition-transform duration-200 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
                <div
                  className={`grid transition-all duration-300 ease-in-out ${
                    isOpen
                      ? "grid-rows-[1fr]"
                      : "grid-rows-[0fr]"
                  }`}
                >
                  <div className="overflow-hidden">
                    <div className="border-t border-slate-100 px-5 py-4 pl-11">
                      <div className="flex gap-2">
                        <span className="text-base">💡</span>
                        <p className="text-sm leading-relaxed text-slate-600">
                          {faq.answer}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-12 rounded-2xl bg-gradient-to-br from-primary/10 via-blue-50 to-white px-6 py-10 text-center md:px-10">
          <h3 className="mb-3 text-2xl font-bold text-slate-900">
            Hala Sorunuz mu Var?
          </h3>
          <p className="mx-auto mb-8 max-w-xl text-base leading-relaxed text-slate-600">
            Uzman danışmanlarımız vize sürecinizle ilgili tüm sorularınızı yanıtlamak ve size en iyi hizmeti sunmak için 7/24 hazır.
          </p>
          <div className="mx-auto flex max-w-lg flex-col gap-4 sm:flex-row">
            <a
              href="tel:02129099971"
              className="flex-1 rounded-xl border-2 border-primary bg-white px-8 py-4 text-base font-bold text-primary shadow-lg transition-all hover:bg-primary hover:text-white hover:shadow-xl"
            >
              0212 909 99 71
            </a>
            <ApplicationFormLink
              className="flex-1 rounded-xl bg-primary px-8 py-4 text-base font-bold text-white shadow-xl transition-all hover:bg-primary/90 hover:shadow-2xl"
            >
              Hemen Başvur
            </ApplicationFormLink>
          </div>
          <p className="mt-6 text-sm text-slate-500">
            ⚡ Ortalama yanıt süresi: 2 dakika
          </p>
        </div>
      </div>
    </section>
  );
}
