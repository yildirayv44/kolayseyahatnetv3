import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Vize Başvuru Formu | Kolay Seyahat",
  description: "Profesyonel vize danışmanlığı ile başvurunuzu hızlı ve güvenli şekilde tamamlayın. Uzman ekibimiz 1 saat içinde sizinle iletişime geçecek.",
  robots: {
    index: false,
    follow: false,
  },
};

export const viewport = {
  themeColor: "#1E3A8A",
};

export default function StandaloneApplicationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
