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

Translate the following HTML content from Turkish to English.

CRITICAL RULES:
1. Preserve ALL HTML tags, attributes, and structure EXACTLY as they are
2. Only translate the TEXT content between HTML tags
3. Do NOT translate HTML tag names, attributes, or CSS classes
4. Maintain all formatting, line breaks, and whitespace
5. Use natural, fluent English for the translated text
6. Preserve technical terms (visa, passport, etc.)
7. Professional tone
8. Return ONLY the translated HTML - no markdown code blocks, no explanations
9. If the input is already in English, return it unchanged

Example:
Input: <p>Merhaba <strong>dünya</strong></p>
Output: <p>Hello <strong>world</strong></p>`
        : `Sen profesyonel bir çevirmensin, seyahat ve vize içerikleri konusunda uzmansın.

Aşağıdaki HTML içeriğini İngilizce'den Türkçe'ye çevir.

KRİTİK KURALLAR:
1. TÜM HTML etiketlerini, özelliklerini ve yapısını AYNEN koru
2. Sadece HTML etiketleri arasındaki METİN içeriğini çevir
3. HTML etiket isimlerini, özelliklerini veya CSS sınıflarını çevirme
4. Tüm formatlama, satır sonları ve boşlukları koru
5. Çevrilen metin için doğal, akıcı Türkçe kullan
6. Teknik terimleri koru (vize, pasaport, vb.)
7. Profesyonel ton
8. SADECE çevrilmiş HTML'i döndür - markdown kod blokları yok, açıklama yok
9. Girdi zaten Türkçe ise, değiştirmeden döndür

Örnek:
Girdi: <p>Hello <strong>world</strong></p>
Çıktı: <p>Merhaba <strong>dünya</strong></p>`,
      
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
