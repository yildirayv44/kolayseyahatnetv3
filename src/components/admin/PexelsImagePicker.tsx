'use client';

import { useState } from 'react';
import { Search, X, Loader2, CheckCircle } from 'lucide-react';

interface PexelsPhoto {
  id: number;
  url: string;
  thumbnail: string;
  alt: string;
  photographer: string;
}

interface PexelsImagePickerProps {
  onSelect: (imageUrl: string) => void;
  onClose: () => void;
}

export function PexelsImagePicker({ onSelect, onClose }: PexelsImagePickerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [photos, setPhotos] = useState<PexelsPhoto[]>([]);
  const [loading, setLoading] = useState(false);
  const [selecting, setSelecting] = useState<number | null>(null);

  const searchPexels = async () => {
    if (!searchQuery.trim()) return;
    setLoading(true);
    try {
      const response = await fetch(`/api/images/generate?prompt=${encodeURIComponent(searchQuery)}&perPage=12`);
      const data = await response.json();
      if (data.success) {
        setPhotos(data.photos);
      } else {
        alert('Arama başarısız: ' + data.error);
      }
    } catch (error) {
      console.error('Pexels search error:', error);
      alert('Arama sırasında bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = async (photo: PexelsPhoto) => {
    setSelecting(photo.id);
    try {
      const response = await fetch('/api/admin/images/upload-from-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: photo.url, bucket: 'blog-images' }),
      });
      const data = await response.json();
      if (data.success) {
        onSelect(data.url);
        onClose();
      } else {
        alert('Görsel yüklenemedi: ' + data.error);
      }
    } catch (error) {
      console.error('Upload from URL error:', error);
      alert('Görsel yüklenirken bir hata oluştu.');
    } finally {
      setSelecting(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-white">
      {/* Header - Fixed */}
      <div className="sticky top-0 z-10 border-b border-gray-200 bg-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Pexels'ten Görsel Seç</h2>
            <p className="text-sm text-gray-500">Ücretsiz stok fotoğraflar</p>
          </div>
          <button 
            onClick={onClose} 
            className="rounded-full p-2 hover:bg-gray-100"
          >
            <X className="h-6 w-6 text-gray-600" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="mt-4 flex gap-3">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && searchPexels()}
            placeholder="Örn: istanbul, travel, nature..."
            className="flex-1 rounded-xl border-2 border-gray-200 px-4 py-3 text-base focus:border-blue-500 focus:outline-none"
            autoFocus
          />
          <button
            onClick={searchPexels}
            disabled={loading}
            className="rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <div className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Ara
              </div>
            )}
          </button>
        </div>
      </div>

      {/* Content - Scrollable */}
      <div className="h-[calc(100vh-180px)] overflow-y-auto p-6">
        {photos.length === 0 && !loading && (
          <div className="flex h-full flex-col items-center justify-center text-gray-400">
            <Search className="mb-4 h-16 w-16" />
            <p className="text-lg">Aramak için yukarıdaki kutuyu kullanın</p>
            <p className="text-sm">Örnek: "istanbul", "travel", "nature"</p>
          </div>
        )}

        {/* Simple Table Layout - NO COMPLEX CSS */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
          gap: '20px'
        }}>
          {photos.map((photo) => (
            <div
              key={photo.id}
              onClick={() => handleSelect(photo)}
              style={{
                cursor: 'pointer',
                borderRadius: '12px',
                overflow: 'hidden',
                backgroundColor: '#f3f4f6',
                border: selecting === photo.id ? '3px solid #3b82f6' : '2px solid #e5e7eb',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 10px 25px rgba(0,0,0,0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              {/* Image Container - SIMPLE */}
              <div style={{ 
                width: '100%', 
                paddingBottom: '66.67%', // 3:2 aspect ratio
                position: 'relative',
                backgroundColor: '#e5e7eb'
              }}>
                <img
                  src={photo.thumbnail}
                  alt={photo.alt}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    display: 'block'
                  }}
                  onLoad={(e) => {
                    console.log('✅ Image loaded:', photo.thumbnail);
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                  onError={(e) => {
                    console.error('❌ Image failed:', photo.thumbnail);
                    e.currentTarget.style.display = 'none';
                  }}
                />
                
                {/* Loading Overlay */}
                {selecting === photo.id && (
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Loader2 className="h-8 w-8 animate-spin text-white" />
                  </div>
                )}
              </div>

              {/* Info */}
              <div style={{ padding: '12px' }}>
                <p style={{ 
                  fontSize: '13px', 
                  color: '#6b7280',
                  margin: 0,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>
                  📸 {photo.photographer}
                </p>
                {selecting === photo.id && (
                  <p style={{ 
                    fontSize: '12px', 
                    color: '#3b82f6',
                    margin: '4px 0 0 0',
                    fontWeight: 600
                  }}>
                    Yükleniyor...
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
