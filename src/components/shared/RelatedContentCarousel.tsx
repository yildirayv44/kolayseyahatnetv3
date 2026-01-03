"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Clock, ArrowRight } from "lucide-react";

interface RelatedContent {
  id: number;
  title: string;
  description?: string;
  image_url?: string;
  slug: string;
  type: 'blog' | 'country';
  created_at?: string;
}

interface RelatedContentCarouselProps {
  items: RelatedContent[];
  title?: string;
  locale?: 'tr' | 'en';
}

export function RelatedContentCarousel({ 
  items, 
  title,
  locale = 'tr' 
}: RelatedContentCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const defaultTitle = locale === 'en' 
    ? 'You Might Also Be Interested In' 
    : 'İlginizi Çekebilecek İçerikler';

  // Early return if no items
  if (!items || items.length === 0) return null;

  useEffect(() => {
    if (!isAutoPlaying || items.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % items.length);
    }, 5000); // Change every 5 seconds

    return () => clearInterval(interval);
  }, [isAutoPlaying, items.length]);

  useEffect(() => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const itemWidth = container.offsetWidth;
      container.scrollTo({
        left: currentIndex * itemWidth,
        behavior: 'smooth',
      });
    }
  }, [currentIndex]);

  const handlePrevious = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
  };

  const handleNext = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => (prev + 1) % items.length);
  };

  const getItemHref = (item: RelatedContent) => {
    if (item.type === 'blog') {
      return locale === 'en' ? `/en/blog/${item.slug}` : `/blog/${item.slug}`;
    }
    return locale === 'en' ? `/en/${item.slug}` : `/${item.slug}`;
  };

  if (items.length === 0) return null;

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-900">
          {title || defaultTitle}
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrevious}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition-all hover:border-primary hover:bg-primary hover:text-white disabled:opacity-50"
            disabled={items.length <= 1}
            aria-label={locale === 'en' ? 'Previous' : 'Önceki'}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={handleNext}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition-all hover:border-primary hover:bg-primary hover:text-white disabled:opacity-50"
            disabled={items.length <= 1}
            aria-label={locale === 'en' ? 'Next' : 'Sonraki'}
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Mobile: Swipeable */}
      <div 
        ref={scrollContainerRef}
        className="flex snap-x snap-mandatory gap-4 overflow-x-auto scrollbar-hide md:grid md:grid-cols-3 md:overflow-visible"
        onTouchStart={() => setIsAutoPlaying(false)}
      >
        {items.map((item) => (
          <Link
            key={item.id}
            href={getItemHref(item)}
            className="group relative flex min-w-full snap-start flex-col overflow-hidden rounded-xl border-2 border-slate-200 bg-white transition-all hover:border-primary hover:shadow-lg md:min-w-0"
          >
            {/* Image */}
            <div className="relative aspect-video w-full overflow-hidden bg-slate-100 md:aspect-[4/3]">
              {item.image_url ? (
                <Image
                  src={item.image_url}
                  alt={item.title}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              ) : (
                <div className="flex h-full items-center justify-center bg-gradient-to-br from-primary/10 to-blue-100">
                  <span className="text-4xl">
                    {item.type === 'blog' ? '📝' : '🌍'}
                  </span>
                </div>
              )}
              
              {/* Type badge */}
              <div className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-slate-700 backdrop-blur-sm">
                {item.type === 'blog' 
                  ? (locale === 'en' ? 'Blog' : 'Blog')
                  : (locale === 'en' ? 'Country' : 'Ülke')}
              </div>
            </div>

            {/* Content */}
            <div className="flex flex-1 flex-col p-4 md:p-3">
              <h3 className="mb-2 line-clamp-2 text-base font-bold text-slate-900 group-hover:text-primary md:text-sm">
                {item.title}
              </h3>
              
              {item.description && (
                <p className="mb-3 line-clamp-2 flex-1 text-sm text-slate-600 md:text-xs">
                  {item.description}
                </p>
              )}

              <div className="flex items-center justify-between text-xs text-slate-500">
                {item.created_at && (
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <time dateTime={item.created_at}>
                      {new Date(item.created_at).toLocaleDateString(locale === 'en' ? 'en-US' : 'tr-TR', {
                        month: 'short',
                        day: 'numeric',
                        timeZone: 'UTC',
                      })}
                    </time>
                  </div>
                )}
                <div className="flex items-center gap-1 font-semibold text-primary">
                  <span>{locale === 'en' ? 'Read' : 'Oku'}</span>
                  <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Dots indicator (mobile) */}
      {items.length > 1 && (
        <div className="flex justify-center gap-2 md:hidden">
          {items.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setIsAutoPlaying(false);
                setCurrentIndex(index);
              }}
              className={`h-2 rounded-full transition-all ${
                index === currentIndex
                  ? 'w-8 bg-primary'
                  : 'w-2 bg-slate-300 hover:bg-slate-400'
              }`}
              aria-label={`${locale === 'en' ? 'Go to slide' : 'Slayta git'} ${index + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
