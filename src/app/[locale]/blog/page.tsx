import type { Metadata } from "next";
import Link from "next/link";
import { Clock4, Calendar } from "lucide-react";
import { getBlogs } from "@/lib/queries";
import { getBlogSlug } from "@/lib/helpers";

export const metadata: Metadata = {
  title: "Vize Rehberi - Blog | Kolay Seyahat",
  description:
    "Vize başvuruları, gerekli belgeler, süreçler ve ipuçları hakkında uzman görüşleri ve rehberler.",
};

export default async function BlogPage() {
  const blogs = await getBlogs();

  return (
    <div className="space-y-8">
      <section className="space-y-3 border-b border-slate-200 pb-6">
        <h1 className="text-2xl font-semibold text-slate-900 md:text-3xl">
          Vize Rehberi
        </h1>
        <p className="max-w-2xl text-sm text-slate-600">
          Vize başvuru süreçleri, gerekli belgeler, ülke bazlı özel bilgiler ve uzman
          tavsiyeleri ile vize işlemlerinizi kolaylaştırın.
        </p>
      </section>

      {blogs.length === 0 && (
        <div className="rounded-xl border border-slate-200 bg-slate-50 px-6 py-12 text-center">
          <p className="text-sm text-slate-600">
            Henüz blog yazısı bulunmuyor. Yakında yeni içeriklerle karşınızda olacağız.
          </p>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {blogs.map((blog: any) => (
          <Link
            key={blog.id}
            href={getBlogSlug(blog)}
            className="card group space-y-3"
          >
            <div className="space-y-2">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-primary">
                {blog.type || "Genel"}
              </p>
              <h2 className="text-base font-semibold text-slate-900 line-clamp-2 group-hover:text-primary">
                {blog.title}
              </h2>
              <p className="text-sm text-slate-600 line-clamp-3">
                {blog.description}
              </p>
            </div>

            <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-500">
              <span className="inline-flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {new Date(blog.created_at).toLocaleDateString("tr-TR", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </span>
              <span className="inline-flex items-center gap-1">
                <Clock4 className="h-3 w-3" />
                {blog.views || 0} görüntülenme
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
