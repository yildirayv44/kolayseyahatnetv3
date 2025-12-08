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
 * Uses Unsplash collection for consistent, high-quality images
 */
export function getCountryDefaultImage(countryName: string): string {
  const countryImages: Record<string, string> = {
    // Americas
    "Amerika": "https://images.unsplash.com/photo-1485738422979-f5c462d49f74?w=1200&h=630&q=80&fit=crop",
    "Kanada": "https://images.unsplash.com/photo-1503614472-8c93d56e92ce?w=1200&h=630&q=80&fit=crop",
    "Meksika": "https://images.unsplash.com/photo-1518638150340-f706e86654de?w=1200&h=630&q=80&fit=crop",
    "Brezilya": "https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=1200&h=630&q=80&fit=crop",
    "Arjantin": "https://images.unsplash.com/photo-1589909202802-8f4aadce1849?w=1200&h=630&q=80&fit=crop",
    
    // Europe - Western
    "İngiltere": "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=1200&h=630&q=80&fit=crop",
    "Almanya": "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=1200&h=630&q=80&fit=crop",
    "Fransa": "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1200&h=630&q=80&fit=crop",
    "İtalya": "https://images.unsplash.com/photo-1515542622106-78bda8ba0e5b?w=1200&h=630&q=80&fit=crop",
    "İspanya": "https://images.unsplash.com/photo-1543783207-ec64e4d95325?w=1200&h=630&q=80&fit=crop",
    "Hollanda": "https://images.unsplash.com/photo-1534351590666-13e3e96b5017?w=1200&h=630&q=80&fit=crop",
    "Belçika": "https://images.unsplash.com/photo-1558862107-d49ef2a04d72?w=1200&h=630&q=80&fit=crop",
    "İsviçre": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=630&q=80&fit=crop",
    "Avusturya": "https://images.unsplash.com/photo-1516550893923-42d28e5677af?w=1200&h=630&q=80&fit=crop",
    "Portekiz": "https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=1200&h=630&q=80&fit=crop",
    "İrlanda": "https://images.unsplash.com/photo-1590089415225-401ed6f9db8e?w=1200&h=630&q=80&fit=crop",
    
    // Europe - Northern
    "Norveç": "https://images.unsplash.com/photo-1601439678777-b2b3c56fa627?w=1200&h=630&q=80&fit=crop",
    "İsveç": "https://images.unsplash.com/photo-1509356843151-3e7d96241e11?w=1200&h=630&q=80&fit=crop",
    "Danimarka": "https://images.unsplash.com/photo-1513622470522-26c3c8a854bc?w=1200&h=630&q=80&fit=crop",
    "Finlandiya": "https://images.unsplash.com/photo-1564507592333-c60657eea523?w=1200&h=630&q=80&fit=crop",
    "İzlanda": "https://images.unsplash.com/photo-1504829857797-ddff29c27927?w=1200&h=630&q=80&fit=crop",
    
    // Europe - Eastern & Southern
    "Yunanistan": "https://images.unsplash.com/photo-1533105079780-92b9be482077?w=1200&h=630&q=80&fit=crop",
    "Polonya": "https://images.unsplash.com/photo-1529260830199-42c24126f198?w=1200&h=630&q=80&fit=crop",
    "Çek Cumhuriyeti": "https://images.unsplash.com/photo-1541849546-216549ae216d?w=1200&h=630&q=80&fit=crop",
    "Macaristan": "https://images.unsplash.com/photo-1541849546-216549ae216d?w=1200&h=630&q=80&fit=crop",
    "Romanya": "https://images.unsplash.com/photo-1555993539-1732b0258235?w=1200&h=630&q=80&fit=crop",
    "Bulgaristan": "https://images.unsplash.com/photo-1555993539-1732b0258235?w=1200&h=630&q=80&fit=crop",
    "Hırvatistan": "https://images.unsplash.com/photo-1516483638261-f4dbaf036963?w=1200&h=630&q=80&fit=crop",
    
    // Asia - East
    "Japonya": "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=1200&h=630&q=80&fit=crop",
    "Güney Kore": "https://images.unsplash.com/photo-1517154421773-0529f29ea451?w=1200&h=630&q=80&fit=crop",
    "Çin": "https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=1200&h=630&q=80&fit=crop",
    "Hong Kong": "https://images.unsplash.com/photo-1536599018102-9f803c140fc1?w=1200&h=630&q=80&fit=crop",
    
    // Asia - Southeast
    "Singapur": "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=1200&h=630&q=80&fit=crop",
    "Tayland": "https://images.unsplash.com/photo-1528181304800-259b08848526?w=1200&h=630&q=80&fit=crop",
    "Vietnam": "https://images.unsplash.com/photo-1528127269322-539801943592?w=1200&h=630&q=80&fit=crop",
    "Endonezya": "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=1200&h=630&q=80&fit=crop",
    "Malezya": "https://images.unsplash.com/photo-1596422846543-75c6fc197f07?w=1200&h=630&q=80&fit=crop",
    "Filipinler": "https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86?w=1200&h=630&q=80&fit=crop",
    
    // Middle East
    "Dubai": "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1200&h=630&q=80&fit=crop",
    "Birleşik Arap Emirlikleri": "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1200&h=630&q=80&fit=crop",
    "Katar": "https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=1200&h=630&q=80&fit=crop",
    "Bahreyn": "https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=1200&h=630&q=80&fit=crop",
    "Kuveyt": "https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=1200&h=630&q=80&fit=crop",
    "Umman": "https://images.unsplash.com/photo-1591608971362-f08b2a75731a?w=1200&h=630&q=80&fit=crop",
    "İsrail": "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=1200&h=630&q=80&fit=crop",
    
    // Oceania
    "Avustralya": "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=1200&h=630&q=80&fit=crop",
    "Yeni Zelanda": "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1200&h=630&q=80&fit=crop",
    
    // Africa
    "Güney Afrika": "https://images.unsplash.com/photo-1484318571209-661cf29a69c3?w=1200&h=630&q=80&fit=crop",
    "Mısır": "https://images.unsplash.com/photo-1539650116574-8efeb43e2750?w=1200&h=630&q=80&fit=crop",
    "Fas": "https://images.unsplash.com/photo-1489749798305-4fea3ae63d43?w=1200&h=630&q=80&fit=crop",
    "Kenya": "https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=1200&h=630&q=80&fit=crop",
    "Tanzanya": "https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=1200&h=630&q=80&fit=crop",
    "Togo": "https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=1200&h=630&q=80&fit=crop",
    "Benin": "https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=1200&h=630&q=80&fit=crop",
    "Uganda": "https://images.unsplash.com/photo-1621542320937-4a8b6b6e1b8e?w=1200&h=630&q=80&fit=crop",
    "Zambiya": "https://images.unsplash.com/photo-1489392191049-fc10c97e64b6?w=1200&h=630&q=80&fit=crop",
    
    // Europe - Other
    "Vatikan": "https://images.unsplash.com/photo-1531572753322-ad063cecc140?w=1200&h=630&q=80&fit=crop",
    "Rusya": "https://images.unsplash.com/photo-1513326738677-b964603b136d?w=1200&h=630&q=80&fit=crop",
    "Ukrayna": "https://images.unsplash.com/photo-1559628376-f3fe5f782a2e?w=1200&h=630&q=80&fit=crop",
    
    // Asia - Other
    "Bhutan": "https://images.unsplash.com/photo-1561361513-2d000a50f0dc?w=1200&h=630&q=80&fit=crop",
    "Nepal": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=630&q=80&fit=crop",
    "Sri Lanka": "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&h=630&q=80&fit=crop",
    "Hindistan": "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=1200&h=630&q=80&fit=crop",
  };

  // Try exact match first
  if (countryImages[countryName]) {
    return countryImages[countryName];
  }

  // Try case-insensitive match
  const lowerName = countryName.toLowerCase();
  const matchedKey = Object.keys(countryImages).find(
    key => key.toLowerCase() === lowerName
  );

  if (matchedKey) {
    return countryImages[matchedKey];
  }

  // Fallback to generic travel image
  console.warn(`No specific image found for country: ${countryName}, using default`);
  return DEFAULT_IMAGES.country;
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
