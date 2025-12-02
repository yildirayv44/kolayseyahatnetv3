import { Metadata } from "next";
import Link from "next/link";
import { Megaphone, Calendar, ArrowRight, Bell } from "lucide-react";

export const metadata: Metadata = {
  title: "Duyurular | Kolay Seyahat",
  description: "Kolay Seyahat duyuruları, haberler ve güncellemeler. Vize süreçleri, kampanyalar ve önemli bildirimler.",
};

export default function DuyurularPage() {
  // Bu veriler normalde veritabanından gelecek
  const announcements = [
    {
      id: 1,
      title: "Yeni Kolay Seyahat Üyelerine Özel İndirim",
      slug: "yeni-kolay-seyahat-uyelerine-ozel-indirim",
      excerpt: "Yeni üyelerimize özel %20 indirim fırsatı! Vize başvurularınızda geçerli bu kampanyadan yararlanın.",
      date: "2024-05-04",
      category: "Kampanya",
      featured: true
    },
    {
      id: 2,
      title: "Schengen Vizesi Başvuru Süreci Güncellendi",
      slug: "schengen-vizesi-basvuru-sureci-guncellendi",
      excerpt: "Schengen ülkeleri için vize başvuru prosedürlerinde önemli değişiklikler yapıldı. Detaylar için duyurumuzu okuyun.",
      date: "2024-04-15",
      category: "Güncelleme",
      featured: false
    },
    {
      id: 3,
      title: "Amerika Vize Randevu Süreleri Kısaldı",
      slug: "amerika-vize-randevu-sureleri-kisaldi",
      excerpt: "Amerika Büyükelçiliği vize randevu bekleme sürelerini kısalttı. Artık daha hızlı randevu alabilirsiniz.",
      date: "2024-03-28",
      category: "Haber",
      featured: false
    },
    {
      id: 4,
      title: "Yaz Dönemi Özel Kampanyası Başladı",
      slug: "yaz-donemi-ozel-kampanyasi-basladi",
      excerpt: "Yaz tatili için vize başvurusu yapacaklara özel indirimli fiyatlar. Kampanya 30 Haziran'a kadar geçerli.",
      date: "2024-05-20",
      category: "Kampanya",
      featured: true
    },
    {
      id: 5,
      title: "İngiltere Vizesi İçin Yeni Belgeler Gerekiyor",
      slug: "ingiltere-vizesi-icin-yeni-belgeler-gerekiyor",
      excerpt: "İngiltere konsolosluğu vize başvuruları için ek belge talep etmeye başladı. Hangi belgeler gerekli?",
      date: "2024-04-02",
      category: "Güncelleme",
      featured: false
    }
  ];

  const featuredAnnouncements = announcements.filter(a => a.featured);
  const regularAnnouncements = announcements.filter(a => !a.featured);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Kampanya":
        return "bg-green-100 text-green-700";
      case "Güncelleme":
        return "bg-blue-100 text-blue-700";
      case "Haber":
        return "bg-amber-100 text-amber-700";
      default:
        return "bg-slate-100 text-slate-700";
    }
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
                href={`/duyuru/${announcement.slug}`}
                className="card group border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-blue-50 transition-all hover:shadow-xl"
              >
                <div className="mb-3 flex items-center justify-between">
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${getCategoryColor(announcement.category)}`}>
                    {announcement.category}
                  </span>
                  <div className="flex items-center gap-1 text-sm text-slate-600">
                    <Calendar className="h-4 w-4" />
                    <span>{new Date(announcement.date).toLocaleDateString("tr-TR")}</span>
                  </div>
                </div>
                <h3 className="mb-2 text-xl font-bold text-slate-900 group-hover:text-primary">
                  {announcement.title}
                </h3>
                <p className="mb-4 text-slate-700">
                  {announcement.excerpt}
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
        <div className="space-y-4">
          {regularAnnouncements.map((announcement) => (
            <Link
              key={announcement.id}
              href={`/duyuru/${announcement.slug}`}
              className="card group flex flex-col gap-4 transition-all hover:shadow-lg sm:flex-row sm:items-center"
            >
              <div className="flex-1">
                <div className="mb-2 flex flex-wrap items-center gap-3">
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${getCategoryColor(announcement.category)}`}>
                    {announcement.category}
                  </span>
                  <div className="flex items-center gap-1 text-sm text-slate-600">
                    <Calendar className="h-4 w-4" />
                    <span>{new Date(announcement.date).toLocaleDateString("tr-TR")}</span>
                  </div>
                </div>
                <h3 className="mb-2 text-lg font-bold text-slate-900 group-hover:text-primary">
                  {announcement.title}
                </h3>
                <p className="text-sm text-slate-700">
                  {announcement.excerpt}
                </p>
              </div>
              <div className="flex items-center gap-2 font-semibold text-primary sm:flex-col sm:items-end">
                <span className="text-sm">Detaylar</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </div>
            </Link>
          ))}
        </div>
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
