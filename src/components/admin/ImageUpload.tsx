"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { Upload, X, Loader2, Image as ImageIcon, Search } from "lucide-react";
import { PexelsImagePicker } from "./PexelsImagePicker";

interface ImageUploadProps {
  currentImageUrl?: string | null;
  onImageChange: (url: string) => void;
  bucket: "blog-images" | "country-images" | "consultant-images";
  label?: string;
  aspectRatio?: "16/9" | "21/9" | "1/1" | "4/3";
}

export function ImageUpload({
  currentImageUrl,
  onImageChange,
  bucket,
  label = "Fotoğraf",
  aspectRatio = "16/9",
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showPexelsPicker, setShowPexelsPicker] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setPreview(currentImageUrl || null);
  }, [currentImageUrl]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);

    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];
    if (!validTypes.includes(file.type)) {
      setError("Sadece JPG, PNG, WebP ve GIF formatları destekleniyor.");
      return;
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      setError("Dosya boyutu 5MB'dan küçük olmalıdır.");
      return;
    }

    await handleFileUpload(file);
  };

  const handleRemove = () => {
    setPreview(null);
    onImageChange("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handlePexelsSelect = (url: string) => {
    console.log('🖼️ Pexels image selected:', url);
    setPreview(url);
    console.log('✅ Preview set to:', url);
    onImageChange(url);
    console.log('✅ onImageChange called with:', url);
    setShowPexelsPicker(false);
  };

  const handleFileUpload = async (file: File) => {
    setError(null);
    setUploading(true);
    
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("bucket", bucket);

      const response = await fetch("/api/upload-image", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Yükleme başarısız");
      }

      setPreview(data.url);
      onImageChange(data.url);
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setUploading(false);
    }
  };

  const aspectRatioClass = {
    "16/9": "aspect-[16/9]",
    "21/9": "aspect-[21/9]",
    "1/1": "aspect-square",
    "4/3": "aspect-[4/3]",
  }[aspectRatio];

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-semibold text-slate-900">{label}</label>
        <button
          type="button"
          onClick={() => setShowPexelsPicker(true)}
          className="flex items-center gap-2 rounded-lg bg-purple-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-purple-700"
        >
          <Search className="h-3 w-3" />
          Pexels'ten Ara
        </button>
      </div>

      {preview ? (
        <div className="relative">
          <div className="relative w-full h-32 overflow-hidden rounded-lg bg-slate-100">
            <Image
              src={preview}
              alt="Preview"
              fill
              className="object-cover"
              unoptimized={preview.startsWith("data:")}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
            {uploading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                <Loader2 className="h-6 w-6 animate-spin text-white" />
              </div>
            )}
          </div>
          {!uploading && (
            <button
              type="button"
              onClick={handleRemove}
              className="absolute right-2 top-2 rounded-full bg-red-500 p-1.5 text-white shadow-lg transition-colors hover:bg-red-600"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>
      ) : (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="relative flex cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 transition-colors hover:border-primary hover:bg-primary/5 h-32"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
            onChange={handleFileSelect}
            className="hidden"
            disabled={uploading}
          />
          <div className="flex items-center gap-3 px-4 text-center">
            {uploading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
                <p className="text-sm text-slate-600">Yükleniyor...</p>
              </>
            ) : (
              <>
                <div className="rounded-full bg-primary/10 p-2">
                  <ImageIcon className="h-5 w-5 text-primary" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium text-slate-900">Fotoğraf Yükle</p>
                  <p className="text-xs text-slate-500">JPG, PNG, WebP (Max 5MB)</p>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <p className="text-xs text-slate-500">
        Önerilen boyut: {aspectRatio === "16/9" ? "1200x675" : aspectRatio === "21/9" ? "1200x514" : "1200x1200"} px
      </p>

      {showPexelsPicker && (
        <PexelsImagePicker
          onSelect={handlePexelsSelect}
          onClose={() => setShowPexelsPicker(false)}
        />
      )}
    </div>
  );
}
