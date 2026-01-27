import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Partner Girişi | Kolay Seyahat",
  description: "Kolay Seyahat affiliate partner hesabınıza giriş yapın.",
  robots: {
    index: false,
    follow: false,
  },
  alternates: {
    canonical: 'https://www.kolayseyahat.net/partner-giris',
  },
};

export default function PartnerLoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
