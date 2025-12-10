import { NextResponse } from 'next/server';
import { getCountries, getBlogs } from '@/lib/queries';
import { getCleanImageUrl, getBlogCategoryImage } from '@/lib/image-helpers';

export const revalidate = 86400; // 24 hours

export async function GET() {
  const baseUrl = 'https://www.kolayseyahat.net';
  
  const [countries, blogs] = await Promise.all([
    getCountries(),
    getBlogs(),
  ]);

  const images: Array<{
    loc: string;
    images: Array<{
      url: string;
      title: string;
      caption?: string;
    }>;
  }> = [];

  // Country images
  countries.forEach((country: any) => {
    if (country.image_url && country.slug) {
      images.push({
        loc: `${baseUrl}/${country.slug}`,
        images: [{
          url: country.image_url,
          title: `${country.name} Vizesi`,
          caption: `${country.name} vize başvurusu için gerekli bilgiler ve belgeler`,
        }],
      });
    }
  });

  // Blog images
  blogs.forEach((blog: any) => {
    if (blog.taxonomy_slug) {
      const imageUrl = getCleanImageUrl(blog.image_url, 'blog') || getBlogCategoryImage(blog.category);
      if (imageUrl) {
        images.push({
          loc: `${baseUrl}/blog/${blog.taxonomy_slug}`,
          images: [{
            url: imageUrl,
            title: blog.title,
            caption: blog.description || blog.title,
          }],
        });
      }
    }
  });

  // Generate XML
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${images.map(page => `  <url>
    <loc>${page.loc}</loc>
${page.images.map(img => `    <image:image>
      <image:loc>${img.url}</image:loc>
      <image:title>${escapeXml(img.title)}</image:title>
      ${img.caption ? `<image:caption>${escapeXml(img.caption)}</image:caption>` : ''}
    </image:image>`).join('\n')}
  </url>`).join('\n')}
</urlset>`;

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400',
    },
  });
}

function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
