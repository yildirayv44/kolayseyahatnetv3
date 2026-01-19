import { Metadata } from "next";
import { InvitationLetterForm } from "@/components/invitation/InvitationLetterForm";
import { InvitationSEOContent } from "@/components/invitation/InvitationSEOContent";
import { generateSEOMetadata } from "@/components/shared/SEOHead";
import { FileText, Shield, Clock, CheckCircle } from "lucide-react";

export const metadata: Metadata = {
  ...generateSEOMetadata({
    title: "Vize Davet Mektubu Oluşturucu | Ücretsiz Online Araç",
    description: "Vize başvuruları için profesyonel davet mektubu oluşturun. AI destekli, ülkeye özel, anında indirilebilir davet mektubu oluşturma aracı.",
    keywords: [
      "davet mektubu",
      "vize davet mektubu",
      "invitation letter",
      "vize başvurusu davet",
      "konaklama daveti",
      "sponsor letter",
      "vize davet mektubu oluştur",
    ],
    url: "/vize-davet-mektubu-olustur",
  }),
  alternates: {
    canonical: "https://www.kolayseyahat.net/vize-davet-mektubu-olustur",
    languages: {
      "tr": "https://www.kolayseyahat.net/vize-davet-mektubu-olustur",
      "en": "https://www.kolayseyahat.net/en/vize-davet-mektubu-olustur",
    },
  },
};

export default async function InvitationLetterPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  
  const content = {
    tr: {
      title: "Vize Davet Mektubu Oluşturucu",
      subtitle: "Vize başvurunuz için profesyonel davet mektubu oluşturun",
      description: "AI destekli aracımız ile seçtiğiniz ülkeye özel, resmi formatta davet mektubu oluşturabilirsiniz.",
      features: [
        { icon: FileText, title: "Profesyonel Format", desc: "Resmi vize başvurularına uygun format" },
        { icon: Shield, title: "Ülkeye Özel", desc: "Her ülkenin gereksinimlerine göre özelleştirilmiş" },
        { icon: Clock, title: "Anında Oluşturma", desc: "Saniyeler içinde davetiye mektubunuz hazır" },
        { icon: CheckCircle, title: "AI Destekli", desc: "Yapay zeka ile optimize edilmiş içerik" },
      ],
    },
    en: {
      title: "Visa Invitation Letter Generator",
      subtitle: "Create a professional invitation letter for your visa application",
      description: "Generate country-specific, officially formatted invitation letters with our AI-powered tool.",
      features: [
        { icon: FileText, title: "Professional Format", desc: "Suitable for official visa applications" },
        { icon: Shield, title: "Country-Specific", desc: "Customized for each country's requirements" },
        { icon: Clock, title: "Instant Generation", desc: "Your invitation letter ready in seconds" },
        { icon: CheckCircle, title: "AI-Powered", desc: "Content optimized with artificial intelligence" },
      ],
    },
  };

  const t = content[locale as keyof typeof content] || content.tr;

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary via-blue-600 to-indigo-700 py-12 md:py-16">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <div className="relative mx-auto max-w-4xl px-4 text-center">
          <h1 className="text-3xl font-bold text-white md:text-4xl lg:text-5xl">
            {t.title}
          </h1>
          <p className="mt-4 text-lg text-blue-100 md:text-xl">
            {t.subtitle}
          </p>
          <p className="mt-2 text-sm text-blue-200">
            {t.description}
          </p>
        </div>
      </section>

      {/* Features */}
      <section className="border-b border-slate-200 bg-white py-8">
        <div className="mx-auto max-w-6xl px-4">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {t.features.map((feature, idx) => (
              <div key={idx} className="flex flex-col items-center text-center">
                <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-sm font-semibold text-slate-900">{feature.title}</h3>
                <p className="mt-1 text-xs text-slate-600">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Form Section */}
      <section className="py-8 md:py-12">
        <div className="mx-auto max-w-4xl px-4">
          <InvitationLetterForm locale={locale as "tr" | "en"} />
        </div>
      </section>

      {/* SEO Content */}
      <InvitationSEOContent locale={locale as "tr" | "en"} />

      {/* Schema.org Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": locale === "en" ? "Visa Invitation Letter Generator" : "Vize Davet Mektubu Oluşturucu",
            "description": locale === "en" 
              ? "Create professional invitation letters for visa applications"
              : "Vize başvuruları için profesyonel davetiye mektubu oluşturun",
            "url": "https://www.kolayseyahat.net/vize-davet-mektubu-olustur",
            "applicationCategory": "UtilityApplication",
            "operatingSystem": "Web",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "TRY",
            },
            "provider": {
              "@type": "Organization",
              "name": "Kolay Seyahat",
              "url": "https://www.kolayseyahat.net",
            },
          }),
        }}
      />
    </div>
  );
}
