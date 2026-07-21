import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useI18n } from '../../lib/i18n';
import { Category } from '../../types';
import { ArrowRight } from 'lucide-react';

interface CategorySectionProps {
  categories: Category[];
}

export function CategorySection({ categories }: CategorySectionProps) {
  const { t, language } = useI18n();

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="flex items-end justify-between mb-10">
          <div>
            <span className="eyebrow">
              {language === 'ar' ? 'تسوّق' : 'Browse'}
            </span>
            <h2 className="font-display text-2xl md:text-3xl font-semibold text-ink mt-2">
              {language === 'ar' ? 'تسوق حسب الفئة' : 'Shop by Category'}
            </h2>
          </div>
          <Link
            to="/shop"
            className="text-[#B8956E] font-medium flex items-center gap-1 hover:gap-2 transition-all"
          >
            {t('products.viewAll')}
            <ArrowRight className="h-4 w-4 rtl:rotate-180" />
          </Link>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-100px' }}
          className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6"
        >
          {categories.map((category) => (
            <motion.div key={category.id} variants={itemVariants}>
              <Link
                to={`/shop?category=${category.slug}`}
                className="group relative aspect-[3/4] rounded-sm overflow-hidden block"
              >
                <img loading="lazy" decoding="async"
                  src={
                    category.image_url ||
                    `https://images.unsplash.com/photo-1460353581641-37baddab0f0?q=80&w=600`
                  }
                  alt={language === 'ar' ? category.name_ar : category.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/10 to-transparent" />
                <div className="absolute inset-0 flex flex-col items-start justify-end p-5">
                  <h3 className="font-display text-white text-lg font-semibold mb-1.5">
                    {language === 'ar' ? category.name_ar : category.name}
                  </h3>
                  <span className="text-[#D9BB96] text-sm flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {language === 'ar' ? 'تسوق الآن' : 'Shop Now'}
                    <ArrowRight className="h-4 w-4 rtl:rotate-180" />
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
