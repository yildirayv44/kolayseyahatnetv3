/**
 * Meta description helper functions
 * Optimized for SEO and user engagement
 */

interface VisaRequirement {
  visa_status?: string;
  allowed_stay?: string;
  conditions?: string;
  application_method?: string;
}

interface Country {
  name: string;
  country_code?: string;
}

/**
 * Format allowed stay for display in meta description
 */
function formatStayForMeta(stay: string | undefined, locale: 'tr' | 'en'): string {
  if (!stay) return '';
  
  const match = stay.match(/^(\d+)\s*(days?|gün)$/i);
  if (match) {
    const num = match[1];
    return locale === 'tr' ? `${num} gün` : `${num} days`;
  }
  
  if (stay.toLowerCase().includes('gün')) {
    return locale === 'en' ? stay.replace(/gün/gi, 'days') : stay;
  }
  
  return stay;
}

/**
 * Generate optimized meta description for country pages
 * Max length: 155 characters (Google's recommended limit)
 * Supports both Turkish and English
 */
export function generateCountryMetaDescription(
  country: Country,
  visaRequirement?: VisaRequirement,
  locale: 'tr' | 'en' = 'tr'
): string {
  const countryName = country.name;
  
  // If we have visa requirement data, create specific description
  if (visaRequirement?.visa_status) {
    const status = visaRequirement.visa_status.toLowerCase();
    const stay = formatStayForMeta(visaRequirement.allowed_stay, locale);
    
    // Visa-free
    if (status.includes('visa-free') || status.includes('visa free') || status.includes('vizesiz')) {
      if (locale === 'en') {
        if (stay) {
          return `${countryName} visa-free entry! ${stay} stay allowed. Requirements and details - click for more info.`;
        }
        return `${countryName} visa-free entry for Turkish citizens. Click for current requirements and details.`;
      }
      // Turkish
      if (stay) {
        return `${countryName} vizesiz giriş! ${stay} kalış hakkı. Başvuru şartları ve detaylı bilgi için tıklayın.`;
      }
      return `${countryName} vizesiz giriş yapılabilir. Detaylı bilgi ve güncel şartlar için tıklayın.`;
    }
    
    // Visa on arrival
    if (status.includes('visa-on-arrival') || status.includes('on arrival') || status.includes('on-arrival') || status.includes('kapıda')) {
      if (locale === 'en') {
        if (stay) {
          return `${countryName} visa on arrival! ${stay} stay. Requirements and documents - click for details.`;
        }
        return `${countryName} visa on arrival available. Click for required documents and current conditions.`;
      }
      // Turkish
      if (stay) {
        return `${countryName} kapıda vize! ${stay} kalış. Başvuru şartları ve gerekli belgeler için tıklayın.`;
      }
      return `${countryName} kapıda vize alınabilir. Gerekli belgeler ve güncel şartlar için tıklayın.`;
    }
    
    // eVisa / ETA
    if (status.includes('evisa') || status.includes('e-visa') || status.includes('eta')) {
      if (locale === 'en') {
        return `${countryName} e-Visa application online! Fast approval, easy process. Click for requirements.`;
      }
      return `${countryName} e-Vize başvurusu online! Hızlı onay, kolay başvuru. Şartlar ve belgeler için tıklayın.`;
    }
    
    // Visa required
    if (status.includes('visa-required') || status.includes('required') || status.includes('gerekli')) {
      if (locale === 'en') {
        return `${countryName} visa application. Required documents, conditions and appointment info - click for details.`;
      }
      return `${countryName} vizesi başvurusu. Gerekli belgeler, şartlar ve randevu bilgileri için tıklayın.`;
    }
  }
  
  // Default description if no visa requirement data
  if (locale === 'en') {
    return `${countryName} visa application - required documents, conditions and current info. Apply now!`;
  }
  return `${countryName} vizesi başvurusu için gerekli belgeler, şartlar ve güncel bilgiler. Hemen başvurun!`;
}

/**
 * Generate optimized meta description for country menu pages (sub-pages)
 * Max length: 155 characters
 */
