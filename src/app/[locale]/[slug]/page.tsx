import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
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
import { getBlogSlug, parseH2Headings, getMenuSlug } from "@/lib/helpers";
import { GenericCommentSection } from "@/components/comments/GenericCommentSection";
import { getLocalizedFields } from "@/lib/locale-content";
import { getLocalizedUrl } from "@/lib/locale-link";
import { supabase } from "@/lib/supabase";
import { generateFAQSchema, generateBreadcrumbSchema } from "@/components/shared/SEOHead";
import { fixHtmlImageUrls } from "@/lib/image-helpers";

// Revalidate every 1 hour (3600 seconds)
export const revalidate = 3600;

interface CountryPageParams {
  params: Promise<{ slug: string; locale: string }>;
}

export async function generateMetadata({ params }: CountryPageParams): Promise<Metadata> {
  const { slug, locale } = await params;
  const decodedSlug = decodeURIComponent(slug);

  const supabaseClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Önce custom page olarak kontrol et (en yüksek öncelik)
  const { data: customPageMeta } = await supabaseClient
    .from("custom_pages")
    .select("*")
    .eq("slug", decodedSlug)
    .eq("is_published", true)
    .maybeSingle();

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
        },
      },
    };
  }

  // Custom page değilse, ülke olarak dene
  const [{ data: countryTax }, country] = await Promise.all([
    supabaseClient
      .from("taxonomies")
      .select("title, description")
      .eq("slug", decodedSlug)
      .eq("type", "Country\\CountryController@detail")
      .maybeSingle(),
    getCountryBySlug(decodedSlug),
  ]);

  if (country) {
    const title = country.meta_title || countryTax?.title || country.title || `${country.name} Vizesi - Kolay Seyahat`;
    const description = countryTax?.description || country.description || `${country.name} vizesi için profesyonel danışmanlık. Kolay Seyahat ile başvurunuzu hızlı ve güvenli şekilde tamamlayın.`;
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
    return {
      title: menuTax?.title || menu.name || "Vize Hizmeti - Kolay Seyahat",
      description:
        menuTax?.description ||
        menu.description ||
        "Profesyonel vize danışmanlığı hizmeti. Kolay Seyahat ile başvurunuzu hızlı ve güvenli şekilde tamamlayın.",
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

    return {
      title: `${title} - Kolay Seyahat`,
      description: description || title,
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

  console.log("📄 CountryPage - Decoded slug:", decodedSlug);

  // Özel slug kontrolleri (database'de yanlış kayıtlı olanlar)
  const blogSlugsInCountryTable = [
    'ev-alana-vatandaslik-veren-ulkeler',
    // Buraya diğer yanlış kayıtlı slug'ları ekleyebilirsiniz
  ];
  
  if (blogSlugsInCountryTable.includes(decodedSlug)) {
    console.log("📄 CountryPage - Redirecting to blog:", decodedSlug);
    redirect(`/blog/${decodedSlug}`);
  }

  // Önce custom page olarak dene (en yüksek öncelik)
  const { data: customPageData } = await supabase
    .from("custom_pages")
    .select("*")
    .eq("slug", decodedSlug)
    .eq("is_published", true)
    .maybeSingle();

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

  // Custom page değilse, blog olarak dene (önce blog kontrol et)
  console.log("📄 CountryPage - Trying blog...");
  const blog = await getBlogBySlug(decodedSlug);
  console.log("📄 CountryPage - Blog result:", blog ? blog.title : "Not found");
  
  if (blog) {
    // Blog bulundu - blog detay sayfasına 301 redirect
    redirect(`/blog/${decodedSlug}`);
  }

  // Blog değilse, ülke olarak dene
  let country = await getCountryBySlug(decodedSlug);

  console.log("📄 CountryPage - Country result:", country ? "Found" : "Not found");
  
  // Localize country content
  if (country) {
    country = getLocalizedFields(country, locale as 'tr' | 'en');
  }
  
  // Get comments if country found
  const comments = country ? await getCountryComments(country.id) : [];

  // Blog değilse, duyuru olarak dene
  if (!country) {
    console.log("📄 CountryPage - Trying announcement...");
    const { data: announcementTaxonomy } = await supabase
      .from("taxonomies")
      .select("model_id")
      .eq("slug", `duyuru/${decodedSlug}`)
      .like("type", "%Announcement%")
      .maybeSingle();
    
    if (announcementTaxonomy?.model_id) {
      console.log("📄 CountryPage - Announcement found, redirecting...");
      redirect(`/duyuru/${decodedSlug}`);
    }
  }

  // Duyuru değilse, alt sayfa olarak dene
  if (!country) {
    console.log("📄 CountryPage - Trying menu...");
    const menu = await getCountryMenuBySlug(decodedSlug);
    console.log("📄 CountryPage - Menu result:", menu ? menu.name : "Not found");
    
    if (menu) {
      // Alt sayfa bulundu - menu'nun parent_id'sinden ülkeyi bul
      console.log("📄 CountryPage - Menu parent_id:", menu.parent_id);
      let menuCountry = menu.parent_id ? await supabase
        .from("countries")
        .select("*")
        .eq("id", menu.parent_id)
        .eq("status", 1)
        .maybeSingle()
        .then(({ data }) => data) : null;
      
      console.log("📄 CountryPage - Menu country:", menuCountry ? menuCountry.name : "Not found");
      
      // Fallback: Eğer menuCountry bulunamazsa veya yanlışsa, slug'dan ülkeyi bul
      if (!menuCountry || menuCountry.slug === 'bahreyn') {
        // Slug'dan ülke adını çıkar (örn: "amerika-vize-yenileme" -> "amerika")
        const countrySlugFromMenu = decodedSlug.split('-')[0];
        console.log("📄 CountryPage - Trying to find country by slug:", countrySlugFromMenu);
        
        const fallbackCountry = await supabase
          .from("countries")
          .select("*")
          .eq("slug", countrySlugFromMenu)
          .eq("status", 1)
          .maybeSingle()
          .then(({ data }) => data);
        
        if (fallbackCountry) {
          console.log("📄 CountryPage - Fallback country found:", fallbackCountry.name);
          menuCountry = fallbackCountry;
        }
      }
      
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
    notFound();
  }

  const [menus, products, questions, blogs] = await Promise.all([
    getCountryMenus(country.id),
    getCountryProducts(country.id),
    getCountryQuestions(country.id),
    getCountryBlogs(country.id),
  ]);

  // Currency mapping (hardcoded for performance)
  const currencies = [
    { id: 1, name: "TL", symbol: "₺" },
    { id: 2, name: "USD", symbol: "$" },
    { id: 3, name: "EUR", symbol: "€" },
  ];

  console.log(`📦 ${country.name} (ID: ${country.id}) için ${products.length} adet vize paketi bulundu`);

  // Currency helper
  const getCurrencySymbol = (currencyId: number | null | undefined) => {
    if (!currencyId) return "₺";
    const currency = currencies.find((c) => c.id === currencyId);
    return currency?.symbol || "₺";
  };

  const faqParents = questions.filter((q: any) => q.parent_id === 0);
  const faqChildren = questions.filter((q: any) => q.parent_id > 0);

  const getAnswersForQuestion = (id: number) =>
    faqChildren.filter((q: any) => q.parent_id === id);

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
      const answers = getAnswersForQuestion(q.id);
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
    ...(fixedReqDocument ? [{ id: "gerekli-belgeler", title: t.requiredDocuments }] : []),
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

      {/* BREADCRUMB */}
      <Breadcrumb
        items={[
          { label: "Ülkeler", href: getLocalizedUrl("ulkeler", locale as 'tr' | 'en') },
          { label: country.name },
        ]}
      />

      {/* HERO - New Improved Version */}
      <CountryHero country={country} locale={locale as 'tr' | 'en'} />

      {/* STICKY CTA */}
      <StickyCTA countryName={country.name} />

      {/* TABLE OF CONTENTS */}
      {tocItems.length > 0 && <TableOfContents items={tocItems} locale={locale as 'tr' | 'en'} />}

      {/* İLİŞKİLİ SAYFALAR - Compact Version */}
      {menus.length > 0 && <RelatedPages menus={menus} />}

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
      {fixedReqDocument && (
        <section id="gerekli-belgeler" className="scroll-mt-20 space-y-3">
          <h2 className="text-2xl font-bold text-slate-900">Gerekli Belgeler</h2>
          <ContentWithIds html={fixedReqDocument} />
        </section>
      )}

      {/* SSS - New Improved Version */}
      {faqParents.length > 0 && (
        <div id="sss" className="scroll-mt-20">
          <CountryFAQ
            questions={faqParents.map((q: any) => ({
              ...q,
              answers: getAnswersForQuestion(q.id),
            }))}
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
          <h2 className="text-lg font-semibold text-slate-900">İlgili Blog Yazıları</h2>
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
            {country.title || `${country.name} vizesi`} için hemen başvurun.
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Belgelerinizi birlikte hazırlayalım, randevu ve süreç takibini biz üstlenelim.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <a
            href="tel:02129099971"
            className="inline-flex items-center justify-center rounded-lg border border-primary bg-white px-4 py-2 text-sm font-semibold text-primary shadow-sm hover:bg-slate-50"
          >
            <PhoneCall className="mr-2 h-4 w-4" />
            0212 909 99 71&apos;i Ara
          </a>
          <Link href="/vize-basvuru-formu" className="btn-primary text-xs md:text-sm">
            Online Başvuru Yap
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
        />
      </section>
    </div>
  );
}
