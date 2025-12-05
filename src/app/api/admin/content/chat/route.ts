import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * AI Chatbot Assistant for admin panel
 * POST /api/admin/content/chat
 */
export async function POST(request: NextRequest) {
  try {
    const { message, context = {} } = await request.json();

    if (!message) {
      return NextResponse.json(
        { success: false, error: 'Message is required' },
        { status: 400 }
      );
    }

    console.log(`💬 Chat message: "${message}"`);

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `Sen Kolay Seyahat admin paneli için AI asistanısın. Kullanıcılara içerik yönetimi konusunda yardımcı oluyorsun.

Yeteneklerin:
1. Blog oluşturma ve düzenleme
2. Ülke bilgisi ekleme
3. SEO optimizasyonu
4. İçerik çevirisi
5. Kalite kontrolü
6. Veri analizi
7. Görev otomasyonu

Kullanıcı isteklerini anla ve uygun aksiyonlar öner. JSON formatında yanıt ver:

{
  "message": "Kullanıcıya gösterilecek mesaj",
  "action": "create_blog|edit_blog|add_country|translate|analyze|none",
  "parameters": {
    // Aksiyona özel parametreler
  },
  "suggestions": [
    "Öneri 1",
    "Öneri 2"
  ]
}

Örnekler:
"Japonya için blog oluştur" → action: create_blog, parameters: {country: "Japonya"}
"Tüm blogları İngilizce'ye çevir" → action: translate, parameters: {target: "en"}
"SEO skorunu göster" → action: analyze, parameters: {type: "seo"}

Mevcut context: ${JSON.stringify(context)}`,
        },
        {
          role: 'user',
          content: message,
        },
      ],
      temperature: 0.7,
      max_tokens: 1000,
      response_format: { type: 'json_object' },
    });

    const responseText = completion.choices[0]?.message?.content || '{}';
    const response = JSON.parse(responseText);

    console.log(`✅ Action: ${response.action}`);

    return NextResponse.json({
      success: true,
      ...response,
    });
  } catch (error: any) {
    console.error('Chat error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
