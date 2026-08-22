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
          // بيانات افتراضية لو مفيش بيانات في قاعدة البيانات
          setSlides([
            {
              id: '1',
              title: 'Luxury in Every Step',
              title_ar: 'الفخامة تبدأ من خطوة',
              subtitle: 'Summer Collection 2026',
              subtitle_ar: 'مجموعة صيف 2026',
              description: 'Discover our new collection of premium shoes\nMade from the finest natural leather',
              description_ar: 'اكتشف مجموعتنا الجديدة من الأحذية الفاخرة\nمصنوعة من أجود أنواع الجلد الطبيعي',
              image_url: 'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=1920&q=80',
              button_text: 'Shop Now',
              button_text_ar: 'تسوق الآن',
              button_link: '/shop',
              is_active: true,
              sort_order: 1,
            },
            {
              id: '2',
              title: 'Premium Quality',
              title_ar: 'جودة عالمية',
              subtitle: 'Handcrafted Excellence',
              subtitle_ar: 'صناعة يدوية متقنة',
              description: 'Shoes crafted by skilled artisans\nWith 100% natural materials',
              description_ar: 'أحذية مصنوعة بأيدي حرفيين\nبخامات طبيعية 100%',
              image_url: 'https://images.unsplash.com/photo-1449505278894-297fdb3edbc1?w=1920&q=80',
              button_text: 'Explore',
              button_text_ar: 'استكشف',
              button_link: '/shop',
              is_active: true,
              sort_order: 2,
            },
          ]);
        }
      } catch (err) {
        console.error('Error fetching hero slides:', err);
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

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  if (loading) {
    return (
      <div className="relative h-[400px] md:h-[500px] lg:h-[600px] bg-gray-900 animate-pulse">
        <div className="absolute inset-0 bg-gray-800" />
      </div>
    );
  }

  const current = slides[currentSlide];
  const title = language === 'ar' ? current.title_ar : current.title;
  const subtitle = language === 'ar' ? current.subtitle_ar : current.subtitle;
  const description = language === 'ar' ? current.description_ar : current.description;
  const buttonText = language === 'ar' ? current.button_text_ar : current.button_text;
  const isTextOnRight = language === 'ar';

  return (
    <section className="relative w-full overflow-hidden">
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
      <div className="relative h-[400px] md:h-[500px] lg:h-[600px] overflow-hidden bg-black">
        {slides.map((slide, index) => {
          const isActive = index === currentSlide;
          const slideTitle = language === 'ar' ? slide.title_ar : slide.title;
          const slideSubtitle = language === 'ar' ? slide.subtitle_ar : slide.subtitle;
          const slideDescription = language === 'ar' ? slide.description_ar : slide.description;
          const slideButtonText = language === 'ar' ? slide.button_text_ar : slide.button_text;
          
          return (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-opacity duration-1000 ${
                isActive ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <div className="relative h-full flex flex-col md:flex-row">
                
                {/* جزء الصورة - على الموبايل فوق */}
                <div className={`w-full md:w-1/2 ${
                  isTextOnRight ? 'md:order-1' : 'md:order-2'
                }`}>
                  <div className="relative h-full min-h-[250px] md:min-h-0">
                    <img
                      src={slide.image_url}
                      alt={slideTitle}
                      className="w-full h-full object-cover object-center"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent md:bg-gradient-to-l md:from-black/30" />
                  </div>
                </div>

                {/* جزء النص */}
                <div className={`w-full md:w-1/2 flex items-center ${
                  isTextOnRight ? 'md:order-2' : 'md:order-1'
                }`}>
                  <div className={`px-6 md:px-12 lg:px-20 py-8 md:py-0 max-w-xl ${
                    isTextOnRight ? 'text-right' : 'text-left'
                  }`}>
                    <p className="text-amber-500 text-sm md:text-base font-medium mb-2 tracking-wide italic">
                      {slideSubtitle}
                    </p>
                    <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold text-white mb-3 md:mb-4 leading-tight">
                      {slideTitle}
                    </h1>
                    <p className="text-gray-200 text-xs md:text-base mb-4 md:mb-6 leading-relaxed whitespace-pre-line">
                      {slideDescription}
                    </p>
                    <div className="flex flex-wrap gap-2 md:gap-3">
                      <Link
                        to={slide.button_link || '/shop'}
                        className="inline-flex items-center gap-2 px-4 md:px-6 py-2.5 md:py-3 bg-amber-600 text-white rounded-lg font-semibold hover:bg-amber-700 transition-colors shadow-lg text-xs md:text-base"
                      >
                        <ShoppingBag className="w-4 h-4 md:w-5 md:h-5" />
                        {slideButtonText}
                      </Link>
                      <Link
                        to="/shop"
                        className="inline-flex items-center gap-2 px-4 md:px-6 py-2.5 md:py-3 bg-white/10 backdrop-blur-sm text-white border border-white/30 rounded-lg font-semibold hover:bg-white/20 transition-colors text-xs md:text-base"
                      >
                        {language === 'ar' ? 'استكشف المجموعة' : 'Explore Collection'}
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Overlay للنص على الموبايل */}
                <div className="absolute inset-0 bg-black/60 md:hidden pointer-events-none" />
              </div>
            </div>
          );
        })}

        {/* أزرار التنقل */}
        {slides.length > 1 && (
          <>
            <button
              onClick={prevSlide}
              className="absolute left-2 md:left-6 top-1/2 -translate-y-1/2 z-10 p-2 md:p-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-white hover:bg-white/20 transition-all"
              aria-label="Previous slide"
            >
              <ChevronLeft className="w-4 h-4 md:w-6 md:h-6" />
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-2 md:right-6 top-1/2 -translate-y-1/2 z-10 p-2 md:p-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-white hover:bg-white/20 transition-all"
              aria-label="Next slide"
            >
              <ChevronRight className="w-4 h-4 md:w-6 md:h-6" />
            </button>

            {/* النقاط */}
            <div className="absolute bottom-4 md:bottom-6 left-1/2 -translate-x-1/2 z-10 flex gap-2">
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`h-2 rounded-full transition-all ${
                    index === currentSlide
                      ? 'bg-amber-500 w-6 md:w-8'
                      : 'bg-white/40 hover:bg-white/60 w-2'
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}