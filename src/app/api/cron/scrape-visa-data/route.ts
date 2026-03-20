import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

/**
 * GET /api/cron/scrape-visa-data
 * 
 * Cronjob endpoint that scrapes visa data for one country at a time
 * Run every 10 minutes to gradually scrape all source countries
 * 
 * This endpoint:
 * 1. Gets all source countries
 * 2. Finds the next country to scrape (round-robin based on last scrape time)
 * 3. Triggers scraping for that country
 * 4. Returns the result
 */

export async function GET(request: NextRequest) {
  try {
    // Verify this is a cron job (optional: add secret token verification)
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get all source countries
    const { data: sourceCountries, error: countriesError } = await supabase
      .from('countries')
      .select('id, name, country_code')
      .eq('is_source_country', true)
      .eq('status', 1)
      .order('country_code');

    if (countriesError || !sourceCountries || sourceCountries.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No source countries found',
        message: countriesError?.message || 'No source countries configured',
      });
    }

    // Get the last scraping log to determine which country to scrape next
    const { data: lastLog } = await supabase
      .from('scraping_logs')
      .select('source_country_code, completed_at')
      .order('completed_at', { ascending: false, nullsFirst: false })
      .limit(1)
      .maybeSingle();

    // Determine next country to scrape (round-robin)
    let nextCountry = sourceCountries[0];
    
    if (lastLog) {
      const lastIndex = sourceCountries.findIndex(
        c => c.country_code === lastLog.source_country_code
      );
      
      if (lastIndex !== -1 && lastIndex < sourceCountries.length - 1) {
        nextCountry = sourceCountries[lastIndex + 1];
      }
    }

    console.log(`Cronjob: Scraping visa data for ${nextCountry.name} (${nextCountry.country_code})`);

    // Trigger scraping for the next country
    const scrapeResponse = await fetch(`${request.nextUrl.origin}/api/admin/visa-matrix/scrape-passportindex`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sourceCountryCode: nextCountry.country_code,
      }),
    });

    const scrapeResult = await scrapeResponse.json();

    return NextResponse.json({
      success: true,
      country: nextCountry.name,
      countryCode: nextCountry.country_code,
      scrapeResult,
      message: `Scraped visa data for ${nextCountry.name}`,
    });

  } catch (error) {
    console.error('Cronjob error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
