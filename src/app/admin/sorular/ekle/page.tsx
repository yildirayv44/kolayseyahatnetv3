"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Plus, X } from "lucide-react";

interface Country {
  id: number;
  name: string;
}

interface Answer {
  id: string;
  title: string;
  contents: string;
}

export default function SoruEklePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [countries, setCountries] = useState<Country[]>([]);
  const [selectedCountries, setSelectedCountries] = useState<number[]>([]);
  
  const [formData, setFormData] = useState({
    title: "",
    contents: "",
    status: 1,
  });

  const [answers, setAnswers] = useState<Answer[]>([]);

  useEffect(() => {
    fetchCountries();
  }, []);

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

  const addAnswer = () => {
    setAnswers([
      ...answers,
      {
        id: Date.now().toString(),
        title: "",
        contents: "",
      },
    ]);
  };

  const removeAnswer = (id: string) => {
    setAnswers(answers.filter((a) => a.id !== id));
  };

  const updateAnswer = (id: string, field: "title" | "contents", value: string) => {
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
      setLoading(true);

      // Insert parent question
      const { data: question, error: questionError } = await supabase
        .from("questions")
        .insert({
          title: formData.title,
          contents: formData.contents,
          parent_id: 0,
          status: formData.status,
          user_id: 1, // TODO: Get from auth
          views: 0,
        })
        .select()
        .single();

      if (questionError) throw questionError;

      // Insert answers
      if (answers.length > 0) {
        const answersData = answers
          .filter((a) => a.title.trim() || a.contents.trim())
          .map((a) => ({
            title: a.title,
            contents: a.contents,
            parent_id: question.id,
            status: 1,
            user_id: 1,
            views: 0,
          }));

        if (answersData.length > 0) {
          const { error: answersError } = await supabase
            .from("questions")
            .insert(answersData);

          if (answersError) throw answersError;
        }
      }

      // Insert country relations
      const countryRelations = selectedCountries.map((countryId) => ({
        question_id: question.id,
        country_id: countryId,
      }));

      const { error: relationsError } = await supabase
        .from("question_to_countries")
        .insert(countryRelations);

      if (relationsError) throw relationsError;

      alert("Soru başarıyla eklendi");
      router.push("/admin/sorular");
    } catch (error) {
      console.error("Error creating question:", error);
      alert("Soru eklenirken hata oluştu");
    } finally {
      setLoading(false);
    }
  };

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
          <h1 className="text-2xl font-bold text-slate-900">Yeni Soru Ekle</h1>
          <p className="text-sm text-slate-600">
            Ülke detay sayfalarında gösterilecek yeni soru ekleyin
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
              Cevaplar (Opsiyonel)
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
              Henüz cevap eklenmedi. Cevap eklemek için yukarıdaki butona tıklayın.
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
                    </h3>
                    <button
                      type="button"
                      onClick={() => removeAnswer(answer.id)}
                      className="rounded-lg p-1 text-slate-400 hover:bg-red-50 hover:text-red-600"
                    >
                      <X className="h-4 w-4" />
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
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-2 font-semibold text-white hover:bg-primary/90 disabled:opacity-50"
          >
            {loading ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Kaydediliyor...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Kaydet
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
