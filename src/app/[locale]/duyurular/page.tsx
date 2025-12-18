import { Metadata } from "next";
import Link from "next/link";
import { Megaphone, Calendar, ArrowRight, Bell } from "lucide-react";
import { supabase } from "@/lib/supabase";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const isEnglish = locale === 'en';
  
  const title = isEnglish ? "Announcements | Kolay Seyahat" : "Duyurular | Kolay Seyahat";
  const description = isEnglish
    ? "Kolay Seyahat announcements, news and updates. Visa processes, campaigns and important notifications."
    : "Kolay Seyahat duyuruları, haberler ve güncellemeler. Vize süreçleri, kampanyalar ve önemli bildirimler.";
  const url = `https://www.kolayseyahat.net${isEnglish ? '/en' : ''}/duyurular`;
  
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
        'tr': 'https://www.kolayseyahat.net/duyurular',
        'en': 'https://www.kolayseyahat.net/en/duyurular',
        'x-default': 'https://www.kolayseyahat.net/duyurular',
      },
    },
  };
}

interface Announcement {
  id: number;
  title: string;
  slug: string | null;
  contents: string;
  created_at: string;
  views: number;
}

export default async function DuyurularPage() {
  // Database'den duyuruları ve slug'ları birlikte çek
  const { data: dbAnnouncements, error } = await supabase
    .from("announcements")
    .select(`
      id,
      title,
      contents,
      created_at,
      views
    `)
    .eq("status", 1)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Announcements fetch error:", error);
  }

  // Taxonomies'den slug'ları çek
  const { data: taxonomies, error: taxError } = await supabase
    .from("taxonomies")
    .select("model_id, slug")
    .like("type", "%Announcement%");

  if (taxError) {
    console.error("Taxonomies fetch error:", taxError);
  }

  console.log("Taxonomies data:", taxonomies);

  // Slug'ları eşleştir
  const announcements: Announcement[] = (dbAnnouncements || []).map((ann: any) => {
    const taxonomy = taxonomies?.find((t) => t.model_id === ann.id);
    const slug = taxonomy?.slug || null;
    console.log(`Announcement ${ann.id} (${ann.title}): slug=${slug}`);
    return {
      ...ann,
      slug,
    };
  });

  // İlk 2 duyuru featured olsun
  const featuredAnnouncements = announcements.slice(0, 2);
  const regularAnnouncements = announcements.slice(2);

  // Excerpt oluştur (HTML'den text çıkar)
  const getExcerpt = (html: string) => {
    const text = html.replace(/<[^>]*>/g, "");
    return text.length > 150 ? text.substring(0, 150) + "..." : text;
  };

  // Slug oluştur (eğer yoksa)
  const getSlug = (announcement: Announcement) => {
    if (announcement.slug) {
      return announcement.slug.replace("duyuru/", "");
    }
    return `${announcement.id}`;
  };

  return (
    <div className="space-y-12 pb-12">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary to-blue-600 py-12 text-white">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/20">
              <Megaphone className="h-8 w-8" />
            </div>
            <h1 className="mb-4 text-4xl font-bold md:text-5xl">
              Duyurular
            </h1>
            <p className="text-lg text-blue-50">
              Vize süreçleri, kampanyalar ve önemli güncellemeler hakkında haberdar olun
            </p>
          </div>
        </div>
      </section>

      {/* Featured Announcements */}
      {featuredAnnouncements.length > 0 && (
        <section className="container mx-auto px-4">
          <div className="mb-6 flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            <h2 className="text-2xl font-bold text-slate-900">Öne Çıkan Duyurular</h2>
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            {featuredAnnouncements.map((announcement) => (
              <Link
                key={announcement.id}
                href={`/duyuru/${getSlug(announcement)}`}
                className="card group border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-blue-50 transition-all hover:shadow-xl"
              >
                <div className="mb-3 flex items-center justify-between">
                  <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                    Duyuru
                  </span>
                  <div className="flex items-center gap-1 text-sm text-slate-600">
                    <Calendar className="h-4 w-4" />
                    <span>{new Date(announcement.created_at).toLocaleDateString("tr-TR")}</span>
                  </div>
                </div>
                <h3 className="mb-2 text-xl font-bold text-slate-900 group-hover:text-primary">
                  {announcement.title}
                </h3>
                <p className="mb-4 text-slate-700">
                  {getExcerpt(announcement.contents)}
                </p>
                <div className="flex items-center gap-2 font-semibold text-primary">
                  <span>Devamını Oku</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Regular Announcements */}
      <section className="container mx-auto px-4">
        <h2 className="mb-6 text-2xl font-bold text-slate-900">Tüm Duyurular</h2>
        {announcements.length === 0 ? (
          <div className="card text-center py-12">
            <Megaphone className="mx-auto h-12 w-12 text-slate-300 mb-4" />
            <p className="text-slate-600">Henüz duyuru bulunmamaktadır.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {regularAnnouncements.map((announcement) => (
            <Link
              key={announcement.id}
              href={`/duyuru/${getSlug(announcement)}`}
              className="card group flex flex-col gap-4 transition-all hover:shadow-lg sm:flex-row sm:items-center"
            >
              <div className="flex-1">
                <div className="mb-2 flex flex-wrap items-center gap-3">
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                    Duyuru
                  </span>
                  <div className="flex items-center gap-1 text-sm text-slate-600">
                    <Calendar className="h-4 w-4" />
                    <span>{new Date(announcement.created_at).toLocaleDateString("tr-TR")}</span>
                  </div>
                </div>
                <h3 className="mb-2 text-lg font-bold text-slate-900 group-hover:text-primary">
                  {announcement.title}
                </h3>
                <p className="text-sm text-slate-700">
                  {getExcerpt(announcement.contents)}
                </p>
              </div>
              <div className="flex items-center gap-2 font-semibold text-primary sm:flex-col sm:items-end">
                <span className="text-sm">Detaylar</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </div>
            </Link>
          ))}
          </div>
        )}
      </section>

      {/* Newsletter Subscription */}
      <section className="bg-slate-50 py-12">
        <div className="container mx-auto px-4">
          <div className="card mx-auto max-w-2xl border-2 border-primary/20 bg-white text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Bell className="h-6 w-6 text-primary" />
            </div>
            <h2 className="mb-2 text-2xl font-bold text-slate-900">
              Duyurulardan Haberdar Olun
            </h2>
            <p className="mb-6 text-slate-600">
              E-posta adresinizi girerek yeni duyurular ve kampanyalardan haberdar olabilirsiniz
            </p>
            <form className="flex flex-col gap-3 sm:flex-row">
              <input
                type="email"
                placeholder="E-posta adresiniz"
                className="flex-1 rounded-lg border border-slate-200 px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              <button
                type="submit"
                className="rounded-lg bg-primary px-6 py-3 font-semibold text-white transition-all hover:bg-primary/90"
              >
                Abone Ol
              </button>
            </form>
            <p className="mt-3 text-xs text-slate-500">
              Gizliliğinize saygı duyuyoruz. İstediğiniz zaman abonelikten çıkabilirsiniz.
            </p>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="container mx-auto px-4">
        <div className="card bg-slate-50">
          <h2 className="mb-4 text-xl font-bold text-slate-900">Kategoriler</h2>
          <div className="flex flex-wrap gap-3">
            <button className="rounded-lg border-2 border-primary bg-primary px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-primary/90">
              Tümü
            </button>
            <button className="rounded-lg border-2 border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition-all hover:border-primary hover:text-primary">
              Kampanyalar
            </button>
            <button className="rounded-lg border-2 border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition-all hover:border-primary hover:text-primary">
              Güncellemeler
            </button>
            <button className="rounded-lg border-2 border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition-all hover:border-primary hover:text-primary">
              Haberler
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
