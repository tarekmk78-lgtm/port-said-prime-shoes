import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useI18n } from '../lib/i18n';
import { HeroSection } from '../components/home/HeroSection';
import { NewArrivalsSlider } from '../components/home/NewArrivalsSlider'; 
import { Category, Banner } from '../types';
import { ArrowRight, Truck, ShieldCheck, Award, Sparkles } from 'lucide-react';

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

  return (
    <div className="min-h-screen bg-white">
      
      {/* 1. شريط العروض العلوي (Promo Bar) */}
      <div className="bg-black text-white py-2.5 text-center text-xs md:text-sm font-medium tracking-wide">
        <div className="flex items-center justify-center gap-2 md:gap-6 flex-wrap px-4">
          <span className="flex items-center gap-1">
            <Truck className="w-4 h-4 text-amber-500" />
            {language === 'ar' ? 'شحن مجاني للطلبات فوق 1000 جنيه' : 'Free shipping on orders over 1000 EGP'}
          </span>
          <span className="hidden md:inline text-amber-500">•</span>
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-4 h-4 text-amber-500" />
            {language === 'ar' ? 'ضمان استرجاع خلال 14 يوم' : '14-day easy return policy'}
          </span>
        </div>
      </div>

      {/* 2. Hero Section (المكون الموجود لديك) */}
      <HeroSection />

      {/* 3. وصل حديثاً (المكون الموجود لديك) */}
      <NewArrivalsSlider />

      {/* 4. Banners Section (محسن بتصميم عالمي) */}
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

      {/* 5. Categories Section (تصميم أنظف وأحدث) */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 text-amber-600 font-semibold text-sm mb-3">
              <Sparkles className="w-4 h-4" />
              {language === 'ar' ? 'تشكيلة مميزة' : 'Premium Collection'}
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {language === 'ar' ? 'تسوق حسب الفئة' : 'Shop by Category'}
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              {language === 'ar' 
                ? 'اكتشف مجموعتنا الواسعة من الأحذية العالمية المستوردة' 
                : 'Discover our wide range of imported premium footwear'}
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse bg-gray-200 rounded-2xl h-80"></div>
              ))}
            </div>
          ) : categories.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {categories.map((category) => {
                const categoryName = language === 'ar' ? category.name_ar : category.name;
                const categoryDescription = language === 'ar' ? (category.description_ar || '') : (category.description || '');

                return (
                  <Link
                    key={category.id}
                    to={`/shop?category=${category.slug || category.id}`}
                    className="group relative overflow-hidden rounded-2xl shadow-sm hover:shadow-xl transition-all duration-500 h-80 md:h-96"
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
                        <span className="text-gray-500 text-lg font-medium">{categoryName}</span>
                      </div>
                    )}
                    
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-90 group-hover:opacity-100 transition-opacity" />
                    
                    <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 text-white transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                      <h3 className="text-2xl font-bold mb-2">{categoryName}</h3>
                      {categoryDescription && (
                        <p className="text-white/80 text-sm mb-4 line-clamp-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
                          {categoryDescription}
                        </p>
                      )}
                      <span className="inline-flex items-center gap-2 text-sm font-semibold text-amber-400">
                        {language === 'ar' ? 'تسوق الآن' : 'Shop Now'}
                        <ArrowRight className="w-4 h-4 rtl:rotate-180 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform" />
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

          <div className="text-center mt-12">
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 px-8 py-4 bg-black text-white rounded-full font-semibold hover:bg-gray-800 transition-colors shadow-lg hover:shadow-xl"
            >
              {language === 'ar' ? 'عرض جميع المنتجات' : 'View All Products'}
              <ArrowRight className="w-5 h-5 rtl:rotate-180" />
            </Link>
          </div>
        </div>
      </section>

      {/* 6. Why Choose Us (محدث ليعكس هوية "مستورد ماركات عالمية") */}
      <section className="py-16 md:py-24 bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 md:px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-12">
            {language === 'ar' ? 'لماذا تختارنا؟' : 'Why Choose Us?'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            
            {/* Feature 1 */}
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

            {/* Feature 2 */}
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

            {/* Feature 3 */}
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