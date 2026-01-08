import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * GET /api/admin/ai-blog/plan-details?plan_id=xxx
 * Get plan details with all topics
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const plan_id = searchParams.get('plan_id');

    if (!plan_id) {
      return NextResponse.json(
        { error: 'Plan ID is required' },
        { status: 400 }
      );
    }

    // Get plan
    const { data: plan, error: planError } = await supabase
      .from('ai_blog_plans')
      .select('*')
      .eq('id', plan_id)
      .single();

    if (planError || !plan) {
      return NextResponse.json(
        { error: 'Plan not found' },
        { status: 404 }
      );
    }

    // Get topics
    const { data: topics, error: topicsError } = await supabase
      .from('ai_blog_topics')
      .select('*')
      .eq('plan_id', plan_id)
      .order('priority', { ascending: false })
      .order('created_at', { ascending: true });

    if (topicsError) {
      console.error('Topics fetch error:', topicsError);
      return NextResponse.json(
        { error: 'Failed to fetch topics' },
        { status: 500 }
      );
    }

    // Get content for topics that have been generated
    const topicIds = topics?.map(t => t.id) || [];
    let contents = [];

    if (topicIds.length > 0) {
      const { data: contentsData } = await supabase
        .from('ai_blog_content')
        .select('*')
        .in('topic_id', topicIds);

      contents = contentsData || [];
    }

    // Group topics by category
    const topicsByCategory = topics?.reduce((acc: any, topic: any) => {
      if (!acc[topic.category]) {
        acc[topic.category] = [];
      }
      acc[topic.category].push(topic);
      return acc;
    }, {});

    // Statistics
    const stats = {
      total: topics?.length || 0,
      pending: topics?.filter((t: any) => t.status === 'pending').length || 0,
      approved: topics?.filter((t: any) => t.status === 'approved').length || 0,
      generating: topics?.filter((t: any) => t.status === 'generating').length || 0,
      review: topics?.filter((t: any) => t.status === 'review').length || 0,
      rejected: topics?.filter((t: any) => t.status === 'rejected').length || 0,
      published: topics?.filter((t: any) => t.status === 'published').length || 0,
      with_content: contents.length
    };

    return NextResponse.json({
      success: true,
      plan,
      topics,
      contents,
      topics_by_category: topicsByCategory,
      stats
    });

  } catch (error: any) {
    console.error('Get plan details error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch plan details' },
      { status: 500 }
    );
  }
}
