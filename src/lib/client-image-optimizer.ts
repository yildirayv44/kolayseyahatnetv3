/**
 * Client-side image optimization using browser APIs
 * Compresses images before upload to reduce file size and improve performance
 */

export interface ClientImageOptimizationOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  outputFormat?: 'image/webp' | 'image/jpeg';
}

const DEFAULT_OPTIONS: ClientImageOptimizationOptions = {
  maxWidth: 1920,
  maxHeight: 1080,
  quality: 0.85,
  outputFormat: 'image/webp',
};

/**
 * Compress and resize an image file on the client side
 */
export async function compressImage(
  file: File,
  options: ClientImageOptimizationOptions = {}
): Promise<File> {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();

      img.onload = () => {
        try {
          // Calculate new dimensions
          let { width, height } = img;
          
          if (width > opts.maxWidth! || height > opts.maxHeight!) {
            const aspectRatio = width / height;
            
            if (width > height) {
              width = Math.min(width, opts.maxWidth!);
              height = width / aspectRatio;
            } else {
              height = Math.min(height, opts.maxHeight!);
              width = height * aspectRatio;
            }
          }

          // Create canvas and draw resized image
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Could not get canvas context'));
            return;
          }

          // Use better image smoothing
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          
          ctx.drawImage(img, 0, 0, width, height);

          // Convert to blob
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error('Failed to create blob'));
                return;
              }

              // Create new File from blob
              const compressedFile = new File(
                [blob],
                file.name.replace(/\.[^.]+$/, '.webp'),
                {
                  type: opts.outputFormat!,
                  lastModified: Date.now(),
                }
              );

              const originalSize = file.size;
              const compressedSize = compressedFile.size;
              const savings = ((originalSize - compressedSize) / originalSize * 100).toFixed(2);

              console.log(
                `📊 Client-side compression: ${(originalSize / 1024 / 1024).toFixed(2)}MB → ${(compressedSize / 1024 / 1024).toFixed(2)}MB (${savings}% savings)`
              );

              resolve(compressedFile);
            },
            opts.outputFormat,
            opts.quality
          );
        } catch (error) {
          reject(error);
        }
      };

      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };

      img.src = e.target?.result as string;
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Check if the browser supports WebP
 */
export function supportsWebP(): boolean {
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  
  return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
}

/**
 * Get optimal output format based on browser support
 */
export function getOptimalFormat(): 'image/webp' | 'image/jpeg' {
  return supportsWebP() ? 'image/webp' : 'image/jpeg';
}

/**
 * Validate image file before compression
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
  
  if (!validTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Sadece JPG, PNG, WebP ve GIF formatları destekleniyor.',
    };
  }

  const maxSize = 10 * 1024 * 1024; // 10MB before compression
  if (file.size > maxSize) {
    return {
      valid: false,
      error: 'Dosya boyutu 10MB\'dan küçük olmalıdır.',
    };
  }

  return { valid: true };
}
