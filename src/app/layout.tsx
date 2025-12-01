// Root layout - minimal wrapper
// Actual html/body tags are in [locale]/layout.tsx and admin/layout.tsx
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
