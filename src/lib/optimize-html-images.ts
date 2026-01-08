/**
 * Optimize HTML content images for better performance
 * - Add loading="lazy" to all images
 * - Add width/height attributes if missing
 * - Convert Supabase images to use transformation API
 */

export function optimizeHtmlImages(html: string): string {
  if (!html) return html;

  // Parse HTML and optimize images
  let optimizedHtml = html;

  // 1. Add loading="lazy" to all images that don't have it
  optimizedHtml = optimizedHtml.replace(
    /<img(?![^>]*loading=)/gi,
    '<img loading="lazy"'
  );

  // 2. Add decoding="async" for better performance
  optimizedHtml = optimizedHtml.replace(
    /<img(?![^>]*decoding=)/gi,
    '<img decoding="async"'
  );

  // 3. Optimize Supabase image URLs with transformation parameters
  optimizedHtml = optimizedHtml.replace(
    /src="(https:\/\/[^"]*supabase\.co\/storage\/v1\/object\/public\/[^"]+)"/gi,
    (match, url) => {
      // Skip if already has transformation parameters
      if (url.includes('?') || url.includes('width=')) {
        return match;
      }

      // Add transformation parameters for automatic optimization
      // Supabase will automatically resize and optimize
      const optimizedUrl = `${url}?width=1200&quality=85`;
      return `src="${optimizedUrl}"`;
    }
  );

  // 4. Add explicit dimensions to images without them (prevents layout shift)
  // This is a simple heuristic - you might want to make this more sophisticated
  optimizedHtml = optimizedHtml.replace(
    /<img(?![^>]*width=)(?![^>]*height=)([^>]*)>/gi,
    '<img$1 style="max-width: 100%; height: auto;">'
  );

  return optimizedHtml;
}

/**
 * Optimize HTML content for performance
 * - Optimize images
 * - Add proper attributes
 * - Improve accessibility
 */
export function optimizeHtmlContent(html: string): string {
  if (!html) return html;

  let optimizedHtml = html;

  // Optimize images
  optimizedHtml = optimizeHtmlImages(optimizedHtml);

  // Add target="_blank" and rel="noopener noreferrer" to external links
  optimizedHtml = optimizedHtml.replace(
    /<a\s+href="(https?:\/\/(?!www\.kolayseyahat\.net)[^"]+)"(?![^>]*target=)/gi,
    '<a href="$1" target="_blank" rel="noopener noreferrer"'
  );

  return optimizedHtml;
}
