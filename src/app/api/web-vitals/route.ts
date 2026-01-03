import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Helper to determine metric rating based on Google's Core Web Vitals thresholds
function getMetricRating(name: string, value: number): string {
  const thresholds: Record<string, { good: number; poor: number }> = {
    CLS: { good: 0.1, poor: 0.25 },
    FID: { good: 100, poor: 300 },
    LCP: { good: 2500, poor: 4000 },
    FCP: { good: 1800, poor: 3000 },
    TTFB: { good: 800, poor: 1800 },
    INP: { good: 200, poor: 500 },
  };

  const threshold = thresholds[name];
  if (!threshold) return 'unknown';

  if (value <= threshold.good) return 'good';
  if (value <= threshold.poor) return 'needs-improvement';
  return 'poor';
}

// Helper to detect device type from user agent
function getDeviceType(userAgent: string): string {
  const ua = userAgent.toLowerCase();
  if (/mobile|android|iphone|ipod|blackberry|iemobile|opera mini/i.test(ua)) {
    return 'mobile';
  }
  if (/tablet|ipad|playbook|silk/i.test(ua)) {
    return 'tablet';
  }
  return 'desktop';
}

// Helper to get connection type (if available)
function getConnectionType(request: NextRequest): string | null {
  // This would require client to send connection info
  // For now, we'll return null and handle it client-side
  return null;
}

// POST endpoint - Save web vital metric
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, value, id, rating, navigationType } = body;

    // Validate required fields
    if (!name || value === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: name, value' },
        { status: 400 }
      );
    }

    // Get user agent and other metadata
    const userAgent = request.headers.get('user-agent') || '';
    const referer = request.headers.get('referer') || '';
    
    // Parse URL to get page path and locale
    let pageUrl = '/';
    let locale = 'tr';
    
    if (referer) {
      try {
        const url = new URL(referer);
        pageUrl = url.pathname;
        locale = url.pathname.startsWith('/en') ? 'en' : 'tr';
      } catch (e) {
        // Invalid URL, use defaults
      }
    }

    // Determine metric rating
    const metricRating = getMetricRating(name, value);
    const deviceType = getDeviceType(userAgent);

    // Insert into database
    const { error } = await supabase.from('web_vitals').insert({
      metric_name: name,
      metric_value: value,
      metric_rating: metricRating,
      page_url: pageUrl,
      user_agent: userAgent,
      device_type: deviceType,
      locale,
    });

    if (error) {
      console.error('Error inserting web vital:', error);
      return NextResponse.json(
        { error: 'Failed to save metric' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error processing web vital:', error);
    return NextResponse.json(
      { error: 'Invalid request' },
      { status: 400 }
    );
  }
}

// GET endpoint - Retrieve web vitals data for admin dashboard
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '7');
    const metricName = searchParams.get('metric');
    const deviceType = searchParams.get('device');
    const locale = searchParams.get('locale');
    const pageUrl = searchParams.get('page');

    // Build query
    let query = supabase
      .from('web_vitals')
      .select('*')
      .gte('created_at', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: false });

    // Apply filters
    if (metricName) {
      query = query.eq('metric_name', metricName);
    }
    if (deviceType) {
      query = query.eq('device_type', deviceType);
    }
    if (locale) {
      query = query.eq('locale', locale);
    }
    if (pageUrl) {
      query = query.eq('page_url', pageUrl);
    }

    const { data, error } = await query.limit(10000);

    if (error) {
      console.error('Error fetching web vitals:', error);
      return NextResponse.json(
        { error: 'Failed to fetch metrics' },
        { status: 500 }
      );
    }

    // Calculate aggregated stats
    const stats = data?.reduce((acc: any, item: any) => {
      const metric = item.metric_name;
      if (!acc[metric]) {
        acc[metric] = {
          values: [],
          ratings: { good: 0, 'needs-improvement': 0, poor: 0 },
          byDevice: {},
          byPage: {},
        };
      }
      
      acc[metric].values.push(item.metric_value);
      acc[metric].ratings[item.metric_rating as string]++;
      
      // Group by device
      if (!acc[metric].byDevice[item.device_type]) {
        acc[metric].byDevice[item.device_type] = [];
      }
      acc[metric].byDevice[item.device_type].push(item.metric_value);
      
      // Group by page (top 10 pages)
      if (!acc[metric].byPage[item.page_url]) {
        acc[metric].byPage[item.page_url] = [];
      }
      acc[metric].byPage[item.page_url].push(item.metric_value);
      
      return acc;
    }, {});

    // Calculate percentiles and averages
    const summary = Object.entries(stats || {}).map(([metric, data]: [string, any]) => {
      const sorted = data.values.sort((a: number, b: number) => a - b);
      const p50 = sorted[Math.floor(sorted.length * 0.5)];
      const p75 = sorted[Math.floor(sorted.length * 0.75)];
      const p95 = sorted[Math.floor(sorted.length * 0.95)];
      const avg = sorted.reduce((a: number, b: number) => a + b, 0) / sorted.length;

      // Calculate device breakdown
      const deviceBreakdown = Object.entries(data.byDevice).map(([device, values]: [string, any]) => {
        const deviceSorted = values.sort((a: number, b: number) => a - b);
        const deviceP75 = deviceSorted[Math.floor(deviceSorted.length * 0.75)];
        return {
          device,
          count: values.length,
          p75: Math.round(deviceP75),
        };
      });

      // Get top 10 slowest pages
      const pageBreakdown = Object.entries(data.byPage)
        .map(([page, values]: [string, any]) => {
          const pageSorted = values.sort((a: number, b: number) => a - b);
          const pageP75 = pageSorted[Math.floor(pageSorted.length * 0.75)];
          return {
            page,
            count: values.length,
            p75: Math.round(pageP75),
          };
        })
        .sort((a, b) => b.p75 - a.p75)
        .slice(0, 10);

      return {
        metric,
        count: sorted.length,
        avg: Math.round(avg),
        p50: Math.round(p50),
        p75: Math.round(p75),
        p95: Math.round(p95),
        min: Math.round(sorted[0]),
        max: Math.round(sorted[sorted.length - 1]),
        ratings: data.ratings,
        deviceBreakdown,
        pageBreakdown,
      };
    });

    // Calculate Core Web Vitals pass rate
    const coreWebVitals = ['LCP', 'FID', 'CLS', 'INP'];
    const cwvStatus = coreWebVitals.map(metric => {
      const metricData = summary.find(s => s.metric === metric);
      if (!metricData) return null;
      
      const totalRatings = metricData.ratings.good + metricData.ratings['needs-improvement'] + metricData.ratings.poor;
      const goodPercentage = totalRatings > 0 ? Math.round((metricData.ratings.good / totalRatings) * 100) : 0;
      
      return {
        metric,
        goodPercentage,
        isPassing: goodPercentage >= 75,
      };
    }).filter(Boolean);

    return NextResponse.json({
      data,
      summary,
      coreWebVitals: cwvStatus,
      totalSamples: data?.length || 0,
      dateRange: {
        from: new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString(),
        to: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Error in GET web vitals:', error);
    return NextResponse.json(
      { error: 'Invalid request' },
      { status: 400 }
    );
  }
}
