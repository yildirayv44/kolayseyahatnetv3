import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { locales, defaultLocale } from "./i18n/config";

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Skip middleware for API routes, static files, admin, and special Next.js routes
  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.includes(".") ||
    pathname.startsWith("/admin")
  ) {
    return NextResponse.next();
  }

  // Check if the pathname starts with a locale
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  // URL redirects for SEO consistency
  const redirects: Record<string, string> = {
    "/danisman": "/danismanlar",
    "/basvuru": "/vize-basvuru-formu",
  };

  // Check for redirects (works for both with and without locale)
  const pathWithoutLocale = pathname.replace(/^\/(en|tr)/, "");
  if (redirects[pathWithoutLocale]) {
    const url = request.nextUrl.clone();
    const locale = pathname.startsWith("/en") ? "/en" : "";
    url.pathname = `${locale}${redirects[pathWithoutLocale]}`;
    return NextResponse.redirect(url, 301); // Permanent redirect for SEO
  }

  // If pathname has /tr/ prefix, redirect to remove it (tr is default)
  if (pathname.startsWith("/tr/") || pathname === "/tr") {
    const url = request.nextUrl.clone();
    url.pathname = pathname.replace(/^\/tr/, "") || "/";
    return NextResponse.redirect(url, 301); // Permanent redirect for SEO
  }

  // If no locale in pathname, it's Turkish (default)
  // Rewrite to /tr internally but keep URL clean
  if (!pathnameHasLocale) {
    const url = request.nextUrl.clone();
    url.pathname = `/tr${pathname}`;
    return NextResponse.rewrite(url);
  }

  // Check if accessing admin routes
  if (pathname.startsWith("/admin")) {
    const cookies = request.cookies;
    const authToken = cookies.get("sb-auth-token");
    
    if (!authToken) {
      const redirectUrl = new URL("/giris", request.url);
      redirectUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(redirectUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|api|favicon.ico).*)"],
};
