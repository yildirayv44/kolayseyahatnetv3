"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Command, X } from "lucide-react";

export function KeyboardShortcuts() {
  const router = useRouter();
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + K - Show shortcuts help
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setShowHelp(prev => !prev);
        return;
      }

      // Only process shortcuts if not in input/textarea
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA'
      ) {
        return;
      }

      // Cmd/Ctrl + shortcuts
      if (e.metaKey || e.ctrlKey) {
        switch (e.key) {
          case 'd':
            e.preventDefault();
            router.push('/admin');
            break;
          case 'a':
            e.preventDefault();
            router.push('/admin/ai-tools');
            break;
          case 'b':
            e.preventDefault();
            router.push('/admin/bloglar');
            break;
          case 'u':
            e.preventDefault();
            router.push('/admin/ulkeler');
            break;
          case 's':
            e.preventDefault();
            router.push('/admin/ayarlar');
            break;
        }
      }

      // Alt + Number shortcuts for AI Tools
      if (e.altKey) {
        switch (e.key) {
          case '1':
            e.preventDefault();
            router.push('/admin/ai-tools/optimizer');
            break;
          case '2':
            e.preventDefault();
            router.push('/admin/ai-tools/image-generator');
            break;
          case '3':
            e.preventDefault();
            router.push('/admin/ai-tools/performance');
            break;
          case '4':
            e.preventDefault();
            router.push('/admin/ai-tools/repurpose');
            break;
          case '5':
            e.preventDefault();
            router.push('/admin/ai-tools/video-script');
            break;
          case '6':
            e.preventDefault();
            router.push('/admin/ai-tools/scheduler');
            break;
          case '7':
            e.preventDefault();
            router.push('/admin/ai-tools/intent');
            break;
        }
      }

      // ESC - Close modals/help
      if (e.key === 'Escape') {
        setShowHelp(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [router]);

  if (!showHelp) {
    return (
      <button
        onClick={() => setShowHelp(true)}
        className="fixed bottom-4 right-4 bg-slate-900 text-white p-3 rounded-full shadow-lg hover:bg-slate-800 transition-all z-40"
        title="Klavye Kısayolları (⌘K)"
      >
        <Command className="h-5 w-5" />
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-200 p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Klavye Kısayolları</h2>
            <p className="text-sm text-slate-600 mt-1">Hızlı erişim için kısayollar</p>
          </div>
          <button
            onClick={() => setShowHelp(false)}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Shortcuts */}
        <div className="p-6 space-y-6">
          {/* General */}
          <div>
            <h3 className="text-lg font-bold text-slate-900 mb-3">Genel</h3>
            <div className="space-y-2">
              <ShortcutItem keys={['⌘', 'K']} description="Bu menüyü aç/kapat" />
              <ShortcutItem keys={['ESC']} description="Modali kapat" />
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="text-lg font-bold text-slate-900 mb-3">Navigasyon</h3>
            <div className="space-y-2">
              <ShortcutItem keys={['⌘', 'D']} description="Dashboard" />
              <ShortcutItem keys={['⌘', 'A']} description="AI Araçlar" />
              <ShortcutItem keys={['⌘', 'B']} description="Bloglar" />
              <ShortcutItem keys={['⌘', 'U']} description="Ülkeler" />
              <ShortcutItem keys={['⌘', 'S']} description="Ayarlar" />
            </div>
          </div>

          {/* AI Tools */}
          <div>
            <h3 className="text-lg font-bold text-slate-900 mb-3">AI Araçlar</h3>
            <div className="space-y-2">
              <ShortcutItem keys={['Alt', '1']} description="Content Optimizer" />
              <ShortcutItem keys={['Alt', '2']} description="DALL-E Generator" />
              <ShortcutItem keys={['Alt', '3']} description="Performance Predictor" />
              <ShortcutItem keys={['Alt', '4']} description="Content Repurposing" />
              <ShortcutItem keys={['Alt', '5']} description="Video Script" />
              <ShortcutItem keys={['Alt', '6']} description="Update Scheduler" />
              <ShortcutItem keys={['Alt', '7']} description="Intent Analyzer" />
            </div>
          </div>

          {/* Tips */}
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <p className="text-sm text-blue-900">
              <strong>💡 İpucu:</strong> Kısayollar input/textarea içinde çalışmaz.
              ⌘ = Cmd (Mac) veya Ctrl (Windows/Linux)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function ShortcutItem({ keys, description }: { keys: string[]; description: string }) {
  return (
    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
      <span className="text-sm text-slate-700">{description}</span>
      <div className="flex items-center gap-1">
        {keys.map((key, idx) => (
          <kbd
            key={idx}
            className="px-2 py-1 bg-white border border-slate-300 rounded text-xs font-mono font-bold text-slate-900 shadow-sm"
          >
            {key}
          </kbd>
        ))}
      </div>
    </div>
  );
}
