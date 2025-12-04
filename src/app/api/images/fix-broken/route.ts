import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { replacebrokenImagesInHTML } from '@/lib/pexels';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * POST /api/images/fix-broken
 * Kırık görselleri otomatik düzelt
 */
export async function POST(request: NextRequest) {
  try {
    const { type, id } = await request.json();
    
    if (!type || !id) {
      return NextResponse.json(
        { error: 'Type and ID are required' },
        { status: 400 }
      );
    }
    
    if (type === 'blog') {
      // Blog içeriğindeki kırık görselleri düzelt
      const { data: blog, error: fetchError } = await supabase
        .from('blogs')
        .select('id, title, contents')
        .eq('id', id)
        .single();
      
      if (fetchError || !blog) {
        return NextResponse.json(
          { error: 'Blog not found' },
          { status: 404 }
        );
      }
      
      const { html: updatedContents, replacedCount } = await replacebrokenImagesInHTML(
        blog.contents || '',
        blog.title
      );
      
      if (replacedCount > 0) {
        const { error: updateError } = await supabase
          .from('blogs')
          .update({ contents: updatedContents })
          .eq('id', id);
        
        if (updateError) {
          return NextResponse.json(
            { error: 'Failed to update blog' },
            { status: 500 }
          );
        }
      }
      
      return NextResponse.json({
        success: true,
        replacedCount,
        message: `Fixed ${replacedCount} broken image(s)`,
      });
    } else if (type === 'country') {
      // Ülke içeriğindeki kırık görselleri düzelt
      const { data: country, error: fetchError } = await supabase
        .from('countries')
        .select('id, name, contents, price_contents, req_document')
        .eq('id', id)
        .single();
      
      if (fetchError || !country) {
        return NextResponse.json(
          { error: 'Country not found' },
          { status: 404 }
        );
      }
      
      let totalReplaced = 0;
      const updates: any = {};
      
      // Contents
      if (country.contents) {
        const { html, replacedCount } = await replacebrokenImagesInHTML(
          country.contents,
          country.name
        );
        if (replacedCount > 0) {
          updates.contents = html;
          totalReplaced += replacedCount;
        }
      }
      
      // Price contents
      if (country.price_contents) {
        const { html, replacedCount } = await replacebrokenImagesInHTML(
          country.price_contents,
          `${country.name} vize ücretleri`
        );
        if (replacedCount > 0) {
          updates.price_contents = html;
          totalReplaced += replacedCount;
        }
      }
      
      // Required documents
      if (country.req_document) {
        const { html, replacedCount } = await replacebrokenImagesInHTML(
          country.req_document,
          `${country.name} gerekli belgeler`
        );
        if (replacedCount > 0) {
          updates.req_document = html;
          totalReplaced += replacedCount;
        }
      }
      
      if (Object.keys(updates).length > 0) {
        const { error: updateError } = await supabase
          .from('countries')
          .update(updates)
          .eq('id', id);
        
        if (updateError) {
          return NextResponse.json(
            { error: 'Failed to update country' },
            { status: 500 }
          );
        }
      }
      
      return NextResponse.json({
        success: true,
        replacedCount: totalReplaced,
        message: `Fixed ${totalReplaced} broken image(s)`,
      });
    } else {
      return NextResponse.json(
        { error: 'Invalid type. Must be "blog" or "country"' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error fixing broken images:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
