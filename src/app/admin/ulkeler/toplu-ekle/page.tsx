"use client";

import { useState, useEffect } from "react";
import { Globe2, Sparkles, CheckCircle2, XCircle, Loader2, Download, Upload } from "lucide-react";

interface Country {
  name: string;
  code: string;
  region: string;
  visaRequired: boolean;
  selected: boolean;
}

interface GeneratedCountry extends Country {
  status: 'pending' | 'generating' | 'success' | 'error';
  data?: any;
  error?: string;
}

export default function BulkCountryImportPage() {
  const [step, setStep] = useState<'prepare' | 'select' | 'generate' | 'complete'>('prepare');
  const [loading, setLoading] = useState(false);
  const [allCountries, setAllCountries] = useState<Country[]>([]);
  const [missingCountries, setMissingCountries] = useState<Country[]>([]);
  const [selectedCountries, setSelectedCountries] = useState<GeneratedCountry[]>([]);
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [aiProvider, setAiProvider] = useState<'openai' | 'gemini'>('openai');

  // Fetch missing countries
  const fetchMissingCountries = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/countries/missing');
      const data = await response.json();
      
      if (data.success) {
        setAllCountries(data.allCountries);
        setMissingCountries(data.missingCountries.map((c: Country) => ({ ...c, selected: false })));
        setStep('select');
      }
    } catch (error) {
      console.error('Failed to fetch missing countries:', error);
    } finally {
      setLoading(false);
    }
  };

  // Toggle country selection
  const toggleCountry = (code: string) => {
    setMissingCountries(prev =>
      prev.map(c => c.code === code ? { ...c, selected: !c.selected } : c)
    );
  };

  // Select all/none
  const selectAll = () => {
    setMissingCountries(prev => prev.map(c => ({ ...c, selected: true })));
  };

  const selectNone = () => {
    setMissingCountries(prev => prev.map(c => ({ ...c, selected: false })));
  };

  // Start generation
  const startGeneration = async () => {
    const selected = missingCountries.filter(c => c.selected);
    if (selected.length === 0) {
      alert('Lütfen en az bir ülke seçin');
      return;
    }

    setSelectedCountries(selected.map(c => ({ ...c, status: 'pending' })));
    setStep('generate');
    setGenerating(true);
    setProgress({ current: 0, total: selected.length });

    // Process countries sequentially (one at a time to avoid rate limits)
    for (let i = 0; i < selected.length; i++) {
      const country = selected[i];
      
      try {
        // Update status to generating
        setSelectedCountries(prev => 
          prev.map((c, idx) => 
            idx === i ? { ...c, status: 'generating' } : c
          )
        );

        // Generate country data with retry logic
        let retries = 3;
        let success = false;
        let lastError = null;

        while (retries > 0 && !success) {
          try {
            const response = await fetch('/api/admin/countries/generate', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ country, aiProvider }),
            });

            const data = await response.json();

            if (data.success) {
              setSelectedCountries(prev =>
                prev.map((c, idx) =>
                  idx === i ? { ...c, status: 'success', data: data.country } : c
                )
              );
              success = true;
            } else if (response.status === 429) {
              // Rate limit - wait and retry
              retries--;
              if (retries > 0) {
                console.log(`Rate limit hit, waiting 60 seconds before retry...`);
                await new Promise(resolve => setTimeout(resolve, 60000)); // Wait 60 seconds
                continue;
              }
              throw new Error('Rate limit exceeded. Please try again later.');
            } else {
              throw new Error(data.error || 'Generation failed');
            }
          } catch (fetchError: any) {
            lastError = fetchError;
            retries--;
            if (retries > 0) {
              await new Promise(resolve => setTimeout(resolve, 3000)); // Wait 3 seconds
            }
          }
        }

        if (!success) {
          throw lastError || new Error('Failed after retries');
        }

        // Wait 10 seconds between countries to avoid rate limits
        if (i < selected.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 10000));
        }
      } catch (error: any) {
        setSelectedCountries(prev =>
          prev.map((c, idx) =>
            idx === i ? { ...c, status: 'error', error: error.message } : c
          )
        );
      } finally {
        setProgress(prev => ({ ...prev, current: prev.current + 1 }));
      }
    }

    setGenerating(false);
    setStep('complete');
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Globe2 className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold text-slate-900">Toplu Ülke Ekleme</h1>
          </div>
          <p className="text-slate-600">
            AI desteğiyle eksik ülkeleri otomatik olarak ekleyin. Vize bilgileri, görseller ve tüm detaylar otomatik oluşturulur.
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8 flex items-center justify-center gap-4">
          {[
            { key: 'prepare', label: 'Hazırlık', icon: Download },
            { key: 'select', label: 'Seçim', icon: CheckCircle2 },
            { key: 'generate', label: 'Oluştur', icon: Sparkles },
            { key: 'complete', label: 'Tamamla', icon: Upload },
          ].map((s, idx) => (
            <div key={s.key} className="flex items-center gap-2">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full ${
                  step === s.key
                    ? 'bg-primary text-white'
                    : ['select', 'generate', 'complete'].includes(step) && idx < ['prepare', 'select', 'generate', 'complete'].indexOf(step)
                    ? 'bg-green-500 text-white'
                    : 'bg-slate-200 text-slate-400'
                }`}
              >
                <s.icon className="h-5 w-5" />
              </div>
              <span className="text-sm font-medium text-slate-700">{s.label}</span>
              {idx < 3 && <div className="h-0.5 w-8 bg-slate-200" />}
            </div>
          ))}
        </div>

        {/* Step 1: Prepare */}
        {step === 'prepare' && (
          <div className="rounded-lg bg-white p-8 shadow-sm">
            {/* Warning Banner */}
            <div className="mb-6 rounded-lg border-l-4 border-yellow-500 bg-yellow-50 p-4">
              <div className="flex items-start gap-3">
                <div className="text-yellow-600">⚠️</div>
                <div className="flex-1">
                  <h3 className="font-semibold text-yellow-900">Önemli Bilgilendirme</h3>
                  <ul className="mt-2 space-y-1 text-sm text-yellow-800">
                    <li>• Her ülke için AI ile veri üretimi yapılacaktır (yaklaşık 30 saniye/ülke)</li>
                    <li>• Ülkeler arası 10 saniye bekleme süresi vardır</li>
                    <li>• 10 ülke eklemek yaklaşık 6-7 dakika sürer</li>
                    <li>• API quota limitleri nedeniyle günde maksimum 50-100 ülke eklenebilir</li>
                    <li>• Quota dolduğunda 24 saat beklemeniz gerekebilir</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="text-center">
              <Globe2 className="mx-auto mb-4 h-16 w-16 text-primary" />
              <h2 className="mb-2 text-2xl font-bold text-slate-900">Eksik Ülkeleri Bul</h2>
              <p className="mb-6 text-slate-600">
                Sistemde kayıtlı ülkeler kontrol edilecek ve eksik olanlar listelenecek.
              </p>
              <button
                onClick={fetchMissingCountries}
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 font-semibold text-white transition-colors hover:bg-primary/90 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Kontrol Ediliyor...
                  </>
                ) : (
                  <>
                    <Download className="h-5 w-5" />
                    Eksik Ülkeleri Bul
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Select */}
        {step === 'select' && (
          <div className="rounded-lg bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Eklenecek Ülkeleri Seçin
                </h2>
                <p className="text-sm text-slate-600">
                  {missingCountries.length} eksik ülke bulundu. Eklemek istediklerinizi seçin.
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={selectAll}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Tümünü Seç
                </button>
                <button
                  onClick={selectNone}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Hiçbirini Seçme
                </button>
              </div>
            </div>

            {/* AI Provider Selection */}
            <div className="mb-6 rounded-lg border-2 border-slate-200 bg-slate-50 p-4">
              <h3 className="mb-3 text-sm font-semibold text-slate-900">AI Model Seçimi</h3>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setAiProvider('openai')}
                  className={`flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-all ${
                    aiProvider === 'openai'
                      ? 'border-green-500 bg-green-50'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="text-2xl">🤖</div>
                  <div className="text-center">
                    <div className="font-semibold text-slate-900">OpenAI GPT-4o Mini</div>
                    <div className="text-xs text-slate-600">Hızlı ve güvenilir</div>
                    <div className="mt-1 text-xs text-green-600">✅ Yüksek quota</div>
                  </div>
                </button>
                <button
                  onClick={() => setAiProvider('gemini')}
                  className={`flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-all ${
                    aiProvider === 'gemini'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="text-2xl">✨</div>
                  <div className="text-center">
                    <div className="font-semibold text-slate-900">Google Gemini 1.5 Flash</div>
                    <div className="text-xs text-slate-600">Ücretsiz ve hızlı</div>
                    <div className="mt-1 text-xs text-yellow-600">⚠️ Günlük limit var</div>
                  </div>
                </button>
              </div>
            </div>

            {/* Country Grid */}
            <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
              {missingCountries.map((country) => (
                <button
                  key={country.code}
                  onClick={() => toggleCountry(country.code)}
                  className={`rounded-lg border-2 p-4 text-left transition-all ${
                    country.selected
                      ? 'border-primary bg-primary/5'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-2xl">{country.code}</span>
                    {country.selected && (
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                    )}
                  </div>
                  <div className="text-sm font-semibold text-slate-900">{country.name}</div>
                  <div className="text-xs text-slate-500">{country.region}</div>
                  <div className="mt-2">
                    <span
                      className={`inline-block rounded px-2 py-0.5 text-xs font-medium ${
                        country.visaRequired
                          ? 'bg-red-100 text-red-700'
                          : 'bg-green-100 text-green-700'
                      }`}
                    >
                      {country.visaRequired ? 'Vize Gerekli' : 'Vizesiz'}
                    </span>
                  </div>
                </button>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between">
              <button
                onClick={() => setStep('prepare')}
                className="rounded-lg border border-slate-300 px-6 py-3 font-semibold text-slate-700 hover:bg-slate-50"
              >
                Geri
              </button>
              <button
                onClick={startGeneration}
                disabled={!missingCountries.some(c => c.selected)}
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 font-semibold text-white transition-colors hover:bg-primary/90 disabled:opacity-50"
              >
                <Sparkles className="h-5 w-5" />
                Seçilenleri Oluştur ({missingCountries.filter(c => c.selected).length})
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Generate */}
        {step === 'generate' && (
          <div className="rounded-lg bg-white p-6 shadow-sm">
            <div className="mb-6">
              <h2 className="mb-2 text-xl font-bold text-slate-900">Ülkeler Oluşturuluyor</h2>
              <p className="text-sm text-slate-600">
                AI ile vize bilgileri, görseller ve detaylar otomatik oluşturuluyor...
              </p>
            </div>

            {/* Progress Bar */}
            <div className="mb-6">
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="font-medium text-slate-700">İlerleme</span>
                <span className="text-slate-600">
                  {progress.current} / {progress.total}
                </span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-slate-200">
                <div
                  className="h-full bg-primary transition-all duration-500"
                  style={{ width: `${(progress.current / progress.total) * 100}%` }}
                />
              </div>
            </div>

            {/* Country List */}
            <div className="space-y-2">
              {selectedCountries.map((country, idx) => (
                <div
                  key={country.code}
                  className="flex items-center justify-between rounded-lg border border-slate-200 p-4"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{country.code}</span>
                    <div>
                      <div className="font-semibold text-slate-900">{country.name}</div>
                      <div className="text-xs text-slate-500">{country.region}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {country.status === 'pending' && (
                      <span className="text-sm text-slate-400">Bekliyor...</span>
                    )}
                    {country.status === 'generating' && (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin text-primary" />
                        <span className="text-sm text-primary">Oluşturuluyor...</span>
                      </>
                    )}
                    {country.status === 'success' && (
                      <>
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                        <span className="text-sm text-green-600">Tamamlandı</span>
                      </>
                    )}
                    {country.status === 'error' && (
                      <>
                        <XCircle className="h-5 w-5 text-red-500" />
                        <span className="text-sm text-red-600">Hata</span>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 4: Complete */}
        {step === 'complete' && (
          <div className="rounded-lg bg-white p-8 shadow-sm">
            <div className="text-center">
              <CheckCircle2 className="mx-auto mb-4 h-16 w-16 text-green-500" />
              <h2 className="mb-2 text-2xl font-bold text-slate-900">Tamamlandı!</h2>
              <p className="mb-6 text-slate-600">
                {selectedCountries.filter(c => c.status === 'success').length} ülke başarıyla eklendi.
                {selectedCountries.filter(c => c.status === 'error').length > 0 && (
                  <span className="block text-red-600">
                    {selectedCountries.filter(c => c.status === 'error').length} ülke eklenirken hata oluştu.
                  </span>
                )}
              </p>
              <div className="flex justify-center gap-4">
                <button
                  onClick={() => window.location.href = '/admin/ulkeler'}
                  className="rounded-lg bg-primary px-6 py-3 font-semibold text-white hover:bg-primary/90"
                >
                  Ülkeler Listesine Git
                </button>
                <button
                  onClick={() => {
                    setStep('prepare');
                    setMissingCountries([]);
                    setSelectedCountries([]);
                  }}
                  className="rounded-lg border border-slate-300 px-6 py-3 font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Yeni Ekleme Yap
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
