'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Content {
  id: string;
  topic_id: string;
  blog_id: number | null;
  title: string;
  slug: string;
  content: string;
  meta_title: string;
  meta_description: string;
  cover_image_url: string | null;
  cover_image_alt: string | null;
  pexels_photographer: string | null;
  word_count: number;
  readability_score: number;
  seo_score: number;
  status: string;
  created_at: string;
}

interface Plan {
  id: string;
  country_name: string;
  month: number;
  year: number;
}

export default function ContentReviewPage() {
  const params = useParams();
  const router = useRouter();
  const plan_id = params.plan_id as string;

  const [plan, setPlan] = useState<Plan | null>(null);
  const [contents, setContents] = useState<Content[]>([]);
  const [selectedContent, setSelectedContent] = useState<Content | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadContents();
  }, [plan_id]);

  const loadContents = async () => {
    try {
      const response = await fetch(`/api/admin/ai-blog/plan-details?plan_id=${plan_id}`);
      const result = await response.json();

      if (result.success) {
        setPlan(result.plan);
        setContents(result.contents || []);
      }
    } catch (error) {
      console.error('Error loading contents:', error);
    }
  };

  const approveContent = async (contentId: string) => {
    try {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      const { error } = await supabase
        .from('ai_blog_content')
        .update({ status: 'approved' })
        .eq('id', contentId);

      if (!error) {
        setContents(contents.map(c => 
          c.id === contentId ? { ...c, status: 'approved' } : c
        ));
        setMessage({ type: 'success', text: 'İçerik onaylandı ve yayına hazır!' });
        setTimeout(() => setMessage(null), 3000);
      } else {
        throw error;
      }
    } catch (error) {
      console.error('Approval error:', error);
      setMessage({ type: 'error', text: 'Onaylama başarısız' });
    }
  };

  const publishContent = async (contentId: string) => {
    if (!confirm('Bu içeriği yayınlamak istediğinizden emin misiniz?')) return;

    setIsPublishing(true);

    try {
      const response = await fetch('/api/admin/ai-blog/publish-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content_id: contentId })
      });

      const result = await response.json();

      if (result.success) {
        setMessage({ 
          type: 'success', 
          text: `İçerik yayınlandı! Blog URL: ${result.blog_url}` 
        });
        loadContents();
      } else {
        setMessage({ type: 'error', text: result.error || 'Yayınlama başarısız' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Yayınlama başarısız' });
    } finally {
      setIsPublishing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const badges: { [key: string]: { bg: string; text: string; label: string } } = {
      draft: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Taslak' },
      review: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'İncelemede' },
      approved: { bg: 'bg-green-100', text: 'text-green-800', label: 'Onaylandı' },
      published: { bg: 'bg-purple-100', text: 'text-purple-800', label: 'Yayında' },
      rejected: { bg: 'bg-red-100', text: 'text-red-800', label: 'Reddedildi' }
    };

    const badge = badges[status] || badges.draft;
    return (
      <span className={`px-2 py-1 rounded text-xs font-medium ${badge.bg} ${badge.text}`}>
        {badge.label}
      </span>
    );
  };

  if (!plan) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  const months = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => router.push('/admin/ai-blog-planner')}
          className="text-blue-600 hover:text-blue-700 mb-4 flex items-center gap-2"
        >
          ← Geri Dön
        </button>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          📝 İçerik İnceleme: {plan.country_name}
        </h1>
        <p className="text-gray-600">
          {months[plan.month - 1]} {plan.year} • {contents.length} içerik üretildi
        </p>
      </div>

      {message && (
        <div className={`mb-6 p-4 rounded-lg ${message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
          {message.text}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-gray-900">{contents.length}</div>
          <div className="text-sm text-gray-600">Toplam İçerik</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-blue-600">{contents.filter(c => c.status === 'review').length}</div>
          <div className="text-sm text-gray-600">İncelemede</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-green-600">{contents.filter(c => c.status === 'approved').length}</div>
          <div className="text-sm text-gray-600">Onaylandı</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-purple-600">{contents.filter(c => c.status === 'published').length}</div>
          <div className="text-sm text-gray-600">Yayında</div>
        </div>
      </div>

      {/* Bulk Scheduling */}
      {contents.filter(c => c.status === 'approved' && !c.blog_id).length > 0 && (
        <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200 p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">📅 Toplu Yayın Planlama</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Başlangıç Tarihi</label>
              <input
                type="date"
                id="schedule-start-date"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Yayın Sıklığı</label>
              <select
                id="schedule-frequency"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              >
                <option value="daily">Günlük (Her gün 1 içerik)</option>
                <option value="weekly">Haftalık (Haftada 1 içerik)</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={async () => {
                  const startDate = (document.getElementById('schedule-start-date') as HTMLInputElement).value;
                  const frequency = (document.getElementById('schedule-frequency') as HTMLSelectElement).value;
                  
                  if (!startDate) {
                    alert('Lütfen başlangıç tarihi seçin');
                    return;
                  }

                  try {
                    const response = await fetch('/api/admin/ai-blog/schedule-plan', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ plan_id, start_date: startDate, frequency })
                    });

                    const result = await response.json();

                    if (result.success) {
                      alert(`✅ ${result.scheduled_count} içerik planlandı!\n${startDate} - ${result.end_date}`);
                      loadContents();
                    } else {
                      alert('❌ ' + result.error);
                    }
                  } catch (error) {
                    alert('❌ Planlama başarısız');
                  }
                }}
                className="w-full px-6 py-2 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg font-medium hover:from-green-700 hover:to-blue-700"
              >
                🚀 Tümünü Planla
              </button>
            </div>
          </div>

          <p className="text-sm text-gray-600">
            💡 <strong>Otomatik Yayınlama:</strong> Planlanan içerikler her gün saat 00:00'da otomatik olarak yayınlanır.
          </p>
        </div>
      )}

      {/* Contents List */}
      <div className="space-y-4">
        {contents.map((content, index) => (
          <div key={content.id} className="bg-white rounded-lg border border-gray-200 p-6 hover:border-blue-300 transition-colors">
            <div className="flex gap-6">
              {/* Image */}
              {content.cover_image_url && (
                <div className="flex-shrink-0">
                  <img
                    src={content.cover_image_url}
                    alt={content.cover_image_alt || content.title}
                    className="w-48 h-32 object-cover rounded-lg"
                  />
                  {content.pexels_photographer && (
                    <p className="text-xs text-gray-500 mt-1">
                      📷 {content.pexels_photographer}
                    </p>
                  )}
                </div>
              )}

              {/* Content Info */}
              <div className="flex-1">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold text-gray-900">{content.title}</h3>
                      {getStatusBadge(content.status)}
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-3">{content.meta_description}</p>

                    <div className="flex flex-wrap gap-3 text-sm">
                      <div className="flex items-center gap-1">
                        <span className="text-gray-500">Kelime:</span>
                        <span className="font-medium">{content.word_count}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-gray-500">SEO:</span>
                        <span className={`font-medium ${content.seo_score >= 80 ? 'text-green-600' : content.seo_score >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                          {content.seo_score}/100
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-gray-500">Okunabilirlik:</span>
                        <span className={`font-medium ${content.readability_score >= 70 ? 'text-green-600' : content.readability_score >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                          {content.readability_score}/100
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Meta Info */}
                <div className="bg-gray-50 rounded-lg p-3 mb-3">
                  <div className="text-sm">
                    <div className="mb-1">
                      <span className="text-gray-600">Meta Title:</span>
                      <span className="ml-2 font-medium">{content.meta_title}</span>
                      <span className="ml-2 text-xs text-gray-500">({content.meta_title.length}/60)</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Slug:</span>
                      <span className="ml-2 text-blue-600">/blog/{content.slug}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => window.location.href = `/admin/ai-blog-planner/edit/${content.id}`}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
                  >
                    ✏️ Düzenle
                  </button>

                  <button
                    onClick={() => setSelectedContent(content)}
                    className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-100"
                  >
                    👁️ Önizle
                  </button>
                  
                  {content.status === 'review' && (
                    <button
                      onClick={() => approveContent(content.id)}
                      className="px-4 py-2 bg-green-50 text-green-600 rounded-lg text-sm font-medium hover:bg-green-100"
                    >
                      ✅ Onayla
                    </button>
                  )}
                  
                  {content.status === 'approved' && !content.blog_id && (
                    <button
                      onClick={() => publishContent(content.id)}
                      disabled={isPublishing}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 disabled:bg-gray-300"
                    >
                      🚀 Yayınla
                    </button>
                  )}

                  {content.blog_id && (
                    <a
                      href={`/blog/${content.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200"
                    >
                      🔗 Görüntüle
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {contents.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <p className="text-gray-500">Henüz içerik üretilmedi</p>
        </div>
      )}

      {/* Preview Modal */}
      {selectedContent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
              <h3 className="text-2xl font-bold">{selectedContent.title}</h3>
              <button
                onClick={() => setSelectedContent(null)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="p-6">
              {selectedContent.cover_image_url && (
                <img
                  src={selectedContent.cover_image_url}
                  alt={selectedContent.cover_image_alt || selectedContent.title}
                  className="w-full h-64 object-cover rounded-lg mb-6"
                />
              )}

              <div 
                className="prose prose-slate max-w-none"
                dangerouslySetInnerHTML={{ __html: selectedContent.content.replace(/\n/g, '<br/>') }}
              />
            </div>

            <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 flex gap-3">
              <button
                onClick={() => setSelectedContent(null)}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
              >
                Kapat
              </button>
              {selectedContent.status === 'review' && (
                <button
                  onClick={() => {
                    approveContent(selectedContent.id);
                    setSelectedContent(null);
                  }}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  ✅ Onayla
                </button>
              )}
              {selectedContent.status === 'approved' && !selectedContent.blog_id && (
                <button
                  onClick={() => {
                    publishContent(selectedContent.id);
                    setSelectedContent(null);
                  }}
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  🚀 Yayınla
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
