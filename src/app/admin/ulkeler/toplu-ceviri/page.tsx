"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Languages, Check, X, Loader2, RefreshCw } from "lucide-react";

interface Country {
  id: number;
  name: string;
  slug: string;
  title_en: string | null;
  description_en: string | null;
  contents_en: string | null;
  travel_tips_en: string[] | null;
  application_steps_en: string[] | null;
  important_notes_en: string[] | null;
  popular_cities_en: string[] | null;
  required_documents_en: string[] | null;
  best_time_to_visit_en: string | null;
  health_requirements_en: string | null;
  customs_regulations_en: string | null;
}

type TranslationField = 
  | 'title_en' 
  | 'description_en' 
  | 'contents_en' 
  | 'travel_tips_en' 
  | 'application_steps_en' 
  | 'important_notes_en' 
  | 'popular_cities_en' 
  | 'required_documents_en'
  | 'best_time_to_visit_en'
  | 'health_requirements_en'
  | 'customs_regulations_en';

const TRANSLATION_FIELDS: { key: TranslationField; label: string }[] = [
  { key: 'title_en', label: 'Başlık' },
  { key: 'description_en', label: 'Açıklama' },
  { key: 'contents_en', label: 'İçerik' },
  { key: 'travel_tips_en', label: 'Seyahat İpuçları' },
  { key: 'application_steps_en', label: 'Başvuru Adımları' },
  { key: 'important_notes_en', label: 'Önemli Notlar' },
  { key: 'popular_cities_en', label: 'Popüler Şehirler' },
  { key: 'required_documents_en', label: 'Gerekli Belgeler' },
  { key: 'best_time_to_visit_en', label: 'En İyi Ziyaret Zamanı' },
  { key: 'health_requirements_en', label: 'Sağlık Gereksinimleri' },
  { key: 'customs_regulations_en', label: 'Gümrük Düzenlemeleri' },
];

