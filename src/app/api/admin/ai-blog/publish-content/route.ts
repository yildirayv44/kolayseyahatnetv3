import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * POST /api/admin/ai-blog/publish-content
 * Publish approved AI-generated content to blogs table
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { content_id } = body;

    if (!content_id) {
      return NextResponse.json(
        { error: 'Content ID is required' },
        { status: 400 }
      );
    }

    // Get content
    const { data: content, error: contentError } = await supabase
      .from('ai_blog_content')
      .select('*, ai_blog_topics(*, ai_blog_plans(country_id, country_slug))')
      .eq('id', content_id)
      .single();

    if (contentError || !content) {
      return NextResponse.json(
        { error: 'Content not found' },
        { status: 404 }
      );
    }

    if (content.status !== 'approved') {
      return NextResponse.json(
        { error: 'Content must be approved before publishing' },
        { status: 400 }
      );
    }

    if (content.blog_id) {
      return NextResponse.json(
        { error: 'Content already published', blog_id: content.blog_id },
        { status: 409 }
      );
    }

    const topic = content.ai_blog_topics;
    const plan = topic.ai_blog_plans;

    // Create blog entry
    const { data: blog, error: blogError } = await supabase
      .from('blogs')
      .insert({
        title: content.title,
        slug: content.slug,
        taxonomy_slug: `blog/${content.slug}`,
        contents: content.content,
        description: content.description,
        meta_title: content.meta_title,
        meta_description: content.meta_description,
        image_url: content.cover_image_url,
        category: getCategoryName(topic.category),
        tags: content.target_keywords,
        status: 1,
        views: 0,
        is_featured: 0,
        is_manual_content: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (blogError) {
      console.error('Blog creation error:', blogError);
      return NextResponse.json(
        { error: 'Failed to create blog entry' },
        { status: 500 }
      );
    }

    // Update content with blog_id
    await supabase
      .from('ai_blog_content')
      .update({
        blog_id: blog.id,
        status: 'published',
        published_at: new Date().toISOString()
      })
      .eq('id', content_id);

    // Update topic status
    await supabase
      .from('ai_blog_topics')
      .update({ status: 'published' })
      .eq('id', content.topic_id);

    // Revalidate blog pages
    try {
      revalidatePath('/blog');
      revalidatePath(`/blog/${content.slug}`);
      revalidatePath(`/en/blog/${content.slug}`);
    } catch (error) {
      console.error('Revalidation error:', error);
    }

    return NextResponse.json({
      success: true,
      blog_id: blog.id,
      blog_slug: blog.slug,
      blog_url: `https://www.kolayseyahat.net/blog/${blog.slug}`,
      message: 'Content published successfully'
    });

  } catch (error: any) {
    console.error('Publish content error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to publish content' },
      { status: 500 }
    );
  }
}

function getCategoryName(category: string): string {
  const categoryMap: { [key: string]: string } = {
    'visa_procedures': 'Vize İşlemleri',
    'travel_planning': 'Seyahat Planlama',
    'practical_info': 'Pratik Bilgiler',
    'culture': 'Kültür',
    'comparison': 'Karşılaştırma'
  };
  return categoryMap[category] || 'Genel';
}
