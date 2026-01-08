import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * PATCH /api/admin/ai-blog/update-topic
 * Update topic details (title, priority, status, etc.)
 */
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { topic_id, ...updates } = body;

    if (!topic_id) {
      return NextResponse.json(
        { error: 'Topic ID is required' },
        { status: 400 }
      );
    }

    // Update topic
    const { data: topic, error } = await supabase
      .from('ai_blog_topics')
      .update(updates)
      .eq('id', topic_id)
      .select()
      .single();

    if (error) {
      console.error('Topic update error:', error);
      return NextResponse.json(
        { error: 'Failed to update topic' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      topic,
      message: 'Topic updated successfully'
    });

  } catch (error: any) {
    console.error('Update topic error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update topic' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/ai-blog/update-topic
 * Delete a topic
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const topic_id = searchParams.get('topic_id');

    if (!topic_id) {
      return NextResponse.json(
        { error: 'Topic ID is required' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('ai_blog_topics')
      .delete()
      .eq('id', topic_id);

    if (error) {
      console.error('Topic deletion error:', error);
      return NextResponse.json(
        { error: 'Failed to delete topic' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Topic deleted successfully'
    });

  } catch (error: any) {
    console.error('Delete topic error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete topic' },
      { status: 500 }
    );
  }
}
