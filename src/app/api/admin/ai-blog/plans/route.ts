import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * GET /api/admin/ai-blog/plans
 * List all AI blog plans
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const country_id = searchParams.get('country_id');

    let query = supabase
      .from('ai_blog_plans')
      .select('*')
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    if (country_id) {
      query = query.eq('country_id', parseInt(country_id));
    }

    const { data: plans, error } = await query;

    if (error) {
      console.error('Plans fetch error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch plans' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      plans,
      count: plans?.length || 0
    });

  } catch (error: any) {
    console.error('Get plans error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch plans' },
      { status: 500 }
    );
  }
}
