import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { batchAnalyzeUpdates, generateUpdateSchedule } from '@/lib/update-scheduler';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * Get content update schedule and recommendations
 * GET /api/admin/ai/schedule-updates
 * POST /api/admin/ai/schedule-updates (for single content)
 */
export async function GET(request: NextRequest) {
  try {
    console.log('📅 Fetching content update schedules...');

    // Fetch all blogs
    const { data: blogs, error } = await supabase
      .from('blogs')
      .select('id, title, updated_at, type, contents')
      .order('updated_at', { ascending: true });

    if (error) throw error;

    if (!blogs || blogs.length === 0) {
      return NextResponse.json({
        success: true,
        schedules: [],
      });
    }

    // Analyze each blog
    const contents = blogs.map(blog => {
      const contentLower = (blog.contents || '').toLowerCase();
      const hasDateReferences = /202[3-5]|2024|2025/.test(blog.contents || '');
      const hasPriceInfo = /ücret|fiyat|€|\$|₺|tl/.test(contentLower);
      
      let contentType: 'visa' | 'travel' | 'general' = 'general';
      if (blog.type === 'visa' || contentLower.includes('vize')) {
        contentType = 'visa';
      } else if (contentLower.includes('gezi') || contentLower.includes('seyahat')) {
        contentType = 'travel';
      }

      return {
        id: blog.id,
        title: blog.title,
        lastUpdated: new Date(blog.updated_at),
        type: contentType,
        pageViews: 0, // TODO: Integrate with analytics
        hasDateReferences,
        hasPriceInfo,
      };
    });

    const schedules = batchAnalyzeUpdates(contents);

    // Add titles to schedules
    const schedulesWithTitles = schedules.map(schedule => {
      const blog = blogs.find(b => b.id === schedule.contentId);
      return {
        ...schedule,
        title: blog?.title || 'Unknown',
      };
    });

    console.log(`✅ Analyzed ${schedules.length} content items`);

    return NextResponse.json({
      success: true,
      schedules: schedulesWithTitles,
      summary: {
        total: schedules.length,
        urgent: schedules.filter(s => s.priority === 'urgent').length,
        high: schedules.filter(s => s.priority === 'high').length,
        medium: schedules.filter(s => s.priority === 'medium').length,
        low: schedules.filter(s => s.priority === 'low').length,
      },
    });
  } catch (error: any) {
    console.error('Schedule updates error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { contentId, lastUpdated, contentType, content } = await request.json();

    if (!contentId || !lastUpdated) {
      return NextResponse.json(
        { success: false, error: 'contentId and lastUpdated are required' },
        { status: 400 }
      );
    }

    const contentLower = (content || '').toLowerCase();
    const hasDateReferences = /202[3-5]|2024|2025/.test(content || '');
    const hasPriceInfo = /ücret|fiyat|€|\$|₺|tl/.test(contentLower);

    const schedule = generateUpdateSchedule(
      contentId,
      new Date(lastUpdated),
      contentType || 'general',
      0, // pageViews
      hasDateReferences,
      hasPriceInfo
    );

    console.log(`✅ Generated update schedule for ${contentId}`);

    return NextResponse.json({
      success: true,
      schedule,
    });
  } catch (error: any) {
    console.error('Schedule generation error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
