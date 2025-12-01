import type { MetadataRoute } from "next";
import { getCountries, getBlogs } from "@/lib/queries";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://kolayseyahat.net";

  const [countries, blogs] = await Promise.all([getCountries(), getBlogs()]);

  const staticPages = [
    {
      url: baseUrl,
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
      url: `${baseUrl}/danisman`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/basvuru`,
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

  const countryPages = countries.map((country: any) => ({
    url: `${baseUrl}/${countrySlugMap[country.id] || `country-${country.id}`}`,
    lastModified: new Date(country.updated_at || country.created_at),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const blogPages = blogs.map((blog: any) => ({
    url: `${baseUrl}/blog/${blog.type || "genel"}/${blog.id}`,
    lastModified: new Date(blog.updated_at || blog.created_at),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [...staticPages, ...countryPages, ...blogPages];
}
