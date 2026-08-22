import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useI18n } from '../../lib/i18n';
import { supabase } from '../../lib/supabase';
import { ChevronLeft, ChevronRight, ShoppingBag } from 'lucide-react';

interface HeroSlide {
  id: string;
  title: string;
  title_ar: string;
  subtitle: string;
  subtitle_ar: string;
  description: string;
  description_ar: string;
  image_url: string;
  button_text: string;
  button_text_ar: string;
  button_link: string;
  text_position: 'left' | 'right' | 'center';
  is_active: boolean;
  sort_order: number;
}

export function HeroSection() {
  const { language, isRTL } = useI18n();
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSlides() {
      const { data, error } = await supabase
        .from('hero_slides')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });
      
      if (!error && data) {
        setSlides(data);
      }
      setLoading(false);
    }
    fetchSlides();
  }, []);

  useEffect(() => {
    if (slides.length === 0) return;
    
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);

    return () => clearInterval(interval);
  }, [slides.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  if (loading || slides.length === 0) {
    return (
      <div className="relative h-[600px] md:h-[700px] bg-gray-900 animate-pulse" />
    );
  }

  const current = slides[currentSlide];
  const title = language === 'ar' ? current.title_ar : current.title;
  const subtitle = language === 'ar' ? current.subtitle_ar : current.subtitle;
  const description = language === 'ar' ? current.description_ar : current.description;
  const buttonText = language === 'ar' ? current.button_text_ar : current.button_text;

  // تحديد موضع النص بناءً على اللغة
  const getTextPosition = () => {
    if (current.text_position !== 'center') {
      return current.text_position;
    }
    return isRTL ? 'right' : 'left';
  };

  const textPosition = getTextPosition();

  return (
    <section className="relative">
      {/* الشريط العلوي الشفاف */}
      <div className="absolute top-0 left-0 right-0 z-20 bg-gradient-to-b from-black/60 to-transparent py-3">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="flex items-center justify-center gap-4 text-white/90 text-sm">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-amber-500" />
              <span>شحن مجاني لجميع الطلبات | ضمان استرجاع 14 يوم</span>
            </div>
          </div>
        </div>
      </div>

      {/* السلايدر */}
      <div className="relative h-[600px] md:h-[700px] lg:h-[800px] overflow-hidden bg-black">
        {slides.map((slide, index) => {
          const isActive = index === currentSlide;
          return (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-opacity duration-1000 ${
                isActive ? 'opacity-100' : 'opacity-0'
              }`}
            >
              {/* الصورة */}
              <div className="absolute inset-0">
                <img
                  src={slide.image_url}
                  alt={language === 'ar' ? slide.title_ar : slide.title}
                  className="w-full h-full object-cover"
                />
                {/* Overlay داكن */}
                <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent" />
              </div>

              {/* المحتوى */}
              <div className="relative h-full max-w-7xl mx-auto px-4 md:px-6">
                <div
                  className={`flex items-center h-full ${
                    textPosition === 'right'
                      ? 'justify-end'
                      : textPosition === 'left'
                      ? 'justify-start'
                      : 'justify-center'
                  }`}
                >
                  <div
                    className={`max-w-xl ${
                      textPosition === 'right'
                        ? 'text-right'
                        : textPosition === 'left'
                        ? 'text-left'
                        : 'text-center'
                    }`}
                  >
                    {/* Subtitle */}
                    <p className="text-amber-500 text-sm md:text-base font-medium mb-3 tracking-wide">
                      {language === 'ar' ? slide.subtitle_ar : slide.subtitle}
                    </p>

                    {/* Title */}
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight">
                      {language === 'ar' ? slide.title_ar : slide.title}
                    </h1>

                    {/* Description */}
                    <p className="text-gray-200 text-base md:text-lg mb-8 leading-relaxed">
                      {language === 'ar' ? slide.description_ar : slide.description}
                    </p>

                    {/* Buttons */}
                    <div className="flex flex-wrap gap-4">
                      <Link
                        to={slide.button_link || '/shop'}
                        className="inline-flex items-center gap-2 px-8 py-4 bg-amber-600 text-white rounded-lg font-semibold hover:bg-amber-700 transition-colors shadow-lg"
                      >
                        <ShoppingBag className="w-5 h-5" />
                        {language === 'ar' ? slide.button_text_ar : slide.button_text}
                      </Link>
                      <Link
                        to="/shop"
                        className="inline-flex items-center gap-2 px-8 py-4 bg-white/10 backdrop-blur-sm text-white border border-white/30 rounded-lg font-semibold hover:bg-white/20 transition-colors"
                      >
                        {language === 'ar' ? 'استكشف المجموعة' : 'Explore Collection'}
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {/* أزرار التنقل */}
        {slides.length > 1 && (
          <>
            <button
              onClick={prevSlide}
              className="absolute left-4 md:left-6 top-1/2 -translate-y-1/2 z-10 p-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-white hover:bg-white/20 transition-all"
            >
              {isRTL ? <ChevronRight className="w-6 h-6" /> : <ChevronLeft className="w-6 h-6" />}
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-4 md:right-6 top-1/2 -translate-y-1/2 z-10 p-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-white hover:bg-white/20 transition-all"
            >
              {isRTL ? <ChevronLeft className="w-6 h-6" /> : <ChevronRight className="w-6 h-6" />}
            </button>

            {/* النقاط */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex gap-2">
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-2.5 h-2.5 rounded-full transition-all ${
                    index === currentSlide
                      ? 'bg-amber-500 w-8'
                      : 'bg-white/40 hover:bg-white/60'
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}