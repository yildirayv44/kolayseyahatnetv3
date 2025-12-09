"use client";

import { useState, useEffect } from "react";
import { Video, Loader2, ArrowLeft, Copy, Clock, Film, Music, Play, Image as ImageIcon, Download, Mic, Sparkles, Zap } from "lucide-react";
import Link from "next/link";

interface VideoScript {
  title: string;
  hook: string;
  intro: string;
  sections: VideoSection[];
  outro: string;
  cta: string;
  estimatedDuration: string;
  bRollSuggestions: string[];
  musicSuggestion: string;
}

interface VideoSection {
  timestamp: string;
  title: string;
  script: string;
  visualSuggestions: string[];
}

interface VideoStoryboard {
  title: string;
  totalDuration: number;
  totalScenes: number;
  scenes: VideoScene[];
  productionNotes: any;
  nextSteps: string[];
}

interface VideoScene {
  timestamp: string;
  description: string;
  imagePrompt: string;
  narration: string;
  duration: number;
  generatedImage?: string;
}

export default function VideoScriptPage() {
  const [content, setContent] = useState("");
  const [title, setTitle] = useState("");
  const [videoType, setVideoType] = useState<'youtube' | 'tiktok' | 'shorts'>('youtube');
  const [duration, setDuration] = useState<'short' | 'medium' | 'long'>('medium');
  const [loading, setLoading] = useState(false);
  const [script, setScript] = useState<VideoScript | null>(null);
  const [storyboard, setStoryboard] = useState<VideoStoryboard | null>(null);
  const [generatingVideo, setGeneratingVideo] = useState(false);
  const [generatingScene, setGeneratingScene] = useState<number | null>(null);
  const [voices, setVoices] = useState<any[]>([]);
  const [selectedVoice, setSelectedVoice] = useState('alloy');
  const [musicTracks, setMusicTracks] = useState<any[]>([]);
  const [selectedMusic, setSelectedMusic] = useState<string | null>(null);
  const [renderingVideo, setRenderingVideo] = useState(false);
  const [renderJob, setRenderJob] = useState<any>(null);

  const videoTypes = [
    { id: 'youtube', name: 'YouTube', emoji: '📺', desc: 'Uzun format' },
    { id: 'tiktok', name: 'TikTok', emoji: '🎵', desc: 'Kısa, dinamik' },
    { id: 'shorts', name: 'Shorts', emoji: '⚡', desc: 'Hızlı, viral' },
  ];

  const durations = [
    { id: 'short', name: 'Kısa', time: '1-3 dakika', desc: 'TikTok/Shorts' },
    { id: 'medium', name: 'Orta', time: '5-8 dakika', desc: 'YouTube' },
    { id: 'long', name: 'Uzun', time: '10-15 dakika', desc: 'Detaylı' },
  ];

  const handleGenerate = async () => {
    if (!content.trim() || !title.trim()) {
      alert("Lütfen başlık ve içerik girin!");
      return;
    }

    setLoading(true);
    setScript(null);

    try {
      const response = await fetch('/api/admin/ai/generate-video-script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, title, videoType, duration }),
      });

      const data = await response.json();
      
      if (data.success) {
        setScript(data.script);
      } else {
        alert('Script oluşturulamadı: ' + data.error);
      }
    } catch (error) {
      console.error('Video script error:', error);
      alert('Bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyAll = () => {
    if (!script) return;
    
    let fullScript = `${script.title}\n\n`;
    fullScript += `[0:00-0:15] HOOK\n${script.hook}\n\n`;
    fullScript += `[0:15-0:45] INTRO\n${script.intro}\n\n`;
    
    script.sections.forEach((section) => {
      fullScript += `[${section.timestamp}] ${section.title}\n${section.script}\n`;
      fullScript += `Visuals: ${section.visualSuggestions.join(', ')}\n\n`;
    });
    
    fullScript += `OUTRO\n${script.outro}\n\n`;
    fullScript += `CTA\n${script.cta}\n\n`;
    fullScript += `Duration: ${script.estimatedDuration}\n`;
    fullScript += `Music: ${script.musicSuggestion}\n`;
    fullScript += `B-roll: ${script.bRollSuggestions.join(', ')}`;
    
    navigator.clipboard.writeText(fullScript);
    alert('Tüm script kopyalandı!');
  };

  const handleGenerateVideo = async () => {
    if (!script) return;

    setGeneratingVideo(true);
    setStoryboard(null);

    try {
      const response = await fetch('/api/admin/ai/generate-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          script: script,
          videoType: 'slideshow',
          voiceOver: true,
          music: true,
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setStoryboard(data.storyboard);
      } else {
        alert('Video storyboard oluşturulamadı: ' + data.error);
      }
    } catch (error) {
      console.error('Video generation error:', error);
      alert('Bir hata oluştu');
    } finally {
      setGeneratingVideo(false);
    }
  };

  const handleGenerateSceneImage = async (sceneIndex: number) => {
    if (!storyboard) return;

    setGeneratingScene(sceneIndex);

    try {
      const scene = storyboard.scenes[sceneIndex];
      const response = await fetch('/api/admin/ai/generate-video', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scenePrompt: scene.imagePrompt,
          sceneDescription: scene.description,
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        // Update scene with generated image
        const updatedScenes = [...storyboard.scenes];
        updatedScenes[sceneIndex].generatedImage = data.imageUrl;
        setStoryboard({
          ...storyboard,
          scenes: updatedScenes,
        });
      } else {
        alert('Sahne görseli oluşturulamadı: ' + data.error);
      }
    } catch (error) {
      console.error('Scene image generation error:', error);
      alert('Bir hata oluştu');
    } finally {
      setGeneratingScene(null);
    }
  };

  const fetchVoices = async () => {
    try {
      const response = await fetch('/api/admin/ai/text-to-speech');
      const data = await response.json();
      if (data.success) {
        setVoices(data.voices);
      }
    } catch (error) {
      console.error('Failed to fetch voices:', error);
    }
  };

  const fetchMusicTracks = async () => {
    try {
      const response = await fetch('/api/admin/ai/music-library');
      const data = await response.json();
      if (data.success) {
        setMusicTracks(data.tracks);
      }
    } catch (error) {
      console.error('Failed to fetch music:', error);
    }
  };

  const handleRenderVideo = async () => {
    if (!storyboard) return;

    // Check if all scenes have images
    const missingImages = storyboard.scenes.filter(s => !s.generatedImage);
    if (missingImages.length > 0) {
      alert(`Lütfen önce tüm sahneler için görsel oluşturun! (${missingImages.length} sahne eksik)`);
      return;
    }

    setRenderingVideo(true);
    setRenderJob(null);

    try {
      const response = await fetch('/api/admin/ai/render-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storyboard: {
            ...storyboard,
            scenes: storyboard.scenes.map(s => ({
              ...s,
              imageUrl: s.generatedImage,
            })),
          },
          voiceId: selectedVoice,
          musicTrackId: selectedMusic,
          transitions: 'fade',
          quality: 'hd',
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setRenderJob(data.renderJob);
      } else {
        alert('Video render başlatılamadı: ' + data.error);
      }
    } catch (error) {
      console.error('Video render error:', error);
      alert('Bir hata oluştu');
    } finally {
      setRenderingVideo(false);
    }
  };

  // Load voices and music on mount
  useEffect(() => {
    fetchVoices();
    fetchMusicTracks();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-6xl mx-auto">
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
            <div className="p-3 bg-gradient-to-br from-red-600 to-pink-600 rounded-xl">
              <Video className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-slate-900">Video Script Oluşturucu</h1>
              <p className="text-slate-600 mt-1">
                Blog yazılarından profesyonel video scriptleri oluşturun
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Section */}
          <div className="space-y-4">
            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900 mb-4">Script Ayarları</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Video Başlığı *
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Japonya Vizesi Nasıl Alınır? 2024"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-3">
                    Video Tipi
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {videoTypes.map((vt) => (
                      <button
                        key={vt.id}
                        onClick={() => setVideoType(vt.id as any)}
                        className={`p-3 rounded-lg border-2 transition-all text-center ${
                          videoType === vt.id
                            ? 'border-red-600 bg-red-50'
                            : 'border-slate-200 hover:border-red-300'
                        }`}
                      >
                        <div className="text-2xl mb-1">{vt.emoji}</div>
                        <div className="font-semibold text-sm text-slate-900">{vt.name}</div>
                        <div className="text-xs text-slate-500">{vt.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-3">
                    Süre
                  </label>
                  <div className="space-y-2">
                    {durations.map((d) => (
                      <button
                        key={d.id}
                        onClick={() => setDuration(d.id as any)}
                        className={`w-full p-3 rounded-lg border-2 transition-all text-left ${
                          duration === d.id
                            ? 'border-red-600 bg-red-50'
                            : 'border-slate-200 hover:border-red-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-semibold text-slate-900">{d.name}</div>
                            <div className="text-xs text-slate-500">{d.desc}</div>
                          </div>
                          <div className="text-sm font-mono text-slate-600">{d.time}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Blog İçeriği *
                  </label>
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Blog içeriğinizi buraya yapıştırın..."
                    rows={8}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent font-mono text-sm"
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    {content.split(/\s+/).filter(w => w.length > 0).length} kelime
                  </p>
                </div>

                <button
                  onClick={handleGenerate}
                  disabled={loading || !content.trim() || !title.trim()}
                  className="w-full bg-gradient-to-r from-red-600 to-pink-600 text-white px-6 py-3 rounded-lg font-bold hover:from-red-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Oluşturuluyor...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <Video className="h-5 w-5" />
                      Script Oluştur
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Script Section */}
          <div className="space-y-4">
            {script ? (
              <>
                {/* Header Info */}
                <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
                  <h2 className="text-2xl font-bold text-slate-900 mb-4">{script.title}</h2>
                  <div className="flex items-center gap-4 text-sm text-slate-600">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {script.estimatedDuration}
                    </div>
                    <div className="flex items-center gap-1">
                      <Film className="h-4 w-4" />
                      {script.sections.length} bölüm
                    </div>
                    <div className="flex items-center gap-1">
                      <Music className="h-4 w-4" />
                      Müzik önerisi
                    </div>
                  </div>
                </div>

                {/* Hook */}
                <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-6 border-2 border-yellow-200">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="bg-yellow-600 text-white px-3 py-1 rounded-full text-xs font-bold">
                      0:00-0:15
                    </div>
                    <span className="font-bold text-yellow-900">🎣 HOOK</span>
                  </div>
                  <p className="text-slate-700">{script.hook}</p>
                </div>

                {/* Intro */}
                <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-bold">
                      0:15-0:45
                    </div>
                    <span className="font-bold text-slate-900">👋 INTRO</span>
                  </div>
                  <p className="text-slate-700">{script.intro}</p>
                </div>

                {/* Sections */}
                {script.sections.map((section, idx) => (
                  <div key={idx} className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="bg-purple-600 text-white px-3 py-1 rounded-full text-xs font-bold">
                        {section.timestamp}
                      </div>
                      <span className="font-bold text-slate-900">{section.title}</span>
                    </div>
                    <p className="text-slate-700 mb-3">{section.script}</p>
                    {section.visualSuggestions.length > 0 && (
                      <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
                        <p className="text-xs font-semibold text-purple-900 mb-1">📸 Görsel Önerileri:</p>
                        <div className="flex flex-wrap gap-2">
                          {section.visualSuggestions.map((visual, vidx) => (
                            <span key={vidx} className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
                              {visual}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {/* Outro */}
                <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="bg-green-600 text-white px-3 py-1 rounded-full text-xs font-bold">
                      OUTRO
                    </div>
                    <span className="font-bold text-slate-900">👋 Kapanış</span>
                  </div>
                  <p className="text-slate-700">{script.outro}</p>
                </div>

                {/* CTA */}
                <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-xl p-6 border-2 border-red-200">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="font-bold text-red-900">🎯 CTA</span>
                  </div>
                  <p className="text-slate-700 font-semibold">{script.cta}</p>
                </div>

                {/* Production Notes */}
                <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
                  <h3 className="font-bold text-slate-900 mb-3">🎬 Prodüksiyon Notları</h3>
                  
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs font-semibold text-slate-500 mb-1">Müzik Önerisi:</p>
                      <p className="text-sm text-slate-700">{script.musicSuggestion}</p>
                    </div>
                    
                    {script.bRollSuggestions.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-slate-500 mb-1">B-roll Önerileri:</p>
                        <div className="flex flex-wrap gap-2">
                          {script.bRollSuggestions.map((broll, idx) => (
                            <span key={idx} className="text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded">
                              {broll}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={handleCopyAll}
                    className="bg-slate-900 text-white px-6 py-3 rounded-lg font-bold hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
                  >
                    <Copy className="h-5 w-5" />
                    Script'i Kopyala
                  </button>
                  <button
                    onClick={handleGenerateVideo}
                    disabled={generatingVideo}
                    className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-3 rounded-lg font-bold hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                  >
                    {generatingVideo ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Oluşturuluyor...
                      </>
                    ) : (
                      <>
                        <Play className="h-5 w-5" />
                        Video Storyboard Oluştur
                      </>
                    )}
                  </button>
                </div>

                {/* Video Storyboard */}
                {storyboard && (
                  <div className="mt-6 space-y-4">
                    <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-6 border-2 border-purple-200">
                      <h3 className="text-2xl font-bold text-purple-900 mb-4">🎬 Video Storyboard</h3>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-purple-600 font-semibold">Toplam Süre</p>
                          <p className="text-purple-900 text-lg font-bold">{Math.floor(storyboard.totalDuration / 60)}:{(storyboard.totalDuration % 60).toString().padStart(2, '0')}</p>
                        </div>
                        <div>
                          <p className="text-purple-600 font-semibold">Sahne Sayısı</p>
                          <p className="text-purple-900 text-lg font-bold">{storyboard.totalScenes}</p>
                        </div>
                        <div>
                          <p className="text-purple-600 font-semibold">Format</p>
                          <p className="text-purple-900 text-lg font-bold">16:9 HD</p>
                        </div>
                      </div>
                    </div>

                    {/* Voice & Music Selection */}
                    <div className="grid grid-cols-2 gap-4">
                      {/* Voice Selector */}
                      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
                        <div className="flex items-center gap-2 mb-4">
                          <Mic className="h-5 w-5 text-blue-600" />
                          <h4 className="font-bold text-slate-900">Seslendirme</h4>
                        </div>
                        <select
                          value={selectedVoice}
                          onChange={(e) => setSelectedVoice(e.target.value)}
                          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          {voices.map((voice) => (
                            <option key={voice.id} value={voice.id}>
                              {voice.name} - {voice.description}
                            </option>
                          ))}
                        </select>
                        <p className="text-xs text-slate-500 mt-2">
                          OpenAI Text-to-Speech ile otomatik seslendirme
                        </p>
                      </div>

                      {/* Music Selector */}
                      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
                        <div className="flex items-center gap-2 mb-4">
                          <Music className="h-5 w-5 text-purple-600" />
                          <h4 className="font-bold text-slate-900">Fon Müziği</h4>
                        </div>
                        <select
                          value={selectedMusic || ''}
                          onChange={(e) => setSelectedMusic(e.target.value || null)}
                          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        >
                          <option value="">Müzik Yok</option>
                          {musicTracks.map((track) => (
                            <option key={track.id} value={track.id}>
                              {track.title} - {track.mood} ({Math.floor(track.duration / 60)}:{(track.duration % 60).toString().padStart(2, '0')})
                            </option>
                          ))}
                        </select>
                        <p className="text-xs text-slate-500 mt-2">
                          Telif hakkı olmayan müzik kütüphanesi
                        </p>
                      </div>
                    </div>

                    {/* Scenes */}
                    {storyboard.scenes.map((scene, idx) => (
                      <div key={idx} className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <div className="bg-indigo-600 text-white px-3 py-1 rounded-full text-xs font-bold">
                                Sahne {idx + 1}
                              </div>
                              <span className="text-sm text-slate-500">{scene.timestamp}</span>
                              <span className="text-sm text-slate-500">• {scene.duration}s</span>
                            </div>
                            <h4 className="font-bold text-slate-900 text-lg">{scene.description}</h4>
                          </div>
                          <button
                            onClick={() => handleGenerateSceneImage(idx)}
                            disabled={generatingScene === idx || !!scene.generatedImage}
                            className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:from-blue-700 hover:to-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                          >
                            {generatingScene === idx ? (
                              <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Üretiliyor...
                              </>
                            ) : scene.generatedImage ? (
                              <>
                                <ImageIcon className="h-4 w-4" />
                                Oluşturuldu ✓
                              </>
                            ) : (
                              <>
                                <ImageIcon className="h-4 w-4" />
                                Görsel Üret
                              </>
                            )}
                          </button>
                        </div>

                        {scene.generatedImage && (
                          <div className="mb-4 rounded-lg overflow-hidden border-2 border-indigo-200">
                            <img
                              src={scene.generatedImage}
                              alt={scene.description}
                              className="w-full h-auto"
                            />
                          </div>
                        )}

                        <div className="space-y-3">
                          <div>
                            <p className="text-xs font-semibold text-slate-500 mb-1">🎨 Görsel Prompt:</p>
                            <p className="text-sm text-slate-700 bg-slate-50 p-3 rounded-lg">{scene.imagePrompt}</p>
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-slate-500 mb-1">🎙️ Narrasyon:</p>
                            <p className="text-sm text-slate-700">{scene.narration}</p>
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* Next Steps */}
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border-2 border-green-200">
                      <h4 className="font-bold text-green-900 mb-3">✅ Sonraki Adımlar</h4>
                      <ul className="space-y-2">
                        {storyboard.nextSteps.map((step, idx) => (
                          <li key={idx} className="text-sm text-green-800 flex items-start gap-2">
                            <span className="text-green-600 font-bold">{idx + 1}.</span>
                            {step}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Production Notes */}
                    <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
                      <h4 className="font-bold text-slate-900 mb-3">📝 Prodüksiyon Notları</h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-slate-500 font-semibold mb-1">Seslendirme:</p>
                          <p className="text-slate-700">{storyboard.productionNotes.voiceOver}</p>
                        </div>
                        <div>
                          <p className="text-slate-500 font-semibold mb-1">Müzik:</p>
                          <p className="text-slate-700">{storyboard.productionNotes.music}</p>
                        </div>
                      </div>
                    </div>

                    {/* Render Video Button */}
                    <button
                      onClick={handleRenderVideo}
                      disabled={renderingVideo || storyboard.scenes.some(s => !s.generatedImage)}
                      className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-4 rounded-lg font-bold hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg flex items-center justify-center gap-3"
                    >
                      {renderingVideo ? (
                        <>
                          <Loader2 className="h-6 w-6 animate-spin" />
                          Video Hazırlanıyor...
                        </>
                      ) : (
                        <>
                          <Zap className="h-6 w-6" />
                          <div className="text-left">
                            <div>Video Oluştur (Remotion)</div>
                            <div className="text-xs font-normal opacity-90">
                              Tüm sahneler + Seslendirme + Müzik + Geçişler
                            </div>
                          </div>
                        </>
                      )}
                    </button>

                    {/* Render Job Result */}
                    {renderJob && (
                      <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border-2 border-green-200">
                        <div className="flex items-center gap-3 mb-4">
                          <Sparkles className="h-6 w-6 text-green-600" />
                          <h4 className="font-bold text-green-900 text-lg">Video Render İşlemi Başlatıldı!</h4>
                        </div>
                        
                        <div className="space-y-3 mb-4">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-green-700 font-semibold">Durum:</span>
                            <span className="bg-green-600 text-white px-3 py-1 rounded-full text-xs font-bold">
                              {renderJob.status.toUpperCase()}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-green-700 font-semibold">Sahne Sayısı:</span>
                            <span className="text-green-900 font-bold">{renderJob.scenes}</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-green-700 font-semibold">Tahmini Süre:</span>
                            <span className="text-green-900 font-bold">{Math.floor(renderJob.estimatedTime / 60)}:{(renderJob.estimatedTime % 60).toString().padStart(2, '0')}</span>
                          </div>
                        </div>

                        <div className="bg-white rounded-lg p-4 mb-4">
                          <h5 className="font-bold text-slate-900 mb-2 text-sm">✅ Tamamlanan Adımlar:</h5>
                          <ul className="space-y-1">
                            {renderJob.nextSteps.slice(0, 4).map((step: string, idx: number) => (
                              <li key={idx} className="text-xs text-slate-700 flex items-start gap-2">
                                <span className="text-green-600">✓</span>
                                {step}
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                          <h5 className="font-bold text-yellow-900 mb-2 text-sm flex items-center gap-2">
                            <Sparkles className="h-4 w-4" />
                            Prodüksiyon Notu
                          </h5>
                          <p className="text-xs text-yellow-800 mb-3">
                            {renderJob.productionNote}
                          </p>
                          <div className="space-y-1">
                            <p className="text-xs font-semibold text-yellow-900">Remotion Kurulumu:</p>
                            {renderJob.remotionSetup.required.map((req: string, idx: number) => (
                              <p key={idx} className="text-xs text-yellow-800 ml-2">• {req}</p>
                            ))}
                            <a 
                              href={renderJob.remotionSetup.documentation}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-blue-600 hover:text-blue-800 underline block mt-2"
                            >
                              📚 Remotion Dokümantasyonu →
                            </a>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </>
            ) : (
              <div className="bg-white rounded-xl p-12 border border-slate-200 shadow-sm text-center">
                <div className="bg-gradient-to-br from-red-100 to-pink-100 rounded-full w-32 h-32 mx-auto mb-4 flex items-center justify-center">
                  <Video className="h-16 w-16 text-red-600" />
                </div>
                <p className="text-slate-500 mb-2">
                  Henüz script oluşturulmadı
                </p>
                <p className="text-sm text-slate-400">
                  İçerik girin ve script oluşturun
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
