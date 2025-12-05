import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Analyze and optimize SEO for blog content
 * POST /api/admin/content/optimize-seo
 */
export async function POST(request: NextRequest) {
  try {
    const { title, description, content, meta_title, meta_description } = await request.json();

    if (!title || !content) {
      return NextResponse.json(
        { success: false, error: 'Title and content are required' },
        { status: 400 }
      );
    }

    console.log(`🔍 Analyzing SEO for: "${title}"`);

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `Sen bir SEO uzmanısın. Verilen blog içeriğini analiz et ve SEO önerileri sun.

Analiz et:
1. Meta title (50-60 karakter ideal)
2. Meta description (150-160 karakter ideal)
3. Başlık yapısı (H1, H2, H3)
4. Anahtar kelime yoğunluğu
5. İçerik uzunluğu (minimum 1000 kelime)
6. Okunabilirlik
7. İç bağlantı fırsatları
8. Eksik bilgiler

JSON formatında döndür:
{
  "score": 0-100,
  "meta_title": {
    "current": "mevcut",
    "length": 55,
    "status": "good/warning/error",
    "suggestion": "öneri"
  },
  "meta_description": {
    "current": "mevcut",
    "length": 155,
    "status": "good/warning/error",
    "suggestion": "öneri"
  },
  "headings": {
    "h1_count": 1,
    "h2_count": 5,
    "h3_count": 8,
    "status": "good/warning/error",
    "suggestion": "öneri"
  },
  "keywords": {
    "primary": "ana anahtar kelime",
    "density": 2.5,
    "status": "good/warning/error",
    "suggestion": "öneri"
  },
  "content": {
    "word_count": 1200,
    "reading_time": 6,
    "status": "good/warning/error",
    "suggestion": "öneri"
  },
  "readability": {
    "score": 75,
    "status": "good/warning/error",
    "suggestion": "öneri"
  },
  "improvements": [
    "İyileştirme önerisi 1",
    "İyileştirme önerisi 2"
  ]
}`,
        },
        {
          role: 'user',
          content: `Başlık: ${title}
Meta Title: ${meta_title || 'Yok'}
Meta Description: ${meta_description || 'Yok'}
Açıklama: ${description || 'Yok'}
İçerik: ${content.substring(0, 3000)}...`,
        },
      ],
      temperature: 0.3,
      max_tokens: 1500,
      response_format: { type: 'json_object' },
    });

    const analysisText = completion.choices[0]?.message?.content || '{}';
    const analysis = JSON.parse(analysisText);

    console.log(`✅ SEO Score: ${analysis.score}/100`);

    return NextResponse.json({
      success: true,
      ...analysis,
    });
  } catch (error: any) {
    console.error('SEO optimization error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
