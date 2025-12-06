import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Generate image alt text and caption using AI
 * POST /api/admin/ai/image-description
 */
export async function POST(request: NextRequest) {
  try {
    const { imageUrl, context } = await request.json();

    if (!imageUrl || !context) {
      return NextResponse.json(
        { success: false, error: 'Image URL and context are required' },
        { status: 400 }
      );
    }

    const systemPrompt = `Sen bir görsel içerik uzmanısın. Görevin görseller için SEO-friendly alt text ve caption oluşturmak.

Kurallar:
1. Alt text: Kısa, açıklayıcı, SEO-friendly (max 125 karakter)
2. Caption: Daha detaylı, ilgi çekici (1-2 cümle)
3. Türkçe yaz
4. Konuyla ilgili anahtar kelimeleri kullan
5. JSON formatında döndür

Format:
{
  "altText": "Kısa açıklama",
  "caption": "Detaylı caption"
}`;

    const userPrompt = `Görsel URL: ${imageUrl}\nKonu/Bağlam: ${context}\n\nBu görsel için alt text ve caption oluştur.`;

    console.log(`📸 Generating image description for context: ${context}`);

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

    console.log(`✅ Generated image description`);

    return NextResponse.json({
      success: true,
      altText: result.altText || context,
      caption: result.caption || '',
    });
  } catch (error: any) {
    console.error('Image description error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
