import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Core Web Vitals thresholds for "passing" (75% of samples must be "good")
const PASSING_THRESHOLD = 75;

// Email notification function (you can replace with your email service)
async function sendAlert(metric: string, goodPercentage: number, details: any) {
  // TODO: Implement email notification
  // Example with SendGrid, Resend, or your email service:
  /*
  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'alerts@kolayseyahat.net',
      to: 'admin@kolayseyahat.net',
      subject: `⚠️ Core Web Vitals Alert: ${metric} Failing`,
      html: `
        <h2>Core Web Vitals Alert</h2>
        <p><strong>${metric}</strong> is currently failing with only ${goodPercentage}% good samples.</p>
        <p>Threshold: ${PASSING_THRESHOLD}%</p>
        <h3>Details:</h3>
        <ul>
          <li>P75 Value: ${details.p75}</li>
          <li>Good: ${details.ratings.good}</li>
          <li>Needs Improvement: ${details.ratings['needs-improvement']}</li>
          <li>Poor: ${details.ratings.poor}</li>
        </ul>
      `,
    }),
  });
  */
  
  console.log(`🚨 ALERT: ${metric} failing with ${goodPercentage}% good samples`);
  console.log('Details:', details);
}

// Slack notification function
async function sendSlackAlert(metric: string, goodPercentage: number, details: any) {
  if (!process.env.SLACK_WEBHOOK_URL) {
    return;
  }

  try {
    await fetch(process.env.SLACK_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: `⚠️ Core Web Vitals Alert`,
        blocks: [
          {
            type: 'header',
            text: {
              type: 'plain_text',
              text: '⚠️ Core Web Vitals Alert',
            },
          },
          {
            type: 'section',
            fields: [
              {
                type: 'mrkdwn',
                text: `*Metric:*\n${metric}`,
              },
              {
                type: 'mrkdwn',
                text: `*Good Percentage:*\n${goodPercentage}%`,
              },
              {
                type: 'mrkdwn',
                text: `*P75 Value:*\n${details.p75}`,
              },
              {
                type: 'mrkdwn',
                text: `*Threshold:*\n${PASSING_THRESHOLD}%`,
              },
            ],
          },
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `*Distribution:*\n• Good: ${details.ratings.good}\n• Needs Improvement: ${details.ratings['needs-improvement']}\n• Poor: ${details.ratings.poor}`,
            },
          },
          {
            type: 'actions',
            elements: [
              {
                type: 'button',
                text: {
                  type: 'plain_text',
                  text: 'View Dashboard',
                },
                url: 'https://www.kolayseyahat.net/admin/analytics',
              },
            ],
          },
        ],
      }),
    });
  } catch (error) {
    console.error('Error sending Slack alert:', error);
  }
}

// Check Core Web Vitals and send alerts if failing
export async function POST(request: NextRequest) {
  try {
    // Optional: Add authentication
    // const authHeader = request.headers.get('authorization');
    // if (!authHeader || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '7');

    // Fetch recent web vitals data
    const { data, error } = await supabase
      .from('web_vitals')
      .select('*')
      .gte('created_at', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching web vitals:', error);
      return NextResponse.json(
        { error: 'Failed to fetch metrics' },
        { status: 500 }
      );
    }

    // Calculate stats for Core Web Vitals
    const coreMetrics = ['LCP', 'FID', 'CLS', 'INP'];
    const alerts: any[] = [];

    for (const metricName of coreMetrics) {
      const metricData = data?.filter((d) => d.metric_name === metricName);
      
      if (!metricData || metricData.length === 0) {
        continue;
      }

      // Calculate ratings
      const ratings = {
        good: metricData.filter((d) => d.metric_rating === 'good').length,
        'needs-improvement': metricData.filter((d) => d.metric_rating === 'needs-improvement').length,
        poor: metricData.filter((d) => d.metric_rating === 'poor').length,
      };

      const total = ratings.good + ratings['needs-improvement'] + ratings.poor;
      const goodPercentage = Math.round((ratings.good / total) * 100);

      // Calculate P75
      const sorted = metricData.map((d) => d.metric_value).sort((a, b) => a - b);
      const p75 = sorted[Math.floor(sorted.length * 0.75)];

      // Check if failing
      if (goodPercentage < PASSING_THRESHOLD) {
        const alertDetails = {
          metric: metricName,
          goodPercentage,
          p75,
          ratings,
          total,
          timestamp: new Date().toISOString(),
        };

        alerts.push(alertDetails);

        // Send notifications
        await sendAlert(metricName, goodPercentage, alertDetails);
        await sendSlackAlert(metricName, goodPercentage, alertDetails);
      }
    }

    return NextResponse.json({
      success: true,
      alerts,
      message: alerts.length > 0 
        ? `${alerts.length} Core Web Vitals metric(s) failing`
        : 'All Core Web Vitals passing',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error in check-alerts endpoint:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET endpoint to view current status without sending alerts
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '7');

    // Fetch recent web vitals data
    const { data, error } = await supabase
      .from('web_vitals')
      .select('*')
      .gte('created_at', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString());

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch metrics' },
        { status: 500 }
      );
    }

    // Calculate stats for Core Web Vitals
    const coreMetrics = ['LCP', 'FID', 'CLS', 'INP'];
    const status: any[] = [];

    for (const metricName of coreMetrics) {
      const metricData = data?.filter((d) => d.metric_name === metricName);
      
      if (!metricData || metricData.length === 0) {
        status.push({
          metric: metricName,
          status: 'no-data',
          message: 'No data available',
        });
        continue;
      }

      const ratings = {
        good: metricData.filter((d) => d.metric_rating === 'good').length,
        'needs-improvement': metricData.filter((d) => d.metric_rating === 'needs-improvement').length,
        poor: metricData.filter((d) => d.metric_rating === 'poor').length,
      };

      const total = ratings.good + ratings['needs-improvement'] + ratings.poor;
      const goodPercentage = Math.round((ratings.good / total) * 100);

      status.push({
        metric: metricName,
        status: goodPercentage >= PASSING_THRESHOLD ? 'passing' : 'failing',
        goodPercentage,
        threshold: PASSING_THRESHOLD,
        ratings,
        total,
      });
    }

    return NextResponse.json({
      status,
      passingCount: status.filter((s) => s.status === 'passing').length,
      failingCount: status.filter((s) => s.status === 'failing').length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error in GET check-alerts endpoint:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
