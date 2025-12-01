"use client";

import { useState, useEffect } from "react";
import { Star, ChevronLeft, ChevronRight, Quote } from "lucide-react";
import Image from "next/image";

interface Testimonial {
  id: number;
  name: string;
  country: string;
  rating: number;
  text: string;
  image: string;
  date: string;
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    name: "Ayşe Yılmaz",
    country: "Amerika Vizesi",
    rating: 5,
    text: "Kolay Seyahat ekibi sayesinde Amerika vize başvurum çok hızlı ve sorunsuz geçti. Tüm evrakları titizlikle hazırladılar ve süreç boyunca beni bilgilendirdiler. Kesinlikle tavsiye ediyorum!",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
    date: "2 gün önce",
  },
  {
    id: 2,
    name: "Mehmet Demir",
    country: "İngiltere Vizesi",
    rating: 5,
    text: "Profesyonel hizmet ve güler yüzlü ekip. İngiltere vize başvurumda hiçbir sorun yaşamadım. Danışmanım her aşamada yanımdaydı. Teşekkürler!",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
    date: "1 hafta önce",
  },
  {
    id: 3,
    name: "Zeynep Kaya",
    country: "Schengen Vizesi",
    rating: 5,
    text: "İlk defa vize başvurusu yapıyordum ve çok endişeliydim. Ama Kolay Seyahat ekibi o kadar yardımcı oldu ki, süreç hiç düşündüğüm kadar zor olmadı. Vizem 5 günde çıktı!",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop",
    date: "3 gün önce",
  },
  {
    id: 4,
    name: "Can Öztürk",
    country: "Kanada Vizesi",
    rating: 5,
    text: "Kanada vize süreci karmaşık olabilir ama bu ekip sayesinde her şey çok kolay oldu. Fiyatları da çok uygun. Herkese tavsiye ederim.",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop",
    date: "5 gün önce",
  },
  {
    id: 5,
    name: "Elif Şahin",
    country: "Dubai Vizesi",
    rating: 5,
    text: "Hızlı, güvenilir ve profesyonel. Dubai vizem sadece 2 günde çıktı. Müşteri hizmetleri de harika, her soruma anında cevap verdiler.",
    image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop",
    date: "1 gün önce",
  },
];

export function TestimonialsSlider() {
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
    <section className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-slate-900 md:text-3xl">
          Müşterilerimiz Ne Diyor?
        </h2>
        <p className="mt-2 text-slate-600">
          15,000+ mutlu müşterimizden bazı yorumlar
        </p>
      </div>

      {/* Slider */}
      <div className="relative">
        <div className="card relative overflow-hidden bg-gradient-to-br from-slate-50 to-white p-8 md:p-12">
          {/* Quote Icon */}
          <Quote className="absolute right-8 top-8 h-16 w-16 text-primary/10" />

          {/* Content */}
          <div className="relative z-10 mx-auto max-w-3xl">
            {/* Stars */}
            <div className="mb-4 flex justify-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-5 w-5 ${
                    i < current.rating
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-slate-300"
                  }`}
                />
              ))}
            </div>

            {/* Text */}
            <blockquote className="mb-6 text-center text-lg text-slate-700 md:text-xl">
              "{current.text}"
            </blockquote>

            {/* Author */}
            <div className="flex items-center justify-center gap-4">
              <div className="relative h-12 w-12 overflow-hidden rounded-full">
                <Image
                  src={current.image}
                  alt={current.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="text-left">
                <div className="font-semibold text-slate-900">{current.name}</div>
                <div className="text-sm text-slate-500">{current.country}</div>
              </div>
              <div className="ml-auto text-xs text-slate-400">{current.date}</div>
            </div>
          </div>

          {/* Navigation Arrows */}
          <button
            onClick={goToPrevious}
            className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white p-2 shadow-lg transition-all hover:bg-slate-50 hover:shadow-xl"
            aria-label="Önceki yorum"
          >
            <ChevronLeft className="h-5 w-5 text-slate-700" />
          </button>
          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white p-2 shadow-lg transition-all hover:bg-slate-50 hover:shadow-xl"
            aria-label="Sonraki yorum"
          >
            <ChevronRight className="h-5 w-5 text-slate-700" />
          </button>
        </div>

        {/* Dots */}
        <div className="mt-6 flex justify-center gap-2">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`h-2 rounded-full transition-all ${
                index === currentIndex
                  ? "w-8 bg-primary"
                  : "w-2 bg-slate-300 hover:bg-slate-400"
              }`}
              aria-label={`${index + 1}. yoruma git`}
            />
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 text-center">
        <div className="card">
          <div className="text-3xl font-bold text-primary">4.9</div>
          <div className="text-sm text-slate-600">Ortalama Puan</div>
        </div>
        <div className="card">
          <div className="text-3xl font-bold text-primary">15,247</div>
          <div className="text-sm text-slate-600">Mutlu Müşteri</div>
        </div>
        <div className="card">
          <div className="text-3xl font-bold text-primary">%98</div>
          <div className="text-sm text-slate-600">Onay Oranı</div>
        </div>
      </div>
    </section>
  );
}
