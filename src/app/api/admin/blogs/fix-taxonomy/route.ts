import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

/**
 * POST /api/admin/blogs/fix-taxonomy
 * Fix missing taxonomy entries for blogs
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { blog_id, slug } = body;

    if (!blog_id || !slug) {
      return NextResponse.json(
        { error: 'Blog ID and slug are required' },
        { status: 400 }
      );
    }

    // Check if taxonomy already exists
    const { data: existing } = await supabase
      .from('taxonomies')
      .select('id')
      .eq('model_id', blog_id)
      .eq('type', 'Blog\\BlogController@detail')
      .maybeSingle();

    if (existing) {
      return NextResponse.json({
        success: true,
        message: 'Taxonomy already exists',
        existing: true
      });
    }

    // Create taxonomy entry
    const { error: taxonomyError } = await supabase
      .from('taxonomies')
      .insert({
        model_id: blog_id,
        type: 'Blog\\BlogController@detail',
        slug: `blog/${slug}`
      });

    if (taxonomyError) {
      console.error('Taxonomy creation error:', taxonomyError);
      return NextResponse.json(
        { error: 'Failed to create taxonomy', details: taxonomyError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Taxonomy created successfully'
    });

  } catch (error: any) {
    console.error('Fix taxonomy error:', error);
    return NextResponse.json(
      { error: 'Failed to fix taxonomy', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * GET /api/admin/blogs/fix-taxonomy
 * Fix all blogs missing taxonomy entries
 */
export async function GET() {
  try {
    // Get all active blogs
    const { data: blogs } = await supabase
      .from('blogs')
      .select('id, slug')
      .eq('status', 1);

    if (!blogs || blogs.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No blogs found',
        fixed: 0
      });
    }

    let fixed = 0;
    const errors = [];

    for (const blog of blogs) {
      // Check if taxonomy exists
      const { data: existing } = await supabase
        .from('taxonomies')
        .select('id')
        .eq('model_id', blog.id)
        .eq('type', 'Blog\\BlogController@detail')
        .maybeSingle();

      if (!existing && blog.slug) {
        // Create taxonomy entry
        const { error } = await supabase
          .from('taxonomies')
          .insert({
            model_id: blog.id,
            type: 'Blog\\BlogController@detail',
            slug: `blog/${blog.slug}`
          });

        if (error) {
          errors.push({ blog_id: blog.id, error: error.message });
        } else {
          fixed++;
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `Fixed ${fixed} blogs`,
      fixed,
      total: blogs.length,
      errors: errors.length > 0 ? errors : undefined
    });

  } catch (error: any) {
    console.error('Fix all taxonomies error:', error);
    return NextResponse.json(
      { error: 'Failed to fix taxonomies', details: error.message },
      { status: 500 }
    );
  }
}
