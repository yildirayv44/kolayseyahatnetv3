'use client';

import { useState } from 'react';
import { Search, X, Loader2, Upload, Image as ImageIcon } from 'lucide-react';

interface PexelsPhoto {
  id: number;
  url: string;
  thumbnail: string;
  alt: string;
  photographer: string;
  photographer_url: string;
}

interface PexelsImagePickerProps {
  onSelect: (imageUrl: string) => void;
  onUpload?: (file: File) => void;
  currentImage?: string;
  title?: string;
}

export function PexelsImagePicker({
  onSelect,
  onUpload,
  currentImage,
  title = 'Görsel Seç',
}: PexelsImagePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [photos, setPhotos] = useState<PexelsPhoto[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const searchPexels = async () => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    try {
      const response = await fetch('/api/images/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: searchQuery, perPage: 12 }),
      });

      const data = await response.json();
      if (data.success) {
        setPhotos(data.photos);
      }
    } catch (error) {
      console.error('Pexels search error:', error);
      alert('Arama başarısız oldu');
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = async (photoUrl: string) => {
    // Download and upload to our storage
    try {
      const response = await fetch('/api/admin/images/upload-from-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: photoUrl }),
      });

      const data = await response.json();
      if (data.success) {
        onSelect(data.url);
        setIsOpen(false);
        setPhotos([]);
        setSearchQuery('');
      } else {
        alert('Görsel yükleme başarısız: ' + data.error);
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Görsel yükleme başarısız');
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (onUpload) {
      setUploading(true);
      try {
        await onUpload(file);
        setIsOpen(false);
      } catch (error) {
        console.error('File upload error:', error);
        alert('Dosya yükleme başarısız');
      } finally {
        setUploading(false);
      }
    }
  };

  return (
    <div>
      {/* Trigger Button */}
      <div className="space-y-2">
        {currentImage && (
          <div className="relative aspect-video w-full max-w-md overflow-hidden rounded-lg border-2 border-gray-200">
            <img
              src={currentImage}
              alt="Mevcut görsel"
              className="h-full w-full object-cover"
            />
          </div>
        )}
        
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          <ImageIcon className="h-4 w-4" />
          {currentImage ? 'Görseli Değiştir' : 'Görsel Seç'}
        </button>
      </div>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-lg bg-white p-6">
            {/* Header */}
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold">{title}</h2>
              <button
                onClick={() => {
                  setIsOpen(false);
                  setPhotos([]);
                  setSearchQuery('');
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* File Upload */}
            {onUpload && (
              <div className="mb-6">
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Dosya Yükle
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  disabled={uploading}
                  className="w-full rounded-lg border border-gray-300 p-2"
                />
                {uploading && (
                  <p className="mt-2 text-sm text-blue-600">Yükleniyor...</p>
                )}
              </div>
            )}

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
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && searchPexels()}
                  placeholder="Örn: istanbul turkey travel"
                  className="flex-1 rounded-lg border border-gray-300 px-4 py-2"
                />
                <button
                  onClick={searchPexels}
                  disabled={loading}
                  className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Search className="h-5 w-5" />
                  )}
                  Ara
                </button>
              </div>
            </div>

            {/* Results */}
            {photos.length > 0 && (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                {photos.map((photo) => (
                  <div
                    key={photo.id}
                    className="group relative cursor-pointer overflow-hidden rounded-lg bg-gray-100"
                    onClick={() => handleSelect(photo.url)}
                  >
                    <img
                      src={`/api/images/proxy?url=${encodeURIComponent(photo.thumbnail)}`}
                      alt={photo.alt}
                      className="aspect-video w-full object-cover transition-transform group-hover:scale-110"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 transition-all group-hover:bg-opacity-50">
                      <span className="translate-y-4 rounded-full bg-white px-4 py-2 text-sm font-medium text-gray-900 opacity-0 transition-all group-hover:translate-y-0 group-hover:opacity-100">
                        Seç
                      </span>
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
  );
}
