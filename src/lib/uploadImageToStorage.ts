import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Server-side Supabase client with service role
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

/**
 * Upload an image to Supabase Storage from a URL or base64
 * @param imageSource - URL or base64 data
 * @param folder - Storage folder (e.g., 'ai-images', 'pexels-images')
 * @param filename - Optional custom filename
 * @returns Public URL of uploaded image
 */
export async function uploadImageToStorage(
  imageSource: string,
  folder: string = 'ai-images',
  filename?: string
): Promise<string> {
  try {
    let imageBuffer: Buffer;
    let contentType = 'image/png';

    // Check if it's a base64 data URL
    if (imageSource.startsWith('data:image/')) {
      const matches = imageSource.match(/^data:image\/(\w+);base64,(.+)$/);
      if (!matches) {
        throw new Error('Invalid base64 image format');
      }
      
      contentType = `image/${matches[1]}`;
      const base64Data = matches[2];
      imageBuffer = Buffer.from(base64Data, 'base64');
    }
    // Check if it's a regular base64 string (without data URL prefix)
    else if (!imageSource.startsWith('http')) {
      imageBuffer = Buffer.from(imageSource, 'base64');
    }
    // It's a URL - fetch the image
    else {
      const response = await fetch(imageSource);
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.statusText}`);
      }
      
      const arrayBuffer = await response.arrayBuffer();
      imageBuffer = Buffer.from(arrayBuffer);
      
      // Try to get content type from response
      const responseContentType = response.headers.get('content-type');
      if (responseContentType?.startsWith('image/')) {
        contentType = responseContentType;
      }
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(7);
    const extension = contentType.split('/')[1] || 'png';
    const finalFilename = filename || `${timestamp}-${randomStr}.${extension}`;
    const filePath = `${folder}/${finalFilename}`;

    console.log(`📤 Uploading image to Supabase: ${filePath}`);

    // Upload to Supabase Storage
    const { data, error } = await supabaseAdmin.storage
      .from('uploads')
      .upload(filePath, imageBuffer, {
        contentType: contentType,
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      console.error('Supabase upload error:', error);
      throw error;
    }

    // Get public URL
    const { data: { publicUrl } } = supabaseAdmin.storage
      .from('uploads')
      .getPublicUrl(filePath);

    console.log(`✅ Image uploaded successfully: ${publicUrl}`);

    return publicUrl;

  } catch (error) {
    console.error('Error uploading image to storage:', error);
    throw error;
  }
}

/**
 * Upload multiple images to storage
 */
export async function uploadMultipleImages(
  imageSources: string[],
  folder: string = 'ai-images'
): Promise<string[]> {
  const uploadPromises = imageSources.map(source => 
    uploadImageToStorage(source, folder)
  );
  
  return Promise.all(uploadPromises);
}
