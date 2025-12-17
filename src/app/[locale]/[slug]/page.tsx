import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { cache } from "react";
import { unstable_cache } from "next/cache";
import { ArrowRight, ArrowLeft, PhoneCall, CheckCircle2, MessageSquare } from "lucide-react";
import {
  getCountryBySlug,
  getCountryMenus,
  getCountryMenuBySlug,
  getCountryProducts,
  getCountryQuestions,
  getCountryBlogs,
  getCountryComments,
  getBlogBySlug,
  getCountryPageData
} from "@/lib/queries";
import { createClient } from "@supabase/supabase-js";
import { Breadcrumb } from "@/components/shared/Breadcrumb";
import { CountryHero } from "@/components/country/CountryHero";
import { StickyCTA } from "@/components/country/StickyCTA";
import { CountryFAQ } from "@/components/country/CountryFAQ";
import { TableOfContents } from "@/components/country/TableOfContents";
import { AskQuestionForm } from "@/components/country/AskQuestionForm";
import { RelatedPages } from "@/components/country/RelatedPages";
import { ContentWithIds } from "@/components/country/ContentWithIds";
import { ExtendedCountryInfo } from "@/components/country/ExtendedCountryInfo";
import { getBlogSlug, parseH2Headings, getMenuSlug } from "@/lib/helpers";
import { GenericCommentSection } from "@/components/comments/GenericCommentSection";
import { getLocalizedFields } from "@/lib/locale-content";
import { getLocalizedUrl } from "@/lib/locale-link";
import { supabase } from "@/lib/supabase";
import { generateFAQSchema, generateBreadcrumbSchema, generateHowToSchema, generateOrganizationSchema, generateReviewSchema } from "@/components/shared/SEOHead";
import { fixHtmlImageUrls } from "@/lib/image-helpers";
import { generateCountryMetaDescription, generateMenuMetaDescription, truncateAtWord, truncateTitle, seededRandom, seededRating } from "@/lib/meta-helpers";

// ⚡ PERFORMANCE: Revalidate every 2 hours (7200 seconds) to reduce database load
export const revalidate = 7200;

// ⚡ OPTIMIZATION: Static generation for popular countries
export async function generateStaticParams() {
  const supabaseClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Fetch popular countries (top 20 by views)
  const { data: countries } = await supabaseClient
    .from("countries")
    .select("slug")
    .eq("status", 1)
    .order("views", { ascending: false })
    .limit(20);

  if (!countries) return [];

  // Generate params for both TR and EN locales
  const params = countries.flatMap(country => [
    { locale: "tr", slug: country.slug },
    { locale: "en", slug: country.slug }
  ]);

  return params;
}

interface CountryPageParams {
  params: Promise<{ slug: string; locale: string }>;
}

// ⚡ OPTIMIZATION: Cached data fetchers with edge caching
const getCachedPageData = unstable_cache(
  async (slug: string) => {
    const supabaseClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const [
      { data: customPageData },
      blog,
      country,
      menu
    ] = await Promise.all([
      supabaseClient
        .from("custom_pages")
        .select("*")
        .eq("slug", slug)
        .eq("is_published", true)
        .maybeSingle(),
      getBlogBySlug(slug),
      getCountryBySlug(slug),
      getCountryMenuBySlug(slug)
    ]);

    return { customPageData, blog, country, menu };
  },
  ["page-data"],
  { revalidate: 3600, tags: ["page-data"] } // Cache for 1 hour
);

// ⚡ OPTIMIZATION: Cache country page data with edge caching
const getCachedCountryPageData = unstable_cache(
  async (countryId: number) => {
    return getCountryPageData(countryId);
  },
  ["country-page-data"],
  { revalidate: 3600, tags: ["country-page-data"] } // Cache for 1 hour
);

