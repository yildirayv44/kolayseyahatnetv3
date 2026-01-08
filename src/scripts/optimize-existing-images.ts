/**
 * Script to optimize existing large images in Supabase Storage
 * This will download, optimize, and re-upload images that are larger than a threshold
 * 
 * Usage: npx tsx src/scripts/optimize-existing-images.ts
 */

import { createClient } from '@supabase/supabase-js';
import { optimizeImage } from '../lib/image-optimizer';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const BUCKETS_TO_OPTIMIZE = ['blog-images', 'country-images', 'uploads'];
const SIZE_THRESHOLD = 500 * 1024; // 500KB - optimize images larger than this

interface ImageToOptimize {
  bucket: string;
  path: string;
  size: number;
  url: string;
}

async function listLargeImages(bucket: string): Promise<ImageToOptimize[]> {
  console.log(`\n📂 Scanning bucket: ${bucket}`);
  
  const { data: files, error } = await supabase.storage.from(bucket).list('', {
    limit: 1000,
    sortBy: { column: 'created_at', order: 'desc' },
  });

  if (error) {
    console.error(`Error listing files in ${bucket}:`, error);
    return [];
  }

  const largeImages: ImageToOptimize[] = [];

  for (const file of files || []) {
    if (file.metadata?.size && file.metadata.size > SIZE_THRESHOLD) {
      const { data } = supabase.storage.from(bucket).getPublicUrl(file.name);
      
      largeImages.push({
        bucket,
        path: file.name,
        size: file.metadata.size,
        url: data.publicUrl,
      });
    }
  }

  console.log(`  Found ${largeImages.length} images larger than ${SIZE_THRESHOLD / 1024}KB`);
  return largeImages;
}

async function optimizeAndReplace(image: ImageToOptimize): Promise<boolean> {
  try {
    console.log(`\n🖼️  Optimizing: ${image.path}`);
    console.log(`   Original size: ${(image.size / 1024 / 1024).toFixed(2)}MB`);

    // Download image
    const response = await fetch(image.url);
    if (!response.ok) {
      throw new Error(`Failed to download: ${response.statusText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Optimize image
    const optimizedBuffer = await optimizeImage(buffer, {
      maxWidth: 1920,
      maxHeight: 1080,
      quality: 85,
      format: 'webp',
    });

    // Generate new path with .webp extension
    const newPath = image.path.replace(/\.[^.]+$/, '.webp');
    const isNewPath = newPath !== image.path;

    // Upload optimized version
    const { error: uploadError } = await supabase.storage
      .from(image.bucket)
      .upload(newPath, optimizedBuffer, {
        contentType: 'image/webp',
        cacheControl: '31536000',
        upsert: true, // Replace if exists
      });

    if (uploadError) {
      throw uploadError;
    }

    // If we created a new file with .webp extension, delete the old one
    if (isNewPath) {
      const { error: deleteError } = await supabase.storage
        .from(image.bucket)
        .remove([image.path]);

      if (deleteError) {
        console.warn(`   ⚠️  Could not delete old file: ${deleteError.message}`);
      }
    }

    const savings = ((image.size - optimizedBuffer.length) / image.size * 100).toFixed(2);
    console.log(`   ✅ Optimized: ${(optimizedBuffer.length / 1024 / 1024).toFixed(2)}MB (${savings}% savings)`);
    
    return true;
  } catch (error) {
    console.error(`   ❌ Failed to optimize ${image.path}:`, error);
    return false;
  }
}

async function updateDatabaseReferences(oldPath: string, newPath: string) {
  // Update blog images
  const { error: blogError } = await supabase
    .from('blogs')
    .update({ image_url: newPath })
    .eq('image_url', oldPath);

  if (blogError) {
    console.warn(`   ⚠️  Could not update blog references: ${blogError.message}`);
  }

  // Update country images
  const { error: countryError } = await supabase
    .from('countries')
    .update({ image_url: newPath })
    .eq('image_url', oldPath);

  if (countryError) {
    console.warn(`   ⚠️  Could not update country references: ${countryError.message}`);
  }
}

async function main() {
  console.log('🚀 Starting image optimization process...');
  console.log(`📏 Size threshold: ${SIZE_THRESHOLD / 1024}KB`);

  let totalImages = 0;
  let optimizedCount = 0;
  let totalSavings = 0;

  for (const bucket of BUCKETS_TO_OPTIMIZE) {
    const images = await listLargeImages(bucket);
    totalImages += images.length;

    for (const image of images) {
      const success = await optimizeAndReplace(image);
      if (success) {
        optimizedCount++;
      }
      
      // Add small delay to avoid rate limits
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log('📊 Optimization Summary:');
  console.log(`   Total images scanned: ${totalImages}`);
  console.log(`   Successfully optimized: ${optimizedCount}`);
  console.log(`   Failed: ${totalImages - optimizedCount}`);
  console.log('='.repeat(50));
}

// Run the script
main().catch(console.error);
