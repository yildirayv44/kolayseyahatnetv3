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
        {/* Smart App Banner for iOS Safari */}
        <meta name="apple-itunes-app" content="app-id=6756451040, app-argument=https://www.kolayseyahat.net" />
        
        {/* DNS Prefetch & Preconnect for faster external resources */}
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        <link rel="dns-prefetch" href="https://analytics.ahrefs.com" />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
        <link rel="preconnect" href="https://www.googletagmanager.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://fonts.googleapis.com" crossOrigin="anonymous" />
        
        {/* Google Tag Manager - Must be first in head */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-MV883RTB');`,
          }}
        />
        
        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        
        {/* Ahrefs Web Analytics */}
        <script
          defer
          src="https://analytics.ahrefs.com/analytics.js"
          data-key="Nom01ct23vxfXr8cZgauIg"
        />
        {/* Hreflang Tags - Dynamic tags are added in individual page metadata */}
      </head>
      <body className={`${inter.className} antialiased pb-16 md:pb-0`}>
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe 
            src="https://www.googletagmanager.com/ns.html?id=GTM-MV883RTB"
            height="0" 
            width="0" 
            style={{ display: 'none', visibility: 'hidden' }}
          />
        </noscript>
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