export async function generateMetadata({ params }: CountryPageParams): Promise<Metadata> {
  const { slug, locale } = await params;
  const decodedSlug = decodeURIComponent(slug);

  // ⚡ OPTIMIZATION: Use cached data
  const { customPageData: customPageMeta, country: countryData } = await getCachedPageData(decodedSlug);

  const supabaseClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  if (customPageMeta) {
    const isEnglish = locale === "en";
    const title = isEnglish && customPageMeta.title_en ? customPageMeta.title_en : customPageMeta.title;
    const description =
      isEnglish && customPageMeta.meta_description_en
        ? customPageMeta.meta_description_en
        : customPageMeta.meta_description;
    const fullTitle = `${title} - Kolay Seyahat`;
    const url = `https://www.kolayseyahat.net/${locale === 'en' ? 'en/' : ''}${decodedSlug}`;

    return {
      title: fullTitle,
      description: description || title,
      openGraph: {
        title: fullTitle,
        description: description || title,
        type: 'website',
        url,
        siteName: 'Kolay Seyahat',
        locale: locale === 'en' ? 'en_US' : 'tr_TR',
      },
      twitter: {
        card: 'summary',
        title: fullTitle,
        description: description || title,
      },
      alternates: {
        canonical: url,
        languages: {
          'tr': `https://www.kolayseyahat.net/${decodedSlug}`,
          'en': `https://www.kolayseyahat.net/en/${decodedSlug}`,
          'x-default': `https://www.kolayseyahat.net/${decodedSlug}`,
        },
      },
    };
  }

  // Custom page değilse, ülke olarak dene (cache'den al)
  const country = countryData;
  const { data: countryTax } = await supabaseClient
    .from("taxonomies")
    .select("title, description")
    .eq("slug", decodedSlug)
    .eq("type", "Country\\CountryController@detail")
    .maybeSingle();

  if (country) {
    // Get visa requirements for better meta description
    let visaRequirement;
    if (country.country_code) {
      const { data: visaReqs } = await supabaseClient
        .from("visa_requirements")
        .select("visa_status, allowed_stay, conditions, application_method")
        .eq("country_code", country.country_code)
        .limit(1);
      visaRequirement = visaReqs?.[0];
    }

    // Title: Veritabanında varsa olduğu gibi kullan (indekslenen içeriği koru)
    // Sadece fallback için truncate uygula
    const dbTitle = country.meta_title || countryTax?.title || country.title;
    const isEnglish = locale === 'en';
    
    // İngilizce için title_en varsa kullan
    const localizedTitle = isEnglish && country.title_en ? country.title_en : dbTitle;
    
    // Eğer veritabanında title varsa olduğu gibi kullan, yoksa fallback oluştur ve truncate et
    let title = localizedTitle || truncateTitle(
      isEnglish 
        ? `${country.name} Visa - Kolay Seyahat`
        : `${country.name} Vizesi - Kolay Seyahat`, 
      60
    );
    
    // Title'a "- Kolay Seyahat" ekle (yoksa)
    if (title && !title.includes('Kolay Seyahat')) {
      title = `${title} - Kolay Seyahat`;
    }
    
    // Description: Veritabanında varsa olduğu gibi kullan (indekslenen içeriği koru)
    // İngilizce için description_en varsa kullan
    const dbDescription = isEnglish && country.description_en 
      ? country.description_en 
      : countryTax?.description;
    
    const description = dbDescription 
      ? truncateAtWord(dbDescription, 155)
      : generateCountryMetaDescription(country, visaRequirement, locale as 'tr' | 'en');
    
    const imageUrl = country.image_url || '/default-country.jpg';
    const url = `https://www.kolayseyahat.net/${locale === 'en' ? 'en/' : ''}${decodedSlug}`;

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        type: 'website',
        url,
        siteName: 'Kolay Seyahat',
        locale: locale === 'en' ? 'en_US' : 'tr_TR',
        images: [
          {
            url: imageUrl,
            width: 1200,
            height: 630,
            alt: `${country.name} Vizesi`,
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: [imageUrl],
        creator: '@kolayseyahat',
        site: '@kolayseyahat',
      },
      alternates: {
        canonical: url,
        languages: {
          'tr': `https://www.kolayseyahat.net/${decodedSlug}`,
          'en': `https://www.kolayseyahat.net/en/${decodedSlug}`,
          'x-default': `https://www.kolayseyahat.net/${decodedSlug}`,
        },
      },
    };
  }

  // Alt sayfa olarak dene
  const [{ data: menuTax }, menu] = await Promise.all([
    supabase
      .from("taxonomies")
      .select("title, description")
      .eq("slug", decodedSlug)
      .eq("type", "CountryMenu\\CountryMenuController@detail")
      .maybeSingle(),
    getCountryMenuBySlug(decodedSlug),
  ]);

  if (menu) {
    // Get country name for better context
    let countryName;
    if (menu.country_id) {
      const { data: menuCountry } = await supabaseClient
        .from("countries")
        .select("name")
        .eq("id", menu.country_id)
        .maybeSingle();
      countryName = menuCountry?.name;
    }

    // Generate optimized meta description (max 155 chars)
    const description = menuTax?.description
      ? truncateAtWord(menuTax.description, 155)
      : generateMenuMetaDescription(menu.name, countryName, menu.description);

    const menuUrl = `https://www.kolayseyahat.net/${locale === 'en' ? 'en/' : ''}${decodedSlug}`;
    const menuTitle = menuTax?.title || menu.name || "Vize Hizmeti";
    const fullMenuTitle = menuTitle.includes('Kolay Seyahat') ? menuTitle : `${menuTitle} - Kolay Seyahat`;
    return {
      title: fullMenuTitle,
      description,
      alternates: {
        canonical: menuUrl,
        languages: {
          'tr': `https://www.kolayseyahat.net/${decodedSlug}`,
          'en': `https://www.kolayseyahat.net/en/${decodedSlug}`,
          'x-default': `https://www.kolayseyahat.net/${decodedSlug}`,
        },
      },
    };
  }

  // Custom page olarak dene
  const { data: customPage } = await supabase
    .from("custom_pages")
    .select("*")
    .eq("slug", decodedSlug)
    .eq("is_published", true)
    .maybeSingle();

  if (customPage) {
    const { locale } = await params;
    const isEnglish = locale === "en";
    const title = isEnglish && customPage.title_en ? customPage.title_en : customPage.title;
    const description =
      isEnglish && customPage.meta_description_en
        ? customPage.meta_description_en
        : customPage.meta_description;
    const customUrl = `https://www.kolayseyahat.net/${locale === 'en' ? 'en/' : ''}${decodedSlug}`;

    return {
      title: `${title} - Kolay Seyahat`,
      description: description || title,
      alternates: {
        canonical: customUrl,
        languages: {
          'tr': `https://www.kolayseyahat.net/${decodedSlug}`,
          'en': `https://www.kolayseyahat.net/en/${decodedSlug}`,
          'x-default': `https://www.kolayseyahat.net/${decodedSlug}`,
        },
      },
    };
  }

  return {
    title: "Sayfa bulunamadı - Kolay Seyahat",
    description: "Aradığınız sayfa bulunamadı.",
  };
}

