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
          setSlides([
            {
              id: '1',
              title: 'TIMELESS ELEGANCE',
              title_ar: 'الفخامة تبدأ من خطوة',
              subtitle: 'Summer Collection 2026',
              subtitle_ar: 'مجموعة صيف 2026',
              description: 'اكتشف مجموعة صيف 2026\nمصنوعة من أجود أنواع الجلد الطبيعي',
              description_ar: 'اكتشف مجموعة صيف 2026\nمصنوعة من أجود أنواع الجلد الطبيعي',
              image_url: 'https://unsplash.com',
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

  // تحديث الارتفاع هنا ليتطابق مع شاشة التحميل لمنع القفزات البصرية (Layout Shift)
  if (loading || slides.length === 0) {
    return <div className="relative h-[260px] sm:h-[340px] md:h-[380px] lg:h-[400px] bg-gray-900" />;
  }

  const current = slides[currentSlide];
  const title = language === 'ar' ? current.title_ar : current.title;
  const subtitle = language === 'ar' ? current.subtitle_ar : current.subtitle;
  const description = language === 'ar' ? current.description_ar : current.description;
  const buttonText = language === 'ar' ? current.button_text_ar : current.button_text;
  const isAr = language === 'ar';

  return (
    // التعديل الرئيسي: تصغير الارتفاع الأقصى للاب توب ليكون 400px وللموبايل 260px
    <section className="relative h-[260px] sm:h-[340px] md:h-[380px] lg:h-[400px] bg-black overflow-hidden">
      {/* الصورة الخلفية */}
      <div className="absolute inset-0">
        <img
          src={current.image_url}
          alt="Hero"
          className="w-full h-full object-cover object-center"
        />
        {/* تعتيم الخلفية لزيادة تباين الخطوط */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/60 md:bg-gradient-to-r md:from-black/80 md:via-black/50 md:to-transparent" />
      </div>

      {/* الشريط العلوي الإرشادي النحيف */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-black/40 py-1.5">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="flex items-center justify-center gap-4 text-white/90 text-[11px] md:text-sm">
            <span>شحن مجاني لجميع الطلبات | ضمان استرجاع 14 يوم</span>
          </div>
        </div>
      </div>

      {/* المحتوى الداخلي للنصوص */}
      <div className="relative h-full max-w-7xl mx-auto px-4 md:px-8 flex items-center pt-6">
        <div className={`w-full md:w-1/2 ${isAr ? 'text-right' : 'text-left'} z-10`}>
          {/* Subtitle */}
          <p className="text-amber-500 text-[11px] md:text-sm font-semibold mb-1 md:mb-2 tracking-wide">
            {subtitle}
          </p>

          {/* Title - تصغير الخط قليلاً ليتناسب مع الارتفاع الجديد */}
          <h1 className="text-xl sm:text-2xl md:text-4xl lg:text-5xl font-bold text-white mb-2 md:mb-3 leading-tight">
            {title}
          </h1>

          {/* Description - يظهر فقط في الشاشات الأكبر لعدم التكدس */}
          <p className="hidden md:block text-gray-300 text-sm lg:text-base mb-5 leading-relaxed whitespace-pre-line max-w-xl">
            {description}
          </p>

          {/* Buttons */}
          <div className="flex flex-wrap gap-2 md:gap-3">
            <Link
              to={current.button_link || '/shop'}
              className="inline-flex items-center gap-1.5 px-3 py-2 md:px-6 md:py-3 bg-amber-600 text-white text-xs md:text-sm rounded-md font-semibold hover:bg-amber-700 transition-colors shadow-lg"
            >
              <ShoppingBag className="w-3.5 h-3.5 md:w-4 md:h-4" />
              {buttonText}
            </Link>
            <Link
              to="/shop"
              className="inline-flex items-center gap-1.5 px-3 py-2 md:px-6 md:py-3 bg-white/10 backdrop-blur-sm text-white text-xs md:text-sm border border-white/20 rounded-md font-semibold hover:bg-white/20 transition-colors"
            >
              {isAr ? 'استكشف المجموعة' : 'Explore Collection'}
            </Link>
          </div>
        </div>
      </div>

      {/* أسهم التقليب الدائرية */}
      {slides.length > 1 && (
        <>
          <button
            onClick={() => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)}
            className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 z-20 p-1.5 md:p-2.5 bg-black/20 hover:bg-black/40 border border-white/10 rounded-full text-white/70 hover:text-white transition-all"
          >
            <ChevronLeft className="w-4 h-4 md:w-5 md:h-5" />
          </button>
          <button
            onClick={() => setCurrentSlide((prev) => (prev + 1) % slides.length)}
            className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 z-20 p-1.5 md:p-2.5 bg-black/20 hover:bg-black/40 border border-white/10 rounded-full text-white/70 hover:text-white transition-all"
          >
            <ChevronRight className="w-4 h-4 md:w-5 md:h-5" />
          </button>

          {/* نقاط التصفح السفلية */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex gap-1.5">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`h-1.5 rounded-full transition-all ${
                  index === currentSlide ? 'bg-amber-500 w-5' : 'bg-white/30 hover:bg-white/50 w-1.5'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
