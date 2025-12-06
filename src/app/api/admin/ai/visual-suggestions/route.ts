import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Suggest visual content for a topic
 * POST /api/admin/ai/visual-suggestions
 */
export async function POST(request: NextRequest) {
  try {
    const { topic, contentType } = await request.json();

    if (!topic) {
      return NextResponse.json(
        { success: false, error: 'Topic is required' },
        { status: 400 }
      );
    }

    const systemPrompt = `Sen bir içerik tasarım uzmanısın. Görevin verilen konu için hangi görsellerin eklenmesi gerektiğini önermek.

Görsel Türleri:
- infographic: Bilgi grafiği, akış şeması
- checklist: Kontrol listesi, yapılacaklar
- map: Harita, konum bilgisi
- photo: Fotoğraf, görsel
- diagram: Diyagram, şema
- chart: Grafik, istatistik

Her öneri için:
1. Görsel türü seç
2. Ne göstermeli açıkla
3. Detaylı açıklama yaz
4. Öncelik belirle (high/medium/low)

JSON formatında döndür:
{
  "suggestions": [
    {
      "type": "infographic",
      "topic": "Kısa başlık",
      "description": "Detaylı açıklama",
      "priority": "high"
    }
  ]
}`;

    const userPrompt = `Konu: ${topic}\nİçerik Türü: ${contentType || 'genel'}\n\nBu içerik için 3-5 görsel önerisi yap.`;

    console.log(`🎨 Generating visual suggestions for: ${topic}`);

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.7,
      response_format: { type: 'json_object' },
    });

    const result = JSON.parse(completion.choices[0].message.content || '{}');

    console.log(`✅ Generated ${result.suggestions?.length || 0} visual suggestions`);

    return NextResponse.json({
      success: true,
      suggestions: result.suggestions || [],
    });
  } catch (error: any) {
    console.error('Visual suggestions error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
