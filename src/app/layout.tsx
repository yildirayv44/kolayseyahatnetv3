import "./globals.css";

// Root layout - provides HTML shell for root-level pages (e.g. 404)
// Child route groups ([locale], admin, hesabim) override with their own <html>/<body>
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr">
      <body>{children}</body>
    </html>
  );
}
