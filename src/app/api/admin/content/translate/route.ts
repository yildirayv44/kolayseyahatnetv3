import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Translate content between Turkish and English
 * POST /api/admin/content/translate
 */
export async function POST(request: NextRequest) {
  try {
    const { text, from, to, type = 'content' } = await request.json();

    if (!text || !from || !to) {
      return NextResponse.json(
        { success: false, error: 'Text, from, and to languages are required' },
        { status: 400 }
      );
    }

    console.log(`🌐 Translating ${type} from ${from} to ${to}`);

    const systemPrompts: Record<string, string> = {
      content: from === 'tr' && to === 'en'
        ? `You are a professional translator specializing in travel and visa content. Translate the Turkish text to English.

Rules:
1. Maintain the original meaning and tone
2. Keep markdown formatting (H2, H3, lists, etc.)
3. Use natural, fluent English
4. Preserve technical terms (visa, passport, etc.)
5. Keep the same structure
6. SEO-friendly translation
7. Professional tone`
        : `Sen profesyonel bir çevirmensin, seyahat ve vize içerikleri konusunda uzmansın. İngilizce metni Türkçe'ye çevir.

Kurallar:
1. Orijinal anlam ve tonu koru
2. Markdown formatını koru (H2, H3, listeler, vb.)
3. Doğal, akıcı Türkçe kullan
4. Teknik terimleri koru (vize, pasaport, vb.)
5. Aynı yapıyı koru
6. SEO-dostu çeviri
7. Profesyonel ton`,
      
      title: from === 'tr' && to === 'en'
        ? 'Translate this Turkish title to English. Keep it concise and SEO-friendly. Return ONLY the translated title.'
        : 'Bu İngilizce başlığı Türkçe\'ye çevir. Kısa ve SEO-dostu tut. SADECE çevrilmiş başlığı döndür.',
      
      description: from === 'tr' && to === 'en'
        ? 'Translate this Turkish description to English. Keep it compelling and within 160 characters if possible. Return ONLY the translated description.'
        : 'Bu İngilizce açıklamayı Türkçe\'ye çevir. Çekici ve mümkünse 160 karakter içinde tut. SADECE çevrilmiş açıklamayı döndür.',
      
      meta: from === 'tr' && to === 'en'
        ? 'Translate this Turkish meta text to English. Keep it SEO-optimized. Return ONLY the translated text.'
        : 'Bu İngilizce meta metnini Türkçe\'ye çevir. SEO-optimized tut. SADECE çevrilmiş metni döndür.',
    };

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompts[type] || systemPrompts.content },
        { role: 'user', content: text },
      ],
      temperature: 0.3,
      max_tokens: type === 'content' ? 4000 : 200,
    });

    const translatedText = completion.choices[0]?.message?.content?.trim() || '';

    if (!translatedText) {
      return NextResponse.json(
        { success: false, error: 'Translation failed' },
        { status: 500 }
      );
    }

    console.log(`✅ Translated ${text.length} chars → ${translatedText.length} chars`);

    return NextResponse.json({
      success: true,
      translated_text: translatedText,
      original_length: text.length,
      translated_length: translatedText.length,
    });
  } catch (error: any) {
    console.error('Translation error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
