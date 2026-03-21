"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { 
  Download, 
  RefreshCw, 
  Globe,
  Search,
  CheckCircle,
  XCircle,
  Clock
} from "lucide-react";

interface SourceCountry {
  id: number;
  name: string;
  country_code: string;
  is_source_country: boolean;
  passport_rank: number | null;
  flag_emoji: string | null;
  lastScraped?: string | null;
  lastScrapedCount?: number | null;
}

export default function VisaMatrixPage() {
  const [sourceCountries, setSourceCountries] = useState<SourceCountry[]>([]);
  const [selectedSource, setSelectedSource] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [scraping, setScraping] = useState(false);
  const [batchScraping, setBatchScraping] = useState(false);
  const [scrapingStatus, setScrapingStatus] = useState<string>('');
  const [batchProgress, setBatchProgress] = useState<string>('');
  const [stats, setStats] = useState({
    totalCountries: 0,
    sourceCountries: 0,
    visaRelations: 0,
  });

  useEffect(() => {
    fetchSourceCountries();
    fetchStats();
  }, []);

  const fetchSourceCountries = async () => {
    setLoading(true);
    try {
      // Fetch source countries with last scraping info
      const response = await fetch('/api/admin/countries/source-with-logs');
      if (!response.ok) throw new Error('Failed to fetch source countries');
      
      const sourceCountriesData = await response.json();
      
      // Also fetch non-source countries
      const { data: allCountries, error } = await supabase
        .from('countries')
        .select('id, name, country_code, is_source_country, passport_rank, flag_emoji')
        .eq('status', 1)
        .order('name', { ascending: true });

      if (error) throw error;
      
      // Merge data: use source countries with logs, add non-source countries
      const mergedData = allCountries?.map(country => {
        const sourceCountry = sourceCountriesData.find((sc: any) => sc.country_code === country.country_code);
        return sourceCountry || country;
      }) || [];
      
      setSourceCountries(mergedData);
    } catch (error: any) {
      console.error('Error fetching countries:', error);
      alert('Ülkeler yüklenirken hata oluştu: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const [countriesRes, sourceCountriesRes, visaReqsRes] = await Promise.all([
        supabase.from('countries').select('id', { count: 'exact', head: true }),
        supabase.from('countries').select('id', { count: 'exact', head: true }).eq('is_source_country', true),
        supabase.from('visa_requirements').select('id', { count: 'exact', head: true }),
      ]);

      setStats({
        totalCountries: countriesRes.count || 0,
        sourceCountries: sourceCountriesRes.count || 0,
        visaRelations: visaReqsRes.count || 0,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleToggleSourceCountry = async (countryId: number, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('countries')
        .update({ is_source_country: !currentStatus })
        .eq('id', countryId);

      if (error) throw error;

      alert('Ülke durumu güncellendi');
      fetchSourceCountries();
      fetchStats();
    } catch (error: any) {
      console.error('Error updating country:', error);
      alert('Güncelleme hatası: ' + error.message);
    }
  };

  const handleBatchScrape = async () => {
    const sourceCountriesList = sourceCountries.filter(c => c.is_source_country);
    
    if (sourceCountriesList.length === 0) {
      alert('Hiç kaynak ülke bulunamadı. Lütfen önce kaynak ülkeleri işaretleyin.');
      return;
    }

    if (!confirm(`TÜM kaynak ülkeler (${sourceCountriesList.length} ülke) için vize verilerini çekmek istediğinizden emin misiniz?\n\nBu işlem yaklaşık ${sourceCountriesList.length * 2} dakika sürebilir.\n\nÜlkeler:\n${sourceCountriesList.map(c => `• ${c.flag_emoji} ${c.name}`).join('\n')}`)) {
      return;
    }

    setBatchScraping(true);
    setBatchProgress('🚀 Batch işlem başlatılıyor...');

    try {
      const response = await fetch('/api/cron/scrape-all-countries', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_CRON_SECRET || 'dev-secret'}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.success) {
        const successMsg = `
✅ Batch İşlem Tamamlandı!

📊 Özet:
• Toplam Ülke: ${data.summary.total}
• Başarılı: ${data.summary.successful}
• Başarısız: ${data.summary.failed}

📋 Detaylar:
${data.results.map((r: any) => {
  if (r.status === 'success') {
    return `✅ ${r.country}: ${r.scraped} ülke`;
  } else {
    return `❌ ${r.country}: ${r.error}`;
  }
}).join('\n')}
        `;
        alert(successMsg);
        fetchStats();
      } else {
        throw new Error(data.error || 'Bilinmeyen hata');
      }
    } catch (error: any) {
      console.error('Batch scraping error:', error);
      alert(`❌ Batch işlem hatası:\n${error.message}`);
    } finally {
      setBatchScraping(false);
      setBatchProgress('');
    }
  };

  const handleScrape = async () => {
    if (!selectedSource) {
      alert('Lütfen bir kaynak ülke seçin');
      return;
    }

    const sourceCountryName = sourceCountries.find(c => c.country_code === selectedSource)?.name || selectedSource;

    if (!confirm(`${sourceCountryName} (${selectedSource}) için vize verilerini PassportIndex'ten çekmek istediğinizden emin misiniz?\n\nBu işlem yaklaşık 2-3 dakika sürebilir.`)) {
      return;
    }

    setScraping(true);
    setScrapingStatus('🔄 Hazırlanıyor...');

    try {
      // Step 1: Validate source country
      setScrapingStatus(`🔍 Adım 1/5: ${sourceCountryName} doğrulanıyor...`);
      await new Promise(resolve => setTimeout(resolve, 500));

      // Step 2: Connect to API
      setScrapingStatus(`🌐 Adım 2/5: PassportIndex API'ye bağlanılıyor...`);
      
      const response = await fetch('/api/admin/visa-matrix/scrape-passportindex', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sourceCountryCode: selectedSource }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      // Step 3: Process data
      setScrapingStatus(`⚙️ Adım 3/5: Vize verileri işleniyor...`);
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Bilinmeyen hata');
      }

      // Step 4: Save to database
      setScrapingStatus(`💾 Adım 4/5: Veritabanına kaydediliyor...`);
      await new Promise(resolve => setTimeout(resolve, 500));

      // Step 5: Complete
      setScrapingStatus(`✅ Adım 5/5: Tamamlandı!`);
      await new Promise(resolve => setTimeout(resolve, 500));

      // Final success message with details
      const detailsPreview = data.details && data.details.length > 0
        ? '\n\n📋 Örnek Kayıtlar:\n' + data.details.slice(0, 5).map((d: any) => 
            `• ${d.country}: ${d.status}`
          ).join('\n')
        : '';

      const successMessage = `
✅ Başarıyla Tamamlandı!

📊 Özet:
• Kaynak Ülke: ${sourceCountryName} (${selectedSource})
• Toplam Ülke: ${data.total || 0}
• Başarılı: ${data.scraped || 0}
• Atlanan: ${data.skipped || 0}
${data.errors && data.errors.length > 0 ? `• Hata: ${data.errors.length}` : ''}

${data.message || ''}${detailsPreview}

💡 Vize Durumları:
• visa-free: Vizesiz giriş
• visa-on-arrival: Varışta vize
• eta: Elektronik vize (e-Visa)
• visa-required: Önceden vize gerekli
      `.trim();

      setScrapingStatus(successMessage);
      
      // Refresh stats
      setTimeout(() => {
        fetchStats();
        fetchSourceCountries();
      }, 1000);

    } catch (error: any) {
      console.error('Scraping error:', error);
      
      const errorMessage = `
❌ Hata Oluştu!

🔴 Hata Detayı:
${error.message || 'Bilinmeyen hata'}

💡 Çözüm Önerileri:
• İnternet bağlantınızı kontrol edin
• Kaynak ülke kodunun doğru olduğundan emin olun
• Supabase bağlantısını kontrol edin
• Birkaç dakika sonra tekrar deneyin

📞 Sorun devam ederse teknik destek ile iletişime geçin.
      `.trim();

      setScrapingStatus(errorMessage);
    } finally {
      setScraping(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Vize Matrix Yönetimi</h1>
          <p className="mt-1 text-sm text-gray-500">
            Ülkeden ülkeye vize gerekliliklerini yönetin
          </p>
        </div>
        <button
          onClick={fetchSourceCountries}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm ring-1 ring-gray-300 hover:bg-gray-50 disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Yenile
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg bg-white p-4 shadow-sm ring-1 ring-gray-200">
          <div className="text-sm font-medium text-gray-500">Toplam Ülke</div>
          <div className="mt-1 text-2xl font-bold text-gray-900">{stats.totalCountries}</div>
        </div>
        <div className="rounded-lg bg-blue-50 p-4 shadow-sm ring-1 ring-blue-200">
          <div className="text-sm font-medium text-blue-700">Kaynak Ülke</div>
          <div className="mt-1 text-2xl font-bold text-blue-900">{stats.sourceCountries}</div>
        </div>
        <div className="rounded-lg bg-green-50 p-4 shadow-sm ring-1 ring-green-200">
          <div className="text-sm font-medium text-green-700">Vize İlişkisi</div>
          <div className="mt-1 text-2xl font-bold text-green-900">{stats.visaRelations}</div>
        </div>
      </div>

      {/* Scraping Section */}
      <div className="rounded-lg bg-white p-6 shadow-sm ring-1 ring-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">PassportIndex'ten Veri Çek</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Kaynak Ülke Seç
            </label>
            <select
              value={selectedSource}
              onChange={(e) => setSelectedSource(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="">Ülke seçin...</option>
              {sourceCountries
                .filter(c => c.is_source_country)
                .map(country => (
                  <option key={country.id} value={country.country_code}>
                    {country.flag_emoji} {country.name} ({country.country_code})
                  </option>
                ))}
            </select>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleScrape}
              disabled={scraping || batchScraping || !selectedSource}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary/90 disabled:opacity-50"
            >
              <Download className={`h-4 w-4 ${scraping ? 'animate-bounce' : ''}`} />
              {scraping ? 'Çekiliyor...' : 'Tek Ülke Çek'}
            </button>

            <button
              onClick={handleBatchScrape}
              disabled={scraping || batchScraping}
              className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-700 disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${batchScraping ? 'animate-spin' : ''}`} />
              {batchScraping ? 'Batch İşlem...' : 'Tüm Ülkeleri Çek'}
            </button>
          </div>

          {batchProgress && (
            <div className="rounded-lg bg-blue-50 border-2 border-blue-300 p-4">
              <div className="flex items-center gap-2 text-blue-900">
                <RefreshCw className="h-5 w-5 animate-spin" />
                <span className="font-medium">{batchProgress}</span>
              </div>
            </div>
          )}

          {scrapingStatus && (
            <div className={`rounded-lg border-2 p-6 ${
              scrapingStatus.includes('✅') 
                ? 'bg-green-50 border-green-300 text-green-900' 
                : scrapingStatus.includes('❌')
                ? 'bg-red-50 border-red-300 text-red-900'
                : scrapingStatus.includes('🔄') || scrapingStatus.includes('Adım')
                ? 'bg-blue-50 border-blue-300 text-blue-900'
                : 'bg-gray-50 border-gray-300 text-gray-900'
            }`}>
              {/* Progress indicator for active scraping */}
              {scraping && scrapingStatus.includes('Adım') && (
                <div className="mb-4">
                  <div className="flex items-center justify-between text-sm font-medium mb-2">
                    <span>İlerleme</span>
                    <span>
                      {scrapingStatus.match(/Adım (\d+)\/(\d+)/)?.[1] || 0} / {scrapingStatus.match(/Adım (\d+)\/(\d+)/)?.[2] || 5}
                    </span>
                  </div>
                  <div className="w-full bg-blue-200 rounded-full h-2.5">
                    <div 
                      className="bg-blue-600 h-2.5 rounded-full transition-all duration-500"
                      style={{ 
                        width: `${((parseInt(scrapingStatus.match(/Adım (\d+)\/(\d+)/)?.[1] || '0')) / 5) * 100}%` 
                      }}
                    />
                  </div>
                </div>
              )}
              
              {/* Status message */}
              <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
                {scrapingStatus}
              </pre>
              
              {/* Loading spinner for active scraping */}
              {scraping && (
                <div className="mt-4 flex items-center gap-2 text-sm">
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span className="font-medium">İşlem devam ediyor, lütfen bekleyin...</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Countries List */}
      <div className="rounded-lg bg-white shadow-sm ring-1 ring-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Ülke Listesi</h2>
          <p className="text-sm text-gray-500 mt-1">
            Kaynak ülke olarak işaretlenmiş ülkeler vize checker'da seçilebilir
          </p>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Ülke
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Kod
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Pasaport Sırası
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Son Veri Çekme
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Kaynak Ülke
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  İşlem
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <RefreshCw className="mx-auto h-8 w-8 animate-spin text-gray-400" />
                    <p className="mt-2 text-sm text-gray-500">Yükleniyor...</p>
                  </td>
                </tr>
              ) : sourceCountries.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <Globe className="mx-auto h-12 w-12 text-gray-300" />
                    <p className="mt-2 text-sm text-gray-500">Ülke bulunamadı</p>
                  </td>
                </tr>
              ) : (
                sourceCountries.map((country) => (
                  <tr key={country.id} className="hover:bg-gray-50">
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{country.flag_emoji}</span>
                        <span className="font-medium text-gray-900">{country.name}</span>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700">
                      {country.country_code}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700">
                      {country.passport_rank || '-'}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      {country.is_source_country ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-800">
                          <CheckCircle className="h-3 w-3" />
                          Aktif
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">
                          <XCircle className="h-3 w-3" />
                          Pasif
                        </span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <button
                        onClick={() => handleToggleSourceCountry(country.id, country.is_source_country)}
                        className="text-sm font-medium text-primary hover:text-primary/80"
                      >
                        {country.is_source_country ? 'Pasif Yap' : 'Aktif Yap'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
