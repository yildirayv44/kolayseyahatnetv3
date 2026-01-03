import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// API endpoint to manually refresh the materialized view
// Can be called by cron jobs or manually from admin panel
export async function POST(request: NextRequest) {
  try {
    // Optional: Add authentication check
    // const authHeader = request.headers.get('authorization');
    // if (!authHeader || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    // Call the refresh function
    const { error } = await supabase.rpc('refresh_web_vitals_summary');

    if (error) {
      console.error('Error refreshing web vitals summary:', error);
      return NextResponse.json(
        { error: 'Failed to refresh summary', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Web Vitals summary refreshed successfully',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error in refresh endpoint:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET endpoint to check last refresh time
export async function GET(request: NextRequest) {
  try {
    // Query the materialized view to get the latest data timestamp
    const { data, error } = await supabase
      .from('web_vitals_summary')
      .select('date')
      .order('date', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      console.error('Error fetching summary info:', error);
      return NextResponse.json(
        { error: 'Failed to fetch summary info' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      lastDataDate: data?.date || null,
      message: 'Use POST to refresh the materialized view',
    });
  } catch (error) {
    console.error('Error in GET refresh endpoint:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
