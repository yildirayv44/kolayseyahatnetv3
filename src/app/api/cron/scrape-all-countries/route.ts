import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * GET /api/cron/scrape-all-countries
 * 
 * Batch scraping: Scrape visa data for ALL source countries sequentially
 * with delays between each country to avoid rate limiting
 */
export async function GET(request: NextRequest) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('🚀 Starting batch scraping for all source countries...');

    // Get all source countries
    const { data: sourceCountries, error: countriesError } = await supabase
      .from('countries')
      .select('id, name, country_code, flag_emoji')
      .eq('is_source_country', true)
      .eq('status', 1)
      .order('passport_rank', { ascending: true, nullsFirst: false });

    if (countriesError) {
      console.error('Error fetching source countries:', countriesError);
      return NextResponse.json({ error: countriesError.message }, { status: 500 });
    }

    if (!sourceCountries || sourceCountries.length === 0) {
      return NextResponse.json({ error: 'No source countries found' }, { status: 404 });
    }

    console.log(`📊 Found ${sourceCountries.length} source countries to scrape`);

    const results = [];
    let totalSuccess = 0;
    let totalFailed = 0;

    // Process each country sequentially
    for (let i = 0; i < sourceCountries.length; i++) {
      const country = sourceCountries[i];
      const isLast = i === sourceCountries.length - 1;

      console.log(`\n🌍 [${i + 1}/${sourceCountries.length}] Processing: ${country.flag_emoji} ${country.name} (${country.country_code})`);

      try {
        // Call the scrape endpoint for this country
        const scrapeUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/admin/visa-matrix/scrape-passportindex`;
        
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
          totalSuccess++;
          results.push({
            country: country.name,
            code: country.country_code,
            status: 'success',
            scraped: scrapeData.scraped,
            skipped: scrapeData.skipped,
          });
        } else {
          console.error(`❌ Failed: ${scrapeData.error}`);
          totalFailed++;
          results.push({
            country: country.name,
            code: country.country_code,
            status: 'failed',
            error: scrapeData.error,
          });
        }
      } catch (error: any) {
        console.error(`❌ Exception for ${country.name}:`, error.message);
        totalFailed++;
        results.push({
          country: country.name,
          code: country.country_code,
          status: 'failed',
          error: error.message,
        });
      }

      // Add delay between countries (except for the last one)
      if (!isLast) {
        const delaySeconds = 5; // 5 seconds between countries
        console.log(`⏳ Waiting ${delaySeconds} seconds before next country...`);
        await new Promise(resolve => setTimeout(resolve, delaySeconds * 1000));
      }
    }

    console.log('\n🎉 Batch scraping completed!');
    console.log(`✅ Successful: ${totalSuccess}`);
    console.log(`❌ Failed: ${totalFailed}`);

    return NextResponse.json({
      success: true,
      message: 'Batch scraping completed',
      summary: {
        total: sourceCountries.length,
        successful: totalSuccess,
        failed: totalFailed,
      },
      results,
    });
  } catch (error: any) {
    console.error('Batch scraping error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
