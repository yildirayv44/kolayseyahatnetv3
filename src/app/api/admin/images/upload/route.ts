// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server';
import { uploadImage, STORAGE_BUCKETS } from '@/lib/storage';

/**
 * POST /api/admin/images/upload
 * Upload image file
 */
export async function POST(request: NextRequest) {
  try {
    const data = await request.formData();
    const file = data.get('file') as File | null;
    const bucketValue = data.get('bucket');
    const bucket = (bucketValue as string) || STORAGE_BUCKETS.BLOGS;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Upload to storage
    const result = await uploadImage(file, bucket);

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
    console.error('Error uploading image:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
