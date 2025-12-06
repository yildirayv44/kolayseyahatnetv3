import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Generate FAQ from content using AI
 * POST /api/admin/ai/generate-faq
 */
export async function POST(request: NextRequest) {
  try {
    const { content, count = 5 } = await request.json();

    if (!content) {
      return NextResponse.json(
        { success: false, error: 'Content is required' },
        { status: 400 }
      );
    }

    const systemPrompt = `Sen bir içerik analiz uzmanısın. Görevin verilen içerikten en önemli ve sık sorulan soruları çıkarmak ve bunlara net, anlaşılır cevaplar yazmak.

Kurallar:
1. Soruları doğal dilde yaz (nasıl, neden, ne zaman, vb.)
2. Cevaplar kısa ama bilgilendirici olmalı (2-3 cümle)
3. İçerikte geçen bilgilere dayanarak cevapla
4. Pratik ve kullanışlı sorular seç
5. JSON formatında döndür

Format:
{
  "faqs": [
    {
      "question": "Soru metni?",
      "answer": "Cevap metni."
    }
  ]
}`;

    const userPrompt = `İçerik:\n${content}\n\nBu içerikten ${count} adet sıkça sorulan soru ve cevap çıkar.`;

    console.log(`🤖 Generating ${count} FAQs from content...`);

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

    console.log(`✅ Generated ${result.faqs?.length || 0} FAQs`);

    return NextResponse.json({
      success: true,
      faqs: result.faqs || [],
    });
  } catch (error: any) {
    console.error('FAQ generation error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
