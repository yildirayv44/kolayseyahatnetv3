'use client';

import { useState, useEffect } from 'react';
import { Search, RefreshCw, Upload, Check, X, AlertCircle, Loader2 } from 'lucide-react';

interface DetectedImage {
  id: string;
  url: string;
  alt: string;
  status: 'ok' | 'error' | 'checking';
  source: {
    type: 'blog' | 'country';
    id: number;
    title: string;
    field: string;
  };
}

interface Stats {
  total: number;
  ok: number;
  error: number;
}

export default function ImageDetectionPage() {
  const [images, setImages] = useState<DetectedImage[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, ok: 0, error: 0 });
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<'all' | 'ok' | 'error'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedImage, setSelectedImage] = useState<DetectedImage | null>(null);
  const [showReplaceModal, setShowReplaceModal] = useState(false);
  const [pexelsQuery, setPexelsQuery] = useState('');
  const [pexelsResults, setPexelsResults] = useState<any[]>([]);
  const [loadingPexels, setLoadingPexels] = useState(false);
  const [replacingImage, setReplacingImage] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);

  // Fetch all images
  const fetchImages = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/images/detect');
      const data = await response.json();
      
      if (data.success) {
        setImages(data.images);
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching images:', error);
      alert('Görseller yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImages();
  }, []);

  // Filter images
  const filteredImages = images.filter(img => {
    const matchesFilter = filter === 'all' || img.status === filter;
    const matchesSearch = 
      img.url.toLowerCase().includes(searchTerm.toLowerCase()) ||
      img.alt.toLowerCase().includes(searchTerm.toLowerCase()) ||
      img.source.title.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  // Search Pexels
  const searchPexels = async () => {
    if (!pexelsQuery.trim()) return;
    
    setLoadingPexels(true);
    try {
      const response = await fetch('/api/images/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: pexelsQuery, perPage: 12 }),
      });
      
      const data = await response.json();
      if (data.success) {
        setPexelsResults(data.photos);
      }
    } catch (error) {
      console.error('Error searching Pexels:', error);
      alert('Pexels araması başarısız');
    } finally {
      setLoadingPexels(false);
    }
  };

  // Replace image
  const replaceImage = async (newImageUrl: string) => {
    if (!selectedImage) return;
    
    setReplacingImage(true);
    try {
      const response = await fetch('/api/admin/images/replace', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceType: selectedImage.source.type,
          sourceId: selectedImage.source.id,
          field: selectedImage.source.field,
          oldUrl: selectedImage.url,
          newImageUrl,
        }),
      });
      
      const data = await response.json();
      if (data.success) {
        alert('Görsel başarıyla değiştirildi!');
        setShowReplaceModal(false);
        setSelectedImage(null);
        fetchImages(); // Refresh list
      } else {
        alert('Hata: ' + data.error);
      }
    } catch (error) {
      console.error('Error replacing image:', error);
      alert('Görsel değiştirme başarısız');
    } finally {
      setReplacingImage(false);
    }
  };

  // Upload file
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedImage) return;
    
    setUploadingFile(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('bucket', selectedImage.source.type === 'blog' ? 'blog-images' : 'country-images');
      
      const uploadResponse = await fetch('/api/admin/images/upload', {
        method: 'POST',
        body: formData,
      });
      
      const uploadData = await uploadResponse.json();
      if (uploadData.success) {
        await replaceImage(uploadData.url);
      } else {
        alert('Yükleme hatası: ' + uploadData.error);
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Dosya yükleme başarısız');
    } finally {
      setUploadingFile(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Görsel Tespiti</h1>
          <p className="mt-2 text-gray-600">
            Blog ve ülke içeriklerindeki tüm görselleri kontrol edin
          </p>
        </div>

        {/* Stats */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-lg bg-white p-6 shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Toplam Görsel</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-blue-500" />
            </div>
          </div>
          
          <div className="rounded-lg bg-white p-6 shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Çalışan</p>
                <p className="mt-2 text-3xl font-bold text-green-600">{stats.ok}</p>
              </div>
              <Check className="h-8 w-8 text-green-500" />
            </div>
          </div>
          
          <div className="rounded-lg bg-white p-6 shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Hatalı</p>
                <p className="mt-2 text-3xl font-bold text-red-600">{stats.error}</p>
              </div>
              <X className="h-8 w-8 text-red-500" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 rounded-lg bg-white p-4 shadow">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`rounded-lg px-4 py-2 text-sm font-medium ${
                  filter === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Tümü ({stats.total})
              </button>
              <button
                onClick={() => setFilter('ok')}
                className={`rounded-lg px-4 py-2 text-sm font-medium ${
                  filter === 'ok'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Çalışan ({stats.ok})
              </button>
              <button
                onClick={() => setFilter('error')}
                className={`rounded-lg px-4 py-2 text-sm font-medium ${
                  filter === 'error'
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Hatalı ({stats.error})
              </button>
            </div>

            <div className="flex gap-2">
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <button
                onClick={fetchImages}
                disabled={loading}
                className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
              >
                <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
                Yenile
              </button>
            </div>
          </div>
        </div>

        {/* Images Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredImages.map((img) => (
              <div
                key={img.id}
                className={`overflow-hidden rounded-lg bg-white shadow transition-all hover:shadow-lg ${
                  img.status === 'error' ? 'border-2 border-red-300' : 'border border-gray-200'
                }`}
              >
                <div className="relative aspect-video bg-gray-100">
                  {img.status === 'ok' ? (
                    <img
                      src={img.url}
                      alt={img.alt}
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <X className="h-12 w-12 text-red-400" />
                    </div>
                  )}
                  
                  <div className="absolute right-2 top-2">
                    {img.status === 'ok' ? (
                      <span className="flex items-center gap-1 rounded-full bg-green-500 px-2 py-1 text-xs font-medium text-white">
                        <Check className="h-3 w-3" />
                        OK
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 rounded-full bg-red-500 px-2 py-1 text-xs font-medium text-white">
                        <X className="h-3 w-3" />
                        Hata
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-4">
                  <div className="mb-2 flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{img.source.title}</p>
                      <p className="text-xs text-gray-500">
                        {img.source.type === 'blog' ? '📝 Blog' : '🌍 Ülke'} • {img.source.field}
                      </p>
                    </div>
                  </div>

                  <p className="mb-3 truncate text-xs text-gray-600" title={img.url}>
                    {img.url}
                  </p>

                  <button
                    onClick={() => {
                      setSelectedImage(img);
                      setPexelsQuery(img.alt || img.source.title);
                      setShowReplaceModal(true);
                    }}
                    className={`w-full rounded-lg px-4 py-2 text-sm font-medium text-white ${
                      img.status === 'error'
                        ? 'bg-red-600 hover:bg-red-700'
                        : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                  >
                    {img.status === 'error' ? 'Düzelt' : 'Değiştir'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Replace Modal */}
        {showReplaceModal && selectedImage && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-lg bg-white p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-bold">Görseli Değiştir</h2>
                <button
                  onClick={() => {
                    setShowReplaceModal(false);
                    setSelectedImage(null);
                    setPexelsResults([]);
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="mb-4 rounded-lg bg-gray-50 p-4">
                <p className="mb-2 text-sm font-medium text-gray-700">Mevcut Görsel:</p>
                
                {selectedImage.status === 'ok' && (
                  <div className="mb-3 overflow-hidden rounded-lg">
                    <img
                      src={selectedImage.url}
                      alt={selectedImage.alt}
                      className="h-48 w-full object-cover"
                    />
                  </div>
                )}
                
                <p className="mb-1 truncate text-xs text-gray-600" title={selectedImage.url}>
                  {selectedImage.url}
                </p>
                <p className="text-sm text-gray-700">
                  <strong>Kaynak:</strong> {selectedImage.source.title} ({selectedImage.source.type === 'blog' ? 'Blog' : 'Ülke'})
                </p>
                <p className="text-xs text-gray-500">
                  <strong>Alan:</strong> {selectedImage.source.field}
                </p>
              </div>

              {/* File Upload */}
              <div className="mb-6">
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Dosya Yükle
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  disabled={uploadingFile}
                  className="w-full rounded-lg border border-gray-300 p-2"
                />
                {uploadingFile && (
                  <p className="mt-2 text-sm text-blue-600">Yükleniyor...</p>
                )}
              </div>

              <div className="mb-4 border-t pt-4">
                <p className="mb-2 text-center text-sm text-gray-500">veya</p>
              </div>

              {/* Pexels Search */}
              <div className="mb-4">
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Pexels'ten Ara
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={pexelsQuery}
                    onChange={(e) => setPexelsQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && searchPexels()}
                    placeholder="Örn: istanbul turkey travel"
                    className="flex-1 rounded-lg border border-gray-300 px-4 py-2"
                  />
                  <button
                    onClick={searchPexels}
                    disabled={loadingPexels}
                    className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
                  >
                    {loadingPexels ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <Search className="h-5 w-5" />
                    )}
                    Ara
                  </button>
                </div>
              </div>

              {/* Pexels Results */}
              {pexelsResults.length > 0 && (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                  {pexelsResults.map((photo) => (
                    <div
                      key={photo.id}
                      className="group relative cursor-pointer overflow-hidden rounded-lg bg-gray-100"
                      onClick={() => replaceImage(photo.url)}
                    >
                      <img
                        src={`/api/images/proxy?url=${encodeURIComponent(photo.thumbnail)}`}
                        alt={photo.alt}
                        className="aspect-video w-full object-cover transition-transform group-hover:scale-110"
                        loading="lazy"
                        onError={(e) => {
                          console.error('Image load error:', photo.thumbnail);
                          // Fallback to direct URL
                          e.currentTarget.src = photo.thumbnail;
                        }}
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 transition-all group-hover:bg-opacity-50">
                        <button
                          disabled={replacingImage}
                          className="translate-y-4 opacity-0 transition-all group-hover:translate-y-0 group-hover:opacity-100"
                        >
                          <span className="rounded-full bg-white px-4 py-2 text-sm font-medium text-gray-900">
                            {replacingImage ? 'Değiştiriliyor...' : 'Seç'}
                          </span>
                        </button>
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-2">
                        <p className="text-xs text-white">{photo.photographer}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
