/**
 * AI Helper Functions
 * Utility functions for AI content generation features
 */

import type { FAQItem, InternalLink, TonePreview, UpdateSuggestion, VisualSuggestion } from './ai-templates';

/**
 * Generate image alt text and caption using AI
 */
export async function generateImageDescription(imageUrl: string, context: string): Promise<{
  altText: string;
  caption: string;
}> {
  try {
    const response = await fetch('/api/admin/ai/image-description', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageUrl, context }),
    });

    const data = await response.json();
    if (data.success) {
      return {
        altText: data.altText,
        caption: data.caption,
      };
    }
  } catch (error) {
    console.error('Image description generation failed:', error);
  }

  // Fallback
  return {
    altText: context,
    caption: '',
  };
}

/**
 * Find and suggest internal links from content
 */
export async function findInternalLinks(content: string, currentSlug?: string): Promise<InternalLink[]> {
  try {
    const response = await fetch('/api/admin/ai/internal-links', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content, currentSlug }),
    });

    const data = await response.json();
    if (data.success) {
      return data.links;
    }
  } catch (error) {
    console.error('Internal link suggestion failed:', error);
  }

  return [];
}

/**
 * Generate FAQ from content
 */
export async function generateFAQ(content: string, count: number = 5): Promise<FAQItem[]> {
  try {
    const response = await fetch('/api/admin/ai/generate-faq', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content, count }),
    });

    const data = await response.json();
    if (data.success) {
      return data.faqs;
    }
  } catch (error) {
    console.error('FAQ generation failed:', error);
  }

  return [];
}

/**
 * Generate tone previews for a topic
 */
export async function generateTonePreviews(topic: string): Promise<TonePreview> {
  try {
    const response = await fetch('/api/admin/ai/tone-preview', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topic }),
    });

    const data = await response.json();
    if (data.success) {
      return data.previews;
    }
  } catch (error) {
    console.error('Tone preview generation failed:', error);
  }

  // Fallback
  return {
    informative: `${topic} hakkında detaylı bilgi...`,
    friendly: `${topic} ile ilgili merak ettikleriniz...`,
    formal: `${topic} konusunda resmi bilgilendirme...`,
  };
}

/**
 * Analyze content and suggest updates
 */
export async function analyzeContentForUpdates(
  content: string,
  lastUpdated: Date
): Promise<UpdateSuggestion[]> {
  try {
    const response = await fetch('/api/admin/ai/analyze-updates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content, lastUpdated: lastUpdated.toISOString() }),
    });

    const data = await response.json();
    if (data.success) {
      return data.suggestions;
    }
  } catch (error) {
    console.error('Content update analysis failed:', error);
  }

  return [];
}

/**
 * Suggest visual content for a topic
 */
export async function suggestVisualContent(
  topic: string,
  contentType: string
): Promise<VisualSuggestion[]> {
  try {
    const response = await fetch('/api/admin/ai/visual-suggestions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topic, contentType }),
    });

    const data = await response.json();
    if (data.success) {
      return data.suggestions;
    }
  } catch (error) {
    console.error('Visual content suggestion failed:', error);
  }

  return [];
}

/**
 * Insert internal links into content
 */
export function insertInternalLinks(content: string, links: InternalLink[]): string {
  let updatedContent = content;
  
  // Sort by relevance (highest first)
  const sortedLinks = [...links].sort((a, b) => b.relevance - a.relevance);
  
  for (const link of sortedLinks) {
    // Only link the first occurrence to avoid over-linking
    const regex = new RegExp(`\\b${escapeRegex(link.text)}\\b`, 'i');
    if (regex.test(updatedContent)) {
      updatedContent = updatedContent.replace(
        regex,
        `[${link.text}](${link.url})`
      );
    }
  }
  
  return updatedContent;
}

/**
 * Insert FAQ section into content
 */
export function insertFAQSection(content: string, faqs: FAQItem[]): string {
  if (faqs.length === 0) return content;
  
  let faqSection = '\n\n## Sıkça Sorulan Sorular\n\n';
  
  faqs.forEach((faq, index) => {
    faqSection += `### ${index + 1}. ${faq.question}\n\n`;
    faqSection += `${faq.answer}\n\n`;
  });
  
  return content + faqSection;
}

/**
 * Format visual suggestions as markdown comments
 */
export function formatVisualSuggestions(suggestions: VisualSuggestion[]): string {
  if (suggestions.length === 0) return '';
  
  let formatted = '\n\n<!-- Görsel Önerileri:\n';
  
  suggestions.forEach((suggestion, index) => {
    formatted += `${index + 1}. ${suggestion.type.toUpperCase()}: ${suggestion.topic}\n`;
    formatted += `   ${suggestion.description}\n`;
    formatted += `   Öncelik: ${suggestion.priority}\n\n`;
  });
  
  formatted += '-->\n';
  
  return formatted;
}

/**
 * Escape special regex characters
 */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Calculate content freshness score (0-100)
 */
export function calculateFreshnessScore(lastUpdated: Date): number {
  const now = new Date();
  const daysSinceUpdate = Math.floor((now.getTime() - lastUpdated.getTime()) / (1000 * 60 * 60 * 24));
  
  if (daysSinceUpdate < 30) return 100;
  if (daysSinceUpdate < 90) return 80;
  if (daysSinceUpdate < 180) return 60;
  if (daysSinceUpdate < 365) return 40;
  return 20;
}

/**
 * Extract keywords from content
 */
export function extractKeywords(content: string, count: number = 10): string[] {
  // Remove markdown formatting
  const plainText = content
    .replace(/#{1,6}\s/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[*_~`]/g, '');
  
  // Split into words
  const words = plainText
    .toLowerCase()
    .split(/\s+/)
    .filter(word => word.length > 3);
  
  // Count frequency
  const frequency: Record<string, number> = {};
  words.forEach(word => {
    frequency[word] = (frequency[word] || 0) + 1;
  });
  
  // Sort by frequency and return top N
  return Object.entries(frequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, count)
    .map(([word]) => word);
}
