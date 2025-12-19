// Google Ads Conversion Tracking
// Conversion ID: AW-10858300718

// Type guard for gtag
const getGtag = (): ((...args: any[]) => void) | undefined => {
  if (typeof window !== 'undefined' && 'gtag' in window) {
    return (window as any).gtag;
  }
  return undefined;
};

// Form Submit Conversion - Dönüşüm Etiketi: ATDICN-wobYaEK6K0rko
export const trackFormSubmit = () => {
  const gtag = getGtag();
  if (gtag) {
    gtag('event', 'conversion', {
      'send_to': 'AW-10858300718/ATDICN-wobYaEK6K0rko',
    });
    console.log('📊 Form submit conversion tracked');
  }
};

// WhatsApp Click Conversion - Dönüşüm Etiketi: aC4pCJ_Xs_YZEK6K0rko
export const trackWhatsAppClick = () => {
  const gtag = getGtag();
  if (gtag) {
    gtag('event', 'conversion', {
      'send_to': 'AW-10858300718/aC4pCJ_Xs_YZEK6K0rko',
    });
    console.log('📊 WhatsApp click conversion tracked');
  }
};

// Phone Click Conversion - Tel tıklama dönüşümü
export const trackPhoneClick = () => {
  const gtag = getGtag();
  if (gtag) {
    gtag('event', 'conversion', {
      'send_to': 'AW-10858300718/phone_click',
    });
    console.log('📊 Phone click conversion tracked');
  }
};

// Generic event tracking
export const trackEvent = (eventName: string, params?: Record<string, any>) => {
  const gtag = getGtag();
  if (gtag) {
    gtag('event', eventName, params);
  }
};
