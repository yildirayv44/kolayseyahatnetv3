import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export type UserIntent = 'informational' | 'navigational' | 'transactional' | 'commercial';

export interface IntentAnalysis {
  primaryIntent: UserIntent;
  confidence: number;
  secondaryIntent?: UserIntent;
  userJourneyStage: 'awareness' | 'consideration' | 'decision';
  recommendedContentStructure: string[];
  recommendedCTA: string[];
  keywords: string[];
  optimizationTips: string[];
}

/**
 * Analyze user intent from topic/keywords
 * POST /api/admin/ai/analyze-intent
 */
export async function POST(request: NextRequest) {
  try {
    const { topic, keywords = [] } = await request.json();

    if (!topic) {
      return NextResponse.json(
        { success: false, error: 'Topic is required' },
        { status: 400 }
      );
    }

    const systemPrompt = `Sen bir SEO ve kullanıcı davranışı uzmanısın. Görevin kullanıcı niyetini (user intent) analiz etmek.

Kullanıcı Niyet Türleri:
1. INFORMATIONAL: Bilgi arıyor ("nasıl", "nedir", "ne zaman")
2. NAVIGATIONAL: Belirli bir sayfaya gitmek istiyor (marka, yer adı)
3. TRANSACTIONAL: İşlem yapmak istiyor ("başvuru", "satın al", "rezervasyon")
4. COMMERCIAL: Karşılaştırma yapıyor ("en iyi", "vs", "fiyat")

Kullanıcı Yolculuğu:
- AWARENESS: Problemi yeni fark etti, bilgi topluyor
- CONSIDERATION: Seçenekleri değerlendiriyor
- DECISION: Karar vermeye hazır

Analiz Kriterleri:
- Anahtar kelimeler
- Soru kalıpları
- İşlem kelimeleri
- Karşılaştırma ifadeleri

JSON formatında döndür:
{
  "primaryIntent": "informational",
  "confidence": 85,
  "secondaryIntent": "transactional",
  "userJourneyStage": "awareness",
  "recommendedContentStructure": [
    "Giriş ve tanım",
    "Adım adım süreç",
    "SSS bölümü"
  ],
  "recommendedCTA": [
    "Daha fazla bilgi edinin",
    "Ücretsiz danışmanlık alın"
  ],
  "keywords": ["japonya vizesi", "başvuru süreci"],
  "optimizationTips": [
    "How-to formatında yazın",
    "Görsel rehber ekleyin"
  ]
}`;

    const userPrompt = `Konu: ${topic}
Anahtar Kelimeler: ${keywords.join(', ')}

Bu konunun kullanıcı niyetini ve yolculuk aşamasını analiz et. İçerik yapısı ve CTA önerileri sun.`;

    console.log(`🎯 Analyzing user intent for: ${topic}`);

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.3,
      response_format: { type: 'json_object' },
    });

    const analysis = JSON.parse(completion.choices[0].message.content || '{}');

    console.log(`✅ Intent analyzed - Primary: ${analysis.primaryIntent} (${analysis.confidence}%)`);

    return NextResponse.json({
      success: true,
      analysis: analysis as IntentAnalysis,
    });
  } catch (error: any) {
    console.error('Intent analysis error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
