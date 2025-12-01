"use client";

import { useState } from "react";
import { Sparkles, Loader2, Wand2, RefreshCw } from "lucide-react";

interface AIContentGeneratorProps {
  type: "country" | "blog";
  currentContent: string;
  countryName?: string;
  onGenerate: (content: string) => void;
}

export function AIContentGenerator({
  type,
  currentContent,
  countryName,
  onGenerate,
}: AIContentGeneratorProps) {
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"generate" | "improve">("generate");
  const [topic, setTopic] = useState("");
  const [instructions, setInstructions] = useState("");

  const handleGenerate = async () => {
    setLoading(true);

    try {
      let response;

      if (type === "country" && countryName) {
        response = await fetch("/api/ai/generate-country", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ countryName }),
        });
      } else if (type === "blog") {
        response = await fetch("/api/ai/generate-blog", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ topic }),
        });
      }

      if (!response) {
        throw new Error("Invalid request");
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "İçerik oluşturulamadı");
      }

      onGenerate(data.content);
      alert("✨ İçerik başarıyla oluşturuldu!");
    } catch (error: any) {
      console.error("AI generation error:", error);
      alert("Hata: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleImprove = async () => {
    if (!currentContent.trim()) {
      alert("Geliştirmek için önce içerik girmelisiniz");
      return;
    }

    if (!instructions.trim()) {
      alert("Lütfen geliştirme talimatları girin");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/ai/improve-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: currentContent, instructions }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "İçerik geliştirilemedi");
      }

      onGenerate(data.content);
      setInstructions("");
      alert("✨ İçerik başarıyla geliştirildi!");
    } catch (error: any) {
      console.error("AI improve error:", error);
      alert("Hata: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3 rounded-lg border border-purple-200 bg-gradient-to-br from-purple-50 to-blue-50 p-4">
      <div className="flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-purple-600" />
        <h3 className="font-semibold text-purple-900">AI İçerik Asistanı</h3>
      </div>

      {/* Mode Selector */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setMode("generate")}
          className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            mode === "generate"
              ? "bg-purple-600 text-white"
              : "bg-white text-purple-600 hover:bg-purple-100"
          }`}
        >
          <Wand2 className="mx-auto mb-1 h-4 w-4" />
          Yeni İçerik Oluştur
        </button>
        <button
          type="button"
          onClick={() => setMode("improve")}
          className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            mode === "improve"
              ? "bg-purple-600 text-white"
              : "bg-white text-purple-600 hover:bg-purple-100"
          }`}
        >
          <RefreshCw className="mx-auto mb-1 h-4 w-4" />
          Mevcut İçeriği Geliştir
        </button>
      </div>

      {/* Generate Mode */}
      {mode === "generate" && (
        <div className="space-y-3">
          {type === "country" && countryName && (
            <div className="rounded-lg bg-white p-3">
              <p className="text-sm text-slate-600">
                <strong>{countryName}</strong> vizesi hakkında kapsamlı bir içerik oluşturulacak.
              </p>
            </div>
          )}

          {type === "blog" && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">
                Blog Konusu
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Örn: Schengen Vizesi Başvuru İpuçları"
                className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200"
              />
            </div>
          )}

          <button
            type="button"
            onClick={handleGenerate}
            disabled={loading || (type === "blog" && !topic.trim())}
            className="w-full rounded-lg bg-purple-600 px-4 py-3 font-semibold text-white hover:bg-purple-700 disabled:opacity-50"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                İçerik Oluşturuluyor...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <Sparkles className="h-4 w-4" />
                AI ile İçerik Oluştur
              </span>
            )}
          </button>
        </div>
      )}

      {/* Improve Mode */}
      {mode === "improve" && (
        <div className="space-y-3">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">
              Geliştirme Talimatları
            </label>
            <textarea
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="Örn: Daha detaylı yap, SEO için optimize et, daha resmi bir dil kullan..."
              rows={3}
              className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200"
            />
          </div>

          <button
            type="button"
            onClick={handleImprove}
            disabled={loading || !instructions.trim()}
            className="w-full rounded-lg bg-purple-600 px-4 py-3 font-semibold text-white hover:bg-purple-700 disabled:opacity-50"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                İçerik Geliştiriliyor...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <RefreshCw className="h-4 w-4" />
                AI ile Geliştir
              </span>
            )}
          </button>
        </div>
      )}

      <p className="text-xs text-slate-500">
        💡 <strong>İpucu:</strong> AI tarafından oluşturulan içeriği mutlaka gözden geçirin ve
        düzenleyin.
      </p>
    </div>
  );
}
