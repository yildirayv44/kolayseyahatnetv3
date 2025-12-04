import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { downloadAndUploadImage, STORAGE_BUCKETS } from '@/lib/storage';
import { searchPexelsPhotos } from '@/lib/pexels';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * POST /api/admin/images/replace
 * Replace an image in content
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      sourceType, 
      sourceId, 
      field, 
      oldUrl, 
      newImageUrl, 
      searchQuery 
    } = body;

    if (!sourceType || !sourceId || !field || !oldUrl) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    let finalImageUrl = newImageUrl;

    // If search query provided, search Pexels
    if (searchQuery && !newImageUrl) {
      const pexelsResult = await searchPexelsPhotos(searchQuery, {
        perPage: 1,
        orientation: 'landscape',
      });

      if (!pexelsResult || pexelsResult.photos.length === 0) {
        return NextResponse.json(
          { error: 'No images found on Pexels' },
          { status: 404 }
        );
      }

      finalImageUrl = pexelsResult.photos[0].src.large;
    }

    if (!finalImageUrl) {
      return NextResponse.json(
        { error: 'No image URL provided' },
        { status: 400 }
      );
    }

    // Download and upload image to our storage
    const bucket = sourceType === 'blog' ? STORAGE_BUCKETS.BLOGS : STORAGE_BUCKETS.COUNTRIES;
    const uploadResult = await downloadAndUploadImage(finalImageUrl, bucket);

    if ('error' in uploadResult) {
      return NextResponse.json(
        { error: uploadResult.error },
        { status: 500 }
      );
    }

    const newUrl = uploadResult.url;

    // Update database
    const tableName = sourceType === 'blog' ? 'blogs' : 'countries';
    
    if (field === 'image_url') {
      // Direct field update
      const { error: updateError } = await supabase
        .from(tableName)
        .update({ [field]: newUrl })
        .eq('id', sourceId);

      if (updateError) {
        return NextResponse.json(
          { error: updateError.message },
          { status: 500 }
        );
      }
    } else {
      // HTML content update
      const { data: record, error: fetchError } = await supabase
        .from(tableName)
        .select(field)
        .eq('id', sourceId)
        .single();

      if (fetchError || !record) {
        return NextResponse.json(
          { error: 'Record not found' },
          { status: 404 }
        );
      }

      const oldContent = record[field] || '';
      const newContent = oldContent.replace(
        new RegExp(`src="${oldUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"`, 'g'),
        `src="${newUrl}"`
      );

      const { error: updateError } = await supabase
        .from(tableName)
        .update({ [field]: newContent })
        .eq('id', sourceId);

      if (updateError) {
        return NextResponse.json(
          { error: updateError.message },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      newUrl,
      message: 'Image replaced successfully',
    });
  } catch (error) {
    console.error('Error replacing image:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
