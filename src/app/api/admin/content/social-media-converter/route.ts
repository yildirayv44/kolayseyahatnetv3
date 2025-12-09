import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * POST /api/admin/content/social-media-converter
 * Convert blog/country content to 6 different social media formats
 */
export async function POST(request: NextRequest) {
  try {
    const { content, title, contentType, url } = await request.json();

    if (!content || !title) {
      return NextResponse.json(
        { error: 'Content and title are required' },
        { status: 400 }
      );
    }

    // Clean HTML tags from content
    const cleanContent = content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    const contentPreview = cleanContent.substring(0, 2000); // Limit for API

    const prompt = `Sen bir sosyal medya içerik uzmanısın. Aşağıdaki ${contentType === 'country' ? 'ülke vizesi' : 'blog'} içeriğini 6 farklı sosyal medya platformu için optimize et.

Başlık: ${title}
İçerik: ${contentPreview}
${url ? `URL: ${url}` : ''}

Her platform için içerik oluştururken:
- Platform özelliklerine uygun karakter limitleri
- Uygun emoji kullanımı
- Call-to-action (CTA)
- Hashtag stratejisi
- Engagement artırıcı sorular

Aşağıdaki formatta JSON döndür:

{
  "twitter": {
    "text": "Tweet metni (280 karakter)",
    "hashtags": ["hashtag1", "hashtag2"],
    "characterCount": 250
  },
  "instagram": {
    "caption": "Instagram caption (2200 karakter)",
    "hashtags": ["hashtag1", "hashtag2", "hashtag3"],
    "firstComment": "İlk yorum için ek hashtag'ler",
    "characterCount": 1500
  },
  "facebook": {
    "post": "Facebook post metni (detaylı)",
    "characterCount": 800
  },
  "linkedin": {
    "post": "LinkedIn post metni (profesyonel ton)",
    "hashtags": ["hashtag1", "hashtag2"],
    "characterCount": 1200
  },
  "threads": {
    "thread": ["Thread 1/5", "Thread 2/5", "Thread 3/5", "Thread 4/5", "Thread 5/5"],
    "characterCount": 500
  },
  "whatsapp": {
    "message": "WhatsApp mesajı (kısa ve öz)",
    "characterCount": 300
  }
}

Önemli:
- Her platform için farklı ton ve stil kullan
- Vize danışmanlığı hizmetini vurgula
- Kolay Seyahat markasını öne çıkar
- CTA ekle: "Detaylı bilgi için bizi arayın: 0212 909 99 71"
- Sadece JSON döndür, başka açıklama ekleme`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'Sen bir sosyal medya içerik uzmanısın. Vize danışmanlığı sektöründe çalışıyorsun. Her platform için optimize edilmiş, engagement artırıcı içerikler oluşturuyorsun.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.8,
      response_format: { type: 'json_object' },
    });

    const result = completion.choices[0].message.content;
    const socialMediaContent = JSON.parse(result || '{}');

    return NextResponse.json({
      success: true,
      content: socialMediaContent,
      originalTitle: title,
      originalUrl: url,
    });
  } catch (error: any) {
    console.error('Social media converter error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
