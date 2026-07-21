import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useI18n } from '../lib/i18n';
import { Category } from '../types';
import { supabase } from '../lib/supabase';
import { ArrowRight } from 'lucide-react';
import { useSEO } from '../lib/seo';

export function CategoriesPage() {
  const { t, language, isRTL } = useI18n();

  useSEO({
    title: language === 'ar' ? 'التصنيفات' : 'Categories',
    description:
      language === 'ar'
        ? 'تصفح كل تصنيفات الأحذية في بورسعيد برايم شوز'
        : 'Browse all footwear categories at Port Said Prime Shoes',
    url: '/categories',
  });
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const { data } = await supabase
          .from('categories')
          .select('*')
          .eq('is_active', true)
          .order('sort_order');
        setCategories(data || []);
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchCategories();
  }, []);

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* Page header banner */}
      <div className="bg-ink py-14 md:py-20">
        <div className="max-w-7xl mx-auto px-4 md:px-6 text-center">
          <span className="eyebrow justify-center text-gold-light">
            {language === 'ar' ? 'تسوّق بحسب' : 'Browse by'}
          </span>
          <h1 className="font-display text-3xl md:text-4xl font-semibold text-white mt-3">
            {language === 'ar' ? 'الفئات' : 'Categories'}
          </h1>
          <p className="text-white/55 mt-3">
            {language === 'ar'
              ? 'كل تشكيلاتنا في مكان واحد، مرتبة لتسهيل التسوق'
              : 'Every collection we carry, organized for easy browsing'}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-12 md:py-16">
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="aspect-[3/4] rounded-sm bg-gray-100 animate-pulse" />
            ))}
          </div>
        ) : categories.length > 0 ? (
          <motion.div
            initial="hidden"
            animate="show"
            variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08 } } }}
            className="grid grid-cols-2 md:grid-cols-3 gap-5 md:gap-6"
          >
            {categories.map((category) => (
              <motion.div
                key={category.id}
                variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }}
              >
                <Link
                  to={`/shop?category=${category.slug}`}
                  className="group relative aspect-[3/4] rounded-sm overflow-hidden block"
                >
                  <img loading="lazy" decoding="async"
                    src={category.image_url || 'https://images.unsplash.com/photo-1460353581641-37baddab0f0?q=80&w=600'}
                    alt={language === 'ar' ? category.name_ar : category.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/15 to-transparent" />
                  <div className="absolute inset-0 flex flex-col items-start justify-end p-6">
                    <h3 className="font-display text-white text-xl font-semibold mb-1.5">
                      {language === 'ar' ? category.name_ar : category.name}
                    </h3>
                    <span className="text-[#D9BB96] text-sm flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {language === 'ar' ? 'تسوق الآن' : 'Shop Now'}
                      <ArrowRight className={`h-4 w-4 ${isRTL ? 'rotate-180' : ''}`} />
                    </span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <p className="text-center text-gray-500 py-16 font-display">
            {language === 'ar' ? 'لا توجد فئات حالياً' : 'No categories yet'}
          </p>
        )}
      </div>
    </div>
  );
}
