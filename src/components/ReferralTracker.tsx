"use client";

import { useEffect } from 'react';
import { captureReferral } from '@/lib/referralTracking';

/**
 * Otomatik referral tracking component
 * Layout'a eklendiğinde tüm sayfalarda çalışır
 */
export function ReferralTracker() {
  useEffect(() => {
    // Sayfa yüklendiğinde URL'den partner_id'yi yakala
    captureReferral();
  }, []);

  // Görünmez component
  return null;
}
