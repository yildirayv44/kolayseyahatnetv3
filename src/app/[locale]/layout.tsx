import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { MobileNav } from "@/components/layout/MobileNav";
import { WhatsAppButton } from "@/components/shared/WhatsAppButton";
import { WhatsAppWidget } from "@/components/shared/WhatsAppWidget";
import { ExitIntentPopup } from "@/components/shared/ExitIntentPopup";
import { PWAInstallPrompt } from "@/components/shared/PWAInstallPrompt";
import { PushNotificationPrompt } from "@/components/shared/PushNotificationPrompt";
import { PageLoadingBar } from "@/components/shared/PageLoadingBar";
import { generateSEOMetadata, generateOrganizationSchema } from "@/components/shared/SEOHead";
import { locales, type Locale } from "@/i18n/config";
import { WebVitals } from "@/app/web-vitals";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  preload: true,
  fallback: ["system-ui", "arial"],
  adjustFontFallback: true,
  variable: "--font-inter",
});

export const metadata: Metadata = {
  ...generateSEOMetadata({
    title: "Profesyonel Vize Danışmanlığı",
    description:
      "Amerika, İngiltere, Schengen ve daha birçok ülke için profesyonel vize danışmanlık hizmeti. %98 onay oranı ile 10,000+ başarılı başvuru.",
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
  const organizationSchema = generateOrganizationSchema();

  return (
    <html lang={locale}>
      <head>
        {/* DNS Prefetch & Preconnect for faster external resources */}
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        <link rel="dns-prefetch" href="https://analytics.ahrefs.com" />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
        <link rel="preconnect" href="https://www.googletagmanager.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://fonts.googleapis.com" crossOrigin="anonymous" />
        
        {/* Structured Data - Highest Priority */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        
        {/* Google tag (gtag.js) - Deferred for performance */}
        <script
          async
          src="https://www.googletagmanager.com/gtag/js?id=AW-10858300718"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'AW-10858300718', {
                'send_page_view': false
              });
              
              // Send pageview after page is interactive
              if (document.readyState === 'complete') {
                gtag('event', 'page_view');
              } else {
                window.addEventListener('load', function() {
                  gtag('event', 'page_view');
                });
              }
            `,
          }}
        />
        
        {/* Ahrefs Web Analytics - Lowest Priority */}
        <script
          defer
          src="https://analytics.ahrefs.com/analytics.js"
          data-key="Nom01ct23vxfXr8cZgauIg"
        />
        {/* Hreflang Tags - Dynamic tags are added in individual page metadata */}
      </head>
      <body className={`${inter.className} antialiased pb-16 md:pb-0`}>
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
      </body>
    </html>
  );
}
