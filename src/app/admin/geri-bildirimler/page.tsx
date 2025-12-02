"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { MessageSquare, Search, Filter, Eye, Trash2, CheckCircle, Clock, XCircle } from "lucide-react";

interface Feedback {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  type: string;
  subject: string | null;
  message: string;
  status: string;
  created_at: string;
}

export default function GeriBildirimlerPage() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null);

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const fetchFeedbacks = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("feedback")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setFeedbacks(data || []);
    } catch (error) {
      console.error("Error fetching feedbacks:", error);
      alert("Geri bildirimler yüklenirken hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: number, status: string) => {
    try {
      const { error } = await supabase
        .from("feedback")
        .update({ status })
        .eq("id", id);

      if (error) throw error;
      fetchFeedbacks();
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Durum güncellenirken hata oluştu");
    }
  };

  const deleteFeedback = async (id: number) => {
    if (!confirm("Bu geri bildirimi silmek istediğinizden emin misiniz?")) return;

    try {
      const { error } = await supabase.from("feedback").delete().eq("id", id);

      if (error) throw error;
      alert("Geri bildirim silindi");
      fetchFeedbacks();
    } catch (error) {
      console.error("Error deleting feedback:", error);
      alert("Geri bildirim silinirken hata oluştu");
    }
  };

  const getTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      suggestion: "Öneri",
      complaint: "Şikayet",
      compliment: "Teşekkür",
      question: "Soru",
    };
    return types[type] || type;
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      suggestion: "bg-blue-100 text-blue-700",
      complaint: "bg-red-100 text-red-700",
      compliment: "bg-green-100 text-green-700",
      question: "bg-amber-100 text-amber-700",
    };
    return colors[type] || "bg-slate-100 text-slate-700";
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "resolved":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "pending":
        return <Clock className="h-4 w-4 text-amber-600" />;
      case "rejected":
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-slate-400" />;
    }
  };

  const filteredFeedbacks = feedbacks.filter((f) => {
    const matchesSearch =
      f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.message.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === "all" || f.type === typeFilter;
    const matchesStatus = statusFilter === "all" || f.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  const stats = {
    total: feedbacks.length,
    pending: feedbacks.filter((f) => f.status === "pending").length,
    resolved: feedbacks.filter((f) => f.status === "resolved").length,
    rejected: feedbacks.filter((f) => f.status === "rejected").length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Geri Bildirimler</h1>
        <p className="text-sm text-slate-600">
          Müşterilerden gelen şikayet, öneri ve geri bildirimleri yönetin
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        <div className="card">
          <div className="text-sm text-slate-600">Toplam</div>
          <div className="text-2xl font-bold text-slate-900">{stats.total}</div>
        </div>
        <div className="card">
          <div className="text-sm text-slate-600">Beklemede</div>
          <div className="text-2xl font-bold text-amber-600">{stats.pending}</div>
        </div>
        <div className="card">
          <div className="text-sm text-slate-600">Çözüldü</div>
          <div className="text-2xl font-bold text-green-600">{stats.resolved}</div>
        </div>
        <div className="card">
          <div className="text-sm text-slate-600">Reddedildi</div>
          <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-slate-200 py-2 pl-10 pr-4 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-slate-400" />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="all">Tüm Tipler</option>
              <option value="suggestion">Öneri</option>
              <option value="complaint">Şikayet</option>
              <option value="compliment">Teşekkür</option>
              <option value="question">Soru</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="all">Tüm Durumlar</option>
              <option value="pending">Beklemede</option>
              <option value="resolved">Çözüldü</option>
              <option value="rejected">Reddedildi</option>
            </select>
          </div>
        </div>
      </div>

      {/* Feedbacks List */}
      <div className="card">
        {loading ? (
          <div className="py-12 text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-primary" />
            <p className="mt-4 text-sm text-slate-600">Yükleniyor...</p>
          </div>
        ) : filteredFeedbacks.length === 0 ? (
          <div className="py-12 text-center">
            <MessageSquare className="mx-auto h-12 w-12 text-slate-300" />
            <p className="mt-4 text-sm text-slate-600">Geri bildirim bulunamadı</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">
                    KİŞİ
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">
                    TİP
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">
                    KONU
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-slate-600">
                    DURUM
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-slate-600">
                    TARİH
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600">
                    İŞLEMLER
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredFeedbacks.map((feedback) => (
                  <tr key={feedback.id} className="hover:bg-slate-50">
                    <td className="px-4 py-4">
                      <div className="font-medium text-slate-900">{feedback.name}</div>
                      <div className="text-xs text-slate-500">{feedback.email}</div>
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${getTypeColor(
                          feedback.type
                        )}`}
                      >
                        {getTypeLabel(feedback.type)}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="max-w-xs truncate text-sm text-slate-900">
                        {feedback.subject || feedback.message}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        {getStatusIcon(feedback.status)}
                        <select
                          value={feedback.status}
                          onChange={(e) => updateStatus(feedback.id, e.target.value)}
                          className="rounded border border-slate-200 px-2 py-1 text-xs focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20"
                        >
                          <option value="pending">Beklemede</option>
                          <option value="resolved">Çözüldü</option>
                          <option value="rejected">Reddedildi</option>
                        </select>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-center text-sm text-slate-600">
                      {new Date(feedback.created_at).toLocaleDateString("tr-TR")}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedFeedback(feedback)}
                          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 hover:text-primary"
                          title="Görüntüle"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => deleteFeedback(feedback.id)}
                          className="rounded-lg p-2 text-slate-600 hover:bg-red-50 hover:text-red-600"
                          title="Sil"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedFeedback && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setSelectedFeedback(null)}
        >
          <div
            className="w-full max-w-2xl rounded-xl bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-start justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Geri Bildirim Detayı</h2>
                <p className="text-sm text-slate-600">ID: {selectedFeedback.id}</p>
              </div>
              <button
                onClick={() => setSelectedFeedback(null)}
                className="rounded-lg p-2 hover:bg-slate-100"
              >
                <XCircle className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-sm font-semibold text-slate-900">Ad Soyad</label>
                  <p className="text-slate-700">{selectedFeedback.name}</p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-900">E-posta</label>
                  <p className="text-slate-700">{selectedFeedback.email}</p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-sm font-semibold text-slate-900">Telefon</label>
                  <p className="text-slate-700">{selectedFeedback.phone || "-"}</p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-900">Tip</label>
                  <p>
                    <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${getTypeColor(selectedFeedback.type)}`}>
                      {getTypeLabel(selectedFeedback.type)}
                    </span>
                  </p>
                </div>
              </div>

              {selectedFeedback.subject && (
                <div>
                  <label className="text-sm font-semibold text-slate-900">Konu</label>
                  <p className="text-slate-700">{selectedFeedback.subject}</p>
                </div>
              )}

              <div>
                <label className="text-sm font-semibold text-slate-900">Mesaj</label>
                <p className="whitespace-pre-wrap rounded-lg bg-slate-50 p-4 text-slate-700">
                  {selectedFeedback.message}
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-sm font-semibold text-slate-900">Durum</label>
                  <select
                    value={selectedFeedback.status}
                    onChange={(e) => {
                      updateStatus(selectedFeedback.id, e.target.value);
                      setSelectedFeedback({ ...selectedFeedback, status: e.target.value });
                    }}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="pending">Beklemede</option>
                    <option value="resolved">Çözüldü</option>
                    <option value="rejected">Reddedildi</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-900">Tarih</label>
                  <p className="text-slate-700">
                    {new Date(selectedFeedback.created_at).toLocaleString("tr-TR")}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setSelectedFeedback(null)}
                className="rounded-lg border border-slate-200 px-4 py-2 font-semibold text-slate-700 hover:bg-slate-50"
              >
                Kapat
              </button>
              <a
                href={`mailto:${selectedFeedback.email}`}
                className="rounded-lg bg-primary px-4 py-2 font-semibold text-white hover:bg-primary/90"
              >
                E-posta Gönder
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
