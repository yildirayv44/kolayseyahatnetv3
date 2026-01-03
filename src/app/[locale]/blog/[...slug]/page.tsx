import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Calendar, User, Clock, MessageSquare } from "lucide-react";
import { getBlogBySlug, getBlogComments, getBlogs } from "@/lib/queries";
import { Breadcrumb } from "@/components/shared/Breadcrumb";
import { ContentWithIds } from "@/components/country/ContentWithIds";
import { parseH2Headings } from "@/lib/helpers";
import { GenericCommentSection } from "@/components/comments/GenericCommentSection";
import { getLocalizedFields } from "@/lib/locale-content";
import { getCleanImageUrl, getBlogCategoryImage } from "@/lib/image-helpers";
import { generateArticleSchema } from "@/components/shared/SEOHead";
import { ReadingProgressBar } from "@/components/shared/ReadingProgressBar";
import { ScrollTriggeredCTA } from "@/components/shared/ScrollTriggeredCTA";
import { RelatedContentCarousel } from "@/components/shared/RelatedContentCarousel";
import { SocialProofNotifications } from "@/components/shared/SocialProofNotifications";
import { SlideInVisaWidget } from "@/components/shared/SlideInVisaWidget";
import { getReadingTime } from "@/lib/reading-time";
import { getCountries } from "@/lib/queries";

interface BlogPageProps {
  params: Promise<{ slug: string[]; locale: string }>;
}

// ⚡ PERFORMANCE: Revalidate every 1 hour (3600 seconds)
export const revalidate = 3600;

export async function generateMetadata({ params }: BlogPageProps): Promise<Metadata> {
  const { slug, locale } = await params;
  const fullSlug = `blog/${slug.join("/")}`;

  let blog = await getBlogBySlug(fullSlug);

  if (blog) {
    blog = getLocalizedFields(blog, locale as 'tr' | 'en');
  }

  if (!blog) {
    return {
      title: "Blog Yazısı Bulunamadı - Kolay Seyahat",
      description: "Aradığınız blog yazısı bulunamadı.",
    };
  }

  const title = blog.meta_title || blog.title;
  const description = blog.meta_description || blog.description || blog.title;
  const blogSlug = slug.join("/");
  const blogUrl = `https://www.kolayseyahat.net/${locale === 'en' ? 'en/' : ''}blog/${blogSlug}`;
  
  // Always provide an og:image - use blog image, category image, or default
  const ogImage = getCleanImageUrl(blog.image_url, "blog") || getBlogCategoryImage(blog.category) || 'https://www.kolayseyahat.net/opengraph-image.png';

  return {
    title: `${title} - Kolay Seyahat`,
    description: description,
    openGraph: {
      title: `${title} - Kolay Seyahat`,
      description: description,
      type: "article",
      url: blogUrl,
      locale: locale === 'en' ? 'en_US' : 'tr_TR',
      siteName: 'Kolay Seyahat',
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title,
        }
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} - Kolay Seyahat`,
      description: description,
      images: [ogImage],
    },
    alternates: {
      canonical: blogUrl,
      languages: {
        'tr': `https://www.kolayseyahat.net/blog/${blogSlug}`,
        'en': `https://www.kolayseyahat.net/en/blog/${blogSlug}`,
        'x-default': `https://www.kolayseyahat.net/blog/${blogSlug}`,
      },
    },
  };
}

