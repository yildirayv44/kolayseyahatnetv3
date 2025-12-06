import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Generate tone previews for a topic
 * POST /api/admin/ai/tone-preview
 */
export async function POST(request: NextRequest) {
  try {
    const { topic } = await request.json();

    if (!topic) {
      return NextResponse.json(
        { success: false, error: 'Topic is required' },
        { status: 400 }
      );
    }

    const systemPrompt = `Sen bir içerik yazarısın. Görevin aynı konuyu 3 farklı tonla (bilgilendirici, samimi, resmi) yazmak.

Her ton için 2-3 cümlelik giriş paragrafı yaz.

Bilgilendirici: Profesyonel, objektif, detaylı
Samimi: Sıcak, yakın, konuşkan
Resmi: Kurumsal, ciddi, protokoler

JSON formatında döndür:
{
  "informative": "Bilgilendirici ton ile yazılmış paragraf...",
  "friendly": "Samimi ton ile yazılmış paragraf...",
  "formal": "Resmi ton ile yazılmış paragraf..."
}`;

    const userPrompt = `Konu: ${topic}\n\nBu konu için 3 farklı tonla giriş paragrafları yaz.`;

    console.log(`🎭 Generating tone previews for: ${topic}`);

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.8,
      response_format: { type: 'json_object' },
    });

    const result = JSON.parse(completion.choices[0].message.content || '{}');

    console.log(`✅ Generated tone previews`);

    return NextResponse.json({
      success: true,
      previews: {
        informative: result.informative || '',
        friendly: result.friendly || '',
        formal: result.formal || '',
      },
    });
  } catch (error: any) {
    console.error('Tone preview error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
