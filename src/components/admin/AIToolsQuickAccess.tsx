"use client";

import { useState } from "react";
import { 
  Sparkles, 
  Image as ImageIcon, 
  TrendingUp, 
  Share2, 
  Video, 
  Target,
  ChevronDown,
  ExternalLink,
  Zap
} from "lucide-react";
import Link from "next/link";

interface AIToolsQuickAccessProps {
  currentContent?: string;
  currentTitle?: string;
  onOptimize?: (optimizedContent: string) => void;
  onImageGenerated?: (imageUrl: string) => void;
}

export function AIToolsQuickAccess({ 
  currentContent, 
  currentTitle,
  onOptimize,
  onImageGenerated 
}: AIToolsQuickAccessProps) {
  const [showMenu, setShowMenu] = useState(false);

  const tools = [
    {
      id: 'optimizer',
      name: 'İçerik Optimizer',
      icon: Sparkles,
      color: 'purple',
      description: 'SEO ve okunabilirlik analizi',
      href: '/admin/ai-tools/optimizer',
      canUseInline: true,
    },
    {
      id: 'image-generator',
      name: 'Görsel Oluştur',
      icon: ImageIcon,
      color: 'blue',
      description: 'DALL-E ile özel görsel',
      href: '/admin/ai-tools/image-generator',
      canUseInline: true,
    },
    {
      id: 'performance',
      name: 'Performans Tahmini',
      icon: TrendingUp,
      color: 'green',
      description: 'Trafik ve engagement tahmini',
      href: '/admin/ai-tools/performance',
      canUseInline: false,
    },
    {
      id: 'repurpose',
      name: 'İçerik Dönüştür',
      icon: Share2,
      color: 'pink',
      description: 'Sosyal medya formatları',
      href: '/admin/ai-tools/repurpose',
      canUseInline: false,
    },
    {
      id: 'video-script',
      name: 'Video Script',
      icon: Video,
      color: 'red',
      description: 'YouTube/TikTok script',
      href: '/admin/ai-tools/video-script',
      canUseInline: false,
    },
    {
      id: 'intent',
      name: 'Niyet Analizi',
      icon: Target,
      color: 'indigo',
      description: 'Kullanıcı niyeti analizi',
      href: '/admin/ai-tools/intent',
      canUseInline: false,
    },
  ];

  const handleInlineAction = async (toolId: string) => {
    if (!currentContent && !currentTitle) {
      alert('Lütfen önce içerik girin!');
      return;
    }

    switch (toolId) {
      case 'optimizer':
        // Open in new tab with pre-filled data
        const optimizerUrl = `/admin/ai-tools/optimizer?content=${encodeURIComponent(currentContent || '')}&title=${encodeURIComponent(currentTitle || '')}`;
        window.open(optimizerUrl, '_blank');
        break;
      
      case 'image-generator':
        const imageUrl = `/admin/ai-tools/image-generator?topic=${encodeURIComponent(currentTitle || '')}`;
        window.open(imageUrl, '_blank');
        break;
    }

    setShowMenu(false);
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setShowMenu(!showMenu);
        }}
        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg font-semibold"
      >
        <Zap className="h-4 w-4" />
        AI Araçlar
        <ChevronDown className={`h-4 w-4 transition-transform ${showMenu ? 'rotate-180' : ''}`} />
      </button>

      {showMenu && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowMenu(false)}
          />
          
          {/* Menu */}
          <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-slate-200 z-50 overflow-hidden">
            <div className="p-3 bg-gradient-to-r from-purple-50 to-blue-50 border-b border-slate-200">
              <p className="text-sm font-semibold text-slate-900">Hızlı AI Araçları</p>
              <p className="text-xs text-slate-600">İçeriğinizi geliştirin</p>
            </div>

            <div className="max-h-96 overflow-y-auto">
              {tools.map((tool) => {
                const Icon = tool.icon;
                return (
                  <div
                    key={tool.id}
                    className="border-b border-slate-100 last:border-0"
                  >
                    <div className="p-3 hover:bg-slate-50 transition-colors">
                      <div className="flex items-start gap-3">
                        <div className={`p-2 bg-${tool.color}-100 rounded-lg`}>
                          <Icon className={`h-4 w-4 text-${tool.color}-600`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-semibold text-slate-900">
                              {tool.name}
                            </h4>
                            {tool.canUseInline && (
                              <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold">
                                QUICK
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-600 mt-0.5">
                            {tool.description}
                          </p>
                          <div className="flex gap-2 mt-2">
                            {tool.canUseInline && (
                              <button
                                onClick={() => handleInlineAction(tool.id)}
                                className={`text-xs bg-${tool.color}-600 text-white px-3 py-1 rounded hover:bg-${tool.color}-700 transition-colors font-medium`}
                              >
                                Hızlı Kullan
                              </button>
                            )}
                            <Link
                              href={tool.href}
                              target="_blank"
                              className="text-xs bg-slate-100 text-slate-700 px-3 py-1 rounded hover:bg-slate-200 transition-colors font-medium inline-flex items-center gap-1"
                            >
                              Detaylı
                              <ExternalLink className="h-3 w-3" />
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="p-3 bg-slate-50 border-t border-slate-200">
              <Link
                href="/admin/ai-tools"
                className="block text-center text-sm font-semibold text-purple-600 hover:text-purple-700 transition-colors"
              >
                Tüm AI Araçları Gör →
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