export default async function BlogPage({ params }: BlogPageProps) {
  const { slug, locale } = await params;
  const fullSlug = `blog/${slug.join("/")}`;

  let blog = await getBlogBySlug(fullSlug);

  if (blog) {
    blog = getLocalizedFields(blog, locale as 'tr' | 'en');
  }

  if (!blog) {
    notFound();
  }

  // Parse H2 headings for TOC
  const headings = blog.contents ? parseH2Headings(blog.contents) : [];
  
  // Get comments
  const comments = await getBlogComments(blog.id);

  // Get countries for widget
  const countries = await getCountries();

  // Calculate reading time
  const readingTime = blog.contents ? getReadingTime(blog.contents, locale as 'tr' | 'en') : { minutes: 5, formatted: '5 dakika okuma' };

  // Get related blogs (same category, exclude current)
  const relatedBlogsData = await getBlogs({ limit: 6 });
  const relatedBlogs = (relatedBlogsData || [])
    .filter((b: any) => b.id !== blog.id && b.category === blog.category)
    .slice(0, 3)
    .map((b: any) => ({
      id: b.id,
      title: b.title,
      description: b.description,
      image_url: getCleanImageUrl(b.image_url, "blog") || getBlogCategoryImage(b.category),
      slug: b.taxonomy_slug || b.slug || `blog/${b.id}`,
      type: 'blog' as const,
      created_at: b.created_at,
    }));

  // Get clean image URL
  const imageUrl = getCleanImageUrl(blog.image_url, "blog") || getBlogCategoryImage(blog.category);

  // Generate Article Schema for SEO
  const articleSchema = generateArticleSchema({
    title: blog.title,
    description: blog.description || blog.title,
    image: imageUrl,
    publishedTime: blog.created_at,
    modifiedTime: blog.updated_at,
  });

  return (
    <>
      {/* Reading Progress Bar */}
      <ReadingProgressBar />

      {/* Social Proof Notifications */}
      <SocialProofNotifications locale={locale as 'tr' | 'en'} />

      {/* Scroll Triggered CTA */}
      <ScrollTriggeredCTA
        title={locale === 'en' ? 'Need Help with Your Visa?' : 'Vize Başvurunuzda Yardım mı Lazım?'}
        description={locale === 'en' ? 'Our expert consultants are ready to help you.' : 'Uzman danışmanlarımız size yardımcı olmak için hazır.'}
        locale={locale as 'tr' | 'en'}
        triggerPercentage={40}
      />

      {/* Slide-in Visa Widget */}
      <SlideInVisaWidget
        countries={countries as any}
        locale={locale as 'tr' | 'en'}
      />

      <div className="space-y-8 md:space-y-10">
      {/* Article Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      {/* BREADCRUMB */}
      <Breadcrumb
        items={[
          { label: "Blog", href: "/blog" },
          { label: blog.title },
        ]}
      />

      {/* BACK BUTTON */}
      <Link
        href="/blog"
        className="inline-flex items-center gap-2 text-sm text-slate-600 transition-colors hover:text-primary"
      >
        <ArrowLeft className="h-4 w-4" />
        Tüm Blog Yazıları
      </Link>

      {/* BLOG HEADER */}
      <article className="space-y-6">
        {/* Featured Image */}
        <div className="relative aspect-[21/9] w-full overflow-hidden rounded-2xl bg-slate-100">
          <Image
            src={imageUrl}
            alt={`${blog.title} - ${blog.description || 'Detaylı rehber ve bilgiler'} | Kolay Seyahat`}
            fill
            className="object-cover"
            priority
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
          />
        </div>

        <header className="space-y-4">
          <h1 className="text-3xl font-bold text-slate-900 md:text-4xl">
            {blog.title}
          </h1>
          
          {blog.description && (
            <p className="text-lg text-slate-600">{blog.description}</p>
          )}

          <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
            {blog.created_at && (
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <time dateTime={blog.created_at}>
                  {new Date(blog.created_at).toLocaleDateString("tr-TR", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    timeZone: "UTC",
                  })}
                </time>
              </div>
            )}
            
            {blog.author && (
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span>{blog.author}</span>
              </div>
            )}
            
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>{readingTime.formatted}</span>
            </div>
          </div>
        </header>

        {/* COMPACT TOC */}
        {headings.length > 0 && (
          <nav className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <h2 className="mb-3 text-sm font-semibold text-slate-900">
              İçindekiler
            </h2>
            <ul className="space-y-2">
              {headings.map((heading, index) => (
                <li key={index}>
                  <a
                    href={`#${heading.id}`}
                    className="text-sm text-slate-600 transition-colors hover:text-primary"
                  >
                    {heading.title}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        )}

        {/* BLOG CONTENT */}
        {blog.contents && (
          <div className="prose prose-slate max-w-none">
            <ContentWithIds html={blog.contents} />
          </div>
        )}

        {/* Related Content Carousel */}
        {relatedBlogs.length > 0 && (
          <RelatedContentCarousel
            items={relatedBlogs}
            locale={locale as 'tr' | 'en'}
          />
        )}


        {/* CTA */}
        <div className="mt-12 rounded-xl border-2 border-primary/20 bg-primary/5 p-6">
          <h2 className="mb-4 text-xl font-bold text-slate-900">
            Vize Başvurunuz İçin Destek Alın
          </h2>
          <div className="flex flex-col gap-3 sm:flex-row">
            <a
              href="tel:02129099971"
              className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-primary bg-white px-8 py-4 text-base font-bold text-primary transition-all hover:bg-primary hover:text-white"
            >
              <span>0212 909 99 71</span>
            </a>
            <Link
              href="/vize-basvuru-formu"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-8 py-4 text-base font-bold text-white shadow-xl transition-all hover:bg-primary/90"
            >
              <span>Hemen Başvur</span>
            </Link>
          </div>
        </div>

        {/* Comments Section */}
        <div className="mt-12 border-t border-slate-200 pt-8">
          <h2 className="mb-6 flex items-center gap-2 text-2xl font-bold text-slate-900">
            <MessageSquare className="h-6 w-6 text-primary" />
            Yorumlar ({comments.length})
          </h2>
          <GenericCommentSection
            initialComments={comments}
            entityId={blog.id}
            entityType="blog"
            showRating={false}
          />
        </div>
      </article>
    </div>
    </>
  );
}
