"use client";

import { useState, useEffect } from "react";
import { Layers, Loader2, ArrowLeft, CheckCircle, XCircle, Clock, Play, Download } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { ExportButton } from "@/components/admin/ExportButton";

interface Blog {
  id: string;
  title: string;
  contents: string;
  updated_at: string;
}

interface BatchResult {
  blogId: string;
  title: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  result?: any;
  error?: string;
}

type BatchOperation = 'optimize' | 'predict' | 'intent' | 'schedule';

export default function BatchOperationsPage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [selectedBlogs, setSelectedBlogs] = useState<Set<string>>(new Set());
  const [operation, setOperation] = useState<BatchOperation>('optimize');
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [results, setResults] = useState<BatchResult[]>([]);

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('blogs')
        .select('id, title, contents, updated_at')
        .order('updated_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setBlogs(data || []);
    } catch (error) {
      console.error('Fetch blogs error:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleBlog = (blogId: string) => {
    const newSelected = new Set(selectedBlogs);
    if (newSelected.has(blogId)) {
      newSelected.delete(blogId);
    } else {
      newSelected.add(blogId);
    }
    setSelectedBlogs(newSelected);
  };

  const selectAll = () => {
    if (selectedBlogs.size === blogs.length) {
      setSelectedBlogs(new Set());
    } else {
      setSelectedBlogs(new Set(blogs.map(b => b.id)));
    }
  };

  const processBatch = async () => {
    if (selectedBlogs.size === 0) {
      alert('Lütfen en az bir blog seçin!');
      return;
    }

    setProcessing(true);
    const selectedBlogsList = blogs.filter(b => selectedBlogs.has(b.id));
    
    // Initialize results
    const initialResults: BatchResult[] = selectedBlogsList.map(blog => ({
      blogId: blog.id,
      title: blog.title,
      status: 'pending',
    }));
    setResults(initialResults);

    // Process each blog
    for (let i = 0; i < selectedBlogsList.length; i++) {
      const blog = selectedBlogsList[i];
      
      // Update status to processing
      setResults(prev => prev.map(r => 
        r.blogId === blog.id ? { ...r, status: 'processing' } : r
      ));

      try {
        let result;
        
        switch (operation) {
          case 'optimize':
            result = await optimizeContent(blog);
            break;
          case 'predict':
            result = await predictPerformance(blog);
            break;
          case 'intent':
            result = await analyzeIntent(blog);
            break;
          case 'schedule':
            result = await scheduleUpdate(blog);
            break;
        }

        // Update with result
        setResults(prev => prev.map(r => 
          r.blogId === blog.id ? { ...r, status: 'completed', result } : r
        ));
      } catch (error: any) {
        // Update with error
        setResults(prev => prev.map(r => 
          r.blogId === blog.id ? { ...r, status: 'error', error: error.message } : r
        ));
      }

      // Small delay between requests
      if (i < selectedBlogsList.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    setProcessing(false);
  };

  const optimizeContent = async (blog: Blog) => {
    const response = await fetch('/api/admin/ai/optimize-content', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: blog.contents,
        title: blog.title,
      }),
    });

    const data = await response.json();
    if (!data.success) throw new Error(data.error);
    return data.analysis;
  };

  const predictPerformance = async (blog: Blog) => {
    const response = await fetch('/api/admin/ai/predict-performance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: blog.title,
        content: blog.contents.substring(0, 1000),
      }),
    });

    const data = await response.json();
    if (!data.success) throw new Error(data.error);
    return data.prediction;
  };

  const analyzeIntent = async (blog: Blog) => {
    const response = await fetch('/api/admin/ai/analyze-intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        topic: blog.title,
      }),
    });

    const data = await response.json();
    if (!data.success) throw new Error(data.error);
    return data.analysis;
  };

  const scheduleUpdate = async (blog: Blog) => {
    const response = await fetch('/api/admin/ai/schedule-updates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contentId: blog.id,
        lastUpdated: blog.updated_at,
        content: blog.contents,
      }),
    });

    const data = await response.json();
    if (!data.success) throw new Error(data.error);
    return data.schedule;
  };

  const operations = [
    { id: 'optimize', name: 'İçerik Optimizasyonu', desc: 'SEO ve okunabilirlik analizi' },
    { id: 'predict', name: 'Performans Tahmini', desc: 'Trafik ve engagement tahmini' },
    { id: 'intent', name: 'Niyet Analizi', desc: 'Kullanıcı niyeti analizi' },
    { id: 'schedule', name: 'Güncelleme Planı', desc: 'Güncelleme önceliği belirleme' },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'error': return <XCircle className="h-5 w-5 text-red-600" />;
      case 'processing': return <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />;
      default: return <Clock className="h-5 w-5 text-slate-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-50 border-green-200';
      case 'error': return 'bg-red-50 border-red-200';
      case 'processing': return 'bg-blue-50 border-blue-200';
      default: return 'bg-slate-50 border-slate-200';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/admin/ai-tools"
            className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            AI Araçlar
          </Link>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-slate-600 to-slate-800 rounded-xl">
              <Layers className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-slate-900">Toplu İşlemler</h1>
              <p className="text-slate-600 mt-1">
                Birden fazla blog için AI analizi yapın
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Selection Panel */}
          <div className="lg:col-span-2 space-y-4">
            {/* Operation Selection */}
            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900 mb-4">İşlem Seçin</h2>
              <div className="grid grid-cols-2 gap-3">
                {operations.map((op) => (
                  <button
                    key={op.id}
                    onClick={() => setOperation(op.id as BatchOperation)}
                    className={`p-4 rounded-lg border-2 transition-all text-left ${
                      operation === op.id
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-slate-200 hover:border-blue-300'
                    }`}
                  >
                    <div className="font-semibold text-slate-900">{op.name}</div>
                    <div className="text-xs text-slate-600 mt-1">{op.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Blog Selection */}
            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-slate-900">Blog Seçimi</h2>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-600">
                    {selectedBlogs.size} / {blogs.length} seçili
                  </span>
                  <button
                    onClick={selectAll}
                    className="text-sm text-blue-600 hover:text-blue-700 font-semibold"
                  >
                    {selectedBlogs.size === blogs.length ? 'Hiçbiri' : 'Tümü'}
                  </button>
                </div>
              </div>

              {loading ? (
                <div className="text-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-slate-400 mx-auto mb-2" />
                  <p className="text-sm text-slate-500">Bloglar yükleniyor...</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {blogs.map((blog) => (
                    <label
                      key={blog.id}
                      className="flex items-start gap-3 p-3 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={selectedBlogs.has(blog.id)}
                        onChange={() => toggleBlog(blog.id)}
                        className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-slate-900 truncate">
                          {blog.title}
                        </div>
                        <div className="text-xs text-slate-500 mt-1">
                          Son güncelleme: {new Date(blog.updated_at).toLocaleDateString('tr-TR')}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Action Button */}
            <button
              onClick={processBatch}
              disabled={processing || selectedBlogs.size === 0}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-4 rounded-lg font-bold hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
            >
              {processing ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  İşleniyor... ({results.filter(r => r.status === 'completed').length}/{selectedBlogs.size})
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <Play className="h-5 w-5" />
                  Toplu İşlemi Başlat ({selectedBlogs.size} blog)
                </span>
              )}
            </button>
          </div>

          {/* Results Panel */}
          <div className="space-y-4">
            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-slate-900">Sonuçlar</h2>
                {results.length > 0 && (
                  <ExportButton
                    data={results}
                    filename="batch-results"
                    formats={['json', 'markdown', 'text']}
                  />
                )}
              </div>

              {results.length === 0 ? (
                <div className="text-center py-8">
                  <Layers className="h-12 w-12 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm text-slate-500">
                    Henüz işlem yapılmadı
                  </p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[600px] overflow-y-auto">
                  {results.map((result) => (
                    <div
                      key={result.blogId}
                      className={`p-4 rounded-lg border ${getStatusColor(result.status)}`}
                    >
                      <div className="flex items-start gap-3">
                        {getStatusIcon(result.status)}
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-slate-900 text-sm truncate">
                            {result.title}
                          </div>
                          {result.status === 'completed' && result.result && (
                            <div className="mt-2 text-xs text-slate-600">
                              {operation === 'optimize' && (
                                <div>
                                  Skor: {result.result.overallScore}/100
                                </div>
                              )}
                              {operation === 'predict' && (
                                <div>
                                  Tahmini: {result.result.monthlyViews?.min}-{result.result.monthlyViews?.max} görüntülenme
                                </div>
                              )}
                              {operation === 'intent' && (
                                <div>
                                  Niyet: {result.result.primaryIntent} (%{result.result.confidence})
                                </div>
                              )}
                              {operation === 'schedule' && (
                                <div>
                                  Öncelik: {result.result.priority}
                                </div>
                              )}
                            </div>
                          )}
                          {result.status === 'error' && (
                            <div className="mt-1 text-xs text-red-600">
                              {result.error}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Stats */}
            {results.length > 0 && (
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-6 text-white">
                <h3 className="font-bold mb-3">İstatistikler</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Toplam:</span>
                    <span className="font-bold">{results.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tamamlandı:</span>
                    <span className="font-bold">{results.filter(r => r.status === 'completed').length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Hata:</span>
                    <span className="font-bold">{results.filter(r => r.status === 'error').length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Bekliyor:</span>
                    <span className="font-bold">{results.filter(r => r.status === 'pending').length}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
