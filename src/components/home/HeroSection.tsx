import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useI18n } from '../../lib/i18n';
import { ArrowRight, ArrowLeft, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';

// ✅ بيانات الشرائح الأربعة (يمكنك تغيير الصور والنصوص لاحقاً أو ربطها بـ Supabase)
const HERO_SLIDES = [
  {
    id: 1,
    image: 'https://images.unsplash.com/photo-1449503168670-aa62f636098e?q=80&w=1600',
    title_ar: 'فخامة بلا حدود',
    title_en: 'Timeless Elegance',
    subtitle_ar: 'اكتشف مجموعتنا الحصرية من الأحذية العالمية المستوردة بأعلى جودة',
    subtitle_en: 'Discover our exclusive collection of premium imported global footwear',
    link: '/shop',
    btn_ar: 'تسوق الآن',
    btn_en: 'Shop Now'
  },
  {
    id: 2,
    image: 'https://images.unsplash.com/photo-1614252369475-531eba835eb1?q=80&w=1600',
    title_ar: 'أناقة كلاسيكية',
    title_en: 'Classic Sophistication',
    subtitle_ar: 'تشكيلة واسعة من الأحذية الرسمية المصنوعة من أجود أنواع الجلد',
    subtitle_en: 'A wide range of formal shoes crafted from the finest leather',
    link: '/shop?category=classic',
    btn_ar: 'اكتشف الكلاسيك',
    btn_en: 'Discover Classic'
  },
  {
    id: 3,
    image: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?q=80&w=1600',
    title_ar: 'راحة عصرية',
    title_en: 'Modern Comfort',
    subtitle_ar: 'أحدث صيحات السنيكرز العالمية لتصميم يناسب أسلوب حياتك',
    subtitle_en: 'Latest global sneaker trends for a design that fits your lifestyle',
    link: '/shop?category=sneakers',
    btn_ar: 'تصفح السنيكرز',
    btn_en: 'Browse Sneakers'
  },
  {
    id: 4,
    image: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?q=80&w=1600',
    title_ar: 'عروض حصرية',
    title_en: 'Exclusive Offers',
    subtitle_ar: 'خصومات تصل إلى 30% على مجموعات مختارة لفترة محدودة',
    subtitle_en: 'Up to 30% off on selected collections for a limited time',
    link: '/offers',
    btn_ar: 'شاهد العروض',
    btn_en: 'View Offers'
  }
];

export function HeroSection() {
  const { language, isRTL } = useI18n();
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // ✅ التشغيل التلقائي كل 5 ثوانٍ (يتوقف عند مرور الماوس)
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [isPaused]);

  const nextSlide = () => setCurrent((prev) => (prev + 1) % HERO_SLIDES.length);
  const prevSlide = () => setCurrent((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);

  const slide = HERO_SLIDES[current];
  const ArrowIcon = isRTL ? ChevronLeft : ChevronRight;
  const ArrowIconReverse = isRTL ? ChevronRight : ChevronLeft;

  return (
    <section 
      className="relative h-[85vh] min-h-[600px] w-full overflow-hidden bg-black"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* 1. الشرائح المتحركة (Background Images) */}
      <AnimatePresence mode="wait">
        <motion.div
          key={slide.id}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: "easeInOut" }}
          className="absolute inset-0"
        >
          <img 
            src={slide.image} 
            alt={language === 'ar' ? slide.title_ar : slide.title_en}
            className="w-full h-full object-cover opacity-70"
          />
          {/* تدرجات لونية لضمان وضوح النص */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/20" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-black/70" />
        </motion.div>
      </AnimatePresence>

      {/* 2. المحتوى النصي والأزرار */}
      <div className="relative z-10 h-full flex flex-col justify-center items-center text-center px-4 max-w-5xl mx-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={`content-${slide.id}`}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col items-center"
          >
            {/* Eyebrow Text */}
            <span className="inline-flex items-center gap-3 text-amber-400 text-sm md:text-base font-semibold tracking-[0.2em] uppercase mb-6">
              <span className="w-8 h-[1px] bg-amber-400"></span>
              {language === 'ar' ? 'مجموعة حصرية 2026' : 'Exclusive Collection 2026'}
              <span className="w-8 h-[1px] bg-amber-400"></span>
            </span>
            
            {/* Main Title */}
            <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-black text-white leading-[1.1] mb-6 drop-shadow-lg">
              {language === 'ar' ? slide.title_ar : slide.title_en}
            </h1>
            
            {/* Subtitle */}
            <p className="text-lg md:text-xl text-white/80 leading-relaxed mb-10 max-w-2xl font-light">
              {language === 'ar' ? slide.subtitle_ar : slide.subtitle_en}
            </p>
            
            {/* Action Button */}
            <Link 
              to={slide.link}
              className="group inline-flex items-center justify-center gap-3 px-10 py-4 bg-white text-black font-bold rounded-full hover:bg-amber-500 hover:text-black transition-all duration-300 transform hover:scale-105 shadow-xl"
            >
              {language === 'ar' ? slide.btn_ar : slide.btn_en}
              <ArrowIcon className="h-5 w-5 transition-transform group-hover:translate-x-1 rtl:group-hover:-translate-x-1" />
            </Link>
          </motion.div>
        </AnimatePresence>
        
        {/* 3. مؤشر التمرير السفلي */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        >
          <p className="text-xs uppercase tracking-[0.2em] text-white/50 font-medium">
            {language === 'ar' ? 'ماركات عالمية · جودة مضمونة' : 'Global Brands · Guaranteed Quality'}
          </p>
          <motion.div 
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            className="mt-2 p-2 rounded-full border border-white/30 text-white/70"
          >
            <ChevronDown className="h-5 w-5" />
          </motion.div>
        </motion.div>
      </div>

      {/* 4. أزرار التنقل (Arrows) */}
      <button 
        onClick={prevSlide}
        className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white hover:text-black transition-all duration-300 hover:scale-110"
        aria-label="Previous Slide"
      >
        <ArrowIconReverse className="h-6 w-6" />
      </button>
      
      <button 
        onClick={nextSlide}
        className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white hover:text-black transition-all duration-300 hover:scale-110"
        aria-label="Next Slide"
      >
        <ArrowIcon className="h-6 w-6" />
      </button>

      {/* 5. نقاط المؤشر (Pagination Dots) */}
      <div className="absolute bottom-8 right-4 md:right-8 z-20 flex gap-2">
        {HERO_SLIDES.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrent(index)}
            className={`h-1.5 rounded-full transition-all duration-500 ${
              index === current ? 'w-8 bg-amber-500' : 'w-1.5 bg-white/40 hover:bg-white/70'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
}