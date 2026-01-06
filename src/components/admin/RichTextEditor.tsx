// @ts-nocheck
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
  Strikethrough,
  Highlighter,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Save,
  FileText,
  Trash2,
} from "lucide-react";
import { PexelsImagePicker } from "./PexelsImagePicker";
import { DALLEImageInserter } from "./DALLEImageInserter";
import { TableEditor } from "./TableEditor";

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
  const [showTableEditor, setShowTableEditor] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-save functionality
  const handleAutoSave = () => {
    if (value) {
      localStorage.setItem('draft_content', value);
      localStorage.setItem('draft_timestamp', new Date().toISOString());
      setLastSaved(new Date());
    }
  };

  // Auto-save on change (debounced)
  const handleChange = (newValue: string) => {
    onChange(newValue);
    
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }
    
    autoSaveTimerRef.current = setTimeout(() => {
      handleAutoSave();
    }, 2000); // Save after 2 seconds of inactivity
  };

  const loadDraft = () => {
    const draft = localStorage.getItem('draft_content');
    if (draft && confirm('Kaydedilmiş taslak bulundu. Yüklemek ister misiniz?')) {
      onChange(draft);
    }
  };

  const clearDraft = () => {
    if (confirm('Taslağı silmek istediğinizden emin misiniz?')) {
      localStorage.removeItem('draft_content');
      localStorage.removeItem('draft_timestamp');
      setLastSaved(null);
    }
  };

  const insertText = (before: string, after: string = "") => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    const newText = value.substring(0, start) + before + selectedText + after + value.substring(end);

    handleChange(newText);

    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + before.length + selectedText.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  // Markdown shortcuts handler
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Ctrl/Cmd + B = Bold
    if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
      e.preventDefault();
      insertText('<strong>', '</strong>');
    }
    // Ctrl/Cmd + I = Italic
    else if ((e.ctrlKey || e.metaKey) && e.key === 'i') {
      e.preventDefault();
      insertText('<em>', '</em>');
    }
    // Ctrl/Cmd + K = Link
    else if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      insertLink();
    }
    // Ctrl/Cmd + Shift + X = Strikethrough
    else if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'X') {
      e.preventDefault();
      insertText('<del>', '</del>');
    }
    // Ctrl/Cmd + U = Underline
    else if ((e.ctrlKey || e.metaKey) && e.key === 'u') {
      e.preventDefault();
      insertText('<u>', '</u>');
    }
    // Ctrl/Cmd + Shift + H = Highlight
    else if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'H') {
      e.preventDefault();
      insertText('<mark>', '</mark>');
    }
    // Ctrl/Cmd + S = Save
    else if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      handleAutoSave();
    }
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

  const toolbarButtons = [
    { icon: Heading2, action: () => insertText("<h2>", "</h2>"), title: "Başlık 2 (Ctrl+2)" },
    { icon: Heading3, action: () => insertText("<h3>", "</h3>"), title: "Başlık 3 (Ctrl+3)" },
    { icon: Bold, action: () => insertText("<strong>", "</strong>"), title: "Kalın (Ctrl+B)" },
    { icon: Italic, action: () => insertText("<em>", "</em>"), title: "İtalik (Ctrl+I)" },
    { icon: Underline, action: () => insertText("<u>", "</u>"), title: "Altı Çizili (Ctrl+U)" },
    { icon: Strikethrough, action: () => insertText("<del>", "</del>"), title: "Üstü Çizili (Ctrl+Shift+X)" },
    { icon: Highlighter, action: () => insertText("<mark>", "</mark>"), title: "Vurgula (Ctrl+Shift+H)" },
    { icon: List, action: () => insertText("<ul>\n  <li>", "</li>\n</ul>"), title: "Liste" },
    { icon: ListOrdered, action: () => insertText("<ol>\n  <li>", "</li>\n</ol>"), title: "Numaralı Liste" },
    { icon: Quote, action: () => insertText("<blockquote>", "</blockquote>"), title: "Alıntı" },
    { icon: LinkIcon, action: insertLink, title: "Link (Ctrl+K)" },
    { icon: Table, action: () => setShowTableEditor(true), title: "Tablo Ekle" },
    { icon: Code, action: () => insertText("<code>", "</code>"), title: "Kod" },
    { icon: AlignLeft, action: () => insertText('<div style="text-align: left;">', '</div>'), title: "Sola Hizala" },
    { icon: AlignCenter, action: () => insertText('<div style="text-align: center;">', '</div>'), title: "Ortala" },
    { icon: AlignRight, action: () => insertText('<div style="text-align: right;">', '</div>'), title: "Sağa Hizala" },
  ];

  return (
    <div className="space-y-3">
      {/* Draft Controls */}
      <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-3 flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-slate-900">🔧 HTML Editor</span>
          <span className="text-xs text-slate-500">Metni seçip toolbar butonlarını kullanın</span>
        </div>
        
        <div className="flex items-center gap-2">
          {lastSaved && (
            <span className="text-xs text-green-600 flex items-center gap-1">
              <Save className="h-3 w-3" />
              {lastSaved.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
          <button
            type="button"
            onClick={loadDraft}
            className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded transition-colors"
            title="Taslak Yükle"
          >
            <FileText className="h-3 w-3" />
            Taslak
          </button>
          <button
            type="button"
            onClick={handleAutoSave}
            className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-green-600 hover:bg-green-50 rounded transition-colors"
            title="Kaydet (Ctrl+S)"
          >
            <Save className="h-3 w-3" />
            Kaydet
          </button>
          {localStorage.getItem('draft_content') && (
            <button
              type="button"
              onClick={clearDraft}
              className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50 rounded transition-colors"
              title="Taslağı Sil"
            >
              <Trash2 className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>

      {/* Toolbar */}
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

      {/* Editor / Preview */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Editor */}
        <div className={showPreview ? "" : "lg:col-span-2"}>
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => handleChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder || "HTML içeriğinizi buraya yazın..."}
            className="min-h-[400px] w-full rounded-lg border border-slate-200 p-4 font-mono text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
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
        <strong>💡 Kısayollar:</strong> <code>Ctrl+B</code> Kalın, <code>Ctrl+I</code> İtalik, <code>Ctrl+K</code> Link, <code>Ctrl+U</code> Altı Çizili, <code>Ctrl+S</code> Kaydet • 
        Metni seçip toolbar butonlarına tıklayarak HTML etiketleri ekleyebilirsiniz. 
        Resim yüklemek için 📷, Pexels'ten aramak için 🔍, HTML'i formatlamak için ✨ butonlarını kullanın.
      </div>

      {/* Pexels Image Picker Modal */}
      {showPexelsPicker && (
        <PexelsImagePicker
          onSelect={handlePexelsSelect}
          onClose={() => setShowPexelsPicker(false)}
        />
      )}

      {/* Table Editor Modal */}
      {showTableEditor && (
        <TableEditor
          onInsert={(tableHtml) => {
            const textarea = textareaRef.current;
            if (!textarea) return;
            const start = textarea.selectionStart;
            const newText = value.substring(0, start) + '\n' + tableHtml + '\n' + value.substring(start);
            handleChange(newText);
          }}
          onClose={() => setShowTableEditor(false)}
        />
      )}
    </div>
  );
}
