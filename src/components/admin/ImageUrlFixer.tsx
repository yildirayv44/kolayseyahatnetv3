"use client";

import { useState } from "react";
import { AlertTriangle, Check } from "lucide-react";

interface ImageUrlFixerProps {
  content: string;
  onFix: (fixedContent: string) => void;
}

export function ImageUrlFixer({ content, onFix }: ImageUrlFixerProps) {
  const [fixing, setFixing] = useState(false);

  // Eski resim URL'lerini bul
  const oldImagePattern = /src="\/admin\/uploads\/[^"]+"/g;
  const hasOldImages = oldImagePattern.test(content);

  if (!hasOldImages) {
    return null;
  }

  const handleFix = () => {
    setFixing(true);

    // Eski URL'leri kaldır veya placeholder ekle
    const fixedContent = content.replace(
      /src="\/admin\/uploads\/[^"]+"/g,
      'src="" alt="Resim yüklenmedi - Lütfen yeni resim yükleyin"'
    );

    onFix(fixedContent);
    setFixing(false);
  };

  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
      <div className="flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600" />
        <div className="flex-1 space-y-2">
          <p className="text-sm font-semibold text-amber-900">
            Eski Resim URL'leri Bulundu
          </p>
          <p className="text-sm text-amber-700">
            Bu içerikte eski sistemden kalan resim URL'leri var. Bu resimler artık yüklenmiyor.
            Lütfen yeni resimler yükleyin.
          </p>
          <button
            type="button"
            onClick={handleFix}
            disabled={fixing}
            className="inline-flex items-center gap-2 rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-700 disabled:opacity-50"
          >
            {fixing ? (
              <>
                <Check className="h-4 w-4" />
                Temizlendi
              </>
            ) : (
              "Eski Resimleri Temizle"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
