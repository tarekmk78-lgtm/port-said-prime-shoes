import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useI18n } from '../lib/i18n';
import { HeroSection } from '../components/home/HeroSection';
import { NewArrivalsSlider } from '../components/home/NewArrivalsSlider'; 
import { Category, Banner } from '../types';
import { ArrowRight, Truck, ShieldCheck, Award, Sparkles, CreditCard, Factory, Gem } from 'lucide-react';

export function HomePage() {
  const { language } = useI18n();
  const [categories, setCategories] = useState<Category[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const { data: categoriesData } = await supabase
          .from('categories')
          .select('*')
          .eq('is_active', true)
          .order('sort_order', { ascending: true })
          .limit(6);

        const { data: bannersData } = await supabase
          .from('banners')
          .select('*')
          .eq('is_active', true)
          .order('sort_order', { ascending: true });

        setCategories(categoriesData || []);
        setBanners(bannersData || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // بيانات الشريط المتحرك
  const features = [
    { icon: CreditCard, text_ar: 'دفع آمن وسهل', text_en: 'Secure & Easy Payment' },
    { icon: ShieldCheck, text_ar: 'ضمان استرجاع 14 يوم', text_en: '14-Day Return Guarantee' },
    { icon: Truck, text_ar: 'شحن مجاني عند شراء أكثر من حذاء', text_en: 'Free Shipping on 2+ Shoes' },
    { icon: Factory, text_ar: 'صناعة فيتنامي عالية الجودة', text_en: 'High-Quality Vietnamese Craftsmanship' },
    { icon: Gem, text_ar: 'جلد طبيعي 100%', text_en: '100% Genuine Leather' },
  ];

  return (
    <div className="min-h-screen bg-white">
      
      {/* 1. Hero Section */}
      <HeroSection />

      {/* 2. الشريط المتحرك (Marquee) */}
      <div className="bg-black text-white py-4 overflow-hidden">
        <div className="flex animate-marquee whitespace-nowrap">
          {[...features, ...features].map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div key={index} className="flex items-center gap-3 mx-8 shrink-0">
                <Icon className="w-5 h-5 text-amber-500" />
                <span className="text-sm font-medium">
                  {language === 'ar' ? feature.text_ar : feature.text_en}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. تسوق حسب الفئة (6 فئات في سطر واحد على الديسكتوب) */}
      <section className="py-12 md:py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="text-center mb-8 md:mb-12">
            <div className="inline-flex items-center gap-2 text-amber-600 font-semibold text-sm mb-3">
              <Sparkles className="w-4 h-4" />
              {language === 'ar' ? 'تشكيلة مميزة' : 'Premium Collection'}
            </div>
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              {language === 'ar' ? 'تسوق حسب الفئة' : 'Shop by Category'}
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-sm md:text-base">
              {language === 'ar' 
                ? 'اكتشف مجموعتنا الواسعة من الأحذية العالمية المستوردة' 
                : 'Discover our wide range of imported premium footwear'}
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="animate-pulse bg-gray-200 rounded-xl h-48 md:h-56"></div>
              ))}
            </div>
          ) : categories.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
              {categories.map((category) => {
                const categoryName = language === 'ar' ? category.name_ar : category.name;
                const categoryDescription = language === 'ar' ? (category.description_ar || '') : (category.description || '');

                return (
                  <Link
                    key={category.id}
                    to={`/shop?category=${category.slug || category.id}`}
                    className="group relative overflow-hidden rounded-xl shadow-sm hover:shadow-xl transition-all duration-500 h-48 md:h-56 lg:h-64"
                  >
                    {category.image_url ? (
                      <img
                        src={category.image_url}
                        alt={categoryName}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-500 text-sm md:text-base font-medium">{categoryName}</span>
                      </div>
                    )}
                    
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-90 group-hover:opacity-100 transition-opacity" />
                    
                    <div className="absolute bottom-0 left-0 right-0 p-3 md:p-4 text-white">
                      <h3 className="text-sm md:text-base lg:text-lg font-bold mb-1 leading-tight">
                        {categoryName}
                      </h3>
                      {categoryDescription && (
                        <p className="text-white/80 text-xs md:text-sm mb-2 line-clamp-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          {categoryDescription}
                        </p>
                      )}
                      <span className="inline-flex items-center gap-1 text-xs md:text-sm font-semibold text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        {language === 'ar' ? 'تسوق' : 'Shop'}
                        <ArrowRight className="w-3 h-3 md:w-4 md:h-4 rtl:rotate-180" />
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              {language === 'ar' ? 'لا توجد فئات متاحة حالياً' : 'No categories available'}
            </div>
          )}

          <div className="text-center mt-8 md:mt-12">
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 px-6 md:px-8 py-3 md:py-4 bg-black text-white rounded-full font-semibold hover:bg-gray-800 transition-colors shadow-lg hover:shadow-xl text-sm md:text-base"
            >
              {language === 'ar' ? 'عرض جميع المنتجات' : 'View All Products'}
              <ArrowRight className="w-4 h-4 md:w-5 md:h-5 rtl:rotate-180" />
            </Link>
          </div>
        </div>
      </section>

      {/* 4. وصل حديثاً */}
      <NewArrivalsSlider />

      {/* 5. Banners Section */}
      {banners.length > 0 && (
        <section className="py-12 md:py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 md:px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {banners.map((banner) => {
                const bannerTitle = language === 'ar' ? banner.title_ar : banner.title;
                const bannerSubtitle = language === 'ar' ? (banner.subtitle_ar || '') : (banner.subtitle || '');
                const buttonText = language === 'ar' ? (banner.button_text_ar || 'اكتشف المزيد') : (banner.button_text || 'Discover More');

                return (
                  <Link
                    key={banner.id}
                    to={banner.link_url || '/shop'}
                    className="relative overflow-hidden rounded-2xl shadow-sm group h-72 md:h-80"
                  >
                    <img
                      src={banner.image_url}
                      alt={bannerTitle}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                    
                    <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-8">
                      {banner.position === 'sale' && (
                        <span className="absolute top-4 right-4 px-3 py-1 bg-amber-500 text-black text-xs font-bold rounded-full uppercase tracking-wider">
                          {language === 'ar' ? 'عرض خاص' : 'Special Offer'}
                        </span>
                      )}
                      <h3 className="font-display text-2xl md:text-3xl font-bold text-white mb-2">
                        {bannerTitle}
                      </h3>
                      {bannerSubtitle && (
                        <p className="text-white/80 text-sm mb-4 line-clamp-2">
                          {bannerSubtitle}
                        </p>
                      )}
                      <span className="inline-flex items-center gap-2 text-white font-semibold text-sm border-b border-white/50 pb-1 w-fit group-hover:border-amber-500 group-hover:text-amber-500 transition-colors">
                        {buttonText}
                        <ArrowRight className="w-4 h-4 rtl:rotate-180" />
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* 6. Why Choose Us */}
      <section className="py-16 md:py-24 bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 md:px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-12">
            {language === 'ar' ? 'لماذا تختارنا؟' : 'Why Choose Us?'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            
            <div className="p-6 rounded-2xl hover:bg-gray-50 transition-colors duration-300">
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-black flex items-center justify-center">
                <Award className="w-8 h-8 text-amber-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                {language === 'ar' ? 'ماركات عالمية أصلية' : 'Authentic Global Brands'}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {language === 'ar' 
                  ? 'نستورد لك أفضل الماركات العالمية بضمان الأصالة والجودة العالية' 
                  : 'We import the best global brands with guaranteed authenticity and high quality'}
              </p>
            </div>

            <div className="p-6 rounded-2xl hover:bg-gray-50 transition-colors duration-300">
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-black flex items-center justify-center">
                <Truck className="w-8 h-8 text-amber-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                {language === 'ar' ? 'شحن سريع وآمن' : 'Fast & Secure Shipping'}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {language === 'ar' 
                  ? 'توصيل سريع لجميع محافظات مصر مع شحن مجاني للطلبات المميزة' 
                  : 'Fast delivery to all Egyptian governorates with free shipping on premium orders'}
              </p>
            </div>

            <div className="p-6 rounded-2xl hover:bg-gray-50 transition-colors duration-300">
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-black flex items-center justify-center">
                <ShieldCheck className="w-8 h-8 text-amber-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                {language === 'ar' ? 'ضمان استرجاع 14 يوم' : '14-Day Return Guarantee'}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {language === 'ar' 
                  ? 'تسوق بثقة تامة مع سياسة استرجاع واستبدال مرنة خلال 14 يوماً' 
                  : 'Shop with complete confidence with our flexible 14-day return and exchange policy'}
              </p>
            </div>

          </div>
        </div>
      </section>

    </div>
  );
}