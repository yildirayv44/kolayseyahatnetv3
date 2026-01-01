"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Send, CreditCard, Building2, Smartphone, CheckCircle2 } from "lucide-react";
import { getCountries, getCountryProducts, submitApplication } from "@/lib/queries";
import { getCurrentUser } from "@/lib/auth";
import { t } from "@/i18n/translations";
import type { Locale } from "@/i18n/translations";
import { CreditCardForm } from "@/components/payment/CreditCardForm";
import { PaymentSummary } from "@/components/payment/PaymentSummary";

interface ApplicationFormProps {
  locale?: Locale;
}

interface CurrencyRates {
  USD: { buying: number; selling: number };
  EUR: { buying: number; selling: number };
}

export function ApplicationForm({ locale = "tr" }: ApplicationFormProps) {
  const searchParams = useSearchParams();
  const [countries, setCountries] = useState<any[]>([]);
  const [filteredCountries, setFilteredCountries] = useState<any[]>([]);
  const [countrySearch, setCountrySearch] = useState("");
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [currencyRates, setCurrencyRates] = useState<CurrencyRates | null>(null);
  const [wantsToPayNow, setWantsToPayNow] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [skipPackageSelection, setSkipPackageSelection] = useState(false);
  const [personCount, setPersonCount] = useState(1);

  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    country_id: searchParams.get("country_id") || "",
    country_name: searchParams.get("country_name") || "",
    package_id: searchParams.get("package_id") || "",
    package_name: searchParams.get("package_name") || "",
    notes: "",
    wants_payment: false,
    payment_method: "",
    person_count: 1,
  });

  // Turkish number formatting
  const formatTurkish = (num: number, decimals: number = 2) => {
    return num.toLocaleString('tr-TR', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  };

  // Get selected product details
  const selectedProduct = products.find((p) => p.id === parseInt(formData.package_id, 10));
  const packagePrice = selectedProduct ? parseFloat(selectedProduct.price) : 0;
  // currency_id: 1 = TL, 2 = USD, 3 = EUR
  const packageCurrency = selectedProduct?.currency_id === 1 ? "TRY" : selectedProduct?.currency_id === 2 ? "USD" : "EUR";
  
  // Calculate total price (package price * person count)
  const totalPackagePrice = packagePrice * personCount;
  
  // Calculate TL amount
  const tlAmount = currencyRates && totalPackagePrice > 0
    ? packageCurrency === "TRY" 
      ? totalPackagePrice 
      : totalPackagePrice * (packageCurrency === "EUR" ? currencyRates.EUR.selling : currencyRates.USD.selling)
    : packageCurrency === "TRY" ? totalPackagePrice : 0;

  useEffect(() => {
    getCountries().then((data) => {
      setCountries(data);
      setFilteredCountries(data);
      
      // If country_name is in URL, set it as search value
      const countryName = searchParams.get("country_name");
      if (countryName) {
        setCountrySearch(countryName);
      }
    });
    
    // Check if user is authenticated and pre-fill data
    getCurrentUser().then(user => {
      if (user) {
        setIsAuthenticated(true);
        setFormData(prev => ({
          ...prev,
          full_name: user.name || user.email.split('@')[0] || "",
          email: user.email,
        }));
      }
    });
    
    // If package_id is NOT in URL, set skip to true by default
    const packageId = searchParams.get("package_id");
    if (!packageId) {
      setSkipPackageSelection(true);
    }
  }, []);

  useEffect(() => {
    if (formData.country_id) {
      getCountryProducts(parseInt(formData.country_id, 10)).then((data) => {
        setProducts(data);
        
        // Auto-select first package if no package is selected from URL
        if (data.length > 0 && !formData.package_id) {
          setFormData(prev => ({
            ...prev,
            package_id: data[0].id.toString(),
            package_name: data[0].name,
          }));
          setSkipPackageSelection(false);
        }
      });
    } else {
      setProducts([]);
    }
  }, [formData.country_id]);

  // Filter countries based on search
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

  // Fetch currency rates from API when package is selected
  useEffect(() => {
    if (formData.package_id) {
      fetch('/api/currency-rates')
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setCurrencyRates(data.rates);
          }
        })
        .catch(err => {
          console.error('Kur bilgisi alınamadı:', err);
        });
    } else {
      setCurrencyRates(null);
    }
  }, [formData.package_id]);

  const handleCountrySelect = (country: any) => {
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
      wants_payment: wantsToPayNow,
      payment_method: wantsToPayNow ? paymentMethod : null,
      person_count: personCount,
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
        wants_payment: false,
        payment_method: "",
        person_count: 1,
      });
      setWantsToPayNow(true);
      setPaymentMethod("");
      setCurrencyRates(null);
      setPersonCount(1);
    } else {
      setError(t(locale, "applicationError"));
    }
  };

  return (
    <div className="w-full">
      {/* Success/Error Messages */}
      {success && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 mb-6">
          {t(locale, "applicationSent")}
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className={`grid grid-cols-1 gap-8 ${formData.package_id ? 'lg:grid-cols-2' : 'lg:grid-cols-1 max-w-3xl mx-auto'}`}>
        {/* Left Column - Application Form */}
        <div className="space-y-5 card">
          <h2 className="text-xl font-bold text-slate-900">Başvuru Bilgileri</h2>

          {/* Show user info if authenticated */}
          {isAuthenticated && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-emerald-900">Giriş Yapmış Kullanıcı</p>
                  <p className="text-xs text-emerald-700 mt-1">
                    <strong>{formData.full_name}</strong> ({formData.email})
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Show name and email fields only if NOT authenticated */}
          {!isAuthenticated && (
            <>
              <div className="space-y-2">
                <label htmlFor="full_name" className="block text-sm font-medium text-slate-700">
                  {t(locale, "fullName")} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="full_name"
                  required
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder={t(locale, "fullName")}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-medium text-slate-700">
                  {t(locale, "email")} <span className="text-red-500">*</span>
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
            </>
          )}

          <div className="space-y-2">
            <label htmlFor="phone" className="block text-sm font-medium text-slate-700">
              {t(locale, "phone")} <span className="text-red-500">*</span>
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

          <div className="space-y-2 relative">
            <label htmlFor="country_search" className="block text-sm font-medium text-slate-700">
              {t(locale, "country")} <span className="text-red-500">*</span>
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
              className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            {showCountryDropdown && filteredCountries.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {filteredCountries.map((country) => (
                  <button
                    key={country.id}
                    type="button"
                    onClick={() => handleCountrySelect(country)}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-primary/5 focus:bg-primary/10 focus:outline-none transition-colors"
                  >
                    {country.name}
                  </button>
                ))}
              </div>
            )}
            <input type="hidden" name="country_id" value={formData.country_id} required />
          </div>

          {products.length > 0 && (
            <div className="space-y-3">
              <label className="block text-sm font-medium text-slate-700">
                {t(locale, "selectPackage")} (Opsiyonel)
              </label>
              <div className="grid grid-cols-1 gap-3">
                {products.map((product, index) => {
                  const isSelected = formData.package_id === product.id.toString();
                  const currencySymbol = product.currency_id === 1 ? '₺' : product.currency_id === 2 ? '$' : '€';
                  
                  return (
                    <button
                      key={product.id}
                      type="button"
                      onClick={() => {
                        setSkipPackageSelection(false);
                        setFormData({
                          ...formData,
                          package_id: product.id.toString(),
                          package_name: product.name,
                        });
                      }}
                      className={`relative rounded-lg border-2 p-4 text-left transition-all hover:shadow-lg ${
                        isSelected
                          ? 'border-primary bg-primary/5 shadow-md'
                          : 'border-slate-200 bg-white hover:border-primary/50'
                      }`}
                    >
                      {index === 0 && (
                        <div className="absolute -right-1 -top-1 rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold text-white">
                          ⭐ Popüler
                        </div>
                      )}
                      {isSelected && (
                        <div className="absolute -left-1 -top-1 rounded-full bg-green-500 p-1">
                          <CheckCircle2 className="h-3 w-3 text-white" />
                        </div>
                      )}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="text-sm font-bold text-slate-900 mb-1">{product.name}</div>
                          {product.description && (
                            <div className="text-xs text-slate-600 line-clamp-2">{product.description}</div>
                          )}
                        </div>
                        <div className="flex flex-col items-end">
                          <div className="flex items-baseline gap-1">
                            <span className="text-lg font-bold text-primary">
                              {currencySymbol}{Number(product.price).toFixed(0)}
                            </span>
                          </div>
                          {isSelected && (
                            <span className="text-xs font-semibold text-green-600 mt-1">Seçili</span>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
                
                {/* Daha sonra karar vereceğim seçeneği */}
                <button
                  type="button"
                  onClick={() => {
                    setSkipPackageSelection(true);
                    setFormData({
                      ...formData,
                      package_id: "",
                      package_name: "",
                    });
                  }}
                  className={`relative rounded-lg border-2 p-4 text-left transition-all hover:shadow-lg ${
                    skipPackageSelection
                      ? 'border-primary bg-primary/5 shadow-md'
                      : 'border-slate-200 bg-white hover:border-primary/50'
                  }`}
                >
                  {skipPackageSelection && (
                    <div className="absolute -left-1 -top-1 rounded-full bg-green-500 p-1">
                      <CheckCircle2 className="h-3 w-3 text-white" />
                    </div>
                  )}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="text-sm font-bold text-slate-900 mb-1">Daha Sonra Karar Vereceğim</div>
                      <div className="text-xs text-slate-600">Paket seçimini daha sonra danışmanlarımızla birlikte yapabilirsiniz</div>
                    </div>
                    {skipPackageSelection && (
                      <span className="text-xs font-semibold text-green-600 mt-1">Seçili</span>
                    )}
                  </div>
                </button>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="notes" className="block text-sm font-medium text-slate-700">
              {t(locale, "notes")}
            </label>
            <textarea
              id="notes"
              rows={4}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              placeholder={t(locale, "notesPlaceholder")}
            />
          </div>

          {/* Mobile App CTA */}
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4">
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <Smartphone className="w-8 h-8 text-purple-600 flex-shrink-0" />
              <div className="flex-1 text-center sm:text-left">
                <p className="text-sm font-semibold text-slate-900">Mobil Uygulamamızı İndirin</p>
                <p className="text-xs text-slate-600">Başvurularınızı mobil uygulama üzerinden de takip edebilirsiniz</p>
              </div>
              <a
                href="https://apps.apple.com/tr/app/kolay-seyahat/id6756451040?l=tr"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors flex-shrink-0"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                </svg>
                <span className="text-sm font-medium">App Store</span>
              </a>
            </div>
          </div>

          {/* Scroll hint for mobile - outside of CTA box */}
          {formData.package_id && (
            <div className="md:hidden text-center">
              <p className="text-sm text-primary font-medium flex items-center justify-center gap-2">
                <svg className="w-4 h-4 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
                Ödeme bilgileri için aşağı kaydırın
              </p>
            </div>
          )}

          {/* Show button here if NO package selected OR payment is NOT selected */}
          {(!formData.package_id || !wantsToPayNow) && (
            <>
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
                    {t(locale, "sending")}
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <Send className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                    {t(locale, "submitApplication")}
                  </span>
                )}
              </button>

              {/* Privacy and KVKK Links */}
              <div className="space-y-2 text-center text-xs text-slate-500">
                <p>
                  Formu göndererek{" "}
                  <a 
                    href="https://www.kolayseyahat.net/bilgi-gizliligi" 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-primary underline hover:text-primary/80"
                  >
                    Gizlilik Politikası
                  </a>
                  {" "}ve{" "}
                  <a 
                    href="https://www.kolayseyahat.net/kvkk" 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-primary underline hover:text-primary/80"
                  >
                    KVKK
                  </a>
                  {" "}koşullarını kabul etmiş sayılırsınız.
                </p>
                <p className="text-slate-400">
                  Kişisel verileriniz güvenli bir şekilde saklanır ve üçüncü şahıslarla paylaşılmaz.
                </p>
              </div>

              {/* Invoice and VAT Information */}
              <div className="border-t border-slate-200 pt-4 space-y-2 text-xs text-slate-500">
                <p className="font-semibold text-slate-700">Fatura ve Dekont Bilgilendirmesi:</p>
                <ul className="space-y-1 text-slate-600">
                  <li>• Konsolosluk harcı karşılığı <strong>dekont</strong> düzenlenir.</li>
                  <li>• Hizmet bedeli karşılığı <strong>fatura</strong> düzenlenir.</li>
                  <li>• Tüm ücretlere <strong>KDV dahildir</strong>.</li>
                </ul>
              </div>
            </>
          )}
        </div>

        {/* Right Column - Payment Information */}
        <div className="space-y-5">
          {formData.package_id && (
            <PaymentSummary
              packageName={formData.package_name}
              packagePrice={packagePrice}
              packageCurrency={packageCurrency}
              currencyRates={currencyRates}
              tlAmount={tlAmount}
              formatTurkish={formatTurkish}
              wantsToPayNow={wantsToPayNow}
              paymentMethod={paymentMethod}
              personCount={personCount}
              onPersonCountChange={setPersonCount}
              onWantsToPayNowChange={(checked) => {
                setWantsToPayNow(checked);
                if (!checked) setPaymentMethod("");
              }}
              onPaymentMethodChange={setPaymentMethod}
              loading={loading}
              onSubmit={() => {}}
            />
          )}
        </div>
      </form>
    </div>
  );
}
