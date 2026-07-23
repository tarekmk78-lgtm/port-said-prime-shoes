import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useI18n } from '../lib/i18n';
import { useCart } from '../lib/cart-context';
import { useWishlist } from '../lib/wishlist-context';
import { useWhatsAppNumber } from '../lib/settings-context';
import { Product, ProductVariant, Review } from '../types';
import { supabase } from '../lib/supabase';
import { formatPrice, getDiscountPercentage, getWhatsAppUrl } from '../lib/utils';
import { useSEO, useJsonLd, buildProductSchema, buildBreadcrumbSchema } from '../lib/seo';
import { ProductCard } from '../components/product/ProductCard';
import { ReviewForm } from '../components/product/ReviewForm';
import { ProductGridSkeleton } from '../components/ui/Skeleton';
import { Button } from '../components/ui/Button';
import toast from 'react-hot-toast';
import {
  Heart, Minus, Plus, Star,
  Truck, RotateCcw, Shield, MessageCircle,
  ChevronRight, ChevronLeft, Package,
} from 'lucide-react';

export function ProductPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { language, t } = useI18n();
  const { addItem } = useCart();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const whatsappNumber = useWhatsAppNumber();
  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState<Product | null>(null);
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [currentImage, setCurrentImage] = useState(0);
  const [activeTab, setActiveTab] = useState<'description' | 'reviews'>('description');
  const [isZoomed, setIsZoomed] = useState(false);

  const displayName = product ? (language === 'ar' ? product.name_ar : product.name) : '';
  const displayDescription = product
    ? (language === 'ar' ? product.description_ar : product.description) || ''
    : '';

  useSEO({
    title: displayName || (language === 'ar' ? 'منتج' : 'Product'),
    description: displayDescription.slice(0, 160) || (language === 'ar' ? 'تسوق من بورسعيد برايم شوز' : 'Shop at Port Said Prime Shoes'),
    image: product?.images?.[0],
    url: slug ? `/product/${slug}` : undefined,
    type: 'product',
  });

  useJsonLd(
    product
      ? [
          buildProductSchema({
            name: displayName,
            description: displayDescription,
            images: product.images,
            price: product.price,
            sku: product.sku,
            rating: product.rating,
            reviews_count: product.reviews_count,
            stock_quantity: product.stock_quantity,
            slug: product.slug,
          }),
          buildBreadcrumbSchema([
            { name: language === 'ar' ? 'الرئيسية' : 'Home', url: '/' },
            { name: language === 'ar' ? 'المتجر' : 'Shop', url: '/shop' },
            { name: displayName, url: `/product/${product.slug}` },
          ]),
        ]
      : []
  );

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

   useEffect(() => {
    async function fetchProduct() {
      if (!slug) return;
      setLoading(true);
      try {
        // 1. جلب بيانات المنتج فقط (بدون Join) واستخدام maybeSingle() لمنع خطأ 406
        const { data: productData, error } = await supabase
          .from('products')
          .select('*')
          .eq('slug', slug)
          .eq('is_active', true)
          .maybeSingle(); // maybeSingle أكثر أماناً من single

        if (error || !productData) {
          console.error('Product not found or error:', error);
          setProduct(null);
          setLoading(false);
          return;
        }

        // 2. جلب بيانات الفئة (Category) بشكل منفصل
        let categoryData = null;
        if (productData.category_id) {
          const { data: catData } = await supabase
            .from('categories')
            .select('id, name, name_ar, slug')
            .eq('id', productData.category_id)
            .maybeSingle();
          categoryData = catData;
        }

        // 3. دمج البيانات لتتوافق مع شكل الـ JSX (الذي يتوقع product.category)
        const enrichedProduct = {
          ...productData,
          category: categoryData,
        };
        setProduct(enrichedProduct);

        // 4. جلب المتغيرات (Variants)
        const { data: variantsData } = await supabase
          .from('product_variants')
          .select('*')
          .eq('product_id', productData.id);
        setVariants(variantsData || []);

        // 5. جلب التقييمات (Reviews)
        const { data: reviewsData } = await supabase
          .from('reviews')
          .select('*, profiles(full_name, avatar_url)') // تأكد من اسم الجدول profiles أو users حسب قاعدة بياناتك
          .eq('product_id', productData.id)
          .eq('is_approved', true)
          .order('created_at', { ascending: false });
        setReviews(reviewsData || []);

        // 6. جلب المنتجات المشابهة
        if (productData.category_id) {
          const { data: relatedData } = await supabase
            .from('products')
            .select('*, categories(name, name_ar, slug)')
            .eq('category_id', productData.category_id)
            .eq('is_active', true)
            .neq('id', productData.id)
            .limit(4);
          setRelatedProducts(relatedData || []);
        }

        // 7. إعداد الألوان والمقاسات الافتراضية
        if (variantsData && variantsData.length > 0) {
          const uniqueColors = variantsData.filter(
            (v, i, arr) => arr.findIndex((item) => item.color === v.color) === i
          );
          setSelectedColor(uniqueColors[0]?.color || null);
          setSelectedSize(variantsData[0]?.size || null);
          setSelectedVariant(variantsData[0] || null);
        }
      } catch (error) {
        console.error('Error fetching product:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchProduct();
  }, [slug]);
  useEffect(() => {
    if (!selectedColor || !variants.length) return;
    const colorVariants = variants.filter((v) => v.color === selectedColor);
    if (
      colorVariants.length > 0 &&
      (!selectedSize || !colorVariants.find((v) => v.size === selectedSize))
    ) {
      setSelectedSize(colorVariants[0]?.size || null);
    }
    const variant = variants.find(
      (v) => v.color === selectedColor && v.size === selectedSize
    );
    setSelectedVariant(variant || colorVariants[0] || null);
  }, [selectedColor, selectedSize, variants]);

  const availableColors = variants.filter(
    (v, i, arr) => arr.findIndex((item) => item.color === v.color) === i
  );
  const availableSizes = selectedColor
    ? variants.filter((v) => v.color === selectedColor)
    : [];

  const handleAddToCart = async () => {
    if (!product) return;
    if (!selectedVariant) {
      toast.error(language === 'ar' ? 'يرجى اختيار المقاس واللون' : 'Please select size and color');
      return;
    }
    if (selectedVariant.stock_quantity <= 0) {
      toast.error(language === 'ar' ? 'المنتج غير متوفر' : 'Out of stock');
      return;
    }
    await addItem(product, selectedVariant, quantity);
    toast.success(language === 'ar' ? 'تمت الإضافة للسلة' : 'Added to cart');
  };

  const handleWhatsApp = () => {
    if (!product) return;
    const url = getWhatsAppUrl(
      whatsappNumber,
      { name: product.name, name_ar: product.name_ar },
      selectedVariant,
      quantity,
      product.price,
      language
    );
    window.open(url, '_blank');
  };

  const handleWhatsAppOrder = () => {
    if (!selectedVariant) {
      toast.error(language === 'ar' ? 'يرجى اختيار المقاس أولاً' : 'Please select a size first');
      return;
    }
    navigate('/checkout/whatsapp', {
      state: {
        product: product,
        variant: selectedVariant,
      },
    });
  };

  if (loading)
    return (
      <div className="min-h-screen pb-16">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
          <ProductGridSkeleton count={1} />
        </div>
      </div>
    );

  if (!product)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {language === 'ar' ? 'المنتج غير موجود' : 'Product Not Found'}
          </h1>
          <Link to="/shop" className="hover:underline" style={{ color: 'var(--color-primary)' }}>
            {language === 'ar' ? 'العودة للمتجر' : 'Back to Shop'}
          </Link>
        </div>
      </div>
    );

  const discount = product.compare_at_price
    ? getDiscountPercentage(product.price, product.compare_at_price)
    : 0;
  const name = language === 'ar' ? product.name_ar : product.name;
  const description = language === 'ar' ? product.description_ar : product.description;

  return (
    <div className="min-h-screen bg-white pb-24 md:pb-16">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6 pt-2 overflow-x-auto whitespace-nowrap">
          <Link to="/" className="hover:underline shrink-0" style={{ color: 'var(--color-primary)' }}>
            {language === 'ar' ? 'الرئيسية' : 'Home'}
          </Link>
          <ChevronRight className="h-4 w-4 shrink-0" />
          <Link to="/shop" className="hover:underline shrink-0" style={{ color: 'var(--color-primary)' }}>
            {language === 'ar' ? 'المتجر' : 'Shop'}
          </Link>
          {product.category && (
            <>
              <ChevronRight className="h-4 w-4 shrink-0" />
              <Link
                to={`/shop?category=${product.category.slug}`}
                className="hover:underline shrink-0"
                style={{ color: 'var(--color-primary)' }}
              >
                {language === 'ar' ? product.category.name_ar : product.category.name}
              </Link>
            </>
          )}
          <ChevronRight className="h-4 w-4 shrink-0" />
          <span className="text-gray-900 truncate">{name}</span>
        </nav>

        {/* Main Grid */}
        <div className="flex flex-col lg:grid lg:grid-cols-2 gap-6 lg:gap-12">
          {/* Images */}
          <div className="w-full">
            <div
              className="zoom-container product-image-container relative w-full rounded-sm overflow-hidden bg-gray-100 mb-3"
              style={{ height: '600px' }}
              onMouseEnter={() => setIsZoomed(true)}
              onMouseLeave={() => setIsZoomed(false)}
            >
              <img
                loading="eager"
                decoding="async"
                src={
                  product.images?.[currentImage] ||
                  product.images?.[0] ||
                  'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800'
                }
                alt={name}
                className="zoom-image product-image-full w-full h-full"
                style={{
                  objectFit: 'contain',
                  transform: isZoomed ? 'scale(1.5)' : 'scale(1)',
                  transition: 'transform 0.3s ease',
                  transformOrigin: 'center center',
                  cursor: 'zoom-in',
                }}
              />
              {discount > 0 && (
                <span className="absolute top-3 left-3 px-2 py-1 bg-red-600 text-white text-xs font-medium rounded-full z-10">
                  -{discount}%
                </span>
              )}
              {product.is_new && (
                <span className="absolute top-3 right-3 px-2 py-1 bg-[#111] text-white text-xs font-medium rounded-full z-10">
                  {language === 'ar' ? 'جديد' : 'NEW'}
                </span>
              )}
              {product.images && product.images.length > 1 && (
                <>
                  <button
                    onClick={() => setCurrentImage((p) => (p === 0 ? product.images.length - 1 : p - 1))}
                    className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 rounded-full shadow flex items-center justify-center z-10"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setCurrentImage((p) => (p === product.images.length - 1 ? 0 : p + 1))}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 rounded-full shadow flex items-center justify-center z-10"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </>
              )}
            </div>
            {product.images && product.images.length > 1 && (
              <div className="thumbnail-container">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImage(index)}
                    className={`thumbnail-image ${currentImage === index ? 'active' : ''}`}
                  >
                    <img
                      loading="lazy"
                      decoding="async"
                      src={image}
                      alt={`${name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="w-full">
            {product.category && (
              <Link
                to={`/shop?category=${product.category.slug}`}
                className="text-xs uppercase tracking-wide hover:underline"
                style={{ color: 'var(--color-primary)' }}
              >
                {language === 'ar' ? product.category.name_ar : product.category.name}
              </Link>
            )}
            <h1 className="font-display text-xl md:text-3xl font-semibold text-ink mt-2 mb-3">{name}</h1>

            {/* Rating */}
            <div className="flex items-center gap-2 mb-4">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-4 w-4 ${star <= Math.round(product.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                  />
                ))}
              </div>
              <span className="text-gray-500 text-sm">
                ({product.reviews_count} {language === 'ar' ? 'تقييم' : 'reviews'})
              </span>
            </div>

            {/* Price */}
            <div className="flex items-center flex-wrap gap-3 mb-5">
              <span className="text-2xl font-bold text-ink">{formatPrice(product.price)}</span>
              {product.compare_at_price && product.compare_at_price > product.price && (
                <span className="text-lg text-gray-400 line-through">{formatPrice(product.compare_at_price)}</span>
              )}
              {discount > 0 && (
                <span className="px-2 py-1 bg-red-100 text-red-600 text-xs font-medium rounded">
                  {language === 'ar' ? `وفر ${discount}%` : `Save ${discount}%`}
                </span>
              )}
            </div>

            {/* Color */}
            {availableColors.length > 0 && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('product.selectColor')}:{' '}
                  <span className="text-gray-900">{selectedColor}</span>
                </label>
                <div className="flex gap-2 flex-wrap">
                  {availableColors.map((variant) => (
                    <button
                      key={variant.id}
                      onClick={() => setSelectedColor(variant.color)}
                      className="w-9 h-9 rounded-full border-2 transition-all"
                      style={{
                        backgroundColor: variant.color_code || variant.color.toLowerCase(),
                        borderColor: selectedColor === variant.color ? 'var(--color-primary)' : '#e5e7eb',
                      }}
                      title={variant.color}
                    >
                      {selectedColor === variant.color && (
                        <svg className="w-5 h-5 mx-auto text-white drop-shadow" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Size */}
            {availableSizes.length > 0 && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('product.selectSize')}</label>
                <div className="flex flex-wrap gap-2">
                  {availableSizes.map((variant) => (
                    <button
                      key={variant.id}
                      onClick={() => setSelectedSize(variant.size)}
                      disabled={variant.stock_quantity <= 0}
                      className="min-w-[44px] h-10 px-3 rounded-lg border-2 font-medium transition-all text-sm"
                      style={{
                        borderColor: selectedSize === variant.size ? 'var(--color-primary)' : '#e5e7eb',
                        backgroundColor:
                          selectedSize === variant.size
                            ? 'var(--color-primary)'
                            : variant.stock_quantity <= 0
                            ? '#f3f4f6'
                            : '#fff',
                        color: selectedSize === variant.size ? '#fff' : variant.stock_quantity <= 0 ? '#9ca3af' : '#111',
                        cursor: variant.stock_quantity <= 0 ? 'not-allowed' : 'pointer',
                      }}
                    >
                      {variant.size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('product.quantity')}</label>
              <div className="flex items-center gap-4">
                <div className="flex items-center border-2 border-gray-200 rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 flex items-center justify-center hover:bg-gray-100"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="w-10 text-center font-medium text-sm">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-10 h-10 flex items-center justify-center hover:bg-gray-100"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                <span className="text-gray-500 text-sm">
                  {selectedVariant?.stock_quantity || product.stock_quantity}{' '}
                  {language === 'ar' ? 'متوفر' : 'available'}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 mb-3">
              <Button
                size="lg"
                onClick={handleAddToCart}
                disabled={selectedVariant?.stock_quantity === 0}
                fullWidth
              >
                {t('product.addToCart')}
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={handleWhatsApp}
                className="min-w-[48px]"
              >
                <MessageCircle className="h-5 w-5" />
              </Button>
              <Button
                size="lg"
                variant="ghost"
                onClick={() => product && toggleWishlist(product)}
                className={`min-w-[48px] ${product && isWishlisted(product.id) ? 'text-red-500' : ''}`}
              >
                <Heart className={`h-5 w-5 ${product && isWishlisted(product.id) ? 'fill-current' : ''}`} />
              </Button>
            </div>

            {/* زر اطلب الآن عبر الواتساب */}
            <Button
              size="lg"
              fullWidth
              onClick={handleWhatsAppOrder}
              className="mb-5 bg-green-600 hover:bg-green-700 text-white"
              disabled={!selectedVariant}
            >
              <Package className="h-5 w-5 mr-2" />
              {language === 'ar' ? 'اطلب الآن عبر الواتساب' : 'Order Now via WhatsApp'}
            </Button>

            {/* Features */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { Icon: Truck, label: language === 'ar' ? 'توصيل مجاني' : 'Free Shipping' },
                { Icon: RotateCcw, label: language === 'ar' ? 'استرجاع 14 يوم' : '14 Day Returns' },
                { Icon: Shield, label: language === 'ar' ? 'ضمان الجودة' : 'Quality Guarantee' },
              ].map(({ Icon, label }) => (
                <div key={label} className="text-center p-2 bg-gray-50 rounded-lg">
                  <Icon className="h-5 w-5 mx-auto mb-1" style={{ color: 'var(--color-primary)' }} />
                  <span className="text-xs text-gray-600">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-8">
          <div className="flex border-b border-gray-200">
            {(['description', 'reviews'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className="px-5 py-3 font-medium border-b-2 transition-colors text-sm"
                style={{
                  borderColor: activeTab === tab ? 'var(--color-primary)' : 'transparent',
                  color: activeTab === tab ? 'var(--color-primary)' : '#6b7280',
                }}
              >
                {tab === 'description' ? t('product.description') : `${t('product.reviews')} (${reviews.length})`}
              </button>
            ))}
          </div>
          <div className="py-6">
            {activeTab === 'description' && (
              <div className="prose max-w-none">
                {/* ✅ تقسيم الوصف لنقاط */}
                <div className="space-y-3">
                  {description
                    .split(/[*•]\s+/)
                    .filter((point) => point.trim())
                    .map((point, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <span className="text-[#B8956E] mt-1.5 flex-shrink-0">•</span>
                        <p className="text-gray-700 leading-relaxed flex-1">
                          {point.trim()}
                        </p>
                      </div>
                    ))}
                </div>
              </div>
            )}
            {activeTab === 'reviews' && (
              <div>
                {product && <ReviewForm productId={product.id} />}
                {reviews.length > 0 ? (
                  <div className="space-y-4 mt-6">
                    {reviews.map((review) => (
                      <div key={review.id} className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center gap-3 mb-3">
                          <div
                            className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm"
                            style={{ backgroundColor: 'var(--color-primary)' }}
                          >
                            {(review.user?.full_name || 'U')[0].toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-sm">{review.user?.full_name || 'User'}</p>
                            <div className="flex">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={`h-3.5 w-3.5 ${star <= review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                        <h4 className="font-medium mb-1 text-sm">{review.title}</h4>
                        <p className="text-gray-600 text-sm">{review.comment}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8 text-sm">
                    {language === 'ar' ? 'لا توجد تقييمات بعد' : 'No reviews yet'}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-12">
            <span className="eyebrow">{language === 'ar' ? 'قد يعجبك أيضاً' : "You'll also like"}</span>
            <h2 className="font-display text-2xl font-semibold text-ink mt-2 mb-6">
              {t('products.relatedProducts')}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {relatedProducts.map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}