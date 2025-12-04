'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Search, X, Loader2 } from 'lucide-react';

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
        body: JSON.stringify({ url: photo.url, bucket: 'blog-images' }), // Default bucket
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-lg bg-white p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">Pexels'ten Görsel Seç</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="mb-4 flex gap-2">
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
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Search className="h-5 w-5" />}
            Ara
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {photos.map((photo) => (
            <div
              key={photo.id}
              className="group relative cursor-pointer overflow-hidden rounded-lg bg-gray-100 aspect-video"
              onClick={() => handleSelect(photo)}
            >
              <Image
                src={photo.thumbnail}
                alt={photo.alt}
                fill
                sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                className="object-cover transition-transform group-hover:scale-110"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 transition-all group-hover:bg-opacity-50">
                <span className="flex items-center gap-2 translate-y-4 rounded-full bg-white px-4 py-2 text-sm font-medium text-gray-900 opacity-0 transition-all group-hover:translate-y-0 group-hover:opacity-100">
                  {selecting === photo.id && <Loader2 className="h-4 w-4 animate-spin" />}
                  Seç
                </span>
              </div>
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                <p className="truncate text-xs text-white">{photo.photographer}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
