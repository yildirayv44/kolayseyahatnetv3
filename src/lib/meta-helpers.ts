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
 * Generate optimized meta description for country pages
 * Max length: 155 characters (Google's recommended limit)
 */
export function generateCountryMetaDescription(
  country: Country,
  visaRequirement?: VisaRequirement
): string {
  const countryName = country.name;
  
  // If we have visa requirement data, create specific description
  if (visaRequirement?.visa_status) {
    const status = visaRequirement.visa_status.toLowerCase();
    
    // Visa-free
    if (status.includes('visa free') || status.includes('vizesiz')) {
      const stay = visaRequirement.allowed_stay;
      if (stay) {
        return `${countryName} vizesiz giriş! ${stay} kalış hakkı. Başvuru şartları ve detaylı bilgi için tıklayın.`;
      }
      return `${countryName} vizesiz giriş yapılabilir. Detaylı bilgi ve güncel şartlar için tıklayın.`;
    }
    
    // Visa on arrival
    if (status.includes('on arrival') || status.includes('kapıda')) {
      const stay = visaRequirement.allowed_stay;
      if (stay) {
        return `${countryName} kapıda vize! ${stay} kalış. Başvuru şartları ve gerekli belgeler için tıklayın.`;
      }
      return `${countryName} kapıda vize alınabilir. Gerekli belgeler ve güncel şartlar için tıklayın.`;
    }
    
    // eVisa
    if (status.includes('evisa') || status.includes('e-visa')) {
      return `${countryName} e-Vize başvurusu online! Hızlı onay, kolay başvuru. Şartlar ve belgeler için tıklayın.`;
    }
    
    // Visa required
    if (status.includes('required') || status.includes('gerekli')) {
      return `${countryName} vizesi başvurusu. Gerekli belgeler, şartlar ve randevu bilgileri için tıklayın.`;
    }
  }
  
  // Default description if no visa requirement data
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
