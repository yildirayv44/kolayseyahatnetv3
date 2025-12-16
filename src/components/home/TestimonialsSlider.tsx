"use client";

import { useState, useEffect } from "react";
import { Star, ChevronLeft, ChevronRight, Quote } from "lucide-react";
import Image from "next/image";

interface Testimonial {
  id: number;
  name: string;
  country: string;
  country_en: string;
  rating: number;
  text: string;
  text_en: string;
  image: string;
  date: string;
  date_en: string;
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    name: "Ayşe Yılmaz",
    country: "Amerika Vizesi",
    country_en: "USA Visa",
    rating: 5,
    text: "Kolay Seyahat ekibi sayesinde Amerika vize başvurum çok hızlı ve sorunsuz geçti. Tüm evrakları titizlikle hazırladılar ve süreç boyunca beni bilgilendirdiler. Kesinlikle tavsiye ediyorum!",
    text_en: "Thanks to the Kolay Seyahat team, my US visa application went very quickly and smoothly. They prepared all the documents meticulously and kept me informed throughout the process. Highly recommended!",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
    date: "2 gün önce",
    date_en: "2 days ago",
  },
  {
    id: 2,
    name: "Mehmet Demir",
    country: "İngiltere Vizesi",
    country_en: "UK Visa",
    rating: 5,
    text: "Profesyonel hizmet ve güler yüzlü ekip. İngiltere vize başvurumda hiçbir sorun yaşamadım. Danışmanım her aşamada yanımdaydı. Teşekkürler!",
    text_en: "Professional service and friendly team. I had no problems with my UK visa application. My consultant was with me at every stage. Thank you!",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
    date: "1 hafta önce",
    date_en: "1 week ago",
  },
  {
    id: 3,
    name: "Zeynep Kaya",
    country: "Schengen Vizesi",
    country_en: "Schengen Visa",
    rating: 5,
    text: "İlk defa vize başvurusu yapıyordum ve çok endişeliydim. Ama Kolay Seyahat ekibi o kadar yardımcı oldu ki, süreç hiç düşündüğüm kadar zor olmadı. Vizem 5 günde çıktı!",
    text_en: "It was my first visa application and I was very worried. But the Kolay Seyahat team was so helpful that the process wasn't as difficult as I thought. My visa was issued in 5 days!",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop",
    date: "3 gün önce",
    date_en: "3 days ago",
  },
  {
    id: 4,
    name: "Can Öztürk",
    country: "Kanada Vizesi",
    country_en: "Canada Visa",
    rating: 5,
    text: "Kanada vize süreci karmaşık olabilir ama bu ekip sayesinde her şey çok kolay oldu. Fiyatları da çok uygun. Herkese tavsiye ederim.",
    text_en: "The Canada visa process can be complex but thanks to this team everything was very easy. Their prices are also very reasonable. I recommend it to everyone.",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop",
    date: "5 gün önce",
    date_en: "5 days ago",
  },
  {
    id: 5,
    name: "Elif Şahin",
    country: "Dubai Vizesi",
    country_en: "Dubai Visa",
    rating: 5,
    text: "Hızlı, güvenilir ve profesyonel. Dubai vizem sadece 2 günde çıktı. Müşteri hizmetleri de harika, her soruma anında cevap verdiler.",
    text_en: "Fast, reliable and professional. My Dubai visa was issued in just 2 days. Customer service is also great, they answered all my questions immediately.",
    image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop",
    date: "1 gün önce",
    date_en: "1 day ago",
  },
];

interface TestimonialsSliderProps {
  locale?: 'tr' | 'en';
}

export function TestimonialsSlider({ locale = 'tr' }: TestimonialsSliderProps) {
  const isEn = locale === 'en';
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Otomatik geçiş
  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const goToPrevious = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const goToNext = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const goToSlide = (index: number) => {
    setIsAutoPlaying(false);
    setCurrentIndex(index);
  };

  const current = testimonials[currentIndex];

  return (
    <section className="space-y-4">
      {/* Header - Kompakt */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            {isEn ? 'Customer Reviews' : 'Müşteri Yorumları'}
          </h2>
          <p className="text-xs text-slate-500">{isEn ? '15,000+ happy customers' : '15,000+ mutlu müşteri'}</p>
        </div>
        {/* Stats - Inline */}
        <div className="flex gap-4 text-center">
          <div>
            <div className="text-xl font-bold text-primary">4.9</div>
            <div className="text-[10px] text-slate-500">{isEn ? 'Rating' : 'Puan'}</div>
          </div>
          <div>
            <div className="text-xl font-bold text-primary">%98</div>
            <div className="text-[10px] text-slate-500">{isEn ? 'Approval' : 'Onay'}</div>
          </div>
        </div>
      </div>

      {/* Slider - Kompakt */}
      <div className="relative">
        <div className="card relative overflow-hidden bg-gradient-to-br from-slate-50 to-white p-6">
          {/* Content */}
          <div className="relative z-10 mx-auto max-w-3xl">
            {/* Stars - Küçük */}
            <div className="mb-3 flex justify-center gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${
                    i < current.rating
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-slate-300"
                  }`}
                />
              ))}
            </div>

            {/* Text - Kompakt */}
            <blockquote className="mb-4 text-center text-sm text-slate-700 line-clamp-3">
              "{isEn ? current.text_en : current.text}"
            </blockquote>

            {/* Author - Kompakt */}
            <div className="flex items-center justify-center gap-3">
              <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-full">
                <Image
                  src={current.image}
                  alt={current.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="min-w-0 text-left">
                <div className="truncate text-sm font-semibold text-slate-900">{current.name}</div>
                <div className="truncate text-xs text-slate-500">{isEn ? current.country_en : current.country}</div>
              </div>
              <div className="flex-shrink-0 text-[10px] text-slate-400">{isEn ? current.date_en : current.date}</div>
            </div>
          </div>

          {/* Navigation Arrows */}
          <button
            onClick={goToPrevious}
            className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white p-2 shadow-lg transition-all hover:bg-slate-50 hover:shadow-xl"
            aria-label={isEn ? 'Previous review' : 'Önceki yorum'}
          >
            <ChevronLeft className="h-5 w-5 text-slate-700" />
          </button>
          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white p-2 shadow-lg transition-all hover:bg-slate-50 hover:shadow-xl"
            aria-label={isEn ? 'Next review' : 'Sonraki yorum'}
          >
            <ChevronRight className="h-5 w-5 text-slate-700" />
          </button>
        </div>

        {/* Dots - Küçük */}
        <div className="mt-4 flex justify-center gap-1.5">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`h-1.5 rounded-full transition-all ${
                index === currentIndex
                  ? "w-6 bg-primary"
                  : "w-1.5 bg-slate-300 hover:bg-slate-400"
              }`}
              aria-label={isEn ? `Go to review ${index + 1}` : `${index + 1}. yoruma git`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
