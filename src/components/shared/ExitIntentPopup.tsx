"use client";

import { useState, useEffect } from "react";
import { X, Gift, Mail, ArrowRight } from "lucide-react";
import { supabase } from "@/lib/supabase";

export function ExitIntentPopup() {
  const [isVisible, setIsVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    // LocalStorage'dan kontrol et
    const hasSeenPopup = localStorage.getItem("exit-intent-seen");
    const hasSubscribed = localStorage.getItem("exit-intent-subscribed");
    
    if (hasSubscribed) {
      return; // Abone oldu, bir daha gösterme
    }

    let hasShownPopup = false;

    const handleMouseLeave = (e: MouseEvent) => {
      // Sadece üst kısımdan çıkışta göster (cursor yukarı gidiyor)
      if (e.clientY <= 0 && !hasShownPopup) {
        hasShownPopup = true;
        setIsVisible(true);
        localStorage.setItem("exit-intent-seen", "true");
      }
    };

    // TEST: 5 saniye sonra otomatik göster (test için)
    // Production'da bu satırı kaldırın veya yorum yapın
    const testTimer = setTimeout(() => {
      if (!hasSeenPopup && !hasShownPopup) {
        hasShownPopup = true;
        setIsVisible(true);
        console.log("🎁 Exit Intent Popup (Test Mode - 5 saniye sonra otomatik açıldı)");
      }
    }, 5000);

    // 3 saniye sonra event listener ekle
    const timer = setTimeout(() => {
      document.addEventListener("mouseleave", handleMouseLeave);
    }, 3000);

    return () => {
      clearTimeout(timer);
      clearTimeout(testTimer);
      document.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  const handleClose = () => {
    setIsVisible(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Email validasyonu
    if (!email || !email.includes("@")) {
      alert("Lütfen geçerli bir email adresi girin");
      setIsSubmitting(false);
      return;
    }

    try {
      // Supabase'e kaydet
      const { error } = await supabase
        .from("email_subscribers")
        .insert([
          {
            email: email.toLowerCase().trim(),
            source: "exit_intent",
            discount_code: "HOSGELDIN10",
          },
        ]);

      if (error) {
        // Email zaten kayıtlı olabilir (unique constraint)
        if (error.code === "23505") {
          // Duplicate email - yine de success göster
          console.log("Email zaten kayıtlı");
        } else {
          throw error;
        }
      }

      console.log("✅ Email kaydedildi:", email);

      setIsSuccess(true);
      localStorage.setItem("exit-intent-subscribed", "true");

      // 3 saniye sonra kapat
      setTimeout(() => {
        setIsVisible(false);
      }, 3000);
    } catch (error: any) {
      console.error("❌ Email kaydetme hatası:", error);
      alert("Bir hata oluştu. Lütfen tekrar deneyin.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isVisible) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={handleClose}
      />

      {/* Popup */}
      <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 animate-in zoom-in-95 duration-300">
        <div className="relative overflow-hidden rounded-2xl bg-white shadow-2xl">
          {/* Close Button */}
          <button
            onClick={handleClose}
            className="absolute right-4 top-4 z-10 rounded-full bg-white/80 p-2 text-slate-600 transition-colors hover:bg-white hover:text-slate-900"
            aria-label="Kapat"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Success State */}
          {isSuccess ? (
            <div className="p-8 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
                <Gift className="h-8 w-8 text-emerald-600" />
              </div>
              <h3 className="mb-2 text-2xl font-bold text-slate-900">
                Teşekkürler! 🎉
              </h3>
              <p className="text-slate-600">
                %10 indirim kodunuz email adresinize gönderildi.
              </p>
              <p className="mt-4 text-sm text-slate-500">
                İndirim Kodu: <span className="font-bold text-primary">HOSGELDIN10</span>
              </p>
            </div>
          ) : (
            <>
              {/* Header Image */}
              <div className="relative h-32 bg-gradient-to-br from-primary to-blue-600">
                <div className="absolute inset-0 flex items-center justify-center">
                  <Gift className="h-16 w-16 text-white/90" />
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="mb-4 text-center">
                  <h2 className="mb-2 text-2xl font-bold text-slate-900">
                    Bekle! Gitmeden Önce... 🎁
                  </h2>
                  <p className="text-slate-600">
                    Email adresinizi bırakın, <span className="font-bold text-primary">%10 indirim</span> kazanın!
                  </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Email adresiniz"
                      required
                      className="w-full rounded-lg border border-slate-200 py-3 pl-10 pr-4 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 font-semibold text-white transition-colors hover:bg-primary-dark disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      "Gönderiliyor..."
                    ) : (
                      <>
                        %10 İndirim Kodu Al
                        <ArrowRight className="h-5 w-5" />
                      </>
                    )}
                  </button>
                </form>

                {/* Benefits */}
                <div className="mt-6 space-y-2 border-t border-slate-100 pt-4">
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100">
                      <span className="text-xs text-emerald-600">✓</span>
                    </div>
                    <span>Tüm vize başvurularında geçerli</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100">
                      <span className="text-xs text-emerald-600">✓</span>
                    </div>
                    <span>30 gün geçerlilik süresi</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100">
                      <span className="text-xs text-emerald-600">✓</span>
                    </div>
                    <span>Spam göndermiyoruz, söz!</span>
                  </div>
                </div>

                {/* Small Print */}
                <p className="mt-4 text-center text-xs text-slate-400">
                  Email adresinizi paylaşarak{" "}
                  <a href="/gizlilik" className="underline hover:text-slate-600">
                    gizlilik politikamızı
                  </a>{" "}
                  kabul etmiş olursunuz.
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
