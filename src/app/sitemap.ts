import type { MetadataRoute } from "next";
import { getCountries, getBlogs } from "@/lib/queries";
import { supabase } from "@/lib/supabase";

async function getCustomPages() {
  const { data } = await supabase
    .from("custom_pages")
    .select("slug, updated_at, page_type, is_published")
    .eq("is_published", true);
  return data || [];
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
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

  const countrySlugMap: Record<number, string> = {
    4: "amerika",
    6: "ingiltere",
    7: "yunanistan",
    8: "benin",
    10: "bahreyn",
    12: "rusya",
    14: "dubai",
    15: "fransa",
    16: "vietnam",
    17: "kenya",
    18: "uganda",
    19: "zambiya",
    20: "guney-kore",
    21: "bhutan",
    22: "togo",
    23: "umman",
    24: "tanzanya",
    25: "tayland-vizesi",
    26: "kanada-vizesi",
    3: "kuveyt",
  };

  // Country pages - both TR and EN
  const countryPages = countries.flatMap((country: any) => {
    const slug = countrySlugMap[country.id] || `country-${country.id}`;
    return [
      // Turkish version (no prefix)
      {
        url: `${baseUrl}/${slug}`,
        lastModified: new Date(country.updated_at || country.created_at),
        changeFrequency: "weekly" as const,
        priority: 0.8,
      },
      // English version (with /en prefix)
      {
        url: `${baseUrl}/en/${slug}`,
        lastModified: new Date(country.updated_at || country.created_at),
        changeFrequency: "weekly" as const,
        priority: 0.8,
      },
    ];
  });

  const blogPages = blogs.map((blog: any) => ({
    url: blog.slug ? `${baseUrl}/blog/${blog.slug}` : `${baseUrl}/blog/${blog.id}`,
    lastModified: new Date(blog.updated_at || blog.created_at),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  // Dynamic custom pages from database
  const dynamicPages = customPages.map((page: any) => ({
    url: `${baseUrl}/${page.slug}`,
    lastModified: new Date(page.updated_at),
    changeFrequency: (page.page_type === "legal" ? "yearly" : "monthly") as "yearly" | "monthly",
    priority: page.page_type === "legal" ? 0.4 : page.page_type === "corporate" ? 0.6 : 0.5,
  }));

  return [...staticPages, ...countryPages, ...blogPages, ...dynamicPages];
}
