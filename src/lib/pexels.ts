/**
 * Pexels API Integration
 * API Key: ydkwM7I4jF8FAb4ST0w7oifGhWQQ4oFpCoVuTgxsOjKrNHN4fGr7iqxc
 */

const PEXELS_API_KEY = process.env.PEXELS_API_KEY || 'ydkwM7I4jF8FAb4ST0w7oifGhWQQ4oFpCoVuTgxsOjKrNHN4fGr7iqxc';
const PEXELS_API_URL = 'https://api.pexels.com/v1';

export interface PexelsPhoto {
  id: number;
  width: number;
  height: number;
  url: string;
  photographer: string;
  photographer_url: string;
  src: {
    original: string;
    large2x: string;
    large: string;
    medium: string;
    small: string;
    portrait: string;
    landscape: string;
    tiny: string;
  };
  alt: string;
}

export interface PexelsSearchResponse {
  total_results: number;
  page: number;
  per_page: number;
  photos: PexelsPhoto[];
  next_page?: string;
}

/**
 * Pexels'ten fotoğraf ara
 */
export async function searchPexelsPhotos(
  query: string,
  options: {
    perPage?: number;
    page?: number;
    orientation?: 'landscape' | 'portrait' | 'square';
    size?: 'large' | 'medium' | 'small';
    locale?: 'en-US' | 'tr-TR';
  } = {}
): Promise<PexelsSearchResponse | null> {
  const {
    perPage = 15,
    page = 1,
    orientation = 'landscape',
    size = 'large',
    locale = 'tr-TR',
  } = options;

  try {
    const params = new URLSearchParams({
      query,
      per_page: perPage.toString(),
      page: page.toString(),
      orientation,
      size,
      locale,
    });

    const response = await fetch(`${PEXELS_API_URL}/search?${params}`, {
      headers: {
        Authorization: PEXELS_API_KEY,
      },
    });

    if (!response.ok) {
      console.error('Pexels API error:', response.status, response.statusText);
      return null;
    }

    const data: PexelsSearchResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Error searching Pexels photos:', error);
    return null;
  }
}

/**
 * İçerikten anahtar kelimeleri çıkar
 */
export function extractKeywordsFromContent(content: string, title?: string): string {
  // HTML etiketlerini temizle
  const cleanText = content.replace(/<[^>]*>/g, ' ');
  
  // Başlık varsa öncelik ver
  if (title) {
    // Başlıktan gereksiz kelimeleri temizle
    const cleanTitle = title
      .replace(/vizesi|vize|başvurusu|nasıl|nedir|ne kadar|2025|2024/gi, '')
      .trim();
    
    if (cleanTitle.length > 3) {
      return cleanTitle;
    }
  }
  
  // İçerikten ilk anlamlı kelimeyi al
  const words = cleanText
    .split(/\s+/)
    .filter(word => word.length > 3)
    .filter(word => !['için', 'olan', 'ülke', 'vize', 'nasıl', 'nedir'].includes(word.toLowerCase()));
  
  return words[0] || 'travel';
}

/**
 * URL'nin 404 dönüp dönmediğini kontrol et
 */
export async function isImageBroken(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return !response.ok;
  } catch (error) {
    return true;
  }
}

/**
 * HTML içeriğindeki kırık görselleri Pexels'ten yenileriyle değiştir
 */
export async function replacebrokenImagesInHTML(
  html: string,
  context: string
): Promise<{ html: string; replacedCount: number }> {
  const imgRegex = /<img[^>]+src="([^"]+)"[^>]*>/g;
  const matches = Array.from(html.matchAll(imgRegex));
  
  let replacedCount = 0;
  let updatedHtml = html;
  
  for (const match of matches) {
    const fullTag = match[0];
    const imageUrl = match[1];
    
    // URL'yi kontrol et
    const isBroken = await isImageBroken(imageUrl);
    
    if (isBroken) {
      console.log('🔍 Broken image found:', imageUrl);
      
      // Alt text'i çıkar veya context kullan
      const altMatch = fullTag.match(/alt="([^"]+)"/);
      const altText = altMatch ? altMatch[1] : context;
      
      // Pexels'ten yeni görsel bul
      const searchQuery = extractKeywordsFromContent(altText, context);
      const pexelsResult = await searchPexelsPhotos(searchQuery, {
        perPage: 1,
        orientation: 'landscape',
      });
      
      if (pexelsResult && pexelsResult.photos.length > 0) {
        const newPhoto = pexelsResult.photos[0];
        const newImageUrl = newPhoto.src.large;
        
        // Yeni img tag oluştur
        const newTag = `<img src="${newImageUrl}" alt="${newPhoto.alt || altText}" />`;
        
        updatedHtml = updatedHtml.replace(fullTag, newTag);
        replacedCount++;
        
        console.log('✅ Replaced with Pexels image:', newImageUrl);
      }
    }
  }
  
  return { html: updatedHtml, replacedCount };
}

/**
 * Prompt'tan görsel oluştur ve HTML'e ekle
 */
export async function generateImageFromPrompt(
  prompt: string,
  insertPosition: 'start' | 'end' | 'after-first-paragraph' = 'after-first-paragraph'
): Promise<string | null> {
  const pexelsResult = await searchPexelsPhotos(prompt, {
    perPage: 1,
    orientation: 'landscape',
  });
  
  if (!pexelsResult || pexelsResult.photos.length === 0) {
    return null;
  }
  
  const photo = pexelsResult.photos[0];
  const imgTag = `<img src="${photo.src.large}" alt="${photo.alt || prompt}" class="w-full rounded-lg shadow-lg my-6" />`;
  
  return imgTag;
}

/**
 * Blog veya ülke içeriğine otomatik görsel ekle
 */
export async function addImagesToContent(
  html: string,
  title: string,
  imageCount: number = 2
): Promise<string> {
  let updatedHtml = html;
  
  // İlk paragraftan sonra görsel ekle
  const firstParagraphMatch = updatedHtml.match(/<\/p>/);
  
  if (firstParagraphMatch) {
    const keywords = extractKeywordsFromContent(html, title);
    const imgTag = await generateImageFromPrompt(keywords);
    
    if (imgTag) {
      const insertIndex = firstParagraphMatch.index! + 4; // </p> sonrası
      updatedHtml = 
        updatedHtml.slice(0, insertIndex) + 
        '\n' + imgTag + '\n' + 
        updatedHtml.slice(insertIndex);
    }
  }
  
  return updatedHtml;
}
