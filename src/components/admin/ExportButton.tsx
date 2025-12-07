"use client";

import { useState } from "react";
import { Download, FileJson, FileText, FileCode, Copy, Check } from "lucide-react";
import { exportToJSON, exportToMarkdown, exportToText, exportToHTML, copyToClipboard, generateFilename } from "@/lib/export-utils";

interface ExportButtonProps {
  data: any;
  filename: string;
  formats?: ('json' | 'markdown' | 'text' | 'html')[];
  textContent?: string;
  htmlContent?: string;
}

export function ExportButton({ 
  data, 
  filename, 
  formats = ['json', 'markdown', 'text'],
  textContent,
  htmlContent 
}: ExportButtonProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleExport = (format: string) => {
    const fullFilename = generateFilename(filename);
    
    switch (format) {
      case 'json':
        exportToJSON(data, fullFilename);
        break;
      case 'markdown':
        exportToMarkdown(data, fullFilename);
        break;
      case 'text':
        exportToText(textContent || JSON.stringify(data, null, 2), fullFilename);
        break;
      case 'html':
        exportToHTML(htmlContent || JSON.stringify(data, null, 2), fullFilename, filename);
        break;
    }
    
    setShowMenu(false);
  };

  const handleCopy = async () => {
    const success = await copyToClipboard(textContent || JSON.stringify(data, null, 2));
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold text-sm"
      >
        <Download className="h-4 w-4" />
        Export
      </button>

      {showMenu && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowMenu(false)}
          />
          
          {/* Menu */}
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-slate-200 z-50 overflow-hidden">
            {/* Copy */}
            <button
              onClick={handleCopy}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors text-left"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-green-600">Kopyalandı!</span>
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 text-slate-600" />
                  <span className="text-sm font-medium text-slate-700">Kopyala</span>
                </>
              )}
            </button>

            <div className="border-t border-slate-200" />

            {/* Export Formats */}
            {formats.includes('json') && (
              <button
                onClick={() => handleExport('json')}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors text-left"
              >
                <FileJson className="h-4 w-4 text-blue-600" />
                <div>
                  <div className="text-sm font-medium text-slate-700">JSON</div>
                  <div className="text-xs text-slate-500">Yapılandırılmış veri</div>
                </div>
              </button>
            )}

            {formats.includes('markdown') && (
              <button
                onClick={() => handleExport('markdown')}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors text-left"
              >
                <FileText className="h-4 w-4 text-purple-600" />
                <div>
                  <div className="text-sm font-medium text-slate-700">Markdown</div>
                  <div className="text-xs text-slate-500">Okunabilir format</div>
                </div>
              </button>
            )}

            {formats.includes('text') && (
              <button
                onClick={() => handleExport('text')}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors text-left"
              >
                <FileText className="h-4 w-4 text-slate-600" />
                <div>
                  <div className="text-sm font-medium text-slate-700">Text</div>
                  <div className="text-xs text-slate-500">Düz metin</div>
                </div>
              </button>
            )}

            {formats.includes('html') && (
              <button
                onClick={() => handleExport('html')}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors text-left"
              >
                <FileCode className="h-4 w-4 text-orange-600" />
                <div>
                  <div className="text-sm font-medium text-slate-700">HTML</div>
                  <div className="text-xs text-slate-500">Web sayfası</div>
                </div>
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
