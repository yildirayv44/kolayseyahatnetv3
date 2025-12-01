"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Send } from "lucide-react";
import { getCountries, getCountryProducts, submitApplication } from "@/lib/queries";

export function ApplicationForm() {
  const searchParams = useSearchParams();
  const [countries, setCountries] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    country_id: searchParams.get("country_id") || "",
    country_name: searchParams.get("country_name") || "",
    package_id: searchParams.get("package_id") || "",
    package_name: searchParams.get("package_name") || "",
    notes: "",
  });

  useEffect(() => {
    getCountries().then(setCountries);
  }, []);

  useEffect(() => {
    if (formData.country_id) {
      getCountryProducts(parseInt(formData.country_id, 10)).then(setProducts);
    } else {
      setProducts([]);
    }
  }, [formData.country_id]);

  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = e.target.value;
    const selectedCountry = countries.find((c) => c.id === parseInt(selectedId, 10));
    setFormData({
      ...formData,
      country_id: selectedId,
      country_name: selectedCountry?.name || "",
      package_id: "",
      package_name: "",
    });
  };

  const handlePackageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = e.target.value;
    const selectedProduct = products.find((p) => p.id === parseInt(selectedId, 10));
    setFormData({
      ...formData,
      package_id: selectedId,
      package_name: selectedProduct?.name || "",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    const result = await submitApplication({
      full_name: formData.full_name,
      email: formData.email,
      phone: formData.phone,
      country_id: formData.country_id ? parseInt(formData.country_id, 10) : null,
      country_name: formData.country_name || null,
      package_id: formData.package_id ? parseInt(formData.package_id, 10) : null,
      package_name: formData.package_name || null,
      notes: formData.notes || null,
    });

    setLoading(false);

    if (result) {
      setSuccess(true);
      setFormData({
        full_name: "",
        email: "",
        phone: "",
        country_id: "",
        country_name: "",
        package_id: "",
        package_name: "",
        notes: "",
      });
    } else {
      setError("Başvurunuz kaydedilemedi. Lütfen tekrar deneyin veya bizi arayın.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="card space-y-5">
      {success && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          Başvurunuz başarıyla alındı! En kısa sürede sizinle iletişime geçeceğiz.
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      )}

      <div className="space-y-2">
        <label htmlFor="full_name" className="block text-sm font-medium text-slate-700">
          Ad Soyad <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="full_name"
          required
          value={formData.full_name}
          onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
          className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          placeholder="Adınız ve soyadınız"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="email" className="block text-sm font-medium text-slate-700">
          E-posta <span className="text-red-500">*</span>
        </label>
        <input
          type="email"
          id="email"
          required
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          placeholder="ornek@email.com"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="phone" className="block text-sm font-medium text-slate-700">
          Telefon <span className="text-red-500">*</span>
        </label>
        <input
          type="tel"
          id="phone"
          required
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          placeholder="0555 123 45 67"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="country_id" className="block text-sm font-medium text-slate-700">
          Ülke Seçin <span className="text-red-500">*</span>
        </label>
        <select
          id="country_id"
          required
          value={formData.country_id}
          onChange={handleCountryChange}
          className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        >
          <option value="">-- Ülke seçin --</option>
          {countries.map((country) => (
            <option key={country.id} value={country.id}>
              {country.name}
            </option>
          ))}
        </select>
      </div>

      {products.length > 0 && (
        <div className="space-y-2">
          <label htmlFor="package_id" className="block text-sm font-medium text-slate-700">
            Vize Paketi (Opsiyonel)
          </label>
          <select
            id="package_id"
            value={formData.package_id}
            onChange={handlePackageChange}
            className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="">-- Paket seçin (opsiyonel) --</option>
            {products.map((product) => (
              <option key={product.id} value={product.id}>
                {product.name} - ${Number(product.price).toFixed(2)}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="space-y-2">
        <label htmlFor="notes" className="block text-sm font-medium text-slate-700">
          Notlar / Ek Bilgiler
        </label>
        <textarea
          id="notes"
          rows={4}
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          placeholder="Başvurunuzla ilgili eklemek istediğiniz notlar..."
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="group relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-primary to-primary-dark px-8 py-4 text-lg font-bold text-white shadow-lg transition-all hover:shadow-2xl disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Gönderiliyor...
          </span>
        ) : (
          <span className="flex items-center justify-center gap-2">
            <Send className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            Başvuruyu Gönder
          </span>
        )}
      </button>
      <p className="text-center text-xs text-slate-500">
        Formu göndererek <a href="/gizlilik" className="underline hover:text-primary">gizlilik politikamızı</a> kabul etmiş olursunuz.
      </p>
    </form>
  );
}
