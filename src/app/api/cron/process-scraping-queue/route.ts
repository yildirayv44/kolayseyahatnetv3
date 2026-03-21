import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * GET /api/cron/process-scraping-queue
 * 
 * Cron worker that processes scraping queue
 * Runs every minute and processes one country at a time
 */
export async function GET(request: NextRequest) {
  try {
    // Verify cron secret (temporarily disabled for initial setup)
    // TODO: Enable this after CRON_SECRET is set in Vercel
    // const authHeader = request.headers.get('authorization');
    // if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    console.log('🔄 Checking scraping queue...');

    // Get pending job (oldest first)
    const { data: pendingJobs } = await supabase
      .from('scraping_queue')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: true })
      .limit(1);

    // If no pending jobs, check for processing jobs that might be stuck
    if (!pendingJobs || pendingJobs.length === 0) {
      const { data: processingJobs } = await supabase
        .from('scraping_queue')
        .select('*')
        .eq('status', 'processing')
        .order('updated_at', { ascending: true })
        .limit(1);

      if (!processingJobs || processingJobs.length === 0) {
        console.log('✅ No jobs in queue');
        return NextResponse.json({ message: 'No jobs in queue' });
      }

      // Continue processing the existing job
      const job = processingJobs[0];
      console.log(`📋 Continuing job ${job.id} (${job.processed_countries}/${job.total_countries})`);
      
      return await processNextCountry(job);
    }

    // Start processing the pending job
    const job = pendingJobs[0];
    console.log(`🚀 Starting job ${job.id} (${job.total_countries} countries)`);

    // Update job status to processing
    await supabase
      .from('scraping_queue')
      .update({
        status: 'processing',
        started_at: new Date().toISOString(),
      })
      .eq('id', job.id);

    return await processNextCountry(job);
  } catch (error: any) {
    console.error('❌ Cron worker error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

async function processNextCountry(job: any) {
  try {
    // Get all source countries
    const { data: sourceCountries, error: countriesError } = await supabase
      .from('countries')
      .select('id, name, country_code, flag_emoji')
      .eq('is_source_country', true)
      .eq('status', 1)
      .order('passport_rank', { ascending: true, nullsFirst: false });

    if (countriesError) throw countriesError;
    if (!sourceCountries || sourceCountries.length === 0) {
      throw new Error('No source countries found');
    }

    // Get the next country to process
    const nextCountryIndex = job.processed_countries;
    
    if (nextCountryIndex >= sourceCountries.length) {
      // All countries processed - mark job as completed
      await supabase
        .from('scraping_queue')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
        })
        .eq('id', job.id);

      console.log(`✅ Job ${job.id} completed! Processed ${job.successful_countries}/${job.total_countries} countries`);

      return NextResponse.json({
        success: true,
        message: 'Job completed',
        jobId: job.id,
        processed: job.successful_countries,
        failed: job.failed_countries,
      });
    }

    const country = sourceCountries[nextCountryIndex];
    console.log(`\n🌍 [${nextCountryIndex + 1}/${sourceCountries.length}] Processing: ${country.flag_emoji} ${country.name} (${country.country_code})`);

    // Update job with current country
    await supabase
      .from('scraping_queue')
      .update({
        current_country_code: country.country_code,
        current_country_name: country.name,
      })
      .eq('id', job.id);

    // Call the scrape endpoint for this country
    // Use VERCEL_URL in production, localhost in development
    const baseUrl = process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}`
      : process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    
    const scrapeUrl = `${baseUrl}/api/admin/visa-matrix/scrape-passportindex`;
    
    console.log(`📡 Calling scrape endpoint: ${scrapeUrl}`);
    
    const scrapeResponse = await fetch(scrapeUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sourceCountryCode: country.country_code,
      }),
    });

    const scrapeData = await scrapeResponse.json();

    if (scrapeResponse.ok) {
      console.log(`✅ Success: ${scrapeData.scraped} countries scraped`);
      
      // Update job progress - increment successful
      await supabase
        .from('scraping_queue')
        .update({
          processed_countries: nextCountryIndex + 1,
          successful_countries: job.successful_countries + 1,
        })
        .eq('id', job.id);

      return NextResponse.json({
        success: true,
        jobId: job.id,
        country: country.name,
        scraped: scrapeData.scraped,
        progress: {
          current: nextCountryIndex + 1,
          total: sourceCountries.length,
          percentage: Math.round(((nextCountryIndex + 1) / sourceCountries.length) * 100),
        },
      });
    } else {
      console.error(`❌ Failed: ${scrapeData.error}`);
      
      // Update job progress - increment failed
      await supabase
        .from('scraping_queue')
        .update({
          processed_countries: nextCountryIndex + 1,
          failed_countries: job.failed_countries + 1,
          error_message: scrapeData.error,
        })
        .eq('id', job.id);

      return NextResponse.json({
        success: false,
        jobId: job.id,
        country: country.name,
        error: scrapeData.error,
        progress: {
          current: nextCountryIndex + 1,
          total: sourceCountries.length,
          percentage: Math.round(((nextCountryIndex + 1) / sourceCountries.length) * 100),
        },
      });
    }
  } catch (error: any) {
    console.error(`❌ Error processing country:`, error);
    
    // Update job with error
    await supabase
      .from('scraping_queue')
      .update({
        status: 'failed',
        error_message: error.message,
        completed_at: new Date().toISOString(),
      })
      .eq('id', job.id);

    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
