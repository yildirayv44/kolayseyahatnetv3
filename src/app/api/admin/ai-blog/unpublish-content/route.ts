import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

/**
 * POST /api/admin/ai-blog/unpublish-content
 * Unpublish content and delete blog entry
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { content_id, blog_id } = body;

    if (!content_id || !blog_id) {
      return NextResponse.json(
        { error: 'Content ID and Blog ID are required' },
        { status: 400 }
      );
    }

    // Delete taxonomy entry
    await supabase
      .from('taxonomies')
      .delete()
      .eq('model_id', blog_id)
      .eq('type', 'Blog\\BlogController@detail');

    // Delete country-blog relation
    await supabase
      .from('country_to_blogs')
      .delete()
      .eq('blog_id', blog_id);

    // Delete blog entry
    const { error: blogError } = await supabase
      .from('blogs')
      .delete()
      .eq('id', blog_id);

    if (blogError) {
      console.error('Blog deletion error:', blogError);
      return NextResponse.json(
        { error: 'Failed to delete blog entry', details: blogError.message },
        { status: 500 }
      );
    }

    // Update content to remove blog_id and set status back to approved
    await supabase
      .from('ai_blog_content')
      .update({
        blog_id: null,
        status: 'approved'
      })
      .eq('id', content_id);

    // Update topic status
    const { data: content } = await supabase
      .from('ai_blog_content')
      .select('topic_id')
      .eq('id', content_id)
      .single();

    if (content?.topic_id) {
      await supabase
        .from('ai_blog_topics')
        .update({ status: 'approved' })
        .eq('id', content.topic_id);
    }

    revalidatePath('/admin/ai-blog-planner');

    return NextResponse.json({
      success: true,
      message: 'Content unpublished successfully'
    });

  } catch (error: any) {
    console.error('Unpublish error:', error);
    return NextResponse.json(
      { error: 'Failed to unpublish content', details: error.message },
      { status: 500 }
    );
  }
}
