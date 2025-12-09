'use client';

import { useState } from 'react';
import { 
  Share2, 
  Copy, 
  Check, 
  Loader2, 
  Twitter, 
  Instagram, 
  Facebook, 
  Linkedin, 
  MessageCircle,
  Hash
} from 'lucide-react';

interface SocialMediaContent {
  twitter: {
    text: string;
    hashtags: string[];
    characterCount: number;
  };
  instagram: {
    caption: string;
    hashtags: string[];
    firstComment: string;
    characterCount: number;
  };
  facebook: {
    post: string;
    characterCount: number;
  };
  linkedin: {
    post: string;
    hashtags: string[];
    characterCount: number;
  };
  threads: {
    thread: string[];
    characterCount: number;
  };
  whatsapp: {
    message: string;
    characterCount: number;
  };
}

export default function ContentConverterPage() {
  const [sourceType, setSourceType] = useState<'country' | 'blog'>('country');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SocialMediaContent | null>(null);
  const [copiedPlatform, setCopiedPlatform] = useState<string | null>(null);

  const handleConvert = async () => {
    if (!title || !content) {
      alert('Başlık ve içerik gereklidir!');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/admin/content/social-media-converter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content,
          title,
          contentType: sourceType,
          url,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setResult(data.content);
      } else {
        alert('Hata: ' + data.error);
      }
    } catch (error) {
      console.error('Conversion error:', error);
      alert('Dönüştürme sırasında bir hata oluştu!');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string, platform: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedPlatform(platform);
      setTimeout(() => setCopiedPlatform(null), 2000);
    } catch (error) {
      console.error('Copy error:', error);
    }
  };

  const platforms = [
    {
      id: 'twitter',
      name: 'Twitter / X',
      icon: Twitter,
      color: 'bg-black',
      hoverColor: 'hover:bg-gray-800',
    },
    {
      id: 'instagram',
      name: 'Instagram',
      icon: Instagram,
      color: 'bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500',
      hoverColor: 'hover:opacity-90',
    },
    {
      id: 'facebook',
      name: 'Facebook',
      icon: Facebook,
      color: 'bg-blue-600',
      hoverColor: 'hover:bg-blue-700',
    },
    {
      id: 'linkedin',
      name: 'LinkedIn',
      icon: Linkedin,
      color: 'bg-blue-700',
      hoverColor: 'hover:bg-blue-800',
    },
    {
      id: 'threads',
      name: 'Threads',
      icon: Hash,
      color: 'bg-gray-900',
      hoverColor: 'hover:bg-gray-800',
    },
    {
      id: 'whatsapp',
      name: 'WhatsApp',
      icon: MessageCircle,
      color: 'bg-green-500',
      hoverColor: 'hover:bg-green-600',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Share2 className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold text-gray-900">İçerik Dönüştürücü</h1>
          </div>
          <p className="text-gray-600">
            Ülke sayfası veya blog içeriğini 6 farklı sosyal medya formatına dönüştürün
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Input Section */}
          <div className="space-y-6">
            <div className="rounded-lg bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-xl font-semibold text-gray-900">Kaynak İçerik</h2>

              {/* Source Type */}
              <div className="mb-4">
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  İçerik Tipi
                </label>
                <div className="flex gap-4">
                  <button
                    onClick={() => setSourceType('country')}
                    className={`flex-1 rounded-lg border-2 px-4 py-2 text-sm font-medium transition-all ${
                      sourceType === 'country'
                        ? 'border-primary bg-primary text-white'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-primary'
                    }`}
                  >
                    🌍 Ülke Sayfası
                  </button>
                  <button
                    onClick={() => setSourceType('blog')}
                    className={`flex-1 rounded-lg border-2 px-4 py-2 text-sm font-medium transition-all ${
                      sourceType === 'blog'
                        ? 'border-primary bg-primary text-white'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-primary'
                    }`}
                  >
                    📝 Blog Yazısı
                  </button>
                </div>
              </div>

              {/* Title */}
              <div className="mb-4">
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Başlık *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Örn: İngiltere Vizesi Nasıl Alınır?"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              {/* URL */}
              <div className="mb-4">
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  URL (Opsiyonel)
                </label>
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://www.kolayseyahat.net/ingiltere"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              {/* Content */}
              <div className="mb-4">
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  İçerik *
                </label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="İçeriği buraya yapıştırın (HTML formatında olabilir)..."
                  rows={12}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 font-mono text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
                <p className="mt-1 text-xs text-gray-500">
                  {content.length} karakter
                </p>
              </div>

              {/* Convert Button */}
              <button
                onClick={handleConvert}
                disabled={loading || !title || !content}
                className="w-full rounded-lg bg-primary px-6 py-3 font-semibold text-white transition-all hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Dönüştürülüyor...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <Share2 className="h-5 w-5" />
                    Sosyal Medya Formatlarına Dönüştür
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Results Section */}
          <div className="space-y-4">
            {result ? (
              <>
                {platforms.map((platform) => {
                  const Icon = platform.icon;
                  const platformData = result[platform.id as keyof SocialMediaContent];
                  
                  if (!platformData) return null;

                  let displayContent = '';
                  let hashtags: string[] = [];

                  if (platform.id === 'twitter') {
                    const data = platformData as SocialMediaContent['twitter'];
                    displayContent = data.text;
                    hashtags = data.hashtags;
                  } else if (platform.id === 'instagram') {
                    const data = platformData as SocialMediaContent['instagram'];
                    displayContent = data.caption;
                    hashtags = data.hashtags;
                  } else if (platform.id === 'facebook') {
                    const data = platformData as SocialMediaContent['facebook'];
                    displayContent = data.post;
                  } else if (platform.id === 'linkedin') {
                    const data = platformData as SocialMediaContent['linkedin'];
                    displayContent = data.post;
                    hashtags = data.hashtags;
                  } else if (platform.id === 'threads') {
                    const data = platformData as SocialMediaContent['threads'];
                    displayContent = data.thread.join('\n\n');
                  } else if (platform.id === 'whatsapp') {
                    const data = platformData as SocialMediaContent['whatsapp'];
                    displayContent = data.message;
                  }

                  const fullContent = hashtags.length > 0 
                    ? `${displayContent}\n\n${hashtags.map(h => `#${h}`).join(' ')}`
                    : displayContent;

                  return (
                    <div key={platform.id} className="rounded-lg bg-white p-6 shadow-sm">
                      <div className="mb-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`rounded-lg p-2 ${platform.color} text-white`}>
                            <Icon className="h-5 w-5" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">{platform.name}</h3>
                            <p className="text-xs text-gray-500">
                              {platformData.characterCount} karakter
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => copyToClipboard(fullContent, platform.id)}
                          className={`rounded-lg border-2 border-gray-200 px-4 py-2 text-sm font-medium transition-all hover:border-primary hover:bg-primary hover:text-white ${
                            copiedPlatform === platform.id ? 'border-green-500 bg-green-500 text-white' : 'text-gray-700'
                          }`}
                        >
                          {copiedPlatform === platform.id ? (
                            <span className="flex items-center gap-2">
                              <Check className="h-4 w-4" />
                              Kopyalandı
                            </span>
                          ) : (
                            <span className="flex items-center gap-2">
                              <Copy className="h-4 w-4" />
                              Kopyala
                            </span>
                          )}
                        </button>
                      </div>

                      <div className="rounded-lg bg-gray-50 p-4">
                        <p className="whitespace-pre-wrap text-sm text-gray-700">
                          {displayContent}
                        </p>
                        {hashtags.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {hashtags.map((tag, index) => (
                              <span
                                key={index}
                                className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary"
                              >
                                #{tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {platform.id === 'instagram' && (
                        <div className="mt-3 rounded-lg border border-gray-200 bg-white p-3">
                          <p className="mb-1 text-xs font-medium text-gray-600">
                            İlk Yorum:
                          </p>
                          <p className="text-sm text-gray-700">
                            {(platformData as SocialMediaContent['instagram']).firstComment}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </>
            ) : (
              <div className="flex h-full items-center justify-center rounded-lg bg-white p-12 shadow-sm">
                <div className="text-center">
                  <Share2 className="mx-auto mb-4 h-16 w-16 text-gray-300" />
                  <p className="text-gray-500">
                    İçeriği dönüştürmek için sol taraftaki formu doldurun
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
