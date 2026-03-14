"use client";

import { useState, useEffect } from "react";
import { MessageCircle, X } from "lucide-react";
import Image from "next/image";

export function WhatsAppWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  // Widget'ı 3 saniye sonra göster
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 3000);
    return () => clearTimeout(timer);
  }, []);

  const phoneNumber = "12314032205"; // WhatsApp numarası +1 (231) 403-2205
  const message = "Merhaba! Web sitesinden ulaşıyorum. Vize başvurusu hakkında bilgi almak istiyorum.";
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

  if (!isVisible) return null;

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-all hover:scale-110 hover:shadow-xl"
        aria-label="WhatsApp ile iletişime geç"
      >
        {isOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <MessageCircle className="h-6 w-6" />
        )}
      </button>

      {/* Chat Popup */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-80 overflow-hidden rounded-2xl bg-white shadow-2xl">
          {/* Header */}
          <div className="bg-[#25D366] p-4 text-white">
            <div className="flex items-center gap-3">
              <div className="relative h-12 w-12 overflow-hidden rounded-full bg-white">
                <Image
                  src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&h=100&fit=crop"
                  alt="Müşteri Temsilcisi"
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <h3 className="font-semibold">Kolay Seyahat</h3>
                <p className="text-xs text-white/90">Genellikle birkaç dakika içinde yanıt verir</p>
              </div>
            </div>
          </div>

          {/* Message */}
          <div className="bg-slate-50 p-4">
            <div className="rounded-lg bg-white p-3 shadow-sm">
              <p className="text-sm text-slate-700">
                👋 Merhaba! Size nasıl yardımcı olabilirim?
              </p>
              <p className="mt-2 text-xs text-slate-500">
                Vize başvurusu, fiyat bilgisi veya süreç hakkında sorularınızı yanıtlayabilirim.
              </p>
            </div>
          </div>

          {/* CTA */}
          <div className="p-4">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#25D366] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#20BA5A]"
            >
              <MessageCircle className="h-5 w-5" />
              WhatsApp'tan Mesaj Gönder
            </a>
            <p className="mt-2 text-center text-xs text-slate-500">
              7/24 Destek • Anında Yanıt
            </p>
          </div>
        </div>
      )}

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
