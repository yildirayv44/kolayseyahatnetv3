import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Service role key ile RLS bypass edilir
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
 * POST /api/admin/blogs/create
 * Create a new blog post using service role to bypass RLS
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        if (!body.title) {
            return NextResponse.json(
                { error: 'Blog başlığı zorunludur' },
                { status: 400 }
            );
        }

        const { data, error } = await supabase
            .from('blogs')
            .insert([body])
            .select()
            .single();

        if (error) {
            console.error('Blog create error:', error);
            return NextResponse.json(
                { error: 'Blog oluşturulamadı', details: error.message },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            data
        });

    } catch (error: any) {
        console.error('Create error:', error);
        return NextResponse.json(
            { error: 'Blog oluşturulamadı', details: error.message },
            { status: 500 }
        );
    }
}
