// Helper functions for locale-aware content

export type Locale = 'tr' | 'en';

/**
 * Get localized content from a database record
 * Falls back to Turkish if English content is not available
 */
export function getLocalizedContent<T extends Record<string, any>>(
  record: T,
  field: string,
  locale: Locale
): string {
  if (locale === 'en') {
    const enField = `${field}_en`;
    // Return English if available, otherwise fall back to Turkish
    return record[enField] || record[field] || '';
  }
  return record[field] || '';
}

/**
 * Get localized fields for a record
 * Returns an object with localized title, description, contents, etc.
 */
export function getLocalizedFields<T extends Record<string, any>>(
  record: T,
  locale: Locale
) {
  return {
    ...record,
    title: getLocalizedContent(record, 'title', locale),
    description: getLocalizedContent(record, 'description', locale),
    contents: getLocalizedContent(record, 'contents', locale),
    req_document: getLocalizedContent(record, 'req_document', locale),
    price_contents: getLocalizedContent(record, 'price_contents', locale),
    warning_notes: getLocalizedContent(record, 'warning_notes', locale),
    aboutme: getLocalizedContent(record, 'aboutme', locale),
  };
}

/**
 * Check if English content exists for a record
 */
export function hasEnglishContent(record: Record<string, any>): boolean {
  return !!(
    record.title_en ||
    record.description_en ||
    record.contents_en
  );
}
