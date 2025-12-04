import { NextRequest, NextResponse } from 'next/server';
import { downloadAndUploadImage, STORAGE_BUCKETS } from '@/lib/storage';

/**
 * POST /api/admin/images/upload-from-url
 * Download image from URL and upload to Supabase Storage
 */
export async function POST(request: NextRequest) {
  try {
    const { url, bucket } = await request.json();

    if (!url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      );
    }

    // Determine bucket (default to blog-images)
    const targetBucket = bucket || STORAGE_BUCKETS.BLOGS;

    // Download and upload
    const result = await downloadAndUploadImage(url, targetBucket);

    if ('error' in result) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      url: result.url,
      path: result.path,
    });
  } catch (error) {
    console.error('Error uploading from URL:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
