/**
 * Calculate reading time based on word count
 * Average reading speed: 200 words per minute (Turkish)
 */
export function calculateReadingTime(html: string, locale: 'tr' | 'en' = 'tr'): number {
  // Strip HTML tags
  const text = html.replace(/<[^>]*>/g, ' ');
  
  // Count words (split by whitespace)
  const words = text.trim().split(/\s+/).filter(word => word.length > 0);
  const wordCount = words.length;
  
  // Reading speed varies by language
  const wordsPerMinute = locale === 'en' ? 238 : 200; // English is typically faster
  
  // Calculate minutes, minimum 1 minute
  const minutes = Math.ceil(wordCount / wordsPerMinute);
  
  return Math.max(1, minutes);
}

/**
 * Format reading time for display
 */
export function formatReadingTime(minutes: number, locale: 'tr' | 'en' = 'tr'): string {
  if (locale === 'en') {
    return minutes === 1 ? '1 minute read' : `${minutes} minutes read`;
  }
  return `${minutes} dakika okuma`;
}

/**
 * Get reading time with formatted string
 */
export function getReadingTime(html: string, locale: 'tr' | 'en' = 'tr'): {
  minutes: number;
  formatted: string;
} {
  const minutes = calculateReadingTime(html, locale);
  const formatted = formatReadingTime(minutes, locale);
  
  return { minutes, formatted };
}
