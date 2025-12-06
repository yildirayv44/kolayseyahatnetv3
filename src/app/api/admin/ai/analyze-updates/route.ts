import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Analyze content and suggest updates
 * POST /api/admin/ai/analyze-updates
 */
export async function POST(request: NextRequest) {
  try {
    const { content, lastUpdated } = await request.json();

    if (!content || !lastUpdated) {
      return NextResponse.json(
        { success: false, error: 'Content and lastUpdated are required' },
        { status: 400 }
      );
    }

    const lastUpdateDate = new Date(lastUpdated);
    const now = new Date();
    const daysSinceUpdate = Math.floor((now.getTime() - lastUpdateDate.getTime()) / (1000 * 60 * 60 * 24));

    const systemPrompt = `Sen bir içerik güncelleme uzmanısın. Görevin eski içerikleri analiz edip nelerin güncellenmesi gerektiğini önermek.

Kontrol edilecekler:
1. Tarih ve zaman bilgileri (eski mi?)
2. Ücret ve fiyat bilgileri (güncel mi?)
3. Prosedür ve kurallar (değişmiş olabilir mi?)
4. İletişim bilgileri (geçerli mi?)
5. Teknoloji ve yöntemler (eskimiş mi?)

Her öneri için:
- Neden güncellenmeli?
- Öncelik seviyesi (high/medium/low)
- Önerilen değişiklikler
- Etkilenen bölümler

JSON formatında döndür:
{
  "suggestions": [
    {
      "reason": "Neden güncellenmeli",
      "priority": "high",
      "suggestedChanges": ["Değişiklik 1", "Değişiklik 2"],
      "affectedSections": ["Bölüm 1", "Bölüm 2"]
    }
  ]
}`;

    const userPrompt = `İçerik (ilk 1500 karakter):\n${content.substring(0, 1500)}\n\nSon güncelleme: ${lastUpdateDate.toLocaleDateString('tr-TR')}\nÜzerinden geçen gün: ${daysSinceUpdate}\n\nBu içeriğin güncellenmesi gereken yönlerini analiz et.`;

    console.log(`🔄 Analyzing content for updates (${daysSinceUpdate} days old)...`);

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.5,
      response_format: { type: 'json_object' },
    });

    const result = JSON.parse(completion.choices[0].message.content || '{}');

    console.log(`✅ Found ${result.suggestions?.length || 0} update suggestions`);

    return NextResponse.json({
      success: true,
      suggestions: result.suggestions || [],
      daysSinceUpdate,
    });
  } catch (error: any) {
    console.error('Content update analysis error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
