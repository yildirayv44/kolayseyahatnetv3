'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Country {
  id: number;
  name: string;
  slug: string;
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
  published_topics: number;
  rejected_topics: number;
  status: string;
  created_at: string;
}

export default function AIBlogPlannerPage() {
  const [countries, setCountries] = useState<Country[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<number | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [topicCount, setTopicCount] = useState<number>(30);
  const [isCreating, setIsCreating] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  // Bulk planning states
  const [selectedCountries, setSelectedCountries] = useState<number[]>([]);
  const [bulkTopicCount, setBulkTopicCount] = useState<number>(10);
  const [autoApprove, setAutoApprove] = useState<boolean>(false);
  const [autoSchedule, setAutoSchedule] = useState<boolean>(false);
  const [scheduleStartDate, setScheduleStartDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [isBulkCreating, setIsBulkCreating] = useState(false);

  useEffect(() => {
    loadCountries();
    loadPlans();
  }, []);

  const loadCountries = async () => {
    const { data } = await supabase
      .from('countries')
      .select('id, name, slug')
      .eq('status', 1)
      .order('name');
    
    if (data) setCountries(data);
  };

  const loadPlans = async () => {
    const { data } = await supabase
      .from('ai_blog_plans')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (data) setPlans(data);
  };

  const toggleCountrySelection = (countryId: number) => {
    setSelectedCountries(prev => 
      prev.includes(countryId) 
        ? prev.filter(id => id !== countryId)
        : [...prev, countryId]
    );
  };

  const createBulkPlans = async () => {
    if (selectedCountries.length === 0) {
      setMessage({ type: 'error', text: 'Lütfen en az bir ülke seçin' });
      return;
    }

    if (!confirm(`${selectedCountries.length} ülke için toplam ${selectedCountries.length * bulkTopicCount} içerik planlamak istediğinizden emin misiniz?${autoApprove ? '\n\n⚠️ Otomatik onaylama AÇIK - İçerikler direkt üretilecek!' : ''}`)) {
      return;
    }

    setIsBulkCreating(true);
    setMessage({ 
      type: 'success', 
      text: '🚀 Planlar oluşturuluyor... AI konuları üretiyor...' 
    });

    const requestBody = {
      country_ids: selectedCountries,
      month: selectedMonth,
      year: selectedYear,
      topics_per_country: bulkTopicCount,
      auto_approve: autoApprove,
      auto_schedule: autoSchedule,
      schedule_start_date: autoSchedule ? scheduleStartDate : null,
      schedule_frequency: 'daily'
    };
    
    console.log('Bulk create request:', requestBody);

    try {
      const response = await fetch('/api/admin/ai-blog/bulk-create-plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });

      const result = await response.json();
      console.log('Bulk create plans result:', result);

      if (result.success) {
        let successMessage = `✅ ${result.created_plans.length} plan oluşturuldu! ${result.total_topics_created} konu üretildi.`;
        
        if (autoApprove) {
          successMessage += '\n\n🔄 Konular otomatik onaylandı, içerikler arka planda üretiliyor...';
        }
        
        if (autoSchedule) {
          successMessage += '\n📅 İçerikler üretildikçe otomatik planlanacak!';
        }
        
        successMessage += '\n\n💡 İpucu: Plan sayfalarını açarak ilerlemeyi takip edebilirsiniz.';
        
        setMessage({ 
          type: 'success', 
          text: successMessage
        });
        setSelectedCountries([]);
        loadPlans();
        setTimeout(() => setMessage(null), 10000);
      } else {
        setMessage({ type: 'error', text: result.error || 'Toplu plan oluşturma başarısız' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Bir hata oluştu' });
    } finally {
      setIsBulkCreating(false);
    }
  };

  const createPlan = async () => {
    if (!selectedCountry) {
      setMessage({ type: 'error', text: 'Lütfen bir ülke seçin' });
      return;
    }

    setIsCreating(true);
    setMessage(null);

    try {
      const response = await fetch('/api/admin/ai-blog/create-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          country_id: selectedCountry,
          month: selectedMonth,
          year: selectedYear,
          topic_count: topicCount
        })
      });

      const result = await response.json();

      if (result.success) {
        setMessage({ 
          type: 'success', 
          text: `Plan oluşturuldu! ${result.topics_generated} konu üretildi.` 
        });
        loadPlans();
        
        // Redirect to plan details
        setTimeout(() => {
          window.location.href = `/admin/ai-blog-planner/review/${result.plan_id}`;
        }, 1500);
      } else {
        setMessage({ type: 'error', text: result.error || 'Plan oluşturulamadı' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Bir hata oluştu' });
    } finally {
      setIsCreating(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const badges: { [key: string]: { bg: string; text: string; label: string } } = {
      planning: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Planlama' },
      review: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'İnceleme' },
      generating: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Üretiliyor' },
      completed: { bg: 'bg-green-100', text: 'text-green-800', label: 'Tamamlandı' },
      cancelled: { bg: 'bg-red-100', text: 'text-red-800', label: 'İptal' }
    };

    const badge = badges[status] || badges.planning;
    return (
      <span className={`px-2 py-1 rounded text-xs font-medium ${badge.bg} ${badge.text}`}>
        {badge.label}
      </span>
    );
  };

  const months = [
    'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
    'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">🤖 AI Blog İçerik Planlayıcı</h1>
        <p className="text-gray-600">Ülke seçip AI ile otomatik blog içerikleri oluşturun</p>
      </div>

      {message && (
        <div className={`mb-6 p-4 rounded-lg ${message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
          {message.text}
        </div>
      )}

      {/* Bulk Multi-Country Planning */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border-2 border-purple-300 p-6 mb-8">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-3xl">🚀</span>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Toplu Çoklu Ülke Planlaması</h2>
            <p className="text-sm text-gray-600">Birden fazla ülke için aynı anda plan oluştur, otomatik onayla ve planla</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Country Selection */}
          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Ülkeler Seçin ({selectedCountries.length} seçili)
            </label>
            <div className="bg-white rounded-lg border border-gray-300 p-4 max-h-64 overflow-y-auto">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {countries.map(country => (
                  <label
                    key={country.id}
                    className={`flex items-center gap-2 p-2 rounded cursor-pointer transition-colors ${
                      selectedCountries.includes(country.id)
                        ? 'bg-purple-100 border-2 border-purple-500'
                        : 'hover:bg-gray-50 border-2 border-transparent'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedCountries.includes(country.id)}
                      onChange={() => toggleCountrySelection(country.id)}
                      className="w-4 h-4 text-purple-600 rounded"
                    />
                    <span className="text-sm font-medium">{country.name}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Settings */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Ay</label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
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
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                min="2024"
                max="2030"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ülke Başına Konu Sayısı
              </label>
              <input
                type="number"
                value={bulkTopicCount}
                onChange={(e) => setBulkTopicCount(parseInt(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                min="1"
                max="50"
              />
              <p className="text-xs text-gray-500 mt-1">
                Toplam: {selectedCountries.length * bulkTopicCount} içerik
              </p>
            </div>
          </div>
        </div>

        {/* Options */}
        <div className="bg-white rounded-lg border border-gray-300 p-4 mb-4">
          <h3 className="font-semibold text-gray-900 mb-3">⚙️ Otomasyon Seçenekleri</h3>
          
          <div className="space-y-3">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={autoApprove}
                onChange={(e) => setAutoApprove(e.target.checked)}
                className="w-5 h-5 text-purple-600 rounded mt-0.5"
              />
              <div>
                <span className="font-medium text-gray-900">Otomatik Onayla</span>
                <p className="text-sm text-gray-600">Konuları otomatik onayla ve içerik üretimine başla</p>
              </div>
            </label>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={autoSchedule}
                onChange={(e) => setAutoSchedule(e.target.checked)}
                className="w-5 h-5 text-purple-600 rounded mt-0.5"
              />
              <div>
                <span className="font-medium text-gray-900">Otomatik Planla</span>
                <p className="text-sm text-gray-600">İçerikleri otomatik olarak yayın tarihlerine planla</p>
              </div>
            </label>

            {autoSchedule && (
              <div className="ml-8 mt-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Başlangıç Tarihi
                </label>
                <input
                  type="date"
                  value={scheduleStartDate}
                  onChange={(e) => setScheduleStartDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="px-4 py-2 border border-gray-300 rounded-lg"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Her gün 1 içerik yayınlanacak
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={createBulkPlans}
          disabled={isBulkCreating || selectedCountries.length === 0}
          className="w-full px-6 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-bold text-lg hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {isBulkCreating ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Planlar Oluşturuluyor...
            </span>
          ) : (
            `🚀 ${selectedCountries.length} Ülke İçin ${selectedCountries.length * bulkTopicCount} İçerik Planla`
          )}
        </button>

        {selectedCountries.length > 0 && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>📋 Özet:</strong> {selectedCountries.length} ülke × {bulkTopicCount} konu = {selectedCountries.length * bulkTopicCount} toplam içerik
              {autoApprove && ' • Otomatik onaylama AÇIK'}
              {autoSchedule && ` • ${scheduleStartDate} tarihinden itibaren günlük yayın`}
            </p>
          </div>
        )}
      </div>

      {/* Single Plan Creation (Collapsed) */}
      <details className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
        <summary className="p-6 cursor-pointer font-semibold text-lg hover:bg-gray-50">
          🎯 Tek Ülke İçin Plan Oluştur (Klasik Yöntem)
        </summary>
        <div className="p-6 pt-0">
          <h2 className="text-xl font-semibold mb-4">Yeni Plan Oluştur</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ülke Seçin *
            </label>
            <select
              value={selectedCountry || ''}
              onChange={(e) => setSelectedCountry(parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isCreating}
            >
              <option value="">Ülke seçin...</option>
              {countries.map(country => (
                <option key={country.id} value={country.id}>
                  {country.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ay
            </label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isCreating}
            >
              {months.map((month, index) => (
                <option key={index} value={index + 1}>
                  {month} {selectedYear}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Yıl
            </label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isCreating}
            >
              <option value={2026}>2026</option>
              <option value={2027}>2027</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Konu Sayısı
            </label>
            <input
              type="number"
              value={topicCount}
              onChange={(e) => setTopicCount(parseInt(e.target.value))}
              min="10"
              max="50"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isCreating}
            />
          </div>
        </div>

        <button
          onClick={createPlan}
          disabled={isCreating || !selectedCountry}
          className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          {isCreating ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Plan Oluşturuluyor...
            </span>
          ) : (
            '🚀 Plan Oluştur ve Konuları Üret'
          )}
        </button>

        <p className="text-sm text-gray-500 mt-2">
          ⏱️ İşlem süresi: ~30 saniye
        </p>
        </div>
      </details>

      {/* Plans List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold mb-4">📋 Mevcut Planlar</h2>
        
        {plans.length === 0 ? (
          <p className="text-gray-500 text-center py-8">Henüz plan oluşturulmamış</p>
        ) : (
          <div className="space-y-4">
            {plans.map(plan => (
              <div key={plan.id} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {plan.country_name}
                      </h3>
                      {getStatusBadge(plan.status)}
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-3">
                      {months[plan.month - 1]} {plan.year}
                    </p>

                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-sm">
                      <div>
                        <span className="text-gray-500">Toplam:</span>
                        <span className="ml-1 font-medium">{plan.total_topics}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Üretilen:</span>
                        <span className="ml-1 font-medium">{plan.generated_topics}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Onaylanan:</span>
                        <span className="ml-1 font-medium text-green-600">{plan.approved_topics}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Yayınlanan:</span>
                        <span className="ml-1 font-medium text-blue-600">{plan.published_topics}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Reddedilen:</span>
                        <span className="ml-1 font-medium text-red-600">{plan.rejected_topics}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 ml-4">
                    <a
                      href={`/admin/ai-blog-planner/review/${plan.id}`}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                    >
                      İncele
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
