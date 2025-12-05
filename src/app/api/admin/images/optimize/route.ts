import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';

/**
 * Optimize image - resize and compress
 * POST /api/admin/images/optimize
 */
export async function POST(request: NextRequest) {
  try {
    const { imageUrl, width = 1200, height = 630, quality = 80 } = await request.json();

    if (!imageUrl) {
      return NextResponse.json(
        { success: false, error: 'Image URL is required' },
        { status: 400 }
      );
    }

    // Fetch the image
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      return NextResponse.json(
        { success: false, error: 'Failed to fetch image' },
        { status: 400 }
      );
    }

    const imageBuffer = Buffer.from(await imageResponse.arrayBuffer());
    const originalSize = imageBuffer.length;

    // Get original image metadata
    const metadata = await sharp(imageBuffer).metadata();

    // Optimize image
    const optimizedBuffer = await sharp(imageBuffer)
      .resize(width, height, {
        fit: 'cover',
        position: 'center',
      })
      .jpeg({ quality, mozjpeg: true })
      .toBuffer();

    const optimizedSize = optimizedBuffer.length;
    const savings = ((originalSize - optimizedSize) / originalSize) * 100;

    // Convert to base64 for preview
    const base64 = optimizedBuffer.toString('base64');
    const dataUrl = `data:image/jpeg;base64,${base64}`;

    return NextResponse.json({
      success: true,
      optimized: {
        dataUrl,
        size: optimizedSize,
        width,
        height,
      },
      original: {
        size: originalSize,
        width: metadata.width,
        height: metadata.height,
        format: metadata.format,
      },
      savings: Math.round(savings),
    });
  } catch (error: any) {
    console.error('Image optimization error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Optimization failed' },
      { status: 500 }
    );
  }
}
