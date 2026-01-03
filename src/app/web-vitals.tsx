'use client';

import { useReportWebVitals } from 'next/web-vitals';

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}

export function WebVitals() {
  useReportWebVitals((metric) => {
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Web Vital:', metric);
    }

    // Send to Google Analytics
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', metric.name, {
        value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
        event_category: 'Web Vitals',
        event_label: metric.id,
        non_interaction: true,
      });
    }

    // Send to our backend for storage and analysis (production only)
    if (process.env.NODE_ENV === 'production') {
      // Use sendBeacon for better reliability (doesn't block page unload)
      const data = JSON.stringify({
        name: metric.name,
        value: metric.value,
        id: metric.id,
        rating: metric.rating,
        navigationType: metric.navigationType,
      });

      // Try sendBeacon first (more reliable for page unload events)
      if (navigator.sendBeacon) {
        const blob = new Blob([data], { type: 'application/json' });
        navigator.sendBeacon('/api/web-vitals', blob);
      } else {
        // Fallback to fetch
        fetch('/api/web-vitals', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: data,
          keepalive: true, // Keep request alive even if page is unloading
        }).catch((error) => {
          // Silently fail - don't block user experience
          if (process.env.NODE_ENV === 'development') {
            console.error('Failed to send web vital:', error);
          }
        });
      }
    }
  });

  return null;
}