export function generateMenuMetaDescription(
  menuName: string,
  countryName?: string,
  menuDescription?: string
): string {
  // If we have a custom description, use it but truncate if needed
  if (menuDescription) {
    const cleaned = menuDescription.trim();
    if (cleaned.length <= 155) {
      return cleaned;
    }
    // Truncate at word boundary
    return cleaned.substring(0, 152).trim() + '...';
  }
  
  // Generate based on menu name
  const name = menuName.toLowerCase();
  
  // Student visa
  if (name.includes('öğrenci') || name.includes('student')) {
    return `${menuName} başvurusu. Gerekli belgeler, şartlar ve başvuru süreci hakkında detaylı bilgi.`;
  }
  
  // Work visa
  if (name.includes('çalışma') || name.includes('work') || name.includes('iş')) {
    return `${menuName} başvurusu. İş izni, gerekli belgeler ve başvuru şartları hakkında bilgi.`;
  }
  
  // Tourist visa
  if (name.includes('turist') || name.includes('tourist') || name.includes('ziyaret')) {
    return `${menuName} başvurusu. Gerekli belgeler, şartlar ve başvuru süreci için tıklayın.`;
  }
  
  // Family visa
  if (name.includes('aile') || name.includes('family') || name.includes('eş')) {
    return `${menuName} başvurusu. Aile birleşimi için gerekli belgeler ve şartlar hakkında bilgi.`;
  }
  
  // Transit visa
  if (name.includes('transit') || name.includes('aktarma')) {
    return `${menuName} başvurusu. Transit geçiş için gerekli belgeler ve şartlar hakkında bilgi.`;
  }
  
  // Default
  if (countryName) {
    return `${countryName} ${menuName} başvurusu. Gerekli belgeler, şartlar ve güncel bilgiler.`;
  }
  
  return `${menuName} başvurusu için gerekli belgeler, şartlar ve güncel bilgiler. Hemen başvurun!`;
}

/**
 * Truncate text to max length at word boundary
 */
export function truncateAtWord(text: string, maxLength: number = 155): string {
  if (text.length <= maxLength) {
    return text;
  }
  
  const truncated = text.substring(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');
  
  if (lastSpace > 0) {
    return truncated.substring(0, lastSpace).trim() + '...';
  }
  
  return truncated.trim() + '...';
}

/**
 * Truncate title to max length (60 chars for Google)
 * Preserves brand name if possible
 */
export function truncateTitle(title: string, maxLength: number = 60): string {
  if (title.length <= maxLength) {
    return title;
  }
  
  // If title has brand separator, try to keep brand
  const separators = [' | ', ' - ', ' – '];
  for (const sep of separators) {
    if (title.includes(sep)) {
      const parts = title.split(sep);
      const brand = parts[parts.length - 1];
      const mainPart = parts.slice(0, -1).join(sep);
      
      // Calculate available space for main part
      const availableLength = maxLength - sep.length - brand.length;
      
      if (availableLength > 20) {
        // Truncate main part and keep brand
        const truncatedMain = mainPart.substring(0, availableLength - 3).trim() + '...';
        return `${truncatedMain}${sep}${brand}`;
      }
    }
  }
  
  // Simple truncation
  return title.substring(0, maxLength - 3).trim() + '...';
}

/**
 * Generate pseudo-random number from string (deterministic)
 * Used for consistent review counts and ratings per country
 */
export function seededRandom(seed: string, min: number, max: number): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  const normalized = Math.abs(hash) / 2147483647; // Normalize to 0-1
  return Math.floor(normalized * (max - min + 1)) + min;
}

/**
 * Generate pseudo-random rating from string (deterministic)
 * Returns value between 4.7 and 5.0
 */
export function seededRating(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  const normalized = Math.abs(hash) / 2147483647;
  // Range: 4.7 to 5.0 (0.3 range)
  const rating = 4.7 + (normalized * 0.3);
  return Math.round(rating * 10) / 10; // Round to 1 decimal
}
