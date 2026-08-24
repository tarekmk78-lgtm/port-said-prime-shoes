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
    shoe_size: '',
    shoe_color: '',
    notes: '',
  });

  useEffect(() => {
    // ✅ التعديل الجذري: التحقق من وجود المنتج فقط، والسماح بأن يكون variant فارغاً
    if (location.state?.product) {
      setProduct(location.state.product);
      const receivedVariant = location.state.variant;
      setVariant(receivedVariant);
      
      // ملء البيانات تلقائياً مع وجود قيم افتراضية آمنة
      setFormData(prev => ({
        ...prev,
        shoe_size: receivedVariant?.size || 'قياس موحد',
        shoe_color: receivedVariant?.color || 'قياسي',
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
    if (!formData.shoe_size.trim()) {
      toast.error(language === 'ar' ? 'يرجى اختيار المقاس' : 'Please select size');
      return;
    }
    if (!formData.shoe_color.trim()) {
      toast.error(language === 'ar' ? 'يرجى اختيار اللون' : 'Please select color');
      return;
    }

    // رقم الواتساب من الإعدادات (مع إزالة أي مسافات أو رموز)
    const rawPhone = settings?.whatsapp_number || '201007526286';
    const phoneNumber = rawPhone.replace(/[^0-9]/g, '');

    // حساب السعر النهائي
    const finalPrice = variant ? (variant.price || product.price + (variant.price_adjustment || 0)) : product.price;

    // بناء الرسالة
    const message = `
🛍️ *طلب جديد من الموقع*

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
• المقاس: ${formData.shoe_size}
• اللون: ${formData.shoe_color}
• السعر: ${finalPrice} ج.م
${formData.notes ? `\n━━━━━━━━━━━━━━━━━━\n📝 *ملاحظات:* ${formData.notes}` : ''}

🖼️ صورة المنتج:
${product.images?.[0] || ''}
    `.trim();

    // إنشاء رابط الواتساب
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    
    // فتح الواتساب
    window.open(whatsappUrl, '_blank');
    
    toast.success(language === 'ar' ? 'تم فتح الواتساب بنجاح' : 'WhatsApp opened successfully');
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

              {/* تفاصيل الحذاء */}
              <div>
                <h2 className="text-lg font-semibold text-ink mb-4 flex items-center gap-2">
                  <Package className="h-5 w-5 text-[#B8956E]" />
                  {language === 'ar' ? 'تفاصيل المنتج' : 'Product Details'}
                </h2>
                <div className="grid md:grid-cols-2 gap-4">
                  {/* المقاس */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {language === 'ar' ? 'المقاس *' : 'Size *'}
                    </label>
                    <input
                      type="text"
                      value={formData.shoe_size}
                      onChange={(e) => updateField('shoe_size', e.target.value)}
                      className="w-full h-10 px-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#B8956E]"
                      placeholder={language === 'ar' ? 'مثال: 42 أو قياس موحد' : 'Example: 42 or One Size'}
                      required
                    />
                  </div>
                  
                  {/* اللون */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {language === 'ar' ? 'اللون *' : 'Color *'}
                    </label>
                    <input
                      type="text"
                      value={formData.shoe_color}
                      onChange={(e) => updateField('shoe_color', e.target.value)}
                      className="w-full h-10 px-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#B8956E]"
                      placeholder={language === 'ar' ? 'مثال: أسود أو قياسي' : 'Example: Black or Standard'}
                      required
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
                disabled={!formData.customer_name || !formData.customer_phone || !formData.customer_address || !formData.shoe_size || !formData.shoe_color}
              >
                <MessageCircle className="h-5 w-5 mr-2" />
                {language === 'ar' ? 'إرسال الطلب عبر الواتساب' : 'Send Order via WhatsApp'}
              </Button>
            </div>
          </div>

          {/* ملخص الطلب */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-24">
              <h2 className="text-lg font-semibold text-ink mb-4 flex items-center gap-2">
                <Package className="h-5 w-5 text-[#B8956E]" />
                {language === 'ar' ? 'تفاصيل الطلب' : 'Order Details'}
              </h2>
              
              {product && (
                <div className="space-y-4">
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