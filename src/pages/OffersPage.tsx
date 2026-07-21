import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useI18n } from '../lib/i18n';
import { Product } from '../types';
import { supabase } from '../lib/supabase';
import { ProductCard } from '../components/product/ProductCard';
import { ProductGridSkeleton } from '../components/ui/Skeleton';
import { Tag, ArrowRight } from 'lucide-react';
import { useSEO } from '../lib/seo';

export function OffersPage() {
  const { language, isRTL } = useI18n();

  useSEO({
    title: language === 'ar' ? 'العروض' : 'Offers',
    description:
      language === 'ar'
        ? 'اكتشف أحدث العروض والخصومات على تشكيلة بورسعيد برايم شوز'
        : 'Discover the latest offers and discounts on the Port Said Prime Shoes collection',
    url: '/offers',
  });
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function fetchOffers() {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*, categories(*)')
          .eq('is_active', true)
          .not('compare_at_price', 'is', null)
          .gt('compare_at_price', 0)
          .order('created_at', { ascending: false });
        if (error) throw error;
        setProducts(data || []);
      } catch (error) {
        console.error('Error fetching offers:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchOffers();
  }, []);

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* Hero banner */}
      <div className="relative bg-ink py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <img loading="lazy" decoding="async"
            src="https://images.unsplash.com/photo-1549298916-b23d1d5995a6?q=80&w=1600"
            alt=""
            className="w-full h-full object-cover"
          />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 md:px-6 text-center">
          <span className="eyebrow justify-center text-gold-light">
            <Tag className="h-3.5 w-3.5" />
            {language === 'ar' ? 'لفترة محدودة' : 'For a limited time'}
          </span>
          <h1 className="font-display text-3xl md:text-5xl font-semibold text-white mt-4">
            {language === 'ar' ? 'العروض الحالية' : 'Current Offers'}
          </h1>
          <p className="text-white/55 mt-3 max-w-xl mx-auto">
            {language === 'ar'
              ? 'تشكيلة مختارة بخصومات حقيقية — لحد ما تخلص الكمية'
              : 'A curated selection at genuine discounts — while stock lasts'}
          </p>
        </div>
        <div className="sole-curve" style={{ background: '#FAFAFA' }} />
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-12 md:py-16">
        {loading ? (
          <ProductGridSkeleton count={8} />
        ) : products.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {products.map((product, index) => (
              <ProductCard key={product.id} product={product} index={index} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <Tag className="h-10 w-10 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg font-display mb-2">
              {language === 'ar' ? 'لا توجد عروض حالياً' : 'No offers right now'}
            </p>
            <p className="text-gray-400 mb-6">
              {language === 'ar'
                ? 'تابعنا، العروض الجديدة قريبة'
                : 'Check back soon — new offers are on the way'}
            </p>
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 text-gold font-medium hover:gap-3 transition-all"
            >
              {language === 'ar' ? 'تسوق كل المنتجات' : 'Shop all products'}
              <ArrowRight className={`h-4 w-4 ${isRTL ? 'rotate-180' : ''}`} />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
