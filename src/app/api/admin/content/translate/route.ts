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
        ? `You are a professional translator specializing in travel and visa content.

IMPORTANT: The input is a JSON array of strings. You MUST return a valid JSON array of translated strings.

Example input: ["Merhaba", "Dünya"]
Example output: ["Hello", "World"]

Rules:
1. Return ONLY a valid JSON array - no markdown, no explanations
2. Translate each string in the array to English
3. Maintain the same number of items
4. Keep the same order
5. Use natural, fluent English
6. Preserve technical terms (visa, passport, etc.)
7. Professional tone
8. Do NOT add bullet points, dashes, or markdown formatting
9. Return pure JSON array like: ["item1", "item2", "item3"]`
        : `Sen profesyonel bir çevirmensin, seyahat ve vize içerikleri konusunda uzmansın.

ÖNEMLİ: Girdi bir JSON string dizisidir. Geçerli bir JSON string dizisi döndürmelisin.

Örnek girdi: ["Hello", "World"]
Örnek çıktı: ["Merhaba", "Dünya"]

Kurallar:
1. SADECE geçerli bir JSON dizisi döndür - markdown yok, açıklama yok
2. Dizideki her stringi Türkçe'ye çevir
3. Aynı sayıda öğe olmalı
4. Aynı sırayı koru
5. Doğal, akıcı Türkçe kullan
6. Teknik terimleri koru (vize, pasaport, vb.)
7. Profesyonel ton
8. Madde işaretleri, tire veya markdown formatı EKLEME
9. Saf JSON dizisi döndür: ["öğe1", "öğe2", "öğe3"]`,
      
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
