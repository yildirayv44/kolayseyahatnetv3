import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { MobileNav } from "@/components/layout/MobileNav";
import { WhatsAppButton } from "@/components/shared/WhatsAppButton";
import { WhatsAppWidget } from "@/components/shared/WhatsAppWidget";
import { PWAInstallPrompt } from "@/components/shared/PWAInstallPrompt";
import { PushNotificationPrompt } from "@/components/shared/PushNotificationPrompt";
import { generateSEOMetadata, generateOrganizationSchema } from "@/components/shared/SEOHead";
import { locales, type Locale } from "@/i18n/config";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
      </head>
      <body className={`${inter.className} antialiased pb-16 md:pb-0`}>
        <Header />
        <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
        <Footer />
        <MobileNav />
        <WhatsAppWidget />
        <PWAInstallPrompt />
        <PushNotificationPrompt />
      </body>
    </html>
  );
}
