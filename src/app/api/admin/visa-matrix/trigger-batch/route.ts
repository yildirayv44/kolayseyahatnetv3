import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * POST /api/admin/visa-matrix/trigger-batch
 * 
 * Trigger background batch scraping for all source countries
 * This creates a job in the queue that will be processed by the cron worker
 */
export async function POST() {
  try {
    // Check if there's already a pending or processing job
    const { data: existingJobs } = await supabase
      .from('scraping_queue')
      .select('id, status')
      .in('status', ['pending', 'processing'])
      .limit(1);

    if (existingJobs && existingJobs.length > 0) {
      return NextResponse.json({
        error: 'A batch scraping job is already in progress',
        jobId: existingJobs[0].id,
        status: existingJobs[0].status,
      }, { status: 409 });
    }

    // Get total source countries count (exclude Turkey - TUR)
    const { count } = await supabase
      .from('countries')
      .select('id', { count: 'exact', head: true })
      .eq('is_source_country', true)
      .eq('status', 1)
      .neq('country_code', 'TUR');

    if (!count || count === 0) {
      return NextResponse.json({
        error: 'No source countries found',
      }, { status: 404 });
    }

    // Create new job in queue
    const { data: job, error } = await supabase
      .from('scraping_queue')
      .insert({
        status: 'pending',
        total_countries: count,
        processed_countries: 0,
        successful_countries: 0,
        failed_countries: 0,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating queue job:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log(`✅ Batch scraping job created: ${job.id} (${count} countries)`);

    return NextResponse.json({
      success: true,
      jobId: job.id,
      totalCountries: count,
      message: `Batch scraping job queued. Processing ${count} countries in background.`,
    });
  } catch (error: any) {
    console.error('Error triggering batch scraping:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * GET /api/admin/visa-matrix/trigger-batch
 * 
 * Get current queue status
 */
export async function GET() {
  try {
    const { data: jobs, error } = await supabase
      .from('scraping_queue')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) throw error;

    return NextResponse.json({ jobs });
  } catch (error: any) {
    console.error('Error fetching queue status:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
