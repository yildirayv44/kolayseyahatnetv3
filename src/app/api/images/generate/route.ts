import { NextRequest, NextResponse } from 'next/server';
import { searchPexelsPhotos, generateImageFromPrompt } from '@/lib/pexels';

/**
 * POST /api/images/generate
 * Prompt'tan görsel oluştur
 */
export async function POST(request: NextRequest) {
  try {
    const { prompt, orientation = 'landscape', perPage = 5 } = await request.json();
    
    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }
    
    // Pexels'ten görselleri ara
    const result = await searchPexelsPhotos(prompt, {
      perPage,
      orientation,
    });
    
    if (!result || result.photos.length === 0) {
      return NextResponse.json(
        { error: 'No images found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      photos: result.photos.map(photo => ({
        id: photo.id,
        url: photo.src.large,
        thumbnail: photo.src.medium,
        alt: photo.alt,
        photographer: photo.photographer,
        photographer_url: photo.photographer_url,
      })),
      total: result.total_results,
    });
  } catch (error) {
    console.error('Error generating image:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
