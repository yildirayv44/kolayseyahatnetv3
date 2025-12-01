import { createClient } from "@supabase/supabase-js";

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
    // Generate unique filename
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(7);
    const ext = file.name.split(".").pop();
    const filename = `${timestamp}-${randomStr}.${ext}`;
    const filePath = path ? `${path}/${filename}` : filename;

    // Upload file
    const { data, error } = await supabaseAdmin.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: "3600",
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
