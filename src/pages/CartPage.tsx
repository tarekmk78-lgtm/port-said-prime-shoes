import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useI18n } from '../lib/i18n';
import { useCart } from '../lib/cart-context';
import { useWhatsAppNumber } from '../lib/settings-context';
import { formatPrice, getWhatsAppCartUrl } from '../lib/utils';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Minus, Plus, X, ShoppingBag, MessageCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export function CartPage() {
  const { t, language } = useI18n();
  const {
    items,
    subtotal,
    discount,
    total,
    couponCode,
    couponDiscount,
    loading,
    updateQuantity,
    removeItem,
    applyCoupon,
    removeCoupon,
  } = useCart();
  const [couponInput, setCouponInput] = useState('');
  const whatsappNumber = useWhatsAppNumber();

  const handleOrderViaWhatsApp = () => {
    const url = getWhatsAppCartUrl(
      whatsappNumber,
      items.map((item) => ({
        name: item.product.name,
        name_ar: item.product.name_ar,
        size: item.variant?.size,
        color: item.variant?.color,
        quantity: item.quantity,
        price: item.variant?.price_adjustment ? item.price + item.variant.price_adjustment : item.price,
      })),
      finalTotal,
      language
    );
    window.open(url, '_blank');
  };

  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) return;
    const result = await applyCoupon(couponInput.trim());
    if (result.success) {
      toast.success(language === 'ar' ? 'تم تطبيق الكوبون' : 'Coupon applied successfully');
      setCouponInput('');
    } else {
      toast.error(result.message);
    }
  };

  const shippingCost = subtotal >= 1000 ? 0 : 50;
  const finalTotal = total + shippingCost;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#B8956E]"></div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <ShoppingBag className="h-20 w-20 text-gray-300 mx-auto mb-6" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {t('cart.empty')}
          </h1>
          <p className="text-gray-500 mb-8">
            {language === 'ar'
              ? 'يبدو أن سلتك فارغة'
              : "Looks like your cart is empty"}
          </p>
          <Link to="/shop">
            <Button size="lg">
              {t('cart.continueShopping')}
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-12">
        <h1 className="text-3xl font-bold text-[#111111] mb-8">{t('cart.title')}</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm">
              {items.map((item, index) => {
                const product = item.product;
                const variant = item.variant;
                const name = language === 'ar' ? product.name_ar : product.name;
                const price = variant?.price_adjustment
                  ? item.price + variant.price_adjustment
                  : item.price;

                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className={`flex gap-4 p-4 md:p-6 ${
                      index !== items.length - 1 ? 'border-b border-gray-100' : ''
                    }`}
                  >
                    {/* Image */}
                    <Link
                      to={`/product/${product.slug}`}
                      className="flex-shrink-0 w-24 h-24 md:w-32 md:h-32 bg-gray-100 rounded-lg overflow-hidden"
                    >
                      <img loading="lazy" decoding="async"
                        src={product.images?.[0] || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200'}
                        alt={name}
                        className="w-full h-full object-cover"
                      />
                    </Link>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <Link
                        to={`/product/${product.slug}`}
                        className="text-base font-medium text-gray-900 hover:text-[#B8956E] line-clamp-2 mb-1"
                      >
                        {name}
                      </Link>

                      {variant && (
                        <p className="text-sm text-gray-500 mb-2">
                          {language === 'ar' ? 'المقاس:' : 'Size:'} {variant.size}
                          {' • '}
                          {language === 'ar' ? 'اللون:' : 'Color:'} {variant.color}
                        </p>
                      )}

                      <div className="flex items-center gap-4">
                        {/* Quantity Controls */}
                        <div className="flex items-center border border-gray-200 rounded-md">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="w-8 h-8 flex items-center justify-center hover:bg-gray-100"
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="w-8 text-center text-sm">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            disabled={(variant?.stock_quantity || 999) <= item.quantity}
                            className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 disabled:opacity-50"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>

                        {/* Price */}
                        <span className="font-semibold text-[#111111]">
                          {formatPrice(price * item.quantity)}
                        </span>
                      </div>
                    </div>

                    {/* Remove Button */}
                    <button
                      onClick={() => removeItem(item.id)}
                      className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-24">
              <h2 className="text-lg font-bold text-[#111111] mb-6">
                {language === 'ar' ? 'ملخص الطلب' : 'Order Summary'}
              </h2>

              {/* Coupon */}
              <div className="mb-6">
                <div className="flex gap-2">
                  <Input
                    placeholder={language === 'ar' ? 'كود الخصم' : 'Coupon code'}
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    className="flex-1"
                  />
                  <Button onClick={handleApplyCoupon} variant="secondary">
                    {language === 'ar' ? 'تطبيق' : 'Apply'}
                  </Button>
                </div>
                {couponCode && (
                  <div className="flex items-center justify-between mt-3 p-2 bg-green-50 rounded-md">
                    <span className="text-sm text-green-700">{couponCode}</span>
                    <button
                      onClick={removeCoupon}
                      className="text-green-700 hover:text-red-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Totals */}
              <div className="space-y-3 border-t border-gray-100 pt-4">
                <div className="flex justify-between text-gray-600">
                  <span>{t('cart.subtotal')}</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>

                {discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>{t('cart.discount')}</span>
                    <span>-{formatPrice(discount)}</span>
                  </div>
                )}

                <div className="flex justify-between text-gray-600">
                  <span>{t('cart.shipping')}</span>
                  <span>
                    {shippingCost === 0
                      ? language === 'ar'
                        ? 'مجاني'
                        : 'Free'
                      : formatPrice(shippingCost)}
                  </span>
                </div>

                <div className="flex justify-between text-lg font-bold text-[#111111] pt-3 border-t border-gray-100">
                  <span>{t('cart.total')}</span>
                  <span>{formatPrice(finalTotal)}</span>
                </div>
              </div>

              {/* Order via WhatsApp — primary ordering method */}
              <button
                onClick={handleOrderViaWhatsApp}
                className="w-full mt-6 h-12 flex items-center justify-center gap-2.5 bg-green-600 text-white font-semibold rounded-sm hover:bg-green-700 transition-colors"
              >
                <MessageCircle className="h-5 w-5" />
                {language === 'ar' ? 'اطلب عبر واتساب' : 'Order via WhatsApp'}
              </button>
              <p className="text-xs text-center text-gray-400 mt-2">
                {language === 'ar'
                  ? 'سيتم إرسال تفاصيل طلبك (المنتجات، المقاسات، الألوان) مباشرة لفريقنا على واتساب لتأكيد الطلب والتوصيل'
                  : "Your order details (products, sizes, colors) will be sent directly to our team on WhatsApp to confirm and arrange delivery"}
              </p>

              {/* Free Shipping Notice */}
              {subtotal < 1000 && (
                <p className="text-sm text-center text-gray-500 mt-4">
                  {language === 'ar'
                    ? `أضف ${formatPrice(1000 - subtotal)} للحصول على شحن مجاني`
                    : `Add ${formatPrice(1000 - subtotal)} more for free shipping`}
                </p>
              )}

              {/* Continue Shopping */}
              <Link
                to="/shop"
                className="block text-center text-sm text-[#B8956E] hover:underline mt-4"
              >
                {t('cart.continueShopping')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
