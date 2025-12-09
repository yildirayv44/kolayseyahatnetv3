"use client";

import { useState, useEffect } from "react";
import { Share2, Loader2, Copy, ArrowLeft, Twitter, Linkedin, Instagram, Facebook, Mail, Youtube, Image as ImageIcon, Check, Hash, MessageCircle, Globe, FileText, Search } from "lucide-react";
import Link from "next/link";

type RepurposeFormat = 
  | 'all-platforms'
  | 'twitter-thread'
  | 'linkedin-post'
  | 'instagram-carousel'
  | 'facebook-post'
  | 'email-newsletter'
  | 'youtube-description'
  | 'threads'
  | 'whatsapp';

interface ContentItem {
  id: number;
  title: string;
  slug: string;
  content: string;
  description: string;
  url: string;
}

export default function RepurposePage() {
  const [contentType, setContentType] = useState<'country' | 'blog'>('country');
  const [contentItems, setContentItems] = useState<ContentItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<ContentItem | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loadingItems, setLoadingItems] = useState(false);
  
  const [content, setContent] = useState("");
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [format, setFormat] = useState<RepurposeFormat>('all-platforms');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [generateImage, setGenerateImage] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [copiedPlatform, setCopiedPlatform] = useState<string | null>(null);

  // Fetch content items when type changes
  useEffect(() => {
    fetchContentItems();
  }, [contentType]);

  const fetchContentItems = async () => {
    setLoadingItems(true);
    try {
      const response = await fetch(`/api/admin/content/list?type=${contentType}`);
      const data = await response.json();
      
      if (data.success) {
        setContentItems(data.items);
      }
    } catch (error) {
      console.error('Error fetching content:', error);
    } finally {
      setLoadingItems(false);
    }
  };

  const handleSelectItem = (item: ContentItem) => {
    setSelectedItem(item);
    setTitle(item.title);
    setContent(item.content);
    setUrl(item.url);
  };

  const filteredItems = contentItems.filter(item =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formats = [
    { id: 'all-platforms', name: 'Tüm Platformlar', icon: Share2, color: 'purple', desc: '6 platform birden' },
    { id: 'twitter-thread', name: 'Twitter Thread', icon: Twitter, color: 'black', desc: '8-12 tweet' },
    { id: 'linkedin-post', name: 'LinkedIn Post', icon: Linkedin, color: 'blue', desc: 'Profesyonel' },
    { id: 'instagram-carousel', name: 'Instagram Carousel', icon: Instagram, color: 'pink', desc: '8-10 slide' },
    { id: 'facebook-post', name: 'Facebook Post', icon: Facebook, color: 'blue', desc: 'Engaging' },
    { id: 'threads', name: 'Threads', icon: Hash, color: 'gray', desc: '5 parça' },
    { id: 'whatsapp', name: 'WhatsApp', icon: MessageCircle, color: 'green', desc: 'Kısa mesaj' },
    { id: 'email-newsletter', name: 'Email Newsletter', icon: Mail, color: 'green', desc: 'HTML email' },
    { id: 'youtube-description', name: 'YouTube Description', icon: Youtube, color: 'red', desc: 'Timestamps' },
  ];

  const handleRepurpose = async () => {
    if (!content.trim() || !title.trim()) {
      alert("Lütfen başlık ve içerik girin!");
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/admin/ai/repurpose-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, title, format }),
      });

      const data = await response.json();
      
      if (data.success) {
        setResult(data.result);
      } else {
        alert('Dönüştürme başarısız: ' + data.error);
      }
    } catch (error) {
      console.error('Repurpose error:', error);
      alert('Bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Kopyalandı!');
  };

  const handleGenerateImage = async () => {
    if (!title.trim()) {
      alert("Lütfen önce bir başlık girin!");
      return;
    }

    setImageLoading(true);
    setGeneratedImage(null);

    try {
      const response = await fetch('/api/admin/ai/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: title,
          style: 'professional',
          size: '1024x1024',
        }),
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
      setImageLoading(false);
    }
  };

  const renderResult = () => {
    if (!result) return null;

    switch (format) {
      case 'twitter-thread':
        return (
          <div className="space-y-3">
            {result.tweets?.map((tweet: string, idx: number) => (
              <div key={idx} className="bg-white rounded-lg p-4 border border-slate-200">
                <div className="flex items-start gap-3">
                  <div className="bg-blue-100 rounded-full p-2">
                    <Twitter className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-slate-700">{tweet}</p>
                    <p className="text-xs text-slate-400 mt-2">{tweet.length}/280 karakter</p>
                  </div>
                </div>
              </div>
            ))}
            <button
              onClick={() => handleCopy(result.tweets.join('\n\n'))}
              className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              <Copy className="h-5 w-5" />
              Tüm Thread'i Kopyala
            </button>
          </div>
        );

      case 'linkedin-post':
        return (
          <div className="space-y-4">
            <div className="bg-white rounded-lg p-6 border border-slate-200">
              <div className="flex items-center gap-2 mb-4">
                <Linkedin className="h-5 w-5 text-blue-700" />
                <span className="font-semibold text-slate-900">LinkedIn Post</span>
              </div>
              <p className="text-sm text-slate-700 whitespace-pre-wrap">{result.post}</p>
              {result.hashtags && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {result.hashtags.map((tag: string, idx: number) => (
                    <span key={idx} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <button
              onClick={() => handleCopy(result.post + '\n\n' + (result.hashtags?.join(' ') || ''))}
              className="w-full bg-blue-700 text-white px-4 py-3 rounded-lg font-semibold hover:bg-blue-800 transition-colors flex items-center justify-center gap-2"
            >
              <Copy className="h-5 w-5" />
              Kopyala
            </button>
          </div>
        );

      case 'instagram-carousel':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {result.slides?.map((slide: any, idx: number) => (
                <div key={idx} className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg p-4 border-2 border-purple-200">
                  <div className="text-xs text-purple-600 font-semibold mb-2">Slide {idx + 1}</div>
                  <h4 className="font-bold text-slate-900 mb-2">{slide.title}</h4>
                  <p className="text-sm text-slate-700 mb-2">{slide.content}</p>
                  <p className="text-xs text-purple-600">📸 {slide.visualSuggestion}</p>
                </div>
              ))}
            </div>
            <div className="bg-white rounded-lg p-6 border border-slate-200">
              <h4 className="font-semibold text-slate-900 mb-2">Caption:</h4>
              <p className="text-sm text-slate-700 whitespace-pre-wrap mb-3">{result.caption}</p>
              {result.hashtags && (
                <div className="flex flex-wrap gap-2">
                  {result.hashtags.map((tag: string, idx: number) => (
                    <span key={idx} className="text-xs bg-pink-100 text-pink-700 px-2 py-1 rounded">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <button
              onClick={() => handleCopy(result.caption + '\n\n' + (result.hashtags?.join(' ') || ''))}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-colors flex items-center justify-center gap-2"
            >
              <Copy className="h-5 w-5" />
              Caption Kopyala
            </button>
          </div>
        );

      case 'facebook-post':
        return (
          <div className="space-y-4">
            <div className="bg-white rounded-lg p-6 border border-slate-200">
              <div className="flex items-center gap-2 mb-4">
                <Facebook className="h-5 w-5 text-blue-600" />
                <span className="font-semibold text-slate-900">Facebook Post</span>
              </div>
              <p className="text-sm text-slate-700 whitespace-pre-wrap mb-4">{result.post}</p>
              {result.linkDescription && (
                <div className="bg-slate-50 rounded p-3 border border-slate-200">
                  <p className="text-xs text-slate-500 mb-1">Link Preview:</p>
                  <p className="text-sm text-slate-700">{result.linkDescription}</p>
                </div>
              )}
            </div>
            <button
              onClick={() => handleCopy(result.post)}
              className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              <Copy className="h-5 w-5" />
              Kopyala
            </button>
          </div>
        );

      case 'email-newsletter':
        return (
          <div className="space-y-4">
            <div className="bg-white rounded-lg p-6 border border-slate-200 space-y-4">
              <div>
                <label className="text-xs text-slate-500 font-semibold">Subject Line:</label>
                <p className="text-sm font-semibold text-slate-900 mt-1">{result.subject}</p>
              </div>
              <div>
                <label className="text-xs text-slate-500 font-semibold">Preheader:</label>
                <p className="text-sm text-slate-700 mt-1">{result.preheader}</p>
              </div>
              <div>
                <label className="text-xs text-slate-500 font-semibold">Body:</label>
                <div className="text-sm text-slate-700 mt-1 bg-slate-50 p-4 rounded border border-slate-200 max-h-96 overflow-y-auto">
                  <div dangerouslySetInnerHTML={{ __html: result.body }} />
                </div>
              </div>
              <div>
                <label className="text-xs text-slate-500 font-semibold">CTA Button:</label>
                <button className="mt-2 bg-green-600 text-white px-6 py-2 rounded font-semibold">
                  {result.cta}
                </button>
              </div>
            </div>
            <button
              onClick={() => handleCopy(result.body)}
              className="w-full bg-green-600 text-white px-4 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
            >
              <Copy className="h-5 w-5" />
              HTML Kopyala
            </button>
          </div>
        );

      case 'youtube-description':
        return (
          <div className="space-y-4">
            <div className="bg-white rounded-lg p-6 border border-slate-200">
              <div className="flex items-center gap-2 mb-4">
                <Youtube className="h-5 w-5 text-red-600" />
                <span className="font-semibold text-slate-900">YouTube Description</span>
              </div>
              <p className="text-sm text-slate-700 whitespace-pre-wrap mb-4">{result.description}</p>
              
              {result.timestamps && result.timestamps.length > 0 && (
                <div className="bg-slate-50 rounded p-4 border border-slate-200 mb-4">
                  <p className="text-xs text-slate-500 font-semibold mb-2">Timestamps:</p>
                  {result.timestamps.map((ts: any, idx: number) => (
                    <div key={idx} className="text-sm text-slate-700 font-mono">
                      {ts.time} - {ts.title}
                    </div>
                  ))}
                </div>
              )}

              {result.hashtags && (
                <div className="flex flex-wrap gap-2">
                  {result.hashtags.map((tag: string, idx: number) => (
                    <span key={idx} className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <button
              onClick={() => handleCopy(result.description)}
              className="w-full bg-red-600 text-white px-4 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
            >
              <Copy className="h-5 w-5" />
              Kopyala
            </button>
          </div>
        );

      default:
        return <div className="text-slate-500">Sonuç bulunamadı</div>;
    }
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
            <div className="p-3 bg-gradient-to-br from-pink-600 to-purple-600 rounded-xl">
              <Share2 className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-slate-900">İçerik Dönüştürücü</h1>
              <p className="text-slate-600 mt-1">
                Bir içeriği 6 farklı sosyal medya formatına dönüştürün
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Section */}
          <div className="space-y-4">
            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900 mb-4">İçerik Seç veya Gir</h2>
              
              <div className="space-y-4">
                {/* Content Type Selector */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    İçerik Tipi
                  </label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setContentType('country')}
                      className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg border-2 transition-all ${
                        contentType === 'country'
                          ? 'border-primary bg-primary text-white'
                          : 'border-slate-200 hover:border-primary'
                      }`}
                    >
                      <Globe className="h-4 w-4" />
                      Ülke Sayfası
                    </button>
                    <button
                      onClick={() => setContentType('blog')}
                      className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg border-2 transition-all ${
                        contentType === 'blog'
                          ? 'border-primary bg-primary text-white'
                          : 'border-slate-200 hover:border-primary'
                      }`}
                    >
                      <FileText className="h-4 w-4" />
                      Blog Yazısı
                    </button>
                  </div>
                </div>

                {/* Content Selector */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    {contentType === 'country' ? 'Ülke Seç' : 'Blog Seç'}
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder={`${contentType === 'country' ? 'Ülke' : 'Blog'} ara...`}
                      className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    />
                  </div>
                  
                  {loadingItems ? (
                    <div className="mt-2 flex items-center justify-center py-4">
                      <Loader2 className="h-5 w-5 animate-spin text-primary" />
                    </div>
                  ) : (
                    <div className="mt-2 max-h-48 overflow-y-auto border border-slate-200 rounded-lg">
                      {filteredItems.map((item) => (
                        <button
                          key={item.id}
                          onClick={() => handleSelectItem(item)}
                          className={`w-full text-left px-4 py-2 hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-b-0 ${
                            selectedItem?.id === item.id ? 'bg-primary/10' : ''
                          }`}
                        >
                          <div className="font-medium text-sm text-slate-900">{item.title}</div>
                          <div className="text-xs text-slate-500 mt-1 truncate">{item.description}</div>
                        </button>
                      ))}
                      {filteredItems.length === 0 && (
                        <div className="px-4 py-8 text-center text-slate-500 text-sm">
                          Sonuç bulunamadı
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="border-t border-slate-200 pt-4">
                  <p className="text-xs text-slate-500 mb-3">veya manuel olarak girin:</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Başlık *
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Japonya Vizesi 2024 Rehberi"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    İçerik *
                  </label>
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Blog içeriğinizi buraya yapıştırın..."
                    rows={10}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent font-mono text-sm"
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    {content.split(/\s+/).filter(w => w.length > 0).length} kelime
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-3">
                    Format Seçin
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {formats.map((f) => {
                      const Icon = f.icon;
                      return (
                        <button
                          key={f.id}
                          onClick={() => setFormat(f.id as RepurposeFormat)}
                          className={`p-3 rounded-lg border-2 transition-all text-left ${
                            format === f.id
                              ? 'border-pink-600 bg-pink-50'
                              : 'border-slate-200 hover:border-pink-300'
                          }`}
                        >
                          <Icon className={`h-5 w-5 text-${f.color}-600 mb-1`} />
                          <div className="font-semibold text-sm text-slate-900">{f.name}</div>
                          <div className="text-xs text-slate-500">{f.desc}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <button
                  onClick={handleRepurpose}
                  disabled={loading || !content.trim() || !title.trim()}
                  className="w-full bg-gradient-to-r from-pink-600 to-purple-600 text-white px-6 py-3 rounded-lg font-bold hover:from-pink-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Dönüştürülüyor...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <Share2 className="h-5 w-5" />
                      Dönüştür
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* Image Generation Section */}
            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                <ImageIcon className="h-6 w-6 text-primary" />
                Görsel Üret (DALL-E 3)
              </h2>
              
              <p className="text-sm text-slate-600 mb-4">
                Başlığa göre otomatik olarak AI ile görsel oluşturun
              </p>

              <button
                onClick={handleGenerateImage}
                disabled={imageLoading || !title.trim()}
                className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-6 py-3 rounded-lg font-bold hover:from-blue-700 hover:to-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg mb-4"
              >
                {imageLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Görsel Oluşturuluyor...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <ImageIcon className="h-5 w-5" />
                    Görsel Oluştur
                  </span>
                )}
              </button>

              {generatedImage && (
                <div className="space-y-3">
                  <div className="relative rounded-lg overflow-hidden border-2 border-primary">
                    <img
                      src={generatedImage}
                      alt="Generated"
                      className="w-full h-auto"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => window.open(generatedImage, '_blank')}
                      className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg font-semibold transition-colors"
                    >
                      Tam Boyut
                    </button>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(generatedImage);
                        alert('URL kopyalandı!');
                      }}
                      className="flex-1 bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                    >
                      <Copy className="h-4 w-4" />
                      URL Kopyala
                    </button>
                  </div>
                  <p className="text-xs text-slate-500 break-all">
                    {generatedImage}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Result Section */}
          <div>
            {result ? (
              <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
                <h2 className="text-xl font-bold text-slate-900 mb-4">
                  {formats.find(f => f.id === format)?.name}
                </h2>
                {renderResult()}
              </div>
            ) : (
              <div className="bg-white rounded-xl p-12 border border-slate-200 shadow-sm text-center">
                <div className="bg-gradient-to-br from-pink-100 to-purple-100 rounded-full w-32 h-32 mx-auto mb-4 flex items-center justify-center">
                  <Share2 className="h-16 w-16 text-pink-600" />
                </div>
                <p className="text-slate-500 mb-2">
                  Henüz dönüştürme yapılmadı
                </p>
                <p className="text-sm text-slate-400">
                  İçerik girin, format seçin ve dönüştürün
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
