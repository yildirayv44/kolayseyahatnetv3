import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface ImageInfo {
  id: string;
  url: string;
  fileSize?: number;
  format?: string;
  source: {
    type: 'blog' | 'country';
    id: number;
    title: string;
    field: string;
  };
}

/**
 * POST /api/admin/images/find-similar
 * Find visually similar images based on file size and format
 * This is a simple heuristic - images with same size and format are likely duplicates
 */
export async function POST(request: NextRequest) {
  try {
    const { images } = await request.json();

    if (!images || !Array.isArray(images)) {
      return NextResponse.json(
        { success: false, error: 'No images provided' },
        { status: 400 }
      );
    }

    console.log(`🔍 Analyzing ${images.length} images for visual similarity...`);

    // Group images by size and format (likely duplicates)
    const sizeFormatMap = new Map<string, ImageInfo[]>();
    
    images.forEach((img: ImageInfo) => {
      if (img.fileSize && img.format) {
        // Create a key based on size (with 5% tolerance) and format
        const sizeKey = Math.round(img.fileSize / 1024); // KB
        const key = `${img.format}-${sizeKey}`;
        
        if (!sizeFormatMap.has(key)) {
          sizeFormatMap.set(key, []);
        }
        sizeFormatMap.get(key)!.push(img);
      }
    });

    // Find groups with multiple images (potential duplicates)
    const similarGroups: Array<{
      groupId: string;
      images: ImageInfo[];
      fileSize: number;
      format: string;
      confidence: 'high' | 'medium' | 'low';
    }> = [];

    sizeFormatMap.forEach((imgs, key) => {
      if (imgs.length > 1) {
        // Calculate confidence based on how similar the sizes are
        const sizes = imgs.map(i => i.fileSize!);
        const avgSize = sizes.reduce((a, b) => a + b, 0) / sizes.length;
        const variance = sizes.reduce((sum, size) => sum + Math.abs(size - avgSize), 0) / sizes.length;
        const variancePercent = (variance / avgSize) * 100;

        let confidence: 'high' | 'medium' | 'low' = 'low';
        if (variancePercent < 1) confidence = 'high';
        else if (variancePercent < 5) confidence = 'medium';

        similarGroups.push({
          groupId: `similar-${key}`,
          images: imgs,
          fileSize: Math.round(avgSize),
          format: imgs[0].format!,
          confidence,
        });

        console.log(`📊 Similar group found: ${imgs.length} images, ${(avgSize / 1024).toFixed(0)}KB ${imgs[0].format}, confidence: ${confidence}`);
        console.log(`   Sources: ${imgs.map(i => `${i.source.type}:${i.source.title}`).join(', ')}`);
      }
    });

    // Sort by confidence and group size
    similarGroups.sort((a, b) => {
      const confidenceWeight = { high: 3, medium: 2, low: 1 };
      const scoreA = confidenceWeight[a.confidence] * a.images.length;
      const scoreB = confidenceWeight[b.confidence] * b.images.length;
      return scoreB - scoreA;
    });

    return NextResponse.json({
      success: true,
      similarGroups,
      summary: {
        totalGroups: similarGroups.length,
        highConfidence: similarGroups.filter(g => g.confidence === 'high').length,
        mediumConfidence: similarGroups.filter(g => g.confidence === 'medium').length,
        lowConfidence: similarGroups.filter(g => g.confidence === 'low').length,
      },
    });

  } catch (error: any) {
    console.error('Find similar images error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
