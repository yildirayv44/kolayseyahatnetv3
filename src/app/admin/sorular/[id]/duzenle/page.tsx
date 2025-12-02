"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Plus, X, Trash2 } from "lucide-react";

interface Country {
  id: number;
  name: string;
}

interface Answer {
  id: number | string;
  title: string;
  contents: string;
  isNew?: boolean;
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function SoruDuzenlePage({ params }: PageProps) {
  const router = useRouter();
  const [questionId, setQuestionId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [countries, setCountries] = useState<Country[]>([]);
  const [selectedCountries, setSelectedCountries] = useState<number[]>([]);
  
  const [formData, setFormData] = useState({
    title: "",
    contents: "",
    status: 1,
  });

  const [answers, setAnswers] = useState<Answer[]>([]);
  const [deletedAnswers, setDeletedAnswers] = useState<number[]>([]);

  useEffect(() => {
    params.then((p) => {
      setQuestionId(p.id);
      fetchQuestion(p.id);
      fetchCountries();
    });
  }, [params]);

  const fetchCountries = async () => {
    try {
      const { data, error } = await supabase
        .from("countries")
        .select("id, name")
        .eq("status", 1)
        .order("name");

      if (error) throw error;
      setCountries(data || []);
    } catch (error) {
      console.error("Error fetching countries:", error);
    }
  };

  const fetchQuestion = async (id: string) => {
    try {
      setLoading(true);

      // Fetch question
      const { data: question, error: questionError } = await supabase
        .from("questions")
        .select("*")
        .eq("id", id)
        .single();

      if (questionError) throw questionError;

      setFormData({
        title: question.title || "",
        contents: question.contents || "",
        status: question.status || 1,
      });

      // Fetch answers
      const { data: answersData, error: answersError } = await supabase
        .from("questions")
        .select("*")
        .eq("parent_id", id)
        .order("id");

      if (answersError) throw answersError;
      setAnswers(answersData || []);

      // Fetch country relations
      const { data: relations, error: relationsError } = await supabase
        .from("question_to_countries")
        .select("country_id")
        .eq("question_id", id);

      if (relationsError) throw relationsError;
      setSelectedCountries(relations?.map((r) => r.country_id) || []);
    } catch (error) {
      console.error("Error fetching question:", error);
      alert("Soru yüklenirken hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  const addAnswer = () => {
    setAnswers([
      ...answers,
      {
        id: `new-${Date.now()}`,
        title: "",
        contents: "",
        isNew: true,
      },
    ]);
  };

  const removeAnswer = (answer: Answer) => {
    if (typeof answer.id === "number") {
      setDeletedAnswers([...deletedAnswers, answer.id]);
    }
    setAnswers(answers.filter((a) => a.id !== answer.id));
  };

  const updateAnswer = (id: number | string, field: "title" | "contents", value: string) => {
    setAnswers(
      answers.map((a) => (a.id === id ? { ...a, [field]: value } : a))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      alert("Lütfen soru başlığını girin");
      return;
    }

    if (selectedCountries.length === 0) {
      alert("Lütfen en az bir ülke seçin");
      return;
    }

    try {
      setSaving(true);

      // Update question
      const { error: questionError } = await supabase
        .from("questions")
        .update({
          title: formData.title,
          contents: formData.contents,
          status: formData.status,
        })
        .eq("id", questionId);

      if (questionError) throw questionError;

      // Delete removed answers
      if (deletedAnswers.length > 0) {
        const { error: deleteError } = await supabase
          .from("questions")
          .delete()
          .in("id", deletedAnswers);

        if (deleteError) throw deleteError;
      }

      // Update/Insert answers
      for (const answer of answers) {
        if (!answer.title.trim() && !answer.contents.trim()) continue;

        if (answer.isNew) {
          // Insert new answer
          const { error } = await supabase.from("questions").insert({
            title: answer.title,
            contents: answer.contents,
            parent_id: Number(questionId),
            status: 1,
            user_id: 1,
            views: 0,
          });

          if (error) throw error;
        } else {
          // Update existing answer
          const { error } = await supabase
            .from("questions")
            .update({
              title: answer.title,
              contents: answer.contents,
            })
            .eq("id", answer.id);

          if (error) throw error;
        }
      }

      // Update country relations
      // Delete old relations
      await supabase
        .from("question_to_countries")
        .delete()
        .eq("question_id", questionId);

      // Insert new relations
      const countryRelations = selectedCountries.map((countryId) => ({
        question_id: Number(questionId),
        country_id: countryId,
      }));

      const { error: relationsError } = await supabase
        .from("question_to_countries")
        .insert(countryRelations);

      if (relationsError) throw relationsError;

      alert("Soru başarıyla güncellendi");
      router.push("/admin/sorular");
    } catch (error) {
      console.error("Error updating question:", error);
      alert("Soru güncellenirken hata oluştu");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-primary" />
          <p className="mt-4 text-slate-600">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin/sorular"
          className="rounded-lg p-2 hover:bg-slate-100"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Soru Düzenle</h1>
          <p className="text-sm text-slate-600">
            Soru bilgilerini düzenleyin
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Main Info */}
        <div className="card space-y-4">
          <h2 className="text-lg font-semibold text-slate-900">Soru Bilgileri</h2>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-900">
              Soru Başlığı <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              placeholder="Örn: Amerika vizesi için hangi belgeler gerekli?"
              className="w-full rounded-lg border border-slate-200 px-4 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-900">
              Soru İçeriği (Opsiyonel)
            </label>
            <textarea
              value={formData.contents}
              onChange={(e) =>
                setFormData({ ...formData, contents: e.target.value })
              }
              rows={6}
              placeholder="Soru ile ilgili ek açıklama..."
              className="w-full rounded-lg border border-slate-200 px-4 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-900">
              Durum
            </label>
            <select
              value={formData.status}
              onChange={(e) =>
                setFormData({ ...formData, status: Number(e.target.value) })
              }
              className="w-full rounded-lg border border-slate-200 px-4 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value={1}>Aktif</option>
              <option value={0}>Pasif</option>
            </select>
          </div>
        </div>

        {/* Answers */}
        <div className="card space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">
              Cevaplar
            </h2>
            <button
              type="button"
              onClick={addAnswer}
              className="inline-flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200"
            >
              <Plus className="h-4 w-4" />
              Cevap Ekle
            </button>
          </div>

          {answers.length === 0 ? (
            <p className="text-sm text-slate-600">
              Henüz cevap yok. Cevap eklemek için yukarıdaki butona tıklayın.
            </p>
          ) : (
            <div className="space-y-4">
              {answers.map((answer, index) => (
                <div
                  key={answer.id}
                  className="space-y-3 rounded-lg border border-slate-200 p-4"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-slate-900">
                      Cevap {index + 1}
                      {answer.isNew && (
                        <span className="ml-2 text-xs text-green-600">(Yeni)</span>
                      )}
                    </h3>
                    <button
                      type="button"
                      onClick={() => removeAnswer(answer)}
                      className="rounded-lg p-1 text-slate-400 hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-900">
                      Cevap Başlığı
                    </label>
                    <input
                      type="text"
                      value={answer.title}
                      onChange={(e) =>
                        updateAnswer(answer.id, "title", e.target.value)
                      }
                      placeholder="Cevap başlığı (opsiyonel)"
                      className="w-full rounded-lg border border-slate-200 px-4 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-900">
                      Cevap İçeriği
                    </label>
                    <textarea
                      value={answer.contents}
                      onChange={(e) =>
                        updateAnswer(answer.id, "contents", e.target.value)
                      }
                      rows={6}
                      placeholder="Cevap metni..."
                      className="w-full rounded-lg border border-slate-200 px-4 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Countries */}
        <div className="card space-y-4">
          <h2 className="text-lg font-semibold text-slate-900">
            Ülkeler <span className="text-red-500">*</span>
          </h2>
          <p className="text-sm text-slate-600">
            Bu sorunun hangi ülkelerde gösterileceğini seçin
          </p>

          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {countries.map((country) => (
              <label
                key={country.id}
                className="flex items-center gap-2 rounded-lg border border-slate-200 p-3 hover:bg-slate-50"
              >
                <input
                  type="checkbox"
                  checked={selectedCountries.includes(country.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedCountries([...selectedCountries, country.id]);
                    } else {
                      setSelectedCountries(
                        selectedCountries.filter((id) => id !== country.id)
                      );
                    }
                  }}
                  className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-2 focus:ring-primary/20"
                />
                <span className="text-sm text-slate-900">{country.name}</span>
              </label>
            ))}
          </div>

          {selectedCountries.length > 0 && (
            <p className="text-sm text-slate-600">
              {selectedCountries.length} ülke seçildi
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3">
          <Link
            href="/admin/sorular"
            className="rounded-lg border border-slate-200 px-6 py-2 font-semibold text-slate-700 hover:bg-slate-50"
          >
            İptal
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-2 font-semibold text-white hover:bg-primary/90 disabled:opacity-50"
          >
            {saving ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Kaydediliyor...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Güncelle
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
