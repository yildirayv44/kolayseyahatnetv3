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

        // Başlıktan slug oluştur
        const slug = body.title
            .toLowerCase()
            .replace(/ğ/g, 'g')
            .replace(/ü/g, 'u')
            .replace(/ş/g, 's')
            .replace(/ı/g, 'i')
            .replace(/ö/g, 'o')
            .replace(/ç/g, 'c')
            .replace(/[^a-z0-9]/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '');

        const blogData = {
            ...body,
            slug,
            home: body.home !== undefined ? body.home : 0,
            type: body.type !== undefined ? body.type : 1,
        };

        const { data, error } = await supabase
            .from('blogs')
            .insert([blogData])
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
