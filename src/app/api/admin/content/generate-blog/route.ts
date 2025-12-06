import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Generate blog content using AI
 * POST /api/admin/content/generate-blog
 */
export async function POST(request: NextRequest) {
  try {
    const { 
      title, 
      keywords = [], 
      tone = 'informative', 
      language = 'tr', 
      additionalContext = '',
      wordCount = 1500 
    } = await request.json();

    if (!title) {
      return NextResponse.json(
        { success: false, error: 'Title is required' },
        { status: 400 }
      );
    }

    const systemPrompt = language === 'tr' 
      ? `Sen profesyonel bir seyahat ve vize danışmanı blog yazarısın. 
Görevin: Verilen başlık için kapsamlı, SEO-optimized, bilgilendirici blog içeriği oluşturmak.

Kurallar:
1. Markdown formatında yaz (H2, H3 başlıklar kullan)
2. Giriş paragrafı ile başla (150-200 kelime)
3. Ana bölümler oluştur (H2 başlıklar)
4. Alt başlıklar ekle (H3 başlıklar)
5. Liste ve bullet points kullan
6. Önemli bilgileri vurgula
7. Sonuç bölümü ekle
8. SEO-friendly anahtar kelimeleri doğal şekilde kullan
9. Ton: ${tone === 'informative' ? 'Bilgilendirici ve profesyonel' : tone === 'friendly' ? 'Samimi ve yardımsever' : 'Resmi ve detaylı'}
10. Hedef kelime sayısı: ${wordCount} kelime (minimum ${Math.floor(wordCount * 0.8)}, maksimum ${Math.floor(wordCount * 1.2)})
11. Gerçek, güncel bilgiler ver
12. Adım adım açıklamalar yap

Yapı:
## Giriş
[150-200 kelime giriş]

## [Ana Konu 1]
[Detaylı açıklama]

### [Alt Konu 1.1]
[Açıklama]

## [Ana Konu 2]
[Detaylı açıklama]

## Sonuç
[Özet ve önemli notlar]`
      : `You are a professional travel and visa consultant blog writer.
Task: Create comprehensive, SEO-optimized, informative blog content for the given title.

Rules:
1. Write in Markdown format (use H2, H3 headings)
2. Start with introduction (150-200 words)
3. Create main sections (H2 headings)
4. Add subsections (H3 headings)
5. Use lists and bullet points
6. Highlight important information
7. Add conclusion section
8. Use SEO-friendly keywords naturally
9. Tone: ${tone === 'informative' ? 'Informative and professional' : tone === 'friendly' ? 'Friendly and helpful' : 'Formal and detailed'}
10. Target word count: ${wordCount} words (minimum ${Math.floor(wordCount * 0.8)}, maximum ${Math.floor(wordCount * 1.2)})
11. Provide real, up-to-date information
12. Step-by-step explanations

Structure:
## Introduction
[150-200 word introduction]

## [Main Topic 1]
[Detailed explanation]

### [Subtopic 1.1]
[Explanation]

## [Main Topic 2]
[Detailed explanation]

## Conclusion
[Summary and important notes]`;

    let userPrompt = `Başlık: ${title}`;
    
    if (keywords.length > 0) {
      userPrompt += `\nAnahtar Kelimeler: ${keywords.join(', ')}`;
    }
    
    if (additionalContext.trim()) {
      userPrompt += `\n\nEk Bilgiler ve Talimatlar:\n${additionalContext}`;
    }

    console.log(`🤖 Generating blog content for: "${title}"${additionalContext ? ' (with additional context)' : ''}`);

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 4000,
    });

    const content = completion.choices[0]?.message?.content || '';

    if (!content) {
      return NextResponse.json(
        { success: false, error: 'Failed to generate content' },
        { status: 500 }
      );
    }

    // Generate meta information
    const metaCompletion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `Generate SEO metadata for a blog post. Return ONLY a JSON object with these fields:
{
  "meta_title": "60 characters max, SEO-optimized title",
  "meta_description": "150-160 characters, compelling description",
  "slug": "url-friendly-slug",
  "tags": ["tag1", "tag2", "tag3"]
}`,
        },
        {
          role: 'user',
          content: `Title: ${title}\nContent preview: ${content.substring(0, 500)}`,
        },
      ],
      temperature: 0.3,
      max_tokens: 200,
    });

    const metaText = metaCompletion.choices[0]?.message?.content || '{}';
    let metadata;
    try {
      metadata = JSON.parse(metaText);
    } catch {
      metadata = {
        meta_title: title,
        meta_description: title,
        slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        tags: keywords,
      };
    }

    // Calculate reading time (average 200 words per minute)
    const actualWordCount = content.split(/\s+/).length;
    const readingTime = Math.ceil(actualWordCount / 200);

    console.log(`✅ Generated ${actualWordCount} words, ${readingTime} min read`);

    return NextResponse.json({
      success: true,
      content,
      meta_title: metadata.meta_title,
      meta_description: metadata.meta_description,
      slug: metadata.slug,
      tags: metadata.tags,
      word_count: actualWordCount,
      reading_time: readingTime,
    });
  } catch (error: any) {
    console.error('Blog generation error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
