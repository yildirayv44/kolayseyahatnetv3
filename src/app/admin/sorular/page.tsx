"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { Plus, Edit, Trash2, MessageSquare, Search, Filter } from "lucide-react";

interface Question {
  id: number;
  title: string;
  contents: string;
  parent_id: number;
  status: number;
  created_at: string;
  country_count?: number;
}

export default function SorularPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      
      // Fetch parent questions (parent_id = 0)
      const { data: questionsData, error } = await supabase
        .from("questions")
        .select("*")
        .eq("parent_id", 0)
        .order("created_at", { ascending: false, nullsFirst: false });

      if (error) throw error;

      // Fetch country counts for each question
      const questionsWithCounts = await Promise.all(
        (questionsData || []).map(async (q) => {
          const { count } = await supabase
            .from("question_to_countries")
            .select("*", { count: "exact", head: true })
            .eq("question_id", q.id);

          return {
            ...q,
            country_count: count || 0,
          };
        })
      );

      setQuestions(questionsWithCounts);
    } catch (error) {
      console.error("Error fetching questions:", error);
      alert("Sorular yüklenirken hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Bu soruyu silmek istediğinizden emin misiniz?")) return;

    try {
      // Delete related answers first
      await supabase.from("questions").delete().eq("parent_id", id);
      
      // Delete country relations
      await supabase.from("question_to_countries").delete().eq("question_id", id);
      
      // Delete the question
      const { error } = await supabase.from("questions").delete().eq("id", id);

      if (error) throw error;

      alert("Soru başarıyla silindi");
      fetchQuestions();
    } catch (error) {
      console.error("Error deleting question:", error);
      alert("Soru silinirken hata oluştu");
    }
  };

  const toggleStatus = async (id: number, currentStatus: number) => {
    try {
      const { error } = await supabase
        .from("questions")
        .update({ status: currentStatus === 1 ? 0 : 1 })
        .eq("id", id);

      if (error) throw error;

      fetchQuestions();
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Durum güncellenirken hata oluştu");
    }
  };

  const filteredQuestions = questions.filter((q) => {
    const matchesSearch = (q.title || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && q.status === 1) ||
      (statusFilter === "inactive" && q.status === 0);
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Sorular</h1>
          <p className="text-sm text-slate-600">
            Ülke detay sayfalarında gösterilen sık sorulan sorular
          </p>
        </div>
        <Link
          href="/admin/sorular/ekle"
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          Yeni Soru Ekle
        </Link>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Soru ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-slate-200 py-2 pl-10 pr-4 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="all">Tüm Durumlar</option>
              <option value="active">Aktif</option>
              <option value="inactive">Pasif</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="card">
          <div className="text-sm text-slate-600">Toplam Soru</div>
          <div className="text-2xl font-bold text-slate-900">{questions.length}</div>
        </div>
        <div className="card">
          <div className="text-sm text-slate-600">Aktif Sorular</div>
          <div className="text-2xl font-bold text-green-600">
            {questions.filter((q) => q.status === 1).length}
          </div>
        </div>
        <div className="card">
          <div className="text-sm text-slate-600">Pasif Sorular</div>
          <div className="text-2xl font-bold text-slate-400">
            {questions.filter((q) => q.status === 0).length}
          </div>
        </div>
      </div>

      {/* Questions List */}
      <div className="card">
        {loading ? (
          <div className="py-12 text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-primary" />
            <p className="mt-4 text-sm text-slate-600">Sorular yükleniyor...</p>
          </div>
        ) : filteredQuestions.length === 0 ? (
          <div className="py-12 text-center">
            <MessageSquare className="mx-auto h-12 w-12 text-slate-300" />
            <p className="mt-4 text-sm text-slate-600">
              {searchQuery || statusFilter !== "all"
                ? "Arama kriterlerine uygun soru bulunamadı"
                : "Henüz soru eklenmemiş"}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">
                    SORU
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-slate-600">
                    ÜLKE SAYISI
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
                {filteredQuestions.map((question) => (
                  <tr key={question.id} className="hover:bg-slate-50">
                    <td className="px-4 py-4">
                      <div className="font-medium text-slate-900">{question.title}</div>
                      <div className="mt-1 text-xs text-slate-500">ID: {question.id}</div>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700">
                        {question.country_count} ülke
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <button
                        onClick={() => toggleStatus(question.id, question.status)}
                        className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${
                          question.status === 1
                            ? "bg-green-100 text-green-700 hover:bg-green-200"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        }`}
                      >
                        {question.status === 1 ? "Aktif" : "Pasif"}
                      </button>
                    </td>
                    <td className="px-4 py-4 text-center text-sm text-slate-600">
                      {new Date(question.created_at).toLocaleDateString("tr-TR")}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/sorular/${question.id}/duzenle`}
                          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 hover:text-primary"
                          title="Düzenle"
                        >
                          <Edit className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(question.id)}
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
    </div>
  );
}
