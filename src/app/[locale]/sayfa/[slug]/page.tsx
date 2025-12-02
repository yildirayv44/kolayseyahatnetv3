import { Metadata } from "next";
import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

type Props = {
  params: { slug: string; locale: string };
};

async function getPage(slug: string) {
  const { data, error } = await supabase
    .from("custom_pages")
    .select("*")
    .eq("slug", slug)
    .eq("is_published", true)
    .single();

  if (error || !data) {
    return null;
  }

  return data;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const page = await getPage(params.slug);

  if (!page) {
    return {
      title: "Sayfa Bulunamadı | Kolay Seyahat",
    };
  }

  const isEnglish = params.locale === "en";
  const title = isEnglish && page.title_en ? page.title_en : page.title;
  const description =
    isEnglish && page.meta_description_en
      ? page.meta_description_en
      : page.meta_description;

  return {
    title: `${title} | Kolay Seyahat`,
    description: description || title,
  };
}

export default async function DynamicPage({ params }: Props) {
  const page = await getPage(params.slug);

  if (!page) {
    notFound();
  }

  const isEnglish = params.locale === "en";
  const title = isEnglish && page.title_en ? page.title_en : page.title;
  const content = isEnglish && page.content_en ? page.content_en : page.content;

  return (
    <div className="container mx-auto max-w-4xl space-y-8 px-4 py-8">
      {/* Back Button */}
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
      >
        <ArrowLeft className="h-4 w-4" />
        {isEnglish ? "Back to Home" : "Ana Sayfaya Dön"}
      </Link>

      {/* Page Content */}
      <article className="card space-y-6">
        <h1 className="text-3xl font-bold text-slate-900 md:text-4xl">{title}</h1>

        <div
          className="prose prose-slate max-w-none prose-headings:text-slate-900 prose-p:text-slate-700 prose-a:text-primary prose-strong:text-slate-900 prose-ul:text-slate-700 prose-ol:text-slate-700"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      </article>

      {/* CTA Section */}
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
