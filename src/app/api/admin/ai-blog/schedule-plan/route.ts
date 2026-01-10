import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * POST /api/admin/ai-blog/schedule-plan
 * Schedule all approved content in a plan for daily publication
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { plan_id, start_date, frequency = 'daily' } = body;

    if (!plan_id || !start_date) {
      return NextResponse.json(
        { error: 'Plan ID and start date are required' },
        { status: 400 }
      );
    }

    // Validate date format
    const startDate = new Date(start_date);
    if (isNaN(startDate.getTime())) {
      return NextResponse.json(
        { error: 'Invalid date format. Use YYYY-MM-DD' },
        { status: 400 }
      );
    }

    // Update plan with scheduling info
    const { error: planError } = await supabase
      .from('ai_blog_plans')
      .update({
        start_publish_date: start_date,
        publish_frequency: frequency,
        auto_schedule: true
      })
      .eq('id', plan_id);

    if (planError) {
      throw new Error('Failed to update plan');
    }

    // Get topic IDs for this plan
    const { data: topics } = await supabase
      .from('ai_blog_topics')
      .select('id')
      .eq('plan_id', plan_id);

    if (!topics || topics.length === 0) {
      return NextResponse.json(
        { error: 'No topics found for this plan' },
        { status: 404 }
      );
    }

    const topicIds = topics.map(t => t.id);

    // Get all approved or review content for this plan (review content will be auto-approved)
    const { data: contents, error: contentsError } = await supabase
      .from('ai_blog_content')
      .select('id, topic_id, status')
      .in('status', ['approved', 'review'])
      .in('topic_id', topicIds)
      .order('created_at', { ascending: true });

    if (contentsError) {
      throw new Error('Failed to fetch contents');
    }

    if (!contents || contents.length === 0) {
      return NextResponse.json(
        { error: 'No content found for this plan' },
        { status: 404 }
      );
    }

    console.log(`Found ${contents.length} contents to schedule for plan ${plan_id}`);
    console.log(`Start date: ${start_date}, Frequency: ${frequency}`);

    // Schedule each content
    const scheduledContents = [];
    
    // Parse start date once
    const [year, month, day] = start_date.split('-').map(Number);
    const baseDate = new Date(Date.UTC(year, month - 1, day));
    console.log(`Base date parsed: ${baseDate.toISOString().split('T')[0]}`);
    
    for (let i = 0; i < contents.length; i++) {
      // Create new date for each content based on base date
      const publishDate = new Date(baseDate);
      
      if (frequency === 'daily') {
        publishDate.setUTCDate(baseDate.getUTCDate() + i);
      } else if (frequency === 'weekly') {
        publishDate.setUTCDate(baseDate.getUTCDate() + (i * 7));
      }

      const formattedDate = publishDate.toISOString().split('T')[0];
      
      console.log(`Scheduling content ${i + 1}/${contents.length}: ${contents[i].id} -> ${formattedDate} (offset: ${i} ${frequency === 'daily' ? 'days' : 'weeks'})`);

      const { data: updateData, error: updateError } = await supabase
        .from('ai_blog_content')
        .update({
          scheduled_publish_date: formattedDate,
          auto_publish: true,
          publish_order: i + 1,
          status: 'approved' // Auto-approve review content
        })
        .eq('id', contents[i].id)
        .select('id, scheduled_publish_date');

      if (updateError) {
        console.error(`❌ Failed to schedule content ${contents[i].id}:`, updateError);
      } else {
        console.log(`✅ Saved to DB: ${contents[i].id} -> ${updateData?.[0]?.scheduled_publish_date}`);
        scheduledContents.push({
          content_id: contents[i].id,
          publish_date: formattedDate,
          order: i + 1
        });
      }
    }

    return NextResponse.json({
      success: true,
      plan_id,
      scheduled_count: scheduledContents.length,
      start_date: start_date,
      end_date: scheduledContents[scheduledContents.length - 1]?.publish_date,
      frequency,
      schedule: scheduledContents,
      message: `${scheduledContents.length} içerik ${start_date} tarihinden itibaren ${frequency === 'daily' ? 'günlük' : 'haftalık'} olarak planlandı`
    });

  } catch (error: any) {
    console.error('Schedule plan error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to schedule plan' },
      { status: 500 }
    );
  }
}
