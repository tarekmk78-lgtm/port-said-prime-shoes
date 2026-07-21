import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useI18n } from '../lib/i18n';
import { HeroSection } from '../components/home/HeroSection';
import { Category, Banner } from '../types';
import { ArrowRight } from 'lucide-react';

export function HomePage() {
  const { language } = useI18n();
  const [categories, setCategories] = useState<Category[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        // جلب الفئات
        const { data: categoriesData, error: categoriesError } = await supabase
          .from('categories')
          .select('*')
          .eq('is_active', true)
          .order('sort_order', { ascending: true })
          .limit(6);

        // جلب البنرات
        const { data: bannersData, error: bannersError } = await supabase
          .from('banners')
          .select('*')
          .eq('is_active', true)
          .order('sort_order', { ascending: true });

        if (categoriesError) {
          console.error('Error fetching categories:', categoriesError);
        } else {
          setCategories(categoriesData || []);
        }

        if (bannersError) {
          console.error('Error fetching banners:', bannersError);
        } else {
          setBanners(bannersData || []);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <HeroSection />

      {/* Banners Section */}
      {banners.length > 0 && (
        <section className="py-12 md:py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 md:px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {banners.map((banner) => {
                const bannerTitle = language === 'ar' ? banner.title_ar : banner.title;
                const bannerSubtitle = language === 'ar' ? (banner.subtitle_ar || '') : (banner.subtitle || '');
                const buttonText = language === 'ar' ? (banner.button_text_ar || 'اكتشف المزيد') : (banner.button_text || 'Discover More');

                return (
                  <div
                    key={banner.id}
                    className="relative overflow-hidden rounded-lg shadow-lg group"
                  >
                    {/* Banner Image */}
                    <div className="relative h-64 md:h-80 overflow-hidden">
                      <img
                        src={banner.image_url}
                        alt={bannerTitle}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                      
                      {/* Content */}
                      <div className="absolute inset-0 flex flex-col justify-end p-6">
                        <h3 className="font-display text-2xl md:text-3xl font-bold text-white mb-2">
                          {bannerTitle}
                        </h3>
                        {bannerSubtitle && (
                          <p className="text-white/80 text-sm mb-4">
                            {bannerSubtitle}
                          </p>
                        )}
                        {banner.link_url && (
                          <Link
                            to={banner.link_url}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-ink rounded-lg font-semibold hover:bg-gray-100 transition-colors w-fit"
                          >
                            {buttonText}
                            <ArrowRight className="w-4 h-4" />
                          </Link>
                        )}
                      </div>

                      {/* Badge for discount */}
                      {banner.position === 'sale' && (
                        <div className="absolute top-4 right-4 px-3 py-1 bg-red-600 text-white text-sm font-bold rounded-full">
                          {language === 'ar' ? 'عرض خاص' : 'Special Offer'}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Categories Section */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          {/* Section Header */}
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-ink mb-4">
              {language === 'ar' ? 'تسوق حسب الفئة' : 'Shop by Category'}
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              {language === 'ar' 
                ? 'اكتشف مجموعتنا الواسعة من الأحذية الفاخرة' 
                : 'Discover our wide range of premium footwear'}
            </p>
          </div>

          {/* Categories Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-gray-200 rounded-lg h-80"></div>
                </div>
              ))}
            </div>
          ) : categories.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {categories.map((category) => {
                const categoryName = language === 'ar' ? category.name_ar : category.name;
                const categoryDescription = language === 'ar' 
                  ? (category.description_ar || '') 
                  : (category.description || '');

                return (
                  <Link
                    key={category.id}
                    to={`/shop?category=${category.slug}`}
                    className="group relative overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-shadow"
                  >
                    {/* Category Image */}
                    <div className="relative h-80 md:h-96 overflow-hidden">
                      {category.image_url ? (
                        <img
                          src={category.image_url}
                          alt={categoryName}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center">
                          <span className="text-gray-600 text-lg font-medium">
                            {categoryName}
                          </span>
                        </div>
                      )}
                      
                      {/* Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                      
                      {/* Content */}
                      <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                        <h3 className="font-display text-2xl font-bold mb-2">
                          {categoryName}
                        </h3>
                        {categoryDescription && (
                          <p className="text-white/80 text-sm mb-3 line-clamp-2">
                            {categoryDescription}
                          </p>
                        )}
                        <span className="inline-flex items-center gap-2 text-sm font-medium border-b-2 border-white/60 group-hover:border-white transition-colors">
                          {language === 'ar' ? 'تسوق الآن' : 'Shop Now'}
                          <svg 
                            className="w-4 h-4 transition-transform group-hover:translate-x-1 rtl:group-hover:-translate-x-1" 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">
                {language === 'ar' ? 'لا توجد فئات متاحة حالياً' : 'No categories available'}
              </p>
            </div>
          )}

          {/* View All Link */}
          <div className="text-center mt-12">
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 px-8 py-4 bg-ink text-white rounded-lg font-semibold hover:opacity-90 transition-opacity"
              style={{ backgroundColor: 'var(--color-primary)' }}
            >
              {language === 'ar' ? 'عرض جميع المنتجات' : 'View All Products'}
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Section (Optional) */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 md:px-6 text-center">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-ink mb-4">
            {language === 'ar' ? 'لماذا تختارنا؟' : 'Why Choose Us?'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
            <div className="p-6">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="font-display text-xl font-semibold mb-2">
                {language === 'ar' ? 'جودة عالية' : 'Premium Quality'}
              </h3>
              <p className="text-gray-600">
                {language === 'ar' ? 'أحذية مصنوعة يدوياً من أجود الخامات' : 'Handcrafted shoes from the finest materials'}
              </p>
            </div>
            <div className="p-6">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8" />
                </svg>
              </div>
              <h3 className="font-display text-xl font-semibold mb-2">
                {language === 'ar' ? 'توصيل مجاني' : 'Free Shipping'}
              </h3>
              <p className="text-gray-600">
                {language === 'ar' ? 'توصيل مجاني للطلبات فوق 1000 جنيه' : 'Free shipping on orders over 1000 EGP'}
              </p>
            </div>
            <div className="p-6">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
              <h3 className="font-display text-xl font-semibold mb-2">
                {language === 'ar' ? 'استرجاع سهل' : 'Easy Returns'}
              </h3>
              <p className="text-gray-600">
                {language === 'ar' ? 'استرجاع خلال 14 يوم' : '14-day return policy'}
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}