import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * GET /api/cron/auto-publish
 * Cron job to automatically publish scheduled content
 * Run daily at 00:00 UTC
 */
export async function GET(request: NextRequest) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const today = new Date().toISOString().split('T')[0];

    // Get all content scheduled for today
    const { data: scheduledContent, error: fetchError } = await supabase
      .from('ai_blog_content')
      .select('*, ai_blog_topics(*, ai_blog_plans(country_id, country_slug))')
      .eq('auto_publish', true)
      .eq('scheduled_publish_date', today)
      .eq('status', 'approved')
      .is('blog_id', null);

    if (fetchError) {
      throw new Error('Failed to fetch scheduled content');
    }

    if (!scheduledContent || scheduledContent.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No content scheduled for today',
        published_count: 0
      });
    }

    const published = [];
    const failed = [];

    // Publish each content
    for (const content of scheduledContent) {
      try {
        const topic = content.ai_blog_topics;
        const plan = topic.ai_blog_plans;

        // Create blog entry
        const now = new Date().toISOString();
        const { data: blog, error: blogError } = await supabase
          .from('blogs')
          .insert({
            title: content.title,
            slug: content.slug,
            description: content.description,
            contents: content.content,
            image: content.cover_image_url || '',
            image_url: content.cover_image_url || '',
            category: getCategoryName(topic.category),
            home: 1,
            type: 1,
            sorted: 0,
            status: 1,
            created_at: now,
            updated_at: now
          })
          .select()
          .single();

        if (blogError) {
          throw blogError;
        }

        // Create taxonomy entry for routing
        const { error: taxonomyError } = await supabase
          .from('taxonomies')
          .insert({
            model_id: blog.id,
            type: 'Blog\\BlogController@detail',
            slug: `blog/${content.slug}`
          });

        if (taxonomyError) {
          console.error('Taxonomy creation error for blog', blog.id, ':', taxonomyError);
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
          .eq('id', content.id);

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

        published.push({
          content_id: content.id,
          blog_id: blog.id,
          slug: content.slug,
          title: content.title
        });

      } catch (error: any) {
        console.error(`Failed to publish content ${content.id}:`, error);
        failed.push({
          content_id: content.id,
          title: content.title,
          error: error.message
        });
      }
    }

    return NextResponse.json({
      success: true,
      date: today,
      scheduled_count: scheduledContent.length,
      published_count: published.length,
      failed_count: failed.length,
      published,
      failed
    });

  } catch (error: any) {
    console.error('Auto-publish cron error:', error);
    return NextResponse.json(
      { error: error.message || 'Auto-publish failed' },
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
