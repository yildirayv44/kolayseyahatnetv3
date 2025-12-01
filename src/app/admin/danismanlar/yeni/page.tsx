import { ConsultantCreateForm } from "@/components/admin/ConsultantCreateForm";

export default function NewConsultantPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Yeni Danışman Ekle</h1>
        <p className="mt-1 text-sm text-slate-600">
          Yeni bir danışman profili oluşturun
        </p>
      </div>

      <ConsultantCreateForm />
    </div>
  );
}
