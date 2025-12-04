import { NextRequest, NextResponse } from 'next/server';
import { searchPexelsPhotos, generateImageFromPrompt } from '@/lib/pexels';

/**
 * GET /api/images/generate?prompt=...&perPage=...&orientation=...
 * POST /api/images/generate
 * Prompt'tan görsel oluştur
 */
async function handleRequest(request: NextRequest) {
  try {
    let prompt: string;
    let orientation: 'landscape' | 'portrait' | 'square' = 'landscape';
    let perPage = 5;

    // Handle both GET and POST
    if (request.method === 'GET') {
      prompt = request.nextUrl.searchParams.get('prompt') || '';
      const orientationParam = request.nextUrl.searchParams.get('orientation');
      orientation = (orientationParam === 'portrait' || orientationParam === 'square') ? orientationParam : 'landscape';
      perPage = parseInt(request.nextUrl.searchParams.get('perPage') || '5');
    } else {
      const body = await request.json();
      prompt = body.prompt;
      orientation = body.orientation || 'landscape';
      perPage = body.perPage || 5;
    }
    
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
        url: photo.src.original, // Use original for best quality
        thumbnail: photo.src.large, // Use large for preview
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

export async function GET(request: NextRequest) {
  return handleRequest(request);
}

export async function POST(request: NextRequest) {
  return handleRequest(request);
}
