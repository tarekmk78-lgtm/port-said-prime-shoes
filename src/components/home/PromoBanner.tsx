import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useI18n } from '../../lib/i18n';
import { supabase } from '../../lib/supabase';
import { Banner } from '../../types';
import { ArrowRight } from 'lucide-react';

const STATIC_BANNERS = [
  {
    id: 'static-1',
    image_url: 'https://images.unsplash.com/photo-1549298916-b23d1d5995a6?q=80&w=800',
    title: 'Up to 50% Off',
    title_ar: 'خصم يصل إلى 50%',
    subtitle: 'Discover our new collection of premium footwear at exceptional prices',
    subtitle_ar: 'اكتشف تشكيلتنا الجديدة من الأحذية الفاخرة بأسعار استثنائية',
    link: '/shop?filter=sale',
    badge: 'Special Offer',
    badge_ar: 'عرض خاص',
    type: 'main',
  },
  {
    id: 'static-2',
    image_url: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?q=80&w=800',
    title: "Men's Collection",
    title_ar: 'مجموعة الرجال',
    link: '/shop?category=men',
    type: 'side',
  },
  {
    id: 'static-3',
    image_url: 'https://images.unsplash.com/photo-1605348532760-6753d2c43329?q=80&w=800',
    title: "Women's Collection",
    title_ar: 'مجموعة النساء',
    link: '/shop?category=women',
    type: 'side',
  },
];

export function PromoBanner() {
  const { language } = useI18n();
  const [banners, setBanners] = useState<any[]>(STATIC_BANNERS);

  useEffect(() => {
    async function fetchBanners() {
      try {
        const { data, error } = await supabase
          .from('banners')
          .select('*')
          .eq('is_active', true)
          .order('sort_order');

        if (!error && data && data.length > 0) {
          const mapped = data.map((b: Banner, i: number) => ({
            id: b.id,
            image_url: b.image_url,
            title: b.title,
            title_ar: b.title_ar,
            subtitle: b.subtitle,
            subtitle_ar: b.subtitle_ar,
            link: b.link_url || '/shop',
            badge: b.button_text,
            badge_ar: b.button_text_ar,
            type: i === 0 ? 'main' : 'side',
          }));
          setBanners(mapped);
        }
      } catch (error) {
        console.error('Error fetching banners:', error);
      }
    }
    fetchBanners();
  }, []);

  const mainBanner = banners.find((b) => b.type === 'main') || banners[0];
  const sideBanners = banners.filter((b) => b.type === 'side').slice(0, 2);

  return (
    <section className="py-12 md:py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Main Banner */}
          {mainBanner && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative aspect-[4/3] md:aspect-auto md:row-span-2 rounded-sm overflow-hidden group"
            >
              <img
                loading="lazy"
                decoding="async"
                src={mainBanner.image_url}
                alt={language === 'ar' ? mainBanner.title_ar : mainBanner.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
              <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-10">
                {(mainBanner.badge || mainBanner.badge_ar) && (
                  <span className="inline-block px-3 py-1 bg-white text-[#111111] text-sm font-medium rounded-full w-fit mb-4">
                    {language === 'ar' ? (mainBanner.badge_ar || mainBanner.badge) : (mainBanner.badge || mainBanner.badge_ar)}
                  </span>
                )}
                <h3 className="font-display text-2xl md:text-3xl lg:text-4xl font-semibold text-white mb-3">
                  {language === 'ar' ? (mainBanner.title_ar || mainBanner.title) : (mainBanner.title || mainBanner.title_ar)}
                </h3>
                {(mainBanner.subtitle || mainBanner.subtitle_ar) && (
                  <p className="text-gray-300 mb-6 max-w-md">
                    {language === 'ar' ? (mainBanner.subtitle_ar || mainBanner.subtitle) : (mainBanner.subtitle || mainBanner.subtitle_ar)}
                  </p>
                )}
                <Link
                  to={mainBanner.link || '/shop'}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-[#B8956E] text-white font-medium rounded-md hover:bg-[#A07F5D] transition-colors w-fit"
                >
                  {language === 'ar' ? 'تسوق الآن' : 'Shop Now'}
                  <ArrowRight className="h-4 w-4 rtl:rotate-180" />
                </Link>
              </div>
            </motion.div>
          )}

          {/* Side Banners */}
          {sideBanners.map((banner, index) => (
            <motion.div
              key={banner.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: (index + 1) * 0.1 }}
              className="relative aspect-[4/3] rounded-sm overflow-hidden group"
            >
              <img
                loading="lazy"
                decoding="async"
                src={banner.image_url}
                alt={language === 'ar' ? banner.title_ar : banner.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
              <div className="absolute inset-0 flex flex-col justify-end p-6">
                <h3 className="font-display text-xl md:text-2xl font-semibold text-white mb-2">
                  {language === 'ar' ? (banner.title_ar || banner.title) : (banner.title || banner.title_ar)}
                </h3>
                <Link
                  to={banner.link || '/shop'}
                  className="text-[#B8956E] font-medium flex items-center gap-1 hover:gap-2 transition-all"
                >
                  {language === 'ar' ? 'تسوق الآن' : 'Shop Now'}
                  <ArrowRight className="h-4 w-4 rtl:rotate-180" />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}