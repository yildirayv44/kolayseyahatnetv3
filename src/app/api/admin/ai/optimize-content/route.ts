import { NextRequest, NextResponse } from 'next/server';
import { analyzeContent } from '@/lib/content-optimizer';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Optimize content with AI suggestions
 * POST /api/admin/ai/optimize-content
 */
export async function POST(request: NextRequest) {
  try {
    const { content, title, metaDescription, keywords, autoFix = false } = await request.json();

    if (!content) {
      return NextResponse.json(
        { success: false, error: 'Content is required' },
        { status: 400 }
      );
    }

    console.log('📊 Analyzing content...');

    // Analyze content
    const analysis = analyzeContent(content, title, metaDescription, keywords);

    // If autoFix is enabled, use AI to improve content
    let optimizedContent = content;
    if (autoFix && analysis.overallScore < 80) {
      console.log('🔧 Auto-fixing content with AI...');

      const systemPrompt = `Sen bir içerik optimizasyon uzmanısın. Görevin verilen içeriği iyileştirmek.

İyileştirme Kuralları:
1. Okunabilirliği artır (kısa cümleler, basit kelimeler)
2. SEO'yu güçlendir (anahtar kelimeler, başlıklar)
3. Kaliteyi yükselt (kelime çeşitliliği, akıcılık)
4. Yapıyı koru (markdown formatı)
5. Anlamı değiştirme

Sadece iyileştirilmiş içeriği döndür, açıklama yapma.`;

      const userPrompt = `İçerik:\n${content}\n\nSorunlar:\n${analysis.suggestions.join('\n')}\n\nBu içeriği yukarıdaki sorunları çözerek iyileştir.`;

      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.3,
      });

      optimizedContent = completion.choices[0].message.content || content;
      console.log('✅ Content optimized with AI');
    }

    console.log(`✅ Analysis complete - Score: ${analysis.overallScore}/100`);

    return NextResponse.json({
      success: true,
      analysis,
      optimizedContent: autoFix ? optimizedContent : undefined,
    });
  } catch (error: any) {
    console.error('Content optimization error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
