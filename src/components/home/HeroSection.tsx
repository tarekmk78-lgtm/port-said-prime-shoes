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
          // محاكاة الأربع صور المتحركة لـ DR.M كبيانات افتراضية
          setSlides([
            {
              id: '1',
              title: 'TIMELESS ELEGANCE',
              title_ar: 'الفخامة تبدأ من خطوة',
              subtitle: 'Summer Collection 2026',
              subtitle_ar: 'مجموعة صيف 2026',
              description: 'اكتشف التشكيلة الجديدة المصنوعة من أجود أنواع الجلد الطبيعي.',
              description_ar: 'اكتشف التشكيلة الجديدة المصنوعة من أجود أنواع الجلد الطبيعي.',
              image_url: 'https://unsplash.com',
              button_text: 'Shop Now',
              button_text_ar: 'تسوق الآن',
              button_link: '/shop',
              is_active: true,
              sort_order: 1,
            },
            {
              id: '2',
              title: 'CASUAL COMFORT',
              title_ar: 'أناقة الكاجوال اليومية',
              subtitle: 'New Arrivals',
              subtitle_ar: 'وصل حديثاً',
              description: 'أحذية عملية مريحة تناسب حركتك اليومية بكل خفة.',
              description_ar: 'أحذية عملية مريحة تناسب حركتك اليومية بكل خفة.',
              image_url: 'https://unsplash.com',
              button_text: 'Explore',
              button_text_ar: 'استكشف الآن',
              button_link: '/shop/casual',
              is_active: true,
              sort_order: 2,
            }
          ]);
        }
      } catch (err) {
        console.error('Error fetching slides:', err);
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
    }, 5000); // الانتقال التلقائي كل 5 ثوانٍ مثل المتجر الاحترافي
    return () => clearInterval(interval);
  }, [slides.length]);

  // تحديث أبعاد شاشة الانتظار لتطابق التعديل الشريطي العرضي الجديد للاب توب
  if (loading || slides.length === 0) {
    return <div className="relative h-[280px] sm:h-[350px] md:h-[400px] lg:h-[450px] bg-gray-950" />;
  }

const current = slides[currentSlide];
const title = language === 'ar' ? current.title_ar : (current as any).title_en;
const subtitle = language === 'ar' ? current.subtitle_ar : (current as any).subtitle_en;
const description = language === 'ar' ? current.description_ar : current.description;
const buttonText = language === 'ar' ? current.btn_ar : (current as any).btn_en;
const buttonLink = current.link || '/shop';
const isAr = language === 'ar';

  return (
    // أبعاد الهيرو المستوحاة من DR.M (ارتفاع مثالي وشريطي على اللاب توب 450px كحد أقصى)
    <section className="relative h-[280px] sm:h-[350px] md:h-[400px] lg:h-[450px] bg-black overflow-hidden select-none">
      
      {/* عرض الصور بتأثير الانتقال الناعم (Fade In/Out) */}
      <div className="absolute inset-0 w-full h-full">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              index === currentSlide ? 'opacity-100 z-0' : 'opacity-0 z-0'
            }`}
          >
            <img
              src={slide.image_url}
              alt={`Hero Slide ${index + 1}`}
              className="w-full h-full object-cover object-center pointer-events-none"
            />
            {/* غطاء حماية النص المتدرج من اليمين (أو اليسار حسب اللغة) لتعزيز التباين والقراءة */}
            <div className={`absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/50 md:bg-gradient-to-b md:from-black/20 ${
              isAr 
                ? 'md:bg-gradient-to-l md:from-black/85 md:via-black/40 md:to-transparent' 
                : 'md:bg-gradient-to-r md:from-black/85 md:via-black/40 md:to-transparent'
            }`} />
          </div>
        ))}
      </div>

      {/* شريط الإعلانات الصغير العلوي الشفاف */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-black/30 backdrop-blur-[2px] py-2 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="flex items-center justify-center gap-4 text-white/90 text-[10px] md:text-xs tracking-wider">
            <span>شحن مجاني لجميع الطلبات | ضمان استرجاع 14 يوم</span>
          </div>
        </div>
      </div>

      {/* حاوية النصوص والأزرار التفاعلية */}
      <div className="relative h-full max-w-7xl mx-auto px-4 md:px-12 flex items-center pt-8 z-10">
        <div className={`w-full md:w-1/2 ${isAr ? 'text-right' : 'text-left'}`}>
          {/* Subtitle الرفيع العلوى */}
          <p className="text-amber-500 text-[11px] md:text-sm font-bold uppercase mb-1 md:mb-2 tracking-widest">
            {subtitle}
          </p>

          {/* العنوان العريض المصغر ليتوافق مع الارتفاع الشريطي الجديد */}
          <h1 className="text-xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-white mb-2 md:mb-3 leading-tight drop-shadow-md">
            {title}
          </h1>

          {/* نص الوصف المساعد (مخفي في الموبايل الصغير لتجنب الزحام) */}
          <p className="hidden sm:block text-gray-300 text-xs md:text-base mb-5 md:mb-6 leading-relaxed max-w-md opacity-95">
            {description}
          </p>

          {/* أزرار الإجراء السريع (Call To Action) */}
          <div className="flex flex-wrap gap-2 md:gap-3">
            <Link
                to={buttonLink}
              className="inline-flex items-center gap-1.5 px-4 py-2 md:px-6 md:py-3 bg-amber-600 text-white text-xs md:text-sm rounded-md font-bold hover:bg-amber-700 transition-all shadow-lg active:scale-95"
            >
              <ShoppingBag className="w-3.5 h-3.5 md:w-4 md:h-4" />
              {buttonText}
            </Link>
            <Link
              to="/shop"
              className="inline-flex items-center gap-1.5 px-4 py-2 md:px-6 md:py-3 bg-white/10 backdrop-blur-md text-white text-xs md:text-sm border border-white/20 rounded-md font-bold hover:bg-white/20 transition-all active:scale-95"
            >
              {isAr ? 'استكشف المجموعة' : 'Explore Collection'}
            </Link>
          </div>
        </div>
      </div>

      {/* عناصر التحكم بالتنقل (الأسهم والنقاط) - تظهر فقط إذا كان هناك أكثر من صورة */}
      {slides.length > 1 && (
        <>
          {/* الأسهم الدائرية الطرفية الناعمة */}
          <button
            onClick={() => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)}
            className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 z-20 p-2 bg-black/10 hover:bg-black/40 border border-white/10 rounded-full text-white/60 hover:text-white transition-all transform active:scale-90"
          >
            <ChevronLeft className="w-4 h-4 md:w-5 md:h-5" />
          </button>
          <button
            onClick={() => setCurrentSlide((prev) => (prev + 1) % slides.length)}
            className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 z-20 p-2 bg-black/10 hover:bg-black/40 border border-white/10 rounded-full text-white/60 hover:text-white transition-all transform active:scale-90"
          >
            <ChevronRight className="w-4 h-4 md:w-5 md:h-5" />
          </button>

          {/* النقاط التصفحية النحيفة بالأسفل */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex gap-2">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
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
