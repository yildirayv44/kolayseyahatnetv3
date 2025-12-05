import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Generate smart Pexels search query from Turkish title using OpenAI
 * POST /api/admin/images/generate-query
 */
export async function POST(request: NextRequest) {
  try {
    const { title } = await request.json();

    if (!title) {
      return NextResponse.json(
        { success: false, error: 'Title is required' },
        { status: 400 }
      );
    }

    // Use OpenAI to generate smart English query
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are a search query optimizer for Pexels image search. 
Your task is to convert Turkish blog/article titles into effective English search queries for finding relevant stock photos.

Rules:
1. Translate Turkish to English
2. Extract only the most important keywords (3-5 words max)
3. Focus on visual concepts that can be photographed
4. Remove question words, articles, and filler words
5. Use simple, common English terms
6. For visa/travel content: focus on "visa", "passport", "travel", "document", country names
7. For guides: focus on the main subject, not "guide" or "how to"
8. Return ONLY the search query, nothing else

Examples:
"Çok Girişli Schengen Vizesi Nasıl Alınır?" → "schengen visa passport"
"Kuveyt Vizesi Başvurusu" → "kuwait visa application"
"İngiltere'de Gezilecek Yerler" → "london england landmarks"
"Paris'te Yemek Rehberi" → "paris food restaurant"
"Öğrenci Vizesi Gerekli Belgeler" → "student visa documents"
"Tokyo'da Alışveriş" → "tokyo shopping street"`,
        },
        {
          role: 'user',
          content: title,
        },
      ],
      temperature: 0.3,
      max_tokens: 50,
    });

    const query = completion.choices[0]?.message?.content?.trim() || '';

    // Fallback if OpenAI returns empty
    if (!query || query.length < 3) {
      return NextResponse.json({
        success: true,
        query: 'travel visa passport document',
        fallback: true,
      });
    }

    console.log(`🤖 OpenAI Query: "${title}" → "${query}"`);

    return NextResponse.json({
      success: true,
      query,
      fallback: false,
    });
  } catch (error: any) {
    console.error('OpenAI query generation error:', error);
    
    // Fallback on error
    return NextResponse.json({
      success: true,
      query: 'travel visa passport document',
      fallback: true,
      error: error.message,
    });
  }
}
