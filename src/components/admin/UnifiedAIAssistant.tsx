"use client";

import { useState } from "react";
import { 
  Sparkles, 
  Loader2, 
  Image as ImageIcon, 
  FileText, 
  CheckCircle,
  Wand2,
  RefreshCw,
  ChevronDown,
  ChevronUp
} from "lucide-react";

interface UnifiedAIAssistantProps {
  type: "blog" | "country" | "page";
  onGenerate: (data: {
    title?: string;
    description?: string;
    contents?: string;
    image_url?: string;
    slug?: string;
    meta_title?: string;
    meta_description?: string;
  }) => void;
  initialTopic?: string;
  countryName?: string;
  currentContent?: string;
}

export function UnifiedAIAssistant({
  type,
  onGenerate,
  initialTopic = "",
  countryName = "",
  currentContent = "",
}: UnifiedAIAssistantProps) {
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"full" | "content" | "improve">("full");
  const [topic, setTopic] = useState(initialTopic);
  const [additionalContext, setAdditionalContext] = useState("");
  const [includeImages, setIncludeImages] = useState(true);
  const [imageCount, setImageCount] = useState(3);
  const [progress, setProgress] = useState<string[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [tone, setTone] = useState<"informative" | "friendly" | "formal">("informative");
  const [language, setLanguage] = useState<"tr" | "en">("tr");
  const [wordCount, setWordCount] = useState(1500);
  const [showAdvanced, setShowAdvanced] = useState(false);

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

    const sections = content.split(/(?=##\s)/);
    
    if (sections.length < 2) return content;

    const imagesToInsert = Math.min(imageCount, sections.length - 1);
    const sectionInterval = Math.floor(sections.length / (imagesToInsert + 1));

    let modifiedContent = sections[0];

    for (let i = 1; i < sections.length; i++) {
      modifiedContent += sections[i];

      if (i % sectionInterval === 0 && imagesToInsert > 0) {
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

  const handleFullGeneration = async () => {
    if (!topic.trim() && !countryName) {
      alert("Lütfen bir konu girin!");
      return;
    }

    setLoading(true);
    setProgress([]);

    try {
      const finalTopic = countryName || topic;
      
      addProgress("🤖 AI içerik oluşturuluyor...");

      // Prepare request body with additional context
      const requestBody: any = {
        title: finalTopic,
        keywords: [],
        tone: tone,
        language: language,
        type: type,
        wordCount: wordCount,
      };

      // Add additional context if provided
      if (additionalContext.trim()) {
        requestBody.additionalContext = additionalContext;
        addProgress("📝 Ek bilgiler dikkate alınıyor...");
      }

      const response = await fetch('/api/admin/content/generate-blog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'İçerik oluşturulamadı');
      }

      addProgress("✅ İçerik oluşturuldu");

      let finalContent = data.content;

      if (includeImages) {
        finalContent = await insertImagesIntoContent(finalContent, finalTopic);
      }

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

      onGenerate({
        title: data.meta_title || data.title || finalTopic,
        description: data.meta_description || "",
        contents: finalContent,
        image_url: coverImage,
        slug: data.slug || "",
        meta_title: data.meta_title || "",
        meta_description: data.meta_description || "",
      });

      alert(
        `✅ İçerik başarıyla oluşturuldu!\n\n` +
        `📝 ${data.word_count} kelime\n` +
        `⏱️ ${data.reading_time} dakika okuma süresi\n` +
        `📸 ${includeImages ? imageCount + ' görsel eklendi' : 'Görsel eklenmedi'}`
      );

      setTopic("");
      setAdditionalContext("");
      setProgress([]);
    } catch (error: any) {
      console.error("AI generation error:", error);
      alert("Hata: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleContentOnly = async () => {
    if (!topic.trim() && !countryName) {
      alert("Lütfen bir konu girin!");
      return;
    }

    setLoading(true);
    setProgress([]);

    try {
      const finalTopic = countryName || topic;
      
      addProgress("🤖 Sadece içerik oluşturuluyor...");

      const requestBody: any = {
        title: finalTopic,
        keywords: [],
        tone: 'informative',
        language: 'tr',
        type: type,
      };

      if (additionalContext.trim()) {
        requestBody.additionalContext = additionalContext;
        addProgress("📝 Ek bilgiler dikkate alınıyor...");
      }

      const response = await fetch('/api/admin/content/generate-blog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'İçerik oluşturulamadı');
      }

      addProgress("✅ İçerik oluşturuldu");

      let finalContent = data.content;

      if (includeImages) {
        finalContent = await insertImagesIntoContent(finalContent, finalTopic);
      }

      addProgress("🎉 Tamamlandı!");

      // Only update content, keep existing title and description
      onGenerate({
        title: "",
        description: "",
        contents: finalContent,
        image_url: "",
      });

      alert(`✅ İçerik başarıyla oluşturuldu!\n\n📝 ${data.word_count} kelime`);

      setAdditionalContext("");
      setProgress([]);
    } catch (error: any) {
      console.error("AI generation error:", error);
      alert("Hata: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleImprove = async () => {
    if (!currentContent.trim()) {
      alert("Geliştirmek için önce içerik girmelisiniz!");
      return;
    }

    if (!additionalContext.trim()) {
      alert("Lütfen geliştirme talimatları girin!");
      return;
    }

    setLoading(true);
    setProgress([]);

    try {
      addProgress("🔧 İçerik geliştiriliyor...");

      const response = await fetch('/api/admin/content/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          content: currentContent,
          instructions: additionalContext 
        }),
      });

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'İçerik geliştirilemedi');
      }

      addProgress("✅ İçerik geliştirildi");

      onGenerate({
        title: "",
        description: "",
        contents: data.improved_content || currentContent,
        image_url: "",
      });

      alert("✅ İçerik başarıyla geliştirildi!");

      setAdditionalContext("");
      setProgress([]);
    } catch (error: any) {
      console.error("AI improve error:", error);
      alert("Hata: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = () => {
    if (mode === "full") {
      handleFullGeneration();
    } else if (mode === "content") {
      handleContentOnly();
    } else {
      handleImprove();
    }
  };

  return (
    <div className="space-y-4 rounded-lg border-2 border-purple-200 bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-purple-600 p-2">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-purple-900">🤖 AI İçerik Asistanı</h3>
            <p className="text-xs text-purple-600">
              Tam otomatik içerik oluştur, sadece içerik yaz veya mevcut içeriği geliştir
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="rounded-lg p-2 hover:bg-purple-100 transition-colors"
        >
          {isExpanded ? (
            <ChevronUp className="h-5 w-5 text-purple-600" />
          ) : (
            <ChevronDown className="h-5 w-5 text-purple-600" />
          )}
        </button>
      </div>

      {isExpanded && (
        <>
          {/* Mode Selection */}
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setMode("full")}
              className={`rounded-lg p-3 text-sm font-semibold transition-all ${
                mode === "full"
                  ? "bg-purple-600 text-white shadow-lg"
                  : "bg-white text-slate-700 hover:bg-purple-50"
              }`}
            >
              <Sparkles className="h-4 w-4 mx-auto mb-1" />
              Tam Otomatik
            </button>
            <button
              type="button"
              onClick={() => setMode("content")}
              className={`rounded-lg p-3 text-sm font-semibold transition-all ${
                mode === "content"
                  ? "bg-purple-600 text-white shadow-lg"
                  : "bg-white text-slate-700 hover:bg-purple-50"
              }`}
            >
              <FileText className="h-4 w-4 mx-auto mb-1" />
              Sadece İçerik
            </button>
            <button
              type="button"
              onClick={() => setMode("improve")}
              className={`rounded-lg p-3 text-sm font-semibold transition-all ${
                mode === "improve"
                  ? "bg-purple-600 text-white shadow-lg"
                  : "bg-white text-slate-700 hover:bg-purple-50"
              }`}
            >
              <Wand2 className="h-4 w-4 mx-auto mb-1" />
              Geliştir
            </button>
          </div>

          {/* Mode Description */}
          <div className="rounded-lg bg-white p-3 border border-purple-200">
            <p className="text-xs text-slate-700">
              {mode === "full" && (
                <>
                  <strong className="text-purple-700">Tam Otomatik:</strong> Başlık, açıklama, içerik ve görseller otomatik oluşturulur
                </>
              )}
              {mode === "content" && (
                <>
                  <strong className="text-purple-700">Sadece İçerik:</strong> Mevcut başlık ve açıklamayı korur, sadece içerik oluşturulur
                </>
              )}
              {mode === "improve" && (
                <>
                  <strong className="text-purple-700">Geliştir:</strong> Mevcut içeriği talimatlarınıza göre geliştirir ve iyileştirir
                </>
              )}
            </p>
          </div>

          {/* Topic Input (for full and content modes) */}
          {(mode === "full" || mode === "content") && !countryName && (
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

          {/* Country Name Display */}
          {countryName && (mode === "full" || mode === "content") && (
            <div className="rounded-lg bg-white p-4 border border-purple-200">
              <p className="text-sm text-slate-700">
                <strong className="text-purple-700">{countryName}</strong> için kapsamlı içerik oluşturulacak
              </p>
            </div>
          )}

          {/* Additional Context / Instructions */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-700">
              {mode === "improve" 
                ? "Geliştirme Talimatları *" 
                : "Ek Bilgiler (Opsiyonel)"}
            </label>
            <textarea
              rows={4}
              value={additionalContext}
              onChange={(e) => setAdditionalContext(e.target.value)}
              placeholder={
                mode === "improve"
                  ? "Örn: Daha fazla örnek ekle, daha resmi bir dil kullan, başvuru adımlarını detaylandır..."
                  : "Örn: 2024 güncel bilgileri ekle, online başvuru sürecini vurgula, ücret bilgilerini detaylandır..."
              }
              className="w-full rounded-lg border border-purple-200 px-4 py-3 text-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200"
            />
            <p className="text-xs text-slate-500">
              {mode === "improve"
                ? "AI, mevcut içeriği bu talimatlarınıza göre geliştirecek"
                : "Bu bilgiler AI tarafından içerik oluştururken dikkate alınacak"}
            </p>
          </div>

          {/* Advanced Settings */}
          <div className="space-y-3">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center gap-2 text-sm font-semibold text-purple-700 hover:text-purple-900 transition-colors"
            >
              {showAdvanced ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              Gelişmiş Ayarlar
            </button>

            {showAdvanced && (
              <div className="space-y-3 rounded-lg bg-white p-4 border border-purple-200">
                {/* Tone Selection */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700">Yazım Tonu</label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setTone("informative")}
                      className={`rounded-lg px-3 py-2 text-xs font-medium transition-all ${
                        tone === "informative"
                          ? "bg-purple-600 text-white"
                          : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                      }`}
                    >
                      📚 Bilgilendirici
                    </button>
                    <button
                      type="button"
                      onClick={() => setTone("friendly")}
                      className={`rounded-lg px-3 py-2 text-xs font-medium transition-all ${
                        tone === "friendly"
                          ? "bg-purple-600 text-white"
                          : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                      }`}
                    >
                      😊 Samimi
                    </button>
                    <button
                      type="button"
                      onClick={() => setTone("formal")}
                      className={`rounded-lg px-3 py-2 text-xs font-medium transition-all ${
                        tone === "formal"
                          ? "bg-purple-600 text-white"
                          : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                      }`}
                    >
                      🎩 Resmi
                    </button>
                  </div>
                </div>

                {/* Word Count */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700">
                    Hedef Kelime Sayısı: {wordCount}
                  </label>
                  <input
                    type="range"
                    min="500"
                    max="3000"
                    step="100"
                    value={wordCount}
                    onChange={(e) => setWordCount(parseInt(e.target.value))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>500 kelime</span>
                    <span>3000 kelime</span>
                  </div>
                </div>

                {/* Language Selection */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700">Dil</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setLanguage("tr")}
                      className={`rounded-lg px-3 py-2 text-xs font-medium transition-all ${
                        language === "tr"
                          ? "bg-purple-600 text-white"
                          : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                      }`}
                    >
                      🇹🇷 Türkçe
                    </button>
                    <button
                      type="button"
                      onClick={() => setLanguage("en")}
                      className={`rounded-lg px-3 py-2 text-xs font-medium transition-all ${
                        language === "en"
                          ? "bg-purple-600 text-white"
                          : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                      }`}
                    >
                      🇬🇧 English
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Image Options (not for improve mode) */}
          {mode !== "improve" && (
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
          )}

          {/* Progress */}
          {progress.length > 0 && (
            <div className="space-y-2 rounded-lg bg-white p-4 border border-purple-200">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                <FileText className="h-4 w-4" />
                İlerleme
              </div>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {progress.map((msg, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs text-slate-600">
                    <CheckCircle className="h-3 w-3 mt-0.5 flex-shrink-0 text-green-600" />
                    <span>{msg}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Button */}
          <button
            type="button"
            onClick={handleAction}
            disabled={
              loading || 
              (mode !== "improve" && !topic.trim() && !countryName) ||
              (mode === "improve" && (!currentContent.trim() || !additionalContext.trim()))
            }
            className="w-full rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-4 font-bold text-white shadow-lg hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin" />
                {mode === "improve" ? "Geliştiriliyor..." : "Oluşturuluyor..."} ({progress.length} adım)
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                {mode === "full" && <><Sparkles className="h-5 w-5" /> 🚀 Tam Otomatik Oluştur</>}
                {mode === "content" && <><FileText className="h-5 w-5" /> 📝 Sadece İçerik Oluştur</>}
                {mode === "improve" && <><Wand2 className="h-5 w-5" /> ✨ İçeriği Geliştir</>}
              </span>
            )}
          </button>

          {/* Info Box */}
          <div className="rounded-lg bg-blue-50 p-3 border border-blue-200">
            <p className="text-xs text-blue-800">
              <strong>✨ {mode === "full" ? "Tam Otomatik" : mode === "content" ? "Sadece İçerik" : "Geliştirme"} Modu:</strong>
            </p>
            <ul className="mt-2 space-y-1 text-xs text-blue-700">
              {mode === "full" && (
                <>
                  <li>• 📝 Profesyonel başlık</li>
                  <li>• 📄 SEO-optimized açıklama</li>
                  <li>• 📚 1200+ kelime detaylı içerik</li>
                  <li>• 🖼️ Kapak görseli {includeImages && '(Pexels)'}</li>
                  {includeImages && <li>• 📸 İçeriğe {imageCount} adet görsel eklenir</li>}
                  {additionalContext && <li>• 💡 Ek bilgileriniz dikkate alınır</li>}
                </>
              )}
              {mode === "content" && (
                <>
                  <li>• 📚 1200+ kelime detaylı içerik</li>
                  {includeImages && <li>• 📸 İçeriğe {imageCount} adet görsel eklenir</li>}
                  {additionalContext && <li>• 💡 Ek bilgileriniz dikkate alınır</li>}
                  <li>• ✅ Mevcut başlık ve açıklama korunur</li>
                </>
              )}
              {mode === "improve" && (
                <>
                  <li>• 🔧 Mevcut içerik analiz edilir</li>
                  <li>• 💡 Talimatlarınıza göre geliştirilir</li>
                  <li>• ✨ Daha kaliteli içerik elde edilir</li>
                  <li>• 📝 Yapı ve format korunur</li>
                </>
              )}
            </ul>
          </div>
        </>
      )}
    </div>
  );
}
