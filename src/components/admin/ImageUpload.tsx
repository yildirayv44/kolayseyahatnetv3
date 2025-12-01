"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { Upload, X, Loader2, Image as ImageIcon } from "lucide-react";

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
  const [preview, setPreview] = useState<string | null>(currentImageUrl || null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);

    // Validate file
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

    // Show preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload to server
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
      setPreview(currentImageUrl || null);
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    onImageChange("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
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
      <label className="block text-sm font-semibold text-slate-900">{label}</label>

      {preview ? (
        <div className="relative">
          <div className={`relative w-full overflow-hidden rounded-lg bg-slate-100 ${aspectRatioClass}`}>
            <Image
              src={preview}
              alt="Preview"
              fill
              className="object-cover"
              unoptimized={preview.startsWith("data:")}
            />
            {uploading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                <Loader2 className="h-8 w-8 animate-spin text-white" />
              </div>
            )}
          </div>
          {!uploading && (
            <button
              type="button"
              onClick={handleRemove}
              className="absolute right-2 top-2 rounded-full bg-red-500 p-2 text-white shadow-lg transition-colors hover:bg-red-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      ) : (
        <div
          onClick={() => fileInputRef.current?.click()}
          className={`relative flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 transition-colors hover:border-primary hover:bg-primary/5 ${aspectRatioClass}`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
            onChange={handleFileSelect}
            className="hidden"
            disabled={uploading}
          />
          <div className="flex flex-col items-center gap-2 p-6 text-center">
            {uploading ? (
              <>
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-slate-600">Yükleniyor...</p>
              </>
            ) : (
              <>
                <div className="rounded-full bg-primary/10 p-3">
                  <ImageIcon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900">Fotoğraf Yükle</p>
                  <p className="text-xs text-slate-500">JPG, PNG, WebP veya GIF (Max 5MB)</p>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <Upload className="h-4 w-4" />
                  <span>Tıklayın veya sürükleyin</span>
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
    </div>
  );
}
