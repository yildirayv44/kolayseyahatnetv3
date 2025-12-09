import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export interface DetectedImage {
  id: string;
  url: string;
  alt: string;
  status: 'ok' | 'error' | 'checking';
  source: {
    type: 'blog' | 'country';
    id: number;
    title: string;
    field: string; // contents, price_contents, req_document, image_url
  };
}

/**
 * Extract all images from HTML content
 */
function extractImagesFromHTML(html: string): Array<{ url: string; alt: string }> {
  const imgRegex = /<img[^>]+src="([^"]+)"[^>]*(?:alt="([^"]*)")?[^>]*>/g;
  const images: Array<{ url: string; alt: string }> = [];
  
  let match;
  while ((match = imgRegex.exec(html)) !== null) {
    images.push({
      url: match[1],
      alt: match[2] || '',
    });
  }
  
  return images;
}

/**
 * Check if image URL is accessible
 */
async function checkImageStatus(url: string): Promise<'ok' | 'error'> {
  try {
    const response = await fetch(url, { method: 'HEAD', signal: AbortSignal.timeout(5000) });
    return response.ok ? 'ok' : 'error';
  } catch {
    return 'error';
  }
}

/**
 * GET /api/admin/images/detect
 * Detect all images in blog and country content
 * ⚡ OPTIMIZED: Parallel image status checking
 */
export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Starting image detection...');
    const detectedImages: DetectedImage[] = [];
    let imageId = 0;

    // ⚡ OPTIMIZATION: Fetch blogs and countries in parallel
    const [blogsResult, countriesResult] = await Promise.all([
      supabase
        .from('blogs')
        .select('id, title, contents, image_url')
        .eq('status', 1),
      supabase
        .from('countries')
        .select('id, name, contents, price_contents, req_document, image_url')
        .eq('status', 1)
    ]);

    if (blogsResult.error) {
      return NextResponse.json({ error: blogsResult.error.message }, { status: 500 });
    }

    if (countriesResult.error) {
      return NextResponse.json({ error: countriesResult.error.message }, { status: 500 });
    }

    console.log(`📊 Found ${blogsResult.data?.length || 0} blogs, ${countriesResult.data?.length || 0} countries`);

    // Collect all images WITHOUT checking status first
    const imagesToCheck: Array<{ image: DetectedImage; url: string }> = [];

    // Extract images from blogs
    for (const blog of blogsResult.data || []) {
      if (blog.image_url) {
        const img: DetectedImage = {
          id: `blog-${blog.id}-main-${imageId++}`,
          url: blog.image_url,
          alt: blog.title,
          status: 'checking',
          source: {
            type: 'blog',
            id: blog.id,
            title: blog.title,
            field: 'image_url',
          },
        };
        detectedImages.push(img);
        imagesToCheck.push({ image: img, url: blog.image_url });
      }

      if (blog.contents) {
        const contentImages = extractImagesFromHTML(blog.contents);
        for (const contentImg of contentImages) {
          const img: DetectedImage = {
            id: `blog-${blog.id}-content-${imageId++}`,
            url: contentImg.url,
            alt: contentImg.alt || blog.title,
            status: 'checking',
            source: {
              type: 'blog',
              id: blog.id,
              title: blog.title,
              field: 'contents',
            },
          };
          detectedImages.push(img);
          imagesToCheck.push({ image: img, url: contentImg.url });
        }
      }
    }

    // Extract images from countries
    for (const country of countriesResult.data || []) {
      if (country.image_url) {
        const img: DetectedImage = {
          id: `country-${country.id}-main-${imageId++}`,
          url: country.image_url,
          alt: country.name,
          status: 'checking',
          source: {
            type: 'country',
            id: country.id,
            title: country.name,
            field: 'image_url',
          },
        };
        detectedImages.push(img);
        imagesToCheck.push({ image: img, url: country.image_url });
      }

      const fields = [
        { content: country.contents, field: 'contents', suffix: '' },
        { content: country.price_contents, field: 'price_contents', suffix: ' vize ücretleri' },
        { content: country.req_document, field: 'req_document', suffix: ' gerekli belgeler' },
      ];

      for (const { content, field, suffix } of fields) {
        if (content) {
          const htmlImages = extractImagesFromHTML(content);
          for (const htmlImg of htmlImages) {
            const img: DetectedImage = {
              id: `country-${country.id}-${field}-${imageId++}`,
              url: htmlImg.url,
              alt: htmlImg.alt || `${country.name}${suffix}`,
              status: 'checking',
              source: {
                type: 'country',
                id: country.id,
                title: country.name,
                field,
              },
            };
            detectedImages.push(img);
            imagesToCheck.push({ image: img, url: htmlImg.url });
          }
        }
      }
    }

    console.log(`🖼️  Total images found: ${imagesToCheck.length}`);
    console.log(`⚡ Checking status in parallel...`);

    // ⚡ OPTIMIZATION: Check all image statuses in parallel (batched)
    const BATCH_SIZE = 50; // Check 50 images at a time
    for (let i = 0; i < imagesToCheck.length; i += BATCH_SIZE) {
      const batch = imagesToCheck.slice(i, i + BATCH_SIZE);
      const statuses = await Promise.all(
        batch.map(({ url }) => checkImageStatus(url))
      );
      
      batch.forEach(({ image }, index) => {
        image.status = statuses[index];
      });

      console.log(`✅ Checked ${Math.min(i + BATCH_SIZE, imagesToCheck.length)}/${imagesToCheck.length} images`);
    }

    // Calculate statistics
    const stats = {
      total: detectedImages.length,
      ok: detectedImages.filter(img => img.status === 'ok').length,
      error: detectedImages.filter(img => img.status === 'error').length,
    };

    console.log(`📊 Stats: ${stats.ok} OK, ${stats.error} errors, ${stats.total} total`);

    return NextResponse.json({
      success: true,
      images: detectedImages,
      stats,
    });
  } catch (error) {
    console.error('Error detecting images:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
