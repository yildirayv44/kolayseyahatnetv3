import { Metadata } from "next";
import Link from "next/link";
import { Calendar, ArrowLeft, Share2 } from "lucide-react";
import { notFound } from "next/navigation";

type Props = {
  params: { slug: string; locale: string };
};

// Bu normalde veritabanından gelecek
const announcements: Record<string, any> = {
  "yeni-kolay-seyahat-uyelerine-ozel-indirim": {
    title: "Yeni Kolay Seyahat Üyelerine Özel İndirim",
    date: "2024-05-04",
    category: "Kampanya",
    content: `
      <p>Sevgili müşterilerimiz,</p>
      
      <p>Kolay Seyahat ailesine yeni katılan üyelerimize özel harika bir kampanya başlattık! İlk vize başvurunuzda <strong>%20 indirim</strong> fırsatından yararlanabilirsiniz.</p>
      
      <h2>Kampanya Detayları</h2>
      <ul>
        <li>Kampanya süresi: 1 Mayıs - 31 Mayıs 2024</li>
        <li>Tüm vize türleri için geçerlidir</li>
        <li>İlk başvurunuzda otomatik olarak uygulanır</li>
        <li>Diğer kampanyalarla birleştirilemez</li>
      </ul>
      
      <h2>Nasıl Yararlanabilirsiniz?</h2>
      <ol>
        <li>Web sitemizden üye olun</li>
        <li>Vize başvuru formunu doldurun</li>
        <li>İndirim otomatik olarak uygulanacaktır</li>
      </ol>
      
      <p>Bu fırsatı kaçırmayın! Profesyonel danışmanlık hizmetimizle vize sürecinizi kolaylaştırın ve %20 tasarruf edin.</p>
      
      <p>Sorularınız için bizimle iletişime geçebilirsiniz: <strong>0212 909 99 71</strong></p>
    `
  }
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const announcement = announcements[params.slug];
  
  if (!announcement) {
    return {
      title: "Duyuru Bulunamadı | Kolay Seyahat"
    };
  }

  return {
    title: `${announcement.title} | Kolay Seyahat`,
    description: announcement.title,
  };
}

export default function DuyuruDetayPage({ params }: Props) {
  const announcement = announcements[params.slug];

  if (!announcement) {
    notFound();
  }

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
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${getCategoryColor(announcement.category)}`}>
              {announcement.category}
            </span>
            <div className="flex items-center gap-1 text-sm text-slate-600">
              <Calendar className="h-4 w-4" />
              <span>{new Date(announcement.date).toLocaleDateString("tr-TR", { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}</span>
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
          className="prose prose-slate max-w-none"
          dangerouslySetInnerHTML={{ __html: announcement.content }}
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
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-slate-900">Diğer Duyurular</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Link href="/duyurular" className="card group transition-all hover:shadow-lg">
            <span className="mb-2 inline-block rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
              Güncelleme
            </span>
            <h3 className="font-semibold text-slate-900 group-hover:text-primary">
              Schengen Vizesi Başvuru Süreci Güncellendi
            </h3>
            <p className="mt-2 text-sm text-slate-600">
              Schengen ülkeleri için vize başvuru prosedürlerinde önemli değişiklikler...
            </p>
          </Link>
          <Link href="/duyurular" className="card group transition-all hover:shadow-lg">
            <span className="mb-2 inline-block rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
              Haber
            </span>
            <h3 className="font-semibold text-slate-900 group-hover:text-primary">
              Amerika Vize Randevu Süreleri Kısaldı
            </h3>
            <p className="mt-2 text-sm text-slate-600">
              Amerika Büyükelçiliği vize randevu bekleme sürelerini kısalttı...
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
}
