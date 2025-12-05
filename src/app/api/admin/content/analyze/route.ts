import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Analyze content quality
 * POST /api/admin/content/analyze
 */
export async function POST(request: NextRequest) {
  try {
    const { title, content } = await request.json();

    if (!title || !content) {
      return NextResponse.json(
        { success: false, error: 'Title and content are required' },
        { status: 400 }
      );
    }

    console.log(`📊 Analyzing content quality for: "${title}"`);

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `Sen bir içerik kalite analiz uzmanısın. Verilen blog içeriğini detaylı analiz et.

Analiz kriterleri:
1. Yazım hataları
2. Gramer hataları
3. Tutarlılık
4. Bilgi eksiği
5. Gereksiz tekrarlar
6. Cümle yapısı
7. Akıcılık
8. Profesyonellik
9. Doğruluk
10. Güncellik

JSON formatında döndür:
{
  "overall_score": 0-100,
  "grammar": {
    "score": 0-100,
    "errors": [
      {"text": "hatalı metin", "correction": "düzeltme", "line": 5}
    ],
    "status": "excellent/good/needs_improvement/poor"
  },
  "spelling": {
    "score": 0-100,
    "errors": [
      {"text": "yanlış kelime", "correction": "doğru kelime", "line": 10}
    ],
    "status": "excellent/good/needs_improvement/poor"
  },
  "consistency": {
    "score": 0-100,
    "issues": ["tutarsızlık 1", "tutarsızlık 2"],
    "status": "excellent/good/needs_improvement/poor"
  },
  "completeness": {
    "score": 0-100,
    "missing": ["eksik bilgi 1", "eksik bilgi 2"],
    "status": "excellent/good/needs_improvement/poor"
  },
  "repetition": {
    "score": 0-100,
    "repeated_phrases": [
      {"phrase": "tekrar eden ifade", "count": 5}
    ],
    "status": "excellent/good/needs_improvement/poor"
  },
  "readability": {
    "score": 0-100,
    "issues": ["okunabilirlik sorunu 1"],
    "status": "excellent/good/needs_improvement/poor"
  },
  "professionalism": {
    "score": 0-100,
    "issues": ["profesyonellik sorunu 1"],
    "status": "excellent/good/needs_improvement/poor"
  },
  "suggestions": [
    "İyileştirme önerisi 1",
    "İyileştirme önerisi 2",
    "İyileştirme önerisi 3"
  ],
  "strengths": [
    "Güçlü yön 1",
    "Güçlü yön 2"
  ]
}`,
        },
        {
          role: 'user',
          content: `Başlık: ${title}\n\nİçerik:\n${content}`,
        },
      ],
      temperature: 0.3,
      max_tokens: 2000,
      response_format: { type: 'json_object' },
    });

    const analysisText = completion.choices[0]?.message?.content || '{}';
    const analysis = JSON.parse(analysisText);

    console.log(`✅ Quality Score: ${analysis.overall_score}/100`);

    return NextResponse.json({
      success: true,
      ...analysis,
    });
  } catch (error: any) {
    console.error('Content analysis error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
