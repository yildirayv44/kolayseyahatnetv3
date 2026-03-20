import type { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { MobileNav } from "@/components/layout/MobileNav";
import { WhatsAppWidget } from "@/components/shared/WhatsAppWidget";
import { ExitIntentPopup } from "@/components/shared/ExitIntentPopup";
import { PWAInstallPrompt } from "@/components/shared/PWAInstallPrompt";
import { PushNotificationPrompt } from "@/components/shared/PushNotificationPrompt";
import { PageLoadingBar } from "@/components/shared/PageLoadingBar";
import { generateSEOMetadata } from "@/components/shared/SEOHead";
import { locales, type Locale } from "@/i18n/config";
import { WebVitals } from "@/app/web-vitals";
import { ReferralTracker } from "@/components/ReferralTracker";
import { PageViewTracker } from "@/components/PageViewTracker";

export const metadata: Metadata = {
  ...generateSEOMetadata({
    title: "Profesyonel Vize Danışmanlığı",
    description:
      "Amerika, İngiltere, Schengen ve daha birçok ülke için profesyonel vize danışmanlık hizmeti. %98 müşteri memnuniyeti ile 10,000+ başarılı başvuru.",
    keywords: [
      "vize danışmanlığı",
      "amerika vizesi",
      "schengen vizesi",
      "ingiltere vizesi",
      "vize başvurusu",
      "vize randevusu",
      "kolay seyahat",
    ],
    url: "/",
  }),
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "KolaySeyahat",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export const viewport = {
  themeColor: "#2563eb",
};

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params as { locale: Locale };

  return (
    <>
      <ReferralTracker />
      <PageViewTracker />
      <WebVitals />
      <PageLoadingBar />
      <Header />
      <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
      <Footer locale={locale as 'tr' | 'en'} />
      <MobileNav />
      <WhatsAppWidget />
      <ExitIntentPopup />
      <PWAInstallPrompt />
      <PushNotificationPrompt />
    </>
  );
}
