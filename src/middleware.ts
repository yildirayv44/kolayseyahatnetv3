import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { locales, defaultLocale } from "./i18n/config";
import { createClient } from "@supabase/supabase-js";

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Handle admin routes BEFORE skipping
  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    const authToken = request.cookies.get("sb-auth-token");
    
    if (!authToken) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }

    // Verify admin role from users table
    try {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          auth: {
            persistSession: false,
          },
        }
      );

      const { data: { user }, error } = await supabase.auth.getUser(authToken.value);

      if (error || !user) {
        return NextResponse.redirect(new URL("/admin/login", request.url));
      }

      // Check is_admin from users table
      const { data: userData } = await supabase
        .from("users")
        .select("is_admin")
        .eq("id", user.id)
        .single();
      
      if (!userData || userData.is_admin !== 1) {
        console.warn("Unauthorized admin access attempt:", user.email);
        return NextResponse.redirect(new URL("/", request.url));
      }
    } catch (error) {
      console.error("Middleware auth error:", error);
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
  }

  // Skip middleware for API routes, static files, and special Next.js routes
  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.includes(".")
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
    // Danışman redirects (404 fixes)
    "/danisman/yildiray": "/danismanlar",
    "/danisman/kubra": "/danismanlar",
    "/danisman/buse-calik": "/danismanlar",
    "/danisman/gurhan": "/danismanlar",
    "/danisman/kolay-seyahat": "/danismanlar",
    // Country sub-page redirects (404 fixes)
    "/kuveyt/kuveyt-gezilecek-yerler": "/blog/kuveyt-gezilecek-yerler",
    "/amerika/danismanlik-paketleri": "/amerika",
    "/amerika/tum-sorular": "/amerika",
    "/uganda/uganda-e-vize-basvurusu-kolay-seyahat": "/uganda",
    // Blog redirects (old URLs to new blog URLs)
    "/kuveyt-gezilecek-yerler": "/blog/kuveyt-gezilecek-yerler",
    "/kapida-vize-isteyen-ulkeler": "/blog/kapida-vize-isteyen-ulkeler",
    "/amerika-green-card-basvuru-sartlari-ve-cekilis-rehberi": "/blog/amerika-green-card-basvuru-sartlari-ve-cekilis-rehberi",
    "/amerika-yonetim-sekli-nufusu-ve-en-cok-merak-edilenler": "/blog/amerika-yonetim-sekli-nufusu-ve-en-cok-merak-edilenler",
    "/dubai-marhaba-servisinin-tum-detaylari": "/blog/dubai-marhaba-servisinin-tum-detaylari",
    "/dubai-sik-sorulan-sorular": "/blog/dubai-sik-sorulan-sorular",
    "/kuveytte-colde-safari": "/blog/kuveytte-colde-safari",
    "/yunanistan-adalari-kapi-vizesi-rehberi": "/blog/yunanistan-adalari-kapi-vizesi-rehberi",
  };

  // Check for redirects (works for both with and without locale)
  const pathWithoutLocale = pathname.replace(/^\/(en|tr)/, "");
  if (redirects[pathWithoutLocale]) {
    const url = request.nextUrl.clone();
    const locale = pathname.startsWith("/en") ? "/en" : "";
    url.pathname = `${locale}${redirects[pathWithoutLocale]}`;
    const response = NextResponse.redirect(url, 301); // Permanent redirect for SEO
    // Add headers to prevent crawlers from indexing redirect pages
    response.headers.set('X-Robots-Tag', 'noindex, nofollow');
    return response;
  }

  // Handle old blog category URLs ONLY if they start with /blog/
  // 1. Category pages: /blog/category -> /blog
  // 2. Category posts: /blog/category/slug -> /blog/slug
  // IMPORTANT: Only match URLs that start with /blog/ to avoid catching regular blog posts
  if (pathWithoutLocale.startsWith('/blog/')) {
    const blogCategoryWithSlugPattern = /^\/blog\/[^\/]+\/(.+)$/;
    const blogCategoryOnlyPattern = /^\/blog\/(vize-rehberi|seyahat-ipuclari|ulke-rehberleri)$/;
    
    const blogSlugMatch = pathWithoutLocale.match(blogCategoryWithSlugPattern);
    const blogCategoryMatch = pathWithoutLocale.match(blogCategoryOnlyPattern);
    
    if (blogSlugMatch) {
      // /blog/category/slug -> /blog/slug
      const slug = blogSlugMatch[1];
      const url = request.nextUrl.clone();
      const locale = pathname.startsWith("/en") ? "/en" : "";
      url.pathname = `${locale}/blog/${slug}`;
      const response = NextResponse.redirect(url, 301);
      response.headers.set('X-Robots-Tag', 'noindex, nofollow');
      return response;
    } else if (blogCategoryMatch) {
      // /blog/category -> /blog (only for known categories)
      const url = request.nextUrl.clone();
      const locale = pathname.startsWith("/en") ? "/en" : "";
      url.pathname = `${locale}/blog`;
      const response = NextResponse.redirect(url, 301);
      response.headers.set('X-Robots-Tag', 'noindex, nofollow');
      return response;
    }
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

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|api|favicon.ico).*)"],
};
