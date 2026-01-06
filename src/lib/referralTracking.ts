/**
 * Partner Referral Tracking System
 * 
 * Kullanım:
 * 1. Partner linki: https://www.kolayseyahat.net?ref=KS123456
 * 2. Kullanıcı siteye geldiğinde partner_id cookie'ye kaydedilir
 * 3. Form gönderiminde otomatik olarak partner_id eklenir
 */

const REFERRAL_COOKIE_NAME = 'ks_partner_ref';
const REFERRAL_EXPIRY_DAYS = 30; // 30 gün geçerli

/**
 * URL'den partner_id'yi yakalar ve cookie'ye kaydeder
 */
export function captureReferral(): string | null {
  if (typeof window === 'undefined') return null;

  const urlParams = new URLSearchParams(window.location.search);
  const partnerId = urlParams.get('ref');

  if (partnerId) {
    // Cookie'ye kaydet (30 gün geçerli)
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + REFERRAL_EXPIRY_DAYS);
    
    document.cookie = `${REFERRAL_COOKIE_NAME}=${partnerId}; expires=${expiryDate.toUTCString()}; path=/; SameSite=Lax`;
    
    // LocalStorage'a da yedek olarak kaydet
    try {
      localStorage.setItem(REFERRAL_COOKIE_NAME, partnerId);
      localStorage.setItem(`${REFERRAL_COOKIE_NAME}_timestamp`, Date.now().toString());
    } catch (e) {
      console.error('LocalStorage error:', e);
    }

    console.log('✅ Partner referral captured:', partnerId);
    return partnerId;
  }

  return null;
}

/**
 * Kaydedilmiş partner_id'yi getirir
 */
export function getReferralPartnerId(): string | null {
  if (typeof window === 'undefined') return null;

  // Önce cookie'den kontrol et
  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === REFERRAL_COOKIE_NAME) {
      return value;
    }
  }

  // Cookie yoksa localStorage'dan kontrol et
  try {
    const storedPartnerId = localStorage.getItem(REFERRAL_COOKIE_NAME);
    const timestamp = localStorage.getItem(`${REFERRAL_COOKIE_NAME}_timestamp`);
    
    if (storedPartnerId && timestamp) {
      const daysSinceCapture = (Date.now() - parseInt(timestamp)) / (1000 * 60 * 60 * 24);
      
      // 30 günden eskiyse sil
      if (daysSinceCapture > REFERRAL_EXPIRY_DAYS) {
        localStorage.removeItem(REFERRAL_COOKIE_NAME);
        localStorage.removeItem(`${REFERRAL_COOKIE_NAME}_timestamp`);
        return null;
      }
      
      return storedPartnerId;
    }
  } catch (e) {
    console.error('LocalStorage error:', e);
  }

  return null;
}

/**
 * Referral bilgisini temizler
 */
export function clearReferral(): void {
  if (typeof window === 'undefined') return;

  // Cookie'yi sil
  document.cookie = `${REFERRAL_COOKIE_NAME}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
  
  // LocalStorage'ı temizle
  try {
    localStorage.removeItem(REFERRAL_COOKIE_NAME);
    localStorage.removeItem(`${REFERRAL_COOKIE_NAME}_timestamp`);
  } catch (e) {
    console.error('LocalStorage error:', e);
  }
}

/**
 * Partner referral bilgisini kontrol eder ve varsa gösterir
 */
export function checkReferral(): { hasReferral: boolean; partnerId: string | null } {
  const partnerId = getReferralPartnerId();
  return {
    hasReferral: !!partnerId,
    partnerId
  };
}
