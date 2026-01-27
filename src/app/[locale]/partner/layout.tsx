import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Partner Dashboard | Kolay Seyahat",
  description: "Kolay Seyahat affiliate partner dashboard - referanslarınızı ve kazançlarınızı takip edin.",
  robots: {
    index: false,
    follow: false,
  },
  alternates: {
    canonical: 'https://www.kolayseyahat.net/partner',
  },
};

export default function PartnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
