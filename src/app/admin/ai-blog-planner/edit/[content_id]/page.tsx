'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Content {
  id: string;
  topic_id: string;
  title: string;
  slug: string;
  content: string;
  meta_title: string;
  meta_description: string;
  cover_image_url: string | null;
  custom_images: any[];
  target_keywords: string[];
  word_count: number;
  keyword_density: number;
  main_page_links_count: number;
  version: number;
  status: string;
  scheduled_publish_date: string | null;
  auto_publish: boolean;
}

export default function ContentEditorPage() {
  const params = useParams();
  const router = useRouter();
  const content_id = params.content_id as string;

  const [content, setContent] = useState<Content | null>(null);
  const [editedContent, setEditedContent] = useState('');
  const [editedTitle, setEditedTitle] = useState('');
  const [editedMetaTitle, setEditedMetaTitle] = useState('');
  const [editedMetaDescription, setEditedMetaDescription] = useState('');
  const [aiInstructions, setAiInstructions] = useState('');
  const [isRefining, setIsRefining] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [contentViewMode, setContentViewMode] = useState<'edit' | 'html'>('edit');
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'warning'; text: string } | null>(null);

  useEffect(() => {
    loadContent();
  }, [content_id]);

  // Simple markdown to HTML converter
  const markdownToHtml = (markdown: string): string => {
    let html = markdown;
    
    // Headers
    html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');
    
    // Bold
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Italic
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
    
    // Links
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
    
    // Line breaks
    html = html.replace(/\n\n/g, '</p><p>');
    html = html.replace(/\n/g, '<br>');
    
    // Wrap in paragraphs if not already HTML
    if (!html.includes('<p>') && !html.includes('<div>')) {
      html = '<p>' + html + '</p>';
    }
    
    return html;
  };

  const calculateMetrics = (contentText: string, keywords: string[]) => {
    const words = contentText.split(/\s+/).filter(w => w.length > 0);
    const totalWords = words.length;
    
    // Calculate keyword density
    let keywordCount = 0;
    keywords.forEach(keyword => {
      const regex = new RegExp(keyword, 'gi');
      const matches = contentText.match(regex);
      keywordCount += matches ? matches.length : 0;
    });
    const density = totalWords > 0 ? (keywordCount / totalWords) * 100 : 0;
    
    // Count main page links
    const mainPageLinks = (contentText.match(/kolayseyahat\.net/g) || []).length;
    
    return {
      word_count: totalWords,
      keyword_density: parseFloat(density.toFixed(2)),
      main_page_links_count: mainPageLinks
    };
  };

  const loadContent = async () => {
    const { data, error } = await supabase
      .from('ai_blog_content')
      .select('*')
      .eq('id', content_id)
      .single();

    if (data) {
      // Calculate metrics if not already set
      const metrics = calculateMetrics(data.content, data.target_keywords || []);
      
      // Update content with calculated metrics if they're missing
      if (!data.keyword_density || !data.main_page_links_count) {
        await supabase
          .from('ai_blog_content')
          .update({
            keyword_density: metrics.keyword_density,
            main_page_links_count: metrics.main_page_links_count,
            word_count: metrics.word_count
          })
          .eq('id', content_id);
        
        data.keyword_density = metrics.keyword_density;
        data.main_page_links_count = metrics.main_page_links_count;
        data.word_count = metrics.word_count;
      }
      
      setContent(data);
      setEditedContent(data.content);
      setEditedTitle(data.title);
      setEditedMetaTitle(data.meta_title);
      setEditedMetaDescription(data.meta_description);
    }
  };

  const refineWithAI = async () => {
    if (!aiInstructions.trim()) {
      setMessage({ type: 'error', text: 'Lütfen AI talimatlarını girin' });
      return;
    }

    setIsRefining(true);
    setMessage(null);

    try {
      const response = await fetch('/api/admin/ai-blog/refine-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content_id,
          current_content: editedContent,
          instructions: aiInstructions
        })
      });

      const result = await response.json();

      if (result.success) {
        setEditedContent(result.refined_content);
        setMessage({ type: 'success', text: 'İçerik AI ile iyileştirildi!' });
        setAiInstructions('');
      } else {
        setMessage({ type: 'error', text: result.error || 'İyileştirme başarısız' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Bir hata oluştu' });
    } finally {
      setIsRefining(false);
    }
  };

  const uploadImage = async (file: File) => {
    setUploadingImage(true);

    try {
      const fileName = `content-images/${content_id}/${Date.now()}-${file.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('blog-images')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('blog-images')
        .getPublicUrl(fileName);

      const imageUrl = urlData.publicUrl;

      // Add to custom images
      const updatedImages = [...(content?.custom_images || []), {
        url: imageUrl,
        filename: file.name,
        uploaded_at: new Date().toISOString()
      }];

      await supabase
        .from('ai_blog_content')
        .update({ custom_images: updatedImages })
        .eq('id', content_id);

      setMessage({ type: 'success', text: 'Görsel yüklendi! URL kopyalandı.' });
      
      // Copy to clipboard
      navigator.clipboard.writeText(imageUrl);
      
      loadContent();
    } catch (error) {
      setMessage({ type: 'error', text: 'Görsel yüklenemedi' });
    } finally {
      setUploadingImage(false);
    }
  };

  const saveContent = async () => {
    setIsSaving(true);
    setMessage(null);

    try {
      // Calculate all metrics
      const metrics = calculateMetrics(editedContent, content?.target_keywords || []);

      const { error } = await supabase
        .from('ai_blog_content')
        .update({
          title: editedTitle,
          content: editedContent,
          meta_title: editedMetaTitle,
          meta_description: editedMetaDescription,
          word_count: metrics.word_count,
          keyword_density: metrics.keyword_density,
          main_page_links_count: metrics.main_page_links_count,
          updated_at: new Date().toISOString()
        })
        .eq('id', content_id);

      if (error) throw error;

      setMessage({ type: 'success', text: 'İçerik kaydedildi!' });
      loadContent();
    } catch (error) {
      setMessage({ type: 'error', text: 'Kaydetme başarısız' });
    } finally {
      setIsSaving(false);
    }
  };

  const approveAndSchedule = async () => {
    if (!content) return;

    const scheduledDate = prompt('Yayın tarihi (YYYY-MM-DD formatında):');
    if (!scheduledDate) return;

    try {
      const { error } = await supabase
        .from('ai_blog_content')
        .update({
          status: 'approved',
          auto_publish: true,
          scheduled_publish_date: scheduledDate
        })
        .eq('id', content_id);

      if (error) throw error;

      setMessage({ type: 'success', text: `İçerik onaylandı ve ${scheduledDate} tarihine planlandı!` });
      
      setTimeout(() => {
        router.push(`/admin/ai-blog-planner/content/${content?.topic_id}`);
      }, 2000);
    } catch (error) {
      setMessage({ type: 'error', text: 'Planlama başarısız' });
    }
  };

  if (!content) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  const keywordDensityColor = content.keyword_density > 3 ? 'text-red-600' : content.keyword_density > 2 ? 'text-yellow-600' : 'text-green-600';

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => router.back()}
          className="text-blue-600 hover:text-blue-700 mb-4 flex items-center gap-2"
        >
          ← Geri Dön
        </button>
        
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">✏️ İçerik Düzenleyici</h1>
            <p className="text-gray-600">Version {content.version} • {content.word_count} kelime</p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={saveContent}
              disabled={isSaving}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300"
            >
              {isSaving ? 'Kaydediliyor...' : '💾 Kaydet'}
            </button>
            <button
              onClick={approveAndSchedule}
              className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700"
            >
              ✅ Onayla ve Planla
            </button>
          </div>
        </div>
      </div>

      {message && (
        <div className={`mb-6 p-4 rounded-lg ${
          message.type === 'success' ? 'bg-green-50 text-green-800' : 
          message.type === 'warning' ? 'bg-yellow-50 text-yellow-800' :
          'bg-red-50 text-red-800'
        }`}>
          {message.text}
        </div>
      )}

      {/* Quality Metrics */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-sm text-gray-600">Kelime Sayısı</div>
          <div className="text-2xl font-bold text-gray-900">{content.word_count}</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-sm text-gray-600">Keyword Yoğunluğu</div>
          <div className={`text-2xl font-bold ${keywordDensityColor}`}>
            {content.keyword_density}%
          </div>
          {content.keyword_density > 2.5 && (
            <div className="text-xs text-red-600 mt-1">⚠️ Çok yüksek!</div>
          )}
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-sm text-gray-600">Ana Sayfa Linkleri</div>
          <div className="text-2xl font-bold text-blue-600">{content.main_page_links_count}</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-sm text-gray-600">Durum</div>
          <div className="text-lg font-bold text-gray-900">{content.status}</div>
        </div>
      </div>

      {/* AI Refinement */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200 p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">🤖 AI ile İyileştir</h2>
        
        <textarea
          value={aiInstructions}
          onChange={(e) => setAiInstructions(e.target.value)}
          placeholder="Örnek: 'Daha samimi bir dil kullan', 'Pratik örnekler ekle', 'Sonuç bölümünü güçlendir'"
          rows={3}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg mb-3 focus:ring-2 focus:ring-purple-500"
        />

        <button
          onClick={refineWithAI}
          disabled={isRefining || !aiInstructions.trim()}
          className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 disabled:from-gray-300 disabled:to-gray-300"
        >
          {isRefining ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              AI İyileştiriyor...
            </span>
          ) : (
            '✨ AI ile İyileştir'
          )}
        </button>
      </div>

      {/* Image Upload */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">🖼️ Görsel Yönetimi</h2>
        
        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) uploadImage(file);
          }}
          className="mb-4"
          disabled={uploadingImage}
        />

        {content.custom_images && content.custom_images.length > 0 && (
          <div className="grid grid-cols-4 gap-4 mt-4">
            {content.custom_images.map((img: any, index: number) => (
              <div key={index} className="relative group">
                <img src={img.url} alt={img.filename} className="w-full h-32 object-cover rounded-lg" />
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(img.url);
                    setMessage({ type: 'success', text: 'URL kopyalandı!' });
                  }}
                  className="absolute inset-0 bg-black bg-opacity-50 text-white opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center"
                >
                  📋 URL Kopyala
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Title & Meta */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">📝 Başlık ve Meta</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Başlık</label>
            <input
              type="text"
              value={editedTitle}
              onChange={(e) => setEditedTitle(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Meta Title ({editedMetaTitle.length} karakter {editedMetaTitle.length > 60 ? '⚠️ 60+ uzun' : '✓'})
            </label>
            <input
              type="text"
              value={editedMetaTitle}
              onChange={(e) => setEditedMetaTitle(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Meta Description ({editedMetaDescription.length}/160)
            </label>
            <textarea
              value={editedMetaDescription}
              onChange={(e) => setEditedMetaDescription(e.target.value)}
              maxLength={160}
              rows={2}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>
        </div>
      </div>

      {/* Content Editor with Tabs */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">📄 İçerik</h2>
          
          {/* Tab Buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => setContentViewMode('edit')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                contentViewMode === 'edit'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              ✏️ Düzenle
            </button>
            <button
              onClick={() => setContentViewMode('html')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                contentViewMode === 'html'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              🌐 HTML Önizleme
            </button>
          </div>
        </div>

        {/* Edit Mode */}
        {contentViewMode === 'edit' && (
          <>
            <textarea
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              rows={30}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg font-mono text-sm focus:ring-2 focus:ring-blue-500"
              placeholder="HTML veya Markdown formatında içerik..."
            />
            
            <div className="mt-4 text-sm text-gray-600">
              <p className="mb-2"><strong>Markdown Formatı:</strong></p>
              <ul className="list-disc list-inside space-y-1">
                <li># Başlık 1, ## Başlık 2, ### Başlık 3</li>
                <li>**kalın**, *italik*, [link](url)</li>
                <li>- Liste öğesi</li>
              </ul>
            </div>
          </>
        )}

        {/* HTML Preview Mode */}
        {contentViewMode === 'html' && (
          <div className="border border-gray-300 rounded-lg p-6 bg-gray-50">
            <div className="bg-white rounded-lg p-8 shadow-sm">
              <div 
                className="prose prose-lg max-w-none"
                dangerouslySetInnerHTML={{ 
                  __html: editedContent.includes('<p>') || editedContent.includes('<div>') 
                    ? editedContent 
                    : markdownToHtml(editedContent)
                }}
              />
            </div>
            
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                💡 <strong>HTML Önizleme:</strong> İçerik HTML olarak render ediliyor. 
                Markdown otomatik HTML'e çevriliyor. Düzenlemek için "Düzenle" sekmesine geçin.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
