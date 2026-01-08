import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * POST /api/admin/ai-blog/approve-plan
 * Approve plan and start content generation for all approved topics
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { plan_id } = body;

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

    // Get all pending topics and mark them as approved
    const { data: topics, error: topicsError } = await supabase
      .from('ai_blog_topics')
      .update({ status: 'approved' })
      .eq('plan_id', plan_id)
      .eq('status', 'pending')
      .select();

    if (topicsError) {
      console.error('Topics approval error:', topicsError);
      return NextResponse.json(
        { error: 'Failed to approve topics' },
        { status: 500 }
      );
    }

    // Update plan status
    await supabase
      .from('ai_blog_plans')
      .update({ status: 'generating' })
      .eq('id', plan_id);

    return NextResponse.json({
      success: true,
      plan_id,
      approved_topics: topics?.length || 0,
      message: 'Plan approved. Topics are ready for content generation.',
      next_step: 'Call /api/admin/ai-blog/generate-content for each approved topic'
    });

  } catch (error: any) {
    console.error('Approve plan error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to approve plan' },
      { status: 500 }
    );
  }
}
