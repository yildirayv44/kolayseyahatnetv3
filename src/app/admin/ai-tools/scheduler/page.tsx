"use client";

import { useState, useEffect } from "react";
import { Calendar, Loader2, ArrowLeft, AlertCircle, Clock, TrendingUp } from "lucide-react";
import Link from "next/link";

interface UpdateSchedule {
  contentId: string;
  title?: string;
  lastUpdated: Date;
  nextUpdateDue: Date;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  reason: string;
  suggestedChanges: string[];
  daysOverdue?: number;
}

interface ScheduleSummary {
  total: number;
  urgent: number;
  high: number;
  medium: number;
  low: number;
}

export default function SchedulerPage() {
  const [loading, setLoading] = useState(false);
  const [schedules, setSchedules] = useState<UpdateSchedule[]>([]);
  const [summary, setSummary] = useState<ScheduleSummary | null>(null);
  const [filter, setFilter] = useState<'all' | 'urgent' | 'high' | 'medium' | 'low'>('all');

  useEffect(() => {
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/ai/schedule-updates');
      const data = await response.json();
      
      if (data.success) {
        setSchedules(data.schedules);
        setSummary(data.summary);
      }
    } catch (error) {
      console.error('Fetch schedules error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-300';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-300';
      default: return 'bg-slate-100 text-slate-800 border-slate-300';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'urgent': return '🚨';
      case 'high': return '⚠️';
      case 'medium': return '📅';
      case 'low': return 'ℹ️';
      default: return '📝';
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'ACİL';
      case 'high': return 'YÜKSEK';
      case 'medium': return 'ORTA';
      case 'low': return 'DÜŞÜK';
      default: return priority.toUpperCase();
    }
  };

  const filteredSchedules = filter === 'all' 
    ? schedules 
    : schedules.filter(s => s.priority === filter);

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getDaysAgo = (date: Date) => {
    const days = Math.floor((new Date().getTime() - new Date(date).getTime()) / (1000 * 60 * 60 * 24));
    return days;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-7xl mx-auto">
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
            <div className="p-3 bg-gradient-to-br from-orange-600 to-red-600 rounded-xl">
              <Calendar className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-slate-900">Güncelleme Zamanlayıcı</h1>
              <p className="text-slate-600 mt-1">
                İçeriklerinizin güncelleme zamanını otomatik takip edin
              </p>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
              <div className="text-sm text-slate-600 mb-1">Toplam</div>
              <div className="text-3xl font-bold text-slate-900">{summary.total}</div>
            </div>
            <div className="bg-red-50 rounded-xl p-4 border-2 border-red-200 shadow-sm">
              <div className="text-sm text-red-600 mb-1 font-semibold">🚨 Acil</div>
              <div className="text-3xl font-bold text-red-900">{summary.urgent}</div>
            </div>
            <div className="bg-orange-50 rounded-xl p-4 border-2 border-orange-200 shadow-sm">
              <div className="text-sm text-orange-600 mb-1 font-semibold">⚠️ Yüksek</div>
              <div className="text-3xl font-bold text-orange-900">{summary.high}</div>
            </div>
            <div className="bg-yellow-50 rounded-xl p-4 border-2 border-yellow-200 shadow-sm">
              <div className="text-sm text-yellow-600 mb-1 font-semibold">📅 Orta</div>
              <div className="text-3xl font-bold text-yellow-900">{summary.medium}</div>
            </div>
            <div className="bg-blue-50 rounded-xl p-4 border-2 border-blue-200 shadow-sm">
              <div className="text-sm text-blue-600 mb-1 font-semibold">ℹ️ Düşük</div>
              <div className="text-3xl font-bold text-blue-900">{summary.low}</div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="flex gap-2 mb-6 bg-white rounded-xl p-2 border border-slate-200 shadow-sm">
          {[
            { id: 'all', label: 'Tümü', count: summary?.total || 0 },
            { id: 'urgent', label: 'Acil', count: summary?.urgent || 0 },
            { id: 'high', label: 'Yüksek', count: summary?.high || 0 },
            { id: 'medium', label: 'Orta', count: summary?.medium || 0 },
            { id: 'low', label: 'Düşük', count: summary?.low || 0 },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id as any)}
              className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-all ${
                filter === f.id
                  ? 'bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-lg'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {f.label} ({f.count})
            </button>
          ))}
        </div>

        {/* Schedules List */}
        {loading ? (
          <div className="bg-white rounded-xl p-12 border border-slate-200 shadow-sm text-center">
            <Loader2 className="h-12 w-12 animate-spin text-orange-600 mx-auto mb-4" />
            <p className="text-slate-500">Yükleniyor...</p>
          </div>
        ) : filteredSchedules.length > 0 ? (
          <div className="space-y-4">
            {filteredSchedules.map((schedule, idx) => (
              <div
                key={idx}
                className={`bg-white rounded-xl p-6 border-2 shadow-sm ${getPriorityColor(schedule.priority)}`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl">{getPriorityIcon(schedule.priority)}</span>
                      <div>
                        <h3 className="text-lg font-bold text-slate-900">
                          {schedule.title || `İçerik #${schedule.contentId}`}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-slate-600 mt-1">
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {getDaysAgo(schedule.lastUpdated)} gün önce güncellendi
                          </div>
                          {schedule.daysOverdue && (
                            <div className="flex items-center gap-1 text-red-600 font-semibold">
                              <AlertCircle className="h-4 w-4" />
                              {schedule.daysOverdue} gün gecikmiş
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className={`px-4 py-2 rounded-full font-bold text-sm ${getPriorityColor(schedule.priority)}`}>
                    {getPriorityText(schedule.priority)}
                  </div>
                </div>

                <div className="bg-white/50 rounded-lg p-4 mb-4">
                  <p className="text-sm text-slate-700">
                    <strong>Sebep:</strong> {schedule.reason}
                  </p>
                </div>

                {schedule.suggestedChanges.length > 0 && (
                  <div>
                    <p className="text-sm font-semibold text-slate-700 mb-2">Önerilen Değişiklikler:</p>
                    <div className="space-y-2">
                      {schedule.suggestedChanges.map((change, cidx) => (
                        <div key={cidx} className="flex items-start gap-2 text-sm text-slate-700">
                          <div className="bg-orange-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                            {cidx + 1}
                          </div>
                          <span>{change}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-4 pt-4 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
                  <div>Son güncelleme: {formatDate(schedule.lastUpdated)}</div>
                  <div>Sonraki güncelleme: {formatDate(schedule.nextUpdateDue)}</div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl p-12 border border-slate-200 shadow-sm text-center">
            <Calendar className="h-16 w-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 mb-2">
              {filter === 'all' ? 'Henüz içerik yok' : `${getPriorityText(filter)} öncelikli içerik yok`}
            </p>
            <p className="text-sm text-slate-400">
              İçerikleriniz otomatik olarak analiz edilecek
            </p>
          </div>
        )}

        {/* Refresh Button */}
        <div className="mt-6 text-center">
          <button
            onClick={fetchSchedules}
            disabled={loading}
            className="bg-gradient-to-r from-orange-600 to-red-600 text-white px-6 py-3 rounded-lg font-bold hover:from-orange-700 hover:to-red-700 disabled:opacity-50 transition-all shadow-lg inline-flex items-center gap-2"
          >
            <TrendingUp className="h-5 w-5" />
            Yenile
          </button>
        </div>
      </div>
    </div>
  );
}
