"use client";

import { useState } from "react";
import { 
  Sparkles, 
  Image as ImageIcon, 
  TrendingUp, 
  Share2, 
  Video, 
  Calendar,
  FileText,
  Target,
  ArrowRight,
  Zap
} from "lucide-react";
import Link from "next/link";

export default function AIToolsPage() {
  const [activeTab, setActiveTab] = useState<'all' | 'content' | 'media' | 'analytics'>('all');

  const tools = [
    {
      id: 'optimizer',
      name: 'İçerik Optimizer',
      description: 'İçeriğinizi analiz edin, SEO ve okunabilirlik skorları alın',
      icon: Sparkles,
      color: 'purple',
      category: 'content',
      features: ['Readability skoru', 'SEO analizi', 'Otomatik düzeltme'],
      href: '/admin/ai-tools/optimizer',
    },
    {
      id: 'image-generator',
      name: 'DALL-E Görsel Oluşturucu',
      description: 'AI ile özel görseller oluşturun, stok fotoğraflara veda edin',
      icon: ImageIcon,
      color: 'blue',
      category: 'media',
      features: ['5 stil seçeneği', 'Özel boyutlar', 'Telif hakkı yok'],
      href: '/admin/ai-tools/image-generator',
    },
    {
      id: 'performance',
      name: 'Performans Tahmini',
      description: 'İçeriğinizin performansını önceden tahmin edin',
      icon: TrendingUp,
      color: 'green',
      category: 'analytics',
      features: ['Trafik tahmini', 'CTR analizi', 'Viral potansiyel'],
      href: '/admin/ai-tools/performance',
    },
    {
      id: 'repurpose',
      name: 'İçerik Dönüştürücü',
      description: 'Bir içeriği 6 farklı formata dönüştürün',
      icon: Share2,
      color: 'pink',
      category: 'content',
      features: ['Twitter thread', 'Instagram carousel', 'Video script'],
      href: '/admin/ai-tools/repurpose',
    },
    {
      id: 'video-script',
      name: 'Video Script Oluşturucu',
      description: 'Blog yazılarından profesyonel video scriptleri oluşturun',
      icon: Video,
      color: 'red',
      category: 'media',
      features: ['Timestamp\'ler', 'B-roll önerileri', 'Müzik önerileri'],
      href: '/admin/ai-tools/video-script',
    },
    {
      id: 'scheduler',
      name: 'Güncelleme Zamanlayıcı',
      description: 'İçeriklerinizin güncelleme zamanını otomatik takip edin',
      icon: Calendar,
      color: 'orange',
      category: 'analytics',
      features: ['Öncelik sistemi', 'Akıllı öneriler', 'Toplu analiz'],
      href: '/admin/ai-tools/scheduler',
    },
    {
      id: 'intent',
      name: 'Niyet Analizi',
      description: 'Kullanıcı niyetini analiz edin ve içeriği optimize edin',
      icon: Target,
      color: 'indigo',
      category: 'analytics',
      features: ['4 niyet türü', 'CTA önerileri', 'İçerik yapısı'],
      href: '/admin/ai-tools/intent',
    },
  ];

  const filteredTools = activeTab === 'all' 
    ? tools 
    : tools.filter(tool => tool.category === activeTab);

  const stats = [
    { label: 'Toplam Araç', value: '7', icon: Zap, color: 'purple' },
    { label: 'İçerik Araçları', value: '2', icon: FileText, color: 'blue' },
    { label: 'Medya Araçları', value: '2', icon: ImageIcon, color: 'green' },
    { label: 'Analiz Araçları', value: '3', icon: TrendingUp, color: 'orange' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-slate-900">AI Araçlar</h1>
              <p className="text-slate-600 mt-1">
                Yapay zeka destekli içerik araçlarınız
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600">{stat.label}</p>
                    <p className="text-3xl font-bold text-slate-900 mt-1">
                      {stat.value}
                    </p>
                  </div>
                  <div className={`p-3 bg-${stat.color}-100 rounded-lg`}>
                    <stat.icon className={`h-6 w-6 text-${stat.color}-600`} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 bg-white rounded-xl p-2 border border-slate-200 shadow-sm">
          {[
            { id: 'all', label: 'Tümü', count: tools.length },
            { id: 'content', label: 'İçerik', count: tools.filter(t => t.category === 'content').length },
            { id: 'media', label: 'Medya', count: tools.filter(t => t.category === 'media').length },
            { id: 'analytics', label: 'Analiz', count: tools.filter(t => t.category === 'analytics').length },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-all ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        {/* Tools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTools.map((tool) => {
            const Icon = tool.icon;
            return (
              <Link
                key={tool.id}
                href={tool.href}
                className="group bg-white rounded-xl p-6 border border-slate-200 shadow-sm hover:shadow-xl transition-all hover:-translate-y-1"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 bg-${tool.color}-100 rounded-xl group-hover:scale-110 transition-transform`}>
                    <Icon className={`h-6 w-6 text-${tool.color}-600`} />
                  </div>
                  <ArrowRight className="h-5 w-5 text-slate-400 group-hover:text-purple-600 group-hover:translate-x-1 transition-all" />
                </div>

                <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-purple-600 transition-colors">
                  {tool.name}
                </h3>
                <p className="text-sm text-slate-600 mb-4">
                  {tool.description}
                </p>

                <div className="space-y-2">
                  {tool.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs text-slate-500">
                      <div className={`h-1.5 w-1.5 rounded-full bg-${tool.color}-500`} />
                      {feature}
                    </div>
                  ))}
                </div>

                <div className="mt-4 pt-4 border-t border-slate-100">
                  <span className="text-sm font-semibold text-purple-600 group-hover:text-purple-700">
                    Kullanmaya Başla →
                  </span>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl p-6 text-white">
          <h3 className="text-2xl font-bold mb-2">Hızlı Başlangıç</h3>
          <p className="text-purple-100 mb-4">
            En popüler AI araçlarına hızlıca erişin
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              href="/admin/ai-tools/optimizer"
              className="bg-white/10 backdrop-blur rounded-lg p-4 hover:bg-white/20 transition-all"
            >
              <Sparkles className="h-6 w-6 mb-2" />
              <p className="font-semibold">İçerik Optimize Et</p>
              <p className="text-sm text-purple-100 mt-1">Analiz + Auto-fix</p>
            </Link>
            <Link
              href="/admin/ai-tools/image-generator"
              className="bg-white/10 backdrop-blur rounded-lg p-4 hover:bg-white/20 transition-all"
            >
              <ImageIcon className="h-6 w-6 mb-2" />
              <p className="font-semibold">Görsel Oluştur</p>
              <p className="text-sm text-purple-100 mt-1">DALL-E ile özel</p>
            </Link>
            <Link
              href="/admin/ai-tools/repurpose"
              className="bg-white/10 backdrop-blur rounded-lg p-4 hover:bg-white/20 transition-all"
            >
              <Share2 className="h-6 w-6 mb-2" />
              <p className="font-semibold">İçerik Dönüştür</p>
              <p className="text-sm text-purple-100 mt-1">6 formata çevir</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
