'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Topic {
  id: string;
  title: string;
  title_en: string;
  slug: string;
  description: string;
  category: string;
  priority: number;
  status: string;
  target_keywords: string[];
  estimated_search_volume: number;
  keyword_difficulty: number;
  target_word_count: number;
  outline: string[];
  data_source: string;
  reasoning: string;
}

interface Plan {
  id: string;
  country_name: string;
  country_slug: string;
  month: number;
  year: number;
  total_topics: number;
  generated_topics: number;
  approved_topics: number;
  status: string;
}

export default function PlanReviewPage() {
  const params = useParams();
  const router = useRouter();
  const plan_id = params.plan_id as string;

  const [plan, setPlan] = useState<Plan | null>(null);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [filteredTopics, setFilteredTopics] = useState<Topic[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [editingTopic, setEditingTopic] = useState<Topic | null>(null);
  const [isApproving, setIsApproving] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEditingPlan, setIsEditingPlan] = useState(false);
  const [editedMonth, setEditedMonth] = useState<number>(1);
  const [editedYear, setEditedYear] = useState<number>(2026);
  const [editedTopicCount, setEditedTopicCount] = useState<number>(30);
  const [isAddingTopics, setIsAddingTopics] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [hasTriggeredGeneration, setHasTriggeredGeneration] = useState(false);

  useEffect(() => {
    loadPlanDetails();
  }, [plan_id]);

  useEffect(() => {
    filterTopics();
  }, [topics, selectedCategory, selectedStatus]);

  // Auto-trigger content generation for approved topics (runs once on page load)
  useEffect(() => {
    console.log('Auto-trigger check:', {
      hasTriggeredGeneration,
      hasPlan: !!plan,
      planStatus: plan?.status,
      topicsCount: topics.length,
      approvedCount: topics.filter(t => t.status === 'approved').length
    });

    if (!hasTriggeredGeneration && plan && topics.length > 0 && plan.status === 'generating') {
      const approvedTopics = topics.filter(t => t.status === 'approved');
      
      if (approvedTopics.length > 0) {
        console.log(`Auto-generating content for ${approvedTopics.length} approved topics`);
        setMessage({ 
          type: 'success', 
          text: `🔄 ${approvedTopics.length} içerik otomatik olarak üretiliyor... İçerikler sayfasından takip edebilirsiniz.` 
        });
        
        approvedTopics.forEach(topic => {
          console.log(`Starting content generation for topic ${topic.id}: ${topic.title}`);
          fetch('/api/admin/ai-blog/generate-content', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ topic_id: topic.id })
          }).then(res => {
            console.log(`Content generation started for ${topic.id}:`, res.status);
          }).catch(err => {
            console.error(`Failed to generate content for topic ${topic.id}:`, err);
          });
        });
        
        setHasTriggeredGeneration(true);
        setTimeout(() => setMessage(null), 5000);
      }
    }
  }, [plan, topics, hasTriggeredGeneration]);

  const loadPlanDetails = async () => {
    try {
      const response = await fetch(`/api/admin/ai-blog/plan-details?plan_id=${plan_id}`);
      const result = await response.json();

      if (result.success) {
        setPlan(result.plan);
        setTopics(result.topics || []);
        // Initialize edit values
        setEditedMonth(result.plan.month);
        setEditedYear(result.plan.year);
        setEditedTopicCount(result.plan.total_topics);
      }
    } catch (error) {
      console.error('Error loading plan:', error);
    }
  };

  const updatePlan = async () => {
    try {
      const response = await fetch('/api/admin/ai-blog/update-plan', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan_id,
          month: editedMonth,
          year: editedYear,
          total_topics: editedTopicCount
        })
      });

      const result = await response.json();

      if (result.success) {
        setMessage({ type: 'success', text: 'Plan başarıyla güncellendi!' });
        setIsEditingPlan(false);
        loadPlanDetails();
      } else {
        setMessage({ type: 'error', text: result.error || 'Güncelleme başarısız' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Bir hata oluştu' });
    }
  };

  const deletePlan = async () => {
    if (!confirm('Bu planı silmek istediğinizden emin misiniz? Tüm konular ve içerikler silinecek!')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/ai-blog/update-plan?plan_id=${plan_id}`, {
        method: 'DELETE'
      });

      const result = await response.json();

      if (result.success) {
        setMessage({ type: 'success', text: 'Plan silindi!' });
        setTimeout(() => router.push('/admin/ai-blog-planner'), 1500);
      } else {
        setMessage({ type: 'error', text: result.error || 'Silme başarısız' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Bir hata oluştu' });
    }
  };

  const addBulkTopics = async (count: number) => {
    if (!confirm(`${count} yeni konu oluşturmak istediğinizden emin misiniz?`)) {
      return;
    }

    setIsAddingTopics(true);
    setMessage(null);

    try {
      const response = await fetch('/api/admin/ai-blog/add-topics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan_id,
          topic_count: count
        })
      });

      const result = await response.json();

      if (result.success) {
        setMessage({ 
          type: 'success', 
          text: `✅ ${result.topics_added} yeni konu eklendi! Toplam: ${result.total_topics}` 
        });
        loadPlanDetails();
      } else {
        setMessage({ type: 'error', text: result.error || 'Konu ekleme başarısız' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Bir hata oluştu' });
    } finally {
      setIsAddingTopics(false);
    }
  };

  const filterTopics = () => {
    let filtered = [...topics];

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(t => t.category === selectedCategory);
    }

    if (selectedStatus !== 'all') {
      filtered = filtered.filter(t => t.status === selectedStatus);
    }

    setFilteredTopics(filtered);
  };

  const updateTopic = async (topicId: string, updates: any) => {
    try {
      const response = await fetch('/api/admin/ai-blog/update-topic', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic_id: topicId, ...updates })
      });

      const result = await response.json();

      if (result.success) {
        setTopics(topics.map(t => t.id === topicId ? { ...t, ...updates } : t));
        setMessage({ type: 'success', text: 'Konu güncellendi' });
        setTimeout(() => setMessage(null), 3000);
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Güncelleme başarısız' });
    }
  };

  const deleteTopic = async (topicId: string) => {
    if (!confirm('Bu konuyu silmek istediğinizden emin misiniz?')) return;

    try {
      const response = await fetch(`/api/admin/ai-blog/update-topic?topic_id=${topicId}`, {
        method: 'DELETE'
      });

      const result = await response.json();

      if (result.success) {
        setTopics(topics.filter(t => t.id !== topicId));
        setMessage({ type: 'success', text: 'Konu silindi' });
        setTimeout(() => setMessage(null), 3000);
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Silme başarısız' });
    }
  };

  const approvePlan = async () => {
    if (!confirm('Planı onaylayıp içerik üretimine başlamak istiyor musunuz?')) return;

    setIsApproving(true);

    try {
      const response = await fetch('/api/admin/ai-blog/approve-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan_id })
      });

      const result = await response.json();

      if (result.success) {
        setMessage({ type: 'success', text: 'Plan onaylandı! İçerik üretimi başlıyor...' });
        
        // Start generating content for all approved topics
        startContentGeneration();
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Onaylama başarısız' });
    } finally {
      setIsApproving(false);
    }
  };

  const startContentGeneration = async () => {
    setIsGenerating(true);
    const approvedTopics = topics.filter(t => t.status === 'approved' || t.status === 'pending');

    for (const topic of approvedTopics) {
      try {
        await fetch('/api/admin/ai-blog/generate-content', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ topic_id: topic.id })
        });
      } catch (error) {
        console.error(`Error generating content for ${topic.id}:`, error);
      }
    }

    setIsGenerating(false);
    setMessage({ type: 'success', text: 'İçerik üretimi tamamlandı!' });
    
    setTimeout(() => {
      router.push(`/admin/ai-blog-planner/content/${plan_id}`);
    }, 2000);
  };

  const categoryNames: { [key: string]: string } = {
    visa_procedures: 'Vize & Prosedürler',
    travel_planning: 'Seyahat Planlama',
    practical_info: 'Pratik Bilgiler',
    culture: 'Kültür & Yaşam',
    comparison: 'Karşılaştırma'
  };

  const statusNames: { [key: string]: string } = {
    pending: 'Bekliyor',
    approved: 'Onaylandı',
    rejected: 'Reddedildi',
    generating: 'Üretiliyor',
    review: 'İncelemede',
    published: 'Yayında'
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
        
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              📋 Plan İnceleme: {plan.country_name}
            </h1>
            <p className="text-gray-600">
              {months[plan.month - 1]} {plan.year} • {plan.generated_topics} konu üretildi
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => router.push(`/admin/ai-blog-planner/content/${plan_id}`)}
              className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700"
            >
              📄 İçerikleri Gör
            </button>
            <button
              onClick={() => setIsEditingPlan(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
            >
              ✏️ Planı Düzenle
            </button>
            <button
              onClick={deletePlan}
              className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700"
            >
              🗑️ Planı Sil
            </button>
          </div>
        </div>
      </div>

      {message && (
        <div className={`mb-6 p-4 rounded-lg ${message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
          {message.text}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-gray-900">{plan.total_topics}</div>
          <div className="text-sm text-gray-600">Toplam Konu</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-blue-600">{topics.filter(t => t.status === 'pending').length}</div>
          <div className="text-sm text-gray-600">Bekliyor</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-green-600">{plan.approved_topics}</div>
          <div className="text-sm text-gray-600">Onaylandı</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-yellow-600">{topics.filter(t => t.status === 'generating').length}</div>
          <div className="text-sm text-gray-600">Üretiliyor</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-red-600">{topics.filter(t => t.status === 'rejected').length}</div>
          <div className="text-sm text-gray-600">Reddedildi</div>
        </div>
      </div>

      {/* Bulk Topic Creation */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200 p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">➕ Yeni Konular Ekle</h3>
            <p className="text-sm text-gray-600">Mevcut plana ek konular oluştur (AI ile otomatik)</p>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => addBulkTopics(4)}
              disabled={isAddingTopics}
              className="px-4 py-2 bg-white border-2 border-purple-300 text-purple-700 rounded-lg font-medium hover:bg-purple-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isAddingTopics ? '⏳' : '+'} 4 Konu
            </button>
            <button
              onClick={() => addBulkTopics(10)}
              disabled={isAddingTopics}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isAddingTopics ? '⏳' : '+'} 10 Konu
            </button>
            <button
              onClick={() => addBulkTopics(20)}
              disabled={isAddingTopics}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isAddingTopics ? '⏳' : '+'} 20 Konu
            </button>
          </div>
        </div>
        
        {isAddingTopics && (
          <div className="mt-4 flex items-center gap-2 text-sm text-purple-700">
            <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Yeni konular AI ile oluşturuluyor...</span>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
        <div className="flex flex-wrap gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Kategori</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Tümü</option>
              {Object.entries(categoryNames).map(([key, name]) => (
                <option key={key} value={key}>{name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Durum</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Tümü</option>
              {Object.entries(statusNames).map(([key, name]) => (
                <option key={key} value={key}>{name}</option>
              ))}
            </select>
          </div>

          <div className="flex-1"></div>

          <div className="flex items-end gap-2">
            <button
              onClick={approvePlan}
              disabled={isApproving || isGenerating}
              className="px-6 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {isApproving ? 'Onaylanıyor...' : isGenerating ? 'İçerik Üretiliyor...' : '✅ Planı Onayla ve Üretime Başla'}
            </button>
          </div>
        </div>
      </div>

      {/* Topics List */}
      <div className="space-y-4">
        {filteredTopics.map((topic, index) => (
          <div key={topic.id} className="bg-white rounded-lg border border-gray-200 p-4 hover:border-blue-300 transition-colors">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-semibold">
                {index + 1}
              </div>

              <div className="flex-1">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">{topic.title}</h3>
                    <p className="text-sm text-gray-600 mb-2">{topic.description}</p>
                  </div>
                  
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => setEditingTopic(topic)}
                      className="px-3 py-1 text-sm bg-blue-50 text-blue-600 rounded hover:bg-blue-100"
                    >
                      ✏️ Düzenle
                    </button>
                    <button
                      onClick={() => deleteTopic(topic.id)}
                      className="px-3 py-1 text-sm bg-red-50 text-red-600 rounded hover:bg-red-100"
                    >
                      🗑️ Sil
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-3">
                  <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded">
                    {categoryNames[topic.category]}
                  </span>
                  <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded">
                    Öncelik: {topic.priority}/10
                  </span>
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                    {topic.estimated_search_volume} arama/ay
                  </span>
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded">
                    Zorluk: {topic.keyword_difficulty}/100
                  </span>
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                    {topic.target_word_count} kelime
                  </span>
                </div>

                {topic.target_keywords && topic.target_keywords.length > 0 && (
                  <div className="text-sm text-gray-600 mb-2">
                    <strong>Anahtar Kelimeler:</strong> {topic.target_keywords.join(', ')}
                  </div>
                )}

                {topic.reasoning && (
                  <div className="text-sm text-gray-500 italic">
                    💡 {topic.reasoning}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredTopics.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <p className="text-gray-500">Filtre kriterlerine uygun konu bulunamadı</p>
        </div>
      )}

      {/* Edit Modal */}
      {editingTopic && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <h3 className="text-xl font-bold mb-4">Konu Düzenle</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Başlık (TR)</label>
                <input
                  type="text"
                  value={editingTopic.title}
                  onChange={(e) => setEditingTopic({ ...editingTopic, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Açıklama</label>
                <textarea
                  value={editingTopic.description}
                  onChange={(e) => setEditingTopic({ ...editingTopic, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Kategori</label>
                  <select
                    value={editingTopic.category}
                    onChange={(e) => setEditingTopic({ ...editingTopic, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    {Object.entries(categoryNames).map(([key, name]) => (
                      <option key={key} value={key}>{name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Öncelik (0-10)</label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    value={editingTopic.priority}
                    onChange={(e) => setEditingTopic({ ...editingTopic, priority: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Hedef Kelime Sayısı</label>
                <input
                  type="number"
                  value={editingTopic.target_word_count}
                  onChange={(e) => setEditingTopic({ ...editingTopic, target_word_count: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  updateTopic(editingTopic.id, {
                    title: editingTopic.title,
                    description: editingTopic.description,
                    category: editingTopic.category,
                    priority: editingTopic.priority,
                    target_word_count: editingTopic.target_word_count
                  });
                  setEditingTopic(null);
                }}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Kaydet
              </button>
              <button
                onClick={() => setEditingTopic(null)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
              >
                İptal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Plan Modal */}
      {isEditingPlan && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">✏️ Planı Düzenle</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Ay</label>
                <select
                  value={editedMonth}
                  onChange={(e) => setEditedMonth(parseInt(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                >
                  {months.map((month, index) => (
                    <option key={index} value={index + 1}>{month}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Yıl</label>
                <input
                  type="number"
                  value={editedYear}
                  onChange={(e) => setEditedYear(parseInt(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  min="2024"
                  max="2030"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Hedef Konu Sayısı</label>
                <input
                  type="number"
                  value={editedTopicCount}
                  onChange={(e) => setEditedTopicCount(parseInt(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  min="1"
                  max="100"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={updatePlan}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
              >
                💾 Kaydet
              </button>
              <button
                onClick={() => setIsEditingPlan(false)}
                className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300"
              >
                İptal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
