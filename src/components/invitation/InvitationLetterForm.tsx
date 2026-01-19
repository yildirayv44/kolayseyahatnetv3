"use client";

import { useState, useEffect } from "react";
import { 
  User, Users, Calendar, MapPin, Plane, CreditCard, 
  FileText, Loader2, Download, Copy, Check, AlertCircle,
  Plus, Trash2, Globe2, Mail, Phone, Building, Search,
  Languages, Shield, ExternalLink, ArrowRight, Info
} from "lucide-react";
import Link from "next/link";
import { getCountries } from "@/lib/queries";

interface Guest {
  id: string;
  fullName: string;
  passportNumber: string;
}

interface FormData {
  // Host Information
  hostName: string;
  hostAddress: string;
  hostCity: string;
  hostPostalCode: string;
  hostCountryId: number | null;
  hostCountryName: string;
  hostEmail: string;
  hostPhone: string;
  
  // Guest Information
  guests: Guest[];
  
  // Visit Details
  destinationCountry: number | null;
  destinationCountryName: string;
  visitPurpose: string;
  customPurpose: string;
  startDate: string;
  endDate: string;
  
  // Financial Responsibility
  coverAccommodation: boolean;
  coverTransportation: boolean;
  coverMeals: boolean;
  coverAllExpenses: boolean;
  
  // Additional Options
  relationship: string;
  customRelationship: string;
  
  // Output Options
  outputLanguage: string;
  
  // KVKK
  kvkkAccepted: boolean;
}

const outputLanguages = [
  { value: "tr", label: "Türkçe", flag: "🇹🇷" },
  { value: "en", label: "English", flag: "🇬🇧" },
  { value: "de", label: "Deutsch", flag: "🇩🇪" },
  { value: "fr", label: "Français", flag: "🇫🇷" },
  { value: "es", label: "Español", flag: "🇪🇸" },
  { value: "it", label: "Italiano", flag: "🇮🇹" },
  { value: "ru", label: "Русский", flag: "🇷🇺" },
  { value: "ar", label: "العربية", flag: "🇸🇦" },
  { value: "zh", label: "中文", flag: "🇨🇳" },
  { value: "ja", label: "日本語", flag: "🇯🇵" },
  { value: "pt", label: "Português", flag: "🇵🇹" },
  { value: "nl", label: "Nederlands", flag: "🇳🇱" },
];

const initialFormData: FormData = {
  hostName: "",
  hostAddress: "",
  hostCity: "",
  hostPostalCode: "",
  hostCountryId: null,
  hostCountryName: "",
  hostEmail: "",
  hostPhone: "",
  guests: [{ id: "1", fullName: "", passportNumber: "" }],
  destinationCountry: null,
  destinationCountryName: "",
  visitPurpose: "tourism",
  customPurpose: "",
  startDate: "",
  endDate: "",
  coverAccommodation: true,
  coverTransportation: false,
  coverMeals: false,
  coverAllExpenses: false,
  relationship: "friend",
  customRelationship: "",
  outputLanguage: "en",
  kvkkAccepted: false,
};

const visitPurposes = {
  tr: [
    { value: "tourism", label: "Turizm / Tatil" },
    { value: "family_visit", label: "Aile Ziyareti" },
    { value: "friend_visit", label: "Arkadaş Ziyareti" },
    { value: "business", label: "İş Görüşmesi" },
    { value: "conference", label: "Konferans / Seminer" },
    { value: "medical", label: "Sağlık / Tedavi" },
    { value: "education", label: "Eğitim / Kurs" },
    { value: "other", label: "Diğer" },
  ],
  en: [
    { value: "tourism", label: "Tourism / Holiday" },
    { value: "family_visit", label: "Family Visit" },
    { value: "friend_visit", label: "Friend Visit" },
    { value: "business", label: "Business Meeting" },
    { value: "conference", label: "Conference / Seminar" },
    { value: "medical", label: "Medical Treatment" },
    { value: "education", label: "Education / Course" },
    { value: "other", label: "Other" },
  ],
};

