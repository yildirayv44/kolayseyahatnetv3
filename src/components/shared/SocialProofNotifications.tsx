"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Users, FileCheck, Calendar } from "lucide-react";

interface Notification {
  id: string;
  type: 'approval' | 'application' | 'appointment' | 'visitor';
  name: string;
  action: string;
  time: string;
  country?: string;
}

interface SocialProofNotificationsProps {
  countryName?: string;
  locale?: 'tr' | 'en';
}

export function SocialProofNotifications({ 
  countryName,
  locale = 'tr' 
}: SocialProofNotificationsProps) {
  const [currentNotification, setCurrentNotification] = useState<Notification | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Generate realistic notifications
    const notifications: Notification[] = [
      {
        id: '1',
        type: 'approval',
        name: locale === 'en' ? 'Ahmet B.' : 'Ahmet B.',
        action: locale === 'en' 
          ? `received ${countryName || 'visa'} approval` 
          : `${countryName || 'vize'} onayı aldı`,
        time: locale === 'en' ? '5 minutes ago' : '5 dakika önce',
        country: countryName,
      },
      {
        id: '2',
        type: 'application',
        name: locale === 'en' ? 'Zeynep K.' : 'Zeynep K.',
        action: locale === 'en' ? 'submitted application' : 'başvuru yaptı',
        time: locale === 'en' ? '12 minutes ago' : '12 dakika önce',
        country: countryName,
      },
      {
        id: '3',
        type: 'appointment',
        name: locale === 'en' ? 'Mehmet Y.' : 'Mehmet Y.',
        action: locale === 'en' ? 'scheduled appointment' : 'randevu aldı',
        time: locale === 'en' ? '23 minutes ago' : '23 dakika önce',
        country: countryName,
      },
      {
        id: '4',
        type: 'visitor',
        name: locale === 'en' ? '8 people' : '8 kişi',
        action: locale === 'en' ? 'are viewing this page' : 'bu sayfayı inceliyor',
        time: locale === 'en' ? 'right now' : 'şu anda',
        country: countryName,
      },
      {
        id: '5',
        type: 'approval',
        name: locale === 'en' ? 'Ayşe T.' : 'Ayşe T.',
        action: locale === 'en' 
          ? `received ${countryName || 'visa'} approval` 
          : `${countryName || 'vize'} onayı aldı`,
        time: locale === 'en' ? '35 minutes ago' : '35 dakika önce',
        country: countryName,
      },
      {
        id: '6',
        type: 'application',
        name: locale === 'en' ? 'Can S.' : 'Can S.',
        action: locale === 'en' ? 'submitted application' : 'başvuru yaptı',
        time: locale === 'en' ? '1 hour ago' : '1 saat önce',
        country: countryName,
      },
    ];

    let currentIndex = 0;
    let timeoutId: ReturnType<typeof setTimeout>;

    const showNextNotification = () => {
      // Hide current
      setIsVisible(false);

      // Wait for fade out, then show next
      setTimeout(() => {
        setCurrentNotification(notifications[currentIndex]);
        setIsVisible(true);
        currentIndex = (currentIndex + 1) % notifications.length;

        // Hide after 5 seconds
        setTimeout(() => {
          setIsVisible(false);
        }, 5000);

        // Show next notification after 15 seconds (10s hidden + 5s shown)
        timeoutId = setTimeout(showNextNotification, 15000);
      }, 500);
    };

    // Start after 10 seconds on page
    const initialTimeout = setTimeout(showNextNotification, 10000);

    return () => {
      clearTimeout(initialTimeout);
      clearTimeout(timeoutId);
    };
  }, [countryName, locale]);

  if (!currentNotification) return null;

  const getIcon = () => {
    switch (currentNotification.type) {
      case 'approval':
        return <CheckCircle2 className="h-5 w-5 text-emerald-500" />;
      case 'application':
        return <FileCheck className="h-5 w-5 text-blue-500" />;
      case 'appointment':
        return <Calendar className="h-5 w-5 text-purple-500" />;
      case 'visitor':
        return <Users className="h-5 w-5 text-orange-500" />;
      default:
        return <CheckCircle2 className="h-5 w-5 text-primary" />;
    }
  };

  return (
    <div
      className={`fixed bottom-20 left-4 z-[60] max-w-sm transition-all duration-500 md:bottom-6 md:left-6 ${
        isVisible
          ? 'translate-x-0 opacity-100'
          : '-translate-x-full opacity-0'
      }`}
    >
      <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-2xl backdrop-blur-sm">
        <div className="flex-shrink-0 rounded-full bg-slate-50 p-2">
          {getIcon()}
        </div>
        
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-slate-900">
            {currentNotification.name}
          </p>
          <p className="text-sm text-slate-600">
            {currentNotification.action}
          </p>
          <p className="mt-1 text-xs text-slate-400">
            {currentNotification.time}
          </p>
        </div>

        <button
          onClick={() => setIsVisible(false)}
          className="flex-shrink-0 text-slate-400 hover:text-slate-600"
          aria-label={locale === 'en' ? 'Close' : 'Kapat'}
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}
