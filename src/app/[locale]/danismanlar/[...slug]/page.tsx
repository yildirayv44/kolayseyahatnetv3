import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Mail, Phone, User, Star, MessageSquare, FileText, HelpCircle } from "lucide-react";
import { getConsultantBySlug, getConsultantComments } from "@/lib/queries";
import { Breadcrumb } from "@/components/shared/Breadcrumb";
import { GenericCommentSection } from "@/components/comments/GenericCommentSection";
import { getLocalizedFields } from "@/lib/locale-content";
import { getLocalizedUrl } from "@/lib/locale-link";

interface ConsultantPageProps {
  params: Promise<{ slug: string[]; locale: string }>;
}

export default async function ConsultantPage({ params }: ConsultantPageProps) {
  const { slug, locale } = await params;
  
  // Tab seçimi - slug'ın son kısmına göre
  const lastSegment = slug[slug.length - 1];
  const activeTab = ["yorumlar", "blog", "sorular"].includes(lastSegment) 
    ? lastSegment 
    : "hakkinda";

  // Base slug (tab olmadan) - danışman adı
  const baseSlug = slug[0]; // "yildiray"
  const consultantSlug = `danisman/${baseSlug}`;
  
  let consultant = await getConsultantBySlug(consultantSlug);
  
  if (!consultant) {
    notFound();
  }

  // Localize consultant content
  consultant = getLocalizedFields(consultant, locale as 'tr' | 'en');

  // Yorumları çek
  const comments = await getConsultantComments(consultant.id);

  return (
    <div className="space-y-8 md:space-y-10">
      {/* BREADCRUMB */}
      <Breadcrumb
        items={[
          { label: "Danışmanlar", href: getLocalizedUrl("danisman", locale as 'tr' | 'en') },
          { label: consultant.name },
        ]}
      />

      {/* BACK BUTTON */}
      <Link
        href={getLocalizedUrl("danisman", locale as 'tr' | 'en')}
        className="inline-flex items-center gap-2 text-sm text-slate-600 transition-colors hover:text-primary"
      >
        <ArrowLeft className="h-4 w-4" />
        Tüm Danışmanlar
      </Link>

      {/* CONSULTANT HEADER */}
      <div className="card flex flex-col gap-6 md:flex-row md:items-start">
        <div className="flex h-32 w-32 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
          <User className="h-16 w-16" />
        </div>

        <div className="flex-1 space-y-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              {consultant.name}
            </h1>
            <p className="mt-2 text-lg text-slate-600">
              {consultant.description || "Vize Danışmanı"}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            {consultant.email && (
              <a
                href={`mailto:${consultant.email}`}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-all hover:border-primary hover:text-primary"
              >
                <Mail className="h-4 w-4" />
                E-posta Gönder
              </a>
            )}
            {consultant.phone && (
              <a
                href={`tel:${consultant.phone}`}
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-primary/90"
              >
                <Phone className="h-4 w-4" />
                {consultant.phone}
              </a>
            )}
          </div>
        </div>
      </div>

      {/* TABS */}
      <div className="border-b border-slate-200">
        <nav className="-mb-px flex gap-6">
          <Link
            href={getLocalizedUrl(`danisman/${baseSlug}`, locale as 'tr' | 'en')}
            className={`border-b-2 px-1 pb-3 text-sm font-medium transition-colors ${
              activeTab === "hakkinda"
                ? "border-primary text-primary"
                : "border-transparent text-slate-600 hover:border-slate-300 hover:text-slate-900"
            }`}
          >
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Hakkında
            </div>
          </Link>
          <Link
            href={getLocalizedUrl(`danisman/${baseSlug}/yorumlar`, locale as 'tr' | 'en')}
            className={`border-b-2 px-1 pb-3 text-sm font-medium transition-colors ${
              activeTab === "yorumlar"
                ? "border-primary text-primary"
                : "border-transparent text-slate-600 hover:border-slate-300 hover:text-slate-900"
            }`}
          >
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Yorumlar
            </div>
          </Link>
          <Link
            href={getLocalizedUrl(`danisman/${baseSlug}/blog`, locale as 'tr' | 'en')}
            className={`border-b-2 px-1 pb-3 text-sm font-medium transition-colors ${
              activeTab === "blog"
                ? "border-primary text-primary"
                : "border-transparent text-slate-600 hover:border-slate-300 hover:text-slate-900"
            }`}
          >
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Blog Yazıları
            </div>
          </Link>
          <Link
            href={getLocalizedUrl(`danisman/${baseSlug}/sorular`, locale as 'tr' | 'en')}
            className={`border-b-2 px-1 pb-3 text-sm font-medium transition-colors ${
              activeTab === "sorular"
                ? "border-primary text-primary"
                : "border-transparent text-slate-600 hover:border-slate-300 hover:text-slate-900"
            }`}
          >
            <div className="flex items-center gap-2">
              <HelpCircle className="h-4 w-4" />
              Sorular
            </div>
          </Link>
        </nav>
      </div>

      {/* TAB CONTENT */}
      {activeTab === "hakkinda" && (
        <section className="space-y-6">
          {consultant.aboutme ? (
            <div className="card">
              <h2 className="mb-4 text-xl font-semibold text-slate-900">
                Hakkında
              </h2>
              <div
                className="prose prose-slate max-w-none"
                dangerouslySetInnerHTML={{ __html: consultant.aboutme }}
              />
            </div>
          ) : (
            <div className="card text-center text-slate-500">
              <p>Henüz hakkında bilgisi eklenmemiş.</p>
            </div>
          )}

          {/* Yorumlar */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-slate-900">
                Yorumlar ({comments.length})
              </h2>
            </div>

            {comments.length > 0 ? (
              <GenericCommentSection
                initialComments={comments}
                entityId={consultant.id}
                entityType="consultant"
                showRating={true}
              />
            ) : (
              <div className="card text-center text-slate-500">
                <MessageSquare className="mx-auto mb-3 h-12 w-12 text-slate-300" />
                <p className="text-sm">Henüz yorum bulunmuyor.</p>
                <p className="mt-1 text-xs">
                  {consultant.name} hakkında ilk yorumu siz yapın!
                </p>
              </div>
            )}
          </div>

          {/* İletişim CTA */}
          <div className="card border-primary/10 bg-primary/5">
            <h2 className="mb-3 text-lg font-semibold text-slate-900">
              {consultant.name} ile iletişime geçin
            </h2>
            <p className="mb-4 text-sm text-slate-600">
              Vize başvurunuz için detaylı bilgi almak ve randevu oluşturmak için hemen
              iletişime geçin.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              {consultant.phone && (
                <a
                  href={`tel:${consultant.phone}`}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-primary bg-white px-6 py-3 text-sm font-bold text-primary transition-all hover:bg-primary hover:text-white"
                >
                  <Phone className="h-4 w-4" />
                  Hemen Ara
                </a>
              )}
              {consultant.email && (
                <a
                  href={`mailto:${consultant.email}`}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-white shadow-xl transition-all hover:bg-primary/90"
                >
                  <Mail className="h-4 w-4" />
                  E-posta Gönder
                </a>
              )}
            </div>
          </div>
        </section>
      )}

      {activeTab === "yorumlar" && (
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-slate-900">
              Tüm Yorumlar ({comments.length})
            </h2>
          </div>

          {comments.length > 0 ? (
            <GenericCommentSection
              initialComments={comments}
              entityId={consultant.id}
              entityType="consultant"
              showRating={true}
            />
          ) : (
            <div className="card text-center text-slate-500">
              <MessageSquare className="mx-auto mb-3 h-12 w-12 text-slate-300" />
              <p className="text-sm">Henüz yorum bulunmuyor.</p>
              <p className="mt-1 text-xs">
                {consultant.name} hakkında ilk yorumu siz yapın!
              </p>
            </div>
          )}
        </section>
      )}

      {activeTab === "blog" && (
        <section className="space-y-4">
          <div className="card text-center text-slate-500">
            <FileText className="mx-auto mb-3 h-12 w-12 text-slate-300" />
            <p className="text-sm">Henüz blog yazısı bulunmuyor.</p>
          </div>
        </section>
      )}

      {activeTab === "sorular" && (
        <section className="space-y-4">
          <div className="card text-center text-slate-500">
            <HelpCircle className="mx-auto mb-3 h-12 w-12 text-slate-300" />
            <p className="text-sm">Henüz soru bulunmuyor.</p>
          </div>
        </section>
      )}
    </div>
  );
}