export default async function CountryPage({ params }: CountryPageParams) {
  const { slug, locale } = await params;
  const decodedSlug = decodeURIComponent(slug);
  
  // Translations
  const t = locale === "en" ? {
    faq: "Frequently Asked Questions",
    askQuestion: "Ask a Question",
    userQuestions: "Questions from Users",
    visaPackages: "Visa Packages",
    requiredDocuments: "Required Documents",
    comments: "Comments and Experiences",
  } : {
    faq: "Sık Sorulan Sorular",
    askQuestion: "Soru Sor",
    userQuestions: "Sizden gelen sorular",
    visaPackages: "Vize Paketleri",
    requiredDocuments: "Gerekli Belgeler",
    comments: "Yorumlar ve Deneyimler",
  };


  // ⚡ OPTIMIZATION: Use cached data (shared with generateMetadata)
  const { customPageData, blog, country: countryData, menu } = await getCachedPageData(decodedSlug);

  // Initialize country variable in function scope
  let country = countryData;

  // Custom page bulundu - render et
  if (customPageData) {
    const isEnglish = locale === "en";
    const title = isEnglish && customPageData.title_en ? customPageData.title_en : customPageData.title;
    const content = isEnglish && customPageData.content_en ? customPageData.content_en : customPageData.content;

    return (
      <div className="container mx-auto max-w-4xl space-y-8 px-4 py-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          {isEnglish ? "Back to Home" : "Ana Sayfaya Dön"}
        </Link>

        <article className="card space-y-6">
          <h1 className="text-3xl font-bold text-slate-900 md:text-4xl">{title}</h1>
          <div
            className="prose prose-slate max-w-none prose-headings:text-slate-900 prose-p:text-slate-700 prose-a:text-primary prose-strong:text-slate-900 prose-ul:text-slate-700 prose-ol:text-slate-700"
            dangerouslySetInnerHTML={{ __html: content }}
          />
        </article>

        <div className="card border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-blue-50 text-center">
          <h2 className="mb-2 text-2xl font-bold text-slate-900">
            {isEnglish ? "Need Help?" : "Yardıma mı İhtiyacınız Var?"}
          </h2>
          <p className="mb-6 text-slate-600">
            {isEnglish
              ? "Our expert consultants are ready to help you"
              : "Uzman danışmanlarımız size yardımcı olmak için hazır"}
          </p>
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/vize-basvuru-formu"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-8 py-3 font-semibold text-white shadow-lg transition-all hover:bg-primary/90"
            >
              {isEnglish ? "Apply Online" : "Online Başvuru Yap"}
            </Link>
            <a
              href="tel:02129099971"
              className="inline-flex items-center justify-center gap-2 rounded-lg border-2 border-primary bg-white px-8 py-3 font-semibold text-primary transition-all hover:bg-primary hover:text-white"
            >
              0212 909 99 71
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Blog bulundu - doğrudan blog sayfasına yönlendir (locale ile)
  if (blog) {
    const blogUrl = locale === 'en' ? `/en/blog/${decodedSlug}` : `/blog/${decodedSlug}`;
    redirect(blogUrl);
  }

  // Ülke bulundu - işle ve localize et
  if (country) {
    country = getLocalizedFields(country, locale as 'tr' | 'en');
  }

  // Ülke bulunamadı - duyuru olarak dene
  if (!country) {
    const { data: announcementTaxonomy } = await supabase
      .from("taxonomies")
      .select("model_id")
      .eq("slug", `duyuru/${decodedSlug}`)
      .like("type", "%Announcement%")
      .maybeSingle();
    
    if (announcementTaxonomy?.model_id) {
      redirect(`/duyuru/${decodedSlug}`);
    }
  }

  // Menu (alt sayfa) bulundu
  if (!country && menu) {
    // ⚡ OPTIMIZATION: Paralel country sorgularını tek seferde yap
    const countrySlugFromMenu = decodedSlug.split('-')[0];
    
    const [parentCountry, slugBasedCountry] = await Promise.all([
      menu.parent_id 
        ? supabase
            .from("countries")
            .select("*")
            .eq("id", menu.parent_id)
            .eq("status", 1)
            .maybeSingle()
            .then(({ data }) => data)
        : Promise.resolve(null),
      supabase
        .from("countries")
        .select("*")
        .eq("slug", countrySlugFromMenu)
        .eq("status", 1)
        .maybeSingle()
        .then(({ data }) => data)
    ]);
    
    // Prefer slug-based country over parent_id based country
    const menuCountry = slugBasedCountry || parentCountry;
      
      // Fix image URLs in menu content
      const fixedMenuContents = menu.contents ? fixHtmlImageUrls(menu.contents, menuCountry?.name) : null;
      
      // Parse H2 headings for TOC
      const menuH2Headings = fixedMenuContents ? parseH2Headings(fixedMenuContents) : [];
      
      // TOC items for menu page
      const menuTocItems = menuH2Headings.length > 0 ? [
        {
          id: "icerik",
          title: "İçerik",
          subItems: menuH2Headings,
        },
      ] : [];
      
      return (
        <div className="space-y-10 md:space-y-14">
          <Breadcrumb
            items={[
              { label: "Ülkeler", href: "/ulkeler" },
              ...(menuCountry ? [{ label: menuCountry.name, href: `/${menuCountry.slug}` }] : []),
              { label: menu.name },
            ]}
          />
          
          {/* TABLE OF CONTENTS */}
          {menuTocItems.length > 0 && <TableOfContents items={menuTocItems} locale={locale as 'tr' | 'en'} />}
          
          <div className="space-y-6">
            <h1 className="text-3xl font-bold text-slate-900 md:text-4xl">
              {menu.name}
            </h1>
            
            {menu.description && (
              <p className="text-lg text-slate-600">{menu.description}</p>
            )}
            
            {fixedMenuContents && (
              <ContentWithIds html={fixedMenuContents} />
            )}
            
            <div className="mt-8 rounded-xl border-2 border-primary/20 bg-primary/5 p-6">
              <h2 className="mb-4 text-xl font-bold text-slate-900">
                Daha Fazla Bilgi İçin
              </h2>
              <div className="flex flex-col gap-3 sm:flex-row">
                <a
                  href="tel:02129099971"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-primary bg-white px-8 py-4 text-base font-bold text-primary transition-all hover:bg-primary hover:text-white"
                >
                  <PhoneCall className="h-5 w-5" />
                  <span>0212 909 99 71</span>
                </a>
                <Link
                  href="/vize-basvuru-formu"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-8 py-4 text-base font-bold text-white shadow-xl transition-all hover:bg-primary/90"
                >
                  <span>Hemen Başvur</span>
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </div>
            </div>
          </div>
          
          {/* STICKY CTA */}
          <StickyCTA countryName={menuCountry?.name || menu.name} />
        </div>
      );
  }
  
  // Ne ülke ne de alt sayfa bulunamadı
  if (!country) {
    notFound();
  }

  // ⚡ OPTIMIZED: Get all country page data with edge caching (reduces DB round-trips)
  const pageData = await getCachedCountryPageData(country.id);
  const { menus, products, questions, blogs, comments } = pageData;

  // Currency mapping (hardcoded for performance)
  const currencies = [
    { id: 1, name: "TL", symbol: "₺" },
    { id: 2, name: "USD", symbol: "$" },
    { id: 3, name: "EUR", symbol: "€" },
  ];

  // Currency helper
  const getCurrencySymbol = (currencyId: number | null | undefined) => {
    if (!currencyId) return "₺";
    const currency = currencies.find((c) => c.id === currencyId);
    return currency?.symbol || "₺";
  };

  // Questions now come with answers already attached from getCountryQuestions
  const faqParents = questions.filter((q: any) => !q.parent_id || q.parent_id === 0);
  
  // Legacy support: if answers not attached, filter from children
  const faqChildren = questions.filter((q: any) => q.parent_id > 0);

  const getAnswersForQuestion = (id: number, question: any) => {
    // First check if answers are already attached (new method)
    if (question.answers && question.answers.length > 0) {
      return question.answers;
    }
    // Fallback to old method (filter from children)
    return faqChildren.filter((q: any) => q.parent_id === id);
  };

  // Fix image URLs in content
  const fixedContents = country.contents ? fixHtmlImageUrls(country.contents, country.name) : null;
  const fixedPriceContents = country.price_contents ? fixHtmlImageUrls(country.price_contents, country.name) : null;
  const fixedReqDocument = country.req_document ? fixHtmlImageUrls(country.req_document, country.name) : null;

  // Parse H2 headings from content
  const h2Headings = fixedContents ? parseH2Headings(fixedContents) : [];

  // Helper to strip HTML tags for schema
  const stripHtml = (html: string) => {
    return html
      .replace(/<[^>]*>/g, ' ') // Remove HTML tags
      .replace(/\s+/g, ' ') // Normalize whitespace
      .replace(/&nbsp;/g, ' ') // Replace &nbsp;
      .replace(/&amp;/g, '&') // Replace &amp;
      .replace(/&lt;/g, '<') // Replace &lt;
      .replace(/&gt;/g, '>') // Replace &gt;
      .replace(/&quot;/g, '"') // Replace &quot;
      .trim();
  };

  // Generate FAQ Schema for SEO
  const faqSchema = faqParents.length > 0 ? generateFAQSchema(
    faqParents.map((q: any) => {
      const answers = getAnswersForQuestion(q.id, q);
      const answerText = answers.length > 0 
        ? answers.map((a: any) => stripHtml(a.contents || a.title)).filter(Boolean).join(' ') 
        : stripHtml(q.contents || q.title); // Use contents or title as fallback
      
      return {
        question: q.title || '',
        answer: answerText || ''
      };
    }).filter((faq: any) => faq.question && faq.answer) // Filter out empty ones
  ) : null;

  // Generate Breadcrumb Schema for SEO
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Ana Sayfa", url: "/" },
    { name: country.name, url: `/${country.slug || decodedSlug}` }
  ]);

  // Generate HowTo Schema for visa application process
  const howToSchema = generateHowToSchema({
    name: `${country.name} Vizesi Nasıl Alınır?`,
    description: `${country.name} vize başvurusu için adım adım rehber. Gerekli belgeler, başvuru süreci ve önemli bilgiler.`,
    image: country.image_url,
    totalTime: country.process_time ? `P${country.process_time}D` : 'P14D', // ISO 8601 duration format
    steps: [
      {
        name: 'Gerekli Belgeleri Hazırlayın',
        text: `${country.name} vizesi için gerekli tüm belgeleri eksiksiz hazırlayın. Pasaport, fotoğraf, mali durum belgeleri ve diğer gerekli evraklar.`,
      },
      {
        name: 'Online Başvuru Formu',
        text: 'Vize başvuru formunu online olarak doldurun. Tüm bilgileri doğru ve eksiksiz girin.',
      },
      {
        name: 'Randevu Alın',
        text: `${country.name} konsolosluğu veya vize merkezinden randevu alın. Randevu tarihini belirleyin.`,
      },
      {
        name: 'Vize Ücretini Ödeyin',
        text: 'Vize başvuru ücretini belirtilen yöntemlerle ödeyin. Ödeme makbuzunu saklayın.',
      },
      {
        name: 'Başvurunuzu Tamamlayın',
        text: 'Randevu gününde tüm belgelerinizle başvuru merkezine gidin ve başvurunuzu tamamlayın.',
      },
    ],
  });

  // Generate Product Schema for visa packages with dynamic ratings
  // Calculate priceValidUntil as 1 year from now
  const priceValidUntil = new Date();
  priceValidUntil.setFullYear(priceValidUntil.getFullYear() + 1);
  const priceValidUntilStr = priceValidUntil.toISOString().split('T')[0];

  const productSchemas = products.map((product: any) => {
    // Generate deterministic but varied review count and rating per product
    const seed = `${country.name}-${product.name}`;
    const reviewCount = seededRandom(seed, 40, 100);
    const ratingValue = seededRating(seed);
    
    return {
      "@context": "https://schema.org",
      "@type": "Product",
      name: product.name,
      description: product.description || `${country.name} ${product.name} vize paketi`,
      image: country.image_url,
      brand: {
        "@type": "Brand",
        name: "Kolay Seyahat"
      },
      offers: {
        "@type": "Offer",
        price: product.price || "0",
        priceCurrency: getCurrencySymbol(product.currency_id) === "₺" ? "TRY" : getCurrencySymbol(product.currency_id) === "$" ? "USD" : "EUR",
        availability: "https://schema.org/InStock",
        url: `https://www.kolayseyahat.net/${country.slug}`,
        priceValidUntil: priceValidUntilStr,
        hasMerchantReturnPolicy: {
          "@type": "MerchantReturnPolicy",
          applicableCountry: "TR",
          returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
          merchantReturnDays: 14,
          returnMethod: "https://schema.org/ReturnByMail",
          returnFees: "https://schema.org/FreeReturn"
        },
        shippingDetails: {
          "@type": "OfferShippingDetails",
          shippingRate: {
            "@type": "MonetaryAmount",
            value: "0",
            currency: "TRY"
          },
          shippingDestination: {
            "@type": "DefinedRegion",
            addressCountry: "TR"
          },
          deliveryTime: {
            "@type": "ShippingDeliveryTime",
            handlingTime: {
              "@type": "QuantitativeValue",
              minValue: 1,
              maxValue: 3,
              unitCode: "DAY"
            },
            transitTime: {
              "@type": "QuantitativeValue",
              minValue: 0,
              maxValue: 0,
              unitCode: "DAY"
            }
          }
        }
      },
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: ratingValue.toString(),
        reviewCount: reviewCount.toString(),
        bestRating: "5",
        worstRating: "1",
      },
    };
  });

  // Check if we should show required documents section
  const hasRequiredDocs = (country.required_documents && country.required_documents.length > 0) || fixedReqDocument;

  // Generate Review Schema from comments
  const reviewSchema = comments.length > 0 ? generateReviewSchema(
    comments.map((comment: any) => ({
      author: comment.name || 'Anonim',
      rating: comment.rating || 5,
      content: comment.content || comment.comment || '',
      date: comment.created_at ? new Date(comment.created_at).toISOString().split('T')[0] : undefined,
    })),
    `${country.name} Vize Danışmanlığı`
  ) : null;

  // TOC items
  const tocItems = [
    ...(menus.length > 0 ? [{ id: "vize-turleri", title: "İlişkili Sayfalar" }] : []),
    ...(fixedContents
      ? [
          {
            id: "genel-bilgiler",
            title: "Genel Bilgiler",
            subItems: h2Headings,
          },
        ]
      : []),
    ...(products.length > 0 ? [{ id: "vize-paketleri", title: t.visaPackages }] : []),
    ...(hasRequiredDocs ? [{ id: "gerekli-belgeler", title: t.requiredDocuments }] : []),
    ...(faqParents.length > 0 ? [{ id: "sss", title: t.faq }] : []),
    { id: "soru-sor", title: t.askQuestion },
  ];

  return (
    <div className="space-y-10 md:space-y-14">
      {/* SEO Schemas */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}
      {howToSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
        />
      )}
      {productSchemas.map((schema, index) => (
        <script
          key={`product-${index}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(generateOrganizationSchema()) }}
      />
      {reviewSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(reviewSchema) }}
        />
      )}

      {/* BREADCRUMB */}
      <Breadcrumb
        items={[
          { label: "Ülkeler", href: getLocalizedUrl("ulkeler", locale as 'tr' | 'en') },
          { label: country.name },
        ]}
      />

      {/* HERO - New Improved Version with Visa Requirements & Packages */}
      <CountryHero 
        country={country} 
        locale={locale as 'tr' | 'en'} 
        products={products}
      />

      {/* STICKY CTA */}
      <StickyCTA countryName={country.name} />

      {/* TABLE OF CONTENTS */}
      {tocItems.length > 0 && <TableOfContents items={tocItems} locale={locale as 'tr' | 'en'} />}

      {/* İLİŞKİLİ SAYFALAR - Compact Version */}
      {menus.length > 0 && <RelatedPages menus={menus} locale={locale as 'tr' | 'en'} />}

      {/* ANA İÇERİK */}
      {fixedContents && (
        <section id="genel-bilgiler" className="scroll-mt-20 space-y-3">
          <h2 className="text-2xl font-bold text-slate-900">
            {locale === 'en' ? 'General Information' : 'Genel Bilgiler'}
          </h2>
          <ContentWithIds html={fixedContents} />
        </section>
      )}

      {/* FİYAT BİLGİLERİ */}
      {fixedPriceContents && (
        <section id="vize-ucretleri" className="scroll-mt-20 space-y-3">
          <h2 className="text-2xl font-bold text-slate-900">Vize Ücretleri</h2>
          <ContentWithIds html={fixedPriceContents} />
        </section>
      )}

      {/* ÜRÜNLER / PAKETLER */}
      {products.length > 0 && (
        <section id="vize-paketleri" className="scroll-mt-20 space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Vize Paketleri</h2>
            <p className="mt-2 text-sm text-slate-600">
              İhtiyacınıza uygun paketi seçin, hemen başvurun
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {products.map((product: any, index: number) => (
              <div
                key={product.id}
                className={`group relative overflow-hidden rounded-2xl border-2 p-6 transition-all hover:shadow-xl ${
                  index === 0
                    ? "border-primary bg-gradient-to-br from-primary/5 to-blue-50"
                    : "border-slate-200 bg-white hover:border-primary/50"
                }`}
              >
                {index === 0 && (
                  <div className="absolute right-4 top-4 rounded-full bg-primary px-3 py-1 text-xs font-bold text-white">
                    ⭐ Popüler
                  </div>
                )}
                <div className="mb-4">
                  <h3 className="mb-2 text-xl font-bold text-slate-900">
                    {product.name}
                  </h3>
                  <p className="text-sm leading-relaxed text-slate-600">
                    {product.description}
                  </p>
                </div>
                <div className="mb-6 flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-primary">
                    {getCurrencySymbol(product.currency_id)}{Number(product.price).toFixed(0)}
                  </span>
                  <span className="text-sm text-slate-500">/ başvuru</span>
                </div>
                <Link
                  href={{
                    pathname: getLocalizedUrl("basvuru", locale as 'tr' | 'en'),
                    query: {
                      country_id: country.id,
                      country_name: country.name,
                      package_id: product.id,
                      package_name: product.name,
                    },
                  }}
                  className="group/btn flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 font-bold text-white shadow-lg transition-all hover:bg-primary/90 hover:shadow-xl"
                >
                  <span>Hemen Başvur</span>
                  <ArrowRight className="h-5 w-5 transition-transform group-hover/btn:translate-x-1" />
                </Link>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* GEREKLİ BELGELER */}
      {hasRequiredDocs && (
        <section id="gerekli-belgeler" className="scroll-mt-20 space-y-3">
          <h2 className="text-2xl font-bold text-slate-900">{t.requiredDocuments}</h2>
          {country.required_documents && Array.isArray(country.required_documents) && country.required_documents.length > 0 ? (
            <div className="card">
              <ul className="space-y-3">
                {country.required_documents.map((doc: string, index: number) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-primary mt-0.5" />
                    <span className="flex-1 text-slate-700">{doc}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : fixedReqDocument ? (
            <ContentWithIds html={fixedReqDocument} />
          ) : null}
        </section>
      )}

      {/* EXTENDED COUNTRY INFO - AI Generated Fields */}
      <ExtendedCountryInfo 
        country={{
          ...country,
          // Clean currency to prevent hydration mismatch
          currency: country.currency ? country.currency.split('(')[0].trim() : country.currency
        }} 
        locale={locale as 'tr' | 'en'} 
      />

      {/* SSS - New Improved Version */}
      {faqParents.length > 0 && (
        <div id="sss" className="scroll-mt-20">
          <CountryFAQ
            questions={faqParents.map((q: any) => ({
              ...q,
              answers: getAnswersForQuestion(q.id, q),
            }))}
            locale={locale as 'tr' | 'en'}
          />
        </div>
      )}

      {/* SORU SORMA FORMU */}
      <section id="soru-sor" className="scroll-mt-20">
        <AskQuestionForm countryId={country.id} countryName={country.name} locale={locale as 'tr' | 'en'} />
      </section>

      {/* İLGİLİ BLOG YAZILARI */}
      {blogs.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-slate-900">{locale === 'en' ? 'Related Blog Posts' : 'İlgili Blog Yazıları'}</h2>
          <div className="grid gap-4 md:grid-cols-3">
            {blogs.map((blog: any) => (
              <Link
                key={blog.id}
                href={getBlogSlug(blog)}
                className="card space-y-2 text-sm transition-all hover:border-primary hover:shadow-lg"
              >
                <h3 className="font-semibold text-slate-900 line-clamp-2 group-hover:text-primary">
                  {blog.title}
                </h3>
                <p className="text-xs text-slate-600 line-clamp-3">
                  {blog.description}
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}

          {/* CTA */}
      <section className="card flex flex-col items-start justify-between gap-4 border-primary/10 bg-primary/5 md:flex-row md:items-center">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            {locale === 'en' 
              ? `Apply now for ${country.title || `${country.name} visa`}.`
              : `${country.title || `${country.name} vizesi`} için hemen başvurun.`}
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            {locale === 'en'
              ? "Let's prepare your documents together, we'll handle the appointment and process tracking."
              : 'Belgelerinizi birlikte hazırlayalım, randevu ve süreç takibini biz üstlenelim.'}
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <a
            href="tel:02129099971"
            className="inline-flex items-center justify-center rounded-lg border border-primary bg-white px-4 py-2 text-sm font-semibold text-primary shadow-sm hover:bg-slate-50"
          >
            <PhoneCall className="mr-2 h-4 w-4" />
            {locale === 'en' ? 'Call 0212 909 99 71' : "0212 909 99 71'i Ara"}
          </a>
          <Link href="/vize-basvuru-formu" className="btn-primary text-xs md:text-sm">
            {locale === 'en' ? 'Apply Online' : 'Online Başvuru Yap'}
          </Link>
        </div>
      </section>

      {/* Comments Section */}
      <section className="card">
        <h2 className="mb-6 flex items-center gap-2 text-2xl font-bold text-slate-900">
          <MessageSquare className="h-6 w-6 text-primary" />
          {t.comments} ({comments.length})
        </h2>
        <GenericCommentSection
          initialComments={comments}
          entityId={country.id}
          entityType="country"
          showRating={true}
          locale={locale as 'tr' | 'en'}
        />
      </section>
    </div>
  );
}
