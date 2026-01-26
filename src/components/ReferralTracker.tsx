"use client";

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { captureReferral, getReferralPartnerId } from '@/lib/referralTracking';
import { initPartnerSession, trackPageView } from '@/lib/partnerActivityTracking';

/**
 * Otomatik referral tracking component
 * Layout'a eklendiğinde tüm sayfalarda çalışır
 */
export function ReferralTracker() {
  const pathname = usePathname();

  useEffect(() => {
    // Sayfa yüklendiğinde URL'den partner_id'yi yakala
    const partnerId = captureReferral();
    
    // Partner ID varsa session başlat
    if (partnerId) {
      initPartnerSession(partnerId);
    }
  }, []);

  useEffect(() => {
    // Her sayfa değişiminde activity track et
    const partnerId = getReferralPartnerId();
    if (partnerId) {
      trackPageView(partnerId);
    }
  }, [pathname]);

  // Görünmez component
  return null;
}
