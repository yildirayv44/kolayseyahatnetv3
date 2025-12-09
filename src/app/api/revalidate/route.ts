import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

/**
 * POST /api/revalidate
 * Revalidate specific paths to clear Next.js cache
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { path, type = 'page' } = body;

    if (!path) {
      return NextResponse.json(
        { error: 'Path is required' },
        { status: 400 }
      );
    }

    // Revalidate the path
    revalidatePath(path, type as 'page' | 'layout');

    console.log(`✅ Revalidated: ${path} (${type})`);

    return NextResponse.json({
      success: true,
      message: `Revalidated: ${path}`,
      revalidated: true,
      now: Date.now()
    });
  } catch (error: any) {
    console.error('Revalidation error:', error);
    return NextResponse.json(
      { error: error.message || 'Revalidation failed' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/revalidate?path=/katar
 * Revalidate via GET request (for easy testing)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const path = searchParams.get('path');
    const type = searchParams.get('type') || 'page';

    if (!path) {
      return NextResponse.json(
        { error: 'Path query parameter is required' },
        { status: 400 }
      );
    }

    // Revalidate the path
    revalidatePath(path, type as 'page' | 'layout');

    console.log(`✅ Revalidated: ${path} (${type})`);

    return NextResponse.json({
      success: true,
      message: `Revalidated: ${path}`,
      revalidated: true,
      now: Date.now()
    });
  } catch (error: any) {
    console.error('Revalidation error:', error);
    return NextResponse.json(
      { error: error.message || 'Revalidation failed' },
      { status: 500 }
    );
  }
}
