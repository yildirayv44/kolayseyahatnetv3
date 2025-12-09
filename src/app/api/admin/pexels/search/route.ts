import { NextRequest, NextResponse } from 'next/server';
import { searchPexelsPhotos } from '@/lib/pexels';

/**
 * GET /api/admin/pexels/search
 * Search Pexels for photos
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('query');
    const perPage = parseInt(searchParams.get('perPage') || '15');
    const page = parseInt(searchParams.get('page') || '1');

    if (!query) {
      return NextResponse.json(
        { error: 'Query parameter is required' },
        { status: 400 }
      );
    }

    const result = await searchPexelsPhotos(query, {
      perPage,
      page,
      orientation: 'landscape',
    });

    if (!result) {
      return NextResponse.json(
        { error: 'Failed to search Pexels' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      photos: result.photos,
      total: result.total_results,
      page: result.page,
      perPage: result.per_page,
    });
  } catch (error: any) {
    console.error('Pexels search error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