const relationships = {
  tr: [
    { value: "friend", label: "Arkadaş" },
    { value: "family", label: "Aile Üyesi" },
    { value: "relative", label: "Akraba" },
    { value: "business_partner", label: "İş Ortağı" },
    { value: "colleague", label: "İş Arkadaşı" },
    { value: "other", label: "Diğer" },
  ],
  en: [
    { value: "friend", label: "Friend" },
    { value: "family", label: "Family Member" },
    { value: "relative", label: "Relative" },
    { value: "business_partner", label: "Business Partner" },
    { value: "colleague", label: "Colleague" },
    { value: "other", label: "Other" },
  ],
};

interface Props {
  locale: "tr" | "en";
}

export function InvitationLetterForm({ locale }: Props) {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [countries, setCountries] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [generatedLetter, setGeneratedLetter] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string>("");
  const [usageBlocked, setUsageBlocked] = useState(false);
  const [step, setStep] = useState(1);
  const [hostCountrySearch, setHostCountrySearch] = useState("");
  const [hostCountryDropdownOpen, setHostCountryDropdownOpen] = useState(false);
  const [destCountrySearch, setDestCountrySearch] = useState("");
  const [destCountryDropdownOpen, setDestCountryDropdownOpen] = useState(false);

  const t = {
    tr: {
      step1: "Davet Eden Bilgileri",
      step2: "Misafir Bilgileri",
      step3: "Ziyaret Detayları",
      step4: "Davet Mektubu",
      hostName: "Adınız Soyadınız",
      hostAddress: "Adresiniz",
      hostCity: "Şehir",
      hostPostalCode: "Posta Kodu",
      hostCountry: "Ülke",
      hostEmail: "E-posta (Opsiyonel)",
      hostPhone: "Telefon (Opsiyonel)",
      guestName: "Misafir Adı Soyadı",
      passportNumber: "Pasaport Numarası (Opsiyonel)",
      addGuest: "Misafir Ekle",
      removeGuest: "Kaldır",
      destinationCountry: "Hangi Ülkeye Davet Ediyorsunuz?",
      selectCountry: "Ülke Seçin",
      visitPurpose: "Ziyaret Amacı",
      customPurpose: "Ziyaret amacını açıklayın",
      startDate: "Başlangıç Tarihi",
      endDate: "Bitiş Tarihi",
      financialResponsibility: "Mali Sorumluluk",
      coverAccommodation: "Konaklama masraflarını karşılayacağım",
      coverTransportation: "Ulaşım masraflarını karşılayacağım",
      coverMeals: "Yemek masraflarını karşılayacağım",
      coverAllExpenses: "Tüm seyahat masraflarını karşılayacağım",
      relationship: "Misafirle İlişkiniz",
      customRelationship: "İlişkinizi açıklayın",
      next: "Devam",
      back: "Geri",
      generate: "Davet Mektubu Oluştur",
      generating: "Oluşturuluyor...",
      copy: "Kopyala",
      copied: "Kopyalandı!",
      download: "İndir",
      newLetter: "Yeni Mektup",
      error: "Bir hata oluştu. Lütfen tekrar deneyin.",
      usageBlocked: "Ücretsiz kullanım hakkınız dolmuştur. Daha fazla davet mektubu oluşturmak için lütfen üye olun.",
      register: "Üye Ol",
      requiredField: "Bu alan zorunludur",
      invalidDate: "Geçersiz tarih",
      endDateBeforeStart: "Bitiş tarihi başlangıç tarihinden önce olamaz",
      generatedLetter: "Oluşturulan Davet Mektubu",
      editAndDownload: "Davet mektubunuzu inceleyip düzenleyebilir, ardından indirebilirsiniz.",
      outputLanguage: "Mektup Dili",
      selectLanguage: "Dil Seçin",
      kvkkTitle: "KVKK Onayı",
      kvkkText: "Girdiğim bilgilerin davet mektubu oluşturmak için kullanılacağını ve Kolay Seyahat'in bu bilgileri kaydetmediğini, sadece kullanım istatistiklerini raporlama amacıyla tuttuğunu kabul ediyorum.",
      usageInfoTitle: "Ücretsiz Kullanım",
      usageInfoText: "Üye olmadan sadece 1 adet davet mektubu oluşturabilirsiniz. Sınırsız kullanım için üye olun.",
      privacyNote: "Kolay Seyahat, girdiğiniz kişisel verileri kaydetmez. Sadece kullanım istatistiklerini raporlama amacıyla tutar.",
      applyVisa: "Vize Başvurusu Yap",
      applyVisaDesc: "için profesyonel vize danışmanlığı hizmeti alın.",
      websiteLink: "Bu davet mektubu https://www.kolayseyahat.net aracılığıyla oluşturulmuştur.",
    },
    en: {
      step1: "Host Information",
      step2: "Guest Information",
      step3: "Visit Details",
      step4: "Generate Letter",
      hostName: "Your Full Name",
      hostAddress: "Your Address",
      hostCity: "City",
      hostPostalCode: "Postal Code",
      hostCountry: "Country",
      hostEmail: "Email (Optional)",
      hostPhone: "Phone (Optional)",
      guestName: "Guest Full Name",
      passportNumber: "Passport Number (Optional)",
      addGuest: "Add Guest",
      removeGuest: "Remove",
      destinationCountry: "Which Country Are You Inviting To?",
      selectCountry: "Select Country",
      visitPurpose: "Purpose of Visit",
      customPurpose: "Describe the purpose of visit",
      startDate: "Start Date",
      endDate: "End Date",
      financialResponsibility: "Financial Responsibility",
      coverAccommodation: "I will cover accommodation expenses",
      coverTransportation: "I will cover transportation expenses",
      coverMeals: "I will cover meal expenses",
      coverAllExpenses: "I will cover all travel expenses",
      relationship: "Your Relationship with Guest",
      customRelationship: "Describe your relationship",
      next: "Continue",
      back: "Back",
      generate: "Generate Letter",
      generating: "Generating...",
      copy: "Copy",
      copied: "Copied!",
      download: "Download",
      newLetter: "New Letter",
      error: "An error occurred. Please try again.",
      usageBlocked: "Your free usage has been exhausted. Please register to create more invitation letters.",
      register: "Register",
      requiredField: "This field is required",
      invalidDate: "Invalid date",
      endDateBeforeStart: "End date cannot be before start date",
      generatedLetter: "Generated Letter",
      editAndDownload: "Review and edit your letter, then download it.",
      outputLanguage: "Letter Language",
      selectLanguage: "Select Language",
      kvkkTitle: "Privacy Consent",
      kvkkText: "I acknowledge that the information I provide will be used to generate an invitation letter and that Kolay Seyahat does not store this data, only keeping usage statistics for reporting purposes.",
      usageInfoTitle: "Free Usage",
      usageInfoText: "You can create only 1 invitation letter without registering. Register for unlimited letters.",
      privacyNote: "Kolay Seyahat does not store your personal data. Only usage statistics are kept for reporting purposes.",
      applyVisa: "Apply for Visa",
      applyVisaDesc: "Get professional visa consultancy service for",
      websiteLink: "This invitation letter was generated via https://www.kolayseyahat.net",
    },
  }[locale];

  // Load countries
  useEffect(() => {
    getCountries().then((data) => {
      setCountries(data);
    });
  }, []);

  // Check usage limit
  useEffect(() => {
    const checkUsage = async () => {
      try {
        const response = await fetch("/api/invitation/check-usage");
        const data = await response.json();
        if (data.blocked) {
          setUsageBlocked(true);
        }
      } catch (err) {
        console.error("Usage check error:", err);
      }
    };
    checkUsage();
  }, []);

  const updateFormData = (field: keyof FormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const addGuest = () => {
    const newGuest: Guest = {
      id: Date.now().toString(),
      fullName: "",
      passportNumber: "",
    };
    setFormData((prev) => ({
      ...prev,
      guests: [...prev.guests, newGuest],
    }));
  };

  const removeGuest = (id: string) => {
    if (formData.guests.length > 1) {
      setFormData((prev) => ({
        ...prev,
        guests: prev.guests.filter((g) => g.id !== id),
      }));
    }
  };

  const updateGuest = (id: string, field: keyof Guest, value: string) => {
    setFormData((prev) => ({
      ...prev,
      guests: prev.guests.map((g) =>
        g.id === id ? { ...g, [field]: value } : g
      ),
    }));
  };

  const validateStep = (stepNum: number): boolean => {
    switch (stepNum) {
      case 1:
        return !!(
          formData.hostName.trim() &&
          formData.hostAddress.trim() &&
          formData.hostCity.trim() &&
          formData.hostCountryId &&
          formData.kvkkAccepted
        );
      case 2:
        return formData.guests.every((g) => g.fullName.trim());
      case 3:
        if (!formData.destinationCountry || !formData.startDate || !formData.endDate || !formData.outputLanguage) {
          return false;
        }
        if (new Date(formData.endDate) < new Date(formData.startDate)) {
          return false;
        }
        if (formData.visitPurpose === "other" && !formData.customPurpose.trim()) {
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep((prev) => Math.min(prev + 1, 4));
      setError("");
    } else {
      setError(t.requiredField);
    }
  };

  const handleBack = () => {
    setStep((prev) => Math.max(prev - 1, 1));
    setError("");
  };

  const handleGenerate = async () => {
    if (usageBlocked) {
      return;
    }

    if (!validateStep(3)) {
      setError(t.requiredField);
      return;
    }

    setGenerating(true);
    setError("");

    try {
      const response = await fetch("/api/invitation/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          locale,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.blocked) {
          setUsageBlocked(true);
          setError(t.usageBlocked);
        } else {
          throw new Error(data.error || "Generation failed");
        }
        return;
      }

      setGeneratedLetter(data.letter);
      setStep(4);
    } catch (err) {
      console.error("Generation error:", err);
      setError(t.error);
    } finally {
      setGenerating(false);
    }
  };

  const handleCopy = async () => {
    try {
      const textWithLink = `${generatedLetter}\n\n---\n${t.websiteLink}`;
      await navigator.clipboard.writeText(textWithLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Copy error:", err);
    }
  };

  const handleDownload = () => {
    const textWithLink = `${generatedLetter}\n\n---\n${t.websiteLink}`;
    const blob = new Blob([textWithLink], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `invitation-letter-${new Date().toISOString().split("T")[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleNewLetter = () => {
    setFormData(initialFormData);
    setGeneratedLetter("");
    setStep(1);
    setError("");
  };

  // Step indicators
  const steps = [
    { num: 1, label: t.step1 },
    { num: 2, label: t.step2 },
    { num: 3, label: t.step3 },
    { num: 4, label: t.step4 },
  ];

  if (usageBlocked && step !== 4) {
    return (
      <div className="card text-center">
        <AlertCircle className="mx-auto h-16 w-16 text-orange-500" />
        <h3 className="mt-4 text-xl font-bold text-slate-900">{t.usageBlocked}</h3>
        <a
          href={`/${locale}/kayit`}
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 font-semibold text-white hover:bg-primary-dark"
        >
          <User className="h-5 w-5" />
          {t.register}
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Step Indicator */}
      <div className="flex items-center justify-between">
        {steps.map((s, idx) => (
          <div key={s.num} className="flex items-center">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold ${
                step >= s.num
                  ? "bg-primary text-white"
                  : "bg-slate-200 text-slate-500"
              }`}
            >
              {s.num}
            </div>
            <span
              className={`ml-2 hidden text-sm font-medium md:inline ${
                step >= s.num ? "text-primary" : "text-slate-500"
              }`}
            >
              {s.label}
            </span>
            {idx < steps.length - 1 && (
              <div
                className={`mx-2 h-1 w-8 rounded md:w-16 ${
                  step > s.num ? "bg-primary" : "bg-slate-200"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-5 w-5" />
          {error}
        </div>
      )}

      {/* Step 1: Host Information */}
      {step === 1 && (
        <div className="card space-y-6">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <User className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">{t.step1}</h2>
              <p className="text-sm text-slate-600">
                {locale === "en"
                  ? "Enter your information as the host"
                  : "Davet eden olarak bilgilerinizi girin"}
              </p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-medium text-slate-700">
                {t.hostName} *
              </label>
              <input
                type="text"
                value={formData.hostName}
                onChange={(e) => updateFormData("hostName", e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-4 py-3 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="John Doe"
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-medium text-slate-700">
                {t.hostAddress} *
              </label>
              <input
                type="text"
                value={formData.hostAddress}
                onChange={(e) => updateFormData("hostAddress", e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-4 py-3 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="123 Main Street, Apt 4B"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                {t.hostCity} *
              </label>
              <input
                type="text"
                value={formData.hostCity}
                onChange={(e) => updateFormData("hostCity", e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-4 py-3 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="London"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                {t.hostPostalCode}
              </label>
              <input
                type="text"
                value={formData.hostPostalCode}
                onChange={(e) => updateFormData("hostPostalCode", e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-4 py-3 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="SW1A 1AA"
              />
            </div>

            {/* Host Country - Searchable Select */}
            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-medium text-slate-700">
                {t.hostCountry} *
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={hostCountrySearch || formData.hostCountryName}
                  onChange={(e) => {
                    setHostCountrySearch(e.target.value);
                    setHostCountryDropdownOpen(true);
                  }}
                  onFocus={() => setHostCountryDropdownOpen(true)}
                  className="w-full rounded-lg border border-slate-300 py-3 pl-10 pr-4 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder={locale === "en" ? "Search country..." : "Ülke ara..."}
                />
                {hostCountryDropdownOpen && (
                  <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-60 overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-lg">
                    {countries
                      .filter((c) =>
                        c.name.toLowerCase().includes((hostCountrySearch || "").toLowerCase())
                      )
                      .slice(0, 10)
                      .map((country) => (
                        <button
                          key={country.id}
                          type="button"
                          onClick={() => {
                            updateFormData("hostCountryId", country.id);
                            updateFormData("hostCountryName", country.name);
                            setHostCountrySearch("");
                            setHostCountryDropdownOpen(false);
                            // Auto-set destination country to same as host country
                            if (!formData.destinationCountry) {
                              updateFormData("destinationCountry", country.id);
                              updateFormData("destinationCountryName", country.name);
                            }
                          }}
                          className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm hover:bg-slate-50"
                        >
                          <Globe2 className="h-4 w-4 text-slate-400" />
                          {country.name}
                        </button>
                      ))}
                    {countries.filter((c) =>
                      c.name.toLowerCase().includes((hostCountrySearch || "").toLowerCase())
                    ).length === 0 && (
                      <div className="px-4 py-3 text-sm text-slate-500">
                        {locale === "en" ? "No country found" : "Ülke bulunamadı"}
                      </div>
                    )}
                  </div>
                )}
              </div>
              {formData.hostCountryName && (
                <p className="mt-1 text-xs text-green-600">
                  ✓ {formData.hostCountryName}
                </p>
              )}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                {t.hostEmail}
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  value={formData.hostEmail}
                  onChange={(e) => updateFormData("hostEmail", e.target.value)}
                  className="w-full rounded-lg border border-slate-300 py-3 pl-10 pr-4 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="john@example.com"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                {t.hostPhone}
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <input
                  type="tel"
                  value={formData.hostPhone}
                  onChange={(e) => updateFormData("hostPhone", e.target.value)}
                  className="w-full rounded-lg border border-slate-300 py-3 pl-10 pr-4 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="+44 20 1234 5678"
                />
              </div>
            </div>
          </div>

          {/* Usage Info Banner */}
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
            <div className="flex items-start gap-3">
              <Info className="mt-0.5 h-5 w-5 text-blue-600" />
              <div>
                <h4 className="font-semibold text-blue-900">{t.usageInfoTitle}</h4>
                <p className="mt-1 text-sm text-blue-700">{t.usageInfoText}</p>
              </div>
            </div>
          </div>

          {/* Privacy Note */}
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-start gap-3">
              <Shield className="mt-0.5 h-5 w-5 text-slate-500" />
              <p className="text-sm text-slate-600">{t.privacyNote}</p>
            </div>
          </div>

          {/* KVKK Consent */}
          <div className="rounded-lg border border-slate-200 p-4">
            <label className="flex cursor-pointer items-start gap-3">
              <input
                type="checkbox"
                checked={formData.kvkkAccepted}
                onChange={(e) => updateFormData("kvkkAccepted", e.target.checked)}
                className="mt-1 h-5 w-5 rounded border-slate-300 text-primary focus:ring-primary"
              />
              <div>
                <span className="font-semibold text-slate-900">{t.kvkkTitle}</span>
                <p className="mt-1 text-sm text-slate-600">{t.kvkkText}</p>
              </div>
            </label>
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleNext}
              disabled={!formData.kvkkAccepted}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 font-semibold text-white hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-50"
            >
              {t.next}
              <Plane className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Guest Information */}
      {step === 2 && (
        <div className="card space-y-6">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">{t.step2}</h2>
              <p className="text-sm text-slate-600">
                {locale === "en"
                  ? "Enter the information of the person(s) you are inviting"
                  : "Davet ettiğiniz kişi(ler)in bilgilerini girin"}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {formData.guests.map((guest, idx) => (
              <div
                key={guest.id}
                className="rounded-lg border border-slate-200 bg-slate-50 p-4"
              >
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-sm font-semibold text-slate-700">
                    {locale === "en" ? `Guest ${idx + 1}` : `Misafir ${idx + 1}`}
                  </span>
                  {formData.guests.length > 1 && (
                    <button
                      onClick={() => removeGuest(guest.id)}
                      className="flex items-center gap-1 text-sm text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                      {t.removeGuest}
                    </button>
                  )}
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">
                      {t.guestName} *
                    </label>
                    <input
                      type="text"
                      value={guest.fullName}
                      onChange={(e) =>
                        updateGuest(guest.id, "fullName", e.target.value)
                      }
                      className="w-full rounded-lg border border-slate-300 px-4 py-3 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                      placeholder="Ahmet Yılmaz"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">
                      {t.passportNumber}
                    </label>
                    <input
                      type="text"
                      value={guest.passportNumber}
                      onChange={(e) =>
                        updateGuest(guest.id, "passportNumber", e.target.value)
                      }
                      className="w-full rounded-lg border border-slate-300 px-4 py-3 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                      placeholder="U12345678"
                    />
                  </div>
                </div>
              </div>
            ))}

            <button
              onClick={addGuest}
              className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-slate-300 py-3 text-sm font-medium text-slate-600 hover:border-primary hover:text-primary"
            >
              <Plus className="h-5 w-5" />
              {t.addGuest}
            </button>
          </div>

          {/* Relationship */}
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              {t.relationship}
            </label>
            <select
              value={formData.relationship}
              onChange={(e) => updateFormData("relationship", e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-4 py-3 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              {relationships[locale].map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>

          {formData.relationship === "other" && (
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                {t.customRelationship}
              </label>
              <input
                type="text"
                value={formData.customRelationship}
                onChange={(e) =>
                  updateFormData("customRelationship", e.target.value)
                }
                className="w-full rounded-lg border border-slate-300 px-4 py-3 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          )}

          <div className="flex justify-between">
            <button
              onClick={handleBack}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-6 py-3 font-semibold text-slate-700 hover:bg-slate-50"
            >
              {t.back}
            </button>
            <button
              onClick={handleNext}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 font-semibold text-white hover:bg-primary-dark"
            >
              {t.next}
              <Plane className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Visit Details */}
      {step === 3 && (
        <div className="card space-y-6">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Calendar className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">{t.step3}</h2>
              <p className="text-sm text-slate-600">
                {locale === "en"
                  ? "Enter the visit details"
                  : "Ziyaret detaylarını girin"}
              </p>
            </div>
          </div>

          {/* Output Language */}
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              <Languages className="mr-2 inline h-4 w-4" />
              {t.outputLanguage} *
            </label>
            <div className="grid grid-cols-3 gap-2 md:grid-cols-4 lg:grid-cols-6">
              {outputLanguages.map((lang) => (
                <button
                  key={lang.value}
                  type="button"
                  onClick={() => updateFormData("outputLanguage", lang.value)}
                  className={`flex items-center justify-center gap-2 rounded-lg border-2 px-3 py-2 text-sm font-medium transition-all ${
                    formData.outputLanguage === lang.value
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  <span>{lang.flag}</span>
                  <span className="hidden md:inline">{lang.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Destination Country - Searchable */}
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              {t.destinationCountry} *
            </label>
            <p className="mb-2 text-xs text-slate-500">
              {locale === "en" 
                ? "Pre-filled from your country. You can change it if needed." 
                : "Ülkenizden otomatik dolduruldu. Gerekirse değiştirebilirsiniz."}
            </p>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={destCountrySearch || formData.destinationCountryName}
                onChange={(e) => {
                  setDestCountrySearch(e.target.value);
                  setDestCountryDropdownOpen(true);
                }}
                onFocus={() => setDestCountryDropdownOpen(true)}
                className="w-full rounded-lg border border-slate-300 py-3 pl-10 pr-4 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                placeholder={locale === "en" ? "Search country..." : "Ülke ara..."}
              />
              {destCountryDropdownOpen && (
                <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-60 overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-lg">
                  {countries
                    .filter((c) =>
                      c.name.toLowerCase().includes((destCountrySearch || "").toLowerCase())
                    )
                    .slice(0, 10)
                    .map((country) => (
                      <button
                        key={country.id}
                        type="button"
                        onClick={() => {
                          updateFormData("destinationCountry", country.id);
                          updateFormData("destinationCountryName", country.name);
                          setDestCountrySearch("");
                          setDestCountryDropdownOpen(false);
                        }}
                        className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm hover:bg-slate-50"
                      >
                        <Globe2 className="h-4 w-4 text-slate-400" />
                        {country.name}
                      </button>
                    ))}
                  {countries.filter((c) =>
                    c.name.toLowerCase().includes((destCountrySearch || "").toLowerCase())
                  ).length === 0 && (
                    <div className="px-4 py-3 text-sm text-slate-500">
                      {locale === "en" ? "No country found" : "Ülke bulunamadı"}
                    </div>
                  )}
                </div>
              )}
            </div>
            {formData.destinationCountryName && (
              <p className="mt-1 text-xs text-green-600">
                ✓ {formData.destinationCountryName}
              </p>
            )}
          </div>

          {/* Visit Purpose */}
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              {t.visitPurpose} *
            </label>
            <select
              value={formData.visitPurpose}
              onChange={(e) => updateFormData("visitPurpose", e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-4 py-3 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              {visitPurposes[locale].map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>

          {formData.visitPurpose === "other" && (
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                {t.customPurpose} *
              </label>
              <input
                type="text"
                value={formData.customPurpose}
                onChange={(e) => updateFormData("customPurpose", e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-4 py-3 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          )}

          {/* Dates */}
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                {t.startDate} *
              </label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => updateFormData("startDate", e.target.value)}
                min={new Date().toISOString().split("T")[0]}
                className="w-full rounded-lg border border-slate-300 px-4 py-3 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                {t.endDate} *
              </label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => updateFormData("endDate", e.target.value)}
                min={formData.startDate || new Date().toISOString().split("T")[0]}
                className="w-full rounded-lg border border-slate-300 px-4 py-3 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          {/* Financial Responsibility */}
          <div>
            <label className="mb-3 block text-sm font-medium text-slate-700">
              {t.financialResponsibility}
            </label>
            <div className="space-y-3">
              <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-200 p-3 hover:bg-slate-50">
                <input
                  type="checkbox"
                  checked={formData.coverAccommodation}
                  onChange={(e) =>
                    updateFormData("coverAccommodation", e.target.checked)
                  }
                  className="h-5 w-5 rounded border-slate-300 text-primary focus:ring-primary"
                />
                <Building className="h-5 w-5 text-slate-500" />
                <span className="text-sm text-slate-700">{t.coverAccommodation}</span>
              </label>

              <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-200 p-3 hover:bg-slate-50">
                <input
                  type="checkbox"
                  checked={formData.coverTransportation}
                  onChange={(e) =>
                    updateFormData("coverTransportation", e.target.checked)
                  }
                  className="h-5 w-5 rounded border-slate-300 text-primary focus:ring-primary"
                />
                <Plane className="h-5 w-5 text-slate-500" />
                <span className="text-sm text-slate-700">{t.coverTransportation}</span>
              </label>

              <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-200 p-3 hover:bg-slate-50">
                <input
                  type="checkbox"
                  checked={formData.coverMeals}
                  onChange={(e) =>
                    updateFormData("coverMeals", e.target.checked)
                  }
                  className="h-5 w-5 rounded border-slate-300 text-primary focus:ring-primary"
                />
                <CreditCard className="h-5 w-5 text-slate-500" />
                <span className="text-sm text-slate-700">{t.coverMeals}</span>
              </label>

              <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-primary/30 bg-primary/5 p-3 hover:bg-primary/10">
                <input
                  type="checkbox"
                  checked={formData.coverAllExpenses}
                  onChange={(e) =>
                    updateFormData("coverAllExpenses", e.target.checked)
                  }
                  className="h-5 w-5 rounded border-slate-300 text-primary focus:ring-primary"
                />
                <CreditCard className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium text-primary">
                  {t.coverAllExpenses}
                </span>
              </label>
            </div>
          </div>

          <div className="flex justify-between">
            <button
              onClick={handleBack}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-6 py-3 font-semibold text-slate-700 hover:bg-slate-50"
            >
              {t.back}
            </button>
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-primary to-blue-600 px-6 py-3 font-semibold text-white shadow-lg hover:from-primary-dark hover:to-blue-700 disabled:opacity-50"
            >
              {generating ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  {t.generating}
                </>
              ) : (
                <>
                  <FileText className="h-5 w-5" />
                  {t.generate}
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Generated Letter */}
      {step === 4 && generatedLetter && (
        <div className="card space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                <Check className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">{t.generatedLetter}</h2>
                <p className="text-sm text-slate-600">{t.editAndDownload}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleCopy}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4 text-green-600" />
                    {t.copied}
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    {t.copy}
                  </>
                )}
              </button>
              <button
                onClick={handleDownload}
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark"
              >
                <Download className="h-4 w-4" />
                {t.download}
              </button>
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-6">
            <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-slate-800">
              {generatedLetter}
            </pre>
            {/* Website Link Footer */}
            <div className="mt-6 border-t border-slate-200 pt-4 text-center text-xs text-slate-500">
              {t.websiteLink}
            </div>
          </div>

          {/* CTA - Apply for Visa */}
          {formData.destinationCountryName && (
            <div className="rounded-lg border-2 border-primary/30 bg-gradient-to-r from-primary/5 to-blue-50 p-6">
              <div className="flex flex-col items-center gap-4 text-center md:flex-row md:text-left">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                  <Globe2 className="h-7 w-7 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-slate-900">
                    {formData.destinationCountryName} {t.applyVisaDesc}
                  </h3>
                  <p className="mt-1 text-sm text-slate-600">
                    {locale === "en" 
                      ? "Get expert guidance for your visa application with 98% success rate."
                      : "%98 başarı oranı ile vize başvurunuz için uzman rehberliği alın."}
                  </p>
                </div>
                <Link
                  href={`/${locale}/${countries.find(c => c.id === formData.destinationCountry)?.slug || ""}`}
                  className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 font-semibold text-white shadow-lg transition-all hover:bg-primary-dark hover:shadow-xl"
                >
                  {t.applyVisa}
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </div>
            </div>
          )}

          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <button
              onClick={handleNewLetter}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-6 py-3 font-semibold text-slate-700 hover:bg-slate-50"
            >
              <Plus className="h-5 w-5" />
              {t.newLetter}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
