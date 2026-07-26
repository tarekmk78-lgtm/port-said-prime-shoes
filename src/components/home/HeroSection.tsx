import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useI18n } from '../../lib/i18n';
import { useSettings } from '../../lib/settings-context';
import { ArrowRight, ArrowLeft } from 'lucide-react';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1449503168670-aa62f636098e?q=80&w=1600';

export function HeroSection() {
  const { t, language, isRTL } = useI18n();
  const { settings } = useSettings();
  
  const Arrow = isRTL ? ArrowLeft : ArrowRight;
  const heroImage = settings?.hero_image_url || FALLBACK_IMAGE;
  const heroTitle = language === 'ar' ? (settings?.hero_title_ar || 'مجموعة صيف ٢٠٢٦') : (settings?.hero_title || 'Summer Collection 2026');
  const heroSubtitle = language === 'ar' ? (settings?.hero_subtitle_ar || 'اكتشف الأحذية الفاخرة') : (settings?.hero_subtitle || 'Discover premium footwear');

  // ✅ حساب الرابط الديناميكي
  const getHeroLink = (): string => {
    const linkType = settings?.hero_link_type || 'shop';
    const filter = settings?.hero_filter || '';
    const customUrl = settings?.hero_custom_url || '';

    switch (linkType) {
      case 'offers':
        return '/offers';
      
      case 'category':
        return filter ? `/categories/${filter}` : '/shop';
      
      case 'search':
        return filter ? `/shop?search=${encodeURIComponent(filter)}` : '/shop';
      
      case 'url':
        return customUrl || '/shop';
      
      case 'shop':
      default:
        // لو فيه فلتر، استخدمه
        if (filter) {
          return `/shop?filter=${encodeURIComponent(filter)}`;
        }
        return '/shop';
    }
  };

  const heroLink = getHeroLink();

  return (
    <section className="relative bg-ink overflow-hidden">
      <div className="grid lg:grid-cols-2 min-h-[88vh] lg:min-h-screen">
        <div className="relative z-10 flex items-center px-6 md:px-12 lg:px-16 py-28 lg:py-0">
          <div className="max-w-lg">
            <motion.span 
              initial={{ opacity: 0, y: 12 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }} 
              className="eyebrow text-[#D9BB96]"
            >
              {language === 'ar' ? 'هدفنا · هو ثقتكم' : 'Our Goal · Is Your Trust'}
            </motion.span>
            
            <motion.h1 
              initial={{ opacity: 0, y: 16 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ duration: 0.7, delay: 0.08, ease: [0.22, 1, 0.36, 1] }} 
              className="font-display text-4xl md:text-5xl lg:text-[3.4rem] leading-[1.08] text-white mt-6 mb-6"
            >
              {heroTitle}
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 16 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ duration: 0.7, delay: 0.16, ease: [0.22, 1, 0.36, 1] }} 
              className="text-base md:text-lg text-white/65 leading-relaxed mb-10"
            >
              {heroSubtitle}
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 16 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ duration: 0.7, delay: 0.24, ease: [0.22, 1, 0.36, 1] }} 
              className="flex flex-wrap items-center gap-5"
            >
              {/* ✅ الزر الرئيسي برابط ديناميكي */}
              <Link 
                to={heroLink}
                className="group inline-flex items-center gap-2.5 px-7 py-4 text-ink font-semibold rounded-sm transition-colors" 
                style={{ backgroundColor: 'var(--color-primary)' }}
              >
                {language === 'ar' ? 'تسوق الآن' : 'Shop Now'}
                <Arrow className="h-4 w-4 transition-transform group-hover:translate-x-1 rtl:group-hover:-translate-x-1" />
              </Link>
              
              <Link 
                to="/shop?filter=new" 
                className="inline-flex items-center gap-2 text-white font-medium border-b border-white/30 pb-1 hover:border-white transition-colors"
              >
                {language === 'ar' ? 'عرض المجموعة' : 'View Collection'}
              </Link>
            </motion.div>
            
            <div className="stitch-divider--dark mt-12 max-w-xs" />
            
            <p className="mt-4 text-xs uppercase tracking-widest2 text-white/40">
              {language === 'ar' ? 'خياطة يدوية · جلد طبيعي' : 'Hand-stitched · Genuine leather'}
            </p>
          </div>
        </div>

        <div className="relative min-h-[40vh] lg:min-h-screen">
          <img 
            loading="eager" 
            decoding="async" 
            src={heroImage} 
            alt={language === 'ar' ? 'مجموعة بورسعيد برايم شوز' : 'Port Said Prime Shoes collection'} 
            className="absolute inset-0 w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.src = FALLBACK_IMAGE;
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/10 to-transparent lg:bg-gradient-to-r lg:from-ink lg:via-transparent lg:to-transparent" />
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.92 }} 
            animate={{ opacity: 1, scale: 1 }} 
            transition={{ duration: 0.6, delay: 0.5 }} 
            className="absolute bottom-8 right-8 tag-badge"
          >
            {language === 'ar' ? 'تأسست في بورسعيد' : 'Est. in Port Said'}
          </motion.div>
        </div>
      </div>
    </section>
  );
}