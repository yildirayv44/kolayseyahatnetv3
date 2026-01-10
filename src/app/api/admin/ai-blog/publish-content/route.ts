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
 * POST /api/admin/ai-blog/publish-content
 * Publish approved AI-generated content to blogs table
 */
export async function POST(request: NextRequest) {
  try {
    console.log('=== PUBLISH CONTENT START ===');
    const body = await request.json();
    const { content_id } = body;
    console.log('Content ID:', content_id);

    if (!content_id) {
      console.error('No content_id provided');
      return NextResponse.json(
        { error: 'Content ID is required' },
        { status: 400 }
      );
    }

    // Get content
    console.log('Fetching content from database...');
    const { data: content, error: contentError } = await supabase
      .from('ai_blog_content')
      .select('*, ai_blog_topics(*, ai_blog_plans(country_id, country_slug))')
      .eq('id', content_id)
      .single();

    if (contentError) {
      console.error('Content fetch error:', contentError);
      return NextResponse.json(
        { error: 'Content fetch failed', details: contentError.message },
        { status: 500 }
      );
    }

    if (!content) {
      console.error('Content not found');
      return NextResponse.json(
        { error: 'Content not found' },
        { status: 404 }
      );
    }

    console.log('Content found:', {
      id: content.id,
      title: content.title,
      status: content.status,
      blog_id: content.blog_id,
      has_topic: !!content.ai_blog_topics
    });

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
    const plan = topic?.ai_blog_plans;

    console.log('Topic and Plan:', {
      has_topic: !!topic,
      has_plan: !!plan,
      plan_country_id: plan?.country_id
    });

    if (!topic) {
      console.error('Topic not found for this content');
      return NextResponse.json(
        { error: 'Topic not found for this content' },
        { status: 404 }
      );
    }

    // Create blog entry (matching BlogCreateForm structure)
    console.log('Creating blog entry...');
    const now = new Date().toISOString();
    const blogData = {
      title: content.title,
      slug: content.slug,
      description: content.description,
      contents: content.content,
      image: content.cover_image_url || '',
      image_url: content.cover_image_url || '',
      category: topic?.category ? getCategoryName(topic.category) : 'Genel',
      home: 1, // Required field
      type: 1, // Required field
      sorted: 0,
      status: 1,
      created_at: now,
      updated_at: now
    };
    console.log('Blog data to insert:', {
      title: blogData.title,
      has_description: !!blogData.description,
      content_length: blogData.contents?.length || 0,
      has_image: !!blogData.image_url,
      sorted: blogData.sorted,
      status: blogData.status
    });

    const { data: blog, error: blogError } = await supabase
      .from('blogs')
      .insert(blogData)
      .select()
      .single();

    if (blogError) {
      console.error('Blog creation error:', blogError);
      console.error('Full error details:', JSON.stringify(blogError, null, 2));
      return NextResponse.json(
        { 
          error: 'Failed to create blog entry',
          details: blogError.message,
          code: blogError.code,
          hint: blogError.hint
        },
        { status: 500 }
      );
    }

    console.log('Blog created successfully:', blog.id);

    // Create taxonomy entry for routing
    const { error: taxonomyError } = await supabase
      .from('taxonomies')
      .insert({
        model_id: blog.id,
        type: 'Blog\\BlogController@detail',
        slug: `blog/${content.slug}`
      });

    if (taxonomyError) {
      console.error('Taxonomy creation error:', taxonomyError);
      // Don't fail the whole operation, but log it
      console.warn('Blog created but taxonomy entry failed - blog may not be accessible via URL');
    } else {
      console.log('Taxonomy created successfully for blog:', blog.id);
    }

    // Create country-blog relation
    if (plan?.country_id) {
      await supabase
        .from('country_to_blogs')
        .insert({
          country_id: plan.country_id,
          blog_id: blog.id
        });
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
