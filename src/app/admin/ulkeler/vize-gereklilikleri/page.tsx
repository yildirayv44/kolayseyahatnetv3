"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Save, RefreshCw, CheckCircle, XCircle, Globe } from "lucide-react";
import Link from "next/link";

interface Country {
  id: number;
  name: string;
  country_code: string;
  slug: string;
}

interface VisaRequirement {
  id: number;
  country_code: string;
  country_name: string;
  visa_status: string;
  allowed_stay: string | null;
  conditions: string | null;
  notes: string | null;
  application_method: string | null;
  available_methods: string[];
}

const VISA_METHODS = [
  { value: "visa-free", label: "Vizesiz Giriş", icon: "✅", color: "text-green-700" },
  { value: "visa-on-arrival", label: "Varışta Vize", icon: "🛬", color: "text-blue-700" },
  { value: "evisa", label: "E-Vize", icon: "📧", color: "text-cyan-700" },
  { value: "embassy", label: "Konsolosluk Vizesi", icon: "🏛️", color: "text-orange-700" },
];

export default function VisaRequirementsPage() {
  const [countries, setCountries] = useState<Country[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [visaReq, setVisaReq] = useState<VisaRequirement | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchCountries();
  }, []);

  const fetchCountries = async () => {
    try {
      const response = await fetch("/api/admin/countries/list");
      const data = await response.json();
      setCountries(data.countries || []);
    } catch (error) {
      console.error("Error fetching countries:", error);
    }
  };

  const fetchVisaRequirement = async (countryCode: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/visa-requirements/get?country_code=${countryCode}`);
      const data = await response.json();
      
      if (data.requirement) {
        setVisaReq(data.requirement);
      } else {
        // Create empty requirement
        setVisaReq({
          id: 0,
          country_code: countryCode,
          country_name: selectedCountry?.name || "",
          visa_status: "visa-required",
          allowed_stay: null,
          conditions: null,
          notes: null,
          application_method: "embassy",
          available_methods: ["embassy"],
        });
      }
    } catch (error) {
      console.error("Error fetching visa requirement:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCountrySelect = (country: Country) => {
    setSelectedCountry(country);
    setMessage(null);
    if (country.country_code) {
      fetchVisaRequirement(country.country_code);
    }
  };

  const toggleMethod = (method: string) => {
    if (!visaReq) return;
    
    const methods = visaReq.available_methods || [];
    const newMethods = methods.includes(method)
      ? methods.filter(m => m !== method)
      : [...methods, method];
    
    setVisaReq({
      ...visaReq,
      available_methods: newMethods,
    });
  };

  const handleSave = async () => {
    if (!visaReq || !selectedCountry) return;
    
    setSaving(true);
    setMessage(null);
    
    try {
      const response = await fetch("/api/admin/visa-requirements/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(visaReq),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setMessage({ type: "success", text: "Vize gereklilikleri güncellendi!" });
      } else {
        setMessage({ type: "error", text: data.error || "Hata oluştu" });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Sunucu hatası" });
    } finally {
      setSaving(false);
    }
  };

  const filteredCountries = countries.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/ulkeler"
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white hover:bg-slate-50"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Vize Gereklilikleri</h1>
            <p className="text-sm text-slate-600">Ülkelerin vize gerekliliklerini düzenleyin</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Countries List */}
        <div className="card space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 mb-2">Ülkeler</h2>
            <input
              type="text"
              placeholder="Ülke ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          
          <div className="max-h-[600px] space-y-1 overflow-y-auto">
            {filteredCountries.map((country) => (
              <button
                key={country.id}
                onClick={() => handleCountrySelect(country)}
                className={`w-full rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                  selectedCountry?.id === country.id
                    ? "bg-primary text-white"
                    : "hover:bg-slate-100"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  <span>{country.name}</span>
                  {country.country_code && (
                    <span className="ml-auto text-xs opacity-70">
                      {country.country_code}
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Edit Form */}
        <div className="card space-y-6 lg:col-span-2">
          {!selectedCountry ? (
            <div className="flex h-full items-center justify-center py-12 text-center">
              <div>
                <Globe className="mx-auto h-12 w-12 text-slate-300" />
                <p className="mt-4 text-slate-600">Düzenlemek için bir ülke seçin</p>
              </div>
            </div>
          ) : loading ? (
            <div className="flex h-full items-center justify-center py-12">
              <RefreshCw className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : visaReq ? (
            <>
              <div>
                <h2 className="text-xl font-bold text-slate-900">{selectedCountry.name}</h2>
                <p className="text-sm text-slate-600">Türk vatandaşları için vize gereklilikleri</p>
              </div>

              {message && (
                <div
                  className={`rounded-lg p-4 ${
                    message.type === "success"
                      ? "bg-green-50 text-green-800"
                      : "bg-red-50 text-red-800"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {message.type === "success" ? (
                      <CheckCircle className="h-5 w-5" />
                    ) : (
                      <XCircle className="h-5 w-5" />
                    )}
                    <span className="text-sm font-medium">{message.text}</span>
                  </div>
                </div>
              )}

              {/* Available Methods */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-slate-900">
                  Mevcut Vize Yöntemleri
                </label>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  {VISA_METHODS.map((method) => (
                    <button
                      key={method.value}
                      onClick={() => toggleMethod(method.value)}
                      className={`rounded-lg border-2 p-4 text-left transition-all ${
                        visaReq.available_methods?.includes(method.value)
                          ? "border-primary bg-primary/5"
                          : "border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{method.icon}</span>
                        <div className="flex-1">
                          <div className={`font-semibold ${method.color}`}>
                            {method.label}
                          </div>
                          <div className="text-xs text-slate-600">{method.value}</div>
                        </div>
                        {visaReq.available_methods?.includes(method.value) && (
                          <CheckCircle className="h-5 w-5 text-primary" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Allowed Stay */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-900">
                  Kalış Süresi
                </label>
                <input
                  type="text"
                  value={visaReq.allowed_stay || ""}
                  onChange={(e) => setVisaReq({ ...visaReq, allowed_stay: e.target.value })}
                  placeholder="Örn: 90 gün, 30 gün, vb."
                  className="w-full rounded-lg border border-slate-300 px-3 py-2"
                />
              </div>

              {/* Conditions */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-900">
                  Koşullar
                </label>
                <input
                  type="text"
                  value={visaReq.conditions || ""}
                  onChange={(e) => setVisaReq({ ...visaReq, conditions: e.target.value })}
                  placeholder="Örn: Pasaport geçerlilik süresi 6 ay"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2"
                />
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-900">
                  Notlar
                </label>
                <textarea
                  value={visaReq.notes || ""}
                  onChange={(e) => setVisaReq({ ...visaReq, notes: e.target.value })}
                  placeholder="Ek bilgiler..."
                  rows={3}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2"
                />
              </div>

              {/* Save Button */}
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 font-semibold text-white hover:bg-primary-dark disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <RefreshCw className="h-5 w-5 animate-spin" />
                    Kaydediliyor...
                  </>
                ) : (
                  <>
                    <Save className="h-5 w-5" />
                    Kaydet
                  </>
                )}
              </button>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
