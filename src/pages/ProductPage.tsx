import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useI18n } from '../lib/i18n';
import { useCart } from '../lib/cart-context';
import { useWishlist } from '../lib/wishlist-context';
import { Product, ProductVariant, Review } from '../types';
import { supabase } from '../lib/supabase';
import { formatPrice, getDiscountPercentage } from '../lib/utils';
import { useSEO, useJsonLd, buildProductSchema, buildBreadcrumbSchema } from '../lib/seo';
import { ProductCard } from '../components/product/ProductCard';
import { ReviewForm } from '../components/product/ReviewForm';
import { ProductGridSkeleton } from '../components/ui/Skeleton';
import { Button } from '../components/ui/Button';
import toast from 'react-hot-toast';
import {
  Heart, Minus, Plus, Star,
  Truck, RotateCcw, ShieldCheck, MessageCircle,
  ChevronRight, ChevronLeft, Check
} from 'lucide-react';

export function ProductPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { language, t } = useI18n();
  const { addItem } = useCart();
  const { isWishlisted, toggleWishlist } = useWishlist();
  
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
  const displayDescription = product ? (language === 'ar' ? product.description_ar : product.description) || '' : '';

  useSEO({
    title: displayName || (language === 'ar' ? 'منتج' : 'Product'),
    description: displayDescription.slice(0, 160) || (language === 'ar' ? 'تسوق من بورسعيد برايم شوز' : 'Shop at Port Said Prime Shoes'),
    image: product?.images?.[0],
    url: slug ? `/product/${slug}` : undefined,
    type: 'product',
  });

  useJsonLd(
    product ? [
      buildProductSchema({
        name: displayName, description: displayDescription, images: product.images,
        price: product.price, sku: product.sku, rating: product.rating,
        reviews_count: product.reviews_count, stock_quantity: product.stock_quantity, slug: product.slug,
      }),
      buildBreadcrumbSchema([
        { name: language === 'ar' ? 'الرئيسية' : 'Home', url: '/' },
        { name: language === 'ar' ? 'المتجر' : 'Shop', url: '/shop' },
        { name: displayName, url: `/product/${product.slug}` },
      ]),
    ] : []
  );

  useEffect(() => { window.scrollTo(0, 0); }, [slug]);

  useEffect(() => {
    async function fetchProduct() {
      if (!slug) return;
      setLoading(true);
      try {
        const { data: productData, error } = await supabase
          .from('products').select('*').eq('slug', slug).eq('is_active', true).maybeSingle();

        if (error || !productData) { setProduct(null); setLoading(false); return; }

        let categoryData = null;
        if (productData.category_id) {
          const { data: catData } = await supabase.from('categories').select('id, name, name_ar, slug').eq('id', productData.category_id).maybeSingle();
          categoryData = catData;
        }

        setProduct({ ...productData, category: categoryData });

        const { data: variantsData } = await supabase.from('product_variants').select('*').eq('product_id', productData.id);
        setVariants(variantsData || []);

        const { data: reviewsData } = await supabase
          .from('reviews')
          .select('*')
          .eq('product_id', productData.id)
          .eq('is_approved', true)
          .order('created_at', { ascending: false });

        if (reviewsData && reviewsData.length > 0) {
          const userIds = [...new Set(reviewsData.map((r: any) => r.user_id).filter(Boolean))];
          let profilesById: Record<string, any> = {};
          if (userIds.length > 0) {
            const { data: profilesData } = await supabase
              .from('profiles')
              .select('id, full_name, avatar_url')
              .in('id', userIds);
            profilesById = Object.fromEntries((profilesData || []).map((p: any) => [p.id, p]));
          }
          setReviews(reviewsData.map((r: any) => ({ ...r, user: profilesById[r.user_id] || null })));
        } else {
          setReviews([]);
        }

        if (productData.category_id) {
          const { data: relatedData } = await supabase.from('products').select('*, categories(name, name_ar, slug)').eq('category_id', productData.category_id).eq('is_active', true).neq('id', productData.id).limit(4);
          setRelatedProducts(relatedData || []);
        }

        if (variantsData && variantsData.length > 0) {
          const uniqueColors = variantsData.filter((v, i, arr) => arr.findIndex((item) => item.color === v.color) === i);
          setSelectedColor(uniqueColors[0]?.color || null);
          setSelectedSize(variantsData[0]?.size || null);
          setSelectedVariant(variantsData[0] || null);
        }
      } catch (error) { console.error('Error fetching product:', error); } 
      finally { setLoading(false); }
    }
    fetchProduct();
  }, [slug]);

  useEffect(() => {
    if (!selectedColor || !variants.length) return;
    const colorVariants = variants.filter((v) => v.color === selectedColor);
    if (colorVariants.length > 0 && (!selectedSize || !colorVariants.find((v) => v.size === selectedSize))) {
      setSelectedSize(colorVariants[0]?.size || null);
    }
    const variant = variants.find((v) => v.color === selectedColor && v.size === selectedSize);
    setSelectedVariant(variant || colorVariants[0] || null);
  }, [selectedColor, selectedSize, variants]);

  const availableColors = variants.filter((v, i, arr) => arr.findIndex((item) => item.color === v.color) === i);
  const availableSizes = selectedColor ? variants.filter((v) => v.color === selectedColor) : [];

  // ✅ دالة إضافة للسلة
  const handleAddToCart = async () => {
    if (!product) return;
    
    const stock = selectedVariant?.stock_quantity ?? product.stock_quantity;
    if (stock <= 0) {
      toast.error(language === 'ar' ? 'المنتج غير متوفر' : 'Out of stock');
      return;
    }

    await addItem(product, selectedVariant, quantity);
  };

  // ✅ دالة الواتساب - تنتقل لصفحة Checkout لملء البيانات
  const handleWhatsAppOrder = () => {
    if (!product) return;

    const stock = selectedVariant?.stock_quantity ?? product.stock_quantity;
    if (stock <= 0) {
      toast.error(language === 'ar' ? 'المنتج غير متوفر' : 'Out of stock');
      return;
    }

    // الانتقال لصفحة WhatsApp Checkout مع بيانات المنتج
    navigate('/checkout/whatsapp', { 
      state: { 
        product, 
        variant: selectedVariant,
        quantity 
      } 
    });
  };

  if (loading) return <div className="min-h-screen pb-16"><div className="max-w-7xl mx-auto px-4 md:px-6 py-8"><ProductGridSkeleton count={1} /></div></div>;
  if (!product) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">{language === 'ar' ? 'المنتج غير موجود' : 'Product Not Found'}</h1>
        <Link to="/shop" className="text-amber-600 hover:underline font-medium">{language === 'ar' ? 'العودة للمتجر' : 'Back to Shop'}</Link>
      </div>
    </div>
  );

  const discount = product.compare_at_price ? getDiscountPercentage(product.price, product.compare_at_price) : 0;
  const name = language === 'ar' ? product.name_ar : product.name;
  const description = (language === 'ar' ? product.description_ar : product.description) || '';
  
  const currentStock = selectedVariant?.stock_quantity ?? product.stock_quantity;
  const isOutOfStock = currentStock <= 0;

  return (
    <div className="min-h-screen bg-white pb-24 md:pb-16">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-10">
        
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-8 overflow-x-auto whitespace-nowrap">
          <Link to="/" className="hover:text-black transition-colors">{language === 'ar' ? 'الرئيسية' : 'Home'}</Link>
          <ChevronRight className="h-4 w-4 flex-shrink-0" />
          <Link to="/shop" className="hover:text-black transition-colors">{language === 'ar' ? 'المتجر' : 'Shop'}</Link>
          {product.category && (
            <>
              <ChevronRight className="h-4 w-4 flex-shrink-0" />
              <Link to={`/shop?category=${product.category.slug}`} className="hover:text-black transition-colors">
                {language === 'ar' ? product.category.name_ar : product.category.name}
              </Link>
            </>
          )}
          <ChevronRight className="h-4 w-4 flex-shrink-0" />
          <span className="text-gray-900 font-medium truncate">{name}</span>
        </nav>

        {/* Main Grid */}
        <div className="flex flex-col lg:grid lg:grid-cols-2 gap-10 lg:gap-16">
          
          {/* Images Section */}
          <div className="w-full">
            <div
              className="relative w-full rounded-2xl overflow-hidden bg-gray-50 mb-4 group"
              style={{ aspectRatio: '4/5' }}
              onMouseEnter={() => setIsZoomed(true)}
              onMouseLeave={() => setIsZoomed(false)}
            >
              <img
                src={product.images?.[currentImage] || product.images?.[0] || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800'}
                alt={name}
                className="w-full h-full object-contain transition-transform duration-500 ease-out"
                style={{ transform: isZoomed ? 'scale(1.2)' : 'scale(1)' }}
              />
              {discount > 0 && (
                <span className="absolute top-4 left-4 px-3 py-1.5 bg-black text-white text-xs font-bold rounded-full">-{discount}%</span>
              )}
              {product.is_new && (
                <span className="absolute top-4 right-4 px-3 py-1.5 bg-amber-500 text-black text-xs font-bold rounded-full">NEW</span>
              )}
              
              {product.images && product.images.length > 1 && (
                <>
                  <button onClick={() => setCurrentImage((p) => (p === 0 ? product.images.length - 1 : p - 1))} className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 backdrop-blur rounded-full shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black hover:text-white">
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button onClick={() => setCurrentImage((p) => (p === product.images.length - 1 ? 0 : p + 1))} className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 backdrop-blur rounded-full shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black hover:text-white">
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </>
              )}
            </div>
            
            {product.images && product.images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImage(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${currentImage === index ? 'border-black' : 'border-transparent hover:border-gray-300'}`}
                  >
                    <img src={image} alt={`${name} ${index + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info Section */}
          <div className="w-full flex flex-col">
            {product.category && (
              <Link to={`/shop?category=${product.category.slug}`} className="text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-amber-600 transition-colors mb-2">
                {language === 'ar' ? product.category.name_ar : product.category.name}
              </Link>
            )}
            <h1 className="font-display text-3xl md:text-4xl font-bold text-gray-900 mb-4">{name}</h1>

            <div className="flex items-center gap-3 mb-6">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className={`h-4 w-4 ${star <= Math.round(product.rating || 0) ? 'text-amber-500 fill-amber-500' : 'text-gray-200'}`} />
                ))}
              </div>
              <span className="text-sm text-gray-500 border-l border-gray-300 pl-3 rtl:border-r rtl:border-l-0 rtl:pr-3 rtl:pl-0">
                {product.reviews_count} {language === 'ar' ? 'تقييم' : 'reviews'}
              </span>
            </div>

            <div className="flex items-center gap-4 mb-8 pb-8 border-b border-gray-100">
              <span className="text-3xl font-bold text-gray-900">{formatPrice(product.price)}</span>
              {product.compare_at_price && product.compare_at_price > product.price && (
                <span className="text-xl text-gray-400 line-through">{formatPrice(product.compare_at_price)}</span>
              )}
            </div>

            {availableColors.length > 0 && (
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-900 mb-3">
                  {t('product.selectColor')}: <span className="font-normal text-gray-600">{selectedColor}</span>
                </label>
                <div className="flex gap-3 flex-wrap">
                  {availableColors.map((variant) => (
                    <button
                      key={variant.id}
                      onClick={() => setSelectedColor(variant.color)}
                      className={`w-10 h-10 rounded-full border-2 transition-all flex items-center justify-center ${selectedColor === variant.color ? 'border-black ring-2 ring-offset-2 ring-black' : 'border-gray-200 hover:border-gray-400'}`}
                      style={{ backgroundColor: variant.color_code || variant.color.toLowerCase() }}
                      title={variant.color}
                    >
                      {selectedColor === variant.color && <Check className="w-5 h-5 text-white drop-shadow-md" />}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {availableSizes.length > 0 && (
              <div className="mb-8">
                <label className="block text-sm font-semibold text-gray-900 mb-3">{t('product.selectSize')}</label>
                <div className="flex flex-wrap gap-3">
                  {availableSizes.map((variant) => (
                    <button
                      key={variant.id}
                      onClick={() => setSelectedSize(variant.size)}
                      disabled={variant.stock_quantity <= 0}
                      className={`min-w-[60px] h-12 px-4 rounded-lg border-2 font-semibold text-sm transition-all ${
                        selectedSize === variant.size
                          ? 'bg-black text-white border-black'
                          : variant.stock_quantity <= 0
                          ? 'bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed line-through'
                          : 'bg-white text-gray-900 border-gray-200 hover:border-gray-400'
                      }`}
                    >
                      {variant.size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="mb-8">
              <label className="block text-sm font-semibold text-gray-900 mb-3">{t('product.quantity')}</label>
              <div className="flex items-center gap-4">
                <div className="flex items-center border-2 border-gray-200 rounded-lg">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-12 h-12 flex items-center justify-center hover:bg-gray-50 transition-colors rounded-l-lg">
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="w-12 text-center font-bold text-gray-900">{quantity}</span>
                  <button onClick={() => setQuantity(quantity + 1)} className="w-12 h-12 flex items-center justify-center hover:bg-gray-50 transition-colors rounded-r-lg">
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                <span className="text-sm text-gray-500 flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${ !isOutOfStock ? 'bg-green-500' : 'bg-red-500' }`}></span>
                  {!isOutOfStock ? (language === 'ar' ? 'متوفر في المخزن' : 'In Stock') : (language === 'ar' ? 'نفذت الكمية' : 'Out of Stock')}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3 mb-8">
              <Button
                size="lg"
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className="w-full h-14 bg-black text-white font-bold text-lg hover:bg-gray-800 transition-all rounded-xl disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {isOutOfStock 
                  ? (language === 'ar' ? 'نفذت الكمية' : 'Out of Stock')
                  : t('product.addToCart')
                }
              </Button>
              
              {/* ✅ زر الواتساب - ينقل لصفحة Checkout */}
              <button
                onClick={handleWhatsAppOrder}
                disabled={isOutOfStock}
                className={`w-full h-14 font-bold text-lg rounded-xl flex items-center justify-center gap-2 transition-all ${
                  isOutOfStock
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-green-600 text-white hover:bg-green-700 cursor-pointer'
                }`}
              >
                <MessageCircle className="h-5 w-5" />
                {language === 'ar' ? 'اطلب الآن عبر الواتساب' : 'Order Now via WhatsApp'}
              </button>

              <Button 
                size="lg" 
                variant="outline" 
                onClick={() => product && toggleWishlist(product)} 
                className={`w-full h-14 rounded-xl flex items-center justify-center gap-2 ${product && isWishlisted(product.id) ? 'text-red-500 border-red-200 bg-red-50' : 'text-gray-700'}`}
              >
                <Heart className={`h-5 w-5 ${product && isWishlisted(product.id) ? 'fill-current' : ''}`} />
                {language === 'ar' ? 'أضف للمفضلة' : 'Add to Wishlist'}
              </Button>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-2xl">
              {[
                { Icon: ShieldCheck, label: language === 'ar' ? 'ماركات أصلية' : 'Authentic Brands' },
                { Icon: Truck, label: language === 'ar' ? 'شحن سريع' : 'Fast Shipping' },
                { Icon: RotateCcw, label: language === 'ar' ? 'استرجاع 14 يوم' : '14-Day Returns' },
              ].map(({ Icon, label }) => (
                <div key={label} className="flex flex-col items-center text-center gap-2">
                  <Icon className="h-6 w-6 text-amber-600" />
                  <span className="text-xs font-semibold text-gray-700">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tabs Section */}
        <div className="mt-16 md:mt-24">
          <div className="flex border-b border-gray-200 mb-8">
            {(['description', 'reviews'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className="px-6 py-4 font-bold text-base transition-all relative"
              >
                <span className={activeTab === tab ? 'text-black' : 'text-gray-400 hover:text-gray-600'}>
                  {tab === 'description' ? t('product.description') : `${t('product.reviews')} (${reviews.length})`}
                </span>
                {activeTab === tab && <div className="absolute bottom-0 left-0 right-0 h-1 bg-black rounded-t-full" />}
              </button>
            ))}
          </div>
          
          <div className="min-h-[200px]">
            {activeTab === 'description' && (
              <div className="prose max-w-none text-gray-700 leading-relaxed">
                {description ? (
                  <div className="space-y-4">
                    {description.split(/[*•]\s+/).filter((point) => point.trim()).map((point, index) => (
                      <div key={index} className="flex items-start gap-4">
                        <span className="text-amber-500 mt-1.5 flex-shrink-0 text-xl">•</span>
                        <p className="text-gray-700">{point.trim()}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">{language === 'ar' ? 'لا يوجد وصف لهذا المنتج بعد' : 'No description available for this product yet'}</p>
                )}
              </div>
            )}
            {activeTab === 'reviews' && (
              <div>
                {product && <ReviewForm productId={product.id} />}
                {reviews.length > 0 ? (
                  <div className="space-y-6 mt-8">
                    {reviews.map((review) => (
                      <div key={review.id} className="bg-gray-50 rounded-2xl p-6">
                        <div className="flex items-center gap-4 mb-4">
                          <div className="w-12 h-12 rounded-full bg-black flex items-center justify-center text-white font-bold text-lg">
                            {(review.user?.full_name || 'U')[0].toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-gray-900">{review.user?.full_name || 'User'}</p>
                            <div className="flex mt-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star key={star} className={`h-4 w-4 ${star <= review.rating ? 'text-amber-500 fill-amber-500' : 'text-gray-300'}`} />
                              ))}
                            </div>
                          </div>
                        </div>
                        <h4 className="font-bold text-gray-900 mb-2">{review.title}</h4>
                        <p className="text-gray-600 leading-relaxed">{review.comment}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-12 bg-gray-50 rounded-2xl">
                    {language === 'ar' ? 'لا توجد تقييمات لهذا المنتج بعد' : 'No reviews for this product yet'}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {relatedProducts.length > 0 && (
          <div className="mt-20 pt-10 border-t border-gray-100">
            <h2 className="font-display text-3xl font-bold text-gray-900 mb-8 text-center">
              {language === 'ar' ? 'قد يعجبك أيضاً' : "You'll Also Like"}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
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