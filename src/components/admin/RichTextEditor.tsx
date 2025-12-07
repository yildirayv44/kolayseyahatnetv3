"use client";

import { useState, useRef } from "react";
import { supabase } from "@/lib/supabase";
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Image as ImageIcon,
  Link as LinkIcon,
  Table,
  Eye,
  Code,
  Heading2,
  Heading3,
  Quote,
  Loader2,
  Search,
  Wand2,
} from "lucide-react";
import { PexelsImagePicker } from "./PexelsImagePicker";
import { DALLEImageInserter } from "./DALLEImageInserter";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  onCoverImageChange?: (url: string) => void;
}

export function RichTextEditor({ value, onChange, placeholder, onCoverImageChange }: RichTextEditorProps) {
  const [showPreview, setShowPreview] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showPexelsPicker, setShowPexelsPicker] = useState(false);
  const [simpleMode, setSimpleMode] = useState(true); // Basit mod varsayılan
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const insertText = (before: string, after: string = "") => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    const newText = value.substring(0, start) + before + selectedText + after + value.substring(end);

    onChange(newText);

    // Set cursor position after insertion
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + before.length + selectedText.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      alert("Lütfen bir resim dosyası seçin");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("Dosya boyutu 5MB'dan küçük olmalıdır");
      return;
    }

    setUploading(true);

    try {
      // Generate unique filename
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `content-images/${fileName}`;

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from("uploads")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (error) throw error;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from("uploads")
        .getPublicUrl(filePath);

      // Insert image tag
      insertText(`<img src="${publicUrl}" alt="${file.name}" class="w-full rounded-lg my-4" />`, "");
      
      alert("Resim başarıyla yüklendi!");
    } catch (error: any) {
      console.error("Upload error:", error);
      alert("Resim yüklenirken hata oluştu: " + error.message);
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const insertTable = () => {
    const tableHTML = `
<table>
  <thead>
    <tr>
      <th>Başlık 1</th>
      <th>Başlık 2</th>
      <th>Başlık 3</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Hücre 1</td>
      <td>Hücre 2</td>
      <td>Hücre 3</td>
    </tr>
    <tr>
      <td>Hücre 4</td>
      <td>Hücre 5</td>
      <td>Hücre 6</td>
    </tr>
  </tbody>
</table>`;
    insertText(tableHTML, "");
  };

  const insertLink = () => {
    const url = prompt("Link URL'sini girin:");
    if (url) {
      insertText(`<a href="${url}">`, "</a>");
    }
  };

  const handlePexelsSelect = (imageUrl: string) => {
    // Insert image tag at cursor position
    insertText(`<img src="${imageUrl}" alt="Pexels image" class="w-full rounded-lg my-4" />`, "");
    setShowPexelsPicker(false);
  };

  // HTML'i formatla (okunabilir hale getir)
  const formatHtml = () => {
    const formatted = value
      // Her tag'den sonra yeni satır
      .replace(/(<\/h[23]>)/g, '$1\n\n')
      .replace(/(<\/p>)/g, '$1\n\n')
      .replace(/(<img[^>]+>)/g, '\n$1\n\n')
      .replace(/(<\/blockquote>)/g, '$1\n\n')
      .replace(/(<\/ul>)/g, '$1\n\n')
      .replace(/(<\/ol>)/g, '$1\n\n')
      // Çoklu boş satırları tek satıra indir
      .replace(/\n{3,}/g, '\n\n')
      .trim();
    
    onChange(formatted);
  };

  // Basit modda HTML'i temizle ve düz metne çevir
  const htmlToSimpleText = (html: string): string => {
    return html
      .replace(/<h2>(.*?)<\/h2>/g, '\n## $1\n')
      .replace(/<h3>(.*?)<\/h3>/g, '\n### $1\n')
      .replace(/<strong>(.*?)<\/strong>/g, '**$1**')
      .replace(/<em>(.*?)<\/em>/g, '*$1*')
      .replace(/<p>(.*?)<\/p>/g, '$1\n\n')
      .replace(/<br\s*\/?>/g, '\n')
      .replace(/<img[^>]+src="([^"]+)"[^>]*>/g, '\n[Görsel: $1]\n')
      .replace(/<[^>]+>/g, '')
      .trim();
  };

  // Basit metni HTML'e çevir (düzgün formatlanmış)
  const simpleTextToHtml = (text: string): string => {
    return text
      .split('\n\n')
      .map(para => {
        if (para.startsWith('## ')) {
          return `<h2>${para.substring(3)}</h2>`;
        } else if (para.startsWith('### ')) {
          return `<h3>${para.substring(4)}</h3>`;
        } else if (para.match(/\[Görsel: (.+)\]/)) {
          const url = para.match(/\[Görsel: (.+)\]/)?.[1];
          return `<img src="${url}" alt="Image" class="w-full rounded-lg my-4" />`;
        } else if (para.trim()) {
          return `<p>${para
            .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.+?)\*/g, '<em>$1</em>')
          }</p>`;
        }
        return '';
      })
      .filter(line => line)
      .join('\n\n');
  };

  const toolbarButtons = [
    { icon: Heading2, action: () => insertText("<h2>", "</h2>"), title: "Başlık 2" },
    { icon: Heading3, action: () => insertText("<h3>", "</h3>"), title: "Başlık 3" },
    { icon: Bold, action: () => insertText("<strong>", "</strong>"), title: "Kalın" },
    { icon: Italic, action: () => insertText("<em>", "</em>"), title: "İtalik" },
    { icon: List, action: () => insertText("<ul>\n  <li>", "</li>\n</ul>"), title: "Liste" },
    { icon: ListOrdered, action: () => insertText("<ol>\n  <li>", "</li>\n</ol>"), title: "Numaralı Liste" },
    { icon: Quote, action: () => insertText("<blockquote>", "</blockquote>"), title: "Alıntı" },
    { icon: LinkIcon, action: insertLink, title: "Link" },
    { icon: Table, action: insertTable, title: "Tablo" },
    { icon: Code, action: () => insertText("<code>", "</code>"), title: "Kod" },
  ];

  return (
    <div className="space-y-3">
      {/* Mode Toggle */}
      <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-slate-700">Düzenleme Modu:</span>
          <button
            type="button"
            onClick={() => setSimpleMode(true)}
            className={`rounded px-3 py-1 text-sm font-medium transition-colors ${
              simpleMode
                ? 'bg-green-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            📝 Basit Mod
          </button>
          <button
            type="button"
            onClick={() => setSimpleMode(false)}
            className={`rounded px-3 py-1 text-sm font-medium transition-colors ${
              !simpleMode
                ? 'bg-orange-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            🔧 HTML Mod
          </button>
        </div>
        <p className="text-xs text-slate-500">
          {simpleMode ? 'Basit metin düzenleme' : 'Gelişmiş HTML düzenleme'}
        </p>
      </div>

      {/* Toolbar - Only show in HTML mode */}
      {!simpleMode && (
        <div className="flex flex-wrap items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 p-2">
          {toolbarButtons.map((btn, index) => (
          <button
            key={index}
            type="button"
            onClick={btn.action}
            title={btn.title}
            className="rounded p-2 text-slate-600 hover:bg-white hover:text-primary"
          >
            <btn.icon className="h-4 w-4" />
          </button>
        ))}

        <div className="mx-2 h-6 w-px bg-slate-300" />

        {/* Image Upload */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          title="Resim Yükle"
          className="rounded p-2 text-slate-600 hover:bg-white hover:text-primary disabled:opacity-50"
        >
          {uploading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <ImageIcon className="h-4 w-4" />
          )}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
        />

        {/* Pexels Search */}
        <button
          type="button"
          onClick={() => setShowPexelsPicker(true)}
          title="Pexels'ten Ara"
          className="rounded p-2 text-purple-600 hover:bg-white hover:text-purple-700"
        >
          <Search className="h-4 w-4" />
        </button>

        {/* DALL-E Image Generator */}
        <DALLEImageInserter
          onInsert={(imageUrl, imageHtml) => {
            const textarea = textareaRef.current;
            if (!textarea) return;
            const start = textarea.selectionStart;
            const newText = value.substring(0, start) + '\n' + imageHtml + '\n' + value.substring(start);
            onChange(newText);
          }}
          onSetCover={onCoverImageChange}
          mode={onCoverImageChange ? 'both' : 'content'}
        />

        <div className="mx-2 h-6 w-px bg-slate-300" />

        {/* Format HTML */}
        <button
          type="button"
          onClick={formatHtml}
          title="HTML'i Formatla"
          className="rounded p-2 text-green-600 hover:bg-white hover:text-green-700"
        >
          <Wand2 className="h-4 w-4" />
        </button>

        <div className="mx-2 h-6 w-px bg-slate-300" />

        {/* Preview Toggle */}
        <button
          type="button"
          onClick={() => setShowPreview(!showPreview)}
          title="Önizleme"
          className={`rounded p-2 ${
            showPreview ? "bg-primary text-white" : "text-slate-600 hover:bg-white hover:text-primary"
          }`}
        >
          <Eye className="h-4 w-4" />
        </button>
        </div>
      )}

      {/* Editor / Preview */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Editor */}
        <div className={showPreview ? "" : "lg:col-span-2"}>
          {simpleMode ? (
            <textarea
              ref={textareaRef}
              value={htmlToSimpleText(value)}
              onChange={(e) => onChange(simpleTextToHtml(e.target.value))}
              placeholder={placeholder || "Metninizi buraya yazın...\n\n## Başlık için\n**Kalın** veya *italik* için\n\nParagraflar arasında boş satır bırakın."}
              className="min-h-[400px] w-full rounded-lg border border-slate-200 p-4 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          ) : (
            <textarea
              ref={textareaRef}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder={placeholder || "HTML içeriğinizi buraya yazın..."}
              className="min-h-[400px] w-full rounded-lg border border-slate-200 p-4 font-mono text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          )}
        </div>

        {/* Preview */}
        {showPreview && (
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <div className="mb-2 text-xs font-semibold text-slate-600">ÖNİZLEME</div>
            <div
              className="prose-content min-h-[400px] rounded-lg bg-white p-4"
              dangerouslySetInnerHTML={{ __html: value }}
            />
          </div>
        )}
      </div>

      {/* Helper Text */}
      <div className="rounded-lg bg-blue-50 p-3 text-xs text-blue-700">
        {simpleMode ? (
          <>
            <strong>📝 Basit Mod İpuçları:</strong>
            <ul className="ml-4 mt-1 list-disc space-y-1">
              <li><code>## Başlık</code> - Büyük başlık için</li>
              <li><code>### Alt Başlık</code> - Küçük başlık için</li>
              <li><code>**kalın metin**</code> - Kalın yazı için</li>
              <li><code>*italik metin*</code> - İtalik yazı için</li>
              <li>Paragraflar arasında boş satır bırakın</li>
              <li>Görsel eklemek için HTML Mod'a geçin</li>
            </ul>
          </>
        ) : (
          <>
            <strong>🔧 HTML Mod İpuçları:</strong> Metni seçip butonlara tıklayarak HTML etiketleri ekleyebilirsiniz.
            Resim yüklemek için resim butonuna, Pexels'ten aramak için mor arama butonuna (🔍), 
            HTML'i düzenli hale getirmek için yeşil sihirli değnek butonuna (✨) tıklayın.
          </>
        )}
      </div>

      {/* Pexels Image Picker Modal */}
      {showPexelsPicker && (
        <PexelsImagePicker
          onSelect={handlePexelsSelect}
          onClose={() => setShowPexelsPicker(false)}
        />
      )}
    </div>
  );
}
