import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface VideoScript {
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

export interface VideoSection {
  timestamp: string;
  title: string;
  script: string;
  visualSuggestions: string[];
}

/**
 * Generate video script from blog content
 * POST /api/admin/ai/generate-video-script
 */
export async function POST(request: NextRequest) {
  try {
    const { content, title, videoType = 'youtube', duration = 'medium' } = await request.json();

    if (!content || !title) {
      return NextResponse.json(
        { success: false, error: 'Content and title are required' },
        { status: 400 }
      );
    }

    const durationGuide: { [key: string]: string } = {
      short: '1-3 dakika (TikTok/Shorts)',
      medium: '5-8 dakika (YouTube)',
      long: '10-15 dakika (YouTube detaylı)',
    };

    const systemPrompt = `Sen bir profesyonel video script yazarısın. Görevin blog içeriğini video script'ine dönüştürmek.

Video Tipi: ${videoType}
Hedef Süre: ${durationGuide[duration] || durationGuide.medium}

Script Yapısı:
1. HOOK (0:00-0:15): Dikkat çekici açılış
2. INTRO (0:15-0:45): Kendini tanıt, video konusunu açıkla
3. ANA İÇERİK: Bölümlere ayır, timestamp'lerle
4. OUTRO (son 30 saniye): Özet
5. CTA: Beğen, abone ol, yorum yap

Kurallar:
- Konuşma dilinde yaz (doğal, samimi)
- Kısa cümleler kullan
- Görsel önerileri ekle (B-roll)
- Müzik önerisi yap
- Timestamp'leri belirt
- Tahmini süre hesapla

JSON formatında döndür:
{
  "title": "Video başlığı",
  "hook": "İlk 15 saniye script",
  "intro": "Giriş script",
  "sections": [
    {
      "timestamp": "1:00",
      "title": "Bölüm başlığı",
      "script": "Bölüm script",
      "visualSuggestions": ["Görsel 1", "Görsel 2"]
    }
  ],
  "outro": "Kapanış script",
  "cta": "CTA metni",
  "estimatedDuration": "7:30",
  "bRollSuggestions": ["B-roll 1", "B-roll 2"],
  "musicSuggestion": "Müzik önerisi"
}`;

    const userPrompt = `Başlık: ${title}\n\nİçerik:\n${content.substring(0, 2500)}\n\nBu içerikten ${videoType} için video script'i oluştur.`;

    console.log(`🎬 Generating ${videoType} script (${duration})...`);

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.8,
      response_format: { type: 'json_object' },
    });

    const script = JSON.parse(completion.choices[0].message.content || '{}');

    console.log(`✅ Video script generated - Duration: ${script.estimatedDuration}`);

    return NextResponse.json({
      success: true,
      script: script as VideoScript,
    });
  } catch (error: any) {
    console.error('Video script generation error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
