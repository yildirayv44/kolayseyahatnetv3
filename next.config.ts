import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  turbopack: {}, // Silence turbopack warning
  
  // Image optimization
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 365, // 1 year
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.supabase.co",
      },
      {
        protocol: "https",
        hostname: "www.kolayseyahat.tr",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "unsplash.com",
      },
      {
        protocol: "https",
        hostname: "images.pexels.com",
      },
    ],
  },
  
  // Compression
  compress: true,
  
  // Security
  poweredByHeader: false,
  
  // Performance optimizations
  experimental: {
    optimizePackageImports: ['lucide-react', '@supabase/supabase-js'],
    webpackBuildWorker: true,
  },
  
  // Redirects for HTTPS and www enforcement
  async redirects() {
    return [
      // Custom 301 redirects
      {
        source: '/amerika/amerika-vize-yenileme-hizmeti',
        destination: '/amerika-vize-yenileme',
        permanent: true,
      },
      {
        source: '/en/amerika/amerika-vize-yenileme-hizmeti',
        destination: '/en/amerika-vize-yenileme',
        permanent: true,
      },
      {
        source: '/amerika-ds-160-formu-nedir-nasil-doldurulur',
        destination: '/amerika-ds-160-formu-nasil-doldurulur',
        permanent: true,
      },
      {
        source: '/en/amerika-ds-160-formu-nedir-nasil-doldurulur',
        destination: '/en/amerika-ds-160-formu-nasil-doldurulur',
        permanent: true,
      },
      // HTTP to HTTPS redirect
      {
        source: '/:path*',
        has: [
          {
            type: 'header',
            key: 'x-forwarded-proto',
            value: 'http',
          },
        ],
        destination: 'https://www.kolayseyahat.net/:path*',
        permanent: true,
      },
      // Non-www to www redirect
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: 'kolayseyahat.net',
          },
        ],
        destination: 'https://www.kolayseyahat.net/:path*',
        permanent: true,
      },
    ];
  },
  
  // Headers for caching and security
  async headers() {
    return [
      {
        source: '/:all*(svg|jpg|jpeg|png|gif|ico|webp|avif)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
