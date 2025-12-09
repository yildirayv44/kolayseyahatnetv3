import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export type RepurposeFormat = 
  | 'all-platforms'
  | 'twitter-thread'
  | 'linkedin-post'
  | 'instagram-carousel'
  | 'facebook-post'
  | 'email-newsletter'
  | 'youtube-description'
  | 'threads'
  | 'whatsapp';

/**
 * Repurpose content for different social media platforms
 * POST /api/admin/ai/repurpose-content
 */
export async function POST(request: NextRequest) {
  try {
    const { content, title, format, url } = await request.json();

    if (!content || !format) {
      return NextResponse.json(
        { success: false, error: 'Content and format are required' },
        { status: 400 }
      );
    }

    // If "all-platforms" is selected, use the social-media-converter API
    if (format === 'all-platforms') {
      const converterResponse = await fetch(`${request.nextUrl.origin}/api/admin/content/social-media-converter`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content,
          title,
          contentType: 'blog',
          url,
        }),
      });

      const converterData = await converterResponse.json();
      
      if (converterData.success) {
        return NextResponse.json({
          success: true,
          result: converterData.content,
          format: 'all-platforms',
        });
      } else {
        throw new Error(converterData.error || 'Converter failed');
      }
    }

    const formatPrompts: Partial<{ [key in RepurposeFormat]: string }> = {
      'all-platforms': '', // Not used, handled above
      'threads': '', // Not used yet
      'whatsapp': '', // Not used yet
      'twitter-thread': `Sen bir sosyal medya uzmanısın. Görevin blog içeriğini Twitter thread'ine dönüştürmek.

Kurallar:
1. 8-12 tweet arası
2. Her tweet max 280 karakter
3. İlk tweet hook olmalı (dikkat çekici)
4. Numaralandır (1/, 2/, vb.)
5. Emoji kullan (ama abartma)
6. Son tweet'te CTA ekle
7. Hashtag kullan (max 2-3)

JSON formatında döndür:
{
  "tweets": [
    "1/ 🚀 Hook tweet...",
    "2/ İkinci tweet...",
    ...
  ]
}`,

      'linkedin-post': `Sen bir profesyonel içerik yazarısın. Görevin blog içeriğini LinkedIn post'una dönüştürmek.

Kurallar:
1. Profesyonel ton
2. 1300 karakter civarı
3. Değer odaklı
4. Kişisel deneyim ekle
5. CTA ile bitir
6. Hashtag kullan (3-5 adet)
7. Satır aralarıyla okunabilir yap

JSON formatında döndür:
{
  "post": "LinkedIn post metni...",
  "hashtags": ["#Vize", "#Seyahat"]
}`,

      'instagram-carousel': `Sen bir Instagram içerik uzmanısın. Görevin blog içeriğini carousel post'una dönüştürmek.

Kurallar:
1. 8-10 slide
2. Her slide kısa ve öz (max 50 kelime)
3. İlk slide dikkat çekici başlık
4. Son slide CTA
5. Görsel önerileri ekle
6. Emoji kullan
7. Caption yaz (max 2200 karakter)

JSON formatında döndür:
{
  "slides": [
    {
      "title": "Slide başlığı",
      "content": "Slide içeriği",
      "visualSuggestion": "Görsel önerisi"
    }
  ],
  "caption": "Instagram caption...",
  "hashtags": ["#travel", "#visa"]
}`,

      'facebook-post': `Sen bir sosyal medya uzmanısın. Görevin blog içeriğini Facebook post'una dönüştürmek.

Kurallar:
1. Samimi ve ilgi çekici ton
2. 500-1000 karakter
3. Soru sor (engagement için)
4. Emoji kullan
5. CTA ekle
6. Link preview için açıklama

JSON formatında döndür:
{
  "post": "Facebook post metni...",
  "linkDescription": "Link önizleme açıklaması"
}`,

      'email-newsletter': `Sen bir email marketing uzmanısın. Görevin blog içeriğini email newsletter'a dönüştürmek.

Kurallar:
1. Konu satırı (subject line) yaz
2. Ön başlık (preheader) ekle
3. Kişiselleştirilmiş giriş
4. Özet ve teaser
5. CTA button metni
6. Profesyonel ton

JSON formatında döndür:
{
  "subject": "Konu satırı",
  "preheader": "Ön başlık",
  "body": "Email içeriği (HTML formatında)",
  "cta": "CTA button metni"
}`,

      'youtube-description': `Sen bir YouTube içerik uzmanısın. Görevin blog içeriğini video description'a dönüştürmek.

Kurallar:
1. İlk 2 satır çok önemli (önizlemede görünür)
2. Timestamp'ler ekle
3. Bağlantılar ekle
4. Hashtag kullan (max 3)
5. CTA ekle
6. İlgili videolar öner

JSON formatında döndür:
{
  "description": "Video açıklaması...",
  "timestamps": [
    { "time": "0:00", "title": "Giriş" }
  ],
  "hashtags": ["#vize", "#seyahat"]
}`,
    };

    const systemPrompt = formatPrompts[format as RepurposeFormat];
    
    if (!systemPrompt) {
      return NextResponse.json(
        { success: false, error: `Format "${format}" is not supported yet` },
        { status: 400 }
      );
    }

    const userPrompt = `Başlık: ${title}\n\nİçerik:\n${content.substring(0, 2000)}\n\nBu içeriği ${format} formatına dönüştür.`;

    console.log(`♻️ Repurposing content to ${format}...`);

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

    console.log(`✅ Content repurposed to ${format}`);

    return NextResponse.json({
      success: true,
      format,
      result,
    });
  } catch (error: any) {
    console.error('Content repurposing error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
