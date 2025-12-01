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
} from "lucide-react";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
  const [showPreview, setShowPreview] = useState(false);
  const [uploading, setUploading] = useState(false);
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
            onChange={(e) => onChange(e.target.value)}
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
      <div className="text-xs text-slate-500">
        <strong>İpucu:</strong> Metni seçip butonlara tıklayarak HTML etiketleri ekleyebilirsiniz.
        Resim yüklemek için resim butonuna tıklayın.
      </div>
    </div>
  );
}
