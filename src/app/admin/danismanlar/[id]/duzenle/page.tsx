import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { ConsultantEditForm } from "@/components/admin/ConsultantEditForm";

export default async function EditConsultantPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const { data: consultant, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !consultant) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Danışman Düzenle</h2>
        <p className="text-sm text-slate-600">
          {consultant.name} bilgilerini düzenleyin
        </p>
      </div>

      <ConsultantEditForm consultant={consultant} />
    </div>
  );
}
