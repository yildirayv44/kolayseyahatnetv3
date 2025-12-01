import { BlogCreateForm } from "@/components/admin/BlogCreateForm";

export default function NewBlogPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Yeni Blog Yazısı</h1>
        <p className="mt-1 text-sm text-slate-600">
          Yeni bir blog yazısı oluşturun
        </p>
      </div>

      <BlogCreateForm />
    </div>
  );
}
