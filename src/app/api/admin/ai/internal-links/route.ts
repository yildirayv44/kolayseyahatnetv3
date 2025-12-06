import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Find and suggest internal links from content
 * POST /api/admin/ai/internal-links
 */
export async function POST(request: NextRequest) {
  try {
    const { content, currentSlug } = await request.json();

    if (!content) {
      return NextResponse.json(
        { success: false, error: 'Content is required' },
        { status: 400 }
      );
    }

    // Fetch all blogs and countries for linking
    const [blogsResult, countriesResult] = await Promise.all([
      supabase
        .from('blogs')
        .select('id, title, slug, description')
        .eq('status', 'published')
        .limit(100),
      supabase
        .from('countries')
        .select('id, name, slug, title')
        .limit(100),
    ]);

    const blogs = blogsResult.data || [];
    const countries = countriesResult.data || [];

    // Filter out current page
    const availableLinks = [
      ...blogs
        .filter(b => b.slug !== currentSlug)
        .map(b => ({
          title: b.title,
          slug: b.slug,
          url: `/blog/${b.slug}`,
          description: b.description || '',
        })),
      ...countries
        .filter(c => c.slug && c.slug !== currentSlug)
        .map(c => ({
          title: c.name,
          slug: c.slug!,
          url: `/${c.slug}`,
          description: c.title || '',
        })),
    ];

    if (availableLinks.length === 0) {
      return NextResponse.json({
        success: true,
        links: [],
      });
    }

    // Use AI to find relevant links
    const systemPrompt = `Sen bir içerik optimizasyon uzmanısın. Görevin verilen içerikte geçen konularla ilgili en uygun iç linkleri bulmak.

Kurallar:
1. İçerikte doğal olarak geçen kelimeleri bul
2. Bu kelimelerle eşleşen linkleri öner
3. Her link için relevance skoru ver (0-100)
4. En fazla 5 link öner
5. Sadece yüksek relevance'lı linkleri seç (>60)
6. JSON formatında döndür

Format:
{
  "links": [
    {
      "text": "İçerikte geçen kelime",
      "url": "/blog/slug",
      "relevance": 85
    }
  ]
}`;

    const userPrompt = `İçerik:\n${content.substring(0, 2000)}\n\nMevcut linkler:\n${availableLinks.map(l => `- ${l.title}: ${l.url}`).join('\n')}\n\nBu içerik için en uygun iç linkleri bul.`;

    console.log(`🔗 Finding internal links...`);

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.3,
      response_format: { type: 'json_object' },
    });

    const result = JSON.parse(completion.choices[0].message.content || '{}');

    console.log(`✅ Found ${result.links?.length || 0} internal links`);

    return NextResponse.json({
      success: true,
      links: result.links || [],
    });
  } catch (error: any) {
    console.error('Internal links error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
