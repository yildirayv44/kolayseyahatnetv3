import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Favorilerim | Kolay Seyahat",
  description: "Favori ülkelerinizi, blog yazılarınızı ve danışmanlarınızı görüntüleyin.",
  robots: {
    index: false,
    follow: false,
  },
  alternates: {
    canonical: 'https://www.kolayseyahat.net/favoriler',
  },
};

export default function FavoritesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
