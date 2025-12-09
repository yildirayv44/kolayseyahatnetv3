import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * GET /api/admin/content/list?type=country|blog
 * List all countries or blogs for content selection
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type');

    if (!type || !['country', 'blog'].includes(type)) {
      return NextResponse.json(
        { error: 'Type must be "country" or "blog"' },
        { status: 400 }
      );
    }

    if (type === 'country') {
      const { data: countries, error } = await supabase
        .from('countries')
        .select('id, name, slug, contents, description')
        .eq('status', 1)
        .order('name');

      if (error) {
        throw error;
      }

      return NextResponse.json({
        success: true,
        items: countries?.map(c => ({
          id: c.id,
          title: c.name,
          slug: c.slug,
          content: c.contents || '',
          description: c.description || '',
          url: `https://www.kolayseyahat.net/${c.slug}`,
        })) || [],
      });
    } else {
      const { data: blogs, error } = await supabase
        .from('blogs')
        .select('id, title, slug, contents, description')
        .eq('status', 1)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) {
        throw error;
      }

      return NextResponse.json({
        success: true,
        items: blogs?.map(b => ({
          id: b.id,
          title: b.title,
          slug: b.slug,
          content: b.contents || '',
          description: b.description || '',
          url: `https://www.kolayseyahat.net/blog/${b.slug}`,
        })) || [],
      });
    }
  } catch (error: any) {
    console.error('Content list error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
