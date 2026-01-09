import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * PATCH /api/admin/ai-blog/update-plan
 * Update plan details (month, year, topic count)
 */
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { plan_id, month, year, total_topics } = body;

    if (!plan_id) {
      return NextResponse.json(
        { error: 'Plan ID is required' },
        { status: 400 }
      );
    }

    // Get current plan
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

    // Prepare update data
    const updateData: any = {};
    if (month !== undefined) updateData.month = month;
    if (year !== undefined) updateData.year = year;
    if (total_topics !== undefined) updateData.total_topics = total_topics;
    updateData.updated_at = new Date().toISOString();

    // Update plan
    const { error: updateError } = await supabase
      .from('ai_blog_plans')
      .update(updateData)
      .eq('id', plan_id);

    if (updateError) {
      throw new Error('Failed to update plan');
    }

    return NextResponse.json({
      success: true,
      plan_id,
      message: 'Plan başarıyla güncellendi'
    });

  } catch (error: any) {
    console.error('Update plan error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update plan' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/ai-blog/update-plan
 * Delete a plan and all its topics/content
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const plan_id = searchParams.get('plan_id');

    if (!plan_id) {
      return NextResponse.json(
        { error: 'Plan ID is required' },
        { status: 400 }
      );
    }

    // Check if plan exists
    const { data: plan, error: planError } = await supabase
      .from('ai_blog_plans')
      .select('status')
      .eq('id', plan_id)
      .single();

    if (planError || !plan) {
      return NextResponse.json(
        { error: 'Plan not found' },
        { status: 404 }
      );
    }

    // Don't allow deleting published plans
    if (plan.status === 'published') {
      return NextResponse.json(
        { error: 'Cannot delete published plans' },
        { status: 400 }
      );
    }

    // Delete plan (cascade will delete topics and content)
    const { error: deleteError } = await supabase
      .from('ai_blog_plans')
      .delete()
      .eq('id', plan_id);

    if (deleteError) {
      throw new Error('Failed to delete plan');
    }

    return NextResponse.json({
      success: true,
      message: 'Plan başarıyla silindi'
    });

  } catch (error: any) {
    console.error('Delete plan error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete plan' },
      { status: 500 }
    );
  }
}
