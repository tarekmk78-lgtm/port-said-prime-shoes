import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useI18n } from '../../lib/i18n';
import { Product } from '../../types';
import { ProductCard } from '../product/ProductCard';
import { ArrowRight } from 'lucide-react';

interface ProductsSectionProps {
  title: string;
  products: Product[];
  viewAllLink?: string;
  eyebrow?: string;
}

export function ProductsSection({ title, products, viewAllLink, eyebrow }: ProductsSectionProps) {
  const { language, isRTL } = useI18n();

  if (products.length === 0) return null;

  return (
    <section className="py-12 md:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="flex items-end justify-between mb-8 md:mb-12">
          <div>
            {eyebrow && <span className="eyebrow">{eyebrow}</span>}
            <h2 className="font-display text-2xl md:text-3xl font-semibold text-ink mt-2">
              {title}
            </h2>
          </div>
          {viewAllLink && (
            <Link
              to={viewAllLink}
              className="text-[#B8956E] font-medium flex items-center gap-1 hover:gap-2 transition-all"
            >
              {language === 'ar' ? 'عرض الكل' : 'View All'}
              <ArrowRight className={`h-4 w-4 ${isRTL ? 'rotate-180' : ''}`} />
            </Link>
          )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {products.slice(0, 8).map((product, index) => (
            <ProductCard key={product.id} product={product} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
