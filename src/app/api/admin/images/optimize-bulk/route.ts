import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { optimizeImage } from '@/lib/image-optimizer';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface OptimizationResult {
  url: string;
  bucket: string;
  path: string;
  originalSize: number;
  optimizedSize: number;
  savings: number;
  success: boolean;
  error?: string;
}

/**
 * POST /api/admin/images/optimize-bulk
 * Optimize multiple selected images
 */
export async function POST(request: NextRequest) {
  try {
    const { images } = await request.json();

    if (!images || !Array.isArray(images) || images.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No images provided' },
        { status: 400 }
      );
    }

    console.log(`🖼️ Starting bulk optimization for ${images.length} images...`);

    const results: OptimizationResult[] = [];

    for (const image of images) {
      const { url, bucket, path } = image;

      try {
        console.log(`\n📥 Processing: ${path}`);

        // Download image
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`Failed to download: ${response.statusText}`);
        }

        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const originalSize = buffer.length;

        console.log(`   Original size: ${(originalSize / 1024 / 1024).toFixed(2)}MB`);

        // Optimize image
        const optimizedBuffer = await optimizeImage(buffer, {
          maxWidth: 1920,
          maxHeight: 1080,
          quality: 85,
          format: 'webp',
        });

        const optimizedSize = optimizedBuffer.length;
        const savings = ((originalSize - optimizedSize) / originalSize * 100);

        // Generate new path with .webp extension
        const newPath = path.replace(/\.[^.]+$/, '.webp');
        const isNewPath = newPath !== path;

        // Upload optimized version
        const { error: uploadError } = await supabase.storage
          .from(bucket)
          .upload(newPath, optimizedBuffer, {
            contentType: 'image/webp',
            cacheControl: '31536000',
            upsert: true,
          });

        if (uploadError) {
          throw uploadError;
        }

        // If we created a new file with .webp extension, delete the old one
        if (isNewPath) {
          await supabase.storage.from(bucket).remove([path]);
        }

        // Get new public URL
        const { data: urlData } = supabase.storage
          .from(bucket)
          .getPublicUrl(newPath);

        console.log(`   ✅ Optimized: ${(optimizedSize / 1024 / 1024).toFixed(2)}MB (${savings.toFixed(2)}% savings)`);

        results.push({
          url: urlData.publicUrl,
          bucket,
          path: newPath,
          originalSize,
          optimizedSize,
          savings,
          success: true,
        });

        // Update database references if path changed
        if (isNewPath) {
          await updateDatabaseReferences(url, urlData.publicUrl);
        }

      } catch (error: any) {
        console.error(`   ❌ Failed to optimize ${path}:`, error);
        results.push({
          url,
          bucket,
          path,
          originalSize: 0,
          optimizedSize: 0,
          savings: 0,
          success: false,
          error: error.message,
        });
      }
    }

    const successCount = results.filter(r => r.success).length;
    const totalOriginalSize = results.reduce((sum, r) => sum + r.originalSize, 0);
    const totalOptimizedSize = results.reduce((sum, r) => sum + r.optimizedSize, 0);
    const totalSavings = totalOriginalSize > 0 
      ? ((totalOriginalSize - totalOptimizedSize) / totalOriginalSize * 100)
      : 0;

    console.log(`\n✅ Bulk optimization complete: ${successCount}/${images.length} successful`);
    console.log(`📊 Total savings: ${(totalOriginalSize / 1024 / 1024).toFixed(2)}MB → ${(totalOptimizedSize / 1024 / 1024).toFixed(2)}MB (${totalSavings.toFixed(2)}%)`);

    return NextResponse.json({
      success: true,
      results,
      summary: {
        total: images.length,
        successful: successCount,
        failed: images.length - successCount,
        totalOriginalSize,
        totalOptimizedSize,
        totalSavings,
      },
    });

  } catch (error: any) {
    console.error('Bulk optimization error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

async function updateDatabaseReferences(oldUrl: string, newUrl: string) {
  try {
    // Update blog cover images
    await supabase
      .from('blogs')
      .update({ image_url: newUrl })
      .eq('image_url', oldUrl);

    // Update blog contents (HTML içindeki görseller)
    const { data: blogsWithContent } = await supabase
      .from('blogs')
      .select('id, contents, contents_en')
      .or(`contents.ilike.%${oldUrl}%,contents_en.ilike.%${oldUrl}%`);

    if (blogsWithContent && blogsWithContent.length > 0) {
      for (const blog of blogsWithContent) {
        const updates: any = {};
        
        if (blog.contents && blog.contents.includes(oldUrl)) {
          updates.contents = blog.contents.replaceAll(oldUrl, newUrl);
        }
        
        if (blog.contents_en && blog.contents_en.includes(oldUrl)) {
          updates.contents_en = blog.contents_en.replaceAll(oldUrl, newUrl);
        }
        
        if (Object.keys(updates).length > 0) {
          await supabase
            .from('blogs')
            .update(updates)
            .eq('id', blog.id);
          
          console.log(`   📝 Updated blog content references for blog ID: ${blog.id}`);
        }
      }
    }

    // Update countries
    await supabase
      .from('countries')
      .update({ image_url: newUrl })
      .eq('image_url', oldUrl);

    // Update country contents (HTML içindeki görseller)
    const { data: countriesWithContent } = await supabase
      .from('countries')
      .select('id, contents, contents_en')
      .or(`contents.ilike.%${oldUrl}%,contents_en.ilike.%${oldUrl}%`);

    if (countriesWithContent && countriesWithContent.length > 0) {
      for (const country of countriesWithContent) {
        const updates: any = {};
        
        if (country.contents && country.contents.includes(oldUrl)) {
          updates.contents = country.contents.replaceAll(oldUrl, newUrl);
        }
        
        if (country.contents_en && country.contents_en.includes(oldUrl)) {
          updates.contents_en = country.contents_en.replaceAll(oldUrl, newUrl);
        }
        
        if (Object.keys(updates).length > 0) {
          await supabase
            .from('countries')
            .update(updates)
            .eq('id', country.id);
          
          console.log(`   📝 Updated country content references for country ID: ${country.id}`);
        }
      }
    }

    // Update country menus
    await supabase
      .from('country_menus')
      .update({ image_url: newUrl })
      .eq('image_url', oldUrl);

    // Update country menu contents (HTML içindeki görseller)
    const { data: menusWithContent } = await supabase
      .from('country_menus')
      .select('id, contents, contents_en')
      .or(`contents.ilike.%${oldUrl}%,contents_en.ilike.%${oldUrl}%`);

    if (menusWithContent && menusWithContent.length > 0) {
      for (const menu of menusWithContent) {
        const updates: any = {};
        
        if (menu.contents && menu.contents.includes(oldUrl)) {
          updates.contents = menu.contents.replaceAll(oldUrl, newUrl);
        }
        
        if (menu.contents_en && menu.contents_en.includes(oldUrl)) {
          updates.contents_en = menu.contents_en.replaceAll(oldUrl, newUrl);
        }
        
        if (Object.keys(updates).length > 0) {
          await supabase
            .from('country_menus')
            .update(updates)
            .eq('id', menu.id);
          
          console.log(`   📝 Updated menu content references for menu ID: ${menu.id}`);
        }
      }
    }

  } catch (error) {
    console.warn('Could not update database references:', error);
  }
}
