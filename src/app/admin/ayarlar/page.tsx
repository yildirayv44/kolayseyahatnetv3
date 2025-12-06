"use client";

import { Settings, Globe, Mail, Phone, MapPin, Clock, Gift } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export default function SettingsPage() {
  const [exitIntentEnabled, setExitIntentEnabled] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  useEffect(() => {
    // Mevcut ayarı yükle
    const loadSettings = async () => {
      try {
        const { data, error } = await supabase
          .from("settings")
          .select("val")
          .eq("name", "exit_intent_popup_enabled")
          .maybeSingle();

        if (error) {
          console.error("Settings load error:", error);
          return;
        }

        if (data) {
          setExitIntentEnabled(data.val === "true");
        }
      } catch (error) {
        console.error("Settings load error:", error);
      }
    };

    loadSettings();
  }, []);

  const handleSaveExitIntent = async () => {
    setIsSaving(true);
    setSaveMessage("");

    try {
      // Upsert kullan - kayıt yoksa ekle, varsa güncelle
      const { error } = await supabase
        .from("settings")
        .upsert({ 
          name: "exit_intent_popup_enabled",
          val: exitIntentEnabled ? "true" : "false",
          updated_at: new Date().toISOString()
        }, {
          onConflict: "name"
        });

      if (error) throw error;

      setSaveMessage("✅ Ayarlar kaydedildi!");
      setTimeout(() => setSaveMessage(""), 3000);
    } catch (error: any) {
      console.error("Save error:", error);
      setSaveMessage(`❌ Kaydetme hatası: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Ayarlar</h2>
        <p className="text-sm text-slate-600">Site ayarlarını yönetin</p>
      </div>

      {/* Exit Intent Popup Settings */}
      <div className="card">
        <div className="mb-4 flex items-center gap-3">
          <div className="rounded-lg bg-purple-500 p-2">
            <Gift className="h-5 w-5 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900">Exit Intent Popup</h3>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border border-slate-200 p-4">
            <div>
              <p className="font-semibold text-slate-900">Popup Durumu</p>
              <p className="text-sm text-slate-600">
                "Bekle! Gitmeden Önce..." popup'ını {exitIntentEnabled ? "aktif" : "devre dışı"}
              </p>
            </div>
            <button
              onClick={() => setExitIntentEnabled(!exitIntentEnabled)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                exitIntentEnabled ? "bg-primary" : "bg-slate-300"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  exitIntentEnabled ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          <div className="rounded-lg bg-slate-50 p-4">
            <p className="text-sm text-slate-600">
              <strong>Açıklama:</strong> Bu popup, kullanıcı sayfadan çıkmaya çalıştığında gösterilir ve %10 indirim kodu karşılığında email adresi toplar.
            </p>
          </div>

          <button
            onClick={handleSaveExitIntent}
            disabled={isSaving}
            className="w-full rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:bg-primary-dark hover:shadow-xl disabled:opacity-50"
          >
            {isSaving ? "Kaydediliyor..." : "Kaydet"}
          </button>

          {saveMessage && (
            <div className={`rounded-lg p-3 text-center text-sm font-medium ${
              saveMessage.includes("✅") ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
            }`}>
              {saveMessage}
            </div>
          )}
        </div>
      </div>

      {/* Settings Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* General Settings */}
        <div className="card">
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-lg bg-primary p-2">
              <Settings className="h-5 w-5 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900">Genel Ayarlar</h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-900">Site Adı</label>
              <input
                type="text"
                defaultValue="Kolay Seyahat"
                className="mt-1 w-full rounded-lg border border-slate-200 px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-900">Site Açıklaması</label>
              <textarea
                rows={3}
                defaultValue="Profesyonel vize danışmanlığı hizmeti"
                className="mt-1 w-full rounded-lg border border-slate-200 px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-900">Site URL</label>
              <div className="relative mt-1">
                <Globe className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <input
                  type="url"
                  defaultValue="https://www.kolayseyahat.net"
                  className="w-full rounded-lg border border-slate-200 py-2 pl-10 pr-4 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Contact Settings */}
        <div className="card">
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-lg bg-emerald-500 p-2">
              <Phone className="h-5 w-5 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900">İletişim Bilgileri</h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-900">Telefon</label>
              <div className="relative mt-1">
                <Phone className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <input
                  type="tel"
                  defaultValue="0212 909 99 71"
                  className="w-full rounded-lg border border-slate-200 py-2 pl-10 pr-4 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-900">E-posta</label>
              <div className="relative mt-1">
                <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  defaultValue="vize@kolayseyahat.net"
                  className="w-full rounded-lg border border-slate-200 py-2 pl-10 pr-4 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-900">Adres</label>
              <div className="relative mt-1">
                <MapPin className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                <textarea
                  rows={3}
                  defaultValue="İstanbul, Türkiye"
                  className="w-full rounded-lg border border-slate-200 py-2 pl-10 pr-4 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-900">Çalışma Saatleri</label>
              <div className="relative mt-1">
                <Clock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  defaultValue="Pazartesi - Cuma: 09:00 - 18:00"
                  className="w-full rounded-lg border border-slate-200 py-2 pl-10 pr-4 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button className="rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:bg-primary-dark hover:shadow-xl">
          Değişiklikleri Kaydet
        </button>
      </div>
    </div>
  );
}
