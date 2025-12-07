import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface PerformancePrediction {
  monthlyViews: { min: number; max: number };
  ctr: number;
  avgTimeOnPage: string;
  bounceRate: number;
  conversionRate: number;
  viralPotential: 'low' | 'medium' | 'high';
  competitionLevel: 'low' | 'medium' | 'high';
  recommendations: string[];
}

/**
 * Predict content performance using AI
 * POST /api/admin/ai/predict-performance
 */
export async function POST(request: NextRequest) {
  try {
    const { title, content, keywords, category } = await request.json();

    if (!title || !content) {
      return NextResponse.json(
        { success: false, error: 'Title and content are required' },
        { status: 400 }
      );
    }

    const systemPrompt = `Sen bir içerik performans analisti ve SEO uzmanısın. Görevin verilen içeriğin performansını tahmin etmek.

Analiz Kriterleri:
1. Başlık çekiciliği
2. İçerik kalitesi ve uzunluğu
3. Anahtar kelime potansiyeli
4. Konu popülaritesi
5. Rekabet seviyesi
6. Viral olma potansiyeli

Gerçekçi tahminler yap. Türkiye pazarını dikkate al.

JSON formatında döndür:
{
  "monthlyViews": { "min": 1000, "max": 3000 },
  "ctr": 3.2,
  "avgTimeOnPage": "4:30",
  "bounceRate": 45,
  "conversionRate": 1.8,
  "viralPotential": "medium",
  "competitionLevel": "medium",
  "recommendations": [
    "Başlığı daha çekici yap",
    "Daha fazla görsel ekle"
  ]
}`;

    const wordCount = content.split(/\s+/).length;
    const userPrompt = `Başlık: ${title}
Kategori: ${category || 'genel'}
Kelime Sayısı: ${wordCount}
Anahtar Kelimeler: ${keywords?.join(', ') || 'yok'}
İçerik Özeti: ${content.substring(0, 500)}...

Bu içeriğin performansını tahmin et.`;

    console.log(`📊 Predicting performance for: ${title}`);

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.5,
      response_format: { type: 'json_object' },
    });

    const prediction = JSON.parse(completion.choices[0].message.content || '{}');

    console.log(`✅ Performance predicted - Views: ${prediction.monthlyViews?.min}-${prediction.monthlyViews?.max}`);

    return NextResponse.json({
      success: true,
      prediction: prediction as PerformancePrediction,
    });
  } catch (error: any) {
    console.error('Performance prediction error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
