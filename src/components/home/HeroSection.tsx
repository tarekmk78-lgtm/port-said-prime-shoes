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
  is_active: boolean;
  sort_order: number;
}

export function HeroSection() {
  const { language } = useI18n();
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSlides() {
      try {
        const { data, error } = await supabase
          .from('hero_slides')
          .select('*')
          .eq('is_active', true)
          .order('sort_order', { ascending: true });
        
        if (!error && data && data.length > 0) {
          setSlides(data);
        } else {
          // بيانات افتراضية
          setSlides([
            {
              id: '1',
              title: 'TIMELESS ELEGANCE',
              title_ar: 'الفخامة تبدأ من خطوة',
              subtitle: 'Summer Collection 2026',
              subtitle_ar: 'مجموعة صيف 2026',
              description: 'اكتشف مجموعة صيف 2026\nمصنوعة من أجود أنواع الجلد الطبيعي',
              description_ar: 'اكتشف مجموعة صيف 2026\nمصنوعة من أجود أنواع الجلد الطبيعي',
              image_url: 'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=1920&q=80',
              button_text: 'Shop Now',
              button_text_ar: 'تسوق الآن',
              button_link: '/shop',
              is_active: true,
              sort_order: 1,
            },
          ]);
        }
      } catch (err) {
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchSlides();
  }, []);

  useEffect(() => {
    if (slides.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [slides.length]);

  if (loading || slides.length === 0) {
    return <div className="relative h-[500px] md:h-[600px] bg-gray-900" />;
  }

  const current = slides[currentSlide];
  const title = language === 'ar' ? current.title_ar : current.title;
  const subtitle = language === 'ar' ? current.subtitle_ar : current.subtitle;
  const description = language === 'ar' ? current.description_ar : current.description;
  const buttonText = language === 'ar' ? current.button_text_ar : current.button_text;

  return (
    <section className="relative h-[500px] md:h-[600px] lg:h-[700px] bg-black overflow-hidden">
      {/* الصورة الخلفية */}
      <div className="absolute inset-0">
        <img
          src={current.image_url}
          alt="Hero"
          className="w-full h-full object-cover object-center"
        />
        {/* Overlay داكن */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-transparent" />
      </div>

      {/* الشريط العلوي الشفاف */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/60 to-transparent py-4">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="flex items-center justify-center gap-4 text-white/90 text-sm">
            <span>شحن مجاني لجميع الطلبات | ضمان استرجاع 14 يوم</span>
          </div>
        </div>
      </div>

      {/* المحتوى */}
      <div className="relative h-full max-w-7xl mx-auto px-4 md:px-6 flex items-center">
        <div className="w-full md:w-1/2 text-right">
          {/* Subtitle */}
          <p className="text-amber-500 text-sm md:text-base font-medium mb-3 tracking-wide">
            {subtitle}
          </p>

          {/* Title */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight">
            {title}
          </h1>

          {/* Description */}
          <p className="text-gray-300 text-base md:text-lg mb-8 leading-relaxed whitespace-pre-line">
            {description}
          </p>

          {/* Buttons */}
          <div className="flex flex-wrap gap-4">
            <Link
              to={current.button_link || '/shop'}
              className="inline-flex items-center gap-2 px-8 py-4 bg-amber-600 text-white rounded-lg font-semibold hover:bg-amber-700 transition-colors shadow-lg"
            >
              <ShoppingBag className="w-5 h-5" />
              {buttonText}
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

      {/* أزرار التنقل */}
      {slides.length > 1 && (
        <>
          <button
            onClick={() => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)}
            className="absolute left-4 md:left-6 top-1/2 -translate-y-1/2 z-10 p-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-white hover:bg-white/20 transition-all"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={() => setCurrentSlide((prev) => (prev + 1) % slides.length)}
            className="absolute right-4 md:right-6 top-1/2 -translate-y-1/2 z-10 p-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-white hover:bg-white/20 transition-all"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* النقاط */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex gap-2">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`h-2.5 rounded-full transition-all ${
                  index === currentSlide ? 'bg-amber-500 w-8' : 'bg-white/40 hover:bg-white/60 w-2.5'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}