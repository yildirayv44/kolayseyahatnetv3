/**
 * Image helper functions for blog and country pages
 */

// Default images for different content types (using Unsplash)
export const DEFAULT_IMAGES = {
  blog: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1200&h=630&q=80&fit=crop",
  country: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1200&h=630&q=80&fit=crop",
  consultant: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=1200&h=630&q=80&fit=crop",
} as const;

/**
 * Clean and validate image URL
 * Removes old system URLs and returns clean URL or default
 * Priority: Supabase Storage > Unsplash > Default
 */
export function getCleanImageUrl(
  imageUrl: string | null | undefined,
  type: keyof typeof DEFAULT_IMAGES = "blog"
): string {
  if (!imageUrl) {
    return DEFAULT_IMAGES[type];
  }

  // Allow Supabase Storage URLs
  if (imageUrl.includes("supabase.co/storage")) {
    return imageUrl;
  }

  // Remove old system URLs (eski sistemden gelen URL'ler)
  const oldSystemPatterns = [
    /https?:\/\/.*kolayseyahat\.tr\/.*\/uploads\//i,
    /https?:\/\/.*kolayseyahat\.net\/.*\/uploads\//i,
    /\/uploads\/.*\.(jpg|jpeg|png|gif|webp)/i,
    /storage\/app\/public\//i,
  ];

  for (const pattern of oldSystemPatterns) {
    if (pattern.test(imageUrl)) {
      console.warn(`Old system image URL detected and removed: ${imageUrl}`);
      return DEFAULT_IMAGES[type];
    }
  }

  // Check if URL is valid
  try {
    const url = new URL(imageUrl);
    // Only allow https URLs
    if (url.protocol !== "https:") {
      console.warn(`Non-HTTPS image URL: ${imageUrl}`);
      return DEFAULT_IMAGES[type];
    }
    return imageUrl;
  } catch {
    // If not a valid URL, check if it's a relative path
    if (imageUrl.startsWith("/")) {
      return imageUrl;
    }
    console.warn(`Invalid image URL: ${imageUrl}`);
    return DEFAULT_IMAGES[type];
  }
}

/**
 * Get optimized image URL with Unsplash or similar CDN
 */
export function getOptimizedImageUrl(
  imageUrl: string | null | undefined,
  options: {
    width?: number;
    height?: number;
    quality?: number;
    type?: keyof typeof DEFAULT_IMAGES;
  } = {}
): string {
  const {
    width = 1200,
    height = 630,
    quality = 80,
    type = "blog",
  } = options;

  const cleanUrl = getCleanImageUrl(imageUrl, type);

  // If it's a default image, return as is
  if (cleanUrl === DEFAULT_IMAGES[type]) {
    return cleanUrl;
  }

  // If it's an Unsplash URL, add optimization parameters
  if (cleanUrl.includes("unsplash.com")) {
    const url = new URL(cleanUrl);
    url.searchParams.set("w", width.toString());
    url.searchParams.set("h", height.toString());
    url.searchParams.set("q", quality.toString());
    url.searchParams.set("fit", "crop");
    url.searchParams.set("auto", "format");
    return url.toString();
  }

  return cleanUrl;
}

/**
 * Get country-specific default image based on country name
 */
