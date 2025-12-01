/**
 * Generate URL-friendly slug from text
 */
export function generateSlug(text: string): string {
  const turkishMap: Record<string, string> = {
    'ç': 'c', 'Ç': 'c',
    'ğ': 'g', 'Ğ': 'g',
    'ı': 'i', 'İ': 'i',
    'ö': 'o', 'Ö': 'o',
    'ş': 's', 'Ş': 's',
    'ü': 'u', 'Ü': 'u',
  };

  return text
    .split('')
    .map(char => turkishMap[char] || char)
    .join('')
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special chars
    .replace(/\s+/g, '-')     // Replace spaces with -
    .replace(/-+/g, '-')      // Replace multiple - with single -
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing -
}

// Ülke ID'sinden slug'a dönüşüm (legacy support)
export const COUNTRY_ID_TO_SLUG: Record<number, string> = {
  4: "amerika",
  6: "ingiltere",
  7: "yunanistan",
  8: "benin",
  10: "bahreyn",
  12: "rusya",
  14: "dubai",
  15: "fransa",
  16: "vietnam",
  17: "kenya",
  18: "uganda",
  19: "zambiya",
  20: "guney-kore",
  21: "bhutan",
  22: "togo",
  23: "umman",
  24: "tanzanya",
  25: "tayland-vizesi",
  26: "kanada-vizesi",
  3: "kuveyt",
};

export function getCountrySlug(countryId: number): string {
  return COUNTRY_ID_TO_SLUG[countryId] || `country-${countryId}`;
}

// Consultant slug helper - taxonomies'den slug kullan
export function getConsultantSlug(consultant: any): string {
  // Consultant'ın taxonomy slug'ı varsa kullan
  if (consultant.taxonomy_slug) {
    return `/${consultant.taxonomy_slug}`;
  }
  
  // Fallback: ID kullan
  return `/danisman/${consultant.id}`;
}

// Blog slug helper - taxonomies'den slug kullan
export function getBlogSlug(blog: any): string {
  // Blog'un taxonomy slug'ı varsa kullan
  if (blog.taxonomy_slug) {
    return `/${blog.taxonomy_slug}`;
  }
  
  // Fallback: blog.slug veya blog.url
  if (blog.slug) {
    const slug = blog.slug.trim();
    return slug.startsWith('/') ? slug : `/blog/${slug}`;
  }
  
  if (blog.url) {
    const url = blog.url.trim();
    return url.startsWith('/') ? url : url;
  }
  
  // Son çare: ID kullan
  return `/blog/${blog.id}`;
}

// Parse H2 headings from HTML content
export function parseH2Headings(html: string): Array<{ id: string; title: string }> {
  if (!html) return [];
  
  const h2Regex = /<h2[^>]*>(.*?)<\/h2>/gi;
  const headings: Array<{ id: string; title: string }> = [];
  let match;
  
  while ((match = h2Regex.exec(html)) !== null) {
    const title = match[1].replace(/<[^>]*>/g, '').trim();
    if (title) {
      const id = title
        .toLowerCase()
        .replace(/[^a-z0-9ğüşıöçĞÜŞİÖÇ\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
      headings.push({ id, title });
    }
  }
  
  return headings;
}

// Türkçe karakterleri normalize et
function normalizeSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ı/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .replace(/Ğ/g, 'g')
    .replace(/Ü/g, 'u')
    .replace(/Ş/g, 's')
    .replace(/İ/g, 'i')
    .replace(/Ö/g, 'o')
    .replace(/Ç/g, 'c');
}

// Menu slug helper
export function getMenuSlug(menu: any): string {
  // Önce slug varsa kullan (normalize ETME - DB'deki gibi kullan)
  if (menu.slug) {
    const slug = menu.slug.trim();
    return slug.startsWith('/') ? slug : `/${slug}`;
  }
  
  // URL varsa kullan (normalize ETME)
  if (menu.url) {
    const url = menu.url.trim();
    return url.startsWith('/') ? url : `/${url}`;
  }
  
  // Hiçbiri yoksa name'den slug oluştur (normalize et)
  if (menu.name) {
    const slug = normalizeSlug(menu.name)
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
    return `/${slug}`;
  }
  
  // Son çare: ID kullan
  return `/page/${menu.id}`;
}
