"use client";

import { useState } from "react";
import { Image as ImageIcon, Loader2, Plus, X } from "lucide-react";

interface DALLEImageInserterProps {
  onInsert: (imageUrl: string, imageHtml: string) => void;
  onSetCover?: (imageUrl: string) => void;
  mode?: 'content' | 'cover' | 'both';
}

export function DALLEImageInserter({ onInsert, onSetCover, mode = 'both' }: DALLEImageInserterProps) {
  const [showModal, setShowModal] = useState(false);
  const [topic, setTopic] = useState("");
  const [style, setStyle] = useState<'professional' | 'minimalist' | 'colorful' | 'illustration' | 'realistic'>('professional');
  const [size, setSize] = useState<'1024x1024' | '1792x1024' | '1024x1792'>('1792x1024');
  const [loading, setLoading] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);

  const styles = [
    { id: 'professional', name: 'Profesyonel', emoji: '💼' },
    { id: 'minimalist', name: 'Minimalist', emoji: '⚪' },
    { id: 'colorful', name: 'Renkli', emoji: '🎨' },
    { id: 'illustration', name: 'İllüstrasyon', emoji: '🎭' },
    { id: 'realistic', name: 'Gerçekçi', emoji: '📸' },
  ];

  const sizes = [
    { id: '1024x1024', name: 'Kare', icon: '⬜' },
    { id: '1792x1024', name: 'Yatay Banner', icon: '▬' },
    { id: '1024x1792', name: 'Dikey', icon: '▮' },
  ];

  const handleGenerate = async () => {
    if (!topic.trim()) {
      alert("Lütfen bir konu girin!");
      return;
    }

    setLoading(true);
    setGeneratedImage(null);

    try {
      const response = await fetch('/api/admin/ai/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, style, size }),
      });

      const data = await response.json();
      
      if (data.success) {
        setGeneratedImage(data.imageUrl);
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

  const handleInsertToContent = () => {
    if (!generatedImage) return;
    
    const imageHtml = `<img src="${generatedImage}" alt="${topic}" style="width: 100%; height: auto; border-radius: 8px; margin: 20px 0;" />`;
    onInsert(generatedImage, imageHtml);
    setShowModal(false);
    setGeneratedImage(null);
    setTopic("");
  };

  const handleSetAsCover = () => {
    if (!generatedImage || !onSetCover) return;
    
    onSetCover(generatedImage);
    setShowModal(false);
    setGeneratedImage(null);
    setTopic("");
  };

  return (
    <>
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          setShowModal(true);
        }}
        className="inline-flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all text-sm font-semibold"
      >
        <ImageIcon className="h-4 w-4" />
        DALL-E Görsel Ekle
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-slate-200 p-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">DALL-E Görsel Oluştur</h2>
                <p className="text-sm text-slate-600 mt-1">AI ile özel görsel oluşturun</p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Settings */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Görsel Konusu *
                  </label>
                  <input
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="Örn: Tokyo'da gün batımı"
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-3">
                    Stil
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {styles.map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => setStyle(s.id as any)}
                        className={`p-3 rounded-lg border-2 transition-all text-center ${
                          style === s.id
                            ? 'border-blue-600 bg-blue-50'
                            : 'border-slate-200 hover:border-blue-300'
                        }`}
                      >
                        <div className="text-2xl mb-1">{s.emoji}</div>
                        <div className="text-xs font-semibold text-slate-900">{s.name}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-3">
                    Boyut
                  </label>
                  <div className="space-y-2">
                    {sizes.map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => setSize(s.id as any)}
                        className={`w-full p-3 rounded-lg border-2 transition-all text-left ${
                          size === s.id
                            ? 'border-blue-600 bg-blue-50'
                            : 'border-slate-200 hover:border-blue-300'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="text-2xl">{s.icon}</div>
                          <div className="font-semibold text-slate-900">{s.name}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleGenerate}
                  disabled={loading || !topic.trim()}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-bold hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Oluşturuluyor...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <ImageIcon className="h-5 w-5" />
                      Görsel Oluştur
                    </span>
                  )}
                </button>
              </div>

              {/* Preview */}
              <div>
                {generatedImage ? (
                  <div className="space-y-4">
                    <div className="relative rounded-lg overflow-hidden border-2 border-slate-200">
                      <img
                        src={generatedImage}
                        alt={topic}
                        className="w-full h-auto"
                      />
                    </div>

                    <div className="space-y-2">
                      {(mode === 'content' || mode === 'both') && (
                        <button
                          type="button"
                          onClick={handleInsertToContent}
                          className="w-full bg-green-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                        >
                          <Plus className="h-5 w-5" />
                          İçeriğe Ekle
                        </button>
                      )}
                      
                      {(mode === 'cover' || mode === 'both') && onSetCover && (
                        <button
                          type="button"
                          onClick={handleSetAsCover}
                          className="w-full bg-purple-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
                        >
                          <ImageIcon className="h-5 w-5" />
                          Kapak Görseli Yap
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center bg-slate-50 rounded-lg border-2 border-dashed border-slate-300">
                    <div className="text-center p-8">
                      <ImageIcon className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                      <p className="text-slate-500">
                        Görsel burada görünecek
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