export function getCountryDefaultImage(countryName: string): string {
  const countryImages: Record<string, string> = {
    "Amerika": "https://images.unsplash.com/photo-1485738422979-f5c462d49f74?w=1200&h=630&q=80&fit=crop",
    "İngiltere": "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=1200&h=630&q=80&fit=crop",
    "Kanada": "https://images.unsplash.com/photo-1503614472-8c93d56e92ce?w=1200&h=630&q=80&fit=crop",
    "Almanya": "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=1200&h=630&q=80&fit=crop",
    "Fransa": "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1200&h=630&q=80&fit=crop",
    "İtalya": "https://images.unsplash.com/photo-1515542622106-78bda8ba0e5b?w=1200&h=630&q=80&fit=crop",
    "İspanya": "https://images.unsplash.com/photo-1543783207-ec64e4d95325?w=1200&h=630&q=80&fit=crop",
    "Hollanda": "https://images.unsplash.com/photo-1534351590666-13e3e96b5017?w=1200&h=630&q=80&fit=crop",
    "Belçika": "https://images.unsplash.com/photo-1559564484-e48bf5f6c69a?w=1200&h=630&q=80&fit=crop",
    "İsviçre": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=630&q=80&fit=crop",
    "Avusturya": "https://images.unsplash.com/photo-1516550893923-42d28e5677af?w=1200&h=630&q=80&fit=crop",
    "Yunanistan": "https://images.unsplash.com/photo-1533105079780-92b9be482077?w=1200&h=630&q=80&fit=crop",
    "Portekiz": "https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=1200&h=630&q=80&fit=crop",
    "İrlanda": "https://images.unsplash.com/photo-1590089415225-401ed6f9db8e?w=1200&h=630&q=80&fit=crop",
    "Norveç": "https://images.unsplash.com/photo-1513519245088-0e12902e35ca?w=1200&h=630&q=80&fit=crop",
    "İsveç": "https://images.unsplash.com/photo-1509356843151-3e7d96241e11?w=1200&h=630&q=80&fit=crop",
    "Danimarka": "https://images.unsplash.com/photo-1513622470522-26c3c8a854bc?w=1200&h=630&q=80&fit=crop",
    "Finlandiya": "https://images.unsplash.com/photo-1517639493569-5666a7556f98?w=1200&h=630&q=80&fit=crop",
    "Polonya": "https://images.unsplash.com/photo-1529260830199-42c24126f198?w=1200&h=630&q=80&fit=crop",
    "Çek Cumhuriyeti": "https://images.unsplash.com/photo-1541849546-216549ae216d?w=1200&h=630&q=80&fit=crop",
    "Macaristan": "https://images.unsplash.com/photo-1541849546-216549ae216d?w=1200&h=630&q=80&fit=crop",
    "Avustralya": "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=1200&h=630&q=80&fit=crop",
    "Yeni Zelanda": "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1200&h=630&q=80&fit=crop",
    "Japonya": "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=1200&h=630&q=80&fit=crop",
    "Güney Kore": "https://images.unsplash.com/photo-1517154421773-0529f29ea451?w=1200&h=630&q=80&fit=crop",
    "Singapur": "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=1200&h=630&q=80&fit=crop",
    "Dubai": "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1200&h=630&q=80&fit=crop",
    "Birleşik Arap Emirlikleri": "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1200&h=630&q=80&fit=crop",
  };

  return countryImages[countryName] || DEFAULT_IMAGES.country;
}

/**
 * Get blog category default image
 */
export function getBlogCategoryImage(category?: string): string {
  const categoryImages: Record<string, string> = {
    "vize": "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=1200&h=630&q=80&fit=crop",
    "seyahat": "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1200&h=630&q=80&fit=crop",
    "rehber": "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1200&h=630&q=80&fit=crop",
    "ipucu": "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1200&h=630&q=80&fit=crop",
  };

  if (category && categoryImages[category.toLowerCase()]) {
    return categoryImages[category.toLowerCase()];
  }

  return DEFAULT_IMAGES.blog;
}

/**
 * Fix image URLs in HTML content
 * Replaces old system URLs with placeholder or removes broken images
 */
export function fixHtmlImageUrls(htmlContent: string, countryName?: string): string {
  if (!htmlContent) return htmlContent;

  // Pattern to match img tags with old system URLs
  const imgPattern = /<img([^>]*?)src=["']([^"']*?)["']([^>]*?)>/gi;
  
  return htmlContent.replace(imgPattern, (match, before, src, after) => {
    // Check if it's an old system URL
    const oldSystemPatterns = [
      /https?:\/\/.*kolayseyahat\.tr\/.*\/uploads\//i,
      /https?:\/\/.*kolayseyahat\.net\/.*\/uploads\//i,
      /\/uploads\/.*\.(jpg|jpeg|png|gif|webp)/i,
      /storage\/app\/public\//i,
    ];

    const isOldUrl = oldSystemPatterns.some(pattern => pattern.test(src));

    if (isOldUrl) {
      // Get a default image based on country
      const defaultImage = countryName 
        ? getCountryDefaultImage(countryName)
        : DEFAULT_IMAGES.country;

      // Return img tag with default image
      return `<img${before}src="${defaultImage}"${after}>`;
    }

    // Return original if URL is valid
    return match;
  });
}
