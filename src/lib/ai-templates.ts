/**
 * AI Content Generation Templates
 * Predefined templates for different content types
 */

export interface ContentTemplate {
  id: string;
  name: string;
  description: string;
  sections: string[];
  tone: "informative" | "friendly" | "formal";
  wordCount: number;
  keywords: string[];
  visualSuggestions: VisualSuggestion[];
}

export interface VisualSuggestion {
  type: "infographic" | "checklist" | "map" | "photo" | "diagram" | "chart";
  topic: string;
  description: string;
  priority: "high" | "medium" | "low";
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface InternalLink {
  text: string;
  url: string;
  relevance: number;
}

export interface TonePreview {
  informative: string;
  friendly: string;
  formal: string;
}

export interface UpdateSuggestion {
  reason: string;
  priority: "high" | "medium" | "low";
  suggestedChanges: string[];
  affectedSections: string[];
}

// Predefined Templates
export const contentTemplates: Record<string, ContentTemplate> = {
  vize_rehberi: {
    id: "vize_rehberi",
    name: "Vize Başvuru Rehberi",
    description: "Ülke bazlı vize başvuru süreci için kapsamlı rehber",
    sections: [
      "Genel Bilgiler",
      "Vize Türleri",
      "Gerekli Evraklar",
      "Başvuru Süreci",
      "Ücretler ve Ödeme",
      "Başvuru Sonrası",
      "Sıkça Sorulan Sorular",
      "Önemli Notlar"
    ],
    tone: "informative",
    wordCount: 2000,
    keywords: ["vize", "başvuru", "evrak", "süreç", "ücret"],
    visualSuggestions: [
      {
        type: "infographic",
        topic: "Vize başvuru süreci akış şeması",
        description: "Adım adım başvuru sürecini gösteren görsel",
        priority: "high"
      },
      {
        type: "checklist",
        topic: "Gerekli evraklar kontrol listesi",
        description: "Başvuru için gerekli tüm evrakların listesi",
        priority: "high"
      },
      {
        type: "photo",
        topic: "Büyükelçilik/konsolosluk binası",
        description: "Başvuru yapılacak yerin fotoğrafı",
        priority: "medium"
      }
    ]
  },

  gezilecek_yerler: {
    id: "gezilecek_yerler",
    name: "Gezilecek Yerler Rehberi",
    description: "Şehir veya ülke için gezilecek yerler listesi",
    sections: [
      "Giriş",
      "En İyi 10 Gezilecek Yer",
      "Tarihi Yerler",
      "Doğal Güzellikler",
      "Müzeler ve Galeriler",
      "Alışveriş Noktaları",
      "Yeme-İçme Mekanları",
      "Ulaşım Bilgileri",
      "Konaklama Önerileri",
      "Gezginlere Tavsiyeler"
    ],
    tone: "friendly",
    wordCount: 1800,
    keywords: ["gezilecek yerler", "turistik", "gezi", "seyahat", "rehber"],
    visualSuggestions: [
      {
        type: "map",
        topic: "Gezilecek yerlerin haritası",
        description: "Önemli noktaların işaretlendiği harita",
        priority: "high"
      },
      {
        type: "photo",
        topic: "Her bir gezilecek yerin fotoğrafı",
        description: "Yüksek kaliteli yer fotoğrafları",
        priority: "high"
      },
      {
        type: "chart",
        topic: "Mevsimsel ziyaret önerileri",
        description: "Hangi mevsimde nereye gidilmeli",
        priority: "medium"
      }
    ]
  },

  ulke_rehberi: {
    id: "ulke_rehberi",
    name: "Ülke Rehberi",
    description: "Kapsamlı ülke tanıtımı ve seyahat bilgileri",
    sections: [
      "Genel Bilgiler",
      "Coğrafya ve İklim",
      "Vize ve Giriş Şartları",
      "Ulaşım",
      "Konaklama",
      "Gezilecek Yerler",
      "Kültür ve Yaşam",
      "Yeme-İçme",
      "Alışveriş",
      "Güvenlik ve Sağlık",
      "Para Birimi ve Bütçe",
      "İletişim ve İnternet",
      "Pratik Bilgiler"
    ],
    tone: "informative",
    wordCount: 2500,
    keywords: ["ülke", "seyahat", "rehber", "bilgi", "gezi"],
    visualSuggestions: [
      {
        type: "map",
        topic: "Ülke haritası",
        description: "Önemli şehir ve bölgelerin gösterildiği harita",
        priority: "high"
      },
      {
        type: "infographic",
        topic: "Ülke hakkında hızlı bilgiler",
        description: "Nüfus, dil, para birimi vb. bilgiler",
        priority: "high"
      },
      {
        type: "photo",
        topic: "Ülkeyi temsil eden fotoğraflar",
        description: "Kültür, doğa ve şehir fotoğrafları",
        priority: "medium"
      }
    ]
  },

  sehir_rehberi: {
    id: "sehir_rehberi",
    name: "Şehir Rehberi",
    description: "Detaylı şehir tanıtımı ve gezi rehberi",
    sections: [
      "Şehir Hakkında",
      "Nasıl Gidilir",
      "Şehir İçi Ulaşım",
      "Konaklama Seçenekleri",
      "Gezilecek Yerler",
      "Müzeler ve Kültür",
      "Yeme-İçme Rehberi",
      "Gece Hayatı",
      "Alışveriş",
      "Günübirlik Geziler",
      "Pratik Bilgiler"
    ],
    tone: "friendly",
    wordCount: 2000,
    keywords: ["şehir", "gezi", "rehber", "turistik", "seyahat"],
    visualSuggestions: [
      {
        type: "map",
        topic: "Şehir haritası",
        description: "Önemli noktaların işaretlendiği şehir haritası",
        priority: "high"
      },
      {
        type: "photo",
        topic: "Şehir manzaraları",
        description: "Şehrin ikonik görüntüleri",
        priority: "high"
      },
      {
        type: "diagram",
        topic: "Ulaşım şeması",
        description: "Metro, otobüs hatları vb.",
        priority: "medium"
      }
    ]
  },

  sss_makalesi: {
    id: "sss_makalesi",
    name: "Sıkça Sorulan Sorular",
    description: "Belirli bir konu hakkında SSS formatında makale",
    sections: [
      "Giriş",
      "Genel Sorular",
      "Başvuru Süreci",
      "Evraklar ve Belgeler",
      "Ücretler",
      "Süre ve Zaman",
      "Özel Durumlar",
      "Sorun Çözme",
      "Ek Bilgiler"
    ],
    tone: "friendly",
    wordCount: 1500,
    keywords: ["soru", "cevap", "sss", "faq", "bilgi"],
    visualSuggestions: [
      {
        type: "infographic",
        topic: "En çok sorulan 5 soru",
        description: "Popüler soruların görsel sunumu",
        priority: "medium"
      },
      {
        type: "checklist",
        topic: "Kontrol listesi",
        description: "Yapılması gerekenler listesi",
        priority: "medium"
      }
    ]
  },

  ipuclari_rehberi: {
    id: "ipuclari_rehberi",
    name: "İpuçları ve Tavsiyeler",
    description: "Pratik ipuçları ve uzman tavsiyeleri",
    sections: [
      "Giriş",
      "Başlamadan Önce",
      "Temel İpuçları",
      "İleri Seviye Tavsiyeler",
      "Sık Yapılan Hatalar",
      "Uzman Önerileri",
      "Maliyet Tasarrufu",
      "Zaman Yönetimi",
      "Sonuç ve Özet"
    ],
    tone: "friendly",
    wordCount: 1600,
    keywords: ["ipucu", "tavsiye", "öneri", "rehber", "bilgi"],
    visualSuggestions: [
      {
        type: "infographic",
        topic: "İpuçları özeti",
        description: "Önemli ipuçlarının görsel özeti",
        priority: "high"
      },
      {
        type: "checklist",
        topic: "Yapılacaklar listesi",
        description: "Adım adım yapılacaklar",
        priority: "medium"
      }
    ]
  }
};

// Helper function to get template by ID
export function getTemplate(id: string): ContentTemplate | undefined {
  return contentTemplates[id];
}

// Helper function to get all template names
export function getTemplateNames(): Array<{ id: string; name: string; description: string }> {
  return Object.values(contentTemplates).map(t => ({
    id: t.id,
    name: t.name,
    description: t.description
  }));
}
