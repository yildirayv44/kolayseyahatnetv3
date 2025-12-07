"use client";

import { useState } from "react";
import { Image as ImageIcon, Loader2, Download, Copy, ArrowLeft, Sparkles } from "lucide-react";
import Link from "next/link";

export default function ImageGeneratorPage() {
  const [topic, setTopic] = useState("");
  const [style, setStyle] = useState<'professional' | 'minimalist' | 'colorful' | 'illustration' | 'realistic'>('professional');
  const [size, setSize] = useState<'1024x1024' | '1792x1024' | '1024x1792'>('1024x1024');
  const [loading, setLoading] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [revisedPrompt, setRevisedPrompt] = useState<string | null>(null);

  const styles = [
    { id: 'professional', name: 'Profesyonel', emoji: '💼', desc: 'Temiz, modern, iş' },
    { id: 'minimalist', name: 'Minimalist', emoji: '⚪', desc: 'Basit, zarif' },
    { id: 'colorful', name: 'Renkli', emoji: '🎨', desc: 'Canlı, dinamik' },
    { id: 'illustration', name: 'İllüstrasyon', emoji: '🎭', desc: 'Flat, vektör' },
    { id: 'realistic', name: 'Gerçekçi', emoji: '📸', desc: 'Fotogerçekçi' },
  ];

  const sizes = [
    { id: '1024x1024', name: 'Kare', ratio: '1:1', desc: 'Instagram, profil', icon: '⬜' },
    { id: '1792x1024', name: 'Yatay Banner', ratio: '16:9', desc: 'Blog kapak, YouTube', icon: '▬' },
    { id: '1024x1792', name: 'Dikey', ratio: '9:16', desc: 'Story, Pinterest', icon: '▮' },
  ];

  const handleGenerate = async () => {
    if (!topic.trim()) {
      alert("Lütfen bir konu girin!");
      return;
    }

    setLoading(true);
    setGeneratedImage(null);
    setRevisedPrompt(null);

    try {
      const response = await fetch('/api/admin/ai/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, style, size }),
      });

      const data = await response.json();
      
      if (data.success) {
        setGeneratedImage(data.imageUrl);
        setRevisedPrompt(data.revisedPrompt);
      } else {
        alert('Görsel oluşturulamadı: ' + data.error);
      }
    } catch (error) {
      console.error('Image generation error:', error);
      alert('Bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!generatedImage) return;
    
    const link = document.createElement('a');
    link.href = generatedImage;
    link.download = `${topic.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}.png`;
    link.click();
  };

  const handleCopyUrl = () => {
    if (!generatedImage) return;
    
    navigator.clipboard.writeText(generatedImage);
    alert('URL kopyalandı!');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/admin/ai-tools"
            className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            AI Araçlar
          </Link>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl">
              <ImageIcon className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-slate-900">DALL-E Görsel Oluşturucu</h1>
              <p className="text-slate-600 mt-1">
                AI ile özel görseller oluşturun, stok fotoğraflara veda edin
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Section */}
          <div className="space-y-4">
            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900 mb-4">Görsel Ayarları</h2>
              
              <div className="space-y-6">
                {/* Topic */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Konu *
                  </label>
                  <input
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="Örn: Japonya Vizesi Başvurusu"
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    Ne hakkında görsel istiyorsunuz?
                  </p>
                </div>

                {/* Style */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-3">
                    Stil
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {styles.map((s) => (
                      <button
                        key={s.id}
                        onClick={() => setStyle(s.id as any)}
                        className={`p-4 rounded-lg border-2 transition-all text-left ${
                          style === s.id
                            ? 'border-blue-600 bg-blue-50'
                            : 'border-slate-200 hover:border-blue-300'
                        }`}
                      >
                        <div className="text-2xl mb-1">{s.emoji}</div>
                        <div className="font-semibold text-slate-900">{s.name}</div>
                        <div className="text-xs text-slate-500">{s.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Size */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-3">
                    Boyut
                  </label>
                  <div className="space-y-2">
                    {sizes.map((s) => (
                      <button
                        key={s.id}
                        onClick={() => setSize(s.id as any)}
                        className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                          size === s.id
                            ? 'border-blue-600 bg-blue-50'
                            : 'border-slate-200 hover:border-blue-300'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="text-3xl">{s.icon}</div>
                          <div className="flex-1">
                            <div className="font-semibold text-slate-900">{s.name}</div>
                            <div className="text-xs text-slate-500">{s.desc}</div>
                          </div>
                          <div className="text-sm font-mono text-slate-600">{s.ratio}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-amber-600 mt-2 bg-amber-50 p-2 rounded border border-amber-200">
                    ⚠️ Görsellerde metin kullanılmaz. Sadece görsel içerik üretilir.
                  </p>
                </div>

                {/* Generate Button */}
                <button
                  onClick={handleGenerate}
                  disabled={loading || !topic.trim()}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-4 rounded-lg font-bold hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Oluşturuluyor... (30-60 saniye)
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <Sparkles className="h-5 w-5" />
                      Görsel Oluştur
                    </span>
                  )}
                </button>

                {/* Info */}
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <p className="text-sm text-blue-900">
                    <strong>💡 İpucu:</strong> DALL-E 3 ile oluşturulan görseller:
                  </p>
                  <ul className="text-xs text-blue-700 mt-2 space-y-1 ml-4">
                    <li>• Telif hakkı sorunu yok</li>
                    <li>• Markanıza özel</li>
                    <li>• Yüksek kalite</li>
                    <li>• Sınırsız kullanım</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Preview Section */}
          <div className="space-y-4">
            {generatedImage ? (
              <>
                <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
                  <h2 className="text-xl font-bold text-slate-900 mb-4">Oluşturulan Görsel</h2>
                  
                  <div className="relative rounded-lg overflow-hidden border-2 border-slate-200">
                    <img
                      src={generatedImage}
                      alt={topic}
                      className="w-full h-auto"
                    />
                  </div>

                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={handleDownload}
                      className="flex-1 bg-green-600 text-white px-4 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <Download className="h-5 w-5" />
                      İndir
                    </button>
                    <button
                      onClick={handleCopyUrl}
                      className="flex-1 bg-blue-600 text-white px-4 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <Copy className="h-5 w-5" />
                      URL Kopyala
                    </button>
                  </div>
                </div>

                {revisedPrompt && (
                  <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-900 mb-2">AI Prompt</h3>
                    <p className="text-sm text-slate-600 bg-slate-50 p-4 rounded-lg border border-slate-200">
                      {revisedPrompt}
                    </p>
                  </div>
                )}
              </>
            ) : (
              <div className="bg-white rounded-xl p-12 border border-slate-200 shadow-sm text-center">
                <div className="bg-gradient-to-br from-blue-100 to-purple-100 rounded-full w-32 h-32 mx-auto mb-4 flex items-center justify-center">
                  <ImageIcon className="h-16 w-16 text-blue-600" />
                </div>
                <p className="text-slate-500 mb-2">
                  Henüz görsel oluşturulmadı
                </p>
                <p className="text-sm text-slate-400">
                  Konu girin ve "Görsel Oluştur" butonuna tıklayın
                </p>
              </div>
            )}

            {/* Examples */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
              <h3 className="text-lg font-bold mb-3">Örnek Konular</h3>
              <div className="space-y-2">
                {[
                  'Japonya vizesi başvuru süreci',
                  'Pasaport ve uçak bileti',
                  'Seyahat çantası ve harita',
                  'Büyükelçilik binası',
                  'Vize onay damgası',
                ].map((example, idx) => (
                  <button
                    key={idx}
                    onClick={() => setTopic(example)}
                    className="w-full text-left px-4 py-2 bg-white/10 backdrop-blur rounded-lg hover:bg-white/20 transition-all text-sm"
                  >
                    {example}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
