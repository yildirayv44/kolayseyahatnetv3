import sharp from 'sharp';

export interface ImageOptimizationOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: 'jpeg' | 'webp' | 'avif';
}

const DEFAULT_OPTIONS: ImageOptimizationOptions = {
  maxWidth: 1920,
  maxHeight: 1080,
  quality: 80,
  format: 'webp',
};

export async function optimizeImage(
  imageBuffer: Buffer,
  options: ImageOptimizationOptions = {}
): Promise<Buffer> {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  try {
    let pipeline = sharp(imageBuffer);

    const metadata = await pipeline.metadata();
    
    if (!metadata.width || !metadata.height) {
      throw new Error('Invalid image metadata');
    }

    if (metadata.width > opts.maxWidth! || metadata.height > opts.maxHeight!) {
      pipeline = pipeline.resize(opts.maxWidth, opts.maxHeight, {
        fit: 'inside',
        withoutEnlargement: true,
      });
    }

    switch (opts.format) {
      case 'jpeg':
        pipeline = pipeline.jpeg({ quality: opts.quality, progressive: true });
        break;
      case 'webp':
        pipeline = pipeline.webp({ quality: opts.quality });
        break;
      case 'avif':
        pipeline = pipeline.avif({ quality: opts.quality });
        break;
    }

    const optimizedBuffer = await pipeline.toBuffer();
    
    const originalSize = imageBuffer.length;
    const optimizedSize = optimizedBuffer.length;
    const savings = ((originalSize - optimizedSize) / originalSize * 100).toFixed(2);
    
    console.log(`📊 Image optimized: ${(originalSize / 1024 / 1024).toFixed(2)}MB → ${(optimizedSize / 1024 / 1024).toFixed(2)}MB (${savings}% savings)`);
    
    return optimizedBuffer;
  } catch (error) {
    console.error('Image optimization error:', error);
    throw error;
  }
}

export async function optimizeImageFromUrl(
  imageUrl: string,
  options: ImageOptimizationOptions = {}
): Promise<Buffer> {
  try {
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`);
    }
    
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    return optimizeImage(buffer, options);
  } catch (error) {
    console.error('Error optimizing image from URL:', error);
    throw error;
  }
}

export function getOptimizedImageUrl(
  supabaseUrl: string,
  bucket: string,
  path: string,
  options: {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'origin' | 'webp';
  } = {}
): string {
  const params = new URLSearchParams();
  
  if (options.width) params.append('width', options.width.toString());
  if (options.height) params.append('height', options.height.toString());
  if (options.quality) params.append('quality', options.quality.toString());
  if (options.format) params.append('format', options.format);
  
  const queryString = params.toString();
  const baseUrl = `${supabaseUrl}/storage/v1/render/image/public/${bucket}/${path}`;
  
  return queryString ? `${baseUrl}?${queryString}` : baseUrl;
}
