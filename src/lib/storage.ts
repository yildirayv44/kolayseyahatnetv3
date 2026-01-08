import { createClient } from "@supabase/supabase-js";
import { optimizeImage } from "./image-optimizer";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Service role client for admin operations
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

// Storage buckets
export const STORAGE_BUCKETS = {
  BLOGS: "blog-images",
  COUNTRIES: "country-images",
  CONSULTANTS: "consultant-images",
} as const;

/**
 * Upload image to Supabase Storage
 */
export async function uploadImage(
  file: File,
  bucket: string,
  path?: string
): Promise<{ url: string; path: string } | { error: string }> {
  try {
    // Convert File to Buffer for optimization
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Optimize image (compress and resize)
    console.log(`🖼️ Optimizing image: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB)`);
    const optimizedBuffer = await optimizeImage(buffer, {
      maxWidth: 1920,
      maxHeight: 1080,
      quality: 85,
      format: 'webp',
    });

    // Generate unique filename with .webp extension
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(7);
    const filename = `${timestamp}-${randomStr}.webp`;
    const filePath = path ? `${path}/${filename}` : filename;

    // Upload optimized file
    const { data, error } = await supabaseAdmin.storage
      .from(bucket)
      .upload(filePath, optimizedBuffer, {
        contentType: 'image/webp',
        cacheControl: "31536000", // 1 year
        upsert: false,
      });

    if (error) {
      console.error("Upload error:", error);
      return { error: error.message };
    }

    // Get public URL
    const { data: urlData } = supabaseAdmin.storage
      .from(bucket)
      .getPublicUrl(data.path);

    return {
      url: urlData.publicUrl,
      path: data.path,
    };
  } catch (error: any) {
    console.error("Upload exception:", error);
    return { error: error.message };
  }
}

/**
 * Delete image from Supabase Storage
 */
export async function deleteImage(
  bucket: string,
  path: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabaseAdmin.storage.from(bucket).remove([path]);

    if (error) {
      console.error("Delete error:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error: any) {
    console.error("Delete exception:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Get public URL for a storage path
 */
export function getStorageUrl(bucket: string, path: string): string {
  const { data } = supabaseAdmin.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

/**
 * Extract storage path from URL
 */
export function extractStoragePath(url: string): { bucket: string; path: string } | null {
  try {
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split("/");
    
    // Format: /storage/v1/object/public/{bucket}/{path}
    const bucketIndex = pathParts.indexOf("public") + 1;
    if (bucketIndex > 0 && bucketIndex < pathParts.length) {
      const bucket = pathParts[bucketIndex];
      const path = pathParts.slice(bucketIndex + 1).join("/");
      return { bucket, path };
    }
    
    return null;
  } catch {
    return null;
  }
}

/**
 * Validate image file
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  // Check file type
  const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];
  if (!validTypes.includes(file.type)) {
    return { valid: false, error: "Sadece JPG, PNG, WebP ve GIF formatları destekleniyor." };
  }

  // Check file size (max 5MB)
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    return { valid: false, error: "Dosya boyutu 5MB'dan küçük olmalıdır." };
  }

  return { valid: true };
}

/**
 * Download image from URL and upload to Supabase Storage
 */
export async function downloadAndUploadImage(
  imageUrl: string,
  bucket: string,
  path?: string
): Promise<{ url: string; path: string } | { error: string }> {
  try {
    // Download image
    console.log(`📥 Downloading image from: ${imageUrl}`);
    const response = await fetch(imageUrl);
    if (!response.ok) {
      return { error: "Görsel indirilemedi" };
    }

    // Get image data
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Optimize image (compress and resize)
    console.log(`🖼️ Optimizing downloaded image (${(buffer.length / 1024 / 1024).toFixed(2)}MB)`);
    const optimizedBuffer = await optimizeImage(buffer, {
      maxWidth: 1920,
      maxHeight: 1080,
      quality: 85,
      format: 'webp',
    });

    // Generate unique filename with .webp extension
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(7);
    const filename = `${timestamp}-${randomStr}.webp`;
    const filePath = path ? `${path}/${filename}` : filename;

    // Upload to Supabase Storage
    const { data, error } = await supabaseAdmin.storage
      .from(bucket)
      .upload(filePath, optimizedBuffer, {
        contentType: 'image/webp',
        cacheControl: "31536000", // 1 year
        upsert: false,
      });

    if (error) {
      console.error("Upload error:", error);
      return { error: error.message };
    }

    // Get public URL
    const { data: urlData } = supabaseAdmin.storage
      .from(bucket)
      .getPublicUrl(data.path);

    return {
      url: urlData.publicUrl,
      path: data.path,
    };
  } catch (error: any) {
    console.error("Download and upload exception:", error);
    return { error: error.message };
  }
}
