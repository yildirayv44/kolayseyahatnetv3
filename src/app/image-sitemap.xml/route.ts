import { NextResponse } from 'next/server';
import { getCountries, getBlogs } from '@/lib/queries';
import { getCleanImageUrl, getBlogCategoryImage } from '@/lib/image-helpers';

export const revalidate = 86400; // 24 hours

export async function GET() {
  try {
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
            url: escapeXml(country.image_url),
            title: escapeXml(country.name + ' Vizesi'),
            caption: escapeXml(`${country.name} vize başvurusu için gerekli bilgiler ve belgeler`),
          }],
        });
      }
    });

    // Blog images
    blogs.forEach((blog: any) => {
      try {
        if (blog.taxonomy_slug) {
          let imageUrl = blog.image_url;
          
          // Try to get clean image URL, fallback to original
          try {
            imageUrl = getCleanImageUrl(blog.image_url, 'blog') || imageUrl;
          } catch (e) {
            // Use original image_url if cleaning fails
          }
          
          // Try to get category image as fallback
          if (!imageUrl && blog.category) {
            try {
              imageUrl = getBlogCategoryImage(blog.category);
            } catch (e) {
              // Skip if category image fails
            }
          }
          
          if (imageUrl) {
            images.push({
              loc: `${baseUrl}/blog/${blog.taxonomy_slug}`,
              images: [{
                url: escapeXml(imageUrl),
                title: escapeXml(blog.title || 'Blog'),
                caption: escapeXml(blog.description || blog.title || 'Blog yazısı'),
              }],
            });
          }
        }
      } catch (blogError) {
        // Skip this blog if there's an error
        console.error('Error processing blog image:', blogError);
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
      <image:title>${img.title}</image:title>
      ${img.caption ? `<image:caption>${img.caption}</image:caption>` : ''}
    </image:image>`).join('\n')}
  </url>`).join('\n')}
</urlset>`;

    return new NextResponse(xml, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=86400, s-maxage=86400',
      },
    });
  } catch (error) {
    console.error('Error generating image sitemap:', error);
    
    // Return empty sitemap on error
    const emptyXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
</urlset>`;
    
    return new NextResponse(emptyXml, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      },
    });
  }
}

function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
