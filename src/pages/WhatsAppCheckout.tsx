import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useI18n } from '../lib/i18n';
import { useSettings } from '../lib/settings-context';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Textarea } from '../components/ui/Textarea';
import { MessageCircle, Package, MapPin, User, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

export function WhatsAppCheckout() {
  const { language } = useI18n();
  const { settings } = useSettings();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [product, setProduct] = useState<any>(null);
  const [variant, setVariant] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_phone: '',
    customer_address: '',
    shoe_size: '',  // ✅ فاضي
    shoe_color: '',  // ✅ فاضي
    notes: '',
  });

  useEffect(() => {
    if (location.state?.product) {
      setProduct(location.state.product);
      const receivedVariant = location.state.variant;
      setVariant(receivedVariant);
      
      // ✅ ملء البيانات تلقائياً من المتغير لو موجود، أو نسيبها فاضية
      setFormData(prev => ({
        ...prev,
        shoe_size: receivedVariant?.size || '',  // فاضي لو مفيش variant
        shoe_color: receivedVariant?.color || '',  // فاضي لو مفيش variant
      }));
    } else {
      toast.error(language === 'ar' ? 'المنتج غير موجود' : 'Product not found');
      navigate('/shop');
    }
    setLoading(false);
  }, [location, navigate, language]);

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const sendToWhatsApp = () => {
    if (!product) return;

    // التحقق من البيانات المطلوبة
    if (!formData.customer_name.trim()) {
      toast.error(language === 'ar' ? 'يرجى إدخال الاسم' : 'Please enter your name');
      return;
    }
    if (!formData.customer_phone.trim()) {
      toast.error(language === 'ar' ? 'يرجى إدخال رقم التليفون' : 'Please enter your phone number');
      return;
    }
    if (!formData.customer_address.trim()) {
      toast.error(language === 'ar' ? 'يرجى إدخال العنوان' : 'Please enter your address');
      return;
    }

    const rawPhone = settings?.whatsapp_number || '201007526286';
    const phoneNumber = rawPhone.replace(/[^0-9]/g, '');

    const finalPrice = variant ? (variant.price || product.price + (variant.price_adjustment || 0)) : product.price;
    const productImage = product.images?.[0] || '';

    // ✅ ترتيب الرسالة عشان المعاينة تظهر تلقائياً
    // الرابط لازم يكون في آخر سطر منفصل تماماً
    const message = `🛍️ *طلب جديد من الموقع*

━━━━━━━━━━━━━━━━━━
👤 *بيانات العميل:*
━━━━━━━━━━━━━━━━━━
• الاسم: ${formData.customer_name}
• التليفون: ${formData.customer_phone}
• العنوان: ${formData.customer_address}

━━━━━━━━━━━━━━━━━━
📦 *تفاصيل الطلب:*
━━━━━━━━━━━━━━━━━━
• المنتج: ${language === 'ar' ? product.name_ar : product.name}
• المقاس: ${formData.shoe_size || 'غير محدد'}
• اللون: ${formData.shoe_color || 'غير محدد'}
• السعر: ${finalPrice} ج.م
${formData.notes ? `\n━━━━━━━━━━━━━━━━━━\n *ملاحظات:* ${formData.notes}` : ''}

━━━━━━━━━━━━━━━━━━
🖼️ *صورة المنتج:*
${productImage}`;

    // ✅ استخدام api.whatsapp.com بدل wa.me (أحياناً أفضل للمعاينة)
    const whatsappUrl = `https://api.whatsapp.com/send?phone=${phoneNumber}&text=${encodeURIComponent(message)}`;
    
    window.open(whatsappUrl, '_blank');
    
    toast.success(language === 'ar' ? 'تم فتح الواتساب' : 'WhatsApp opened');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#B8956E]"></div>
      </div>
    );
  }

  const finalPrice = variant ? (variant.price || product.price + (variant.price_adjustment || 0)) : product.price;

  return (
    <div className="min-h-screen bg-[#FAFAFA] py-12">
      <div className="max-w-4xl mx-auto px-4 md:px-6">
        {/* Header */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-[#B8956E] mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>{language === 'ar' ? 'العودة' : 'Back'}</span>
        </button>

        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
            <MessageCircle className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="font-display text-3xl font-bold text-ink">
            {language === 'ar' ? 'إتمام الطلب عبر الواتساب' : 'Complete Order via WhatsApp'}
          </h1>
          <p className="text-gray-500 mt-2">
            {language === 'ar' 
              ? 'املأ بياناتك وسيتم تحويلك للواتساب لإرسال الطلب' 
              : 'Fill in your details and we will redirect you to WhatsApp'}
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* النموذج */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm p-6 space-y-6">
              {/* بيانات العميل */}
              <div>
                <h2 className="text-lg font-semibold text-ink mb-4 flex items-center gap-2">
                  <User className="h-5 w-5 text-[#B8956E]" />
                  {language === 'ar' ? 'بيانات العميل' : 'Customer Information'}
                </h2>
                <div className="space-y-4">
                  <Input
                    label={language === 'ar' ? 'الاسم الكامل *' : 'Full Name *'}
                    value={formData.customer_name}
                    onChange={(e) => updateField('customer_name', e.target.value)}
                    required
                    placeholder={language === 'ar' ? 'أدخل اسمك الكامل' : 'Enter your full name'}
                  />
                  <Input
                    label={language === 'ar' ? 'رقم التليفون *' : 'Phone Number *'}
                    value={formData.customer_phone}
                    onChange={(e) => updateField('customer_phone', e.target.value)}
                    required
                    type="tel"
                    placeholder={language === 'ar' ? '01XXXXXXXXX' : '01XXXXXXXXX'}
                  />
                  <Textarea
                    label={language === 'ar' ? 'العنوان بالتفصيل *' : 'Full Address *'}
                    value={formData.customer_address}
                    onChange={(e) => updateField('customer_address', e.target.value)}
                    required
                    rows={3}
                    placeholder={language === 'ar' ? 'المحافظة - المدينة - الشارع - رقم المبنى' : 'Governorate - City - Street - Building Number'}
                  />
                </div>
              </div>

              {/* تفاصيل المنتج */}
              <div>
                <h2 className="text-lg font-semibold text-ink mb-4 flex items-center gap-2">
                  <Package className="h-5 w-5 text-[#B8956E]" />
                  {language === 'ar' ? 'تفاصيل المنتج' : 'Product Details'}
                </h2>
                <div className="grid md:grid-cols-2 gap-4">
                  {/* المقاس - فاضي */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {language === 'ar' ? 'المقاس' : 'Size'}
                    </label>
                    <input
                      type="text"
                      value={formData.shoe_size}
                      onChange={(e) => updateField('shoe_size', e.target.value)}
                      className="w-full h-10 px-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#B8956E]"
                      placeholder={language === 'ar' ? 'مثال: 42' : 'Example: 42'}
                    />
                  </div>
                  
                  {/* اللون - فاضي */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {language === 'ar' ? 'اللون' : 'Color'}
                    </label>
                    <input
                      type="text"
                      value={formData.shoe_color}
                      onChange={(e) => updateField('shoe_color', e.target.value)}
                      className="w-full h-10 px-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#B8956E]"
                      placeholder={language === 'ar' ? 'مثال: أسود' : 'Example: Black'}
                    />
                  </div>
                </div>
              </div>

              {/* ملاحظات */}
              <div>
                <h2 className="text-lg font-semibold text-ink mb-4">
                  {language === 'ar' ? 'ملاحظات إضافية' : 'Additional Notes'}
                </h2>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => updateField('notes', e.target.value)}
                  rows={2}
                  placeholder={language === 'ar' ? 'أي ملاحظات خاصة بالطلب...' : 'Any special notes...'}
                />
              </div>

              <Button 
                onClick={sendToWhatsApp}
                className="w-full bg-green-600 hover:bg-green-700 text-white"
                disabled={!formData.customer_name || !formData.customer_phone || !formData.customer_address}
              >
                <MessageCircle className="h-5 w-5 mr-2" />
                {language === 'ar' ? 'إرسال الطلب عبر الواتساب' : 'Send Order via WhatsApp'}
              </Button>
            </div>
          </div>

          {/* ملخص الطلب - مع صورة المنتج */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-24">
              <h2 className="text-lg font-semibold text-ink mb-4 flex items-center gap-2">
                <Package className="h-5 w-5 text-[#B8956E]" />
                {language === 'ar' ? 'تفاصيل الطلب' : 'Order Details'}
              </h2>
              
              {product && (
                <div className="space-y-4">
                  {/* ✅ صورة المنتج فعلية */}
                  <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                    <img
                      src={product.images?.[0] || 'https://placehold.co/300'}
                      alt={language === 'ar' ? product.name_ar : product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-ink">
                      {language === 'ar' ? product.name_ar : product.name}
                    </h3>
                    <div className="mt-2 space-y-1 text-sm text-gray-600">
                      <p className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        {language === 'ar' ? 'المقاس' : 'Size'}: <span className="font-medium">{formData.shoe_size || '-'}</span>
                      </p>
                      <p className="flex items-center gap-2">
                        <Package className="h-4 w-4" />
                        {language === 'ar' ? 'اللون' : 'Color'}: <span className="font-medium">{formData.shoe_color || '-'}</span>
                      </p>
                    </div>
                    <p className="mt-3 font-bold text-[#B8956E] text-lg">
                      {finalPrice} {language === 'ar' ? 'ج.م' : 'EGP'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}