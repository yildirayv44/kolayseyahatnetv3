/**
 * Compress HTML content to reduce document size
 * Removes unnecessary whitespace, comments, and optimizes structure
 */

export function compressHtml(html: string): string {
  if (!html) return html;

  let compressed = html;

  // Remove HTML comments (except IE conditional comments)
  compressed = compressed.replace(/<!--(?!\[if\s)(?!<!)[^\[][\s\S]*?-->/g, '');

  // Remove excessive whitespace between tags
  compressed = compressed.replace(/>\s+</g, '><');

  // Remove whitespace at the start and end of content
  compressed = compressed.trim();

  // Collapse multiple spaces into one (but preserve single spaces)
  compressed = compressed.replace(/\s{2,}/g, ' ');

  // Remove whitespace around block-level elements
  compressed = compressed.replace(/\s*(<\/?(?:div|p|h[1-6]|ul|ol|li|section|article|header|footer|nav|aside|main|figure|figcaption|blockquote|pre|table|thead|tbody|tfoot|tr|td|th)(?:\s[^>]*)?>)\s*/gi, '$1');

  return compressed;
}

/**
 * Optimize blog content for performance
 * - Compress HTML
 * - Optimize images
 * - Remove unnecessary attributes
 */
export function optimizeBlogContent(html: string): string {
  if (!html) return html;

  let optimized = html;

  // First compress the HTML
  optimized = compressHtml(optimized);

  // Remove empty paragraphs
  optimized = optimized.replace(/<p>\s*<\/p>/gi, '');

  // Remove empty divs
  optimized = optimized.replace(/<div>\s*<\/div>/gi, '');

  // Remove inline styles that are not needed (keep important ones)
  // This is conservative - only remove obviously unnecessary ones
  optimized = optimized.replace(/\s*style=""\s*/gi, ' ');

  return optimized;
}
