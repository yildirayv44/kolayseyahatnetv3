import type { MetadataRoute } from "next";
import { getCountries, getBlogs } from "@/lib/queries";
import { supabase } from "@/lib/supabase";

// Revalidate sitemap every 24 hours (86400 seconds)
export const revalidate = 86400;

async function getCustomPages() {
  const { data } = await supabase
    .from("custom_pages")
    .select("slug, updated_at, page_type, is_published")
    .eq("is_published", true);
  return data || [];
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  console.log('🗺️ Generating sitemap...');
  const startTime = Date.now();
  const baseUrl = "https://www.kolayseyahat.net";
  const locales = ["tr", "en"];

  const [countries, blogs, customPages] = await Promise.all([
    getCountries(), 
    getBlogs(),
    getCustomPages()
  ]);

  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/en`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/danismanlar`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/vize-basvuru-formu`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/hakkimizda`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    },
    {
      url: `${baseUrl}/iletisim`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    },
    {
      url: `${baseUrl}/kurumsal-vize-danismanligi`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/ulkeler`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/sikca-sorulan-sorular`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/duyurular`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/sikayet-ve-oneri`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.5,
    },
    {
      url: `${baseUrl}/affiliate`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    },
  ];

  // Helper function for valid dates
  const getValidDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return new Date();
    const date = new Date(dateStr);
    // Check if date is valid and not before 2020
    if (isNaN(date.getTime()) || date.getFullYear() < 2020) {
      return new Date();
    }
    return date;
  };

  // Country pages - both TR and EN
  const seenSlugs = new Set<string>();
  const countryPages = countries.flatMap((country: any) => {
    // Use slug from database if available, otherwise skip
    if (!country.slug) {
      console.warn(`Country ${country.id} (${country.name}) has no slug, skipping sitemap`);
      return [];
    }
    
    // Skip duplicate slugs
    if (seenSlugs.has(country.slug)) {
      console.warn(`Duplicate slug detected: ${country.slug} for country ${country.name}, skipping`);
      return [];
    }
    seenSlugs.add(country.slug);
    
    const lastModified = getValidDate(country.updated_at || country.created_at);
    
    return [
      // Turkish version (no prefix)
      {
        url: `${baseUrl}/${country.slug}`,
        lastModified,
        changeFrequency: "weekly" as const,
        priority: 0.8,
      },
      // English version (with /en prefix)
      {
        url: `${baseUrl}/en/${country.slug}`,
        lastModified,
        changeFrequency: "weekly" as const,
        priority: 0.8,
      },
    ];
  });

  const blogPages = blogs
    .filter((blog: any) => {
      if (!blog.taxonomy_slug) {
        console.warn(`Blog ${blog.id} (${blog.title}) has no slug, skipping sitemap`);
        return false;
      }
      return true;
    })
    .map((blog: any) => ({
      url: `${baseUrl}/blog/${blog.taxonomy_slug}`,
      lastModified: getValidDate(blog.updated_at || blog.created_at),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    }));

  // Dynamic custom pages from database
  const dynamicPages = customPages.map((page: any) => ({
    url: `${baseUrl}/${page.slug}`,
    lastModified: getValidDate(page.updated_at),
    changeFrequency: (page.page_type === "legal" ? "yearly" : "monthly") as "yearly" | "monthly",
    priority: page.page_type === "legal" ? 0.4 : page.page_type === "corporate" ? 0.6 : 0.5,
  }));

  const allPages = [...staticPages, ...countryPages, ...blogPages, ...dynamicPages];
  
  const endTime = Date.now();
  console.log(`✅ Sitemap generated in ${endTime - startTime}ms with ${allPages.length} URLs`);
  
  return allPages;
}
