import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Clock4, Calendar } from "lucide-react";
import { getBlogs } from "@/lib/queries";
import { getBlogSlug } from "@/lib/helpers";
import { getCleanImageUrl, getBlogCategoryImage } from "@/lib/image-helpers";
import { getLocalizedFields } from "@/lib/locale-content";

interface BlogPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: BlogPageProps): Promise<Metadata> {
  const { locale } = await params;
  const isEnglish = locale === 'en';
  
  const title = isEnglish ? "Travel & Visa Blog | Kolay Seyahat" : "Seyahat ve Vize Blogu | Kolay Seyahat";
  const description = isEnglish
    ? "Travel tips, visa application guides, country guides and practical information for travelers. Everything you need to explore the world."
    : "Seyahat ipuçları, vize başvuru süreçleri, ülke rehberleri ve gezginler için pratik bilgiler. Dünya'yı keşfetmek için ihtiyacınız olan her şey.";
  const url = `https://www.kolayseyahat.net${isEnglish ? '/en' : ''}/blog`;
  
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      url,
      siteName: 'Kolay Seyahat',
      locale: isEnglish ? 'en_US' : 'tr_TR',
      images: [{ url: 'https://www.kolayseyahat.net/opengraph-image.png', width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['https://www.kolayseyahat.net/opengraph-image.png'],
    },
    alternates: {
      canonical: url,
      languages: {
        'tr': 'https://www.kolayseyahat.net/blog',
        'en': 'https://www.kolayseyahat.net/en/blog',
        'x-default': 'https://www.kolayseyahat.net/blog',
      },
    },
  };
}

// ⚡ PERFORMANCE: Revalidate every 30 minutes (1800 seconds)
export const revalidate = 1800;

export default async function BlogPage({ params }: BlogPageProps) {
  const { locale } = await params;
  const isEnglish = locale === 'en';
  let blogs = await getBlogs();
  
  // Localize blog content
  blogs = blogs.map((blog: any) => getLocalizedFields(blog, locale as 'tr' | 'en'));

  return (
    <div className="space-y-8">
      <section className="space-y-3 border-b border-slate-200 pb-6">
        <h1 className="text-2xl font-semibold text-slate-900 md:text-3xl">
          {isEnglish ? "Travel & Visa Blog" : "Seyahat ve Vize Blogu"}
        </h1>
        <p className="max-w-2xl text-sm text-slate-600">
          {isEnglish 
            ? "Travel tips, visa application guides, country guides and practical information for travelers. Everything you need to explore the world."
            : "Seyahat ipuçları, vize başvuru süreçleri, ülke rehberleri ve gezginler için pratik bilgiler. Dünya'yı keşfetmek için ihtiyacınız olan her şey burada."}
        </p>
      </section>

      {blogs.length === 0 && (
        <div className="rounded-xl border border-slate-200 bg-slate-50 px-6 py-12 text-center">
          <p className="text-sm text-slate-600">
            {isEnglish 
              ? "No blog posts yet. New content coming soon."
              : "Henüz blog yazısı bulunmuyor. Yakında yeni içeriklerle karşınızda olacağız."}
          </p>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {blogs.map((blog: any) => {
          const imageUrl = getCleanImageUrl(blog.image_url, "blog") || getBlogCategoryImage(blog.category);
          
          return (
            <Link
              key={blog.id}
              href={getBlogSlug(blog)}
              className="card group overflow-hidden p-0"
            >
              {/* Blog Image */}
              <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-100">
                <Image
                  src={imageUrl}
                  alt={`${blog.title} - ${blog.description || 'Seyahat ve vize rehberi'}`}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  priority={false}
                />
              </div>

              {/* Blog Content */}
              <div className="space-y-3 p-4">
                <div className="space-y-2">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-primary">
                    {blog.type || "Genel"}
                  </p>
                  <h2 className="text-base font-semibold text-slate-900 line-clamp-2 group-hover:text-primary">
                    {blog.title}
                  </h2>
                  <p className="text-sm text-slate-600 line-clamp-3">
                    {blog.description}
                  </p>
                </div>

                <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-500">
                  <span className="inline-flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(blog.created_at).toLocaleDateString(isEnglish ? "en-US" : "tr-TR", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Clock4 className="h-3 w-3" />
                    {blog.views || 0} {isEnglish ? "views" : "görüntülenme"}
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
