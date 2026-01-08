import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export interface DetectedImage {
  id: string;
  url: string;
  alt: string;
  status: 'ok' | 'error' | 'checking' | 'missing';
  fileSize?: number; // in bytes
  format?: string; // jpg, png, webp, etc.
  isOptimized?: boolean; // true if already in webp format and small size
  isDuplicate?: boolean; // true if this URL is used by multiple sources
  duplicateCount?: number; // number of times this URL appears
  duplicateGroup?: string; // unique identifier for duplicate group
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
 * Check if image URL is accessible and get file info
 */
async function checkImageStatus(url: string): Promise<{
  status: 'ok' | 'error';
  fileSize?: number;
  format?: string;
}> {
  try {
    const response = await fetch(url, { method: 'HEAD', signal: AbortSignal.timeout(5000) });
    
    if (!response.ok) {
      return { status: 'error' };
    }
    
    const contentLength = response.headers.get('content-length');
    const contentType = response.headers.get('content-type');
    
    // Extract format from URL or content-type
    let format = 'unknown';
    if (url.includes('.webp')) format = 'webp';
    else if (url.includes('.jpg') || url.includes('.jpeg')) format = 'jpg';
    else if (url.includes('.png')) format = 'png';
    else if (url.includes('.gif')) format = 'gif';
    else if (contentType?.includes('webp')) format = 'webp';
    else if (contentType?.includes('jpeg') || contentType?.includes('jpg')) format = 'jpg';
    else if (contentType?.includes('png')) format = 'png';
    else if (contentType?.includes('gif')) format = 'gif';
    
    return {
      status: 'ok',
      fileSize: contentLength ? parseInt(contentLength, 10) : undefined,
      format,
    };
  } catch {
    return { status: 'error' };
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
      // ⚡ ENHANCEMENT: Show all blogs, even without image_url (mark as missing)
      const img: DetectedImage = {
        id: `blog-${blog.id}-main-${imageId++}`,
        url: blog.image_url || '',
        alt: blog.title,
        status: blog.image_url ? 'checking' : 'missing',
        source: {
          type: 'blog',
          id: blog.id,
          title: blog.title,
          field: 'image_url',
        },
      };
      detectedImages.push(img);
      
      // Only check status if URL exists
      if (blog.image_url) {
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
      // ⚡ ENHANCEMENT: Show all countries, even without image_url
      const img: DetectedImage = {
        id: `country-${country.id}-main-${imageId++}`,
        url: country.image_url || '',
        alt: country.name,
        status: country.image_url ? 'checking' : 'missing',
        source: {
          type: 'country',
          id: country.id,
          title: country.name,
          field: 'image_url',
        },
      };
      detectedImages.push(img);
      
      // Only check status if URL exists
      if (country.image_url) {
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
    const OPTIMIZED_SIZE_THRESHOLD = 500 * 1024; // 500KB
    
    for (let i = 0; i < imagesToCheck.length; i += BATCH_SIZE) {
      const batch = imagesToCheck.slice(i, i + BATCH_SIZE);
      const results = await Promise.all(
        batch.map(({ url }) => checkImageStatus(url))
      );
      
      batch.forEach(({ image }, index) => {
        const result = results[index];
        image.status = result.status;
        image.fileSize = result.fileSize;
        image.format = result.format;
        
        // Mark as optimized if it's webp and under threshold
        image.isOptimized = 
          result.format === 'webp' && 
          result.fileSize !== undefined && 
          result.fileSize < OPTIMIZED_SIZE_THRESHOLD;
      });

      console.log(`✅ Checked ${Math.min(i + BATCH_SIZE, imagesToCheck.length)}/${imagesToCheck.length} images`);
    }

    // Detect duplicates (same URL used by multiple sources)
    console.log('🔍 Detecting duplicate images...');
    const urlMap = new Map<string, DetectedImage[]>();
    
    // Group images by URL
    detectedImages.forEach(img => {
      if (img.url && img.status === 'ok') {
        if (!urlMap.has(img.url)) {
          urlMap.set(img.url, []);
        }
        urlMap.get(img.url)!.push(img);
      }
    });
    
    // Mark duplicates
    let duplicateCount = 0;
    urlMap.forEach((images, url) => {
      if (images.length > 1) {
        const duplicateGroup = `dup-${url.split('/').pop()?.split('.')[0] || Math.random().toString(36).substring(7)}`;
        images.forEach(img => {
          img.isDuplicate = true;
          img.duplicateCount = images.length;
          img.duplicateGroup = duplicateGroup;
        });
        duplicateCount += images.length;
      }
    });

    // Calculate statistics
    const stats = {
      total: detectedImages.length,
      ok: detectedImages.filter(img => img.status === 'ok').length,
      error: detectedImages.filter(img => img.status === 'error').length,
      missing: detectedImages.filter(img => img.status === 'missing').length,
      duplicates: duplicateCount,
      duplicateGroups: Array.from(urlMap.values()).filter(imgs => imgs.length > 1).length,
    };

    console.log(`📊 Stats: ${stats.ok} OK, ${stats.error} errors, ${stats.missing} missing, ${stats.duplicates} duplicates in ${stats.duplicateGroups} groups, ${stats.total} total`);

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
