import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Create server-side Supabase client with service role key
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

interface UpdateRequest {
  id: number;
  type: 'blog' | 'country' | 'page';
  field: string;
  value: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: UpdateRequest = await request.json();
    const { id, type, field, value } = body;

    if (!id || !type || !field) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate field names to prevent SQL injection
    const allowedFields: Record<string, string[]> = {
      blog: ['title', 'title_en', 'meta_title', 'meta_title_en', 'description', 'description_en', 'contents', 'contents_en'],
      country: ['title', 'title_en', 'meta_title', 'meta_title_en', 'description', 'description_en', 'contents', 'contents_en'],
      page: ['title', 'title_en', 'meta_description', 'meta_description_en', 'content', 'content_en'],
    };

    if (!allowedFields[type]?.includes(field)) {
      return NextResponse.json(
        { success: false, error: `Invalid field: ${field}` },
        { status: 400 }
      );
    }

    // Get table name
    const tableMap: Record<string, string> = {
      blog: 'blogs',
      country: 'countries',
      page: 'custom_pages',
    };

    const tableName = tableMap[type];

    // Update the record
    const { error } = await supabase
      .from(tableName)
      .update({ [field]: value })
      .eq('id', id);

    if (error) {
      console.error('Update error:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `${field} updated successfully`,
    });
  } catch (error: any) {
    console.error('SEO update error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// Bulk update endpoint
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, type, updates } = body;

    if (!id || !type || !updates || typeof updates !== 'object') {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate all field names
    const allowedFields: Record<string, string[]> = {
      blog: ['title', 'title_en', 'meta_title', 'meta_title_en', 'description', 'description_en', 'contents', 'contents_en'],
      country: ['title', 'title_en', 'meta_title', 'meta_title_en', 'description', 'description_en', 'contents', 'contents_en'],
      page: ['title', 'title_en', 'meta_description', 'meta_description_en', 'content', 'content_en'],
    };

    const validUpdates: Record<string, string> = {};
    for (const [field, value] of Object.entries(updates)) {
      if (allowedFields[type]?.includes(field)) {
        validUpdates[field] = value as string;
      }
    }

    if (Object.keys(validUpdates).length === 0) {
      return NextResponse.json(
        { success: false, error: 'No valid fields to update' },
        { status: 400 }
      );
    }

    // Get table name
    const tableMap: Record<string, string> = {
      blog: 'blogs',
      country: 'countries',
      page: 'custom_pages',
    };

    const tableName = tableMap[type];

    // Update the record
    const { error } = await supabase
      .from(tableName)
      .update(validUpdates)
      .eq('id', id);

    if (error) {
      console.error('Bulk update error:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `${Object.keys(validUpdates).length} fields updated successfully`,
      updated_fields: Object.keys(validUpdates),
    });
  } catch (error: any) {
    console.error('SEO bulk update error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
