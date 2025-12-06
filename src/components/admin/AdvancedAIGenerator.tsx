"use client";

import { useState } from "react";
import { Sparkles, Loader2, Image as ImageIcon, FileText, CheckCircle } from "lucide-react";

interface AdvancedAIGeneratorProps {
  type: "blog" | "country" | "page";
  onGenerate: (data: {
    title: string;
    description: string;
    contents: string;
    image_url?: string;
  }) => void;
  initialTopic?: string;
  countryName?: string;
}

export function AdvancedAIGenerator({
  type,
  onGenerate,
  initialTopic = "",
  countryName = "",
}: AdvancedAIGeneratorProps) {
  const [loading, setLoading] = useState(false);
  const [topic, setTopic] = useState(initialTopic);
  const [includeImages, setIncludeImages] = useState(true);
  const [imageCount, setImageCount] = useState(3);
  const [progress, setProgress] = useState<string[]>([]);

  const addProgress = (message: string) => {
    setProgress(prev => [...prev, message]);
  };

  const generateSmartQuery = async (title: string): Promise<string> => {
    try {
      const response = await fetch('/api/admin/images/generate-query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title }),
      });

      const data = await response.json();
      if (data.success) {
        return data.query;
      }
      return title;
    } catch (error) {
      console.error('Smart query generation failed:', error);
      return title;
    }
  };

  const searchPexelsImage = async (query: string): Promise<string | null> => {
    try {
      const response = await fetch(
        `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=15&orientation=landscape`,
        {
          headers: {
            Authorization: process.env.NEXT_PUBLIC_PEXELS_API_KEY || '',
          },
        }
      );

      const data = await response.json();
      if (data.photos && data.photos.length > 0) {
        const randomIndex = Math.floor(Math.random() * Math.min(data.photos.length, 10));
        return data.photos[randomIndex].src.large;
      }
      return null;
    } catch (error) {
      console.error('Pexels search failed:', error);
      return null;
    }
  };

  const insertImagesIntoContent = async (content: string, mainTopic: string): Promise<string> => {
    if (!includeImages || imageCount === 0) return content;

    addProgress(`📸 ${imageCount} görsel aranıyor...`);

    // Split content into sections by H2 headings
    const sections = content.split(/(?=##\s)/);
    
    if (sections.length < 2) return content;

    // Calculate how many images to insert
    const imagesToInsert = Math.min(imageCount, sections.length - 1);
    const sectionInterval = Math.floor(sections.length / (imagesToInsert + 1));

    let modifiedContent = sections[0]; // Keep intro as is

    for (let i = 1; i < sections.length; i++) {
      // Add section content
      modifiedContent += sections[i];

      // Insert image after certain sections
      if (i % sectionInterval === 0 && imagesToInsert > 0) {
        // Extract section title for better image search
        const sectionTitle = sections[i].match(/##\s+(.+)/)?.[1] || mainTopic;
        
        addProgress(`🔍 "${sectionTitle}" için görsel aranıyor...`);
        
        const smartQuery = await generateSmartQuery(sectionTitle);
        const imageUrl = await searchPexelsImage(smartQuery);

        if (imageUrl) {
          const imageMarkdown = `\n\n![${sectionTitle}](${imageUrl})\n\n`;
          modifiedContent += imageMarkdown;
          addProgress(`✅ Görsel eklendi`);
        }
      }
    }

    return modifiedContent;
  };

  const handleGenerate = async () => {
    if (!topic.trim() && !countryName) {
      alert("Lütfen bir konu girin!");
      return;
    }

    setLoading(true);
    setProgress([]);

    try {
      const finalTopic = countryName || topic;
      
      addProgress("🤖 AI içerik oluşturuluyor...");

      // Generate content
      const response = await fetch('/api/admin/content/generate-blog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: finalTopic,
          keywords: [],
          tone: 'informative',
          language: 'tr',
          type: type,
        }),
      });

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'İçerik oluşturulamadı');
      }

      addProgress("✅ İçerik oluşturuldu");

      let finalContent = data.content;

      // Insert images into content
      if (includeImages) {
        finalContent = await insertImagesIntoContent(finalContent, finalTopic);
      }

      // Get cover image
      let coverImage = "";
      if (includeImages) {
        addProgress("🖼️ Kapak görseli aranıyor...");
        const smartQuery = await generateSmartQuery(finalTopic);
        const imageUrl = await searchPexelsImage(smartQuery);
        if (imageUrl) {
          coverImage = imageUrl;
          addProgress("✅ Kapak görseli bulundu");
        }
      }

      addProgress("🎉 Tamamlandı!");

      // Return all generated data
      onGenerate({
        title: data.title || finalTopic,
        description: data.meta_description || "",
        contents: finalContent,
        image_url: coverImage,
      });

      alert(
        `✅ İçerik başarıyla oluşturuldu!\n\n` +
        `📝 ${data.word_count} kelime\n` +
        `⏱️ ${data.reading_time} dakika okuma süresi\n` +
        `📸 ${includeImages ? imageCount + ' görsel eklendi' : 'Görsel eklenmedi'}`
      );

      setTopic("");
      setProgress([]);
    } catch (error: any) {
      console.error("AI generation error:", error);
      alert("Hata: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 rounded-lg border-2 border-purple-200 bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 p-6">
      <div className="flex items-center gap-3">
        <div className="rounded-full bg-purple-600 p-2">
          <Sparkles className="h-5 w-5 text-white" />
        </div>
        <div>
          <h3 className="font-bold text-purple-900">Gelişmiş AI İçerik Oluşturucu</h3>
          <p className="text-xs text-purple-600">Başlık, açıklama, içerik ve görseller otomatik oluşturulur</p>
        </div>
      </div>

      {!countryName && (
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-slate-700">
            {type === "blog" ? "Blog Konusu" : type === "country" ? "Ülke Adı" : "Sayfa Konusu"} *
          </label>
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder={
              type === "blog" 
                ? "Örn: Japonya Turist Vizesi Başvurusu 2024" 
                : type === "country"
                ? "Örn: Japonya"
                : "Örn: Vize Başvuru Süreci"
            }
            className="w-full rounded-lg border border-purple-200 px-4 py-3 text-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200"
          />
        </div>
      )}

      {countryName && (
        <div className="rounded-lg bg-white p-4 border border-purple-200">
          <p className="text-sm text-slate-700">
            <strong className="text-purple-700">{countryName}</strong> için kapsamlı içerik oluşturulacak
          </p>
        </div>
      )}

      {/* Image Options */}
      <div className="space-y-3 rounded-lg bg-white p-4 border border-purple-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ImageIcon className="h-4 w-4 text-purple-600" />
            <label className="text-sm font-semibold text-slate-700">Otomatik Görsel Ekleme</label>
          </div>
          <button
            type="button"
            onClick={() => setIncludeImages(!includeImages)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              includeImages ? 'bg-purple-600' : 'bg-slate-300'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                includeImages ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {includeImages && (
          <div className="space-y-2">
            <label className="block text-xs font-medium text-slate-600">
              İçeriğe eklenecek görsel sayısı: {imageCount}
            </label>
            <input
              type="range"
              min="1"
              max="5"
              value={imageCount}
              onChange={(e) => setImageCount(parseInt(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-slate-500">
              <span>1 görsel</span>
              <span>5 görsel</span>
            </div>
          </div>
        )}
      </div>

      {/* Progress */}
      {progress.length > 0 && (
        <div className="space-y-2 rounded-lg bg-white p-4 border border-purple-200">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
            <FileText className="h-4 w-4" />
            İlerleme
          </div>
          <div className="space-y-1">
            {progress.map((msg, idx) => (
              <div key={idx} className="flex items-start gap-2 text-xs text-slate-600">
                <CheckCircle className="h-3 w-3 mt-0.5 flex-shrink-0 text-green-600" />
                <span>{msg}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Generate Button */}
      <button
        type="button"
        onClick={handleGenerate}
        disabled={loading || (!topic.trim() && !countryName)}
        className="w-full rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-4 font-bold text-white shadow-lg hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            Oluşturuluyor... ({progress.length} adım tamamlandı)
          </span>
        ) : (
          <span className="flex items-center justify-center gap-2">
            <Sparkles className="h-5 w-5" />
            🚀 Tam Otomatik İçerik Oluştur
          </span>
        )}
      </button>

      <div className="rounded-lg bg-blue-50 p-3 border border-blue-200">
        <p className="text-xs text-blue-800">
          <strong>✨ Otomatik oluşturulacaklar:</strong>
        </p>
        <ul className="mt-2 space-y-1 text-xs text-blue-700">
          <li>• 📝 Profesyonel başlık</li>
          <li>• 📄 SEO-optimized açıklama</li>
          <li>• 📚 1200+ kelime detaylı içerik</li>
          <li>• 🖼️ Kapak görseli {includeImages && '(Pexels)'}</li>
          {includeImages && <li>• 📸 İçeriğe {imageCount} adet görsel eklenir</li>}
        </ul>
      </div>
    </div>
  );
}
