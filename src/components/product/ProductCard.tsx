import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useI18n } from '../../lib/i18n';
import { useCart } from '../../lib/cart-context';
import { useWishlist } from '../../lib/wishlist-context';
import { useAuth } from '../../lib/auth-context';
import { Product } from '../../types';
import { formatPrice, getDiscountPercentage, getWhatsAppUrl } from '../../lib/utils';
import { Heart, ShoppingBag, MessageCircle, Star } from 'lucide-react';
import toast from 'react-hot-toast';

// ✅ صورة fallback موثوقة
const FALLBACK_IMAGE = 'https://placehold.co/600x800/f5f5f5/999999?text=No+Image';

interface ProductCardProps {
  product: Product;
  index?: number;
}

export function ProductCard({ product, index = 0 }: ProductCardProps) {
  const { t, language } = useI18n();
  const { addItem } = useCart();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const [isHovered, setIsHovered] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageError, setImageError] = useState(false);
  
  const wishlisted = isWishlisted(product.id);
  const name = language === 'ar' ? product.name_ar : product.name;
  const discount = product.compare_at_price ? getDiscountPercentage(product.price, product.compare_at_price) : 0;

  // ✅ دالة معالجة خطأ الصورة
  const handleImageError = () => {
    setImageError(true);
  };

  // ✅ الحصول على رابط الصورة المناسب
  const getImageSrc = (index: number = 0) => {
    if (imageError) return FALLBACK_IMAGE;
    if (product.images?.[index]) return product.images[index];
    if (product.images?.[0]) return product.images[0];
    return FALLBACK_IMAGE;
  };

  const handleQuickAdd = async (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    if (!product.variants || product.variants.length === 0) { 
      toast.error(language === 'ar' ? 'يرجى اختيار المقاس أولاً' : 'Please select a size first'); 
      return; 
    }
    const firstVariant = product.variants[0];
    if (firstVariant.stock_quantity <= 0) { 
      toast.error(language === 'ar' ? 'المنتج غير متوفر' : 'Out of stock'); 
      return; 
    }
    await addItem(product, firstVariant, 1);
    toast.success(language === 'ar' ? 'تمت الإضافة للسلة' : 'Added to cart');
  };

  const handleWhatsApp = (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    const url = getWhatsAppUrl('+20123456789', { name: product.name, name_ar: product.name_ar }, product.variants?.[0], 1, product.price, language);
    window.open(url, '_blank');
  };

  const handleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    const nowWishlisted = await toggleWishlist(product);
    toast.success(nowWishlisted ? (language === 'ar' ? 'تمت الإضافة للمفضلة' : 'Added to wishlist') : (language === 'ar' ? 'تمت الإزالة من المفضلة' : 'Removed from wishlist'));
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: index * 0.05 }}>
      <Link to={`/product/${product.slug}`} className="group block" onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => { setIsHovered(false); setCurrentImageIndex(0); }}>
        <div className="relative aspect-[3/4] bg-gray-100 rounded-sm overflow-hidden">
          {/* ✅ الصورة الرئيسية مع معالجة الأخطاء */}
          <img 
            loading="lazy" 
            decoding="async" 
            src={getImageSrc(currentImageIndex)} 
            alt={name} 
            onError={handleImageError}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          
          {product.images?.length > 1 && isHovered && !imageError && (
            <img 
              loading="lazy" 
              decoding="async" 
              src={getImageSrc(1)} 
              alt={name} 
              onError={handleImageError}
              className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500 opacity-0 group-hover:opacity-100"
            />
          )}

          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {product.is_new && <span className="px-3 py-1 bg-[#111111] text-white text-xs font-medium rounded-full">{language === 'ar' ? 'جديد' : 'NEW'}</span>}
            {discount > 0 && <span className="px-3 py-1 bg-red-600 text-white text-xs font-medium rounded-full">-{discount}%</span>}
            {product.is_bestseller && <span className="px-3 py-1 text-white text-xs font-medium rounded-full" style={{ backgroundColor: 'var(--color-primary)' }}>{language === 'ar' ? 'الأكثر مبيعاً' : 'BEST'}</span>}
            {product.stock_quantity === 0 && <span className="px-3 py-1 bg-gray-800 text-white text-xs font-medium rounded-full">{language === 'ar' ? 'نفذ المخزون' : 'SOLD OUT'}</span>}
          </div>

          <button onClick={handleWishlist} className={`absolute top-3 right-3 p-2 rounded-full transition-all duration-300 ${wishlisted ? 'bg-red-500 text-white' : 'bg-white/90 text-gray-700 hover:bg-white'}`}>
            <Heart className={`h-4 w-4 ${wishlisted ? 'fill-current' : ''}`} />
          </button>

          <div className={`absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent transform transition-transform duration-300 ${isHovered ? 'translate-y-0' : 'translate-y-full'}`}>
            <div className="flex gap-2">
              <button onClick={handleQuickAdd} className="flex-1 h-10 bg-white text-[#111111] rounded-md font-medium transition-colors flex items-center justify-center gap-2"
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--color-primary)'; e.currentTarget.style.color = '#fff'; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#fff'; e.currentTarget.style.color = '#111'; }}>
                <ShoppingBag className="h-4 w-4" />
                <span className="text-sm">{language === 'ar' ? 'أضف للسلة' : 'Add to Cart'}</span>
              </button>
              <button onClick={handleWhatsApp} className="h-10 w-10 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors flex items-center justify-center">
                <MessageCircle className="h-4 w-4" />
              </button>
            </div>
          </div>

          {product.images?.length > 1 && !imageError && (
            <div className="absolute bottom-16 left-1/2 -translate-x-1/2 flex gap-1.5">
              {product.images.slice(0, 4).map((_, i) => (
                <button key={i} onMouseEnter={() => setCurrentImageIndex(i)} className={`w-1.5 h-1.5 rounded-full transition-all ${currentImageIndex === i ? 'bg-white w-4' : 'bg-white/50'}`} />
              ))}
            </div>
          )}
        </div>

        <div className="mt-4 space-y-1.5">
          {product.category && <p className="text-xs text-gray-500 uppercase tracking-wide">{language === 'ar' ? product.category.name_ar : product.category.name}</p>}
          <h3 className="font-display font-medium text-ink line-clamp-2 transition-colors group-hover:opacity-80" style={{ '--hover-color': 'var(--color-primary)' } as React.CSSProperties}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-primary)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = '')}>
            {name}
          </h3>
          {product.rating > 0 && (
            <div className="flex items-center gap-1">
              <div className="flex">
                {[1,2,3,4,5].map((star) => <Star key={star} className={`h-3.5 w-3.5 ${star <= Math.round(product.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />)}
              </div>
              <span className="text-xs text-gray-500">({product.reviews_count})</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#111111]">{formatPrice(product.price)}</span>
            {product.compare_at_price && product.compare_at_price > product.price && <span className="text-sm text-gray-400 line-through">{formatPrice(product.compare_at_price)}</span>}
          </div>
          {product.variants && product.variants.length > 0 && (
            <div className="flex gap-1.5 pt-1">
              {product.variants.filter((v, i, arr) => arr.findIndex((item) => item.color === v.color) === i).slice(0, 4).map((variant) => (
                <div key={variant.id} className="h-4 w-4 rounded-full border border-gray-200" style={{ backgroundColor: variant.color_code || variant.color.toLowerCase() }} title={variant.color} />
              ))}
            </div>
          )}
        </div>
      </Link>
    </motion.div>
  );
}