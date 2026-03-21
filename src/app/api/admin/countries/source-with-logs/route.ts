import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * GET /api/admin/countries/source-with-logs
 * 
 * Get all source countries with their last scraping log info
 */
export async function GET() {
  try {
    // Get all source countries
    const { data: countries, error: countriesError } = await supabase
      .from('countries')
      .select('id, name, country_code, is_source_country, passport_rank, flag_emoji')
      .eq('is_source_country', true)
      .eq('status', 1)
      .neq('country_code', 'TUR')
      .order('passport_rank', { ascending: true, nullsFirst: false });

    if (countriesError) throw countriesError;

    // Get last scraping log for each country
    const countriesWithLogs = await Promise.all(
      (countries || []).map(async (country) => {
        const { data: lastLog } = await supabase
          .from('scraping_logs')
          .select('completed_at, countries_scraped, status')
          .eq('source_country_code', country.country_code)
          .eq('status', 'completed')
          .order('completed_at', { ascending: false, nullsFirst: false })
          .limit(1)
          .maybeSingle();

        return {
          ...country,
          lastScraped: lastLog?.completed_at || null,
          lastScrapedCount: lastLog?.countries_scraped || null,
        };
      })
    );

    return NextResponse.json(countriesWithLogs);
  } catch (error: any) {
    console.error('Error fetching source countries with logs:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
