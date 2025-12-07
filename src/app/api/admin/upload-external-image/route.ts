import { NextRequest, NextResponse } from 'next/server';
import { uploadImageToStorage } from '@/lib/uploadImageToStorage';

/**
 * Upload an external image (e.g., from Pexels) to our Supabase Storage
 * POST /api/admin/upload-external-image
 */
export async function POST(request: NextRequest) {
  try {
    const { imageUrl, folder = 'external-images' } = await request.json();

    if (!imageUrl) {
      return NextResponse.json(
        { success: false, error: 'Image URL is required' },
        { status: 400 }
      );
    }

    console.log(`📤 Uploading external image from: ${imageUrl}`);

    // Upload to Supabase Storage
    const permanentUrl = await uploadImageToStorage(imageUrl, folder);

    console.log(`✅ External image uploaded successfully: ${permanentUrl}`);

    return NextResponse.json({
      success: true,
      permanentUrl: permanentUrl,
      originalUrl: imageUrl,
    });

  } catch (error: any) {
    console.error('External image upload error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to upload external image',
      },
      { status: 500 }
    );
  }
}
