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

  // تعديل الارتفاع في كود التحميل ليطابق التصميم الجديد
  if (loading || slides.length === 0) {
    return <div className="relative h-[300px] sm:h-[400px] md:h-[500px] lg:h-[550px] bg-gray-900" />;
  }

  const current = slides[currentSlide];
  const title = language === 'ar' ? current.title_ar : current.title;
  const subtitle = language === 'ar' ? current.subtitle_ar : current.subtitle;
  const description = language === 'ar' ? current.description_ar : current.description;
  const buttonText = language === 'ar' ? current.button_text_ar : current.button_text;
  const isAr = language === 'ar';

  return (
    // تعديل 1: تصغير الارتفاع على الشاشات المختلفة ليصبح البنر عرضي وأنيق
    <section className="relative h-[320px] sm:h-[420px] md:h-[500px] lg:h-[550px] bg-black overflow-hidden">
      {/* الصورة الخلفية */}
      <div className="absolute inset-0">
        <img
          src={current.image_url}
          alt="Hero"
          className="w-full h-full object-cover object-center"
        />
        {/* تعديل 2: تحسين الـ Overlay ليكون متدرجاً من الأسفل والأعلى لمزيد من وضوح النصوص */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/60 md:bg-gradient-to-r md:from-black/80 md:via-black/50 md:to-transparent" />
      </div>

      {/* الشريط العلوي الشفاف */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-black/40 py-2">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="flex items-center justify-center gap-4 text-white/90 text-xs md:text-sm">
            <span>شحن مجاني لجميع الطلبات | ضمان استرجاع 14 يوم</span>
          </div>
        </div>
      </div>

      {/* المحتوى */}
      {/* تعديل 3: ضبط مرونة المحتوى ليتوسط الشاشة عمودياً في الموبايل ويكون منسقاً هيدروليكياً */}
      <div className="relative h-full max-w-7xl mx-auto px-4 md:px-8 flex items-center pt-8">
        <div className={`w-full md:w-1/2 ${isAr ? 'text-right' : 'text-left'} z-10`}>
          {/* Subtitle */}
          <p className="text-amber-500 text-xs md:text-base font-semibold mb-1.5 md:mb-3 tracking-wide">
            {subtitle}
          </p>

          {/* Title */}
          <h1 className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-2 md:mb-4 leading-tight">
            {title}
          </h1>

          {/* Description */}
          {/* تعديل 4: إخفاء الوصف المطول في الموبايل الصغير جداً لتقليل الازدحام */}
          <p className="hidden sm:block text-gray-300 text-sm md:text-lg mb-6 md:mb-8 leading-relaxed whitespace-pre-line max-w-xl">
            {description}
          </p>

          {/* Buttons */}
          {/* تعديل 5: تصغير حجم الأزرار في الهواتف وتوسيعها لتناسب اللمس المريح */}
          <div className="flex flex-wrap gap-2.5 md:gap-4">
            <Link
              to={current.button_link || '/shop'}
              className="inline-flex items-center gap-1.5 md:gap-2 px-4 py-2.5 md:px-8 md:py-4 bg-amber-600 text-white text-xs md:text-base rounded-md font-semibold hover:bg-amber-700 transition-colors shadow-lg"
            >
              <ShoppingBag className="w-4 h-4 md:w-5 md:h-5" />
              {buttonText}
            </Link>
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 px-4 py-2.5 md:px-8 md:py-4 bg-white/10 backdrop-blur-sm text-white text-xs md:text-base border border-white/20 rounded-md font-semibold hover:bg-white/20 transition-colors"
            >
              {isAr ? 'استكشف المجموعة' : 'Explore Collection'}
            </Link>
          </div>
        </div>
      </div>

      {/* أزرار التنقل */}
      {slides.length > 1 && (
        <>
          {/* تعديل 6: تصغير حجم أسهم التنقل ونقلها للأطراف لئلا تقطع النصوص */}
          <button
            onClick={() => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)}
            className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 z-20 p-1.5 md:p-3 bg-black/20 hover:bg-black/40 border border-white/10 rounded-full text-white/70 hover:text-white transition-all"
          >
            <ChevronLeft className="w-4 h-4 md:w-6 md:h-6" />
          </button>
          <button
            onClick={() => setCurrentSlide((prev) => (prev + 1) % slides.length)}
            className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 z-20 p-1.5 md:p-3 bg-black/20 hover:bg-black/40 border border-white/10 rounded-full text-white/70 hover:text-white transition-all"
          >
            <ChevronRight className="w-4 h-4 md:w-6 md:h-6" />
          </button>

          {/* النقاط السفلية */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-1.5">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`h-1.5 rounded-full transition-all ${
                  index === currentSlide ? 'bg-amber-500 w-6' : 'bg-white/30 hover:bg-white/50 w-1.5'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
