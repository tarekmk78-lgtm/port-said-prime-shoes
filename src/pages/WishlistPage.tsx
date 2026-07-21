import React from 'react';
import { Link } from 'react-router-dom';
import { useI18n } from '../lib/i18n';
import { useWishlist } from '../lib/wishlist-context';
import { ProductCard } from '../components/product/ProductCard';
import { Heart, ArrowRight } from 'lucide-react';

export function WishlistPage() {
  const { language, isRTL } = useI18n();
  const { products, loading } = useWishlist();

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <div className="bg-ink py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 md:px-6 text-center">
          <span className="eyebrow justify-center text-gold-light">
            <Heart className="h-3.5 w-3.5" />
            {language === 'ar' ? 'مفضّلاتك' : 'Saved for you'}
          </span>
          <h1 className="font-display text-3xl md:text-4xl font-semibold text-white mt-3">
            {language === 'ar' ? 'قائمة الرغبات' : 'My Wishlist'}
          </h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-12 md:py-16">
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="aspect-[3/4] bg-gray-100 rounded-sm animate-pulse" />
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {products.map((product, index) => (
              <ProductCard key={product.id} product={product} index={index} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <Heart className="h-10 w-10 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg font-display mb-2">
              {language === 'ar' ? 'قائمة رغباتك فاضية' : 'Your wishlist is empty'}
            </p>
            <p className="text-gray-400 mb-6">
              {language === 'ar'
                ? 'اضغط على ♡ في أي منتج عشان تحفظه هنا'
                : 'Tap the heart icon on any product to save it here'}
            </p>
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 text-gold font-medium hover:gap-3 transition-all"
            >
              {language === 'ar' ? 'تسوق الآن' : 'Start shopping'}
              <ArrowRight className={`h-4 w-4 ${isRTL ? 'rotate-180' : ''}`} />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
