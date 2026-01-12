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

async function getCountryMenus() {
  const { data } = await supabase
    .from("taxonomies")
    .select("slug, updated_at")
    .eq("type", "Country\\CountryController@menuDetail");
  return data || [];
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  console.log('🗺️ Generating sitemap...');
  const startTime = Date.now();
  const baseUrl = "https://www.kolayseyahat.net";
  const locales = ["tr", "en"];

  const [countries, blogs, customPages, countryMenus] = await Promise.all([
    getCountries(), 
    getBlogs(),
    getCustomPages(),
    getCountryMenus()
  ]);

  // Static pages with both TR and EN versions
  const staticPageSlugs = [
    { slug: "", changeFrequency: "daily" as const, priority: 1 },
    { slug: "blog", changeFrequency: "daily" as const, priority: 0.8 },
    { slug: "danismanlar", changeFrequency: "weekly" as const, priority: 0.7 },
    { slug: "vize-basvuru-formu", changeFrequency: "monthly" as const, priority: 0.9 },
    { slug: "hakkimizda", changeFrequency: "monthly" as const, priority: 0.6 },
    { slug: "iletisim", changeFrequency: "monthly" as const, priority: 0.6 },
    { slug: "kurumsal-vize-danismanligi", changeFrequency: "monthly" as const, priority: 0.7 },
    { slug: "ulkeler", changeFrequency: "weekly" as const, priority: 0.8 },
    { slug: "sikca-sorulan-sorular", changeFrequency: "monthly" as const, priority: 0.7 },
    { slug: "duyurular", changeFrequency: "daily" as const, priority: 0.8 },
    { slug: "sikayet-ve-oneri", changeFrequency: "monthly" as const, priority: 0.5 },
    { slug: "affiliate", changeFrequency: "monthly" as const, priority: 0.6 },
  ];

  const staticPages = staticPageSlugs.flatMap((page) => [
    // Turkish version
    {
      url: page.slug ? `${baseUrl}/${page.slug}` : baseUrl,
      lastModified: new Date(),
      changeFrequency: page.changeFrequency,
      priority: page.priority,
    },
    // English version
    {
      url: page.slug ? `${baseUrl}/en/${page.slug}` : `${baseUrl}/en`,
      lastModified: new Date(),
      changeFrequency: page.changeFrequency,
      priority: page.priority,
    },
  ]);

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

  // Blog pages - both TR and EN versions
  const blogPages = blogs
    .filter((blog: any) => {
      if (!blog.taxonomy_slug) {
        console.warn(`Blog ${blog.id} (${blog.title}) has no slug, skipping sitemap`);
        return false;
      }
      return true;
    })
    .flatMap((blog: any) => {
      const lastModified = getValidDate(blog.updated_at || blog.created_at);
      // Strip 'blog/' prefix if present to avoid /blog/blog/ duplication
      const cleanSlug = blog.taxonomy_slug.replace(/^blog\//, '');
      return [
        // Turkish version
        {
          url: `${baseUrl}/blog/${cleanSlug}`,
          lastModified,
          changeFrequency: "monthly" as const,
          priority: 0.6,
        },
        // English version
        {
          url: `${baseUrl}/en/blog/${cleanSlug}`,
          lastModified,
          changeFrequency: "monthly" as const,
          priority: 0.6,
        },
      ];
    });

  // Dynamic custom pages from database - both TR and EN versions
  const dynamicPages = customPages.flatMap((page: any) => {
    const lastModified = getValidDate(page.updated_at);
    const changeFrequency = (page.page_type === "legal" ? "yearly" : "monthly") as "yearly" | "monthly";
    const priority = page.page_type === "legal" ? 0.4 : page.page_type === "corporate" ? 0.6 : 0.5;
    
    return [
      // Turkish version
      {
        url: `${baseUrl}/${page.slug}`,
        lastModified,
        changeFrequency,
        priority,
      },
      // English version
      {
        url: `${baseUrl}/en/${page.slug}`,
        lastModified,
        changeFrequency,
        priority,
      },
    ];
  });

  // Country menu pages (sub-pages like kuveyt-turist-vizesi, belge-tasdik-islemleri)
  const countryMenuPages = countryMenus
    .filter((menu: any) => {
      if (!menu.slug) {
        console.warn(`Country menu has no slug, skipping sitemap`);
        return false;
      }
      return true;
    })
    .flatMap((menu: any) => {
      const lastModified = getValidDate(menu.updated_at);
      return [
        // Turkish version
        {
          url: `${baseUrl}/${menu.slug}`,
          lastModified,
          changeFrequency: "weekly" as const,
          priority: 0.7,
        },
        // English version
        {
          url: `${baseUrl}/en/${menu.slug}`,
          lastModified,
          changeFrequency: "weekly" as const,
          priority: 0.7,
        },
      ];
    });

  const allPages = [...staticPages, ...countryPages, ...countryMenuPages, ...blogPages, ...dynamicPages];
  
  const endTime = Date.now();
  console.log(`✅ Sitemap generated in ${endTime - startTime}ms with ${allPages.length} URLs`);
  
  return allPages;
}
