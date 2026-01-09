'use client';

import { useState } from 'react';

export default function SystemToolsPage() {
  const [isRecalculating, setIsRecalculating] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  const recalculateMetrics = async () => {
    if (!confirm('Tüm içeriklerin metriklerini yeniden hesaplamak istediğinizden emin misiniz?')) {
      return;
    }

    setIsRecalculating(true);
    setMessage(null);
    setResult(null);

    try {
      const response = await fetch('/api/admin/ai-blog/recalculate-metrics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      const data = await response.json();

      if (data.success) {
        setResult(data);
        setMessage({
          type: 'success',
          text: `✅ ${data.updated_count} içeriğin metrikleri başarıyla güncellendi!`
        });
      } else {
        setMessage({
          type: 'error',
          text: data.error || 'Bir hata oluştu'
        });
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'Metrik hesaplama başarısız oldu'
      });
    } finally {
      setIsRecalculating(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">🔧 Sistem Araçları</h1>
        <p className="text-gray-600">AI Blog sistemi için yönetim ve bakım araçları</p>
      </div>

      {/* Message */}
      {message && (
        <div className={`mb-6 p-4 rounded-lg ${
          message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' :
          message.type === 'error' ? 'bg-red-50 text-red-800 border border-red-200' :
          'bg-blue-50 text-blue-800 border border-blue-200'
        }`}>
          {message.text}
        </div>
      )}

      {/* Tools Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Recalculate Metrics Tool */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 hover:border-blue-300 transition-colors">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">📊</span>
            </div>
            
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Metrikleri Yeniden Hesapla
              </h2>
              <p className="text-gray-600 text-sm mb-4">
                Tüm içeriklerin keyword yoğunluğu, ana sayfa link sayısı ve kelime sayısını yeniden hesaplar.
              </p>
              
              <div className="bg-gray-50 rounded-lg p-3 mb-4 text-sm">
                <p className="font-medium text-gray-700 mb-2">Ne zaman kullanılır?</p>
                <ul className="list-disc list-inside text-gray-600 space-y-1">
                  <li>Migration uygulandıktan sonra</li>
                  <li>Metrikler yanlış görünüyorsa</li>
                  <li>Toplu içerik güncellemesi sonrası</li>
                </ul>
              </div>

              <button
                onClick={recalculateMetrics}
                disabled={isRecalculating}
                className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                {isRecalculating ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Hesaplanıyor...
                  </span>
                ) : (
                  '🔄 Metrikleri Hesapla'
                )}
              </button>
            </div>
          </div>

          {/* Results */}
          {result && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-3">Sonuçlar:</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-blue-50 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-blue-600">{result.total_content}</div>
                  <div className="text-xs text-gray-600">Toplam İçerik</div>
                </div>
                <div className="bg-green-50 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-green-600">{result.updated_count}</div>
                  <div className="text-xs text-gray-600">Güncellendi</div>
                </div>
                <div className="bg-red-50 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-red-600">{result.failed_count}</div>
                  <div className="text-xs text-gray-600">Başarısız</div>
                </div>
              </div>

              {result.errors && result.errors.length > 0 && (
                <div className="mt-4 p-3 bg-red-50 rounded-lg">
                  <p className="text-sm font-medium text-red-800 mb-2">Hatalar:</p>
                  <ul className="text-xs text-red-600 space-y-1">
                    {result.errors.slice(0, 5).map((err: any, idx: number) => (
                      <li key={idx}>ID: {err.id} - {err.error}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Future Tools Placeholder */}
        <div className="bg-gray-50 rounded-lg border border-gray-200 p-6 opacity-50">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
              <span className="text-2xl">🔮</span>
            </div>
            
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-gray-700 mb-2">
                Gelecek Araçlar
              </h2>
              <p className="text-gray-500 text-sm mb-4">
                Yakında daha fazla sistem aracı eklenecek...
              </p>
              
              <ul className="text-sm text-gray-500 space-y-2">
                <li>• Toplu içerik yenileme</li>
                <li>• Cache temizleme</li>
                <li>• Performans analizi</li>
                <li>• Veri yedekleme</li>
              </ul>
            </div>
          </div>
        </div>

      </div>

      {/* Info Box */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-start gap-3">
          <span className="text-2xl">💡</span>
          <div>
            <h3 className="font-semibold text-blue-900 mb-2">Önemli Notlar</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Sistem araçları yalnızca admin kullanıcılar tarafından kullanılabilir</li>
              <li>• Büyük işlemler sunucu performansını etkileyebilir</li>
              <li>• İşlemler geri alınamaz, dikkatli kullanın</li>
              <li>• Önemli işlemlerden önce yedek alın</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
