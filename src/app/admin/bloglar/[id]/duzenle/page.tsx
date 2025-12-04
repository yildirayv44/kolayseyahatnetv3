import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { BlogEditForm } from "@/components/admin/BlogEditForm";

export default async function EditBlogPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const { data: blog, error } = await supabase
    .from("blogs")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !blog) {
    notFound();
  }

  console.log('📖 Blog loaded from database:', {
    id: blog.id,
    title: blog.title,
    image_url: blog.image_url,
    has_image: !!blog.image_url
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Blog Düzenle</h2>
        <p className="text-sm text-slate-600">
          {blog.title} yazısını düzenleyin
        </p>
      </div>

      <BlogEditForm blog={blog} />
    </div>
  );
}
