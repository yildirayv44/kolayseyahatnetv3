"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { 
  ChevronRight, 
  ChevronLeft, 
  Plus, 
  Trash2, 
  Copy, 
  Download, 
  Check, 
  Loader2,
  Info,
  Shield,
  Globe2,
  ArrowRight,
  Search,
  ChevronDown
} from "lucide-react";

interface TravelCompanion {
  fullName: string;
  relationship: string;
}

interface FormData {
  fullName: string;
  birthDate: string;
  nationality: string;
  passportNumber: string;
  passportIssueDate: string;
  passportExpiryDate: string;
  address: string;
  city: string;
  phone: string;
  email: string;
  employmentStatus: string;
  companyName: string;
  jobTitle: string;
  workAddress: string;
  monthlyIncome: string;
  yearsEmployed: string;
  destinationCountry: number;
  destinationCountryName: string;
  visaType: string;
  travelPurpose: string;
  customPurpose: string;
  startDate: string;
  endDate: string;
  previousVisits: string;
  accommodationType: string;
  accommodationAddress: string;
  accommodationName: string;
  travelingAlone: boolean;
  companions: TravelCompanion[];
  tripFinancing: string;
  bankBalance: string;
  hasReturnTicket: boolean;
  additionalInfo: string;
  outputLanguage: string;
  kvkkAccepted: boolean;
}

const initialFormData: FormData = {
  fullName: "",
  birthDate: "",
  nationality: "Türkiye",
  passportNumber: "",
  passportIssueDate: "",
  passportExpiryDate: "",
  address: "",
  city: "",
  phone: "",
  email: "",
  employmentStatus: "",
  companyName: "",
  jobTitle: "",
  workAddress: "",
  monthlyIncome: "",
  yearsEmployed: "",
  destinationCountry: 0,
  destinationCountryName: "",
  visaType: "tourist",
  travelPurpose: "",
  customPurpose: "",
  startDate: "",
  endDate: "",
  previousVisits: "",
  accommodationType: "",
  accommodationAddress: "",
  accommodationName: "",
  travelingAlone: true,
  companions: [],
  tripFinancing: "",
  bankBalance: "",
  hasReturnTicket: false,
  additionalInfo: "",
  outputLanguage: "tr",
  kvkkAccepted: false,
};

const outputLanguages = [
  { code: "tr", name: "Türkçe", flag: "🇹🇷" },
  { code: "en", name: "English", flag: "🇬🇧" },
  { code: "de", name: "Deutsch", flag: "🇩🇪" },
  { code: "fr", name: "Français", flag: "🇫🇷" },
  { code: "es", name: "Español", flag: "🇪🇸" },
  { code: "it", name: "Italiano", flag: "🇮🇹" },
  { code: "ru", name: "Русский", flag: "🇷🇺" },
  { code: "nl", name: "Nederlands", flag: "🇳🇱" },
];

interface Props {
  locale: "tr" | "en";
}

