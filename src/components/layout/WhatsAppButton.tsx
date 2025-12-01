"use client";

import { MessageCircle } from "lucide-react";

export function WhatsAppButton() {
  return (
    <a
      href="https://wa.me/902129099971"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-5 right-4 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-green-500 text-white shadow-lg transition hover:bg-green-600 md:bottom-8 md:right-8"
      aria-label="WhatsApp ile iletişim kur"
    >
      <MessageCircle className="h-6 w-6" />
    </a>
  );
}
