import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Giriş | Kolay Seyahat",
  description: "Admin panel giriş sayfası",
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