export function VizePetitionForm({ locale }: Props) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [countries, setCountries] = useState<Array<{ id: number; name: string; name_en: string; slug: string }>>([]);
  const [generating, setGenerating] = useState(false);
  const [generatedPetition, setGeneratedPetition] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [usageBlocked, setUsageBlocked] = useState(false);
  const [countrySearch, setCountrySearch] = useState("");
  const [countryDropdownOpen, setCountryDropdownOpen] = useState(false);
  const countryDropdownRef = useRef<HTMLDivElement>(null);

  const t = locale === "tr" ? {
    step1: "Kişisel Bilgiler", step2: "Çalışma Durumu", step3: "Seyahat Bilgileri", step4: "Konaklama & Finans", step5: "Dilekçe",
    fullName: "Ad Soyad", birthDate: "Doğum Tarihi", nationality: "Uyruk", passportNumber: "Pasaport No",
    passportIssueDate: "Pasaport Veriliş", passportExpiryDate: "Pasaport Geçerlilik", address: "Adres", city: "Şehir",
    phone: "Telefon", email: "E-posta", employmentStatus: "Çalışma Durumu",
    employmentOptions: { employed: "Çalışan", selfEmployed: "Serbest Meslek", student: "Öğrenci", retired: "Emekli", unemployed: "Çalışmıyor" },
    companyName: "Şirket Adı", jobTitle: "Pozisyon", workAddress: "İş Adresi", monthlyIncome: "Aylık Gelir", yearsEmployed: "Çalışma Süresi",
    destinationCountry: "Hedef Ülke", searchCountry: "Ülke ara...",
    visaType: "Vize Türü", visaTypes: { tourist: "Turist", business: "İş", student: "Öğrenci", family: "Aile Ziyareti", medical: "Sağlık" },
    travelPurpose: "Seyahat Amacı",
    purposeOptions: { tourism: "Turistik gezi", business: "İş görüşmesi", family: "Aile ziyareti", education: "Eğitim", medical: "Tedavi", conference: "Konferans", other: "Diğer" },
    customPurpose: "Amacı açıklayın", startDate: "Gidiş Tarihi", endDate: "Dönüş Tarihi",
    previousVisits: "Daha önce ziyaret?", previousVisitsOptions: { never: "Hayır", once: "1 kez", multiple: "Birden fazla" },
    accommodationType: "Konaklama Türü", accommodationOptions: { hotel: "Otel", hostel: "Hostel", airbnb: "Airbnb", family: "Aile Yanı" },
    accommodationName: "Konaklama Adı", accommodationAddress: "Konaklama Adresi",
    travelingAlone: "Yalnız seyahat?", yes: "Evet", no: "Hayır", companions: "Seyahat Arkadaşları",
    companionName: "Ad Soyad", companionRelation: "Yakınlık", addCompanion: "Kişi Ekle",
    relationOptions: { spouse: "Eş", child: "Çocuk", parent: "Anne/Baba", sibling: "Kardeş", friend: "Arkadaş", other: "Diğer" },
    tripFinancing: "Finansman", financingOptions: { self: "Kendim", company: "Şirket", sponsor: "Sponsor", family: "Aile" },
    bankBalance: "Banka Bakiyesi", hasReturnTicket: "Dönüş biletim var", additionalInfo: "Ek Bilgiler",
    outputLanguage: "Dilekçe Dili", next: "Devam", back: "Geri", generate: "Dilekçe Oluştur", generating: "Oluşturuluyor...",
    copy: "Kopyala", copied: "Kopyalandı!", download: "İndir", newPetition: "Yeni Dilekçe",
    error: "Bir hata oluştu.", usageBlocked: "Kullanım hakkınız doldu.", register: "Üye Ol", requiredField: "Zorunlu alan",
    generatedPetition: "Oluşturulan Dilekçe", editAndDownload: "İnceleyip indirebilirsiniz.",
    kvkkTitle: "KVKK Onayı", kvkkText: "Bilgilerimin dilekçe için kullanılacağını kabul ediyorum.",
    usageInfoTitle: "Ücretsiz Kullanım", usageInfoText: "Üye olmadan 1 dilekçe oluşturabilirsiniz.",
    privacyNote: "Kişisel verileriniz kaydedilmez.", applyVisa: "Vize Başvurusu Yap", applyVisaDesc: "için danışmanlık alın.",
    websiteLink: "Bu dilekçe kolayseyahat.net ile oluşturuldu.",
    birthDateHelper: "Pasaportunuzdaki doğum tarihiniz",
    passportIssueHelper: "Pasaportunuzun verildiği tarih",
    passportExpiryHelper: "Pasaportunuzun son geçerlilik tarihi",
    addressHelper: "Türkiye'deki ikamet adresiniz",
    employmentHelper: "Mevcut çalışma durumunuzu seçin. Bu bilgi ülkenize bağlılığınızı gösterir.",
    incomeHelper: "Aylık net geliriniz (TL veya döviz)",
    destinationHelper: "Vize başvurusu yapacağınız ülkeyi seçin",
    purposeHelper: "Seyahat amacınızı seçin. Bu dilekçenin ana konusunu belirler.",
    travelDatesHelper: "Planlanan seyahat tarihleriniz",
    accommodationHelper: "Nerede kalacağınızı belirtin",
    financingHelper: "Seyahat masraflarını kim karşılayacak?",
    bankBalanceHelper: "Yaklaşık banka bakiyeniz (örn: 50.000 TL)",
    additionalInfoHelper: "Vize memuruna iletmek istediğiniz ek bilgiler",
    outputLanguageHelper: "Dilekçenin yazılacağı dili seçin. Genellikle hedef ülkenin dili veya İngilizce tercih edilir.",
    disclaimer: "⚠️ Sorumluluk Reddi: Bu araç yalnızca yardımcı amaçlıdır. Oluşturulan dilekçe bir taslaktır ve vize onayını garanti etmez. Kolay Seyahat, dilekçe içeriğinden veya vize başvuru sonuçlarından hiçbir şekilde sorumlu tutulamaz. Lütfen dilekçeyi göndermeden önce dikkatlice kontrol edin ve gerekirse profesyonel danışmanlık alın.",
  } : {
    step1: "Personal Info", step2: "Employment", step3: "Travel Info", step4: "Accommodation", step5: "Letter",
    fullName: "Full Name", birthDate: "Birth Date", nationality: "Nationality", passportNumber: "Passport No",
    passportIssueDate: "Issue Date", passportExpiryDate: "Expiry Date", address: "Address", city: "City",
    phone: "Phone", email: "Email", employmentStatus: "Employment",
    employmentOptions: { employed: "Employed", selfEmployed: "Self-Employed", student: "Student", retired: "Retired", unemployed: "Unemployed" },
    companyName: "Company", jobTitle: "Position", workAddress: "Work Address", monthlyIncome: "Income", yearsEmployed: "Years",
    destinationCountry: "Destination", searchCountry: "Search...",
    visaType: "Visa Type", visaTypes: { tourist: "Tourist", business: "Business", student: "Student", family: "Family", medical: "Medical" },
    travelPurpose: "Purpose",
    purposeOptions: { tourism: "Tourism", business: "Business", family: "Family visit", education: "Education", medical: "Medical", conference: "Conference", other: "Other" },
    customPurpose: "Describe purpose", startDate: "Departure", endDate: "Return",
    previousVisits: "Previous visits?", previousVisitsOptions: { never: "No", once: "Once", multiple: "Multiple" },
    accommodationType: "Accommodation", accommodationOptions: { hotel: "Hotel", hostel: "Hostel", airbnb: "Airbnb", family: "Family" },
    accommodationName: "Name", accommodationAddress: "Address",
    travelingAlone: "Traveling alone?", yes: "Yes", no: "No", companions: "Companions",
    companionName: "Name", companionRelation: "Relation", addCompanion: "Add",
    relationOptions: { spouse: "Spouse", child: "Child", parent: "Parent", sibling: "Sibling", friend: "Friend", other: "Other" },
    tripFinancing: "Financing", financingOptions: { self: "Self", company: "Company", sponsor: "Sponsor", family: "Family" },
    bankBalance: "Bank Balance", hasReturnTicket: "Have return ticket", additionalInfo: "Additional Info",
    outputLanguage: "Language", next: "Next", back: "Back", generate: "Generate", generating: "Generating...",
    copy: "Copy", copied: "Copied!", download: "Download", newPetition: "New Letter",
    error: "Error occurred.", usageBlocked: "Limit reached.", register: "Register", requiredField: "Required",
    generatedPetition: "Generated Letter", editAndDownload: "Review and download.",
    kvkkTitle: "Privacy", kvkkText: "I accept the terms.",
    usageInfoTitle: "Free Usage", usageInfoText: "1 free letter without registration.",
    privacyNote: "Data not stored.", applyVisa: "Apply for Visa", applyVisaDesc: "Get consultancy.",
    websiteLink: "Generated via kolayseyahat.net",
    birthDateHelper: "Your date of birth as shown on passport",
    passportIssueHelper: "Date your passport was issued",
    passportExpiryHelper: "Passport expiration date",
    addressHelper: "Your residential address in your home country",
    employmentHelper: "Select your current employment status. This shows your ties to your home country.",
    incomeHelper: "Your monthly net income",
    destinationHelper: "Select the country you're applying visa for",
    purposeHelper: "Select your travel purpose. This determines the main topic of your letter.",
    travelDatesHelper: "Your planned travel dates",
    accommodationHelper: "Where will you be staying?",
    financingHelper: "Who will cover the travel expenses?",
    bankBalanceHelper: "Approximate bank balance (e.g., $5,000)",
    additionalInfoHelper: "Any additional information for the visa officer",
    outputLanguageHelper: "Select the language for your letter. Usually the destination country's language or English is preferred.",
    disclaimer: "⚠️ Disclaimer: This tool is for assistance only. The generated letter is a draft and does not guarantee visa approval. Kolay Seyahat is not responsible for the letter content or visa application outcomes. Please review carefully before submission and seek professional advice if needed.",
  };

  useEffect(() => {
    fetch("/api/countries").then(r => r.json()).then(d => setCountries(d.countries || [])).catch(() => {});
    fetch("/api/petition/check-usage").then(r => r.json()).then(d => setUsageBlocked(d.blocked)).catch(() => {});
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (countryDropdownRef.current && !countryDropdownRef.current.contains(e.target as Node)) setCountryDropdownOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const updateFormData = (field: keyof FormData, value: unknown) => setFormData(p => ({ ...p, [field]: value }));
  const addCompanion = () => setFormData(p => ({ ...p, companions: [...p.companions, { fullName: "", relationship: "" }] }));
  const removeCompanion = (i: number) => setFormData(p => ({ ...p, companions: p.companions.filter((_, idx) => idx !== i) }));
  const updateCompanion = (i: number, f: keyof TravelCompanion, v: string) => setFormData(p => ({ ...p, companions: p.companions.map((c, idx) => idx === i ? { ...c, [f]: v } : c) }));

  const validateStep = (s: number) => {
    if (s === 1) return !!(formData.fullName && formData.birthDate && formData.passportNumber && formData.address && formData.kvkkAccepted);
    if (s === 2) return !!formData.employmentStatus;
    if (s === 3) return !!(formData.destinationCountry && formData.travelPurpose && formData.startDate && formData.endDate);
    if (s === 4) return !!(formData.accommodationType && formData.tripFinancing);
    return true;
  };

  const handleNext = () => { if (validateStep(step)) { setStep(p => Math.min(p + 1, 5)); setError(""); } else setError(t.requiredField); };
  const handleBack = () => { setStep(p => Math.max(p - 1, 1)); setError(""); };

  const handleGenerate = async () => {
    if (usageBlocked) return;
    setGenerating(true); setError("");
    try {
      const res = await fetch("/api/petition/generate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...formData, locale }) });
      const data = await res.json();
      if (data.blocked) { setUsageBlocked(true); setError(t.usageBlocked); return; }
      if (data.error) { setError(data.error); return; }
      setGeneratedPetition(data.letter); setStep(5);
    } catch { setError(t.error); } finally { setGenerating(false); }
  };

  const handleCopy = async () => { await navigator.clipboard.writeText(`${generatedPetition}\n\n---\n${t.websiteLink}`); setCopied(true); setTimeout(() => setCopied(false), 2000); };
  const handleDownload = () => { const b = new Blob([`${generatedPetition}\n\n---\n${t.websiteLink}`], { type: "text/plain" }); const a = document.createElement("a"); a.href = URL.createObjectURL(b); a.download = `visa-letter-${new Date().toISOString().split("T")[0]}.txt`; a.click(); };
  const handleNew = () => { setFormData(initialFormData); setGeneratedPetition(""); setStep(1); };

  const filteredCountries = countries.filter(c => (locale === "en" ? c.name_en : c.name)?.toLowerCase().includes(countrySearch.toLowerCase()));
  const steps = [t.step1, t.step2, t.step3, t.step4, t.step5];

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-lg md:p-8">
      <div className="mb-8 flex items-center justify-between">
        {steps.map((label, idx) => (
          <div key={idx} className="flex flex-1 items-center">
            <div className="flex flex-col items-center">
              <div className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold ${step > idx + 1 ? "bg-green-500 text-white" : step === idx + 1 ? "bg-primary text-white" : "bg-slate-200 text-slate-500"}`}>
                {step > idx + 1 ? <Check className="h-5 w-5" /> : idx + 1}
              </div>
              <span className="mt-1 hidden text-xs text-slate-600 md:block">{label}</span>
            </div>
            {idx < steps.length - 1 && <div className={`mx-2 h-1 flex-1 rounded ${step > idx + 1 ? "bg-green-500" : "bg-slate-200"}`} />}
          </div>
        ))}
      </div>

      {error && <div className="mb-6 rounded-lg bg-red-50 p-4 text-sm text-red-600">{error}</div>}

      {step === 1 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold">{t.step1}</h2>
          <div className="rounded-lg bg-blue-50 p-3 text-sm"><Info className="inline h-4 w-4 mr-2" />{t.usageInfoText}</div>
          <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-sm text-amber-800">{t.disclaimer}</div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">{t.fullName} *</label>
              <input placeholder={t.fullName} value={formData.fullName} onChange={e => updateFormData("fullName", e.target.value)} className="w-full rounded-lg border px-4 py-2.5" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">{t.birthDate} *</label>
              <input type="date" value={formData.birthDate} onChange={e => updateFormData("birthDate", e.target.value)} className="w-full rounded-lg border px-4 py-2.5" />
              <p className="text-xs text-slate-500 mt-1">{t.birthDateHelper}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">{t.passportNumber} *</label>
              <input placeholder={t.passportNumber} value={formData.passportNumber} onChange={e => updateFormData("passportNumber", e.target.value)} className="w-full rounded-lg border px-4 py-2.5" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">{t.nationality}</label>
              <input placeholder={t.nationality} value={formData.nationality} onChange={e => updateFormData("nationality", e.target.value)} className="w-full rounded-lg border px-4 py-2.5" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">{t.address} *</label>
            <input placeholder={t.address} value={formData.address} onChange={e => updateFormData("address", e.target.value)} className="w-full rounded-lg border px-4 py-2.5" />
            <p className="text-xs text-slate-500 mt-1">{t.addressHelper}</p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <input placeholder={t.city} value={formData.city} onChange={e => updateFormData("city", e.target.value)} className="rounded-lg border px-4 py-2.5" />
            <input placeholder={t.phone} value={formData.phone} onChange={e => updateFormData("phone", e.target.value)} className="rounded-lg border px-4 py-2.5" />
            <input placeholder={t.email} value={formData.email} onChange={e => updateFormData("email", e.target.value)} className="rounded-lg border px-4 py-2.5" />
          </div>
          <label className="flex items-start gap-2 rounded-lg bg-amber-50 p-3 cursor-pointer">
            <input type="checkbox" checked={formData.kvkkAccepted} onChange={e => updateFormData("kvkkAccepted", e.target.checked)} className="mt-1" />
            <span className="text-sm"><strong>{t.kvkkTitle}:</strong> {t.kvkkText}</span>
          </label>
          <div className="flex justify-end"><button onClick={handleNext} disabled={!validateStep(1)} className="bg-primary text-white px-6 py-3 rounded-lg disabled:opacity-50">{t.next} <ChevronRight className="inline h-5 w-5" /></button></div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold">{t.step2}</h2>
          <p className="text-sm text-slate-600">{t.employmentHelper}</p>
          <div className="grid gap-2 md:grid-cols-3">
            {Object.entries(t.employmentOptions).map(([k, v]) => (
              <label key={k} className={`flex items-center gap-2 rounded-lg border p-3 cursor-pointer ${formData.employmentStatus === k ? "border-primary bg-primary/5" : ""}`}>
                <input type="radio" checked={formData.employmentStatus === k} onChange={() => updateFormData("employmentStatus", k)} /> {v}
              </label>
            ))}
          </div>
          {(formData.employmentStatus === "employed" || formData.employmentStatus === "selfEmployed") && (
            <div className="grid gap-4 md:grid-cols-2 bg-slate-50 p-4 rounded-lg">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">{t.companyName}</label>
                <input placeholder={t.companyName} value={formData.companyName} onChange={e => updateFormData("companyName", e.target.value)} className="w-full rounded-lg border px-4 py-2.5" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">{t.jobTitle}</label>
                <input placeholder={t.jobTitle} value={formData.jobTitle} onChange={e => updateFormData("jobTitle", e.target.value)} className="w-full rounded-lg border px-4 py-2.5" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">{t.monthlyIncome}</label>
                <input placeholder={t.monthlyIncome} value={formData.monthlyIncome} onChange={e => updateFormData("monthlyIncome", e.target.value)} className="w-full rounded-lg border px-4 py-2.5" />
                <p className="text-xs text-slate-500 mt-1">{t.incomeHelper}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">{t.yearsEmployed}</label>
                <input placeholder={t.yearsEmployed} value={formData.yearsEmployed} onChange={e => updateFormData("yearsEmployed", e.target.value)} className="w-full rounded-lg border px-4 py-2.5" />
              </div>
            </div>
          )}
          <div className="flex justify-between">
            <button onClick={handleBack} className="border px-6 py-3 rounded-lg"><ChevronLeft className="inline h-5 w-5" /> {t.back}</button>
            <button onClick={handleNext} disabled={!validateStep(2)} className="bg-primary text-white px-6 py-3 rounded-lg disabled:opacity-50">{t.next} <ChevronRight className="inline h-5 w-5" /></button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold">{t.step3}</h2>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">{t.destinationCountry} *</label>
            <p className="text-xs text-slate-500 mb-2">{t.destinationHelper}</p>
          </div>
          <div ref={countryDropdownRef} className="relative">
            <div className="flex items-center border rounded-lg px-4 py-2.5 cursor-pointer" onClick={() => setCountryDropdownOpen(!countryDropdownOpen)}>
              <Search className="h-4 w-4 mr-2 text-slate-400" />
              <input value={countryDropdownOpen ? countrySearch : formData.destinationCountryName} onChange={e => { setCountrySearch(e.target.value); setCountryDropdownOpen(true); }} onFocus={() => setCountryDropdownOpen(true)} placeholder={t.searchCountry} className="flex-1 outline-none" />
              <ChevronDown className={`h-5 w-5 ${countryDropdownOpen ? "rotate-180" : ""}`} />
            </div>
            {countryDropdownOpen && (
              <div className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-lg border bg-white shadow-lg">
                {filteredCountries.map(c => (
                  <div key={c.id} className="px-4 py-2 hover:bg-slate-100 cursor-pointer" onClick={() => { updateFormData("destinationCountry", c.id); updateFormData("destinationCountryName", locale === "en" ? c.name_en : c.name); setCountryDropdownOpen(false); setCountrySearch(""); }}>
                    {locale === "en" ? c.name_en : c.name}
                  </div>
                ))}
              </div>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">{t.travelPurpose} *</label>
            <p className="text-xs text-slate-500 mb-2">{t.purposeHelper}</p>
          </div>
          <div className="grid gap-2 md:grid-cols-3">
            {Object.entries(t.purposeOptions).map(([k, v]) => (
              <label key={k} className={`flex items-center gap-2 rounded-lg border p-3 cursor-pointer ${formData.travelPurpose === k ? "border-primary bg-primary/5" : ""}`}>
                <input type="radio" checked={formData.travelPurpose === k} onChange={() => updateFormData("travelPurpose", k)} /> {v}
              </label>
            ))}
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-2">{t.travelDatesHelper}</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div><label className="text-sm font-medium text-slate-700">{t.startDate} *</label><input type="date" value={formData.startDate} onChange={e => updateFormData("startDate", e.target.value)} className="w-full rounded-lg border px-4 py-2.5 mt-1" /></div>
            <div><label className="text-sm font-medium text-slate-700">{t.endDate} *</label><input type="date" value={formData.endDate} onChange={e => updateFormData("endDate", e.target.value)} className="w-full rounded-lg border px-4 py-2.5 mt-1" /></div>
          </div>
          <div className="flex justify-between">
            <button onClick={handleBack} className="border px-6 py-3 rounded-lg"><ChevronLeft className="inline h-5 w-5" /> {t.back}</button>
            <button onClick={handleNext} disabled={!validateStep(3)} className="bg-primary text-white px-6 py-3 rounded-lg disabled:opacity-50">{t.next} <ChevronRight className="inline h-5 w-5" /></button>
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold">{t.step4}</h2>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">{t.accommodationType} *</label>
            <p className="text-xs text-slate-500 mb-2">{t.accommodationHelper}</p>
          </div>
          <div className="grid gap-2 md:grid-cols-4">
            {Object.entries(t.accommodationOptions).map(([k, v]) => (
              <label key={k} className={`flex items-center gap-2 rounded-lg border p-3 cursor-pointer ${formData.accommodationType === k ? "border-primary bg-primary/5" : ""}`}>
                <input type="radio" checked={formData.accommodationType === k} onChange={() => updateFormData("accommodationType", k)} /> {v}
              </label>
            ))}
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <input placeholder={t.accommodationName} value={formData.accommodationName} onChange={e => updateFormData("accommodationName", e.target.value)} className="rounded-lg border px-4 py-2.5" />
            <input placeholder={t.accommodationAddress} value={formData.accommodationAddress} onChange={e => updateFormData("accommodationAddress", e.target.value)} className="rounded-lg border px-4 py-2.5" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">{t.tripFinancing} *</label>
            <p className="text-xs text-slate-500 mb-2">{t.financingHelper}</p>
          </div>
          <div className="grid gap-2 md:grid-cols-4">
            {Object.entries(t.financingOptions).map(([k, v]) => (
              <label key={k} className={`flex items-center gap-2 rounded-lg border p-3 cursor-pointer ${formData.tripFinancing === k ? "border-primary bg-primary/5" : ""}`}>
                <input type="radio" checked={formData.tripFinancing === k} onChange={() => updateFormData("tripFinancing", k)} /> {v}
              </label>
            ))}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">{t.bankBalance}</label>
            <input placeholder={t.bankBalance} value={formData.bankBalance} onChange={e => updateFormData("bankBalance", e.target.value)} className="w-full rounded-lg border px-4 py-2.5" />
            <p className="text-xs text-slate-500 mt-1">{t.bankBalanceHelper}</p>
          </div>
          <label className="flex items-center gap-2"><input type="checkbox" checked={formData.hasReturnTicket} onChange={e => updateFormData("hasReturnTicket", e.target.checked)} /> {t.hasReturnTicket}</label>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">{t.outputLanguage}</label>
            <p className="text-xs text-slate-500 mb-2">{t.outputLanguageHelper}</p>
            <div className="flex flex-wrap gap-2">
              {outputLanguages.map(l => (
                <button key={l.code} onClick={() => updateFormData("outputLanguage", l.code)} className={`px-3 py-2 rounded-lg border ${formData.outputLanguage === l.code ? "border-primary bg-primary/10" : ""}`}>{l.flag} {l.name}</button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">{t.additionalInfo}</label>
            <textarea placeholder={t.additionalInfo} value={formData.additionalInfo} onChange={e => updateFormData("additionalInfo", e.target.value)} rows={3} className="w-full rounded-lg border px-4 py-2.5" />
            <p className="text-xs text-slate-500 mt-1">{t.additionalInfoHelper}</p>
          </div>
          <div className="flex justify-between">
            <button onClick={handleBack} className="border px-6 py-3 rounded-lg"><ChevronLeft className="inline h-5 w-5" /> {t.back}</button>
            <button onClick={handleGenerate} disabled={generating || !validateStep(4)} className="bg-primary text-white px-6 py-3 rounded-lg disabled:opacity-50">
              {generating ? <><Loader2 className="inline h-5 w-5 animate-spin mr-2" />{t.generating}</> : t.generate}
            </button>
          </div>
        </div>
      )}

      {step === 5 && generatedPetition && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">{t.generatedPetition}</h2>
            <div className="flex gap-2">
              <button onClick={handleCopy} className="flex items-center gap-2 border px-4 py-2 rounded-lg">{copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />} {copied ? t.copied : t.copy}</button>
              <button onClick={handleDownload} className="flex items-center gap-2 border px-4 py-2 rounded-lg"><Download className="h-4 w-4" /> {t.download}</button>
            </div>
          </div>
          <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-sm text-amber-800">{t.disclaimer}</div>
          <div className="rounded-lg border bg-white p-6"><pre className="whitespace-pre-wrap font-sans text-sm">{generatedPetition}</pre></div>
          {formData.destinationCountryName && (
            <div className="rounded-lg border-2 border-primary/30 bg-gradient-to-r from-primary/5 to-blue-50 p-6">
              <div className="flex flex-col md:flex-row items-center gap-4">
                <Globe2 className="h-10 w-10 text-primary" />
                <div className="flex-1 text-center md:text-left">
                  <h3 className="font-bold">{formData.destinationCountryName} {t.applyVisaDesc}</h3>
                </div>
                <Link href={`/${locale}/${countries.find(c => c.id === formData.destinationCountry)?.slug || ""}`} className="bg-primary text-white px-6 py-3 rounded-lg flex items-center gap-2">
                  {t.applyVisa} <ArrowRight className="h-5 w-5" />
                </Link>
              </div>
            </div>
          )}
          <div className="flex justify-center"><button onClick={handleNew} className="border px-6 py-3 rounded-lg"><Plus className="inline h-5 w-5 mr-2" />{t.newPetition}</button></div>
        </div>
      )}
    </div>
  );
}
