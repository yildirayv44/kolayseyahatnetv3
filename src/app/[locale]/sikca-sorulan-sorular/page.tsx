import { Metadata } from "next";
import Link from "next/link";
import { HelpCircle, ChevronDown, Phone, Mail } from "lucide-react";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const isEnglish = locale === 'en';
  
  return {
    title: isEnglish ? "Frequently Asked Questions (FAQ) | Kolay Seyahat" : "Sıkça Sorulan Sorular (SSS) | Kolay Seyahat",
    description: isEnglish
      ? "Most frequently asked questions and answers about visa applications, processing times, documents and fees."
      : "Vize başvuruları, işlem süreleri, belgeler ve ücretler hakkında en çok sorulan sorular ve cevapları.",
    alternates: {
      canonical: `https://www.kolayseyahat.net${isEnglish ? '/en' : ''}/sikca-sorulan-sorular`,
      languages: {
        'tr': 'https://www.kolayseyahat.net/sikca-sorulan-sorular',
        'en': 'https://www.kolayseyahat.net/en/sikca-sorulan-sorular',
        'x-default': 'https://www.kolayseyahat.net/sikca-sorulan-sorular',
      },
    },
  };
}

export default async function SSSPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const isEnglish = locale === 'en';
  const faqCategories = [
    {
      title: "Genel Sorular",
      questions: [
        {
          q: "Kolay Seyahat nedir ve ne tür hizmetler sunuyor?",
          a: "Kolay Seyahat, vize başvuru süreçlerinde profesyonel danışmanlık hizmeti sunan bir platformdur. Vize başvurusu, belge hazırlama, randevu alma, başvuru takibi ve müşteri destek hizmetleri sunuyoruz."
        },
        {
          q: "Hangi ülkeler için vize hizmeti veriyorsunuz?",
          a: "50'den fazla ülke için vize danışmanlık hizmeti sunuyoruz. Amerika, İngiltere, Kanada, Schengen ülkeleri, Dubai, Rusya ve daha birçok ülke için başvuru yapabilirsiniz."
        },
        {
          q: "Vize başarı oranınız nedir?",
          a: "Profesyonel danışmanlık hizmetimiz sayesinde %98 vize onay oranına ulaşıyoruz. Ancak, vize kararları tamamen konsolosluk tarafından verilir ve garanti veremeyiz."
        }
      ]
    },
    {
      title: "Başvuru Süreci",
      questions: [
        {
          q: "Vize başvurusu nasıl yapılır?",
          a: "Web sitemizden online başvuru formunu doldurarak başlayabilirsiniz. Danışmanlarımız sizinle iletişime geçerek gerekli belgeleri bildirir ve süreci yönetir."
        },
        {
          q: "Vize başvurusu ne kadar sürer?",
          a: "İşlem süresi ülkeye ve vize türüne göre değişir. Genellikle 7-30 gün arasında değişmektedir. Acil başvuru seçeneği ile süre kısaltılabilir."
        },
        {
          q: "Başvuru için hangi belgeler gereklidir?",
          a: "Gerekli belgeler ülkeye ve vize türüne göre değişir. Genellikle pasaport, fotoğraf, banka hesap özeti, iş belgesi, seyahat sigortası ve otel rezervasyonu gerekir. Danışmanlarımız size özel belge listesi sağlar."
        },
        {
          q: "Başvuru durumumu nasıl takip edebilirim?",
          a: "Danışmanlarımız sizi düzenli olarak bilgilendirir. Ayrıca konsolosluk takip numaranız ile resmi web sitelerinden de takip yapabilirsiniz."
        }
      ]
    },
    {
      title: "Ücretler ve Ödeme",
      questions: [
        {
          q: "Vize başvurusu ne kadar tutar?",
          a: "Ücretler ülkeye ve vize türüne göre değişir. Hizmet bedelimiz, konsolosluk harçları ve üçüncü taraf ücretleri ayrı ayrı hesaplanır. Detaylı fiyat bilgisi için danışmanlarımızla iletişime geçebilirsiniz."
        },
        {
          q: "Hangi ödeme yöntemlerini kabul ediyorsunuz?",
          a: "Kredi kartı, banka havalesi/EFT ve nakit ödeme (ofis ziyaretlerinde) kabul ediyoruz. Kredi kartı ile taksit seçenekleri mevcuttur."
        },
        {
          q: "Vize reddedilirse param iade edilir mi?",
          a: "Hizmet bedelimiz iade edilmez, ancak yeniden başvuru için %30 indirimli danışmanlık hizmeti sunuyoruz. Konsolosluk harçları zaten iade edilemez niteliktedir."
        },
        {
          q: "İptal durumunda iade alabilir miyim?",
          a: "Hizmet başlamadan iptal durumunda %80 iade yapılır. Başvuru süreci başladıktan sonra iade oranları azalır. Detaylı bilgi için Ücret Politikamızı inceleyebilirsiniz."
        }
      ]
    },
    {
      title: "Belgeler ve Gereksinimler",
      questions: [
        {
          q: "Pasaportum ne kadar süre geçerli olmalı?",
          a: "Genellikle pasaportunuzun vize başvurusu sırasında en az 6 ay geçerlilik süresi olması gerekir. Bazı ülkeler için bu süre farklı olabilir."
        },
        {
          q: "Banka hesap özetinde ne kadar para olmalı?",
          a: "Gerekli miktar ülkeye ve kalış süresine göre değişir. Genellikle günlük 50-100 Euro arası yeterli bakiye göstermeniz beklenir. Danışmanlarımız size özel bilgi verir."
        },
        {
          q: "Seyahat sigortası zorunlu mu?",
          a: "Schengen ülkeleri ve bazı diğer ülkeler için seyahat sigortası zorunludur. Minimum 30.000 Euro teminat içermeli ve tüm kalış süresini kapsamalıdır."
        },
        {
          q: "Belgelerin çevirisi gerekli mi?",
          a: "Türkçe olmayan belgeler için resmi çeviri gerekebilir. Hangi belgelerin çeviriye ihtiyacı olduğunu danışmanlarımız size bildirir."
        }
      ]
    },
    {
      title: "Özel Durumlar",
      questions: [
        {
          q: "Öğrenci vizesi için ne gerekir?",
          a: "Kabul mektubu, mali yeterlilik belgesi, eğitim geçmişi belgeleri ve sağlık sigortası gerekir. Detaylı bilgi için öğrenci vizesi danışmanlarımızla görüşebilirsiniz."
        },
        {
          q: "Çalışma vizesi nasıl alınır?",
          a: "İş teklifi mektubu, işveren sponsorluğu ve çalışma izni gerekir. Süreç ülkeye göre değişir ve genellikle daha uzun sürer."
        },
        {
          q: "Aile birleşimi vizesi için şartlar nelerdir?",
          a: "Ülkede yaşayan aile üyesinin sponsorluğu, akrabalık belgesi ve mali yeterlilik gerekir. Her ülkenin kendine özgü şartları vardır."
        },
        {
          q: "Çocuklar için vize başvurusu nasıl yapılır?",
          a: "18 yaş altı çocuklar için veli veya vasi onayı gerekir. Nüfus cüzdanı, muvafakatname ve veli belgeleri ek olarak istenir."
        }
      ]
    },
    {
      title: "Teknik Sorular",
      questions: [
        {
          q: "Online başvuru güvenli mi?",
          a: "Evet, web sitemiz SSL sertifikası ile korunmaktadır. Kişisel bilgileriniz ve belgeleriniz en üst düzey güvenlik ile saklanır."
        },
        {
          q: "Başvuru formunu doldururken hata yaptım, ne yapmalıyım?",
          a: "Danışmanlarımızla iletişime geçerek düzeltme yapabilirsiniz. Başvuru onaylanmadan önce tüm bilgiler kontrol edilir."
        },
        {
          q: "Belgeleri nasıl yükleyebilirim?",
          a: "Başvuru formunda belge yükleme bölümü bulunmaktadır. Belgeleri PDF, JPG veya PNG formatında yükleyebilirsiniz. Maksimum dosya boyutu 10 MB'dır."
        }
      ]
    }
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary to-blue-600 py-12 text-white">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/20">
              <HelpCircle className="h-8 w-8" />
            </div>
            <h1 className="mb-4 text-4xl font-bold md:text-5xl">
              {isEnglish ? 'Frequently Asked Questions' : 'Sıkça Sorulan Sorular'}
            </h1>
            <p className="text-lg text-blue-50">
              {isEnglish
                ? 'Your questions and answers about visa applications'
                : 'Vize başvuruları hakkında merak ettikleriniz ve cevapları'}
            </p>
          </div>
        </div>
      </section>

      {/* FAQ Content */}
      <section className="container mx-auto px-4">
        <div className="mx-auto max-w-4xl space-y-8">
          {faqCategories.map((category, catIndex) => (
            <div key={catIndex} className="space-y-4">
              <h2 className="text-2xl font-bold text-slate-900">
                {category.title}
              </h2>
              <div className="space-y-3">
                {category.questions.map((item, qIndex) => (
                  <details
                    key={qIndex}
                    className="group card cursor-pointer transition-all hover:shadow-lg"
                  >
                    <summary className="flex items-start justify-between gap-4 font-semibold text-slate-900">
                      <span className="flex-1">{item.q}</span>
                      <ChevronDown className="h-5 w-5 flex-shrink-0 text-primary transition-transform group-open:rotate-180" />
                    </summary>
                    <p className="mt-3 border-t border-slate-100 pt-3 text-slate-700">
                      {item.a}
                    </p>
                  </details>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Contact CTA */}
      <section className="container mx-auto px-4">
        <div className="card mx-auto max-w-3xl border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-blue-50 text-center">
          <h2 className="text-2xl font-bold text-slate-900">
            {isEnglish ? "Couldn't Find the Answer?" : 'Sorunuza Cevap Bulamadınız mı?'}
          </h2>
          <p className="mt-2 text-slate-600">
            {isEnglish
              ? 'Our expert consultants are ready to help you'
              : 'Uzman danışmanlarımız size yardımcı olmak için hazır'}
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <a
              href="tel:02129099971"
              className="inline-flex items-center justify-center gap-2 rounded-lg border-2 border-primary bg-white px-6 py-3 font-semibold text-primary transition-all hover:bg-primary hover:text-white"
            >
              <Phone className="h-5 w-5" />
              0212 909 99 71
            </a>
            <Link
              href="/iletisim"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 font-semibold text-white transition-all hover:bg-primary/90"
            >
              <Mail className="h-5 w-5" />
              {isEnglish ? 'Contact Us' : 'İletişime Geçin'}
            </Link>
          </div>
        </div>
      </section>

      {/* Quick Links */}
      <section className="bg-slate-50 py-12">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl">
            <h2 className="mb-6 text-center text-2xl font-bold text-slate-900">
              {isEnglish ? 'Useful Links' : 'Faydalı Linkler'}
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Link
                href="/vize-basvuru-formu"
                className="card text-center transition-all hover:shadow-lg"
              >
                <h3 className="font-semibold text-primary">{isEnglish ? 'Online Application' : 'Online Başvuru'}</h3>
                <p className="mt-1 text-sm text-slate-600">
                  {isEnglish ? 'Apply now' : 'Hemen başvurunuzu yapın'}
                </p>
              </Link>
              <Link
                href="/ulkeler"
                className="card text-center transition-all hover:shadow-lg"
              >
                <h3 className="font-semibold text-primary">{isEnglish ? 'Countries' : 'Ülkeler'}</h3>
                <p className="mt-1 text-sm text-slate-600">
                  {isEnglish ? 'Review visa information' : 'Vize bilgilerini inceleyin'}
                </p>
              </Link>
              <Link
                href="/ucret-politikamiz"
                className="card text-center transition-all hover:shadow-lg"
              >
                <h3 className="font-semibold text-primary">{isEnglish ? 'Pricing Policy' : 'Ücret Politikası'}</h3>
                <p className="mt-1 text-sm text-slate-600">
                  {isEnglish ? 'Learn about prices' : 'Fiyatları öğrenin'}
                </p>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
