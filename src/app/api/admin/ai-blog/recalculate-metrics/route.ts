import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * POST /api/admin/ai-blog/recalculate-metrics
 * Recalculate keyword density and main page links for all existing content
 */
export async function POST(request: NextRequest) {
  try {
    // Get all content
    const { data: contents, error: fetchError } = await supabase
      .from('ai_blog_content')
      .select('id, content, target_keywords');

    if (fetchError) {
      throw new Error('Failed to fetch content');
    }

    if (!contents || contents.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No content found',
        updated_count: 0
      });
    }

    let updatedCount = 0;
    const errors = [];

    // Process each content
    for (const content of contents) {
      try {
        // Calculate metrics
        const words = content.content.split(/\s+/).filter((w: string) => w.length > 0);
        const totalWords = words.length;
        
        // Calculate keyword density
        let keywordCount = 0;
        const keywords = content.target_keywords || [];
        keywords.forEach((keyword: string) => {
          const regex = new RegExp(keyword, 'gi');
          const matches = content.content.match(regex);
          keywordCount += matches ? matches.length : 0;
        });
        const density = totalWords > 0 ? (keywordCount / totalWords) * 100 : 0;
        
        // Count main page links
        const mainPageLinks = (content.content.match(/kolayseyahat\.net/g) || []).length;

        // Update content
        const { error: updateError } = await supabase
          .from('ai_blog_content')
          .update({
            word_count: totalWords,
            keyword_density: parseFloat(density.toFixed(2)),
            main_page_links_count: mainPageLinks
          })
          .eq('id', content.id);

        if (updateError) {
          errors.push({ id: content.id, error: updateError.message });
        } else {
          updatedCount++;
        }
      } catch (error: any) {
        errors.push({ id: content.id, error: error.message });
      }
    }

    return NextResponse.json({
      success: true,
      total_content: contents.length,
      updated_count: updatedCount,
      failed_count: errors.length,
      errors: errors.length > 0 ? errors : undefined,
      message: `${updatedCount} içeriğin metrikleri güncellendi`
    });

  } catch (error: any) {
    console.error('Recalculate metrics error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to recalculate metrics' },
      { status: 500 }
    );
  }
}
