import { Metadata } from "next";
import Link from "next/link";
import { Calendar, ArrowLeft, Share2, Eye } from "lucide-react";
import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Props = {
  params: { slug: string; locale: string };
};

async function getAnnouncement(slug: string) {
  console.log("🔍 getAnnouncement called with slug:", slug);
  
  // Önce slug ile taxonomy'den model_id bul
  const { data: taxonomy, error: taxError } = await supabase
    .from("taxonomies")
    .select("model_id")
    .eq("slug", `duyuru/${slug}`)
    .like("type", "%Announcement%")
    .maybeSingle();

  console.log("📊 Taxonomy result:", taxonomy, "Error:", taxError);

  let announcementId = taxonomy?.model_id;

  // Eğer slug ile bulunamadıysa, direkt ID olarak dene
  if (!announcementId && !isNaN(Number(slug))) {
    announcementId = Number(slug);
  }

  if (!announcementId) {
    return null;
  }

  // Duyuruyu çek
  const { data: announcement } = await supabase
    .from("announcements")
    .select("*")
    .eq("id", announcementId)
    .eq("status", 1)
    .maybeSingle();

  if (announcement) {
    // Görüntülenme sayısını artır
    await supabase
      .from("announcements")
      .update({ views: (announcement.views || 0) + 1 })
      .eq("id", announcementId);
  }

  return announcement;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const announcement = await getAnnouncement(params.slug);
  
  if (!announcement) {
    return {
      title: "Duyuru Bulunamadı | Kolay Seyahat"
    };
  }

  // HTML'den text çıkar
  const description = announcement.contents.replace(/<[^>]*>/g, "").substring(0, 160);

  return {
    title: `${announcement.title} | Kolay Seyahat`,
    description,
  };
}

export default async function DuyuruDetayPage({ params }: Props) {
  const announcement = await getAnnouncement(params.slug);

  if (!announcement) {
    notFound();
  }

  // Diğer duyuruları çek
  const { data: relatedAnnouncements } = await supabase
    .from("announcements")
    .select("id, title, contents, created_at")
    .eq("status", 1)
    .neq("id", announcement.id)
    .order("created_at", { ascending: false })
    .limit(2);

  const getExcerpt = (html: string) => {
    const text = html.replace(/<[^>]*>/g, "");
    return text.length > 100 ? text.substring(0, 100) + "..." : text;
  };

  return (
    <div className="container mx-auto max-w-4xl space-y-8 px-4 py-8">
      {/* Back Button */}
      <Link
        href="/duyurular"
        className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
      >
        <ArrowLeft className="h-4 w-4" />
        Tüm Duyurulara Dön
      </Link>

      {/* Article Header */}
      <article className="card space-y-6">
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              Duyuru
            </span>
            <div className="flex items-center gap-1 text-sm text-slate-600">
              <Calendar className="h-4 w-4" />
              <span>{new Date(announcement.created_at).toLocaleDateString("tr-TR", { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}</span>
            </div>
            <div className="flex items-center gap-1 text-sm text-slate-600">
              <Eye className="h-4 w-4" />
              <span>{announcement.views || 0} görüntülenme</span>
            </div>
          </div>

          <h1 className="text-3xl font-bold text-slate-900 md:text-4xl">
            {announcement.title}
          </h1>

          <div className="flex items-center gap-4 border-t border-slate-200 pt-4">
            <button className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700 hover:text-primary">
              <Share2 className="h-4 w-4" />
              Paylaş
            </button>
          </div>
        </div>

        {/* Content */}
        <div 
          className="prose prose-slate max-w-none prose-headings:text-slate-900 prose-p:text-slate-700 prose-a:text-primary prose-strong:text-slate-900"
          dangerouslySetInnerHTML={{ __html: announcement.contents }}
        />
      </article>

      {/* CTA Section */}
      <div className="card border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-blue-50 text-center">
        <h2 className="mb-2 text-2xl font-bold text-slate-900">
          Hemen Başvurunuzu Yapın
        </h2>
        <p className="mb-6 text-slate-600">
          Uzman danışmanlarımız size yardımcı olmak için hazır
        </p>
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/vize-basvuru-formu"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-8 py-3 font-semibold text-white shadow-lg transition-all hover:bg-primary/90"
          >
            Online Başvuru Yap
          </Link>
          <a
            href="tel:02129099971"
            className="inline-flex items-center justify-center gap-2 rounded-lg border-2 border-primary bg-white px-8 py-3 font-semibold text-primary transition-all hover:bg-primary hover:text-white"
          >
            0212 909 99 71
          </a>
        </div>
      </div>

      {/* Related Announcements */}
      {relatedAnnouncements && relatedAnnouncements.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-slate-900">Diğer Duyurular</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {relatedAnnouncements.map((related: any) => (
              <Link 
                key={related.id}
                href={`/duyuru/${related.id}`} 
                className="card group transition-all hover:shadow-lg"
              >
                <span className="mb-2 inline-block rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                  Duyuru
                </span>
                <h3 className="font-semibold text-slate-900 group-hover:text-primary">
                  {related.title}
                </h3>
                <p className="mt-2 text-sm text-slate-600">
                  {getExcerpt(related.contents)}
                </p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