export default function BulkTranslationPage() {
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCountries, setSelectedCountries] = useState<number[]>([]);
  const [translating, setTranslating] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0, currentCountry: '' });
  const [results, setResults] = useState<{ id: number; name: string; success: boolean; fields: string[] }[]>([]);
  const [filter, setFilter] = useState<'all' | 'missing'>('missing');

  useEffect(() => {
    fetchCountries();
  }, []);

  const fetchCountries = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/countries/list-for-translation');
      const data = await response.json();
      if (data.success) {
        setCountries(data.countries);
      }
    } catch (error) {
      console.error('Error fetching countries:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMissingFields = (country: Country): TranslationField[] => {
    const missing: TranslationField[] = [];
    TRANSLATION_FIELDS.forEach(({ key }) => {
      const value = country[key];
      if (!value || (Array.isArray(value) && value.length === 0)) {
        missing.push(key);
      }
    });
    return missing;
  };

  const getCompletionPercentage = (country: Country): number => {
    const missing = getMissingFields(country);
    return Math.round(((TRANSLATION_FIELDS.length - missing.length) / TRANSLATION_FIELDS.length) * 100);
  };

  const filteredCountries = filter === 'missing' 
    ? countries.filter(c => getMissingFields(c).length > 0)
    : countries;

  const toggleSelectAll = () => {
    if (selectedCountries.length === filteredCountries.length) {
      setSelectedCountries([]);
    } else {
      setSelectedCountries(filteredCountries.map(c => c.id));
    }
  };

  const toggleCountry = (id: number) => {
    setSelectedCountries(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const translateSelected = async () => {
    if (selectedCountries.length === 0) {
      alert('Lütfen en az bir ülke seçin');
      return;
    }

    setTranslating(true);
    setResults([]);
    setProgress({ current: 0, total: selectedCountries.length, currentCountry: '' });

    const newResults: typeof results = [];

    for (let i = 0; i < selectedCountries.length; i++) {
      const countryId = selectedCountries[i];
      const country = countries.find(c => c.id === countryId);
      if (!country) continue;

      setProgress({ current: i + 1, total: selectedCountries.length, currentCountry: country.name });

      try {
        const response = await fetch(`/api/admin/countries/${countryId}/translate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        });

        const data = await response.json();
        
        newResults.push({
          id: countryId,
          name: country.name,
          success: data.success,
          fields: data.translatedFields || [],
        });
      } catch (error) {
        newResults.push({
          id: countryId,
          name: country.name,
          success: false,
          fields: [],
        });
      }
    }

    setResults(newResults);
    setTranslating(false);
    setSelectedCountries([]);
    fetchCountries(); // Refresh the list
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/ulkeler"
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Geri
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Languages className="h-6 w-6 text-primary" />
              Toplu İngilizce Çeviri
            </h1>
            <p className="text-slate-600">
              Eksik İngilizce çevirileri olan ülkeleri seçip toplu çeviri yapın
            </p>
          </div>
        </div>
        <button
          onClick={fetchCountries}
          className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-slate-900 border rounded-lg"
        >
          <RefreshCw className="h-4 w-4" />
          Yenile
        </button>
      </div>

      {/* Filter & Actions */}
      <div className="flex items-center justify-between bg-white p-4 rounded-lg border">
        <div className="flex items-center gap-4">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as 'all' | 'missing')}
            className="px-3 py-2 border rounded-lg"
          >
            <option value="missing">Eksik Çevirisi Olanlar</option>
            <option value="all">Tüm Ülkeler</option>
          </select>
          <span className="text-slate-600">
            {filteredCountries.length} ülke listeleniyor
          </span>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={toggleSelectAll}
            className="px-4 py-2 text-slate-600 hover:text-slate-900 border rounded-lg"
          >
            {selectedCountries.length === filteredCountries.length ? 'Seçimi Kaldır' : 'Tümünü Seç'}
          </button>
          <button
            onClick={translateSelected}
            disabled={translating || selectedCountries.length === 0}
            className="flex items-center gap-2 px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50"
          >
            {translating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Çevriliyor... ({progress.current}/{progress.total})
              </>
            ) : (
              <>
                <Languages className="h-4 w-4" />
                Seçilenleri Çevir ({selectedCountries.length})
              </>
            )}
          </button>
        </div>
      </div>

      {/* Progress */}
      {translating && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-3 mb-2">
            <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
            <span className="font-medium text-blue-900">
              Çevriliyor: {progress.currentCountry}
            </span>
          </div>
          <div className="w-full bg-blue-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all"
              style={{ width: `${(progress.current / progress.total) * 100}%` }}
            />
          </div>
          <p className="text-sm text-blue-700 mt-2">
            {progress.current} / {progress.total} ülke tamamlandı
          </p>
        </div>
      )}

      {/* Results */}
      {results.length > 0 && !translating && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 className="font-medium text-green-900 mb-3">Çeviri Sonuçları</h3>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {results.map((result) => (
              <div key={result.id} className="flex items-center gap-2 text-sm">
                {result.success ? (
                  <Check className="h-4 w-4 text-green-600" />
                ) : (
                  <X className="h-4 w-4 text-red-600" />
                )}
                <span className={result.success ? 'text-green-800' : 'text-red-800'}>
                  {result.name}
                </span>
                {result.fields.length > 0 && (
                  <span className="text-green-600 text-xs">
                    ({result.fields.length} alan çevrildi)
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Countries List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="bg-white rounded-lg border overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedCountries.length === filteredCountries.length && filteredCountries.length > 0}
                    onChange={toggleSelectAll}
                    className="rounded"
                  />
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">Ülke</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">Çeviri Durumu</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">Eksik Alanlar</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredCountries.map((country) => {
                const missingFields = getMissingFields(country);
                const completion = getCompletionPercentage(country);
                
                return (
                  <tr key={country.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedCountries.includes(country.id)}
                        onChange={() => toggleCountry(country.id)}
                        className="rounded"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-slate-900">{country.name}</p>
                        <p className="text-sm text-slate-500">{country.slug}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-slate-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              completion === 100 ? 'bg-green-500' : 
                              completion >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${completion}%` }}
                          />
                        </div>
                        <span className="text-sm text-slate-600">%{completion}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {missingFields.length === 0 ? (
                        <span className="text-green-600 text-sm flex items-center gap-1">
                          <Check className="h-4 w-4" />
                          Tamamlandı
                        </span>
                      ) : (
                        <div className="flex flex-wrap gap-1">
                          {missingFields.slice(0, 3).map((field) => (
                            <span 
                              key={field}
                              className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded"
                            >
                              {TRANSLATION_FIELDS.find(f => f.key === field)?.label}
                            </span>
                          ))}
                          {missingFields.length > 3 && (
                            <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs rounded">
                              +{missingFields.length - 3} daha
                            </span>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/ulkeler/${country.id}/duzenle`}
                        className="text-primary hover:underline text-sm"
                      >
                        Düzenle
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          
          {filteredCountries.length === 0 && (
            <div className="text-center py-12 text-slate-500">
              {filter === 'missing' 
                ? 'Tüm ülkelerin çevirileri tamamlanmış!' 
                : 'Henüz ülke bulunmuyor'}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
