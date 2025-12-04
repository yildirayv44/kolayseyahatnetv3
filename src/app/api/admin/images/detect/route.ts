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
 */
export async function GET(request: NextRequest) {
  try {
    const detectedImages: DetectedImage[] = [];
    let imageId = 0;

    // 1. Fetch all blogs
    const { data: blogs, error: blogsError } = await supabase
      .from('blogs')
      .select('id, title, contents, image_url')
      .eq('status', 1);

    if (blogsError) {
      return NextResponse.json({ error: blogsError.message }, { status: 500 });
    }

    // Extract images from blogs
    for (const blog of blogs || []) {
      // Main image
      if (blog.image_url) {
        const status = await checkImageStatus(blog.image_url);
        detectedImages.push({
          id: `blog-${blog.id}-main-${imageId++}`,
          url: blog.image_url,
          alt: blog.title,
          status,
          source: {
            type: 'blog',
            id: blog.id,
            title: blog.title,
            field: 'image_url',
          },
        });
      }

      // Content images
      if (blog.contents) {
        const contentImages = extractImagesFromHTML(blog.contents);
        for (const img of contentImages) {
          const status = await checkImageStatus(img.url);
          detectedImages.push({
            id: `blog-${blog.id}-content-${imageId++}`,
            url: img.url,
            alt: img.alt || blog.title,
            status,
            source: {
              type: 'blog',
              id: blog.id,
              title: blog.title,
              field: 'contents',
            },
          });
        }
      }
    }

    // 2. Fetch all countries
    const { data: countries, error: countriesError } = await supabase
      .from('countries')
      .select('id, name, contents, price_contents, req_document, image_url')
      .eq('status', 1);

    if (countriesError) {
      return NextResponse.json({ error: countriesError.message }, { status: 500 });
    }

    // Extract images from countries
    for (const country of countries || []) {
      // Main image
      if (country.image_url) {
        const status = await checkImageStatus(country.image_url);
        detectedImages.push({
          id: `country-${country.id}-main-${imageId++}`,
          url: country.image_url,
          alt: country.name,
          status,
          source: {
            type: 'country',
            id: country.id,
            title: country.name,
            field: 'image_url',
          },
        });
      }

      // Contents
      if (country.contents) {
        const contentImages = extractImagesFromHTML(country.contents);
        for (const img of contentImages) {
          const status = await checkImageStatus(img.url);
          detectedImages.push({
            id: `country-${country.id}-contents-${imageId++}`,
            url: img.url,
            alt: img.alt || country.name,
            status,
            source: {
              type: 'country',
              id: country.id,
              title: country.name,
              field: 'contents',
            },
          });
        }
      }

      // Price contents
      if (country.price_contents) {
        const priceImages = extractImagesFromHTML(country.price_contents);
        for (const img of priceImages) {
          const status = await checkImageStatus(img.url);
          detectedImages.push({
            id: `country-${country.id}-price-${imageId++}`,
            url: img.url,
            alt: img.alt || `${country.name} vize ücretleri`,
            status,
            source: {
              type: 'country',
              id: country.id,
              title: country.name,
              field: 'price_contents',
            },
          });
        }
      }

      // Required documents
      if (country.req_document) {
        const docImages = extractImagesFromHTML(country.req_document);
        for (const img of docImages) {
          const status = await checkImageStatus(img.url);
          detectedImages.push({
            id: `country-${country.id}-docs-${imageId++}`,
            url: img.url,
            alt: img.alt || `${country.name} gerekli belgeler`,
            status,
            source: {
              type: 'country',
              id: country.id,
              title: country.name,
              field: 'req_document',
            },
          });
        }
      }
    }

    // Calculate statistics
    const stats = {
      total: detectedImages.length,
      ok: detectedImages.filter(img => img.status === 'ok').length,
      error: detectedImages.filter(img => img.status === 'error').length,
    };

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
