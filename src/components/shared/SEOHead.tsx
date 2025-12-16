import { Metadata } from "next";

interface SEOHeadProps {
  title: string;
  description: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: "website" | "article";
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
}

export function generateSEOMetadata({
  title,
  description,
  keywords = [],
  image = "/opengraph-image",
  url = "https://www.kolayseyahat.net",
  type = "website",
  publishedTime,
  modifiedTime,
  author = "Kolay Seyahat",
}: SEOHeadProps): Metadata {
  const fullTitle = `${title} | Kolay Seyahat`;
  const fullUrl = url.startsWith("http") ? url : `https://www.kolayseyahat.net${url}`;
  const fullImage = image.startsWith("http") ? image : `https://www.kolayseyahat.net${image}`;

  return {
    title: fullTitle,
    description,
    keywords: keywords.join(", "),
    authors: [{ name: author }],
    creator: author,
    publisher: "Kolay Seyahat",
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    openGraph: {
      type,
      locale: "tr_TR",
      url: fullUrl,
      title: fullTitle,
      description,
      siteName: "Kolay Seyahat",
      images: [
        {
          url: fullImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      ...(publishedTime && { publishedTime }),
      ...(modifiedTime && { modifiedTime }),
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [fullImage],
      creator: "@kolayseyahat",
      site: "@kolayseyahat",
    },
    alternates: {
      canonical: fullUrl,
    },
    verification: {
      google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || "your-google-verification-code",
      yandex: process.env.NEXT_PUBLIC_YANDEX_VERIFICATION || "your-yandex-verification-code",
    },
  };
}

// JSON-LD Structured Data Generator
export function generateOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Kolay Seyahat",
    url: "https://www.kolayseyahat.net",
    logo: "https://www.kolayseyahat.net/logo.png",
    description: "Profesyonel vize danışmanlık hizmeti",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Cami Mh. Niyaz Sk. No 5",
      postalCode: "41200",
      addressLocality: "Kocaeli",
      addressRegion: "Kocaeli",
      addressCountry: "TR",
    },
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+90-212-909-99-71",
      contactType: "customer service",
      availableLanguage: ["Turkish", "English"],
    },
    sameAs: [
      "https://www.facebook.com/kolayseyahat",
      "https://www.instagram.com/kolayseyahat",
      "https://www.twitter.com/kolayseyahat",
    ],
  };
}

export function generateBreadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url.startsWith('http') ? item.url : `https://www.kolayseyahat.net${item.url}`,
    })),
  };
}

export function generateArticleSchema({
  title,
  description,
  image,
  publishedTime,
  modifiedTime,
  author = "Kolay Seyahat",
}: {
  title: string;
  description: string;
  image: string;
  publishedTime: string;
  modifiedTime?: string;
  author?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description,
    image,
    datePublished: publishedTime,
    dateModified: modifiedTime || publishedTime,
    author: {
      "@type": "Organization",
      name: author,
    },
    publisher: {
      "@type": "Organization",
      name: "Kolay Seyahat",
      logo: {
        "@type": "ImageObject",
        url: "https://www.kolayseyahat.net/logo.png",
      },
    },
  };
}

export function generateFAQSchema(faqs: { question: string; answer: string }[]) {
  // Filter out empty questions and answers
  const validFaqs = faqs.filter(faq => faq.question && faq.answer && faq.question.trim() !== '' && faq.answer.trim() !== '');
  
  if (validFaqs.length === 0) {
    return null;
  }

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: validFaqs.map((faq) => ({
      "@type": "Question",
      name: faq.question.trim(),
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer.trim(),
      },
    })),
  };
}

export function generateHowToSchema({
  name,
  description,
  image,
  totalTime,
  estimatedCost,
  steps,
}: {
  name: string;
  description: string;
  image?: string;
  totalTime?: string;
  estimatedCost?: { currency: string; value: string };
  steps: Array<{
    name: string;
    text: string;
    image?: string;
    url?: string;
  }>;
}) {
  if (!steps || steps.length === 0) {
    return null;
  }

  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name,
    description,
    ...(image && { image }),
    ...(totalTime && { totalTime }),
    ...(estimatedCost && {
      estimatedCost: {
        "@type": "MonetaryAmount",
        currency: estimatedCost.currency,
        value: estimatedCost.value,
      },
    }),
    step: steps.map((step, index) => ({
      "@type": "HowToStep",
      position: index + 1,
      name: step.name,
      text: step.text,
      ...(step.image && { image: step.image }),
      ...(step.url && { url: step.url }),
    })),
  };
}

// ItemList Schema for country listings
export function generateItemListSchema(items: Array<{
  name: string;
  url: string;
  image?: string;
  description?: string;
}>) {
  if (!items || items.length === 0) {
    return null;
  }

  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "Country",
        name: item.name,
        url: item.url.startsWith('http') ? item.url : `https://www.kolayseyahat.net${item.url}`,
        ...(item.image && { image: item.image }),
        ...(item.description && { description: item.description }),
      },
    })),
    numberOfItems: items.length,
  };
}
