"use client";

import { useState, useEffect } from "react";
import { Bell, X } from "lucide-react";

export function PushNotificationPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>("default");

  useEffect(() => {
    // Check if browser supports notifications
    if (!("Notification" in window)) {
      return;
    }

    setPermission(Notification.permission);

    // Show prompt if not decided yet
    if (Notification.permission === "default") {
      const dismissed = localStorage.getItem("push-notification-dismissed");
      if (!dismissed) {
        // Show after 10 seconds
        setTimeout(() => setShowPrompt(true), 10000);
      }
    }
  }, []);

  const requestPermission = async () => {
    try {
      const result = await Notification.requestPermission();
      setPermission(result);

      if (result === "granted") {
        // Show welcome notification
        new Notification("Kolay Seyahat", {
          body: "Bildirimler aktif! Yeni blog yazıları ve vize güncellemeleri için sizi bilgilendireceğiz.",
          icon: "/icon-192.png",
          badge: "/icon-192.png",
        });

        setShowPrompt(false);
      }
    } catch (error) {
      console.error("Notification permission error:", error);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem("push-notification-dismissed", "true");
  };

  if (!showPrompt || permission !== "default") return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 md:bottom-4 md:left-auto md:right-4 md:w-96">
      <div className="card relative animate-slide-up border-primary/20 bg-gradient-to-br from-white to-primary/5 shadow-2xl">
        <button
          onClick={handleDismiss}
          className="absolute right-2 top-2 rounded-full p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
          aria-label="Kapat"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
            <Bell className="h-6 w-6 text-primary" />
          </div>

          <div className="flex-1">
            <h3 className="mb-1 font-semibold text-slate-900">
              Bildirimleri Aç
            </h3>
            <p className="mb-4 text-sm text-slate-600">
              Yeni blog yazıları, vize güncellemeleri ve özel fırsatlardan haberdar olun.
            </p>

            <div className="flex gap-2">
              <button
                onClick={requestPermission}
                className="flex-1 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary/90"
              >
                İzin Ver
              </button>
              <button
                onClick={handleDismiss}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
              >
                Daha Sonra
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
