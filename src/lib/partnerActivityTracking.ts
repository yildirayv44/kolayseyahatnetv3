/**
 * Partner Activity Tracking System
 * Tracks detailed user activities from partner referral links
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export type ActivityType = 
  | 'page_view'
  | 'country_view'
  | 'package_view'
  | 'form_start'
  | 'form_submit'
  | 'button_click'
  | 'link_click'
  | 'search'
  | 'filter_change';

interface ActivityData {
  partnerId: string;
  activityType: ActivityType;
  pageUrl?: string;
  pageTitle?: string;
  countryId?: number;
  countryName?: string;
  packageId?: number;
  packageName?: string;
  metadata?: Record<string, any>;
}

interface DeviceInfo {
  deviceType: string;
  browser: string;
  os: string;
}

/**
 * Generate a unique session ID
 */
function generateSessionId(): string {
  return `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Generate a unique visitor ID (persists across sessions)
 */
function generateVisitorId(): string {
  return `visitor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Get or create session ID
 */
export function getSessionId(): string {
  if (typeof window === 'undefined') return '';
  
  let sessionId = sessionStorage.getItem('ks_session_id');
  if (!sessionId) {
    sessionId = generateSessionId();
    sessionStorage.setItem('ks_session_id', sessionId);
  }
  return sessionId;
}

/**
 * Get or create visitor ID
 */
export function getVisitorId(): string {
  if (typeof window === 'undefined') return '';
  
  let visitorId = localStorage.getItem('ks_visitor_id');
  if (!visitorId) {
    visitorId = generateVisitorId();
    localStorage.setItem('ks_visitor_id', visitorId);
  }
  return visitorId;
}

/**
 * Parse user agent to get device info
 */
function getDeviceInfo(): DeviceInfo {
  if (typeof window === 'undefined') {
    return { deviceType: 'unknown', browser: 'unknown', os: 'unknown' };
  }

  const ua = navigator.userAgent;
  
  // Device type
  let deviceType = 'desktop';
  if (/mobile/i.test(ua)) deviceType = 'mobile';
  else if (/tablet|ipad/i.test(ua)) deviceType = 'tablet';
  
  // Browser
  let browser = 'unknown';
  if (/chrome/i.test(ua) && !/edg/i.test(ua)) browser = 'Chrome';
  else if (/safari/i.test(ua) && !/chrome/i.test(ua)) browser = 'Safari';
  else if (/firefox/i.test(ua)) browser = 'Firefox';
  else if (/edg/i.test(ua)) browser = 'Edge';
  else if (/opera|opr/i.test(ua)) browser = 'Opera';
  
  // OS
  let os = 'unknown';
  if (/windows/i.test(ua)) os = 'Windows';
  else if (/mac/i.test(ua)) os = 'macOS';
  else if (/linux/i.test(ua)) os = 'Linux';
  else if (/android/i.test(ua)) os = 'Android';
  else if (/ios|iphone|ipad/i.test(ua)) os = 'iOS';
  
  return { deviceType, browser, os };
}

/**
 * Initialize or update partner session
 */
export async function initPartnerSession(partnerId: string): Promise<void> {
  if (typeof window === 'undefined') return;
  
  const sessionId = getSessionId();
  const visitorId = getVisitorId();
  const deviceInfo = getDeviceInfo();
  
  try {
    // Check if session exists
    const { data: existingSession } = await supabase
      .from('partner_sessions')
      .select('id')
      .eq('session_id', sessionId)
      .single();
    
    if (!existingSession) {
      // Create new session
      await supabase.from('partner_sessions').insert({
        partner_id: partnerId,
        session_id: sessionId,
        visitor_id: visitorId,
        referrer_url: document.referrer || null,
        landing_page: window.location.href,
        user_agent: navigator.userAgent,
        device_type: deviceInfo.deviceType,
        browser: deviceInfo.browser,
        os: deviceInfo.os,
      });
    }
  } catch (error) {
    console.error('Error initializing partner session:', error);
  }
}

/**
 * Track partner activity
 */
export async function trackPartnerActivity(data: ActivityData): Promise<void> {
  if (typeof window === 'undefined') return;
  
  const sessionId = getSessionId();
  const visitorId = getVisitorId();
  const deviceInfo = getDeviceInfo();
  
  try {
    await supabase.from('partner_activities').insert({
      partner_id: data.partnerId,
      session_id: sessionId,
      visitor_id: visitorId,
      activity_type: data.activityType,
      page_url: data.pageUrl || window.location.href,
      page_title: data.pageTitle || document.title,
      country_id: data.countryId || null,
      country_name: data.countryName || null,
      package_id: data.packageId || null,
      package_name: data.packageName || null,
      referrer_url: document.referrer || null,
      user_agent: navigator.userAgent,
      device_type: deviceInfo.deviceType,
      browser: deviceInfo.browser,
      os: deviceInfo.os,
      metadata: data.metadata || {},
    });
  } catch (error) {
    console.error('Error tracking partner activity:', error);
  }
}

/**
 * Mark session as converted (form submitted)
 */
export async function markSessionConverted(partnerId: string): Promise<void> {
  if (typeof window === 'undefined') return;
  
  const sessionId = getSessionId();
  
  try {
    await supabase
      .from('partner_sessions')
      .update({
        converted: true,
        conversion_date: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('session_id', sessionId)
      .eq('partner_id', partnerId);
  } catch (error) {
    console.error('Error marking session as converted:', error);
  }
}

/**
 * Track page view
 */
export async function trackPageView(partnerId: string, pageData?: {
  countryId?: number;
  countryName?: string;
  packageId?: number;
  packageName?: string;
}): Promise<void> {
  await trackPartnerActivity({
    partnerId,
    activityType: 'page_view',
    ...pageData,
  });
}

/**
 * Track country view
 */
export async function trackCountryView(
  partnerId: string,
  countryId: number,
  countryName: string
): Promise<void> {
  await trackPartnerActivity({
    partnerId,
    activityType: 'country_view',
    countryId,
    countryName,
  });
}

/**
 * Track package view
 */
export async function trackPackageView(
  partnerId: string,
  packageId: number,
  packageName: string,
  countryName?: string
): Promise<void> {
  await trackPartnerActivity({
    partnerId,
    activityType: 'package_view',
    packageId,
    packageName,
    countryName,
  });
}

/**
 * Track form start
 */
export async function trackFormStart(partnerId: string, formData?: {
  countryId?: number;
  countryName?: string;
  packageId?: number;
  packageName?: string;
}): Promise<void> {
  await trackPartnerActivity({
    partnerId,
    activityType: 'form_start',
    ...formData,
  });
}

/**
 * Track form submission
 */
export async function trackFormSubmit(partnerId: string, formData: {
  countryId?: number;
  countryName?: string;
  packageId?: number;
  packageName?: string;
  customerName?: string;
  customerEmail?: string;
}): Promise<void> {
  await trackPartnerActivity({
    partnerId,
    activityType: 'form_submit',
    countryId: formData.countryId,
    countryName: formData.countryName,
    packageId: formData.packageId,
    packageName: formData.packageName,
    metadata: {
      customer_name: formData.customerName,
      customer_email: formData.customerEmail,
    },
  });
  
  // Mark session as converted
  await markSessionConverted(partnerId);
}

/**
 * Track button click
 */
export async function trackButtonClick(
  partnerId: string,
  buttonName: string,
  metadata?: Record<string, any>
): Promise<void> {
  await trackPartnerActivity({
    partnerId,
    activityType: 'button_click',
    metadata: { button_name: buttonName, ...metadata },
  });
}
