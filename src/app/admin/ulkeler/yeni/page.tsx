import { CountryCreateForm } from "@/components/admin/CountryCreateForm";

export default function NewCountryPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Yeni Ülke Ekle</h1>
        <p className="mt-1 text-sm text-slate-600">
          Yeni bir ülke ve vize bilgileri ekleyin
        </p>
      </div>

      <CountryCreateForm />
    </div>
  );
}
