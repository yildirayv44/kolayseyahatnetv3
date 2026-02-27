"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Send, CheckCircle2, Shield, Clock, Users, Star, Phone } from "lucide-react";
import { getCountries, getCountryProducts, submitApplication } from "@/lib/queries";
import { getReferralPartnerId } from "@/lib/referralTracking";
import { trackFormStart, trackFormSubmit } from "@/lib/partnerActivityTracking";

interface CurrencyRates {
  USD: { buying: number; selling: number };
  EUR: { buying: number; selling: number };
}

export default function StandaloneApplicationPageWrapper() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    }>
      <StandaloneApplicationPage />
    </Suspense>
  );
}

function StandaloneApplicationPage() {
  const searchParams = useSearchParams();
  const [countries, setCountries] = useState<any[]>([]);
  const [filteredCountries, setFilteredCountries] = useState<any[]>([]);
  const [countrySearch, setCountrySearch] = useState("");
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [formStartTracked, setFormStartTracked] = useState(false);
  const [currencyRates, setCurrencyRates] = useState<CurrencyRates | null>(null);
  const [personCount, setPersonCount] = useState(1);
  const [ibanCopied, setIbanCopied] = useState(false);

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

  const countryName = searchParams.get("country_name") || "";
  const packageName = searchParams.get("package_name") || "";

  useEffect(() => {
    getCountries().then((data) => {
      setCountries(data);
      setFilteredCountries(data);
      const cn = searchParams.get("country_name");
      if (cn) setCountrySearch(cn);
    });
  }, []);

  useEffect(() => {
    if (formData.country_id) {
      getCountryProducts(parseInt(formData.country_id, 10)).then((data) => {
        setProducts(data);
        if (data.length > 0 && !formData.package_id) {
          setFormData((prev) => ({
            ...prev,
            package_id: data[0].id.toString(),
            package_name: data[0].name,
          }));
        }
      });
    } else {
      setProducts([]);
    }
  }, [formData.country_id]);

  // Fetch currency rates when package is selected
  useEffect(() => {
    if (formData.package_id) {
      fetch('/api/currency-rates')
        .then(res => res.json())
        .then(data => {
          if (data.success) setCurrencyRates(data.rates);
        })
        .catch(err => console.error('Kur bilgisi alınamadı:', err));
    } else {
      setCurrencyRates(null);
    }
  }, [formData.package_id]);

  useEffect(() => {
    if (countrySearch.trim() === "") {
      setFilteredCountries(countries);
    } else {
      const filtered = countries.filter((country) =>
        country.name.toLowerCase().includes(countrySearch.toLowerCase())
      );
      setFilteredCountries(filtered);
    }
  }, [countrySearch, countries]);

  const trackFormStartOnce = () => {
    if (!formStartTracked) {
      const partnerId = getReferralPartnerId();
      if (partnerId) {
        trackFormStart(partnerId, {
          countryId: formData.country_id ? parseInt(formData.country_id, 10) : undefined,
          countryName: formData.country_name || undefined,
          packageId: formData.package_id ? parseInt(formData.package_id, 10) : undefined,
          packageName: formData.package_name || undefined,
        });
      }
      setFormStartTracked(true);
    }
  };

  const handleCountrySelect = (country: any) => {
    trackFormStartOnce();
    setFormData({
      ...formData,
      country_id: country.id.toString(),
      country_name: country.name,
      package_id: "",
      package_name: "",
    });
    setCountrySearch(country.name);
    setShowCountryDropdown(false);
  };

  const formatTurkish = (num: number, decimals: number = 2) => {
    return num.toLocaleString('tr-TR', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  };

  const selectedProduct = products.find(p => p.id.toString() === formData.package_id);
  const packagePrice = selectedProduct ? parseFloat(selectedProduct.price) : 0;
  const packageCurrency = selectedProduct?.currency_id === 1 ? "TRY" : selectedProduct?.currency_id === 2 ? "USD" : "EUR";
  const totalPackagePrice = packagePrice * personCount;
  const tlAmount = currencyRates && totalPackagePrice > 0
    ? packageCurrency === "TRY"
      ? totalPackagePrice
      : totalPackagePrice * (packageCurrency === "EUR" ? currencyRates.EUR.selling : currencyRates.USD.selling)
    : packageCurrency === "TRY" ? totalPackagePrice : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    const partnerId = getReferralPartnerId();

    const result = await submitApplication({
      full_name: formData.full_name,
      email: formData.email,
      phone: formData.phone,
      country_id: parseInt(formData.country_id, 10) || null,
      country_name: formData.country_name,
      package_id: parseInt(formData.package_id, 10) || null,
      package_name: formData.package_name,
      notes: formData.notes,
      wants_payment: !!formData.package_id,
      payment_method: formData.package_id ? "bank_transfer" : "",
      person_count: personCount,
      total_amount: totalPackagePrice,
      package_currency: packageCurrency,
      tl_amount: tlAmount,
      partner_id: partnerId,
    });

    setLoading(false);

    if (result) {
      if (partnerId) {
        trackFormSubmit(partnerId, {
          countryId: parseInt(formData.country_id, 10) || undefined,
          countryName: formData.country_name,
          packageId: parseInt(formData.package_id, 10) || undefined,
          packageName: formData.package_name,
          customerName: formData.full_name,
          customerEmail: formData.email,
        });
      }
      setSuccess(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      setError("Bir hata oluştu. Lütfen tekrar deneyin.");
    }
  };

  const heroTitle = countryName
    ? `${countryName} Vizesi Başvurusu`
    : "Online Vize Başvurusu";

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* MOBILE TOP BANNER - compact trust bar (hidden on desktop) */}
      <div className="lg:hidden bg-gradient-to-r from-[#0F172A] via-[#1E3A8A] to-[#1E40AF] text-white px-4 py-4">
        <div className="flex items-center justify-between mb-3">
          <a href="https://www.kolayseyahat.net" target="_blank" rel="noopener noreferrer" className="text-lg font-bold text-white">
            Kolay Seyahat
          </a>
          <a href="tel:02129099971" className="flex items-center gap-1 text-xs text-blue-200 hover:text-white">
            <Phone className="h-3 w-3" />
            <span>0212 909 99 71</span>
          </a>
        </div>
        <div className="flex items-center gap-3 text-[11px] text-blue-200">
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3 text-emerald-400" />
            1 Saat Geri Dönüş
          </span>
          <span className="flex items-center gap-1">
            <Star className="h-3 w-3 text-amber-400" />
            %98 Başarı
          </span>
          <span className="flex items-center gap-1">
            <Shield className="h-3 w-3 text-blue-400" />
            SSL Güvenlik
          </span>
        </div>
      </div>

      {/* LEFT PANEL - Desktop only */}
      <div className="hidden lg:flex relative lg:fixed lg:left-0 lg:top-0 lg:h-screen lg:w-[35%] bg-gradient-to-br from-[#0F172A] via-[#1E3A8A] to-[#1E40AF] text-white overflow-hidden">
        <div className="absolute -top-20 -left-20 w-72 h-72 rounded-full bg-white/5" />
        <div className="absolute top-1/3 -right-16 w-56 h-56 rounded-full bg-white/5" />
        <div className="absolute bottom-20 -left-10 w-40 h-40 rounded-full bg-white/5" />

        <div className="relative z-10 flex h-full w-full flex-col justify-between p-10 xl:p-12">
          {/* Logo - text only */}
          <a href="https://www.kolayseyahat.net" target="_blank" rel="noopener noreferrer" className="text-xl font-bold text-white hover:text-blue-200 transition-colors">
            Kolay Seyahat
          </a>

          {/* Hero Content */}
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-300 backdrop-blur-sm mb-4">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400"></span>
              </span>
              3 Dakikada Tamamlayın
            </div>
            <h1 className="text-2xl xl:text-3xl font-bold leading-tight mb-6">
              {heroTitle}
            </h1>

            {/* Trust Indicators - compact */}
            <div className="space-y-2.5">
              <div className="flex items-center gap-2.5 rounded-lg bg-white/10 backdrop-blur-sm px-3 py-2.5">
                <Clock className="h-4 w-4 shrink-0 text-emerald-400" />
                <p className="text-sm text-white">1 Saat İçinde Geri Dönüş</p>
              </div>
              <div className="flex items-center gap-2.5 rounded-lg bg-white/10 backdrop-blur-sm px-3 py-2.5">
                <Star className="h-4 w-4 shrink-0 text-amber-400" />
                <p className="text-sm text-white">%98 Başarı Oranı</p>
              </div>
              <div className="flex items-center gap-2.5 rounded-lg bg-white/10 backdrop-blur-sm px-3 py-2.5">
                <Shield className="h-4 w-4 shrink-0 text-blue-400" />
                <p className="text-sm text-white">256-bit SSL Güvenlik</p>
              </div>
              <div className="flex items-center gap-2.5 rounded-lg bg-white/10 backdrop-blur-sm px-3 py-2.5">
                <Users className="h-4 w-4 shrink-0 text-purple-400" />
                <p className="text-sm text-white">15 Yıllık Deneyim</p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between text-sm text-blue-300">
            <p>&copy; {new Date().getFullYear()} Kolay Seyahat</p>
            <a href="tel:02129099971" className="flex items-center gap-1.5 hover:text-white transition-colors">
              <Phone className="h-4 w-4" />
              <span>0212 909 99 71</span>
            </a>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL - Form (always visible, mobile-first) */}
      <div className="flex-1 lg:ml-[35%]">
        <div className="mx-auto max-w-lg px-4 py-6 sm:px-6 sm:py-8 lg:max-w-4xl lg:px-10 lg:py-14">
          {/* Success State */}
          {success ? (
            <div className="space-y-6">
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-lg shadow-emerald-200">
                  <CheckCircle2 className="h-8 w-8 text-white" />
                </div>
                <h2 className="text-xl font-bold text-slate-900 mb-1">Başvurunuz Alındı!</h2>
                <p className="text-sm text-slate-600">
                  Uzman danışmanlarımız <strong>1 saat içinde</strong> sizinle iletişime geçecek.
                </p>
              </div>

              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 space-y-3">
                <h3 className="text-sm font-semibold text-emerald-900">Sonraki Adımlar</h3>
                {[
                  "Danışmanlarımız telefon veya WhatsApp ile iletişime geçecek",
                  "Gerekli belgeler hakkında bilgilendirileceksiniz",
                  "Süreç boyunca birebir destek alacaksınız",
                ].map((step, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-[10px] font-bold text-white mt-0.5">
                      {i + 1}
                    </div>
                    <p className="text-xs text-emerald-800">{step}</p>
                  </div>
                ))}
              </div>

              <div className="flex flex-col gap-2.5 sm:flex-row">
                <a
                  href="https://wa.me/902129099971"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition-all hover:bg-emerald-700"
                >
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  WhatsApp
                </a>
                <a
                  href="tel:02129099971"
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl border-2 border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition-all hover:border-primary hover:text-primary"
                >
                  <Phone className="h-4 w-4" />
                  0212 909 99 71
                </a>
              </div>

              <div className="text-center">
                <a href="https://www.kolayseyahat.net" className="text-sm text-primary font-medium hover:underline">
                  Ana Sayfaya Dön
                </a>
              </div>
            </div>
          ) : (
            <>
              {/* Form Header */}
              <div className="mb-5 lg:mb-8">
                <h2 className="text-xl lg:text-2xl font-bold text-slate-900 mb-1">
                  {countryName ? `${countryName} Vize Başvurusu` : "Vize Başvuru Formu"}
                </h2>
                <p className="text-sm text-slate-600">
                  Bilgilerinizi doldurun, uzman danışmanlarımız sizinle iletişime geçsin.
                </p>
              </div>

              {/* Urgency Banner */}
              <div className="mb-5 flex items-center gap-3 rounded-xl bg-amber-50 border border-amber-200 p-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-100">
                  <Clock className="h-4 w-4 text-amber-600" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-amber-900">Sınırlı Kontenjan</p>
                  <p className="text-[11px] text-amber-700">Bu ay için randevu sayısı sınırlıdır.</p>
                </div>
              </div>

              {error && (
                <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-xs text-red-800">
                  {error}
                </div>
              )}

              {/* Form - Two column layout when package selected */}
              <form onSubmit={handleSubmit} className={`grid grid-cols-1 gap-6 ${formData.package_id ? 'lg:grid-cols-2' : ''}`}>
                {/* LEFT COLUMN - Form Fields */}
                <div className="space-y-4">
                  {/* Full Name */}
                  <div className="space-y-1">
                    <label htmlFor="full_name" className="block text-sm font-semibold text-slate-700">
                      Ad Soyad <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="full_name"
                      required
                      value={formData.full_name}
                      onFocus={trackFormStartOnce}
                      onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                      className="w-full rounded-xl border-2 border-slate-200 px-3.5 py-2.5 text-sm transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                      placeholder="Adınızı girin..."
                    />
                  </div>

                  {/* Email & Phone */}
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-1">
                      <label htmlFor="email" className="block text-sm font-semibold text-slate-700">
                        E-posta <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        id="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full rounded-xl border-2 border-slate-200 px-3.5 py-2.5 text-sm transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                        placeholder="ornek@email.com"
                      />
                    </div>
                    <div className="space-y-1">
                      <label htmlFor="phone" className="block text-sm font-semibold text-slate-700">
                        Telefon <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full rounded-xl border-2 border-slate-200 px-3.5 py-2.5 text-sm transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                        placeholder="0555 123 45 67"
                      />
                    </div>
                  </div>

                  {/* Country */}
                  <div className="space-y-1 relative">
                    <label htmlFor="country_search" className="block text-sm font-semibold text-slate-700">
                      Ülke <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="country_search"
                      required
                      value={countrySearch}
                      onChange={(e) => {
                        setCountrySearch(e.target.value);
                        setShowCountryDropdown(true);
                      }}
                      onFocus={() => setShowCountryDropdown(true)}
                      placeholder="Ülke ara..."
                      className="w-full rounded-xl border-2 border-slate-200 px-3.5 py-2.5 text-sm transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                    {showCountryDropdown && filteredCountries.length > 0 && (
                      <div className="absolute z-20 w-full mt-1 bg-white border-2 border-slate-200 rounded-xl shadow-xl max-h-48 overflow-y-auto">
                        {filteredCountries.map((country) => (
                          <button
                            key={country.id}
                            type="button"
                            onClick={() => handleCountrySelect(country)}
                            className="w-full text-left px-3.5 py-2 text-sm hover:bg-primary/5 focus:bg-primary/10 focus:outline-none transition-colors first:rounded-t-xl last:rounded-b-xl"
                          >
                            {country.name}
                          </button>
                        ))}
                      </div>
                    )}
                    <input type="hidden" name="country_id" value={formData.country_id} required />
                  </div>

                  {/* Package Selection */}
                  {products.length > 0 && (
                    <div className="space-y-1.5">
                      <label className="block text-sm font-semibold text-slate-700">
                        Hizmet Paketi
                      </label>
                      <div className="space-y-2">
                        {products.map((product, index) => {
                          const isSelected = formData.package_id === product.id.toString();
                          const currencySymbol = product.currency_id === 1 ? "₺" : product.currency_id === 2 ? "$" : "€";
                          return (
                            <button
                              key={product.id}
                              type="button"
                              onClick={() => {
                                setFormData({
                                  ...formData,
                                  package_id: product.id.toString(),
                                  package_name: product.name,
                                });
                              }}
                              className={`relative w-full rounded-xl border-2 p-3 text-left transition-all ${
                                isSelected
                                  ? "border-primary bg-primary/5 shadow-md"
                                  : "border-slate-200 hover:border-primary/40"
                              }`}
                            >
                              {index === 0 && (
                                <div className="absolute -right-1 -top-1 rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold text-white">
                                  Popüler
                                </div>
                              )}
                              <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2.5">
                                  <div className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${
                                    isSelected ? "border-primary bg-primary" : "border-slate-300"
                                  }`}>
                                    {isSelected && (
                                      <svg className="h-3 w-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                      </svg>
                                    )}
                                  </div>
                                  <span className="text-sm font-medium text-slate-900">{product.name}</span>
                                </div>
                                <span className="text-sm font-bold text-primary whitespace-nowrap">
                                  {currencySymbol}{Number(product.price).toFixed(0)}
                                </span>
                              </div>
                              {isSelected && product.description && (
                                <p className="mt-1.5 ml-7.5 text-xs text-slate-500">{product.description}</p>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Notes */}
                  <div className="space-y-1">
                    <label htmlFor="notes" className="block text-sm font-semibold text-slate-700">
                      Eklemek İstedikleriniz
                    </label>
                    <textarea
                      id="notes"
                      rows={2}
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      className="w-full rounded-xl border-2 border-slate-200 px-3.5 py-2.5 text-sm transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                      placeholder="Seyahat tarihi, vize tipi vb."
                    />
                  </div>

                  {/* Submit Button - desktop always visible, mobile only when no package selected */}
                  <button
                    type="submit"
                    disabled={loading}
                    className={`group relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-primary to-[#1E40AF] px-6 py-3.5 text-base font-bold text-white shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:shadow-primary/30 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 ${formData.package_id ? 'hidden lg:block' : ''}`}
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Gönderiliyor...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        <Send className="h-5 w-5" />
                        Başvuruyu Tamamla
                      </span>
                    )}
                  </button>

                  {/* Privacy - desktop always, mobile only when no package */}
                  <p className={`text-center text-[10px] text-slate-400 ${formData.package_id ? 'hidden lg:block' : ''}`}>
                    Formu göndererek{" "}
                    <a href="https://www.kolayseyahat.net/bilgi-gizliligi" target="_blank" rel="noopener noreferrer" className="text-primary underline">
                      Gizlilik Politikası
                    </a>
                    {" "}ve{" "}
                    <a href="https://www.kolayseyahat.net/kvkk" target="_blank" rel="noopener noreferrer" className="text-primary underline">
                      KVKK
                    </a>
                    {" "}koşullarını kabul etmiş sayılırsınız.
                  </p>

                  {/* Quick Contact - mobile only, shown when no package */}
                  <div className={`flex items-center justify-center gap-4 pt-1 text-xs text-slate-500 lg:hidden ${formData.package_id ? 'hidden' : ''}`}>
                    <a href="tel:02129099971" className="flex items-center gap-1 hover:text-primary transition-colors">
                      <Phone className="h-3.5 w-3.5" />
                      0212 909 99 71
                    </a>
                    <a
                      href="https://wa.me/902129099971"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 hover:text-emerald-600 transition-colors"
                    >
                      <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                      </svg>
                      WhatsApp
                    </a>
                  </div>
                </div>

                {/* RIGHT COLUMN - Payment Details (visible when package selected) */}
                {/* On mobile, submit button will appear after this column */}
                {formData.package_id && (
                  <div className="lg:sticky lg:top-6 lg:self-start">
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-4">
                      <h3 className="text-sm font-bold text-slate-900">Ödeme Bilgileri</h3>

                      {/* Person Count */}
                      <div>
                        <p className="text-xs text-slate-500 mb-1.5">Kişi Sayısı</p>
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => setPersonCount(Math.max(1, personCount - 1))}
                            disabled={personCount <= 1}
                            className="flex items-center justify-center w-8 h-8 rounded-lg border-2 border-slate-300 hover:border-primary hover:bg-primary/5 transition-colors disabled:opacity-50"
                          >
                            <span className="text-lg font-bold">−</span>
                          </button>
                          <div className="text-center">
                            <span className="text-xl font-bold text-slate-900">{personCount}</span>
                            <span className="text-xs text-slate-500 ml-1">kişi</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setPersonCount(Math.min(10, personCount + 1))}
                            disabled={personCount >= 10}
                            className="flex items-center justify-center w-8 h-8 rounded-lg border-2 border-slate-300 hover:border-primary hover:bg-primary/5 transition-colors disabled:opacity-50"
                          >
                            <span className="text-lg font-bold">+</span>
                          </button>
                        </div>
                      </div>

                      {/* Price Summary */}
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-slate-600">Paket Fiyatı (Kişi Başı)</span>
                          <span className="font-semibold">{formatTurkish(packagePrice)} {packageCurrency}</span>
                        </div>
                        <div className="flex justify-between border-t border-slate-200 pt-2">
                          <span className="font-semibold text-slate-900">Toplam Tutar</span>
                          <span className="text-lg font-bold text-primary">{formatTurkish(totalPackagePrice)} {packageCurrency}</span>
                        </div>
                        {personCount > 1 && (
                          <p className="text-xs text-slate-400">({personCount} kişi × {formatTurkish(packagePrice)} {packageCurrency})</p>
                        )}
                      </div>

                      {/* Currency Rates */}
                      {currencyRates && packageCurrency !== "TRY" && (
                        <div className="border-t border-slate-200 pt-3 space-y-1.5 text-sm">
                          <p className="text-xs font-semibold text-slate-600">Güncel Döviz Kurları (TCMB)</p>
                          <div className="flex justify-between">
                            <span className="text-slate-500">USD:</span>
                            <span className="font-semibold">{formatTurkish(currencyRates.USD.selling)} ₺</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500">EUR:</span>
                            <span className="font-semibold">{formatTurkish(currencyRates.EUR.selling)} ₺</span>
                          </div>
                          <p className="text-[10px] text-slate-400">* Satış kuru kullanılmaktadır</p>
                        </div>
                      )}

                      {/* TL Amount */}
                      {tlAmount > 0 && packageCurrency !== "TRY" && (
                        <div className="rounded-lg bg-primary/5 border border-primary/20 p-3">
                          <p className="text-xs text-slate-600">Ödenecek Tutar (TL)</p>
                          <p className="text-2xl font-bold text-primary">{formatTurkish(tlAmount)} ₺</p>
                          <p className="text-[10px] text-slate-500 mt-0.5">
                            ({formatTurkish(totalPackagePrice)} {packageCurrency} × {formatTurkish(currencyRates?.[packageCurrency as keyof CurrencyRates]?.selling || 0)} ₺)
                          </p>
                          <p className="text-[10px] text-emerald-700 font-medium mt-1">✓ KDV Dahil</p>
                        </div>
                      )}

                      {/* Bank Transfer Info */}
                      <div className="border-t border-slate-200 pt-3">
                        <p className="text-xs font-semibold text-slate-700 mb-2">Banka Havalesi / EFT</p>
                        <div className="bg-white rounded-lg border border-slate-200 p-3 space-y-2 text-xs">
                          <p className="font-semibold text-slate-900">Kolay Seyahat Teknoloji Ltd. Şti.</p>
                          <div className="flex items-center gap-2">
                            <p className="font-mono text-slate-700 flex-1">TR71 0004 6001 1888 8000 1215 84</p>
                            <button
                              type="button"
                              onClick={() => {
                                navigator.clipboard.writeText('TR710004600118888000121584');
                                setIbanCopied(true);
                                setTimeout(() => setIbanCopied(false), 2000);
                              }}
                              className={`flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-medium transition-all ${
                                ibanCopied
                                  ? 'bg-emerald-100 text-emerald-700'
                                  : 'bg-primary/10 text-primary hover:bg-primary/20'
                              }`}
                            >
                              {ibanCopied ? (
                                <>
                                  <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                  </svg>
                                  Kopyalandı
                                </>
                              ) : (
                                <>
                                  <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                  </svg>
                                  Kopyala
                                </>
                              )}
                            </button>
                          </div>
                          <p className="text-slate-500 italic">* Dekont/makbuzu bize iletiniz</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* MOBILE: Submit + Privacy after payment details */}
                {formData.package_id && (
                  <div className="lg:hidden col-span-1 space-y-3">
                    <button
                      type="submit"
                      disabled={loading}
                      className="group relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-primary to-[#1E40AF] px-6 py-3.5 text-base font-bold text-white shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:shadow-primary/30 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {loading ? (
                        <span className="flex items-center justify-center gap-2">
                          <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          Gönderiliyor...
                        </span>
                      ) : (
                        <span className="flex items-center justify-center gap-2">
                          <Send className="h-5 w-5" />
                          Başvuruyu Tamamla
                        </span>
                      )}
                    </button>
                    <p className="text-center text-[10px] text-slate-400">
                      Formu göndererek{" "}
                      <a href="https://www.kolayseyahat.net/bilgi-gizliligi" target="_blank" rel="noopener noreferrer" className="text-primary underline">Gizlilik Politikası</a>
                      {" "}ve{" "}
                      <a href="https://www.kolayseyahat.net/kvkk" target="_blank" rel="noopener noreferrer" className="text-primary underline">KVKK</a>
                      {" "}koşullarını kabul etmiş sayılırsınız.
                    </p>
                    <div className="flex items-center justify-center gap-4 pt-1 text-xs text-slate-500">
                      <a href="tel:02129099971" className="flex items-center gap-1 hover:text-primary transition-colors">
                        <Phone className="h-3.5 w-3.5" />
                        0212 909 99 71
                      </a>
                      <a href="https://wa.me/902129099971" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-emerald-600 transition-colors">
                        <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                        WhatsApp
                      </a>
                    </div>
                  </div>
                )}
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
