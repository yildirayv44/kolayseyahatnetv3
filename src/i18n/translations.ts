export const translations = {
  tr: {
    // Common
    readMore: "Devamını Oku",
    learnMore: "Daha Fazla Bilgi",
    apply: "Başvur",
    contact: "İletişim",
    submit: "Gönder",
    cancel: "İptal",
    save: "Kaydet",
    delete: "Sil",
    edit: "Düzenle",
    search: "Ara",
    filter: "Filtrele",
    loading: "Yükleniyor...",
    noResults: "Sonuç bulunamadı",
    
    // Navigation
    home: "Ana Sayfa",
    countries: "Ülkeler",
    visaPackages: "Vize Paketleri",
    blog: "Blog",
    about: "Hakkımızda",
    faq: "Sıkça Sorulan Sorular",
    
    // Country Page
    visaInfo: "Vize Bilgileri",
    requiredDocuments: "Gerekli Belgeler",
    applicationProcess: "Başvuru Süreci",
    processingTime: "İşlem Süreci",
    visaFee: "Vize Ücreti",
    askQuestion: "Soru Sor",
    questionsFromUsers: "Sizden gelen sorular",
    yourQuestion: "Sorunuz",
    yourName: "Adınız",
    yourEmail: "E-posta Adresiniz",
    yourPhone: "Telefon Numaranız",
    sendQuestion: "Soruyu Gönder",
    questionSent: "Sorunuz başarıyla gönderildi!",
    questionError: "Soru gönderilirken bir hata oluştu.",
    successTitle: "Sorunuz Alındı!",
    successMessage: "En kısa sürede size dönüş yapacağız. Teşekkür ederiz.",
    namePlaceholder: "Adınız Soyadınız",
    emailPlaceholder: "E-posta Adresiniz",
    phonePlaceholder: "Telefon (Opsiyonel)",
    questionPlaceholder: "Sorunuz",
    submitButton: "Soru Gönder",
    submittingButton: "Gönderiliyor...",
    
    // Comments
    comments: "Yorumlar",
    writeComment: "Yorum Yaz",
    yourComment: "Yorumunuz",
    rating: "Değerlendirme",
    submitComment: "Yorumu Gönder",
    commentSent: "Yorumunuz başarıyla gönderildi!",
    commentError: "Yorum gönderilirken bir hata oluştu.",
    
    // Application Form
    applyForVisa: "Vize Başvurusu",
    fullName: "Ad Soyad",
    email: "E-posta",
    phone: "Telefon",
    country: "Ülke",
    visaPackage: "Vize Paketi",
    notes: "Notlar",
    submitApplication: "Başvuruyu Gönder",
    applicationSent: "Başvurunuz başarıyla gönderildi!",
    applicationError: "Başvuru gönderilirken bir hata oluştu.",
    
    // Footer
    quickLinks: "Hızlı Bağlantılar",
    popularCountries: "Popüler Ülkeler",
    followUs: "Bizi Takip Edin",
    allRightsReserved: "Tüm hakları saklıdır.",
    
    // SEO
    metaDescription: "Kolay Seyahat ile vize işlemlerinizi kolayca halledin. Tüm ülkeler için vize bilgileri, başvuru süreçleri ve danışmanlık hizmetleri.",
  },
  en: {
    // Common
    readMore: "Read More",
    learnMore: "Learn More",
    apply: "Apply",
    contact: "Contact",
    submit: "Submit",
    cancel: "Cancel",
    save: "Save",
    delete: "Delete",
    edit: "Edit",
    search: "Search",
    filter: "Filter",
    loading: "Loading...",
    noResults: "No results found",
    
    // Navigation
    home: "Home",
    countries: "Countries",
    visaPackages: "Visa Packages",
    blog: "Blog",
    about: "About Us",
    faq: "FAQ",
    
    // Country Page
    visaInfo: "Visa Information",
    requiredDocuments: "Required Documents",
    applicationProcess: "Application Process",
    processingTime: "Processing Time",
    visaFee: "Visa Fee",
    askQuestion: "Ask a Question",
    questionsFromUsers: "Questions from Users",
    yourQuestion: "Your Question",
    yourName: "Your Name",
    yourEmail: "Your Email",
    yourPhone: "Your Phone",
    sendQuestion: "Send Question",
    questionSent: "Your question has been sent successfully!",
    questionError: "An error occurred while sending your question.",
    successTitle: "Question Received!",
    successMessage: "We will get back to you as soon as possible. Thank you.",
    namePlaceholder: "Your Name",
    emailPlaceholder: "Email Address",
    phonePlaceholder: "Phone (Optional)",
    questionPlaceholder: "Your Question",
    submitButton: "Send Question",
    submittingButton: "Sending...",
    
    // Comments
    comments: "Comments",
    writeComment: "Write a Comment",
    yourComment: "Your Comment",
    rating: "Rating",
    submitComment: "Submit Comment",
    commentSent: "Your comment has been sent successfully!",
    commentError: "An error occurred while sending your comment.",
    
    // Application Form
    applyForVisa: "Apply for Visa",
    fullName: "Full Name",
    email: "Email",
    phone: "Phone",
    country: "Country",
    visaPackage: "Visa Package",
    notes: "Notes",
    submitApplication: "Submit Application",
    applicationSent: "Your application has been sent successfully!",
    applicationError: "An error occurred while sending your application.",
    
    // Footer
    quickLinks: "Quick Links",
    popularCountries: "Popular Countries",
    followUs: "Follow Us",
    allRightsReserved: "All rights reserved.",
    
    // SEO
    metaDescription: "Easily handle your visa processes with Kolay Seyahat. Visa information, application processes, and consultancy services for all countries.",
  },
} as const;

export type TranslationKey = keyof typeof translations.tr;
export type Locale = keyof typeof translations;

export function t(locale: Locale, key: TranslationKey): string {
  return translations[locale][key] || translations.tr[key] || key;
}
