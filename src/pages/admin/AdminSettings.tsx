import React, { useEffect, useState } from 'react';
import { useI18n } from '../../lib/i18n';
import { useSettings } from '../../lib/settings-context';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { ImageUploader } from '../../components/admin/ImageUploader';
import toast from 'react-hot-toast';
import {
  Store,
  Phone,
  Share2,
  Search,
  Truck,
  Save,
  MessageCircle,
  Palette,
  Layout,
  Type,
  Sparkles,
  Check,
} from 'lucide-react';

const SECTIONS = ['store', 'contact', 'social', 'seo', 'shipping', 'about', 'theme', 'templates'] as const;
type Section = typeof SECTIONS[number];

// ── Templates ──────────────────────────────────────────────────────────────
const TEMPLATES = [
  {
    id: 'luxury',
    name: 'Luxury',
    nameAr: 'فاخر',
    desc: 'Dark tones, gold accents — premium feel',
    descAr: 'ألوان داكنة وذهبية — شعور فاخر',
    primary: '#B8956E',
    secondary: '#1A1815',
    bg: '#FFFFFF',
    accent: '#B8956E',
    font: 'Cairo',
    layout: 'modern',
    hero: 'full',
    grid: 3,
    preview: ['#1A1815', '#B8956E', '#F5F0EB', '#FFFFFF'],
  },
  {
    id: 'minimal',
    name: 'Minimal',
    nameAr: 'بسيط',
    desc: 'Clean white, subtle grays — timeless simplicity',
    descAr: 'أبيض نظيف ورمادي خفيف — بساطة خالدة',
    primary: '#111111',
    secondary: '#555555',
    bg: '#FAFAFA',
    accent: '#111111',
    font: 'Inter',
    layout: 'minimal',
    hero: 'centered',
    grid: 4,
    preview: ['#111111', '#555555', '#EEEEEE', '#FAFAFA'],
  },
  {
    id: 'bold',
    name: 'Bold',
    nameAr: 'جريء',
    desc: 'Strong contrasts, vivid colors — energetic brand',
    descAr: 'تباين قوي وألوان حيوية — علامة نشيطة',
    primary: '#E63946',
    secondary: '#1D3557',
    bg: '#FFFFFF',
    accent: '#E63946',
    font: 'Cairo',
    layout: 'classic',
    hero: 'split',
    grid: 3,
    preview: ['#E63946', '#1D3557', '#457B9D', '#FFFFFF'],
  },
  {
    id: 'nature',
    name: 'Nature',
    nameAr: 'طبيعي',
    desc: 'Earth tones, organic warmth — sustainable mood',
    descAr: 'ألوان الأرض والدفء العضوي — طابع مستدام',
    primary: '#4A7C59',
    secondary: '#2D4A3E',
    bg: '#F8F5F0',
    accent: '#4A7C59',
    font: 'Cairo',
    layout: 'modern',
    hero: 'full',
    grid: 3,
    preview: ['#4A7C59', '#2D4A3E', '#A8C5A0', '#F8F5F0'],
  },
  {
    id: 'ocean',
    name: 'Ocean',
    nameAr: 'أوشن',
    desc: 'Deep blues, calm whites — trust and clarity',
    descAr: 'أزرق عميق وأبيض هادئ — ثقة ووضوح',
    primary: '#0077B6',
    secondary: '#023E8A',
    bg: '#F0F8FF',
    accent: '#0077B6',
    font: 'Inter',
    layout: 'modern',
    hero: 'split',
    grid: 3,
    preview: ['#023E8A', '#0077B6', '#90E0EF', '#F0F8FF'],
  },
  {
    id: 'rose',
    name: 'Rose',
    nameAr: 'وردي',
    desc: 'Soft pinks, warm neutrals — feminine elegance',
    descAr: 'وردي ناعم ومحايد دافئ — أناقة أنثوية',
    primary: '#C9748F',
    secondary: '#8B4A6B',
    bg: '#FFF5F7',
    accent: '#C9748F',
    font: 'Cairo',
    layout: 'minimal',
    hero: 'centered',
    grid: 4,
    preview: ['#8B4A6B', '#C9748F', '#F4A0B5', '#FFF5F7'],
  },
];

const FONTS = ['Cairo', 'Inter', 'Tajawal', 'Roboto', 'Playfair Display', 'Montserrat'];
const LAYOUTS = [
  { value: 'modern', labelAr: 'عصري', labelEn: 'Modern' },
  { value: 'classic', labelAr: 'كلاسيكي', labelEn: 'Classic' },
  { value: 'minimal', labelAr: 'بسيط', labelEn: 'Minimal' },
];
const HERO_LAYOUTS = [
  { value: 'full', labelAr: 'كامل العرض', labelEn: 'Full Width' },
  { value: 'split', labelAr: 'مقسوم', labelEn: 'Split' },
  { value: 'centered', labelAr: 'في المنتصف', labelEn: 'Centered' },
];

export function AdminSettings() {
  const { language } = useI18n();
  const { refreshSettings } = useSettings(); // ✅ تم التأكد من الاسم الصحيح
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [active, setActive] = useState<Section>('store');
  const [settingsId, setSettingsId] = useState<string | null>(null);
  
  // ✅ تم استخدام Record<string, any> لتجنب أي أخطاء في أنواع SiteSettings المفقودة
  const [form, setForm] = useState<Record<string, any>>({});

  useEffect(() => { fetchSettings(); }, []);

  async function fetchSettings() {
    try {
      const { data, error } = await supabase
        .from('settings')
        .select('id, *')
        .limit(1)
        .single();
        
      if (error) {
        console.error('Error fetching settings:', error);
        return;
      }
      
      if (data) {
        setSettingsId(data.id);
        setForm(data);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  }

  // ✅ تمت إضافة : any لـ prev لتجنب أخطاء TypeScript
  function update(key: string, value: string | number | boolean) {
    setForm((prev: any) => ({ ...prev, [key]: value }));
  }

  // ✅ تمت إضافة : any لـ prev هنا أيضاً
  function applyTemplate(tpl: typeof TEMPLATES[0]) {
    setForm((prev: any) => ({
      ...prev,
      primary_color: tpl.primary,
      secondary_color: tpl.secondary,
      background_color: tpl.bg,
      accent_color: tpl.accent,
      font_family: tpl.font,
      layout_style: tpl.layout,
      hero_layout: tpl.hero,
      grid_columns: tpl.grid,
      template_id: tpl.id,
    }));
    toast.success(language === 'ar' ? `تم تطبيق قالب ${tpl.nameAr}` : `Applied ${tpl.name} template`);
  }

  async function handleSave() {
    setSaving(true);
    try {
      let currentId = settingsId;
      if (!currentId) {
        const { data: existingData, error: fetchError } = await supabase
          .from('settings')
          .select('id')
          .limit(1)
          .single();
        if (fetchError && fetchError.code !== 'PGRST116') {
          throw fetchError;
        }
        currentId = existingData?.id || null;
      }

      const updateData = {
        ...form,
        updated_at: new Date().toISOString(),
      };

      let error;
      if (currentId) {
        const { error: updateError } = await supabase
          .from('settings')
          .update(updateData)
          .eq('id', currentId);
        error = updateError;
      } else {
        const { error: insertError } = await supabase
          .from('settings')
          .insert([{ ...updateData, created_at: new Date().toISOString() }]);
        error = insertError;
      }

      if (error) {
        console.error('Save error:', error);
        throw error;
      }

      toast.success(language === 'ar' ? 'تم حفظ الإعدادات بنجاح' : 'Settings saved successfully');
      
      // ✅ تم تصحيح refresh() إلى refreshSettings()
      await refreshSettings(); 
      setTimeout(() => window.location.reload(), 800);
      
    } catch (error: any) {
      console.error('Save error:', error);
      toast.error(error.message || (language === 'ar' ? 'فشل الحفظ' : 'Save failed'));
    } finally {
      setSaving(false);
    }
  }

  const sectionLabels: Record<Section, { label: string; icon: any }> = {
    store:     { label: language === 'ar' ? 'بيانات المتجر' : 'Store Info', icon: Store },
    contact:   { label: language === 'ar' ? 'التواصل وواتساب' : 'Contact', icon: Phone },
    social:    { label: language === 'ar' ? 'وسائل التواصل' : 'Social Media', icon: Share2 },
    seo:       { label: language === 'ar' ? 'محركات البحث' : 'SEO', icon: Search },
    shipping:  { label: language === 'ar' ? 'الشحن والضرائب' : 'Shipping & Tax', icon: Truck },
    about:     { label: language === 'ar' ? 'صفحة من نحن' : 'About Page', icon: Share2 },
    theme:     { label: language === 'ar' ? 'الألوان والخطوط' : 'Theme Builder', icon: Palette },
    templates: { label: language === 'ar' ? 'القوالب الجاهزة' : 'Templates', icon: Sparkles },
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#B8956E]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {language === 'ar' ? 'إعدادات الموقع' : 'Site Settings'}
          </h1>
          <p className="text-gray-500 mt-1">
            {language === 'ar' ? 'البيانات العامة للمتجر' : 'General store configuration'}
          </p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          <Save className="h-4 w-4 mr-2" />
          {saving
            ? (language === 'ar' ? 'جارٍ الحفظ...' : 'Saving...')
            : (language === 'ar' ? 'حفظ التغييرات' : 'Save Changes')}
        </Button>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Sidebar nav */}
        <div className="bg-white rounded-xl shadow-sm p-2 lg:col-span-1 flex lg:flex-col gap-1 overflow-x-auto">
          {SECTIONS.map((s) => (
            <button
              key={s}
              onClick={() => setActive(s)}
              className={`flex items-center gap-2.5 px-4 py-2.5 rounded-md text-sm font-medium whitespace-nowrap transition-colors ${
                active === s
                  ? 'bg-[#B8956E] text-white'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              {React.createElement(sectionLabels[s].icon, { className: 'h-4 w-4 flex-shrink-0' })}
              {sectionLabels[s].label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="bg-white rounded-xl shadow-sm p-6 lg:col-span-3 space-y-5">
          {/* ─ Store ── */}
          {active === 'store' && (
            <>
              <div className="grid md:grid-cols-2 gap-4">
                <Input label={language === 'ar' ? 'اسم المتجر (إنجليزي)' : 'Store name (EN)'} value={form.site_name || ''} onChange={(e) => update('site_name', e.target.value)} />
                <Input label={language === 'ar' ? 'اسم المتجر (عربي)' : 'Store name (AR)'} value={form.site_name_ar || ''} onChange={(e) => update('site_name_ar', e.target.value)} />
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <Input label={language === 'ar' ? 'الشعار (إنجليزي)' : 'Tagline (EN)'} value={form.tagline || ''} onChange={(e) => update('tagline', e.target.value)} />
                <Input label={language === 'ar' ? 'الشعار (عربي)' : 'Tagline (AR)'} value={form.tagline_ar || ''} onChange={(e) => update('tagline_ar', e.target.value)} />
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <ImageUploader bucket="site-media" multiple={false} label={language === 'ar' ? 'الشعار (Logo)' : 'Logo'} value={form.logo_url ? [form.logo_url] : []} onChange={(urls) => update('logo_url', urls[0] || '')} />
                <ImageUploader bucket="site-media" multiple={false} label={language === 'ar' ? 'أيقونة الموقع (Favicon)' : 'Favicon'} value={form.favicon_url ? [form.favicon_url] : []} onChange={(urls) => update('favicon_url', urls[0] || '')} />
              </div>
            </>
          )}

          {/* ── Contact ─ */}
          {active === 'contact' && (
            <>
              <div className="grid md:grid-cols-2 gap-4">
                <Input label={language === 'ar' ? 'البريد الإلكتروني' : 'Contact email'} type="email" value={form.contact_email || ''} onChange={(e) => update('contact_email', e.target.value)} />
                <Input label={language === 'ar' ? 'رقم الهاتف' : 'Contact phone'} value={form.contact_phone || ''} onChange={(e) => update('contact_phone', e.target.value)} />
              </div>
              <div className="bg-green-50 border border-green-100 rounded-lg p-4">
                <label className="flex items-center gap-2 text-sm font-medium text-green-800 mb-2">
                  <MessageCircle className="h-4 w-4" />
                  {language === 'ar' ? 'رقم واتساب الطلبات' : 'WhatsApp order number'}
                </label>
                <Input placeholder="+20123456789" value={form.whatsapp_number || ''} onChange={(e) => update('whatsapp_number', e.target.value)} />
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <Input label={language === 'ar' ? 'العنوان (إنجليزي)' : 'Address (EN)'} value={form.contact_address_en || ''} onChange={(e) => update('contact_address_en', e.target.value)} />
                <Input label={language === 'ar' ? 'العنوان (عربي)' : 'Address (AR)'} value={form.contact_address || ''} onChange={(e) => update('contact_address', e.target.value)} />
              </div>
            </>
          )}

          {/* ✅ ─ Social Media ── */}
          {active === 'social' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {language === 'ar' ? 'روابط وسائل التواصل الاجتماعي' : 'Social Media Links'}
              </h3>
              <Input 
                label="Facebook URL" 
                placeholder="https://facebook.com/yourpage"
                value={form.social_facebook || ''} 
                onChange={(e) => update('social_facebook', e.target.value)} 
              />
              <Input 
                label="Instagram URL" 
                placeholder="https://instagram.com/yourpage"
                value={form.social_instagram || ''} 
                onChange={(e) => update('social_instagram', e.target.value)} 
              />
              <Input 
                label="Twitter / X URL" 
                placeholder="https://twitter.com/yourpage"
                value={form.social_twitter || ''} 
                onChange={(e) => update('social_twitter', e.target.value)} 
              />
              <Input 
                label="YouTube URL" 
                placeholder="https://youtube.com/yourchannel"
                value={form.social_youtube || ''} 
                onChange={(e) => update('social_youtube', e.target.value)} 
              />
              <Input 
                label="TikTok URL" 
                placeholder="https://tiktok.com/@yourpage"
                value={form.social_tiktok || ''} 
                onChange={(e) => update('social_tiktok', e.target.value)} 
              />
            </div>
          )}

          {/* ✅ ── SEO ─ */}
          {active === 'seo' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {language === 'ar' ? 'إعدادات محركات البحث (SEO)' : 'SEO Settings'}
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <Input 
                  label={language === 'ar' ? 'عنوان الصفحة (إنجليزي)' : 'Meta Title (EN)'} 
                  value={form.meta_title || ''} 
                  onChange={(e) => update('meta_title', e.target.value)} 
                />
                <Input 
                  label={language === 'ar' ? 'عنوان الصفحة (عربي)' : 'Meta Title (AR)'} 
                  value={form.meta_title_ar || ''} 
                  onChange={(e) => update('meta_title_ar', e.target.value)} 
                />
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <Input 
                  label={language === 'ar' ? 'وصف الصفحة (إنجليزي)' : 'Meta Description (EN)'} 
                  value={form.meta_description || ''} 
                  onChange={(e) => update('meta_description', e.target.value)} 
                />
                <Input 
                  label={language === 'ar' ? 'وصف الصفحة (عربي)' : 'Meta Description (AR)'} 
                  value={form.meta_description_ar || ''} 
                  onChange={(e) => update('meta_description_ar', e.target.value)} 
                />
              </div>
              <Input 
                label={language === 'ar' ? 'الكلمات المفتاحية' : 'Meta Keywords'} 
                placeholder="shoes, footwear, port said"
                value={form.meta_keywords || ''} 
                onChange={(e) => update('meta_keywords', e.target.value)} 
              />
            </div>
          )}

          {/* ✅ ── Shipping & Taxes ── */}
          {active === 'shipping' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {language === 'ar' ? 'إعدادات الشحن والضرائب' : 'Shipping & Tax Settings'}
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <Input 
                  label={language === 'ar' ? 'العملة (مثل EGP)' : 'Currency Code'} 
                  value={form.currency || 'EGP'} 
                  onChange={(e) => update('currency', e.target.value)} 
                />
                <Input 
                  label={language === 'ar' ? 'رمز العملة (مثل ج.م)' : 'Currency Symbol'} 
                  value={form.currency_symbol || 'ج.م'} 
                  onChange={(e) => update('currency_symbol', e.target.value)} 
                />
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <Input 
                  label={language === 'ar' ? 'تكلفة الشحن (ج.م)' : 'Shipping Cost'} 
                  type="number"
                  value={form.shipping_cost ?? ''} 
                  onChange={(e) => update('shipping_cost', parseFloat(e.target.value))} 
                />
                <Input 
                  label={language === 'ar' ? 'حد الشحن المجاني (ج.م)' : 'Free Shipping Threshold'} 
                  type="number"
                  value={form.free_shipping_threshold ?? ''} 
                  onChange={(e) => update('free_shipping_threshold', parseFloat(e.target.value))} 
                />
              </div>
              <Input 
                label={language === 'ar' ? 'نسبة الضريبة (%)' : 'Tax Rate (%)'} 
                type="number"
                value={form.tax_rate ?? ''} 
                onChange={(e) => update('tax_rate', parseFloat(e.target.value))} 
              />
            </div>
          )}

          {/* ✅ ─ About Page ── */}
          {active === 'about' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {language === 'ar' ? 'محتوى صفحة من نحن' : 'About Page Content'}
              </h3>
              
              <div className="grid md:grid-cols-2 gap-4">
                <Input
                  label={language === 'ar' ? 'العنوان الفرعي (عربي)' : 'Subtitle (AR)'}
                  value={form.about_subtitle_ar || ''}
                  onChange={(e) => update('about_subtitle_ar', e.target.value)}
                  placeholder="بورسعيد - منذ سنوات"
                />
                <Input
                  label={language === 'ar' ? 'العنوان الفرعي (إنجليزي)' : 'Subtitle (EN)'}
                  value={form.about_subtitle_en || ''}
                  onChange={(e) => update('about_subtitle_en', e.target.value)}
                  placeholder="Port Said - Since Years"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <Input
                  label={language === 'ar' ? 'العنوان الرئيسي (عربي)' : 'Main Title (AR)'}
                  value={form.about_title_ar || ''}
                  onChange={(e) => update('about_title_ar', e.target.value)}
                  placeholder="من نحن"
                />
                <Input
                  label={language === 'ar' ? 'العنوان الرئيسي (إنجليزي)' : 'Main Title (EN)'}
                  value={form.about_title_en || ''}
                  onChange={(e) => update('about_title_en', e.target.value)}
                  placeholder="About Us"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <Textarea
                  label={language === 'ar' ? 'الوصف (عربي)' : 'Description (AR)'}
                  value={form.about_description_ar || ''}
                  onChange={(e) => update('about_description_ar', e.target.value)}
                  rows={4}
                  placeholder="بورسعيد برايم شوز بدأت بفكرة بسيطة..."
                />
                <Textarea
                  label={language === 'ar' ? 'الوصف (إنجليزي)' : 'Description (EN)'}
                  value={form.about_description_en || ''}
                  onChange={(e) => update('about_description_en', e.target.value)}
                  rows={4}
                  placeholder="Port Said Prime Shoes started with a simple idea..."
                />
              </div>

              <ImageUploader
                bucket="site-media"
                multiple={false}
                label={language === 'ar' ? 'صورة قسم من نحن' : 'About Section Image'}
                value={form.about_image_url ? [form.about_image_url] : []}
                onChange={(urls) => update('about_image_url', urls[0] || '')}
              />
            </div>
          )}

          {/* ── Theme Builder ── */}
          {active === 'theme' && (
            <div className="space-y-8">
              {/* Colors */}
              <div>
                <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Palette className="h-4 w-4 text-[#B8956E]" />
                  {language === 'ar' ? 'الألوان' : 'Colors'}
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { key: 'primary_color',    labelAr: 'اللون الأساسي',   labelEn: 'Primary Color' },
                    { key: 'secondary_color',  labelAr: 'اللون الثانوي',   labelEn: 'Secondary Color' },
                    { key: 'accent_color',     labelAr: 'لون التمييز',     labelEn: 'Accent Color' },
                    { key: 'background_color', labelAr: 'لون الخلفية',     labelEn: 'Background' },
                  ].map(({ key, labelAr, labelEn }) => (
                    <div key={key} className="space-y-2">
                      <label className="text-xs font-medium text-gray-600">
                        {language === 'ar' ? labelAr : labelEn}
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={form[key] || '#000000'}
                          onChange={(e) => update(key, e.target.value)}
                          className="h-10 w-10 rounded-lg cursor-pointer border border-gray-200 p-0.5"
                        />
                        <input
                          type="text"
                          value={form[key] || ''}
                          onChange={(e) => update(key, e.target.value)}
                          className="flex-1 h-10 px-3 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#B8956E]"
                          placeholder="#000000"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Font */}
              <div>
                <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Type className="h-4 w-4 text-[#B8956E]" />
                  {language === 'ar' ? 'الخط' : 'Font Family'}
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {FONTS.map((font) => (
                    <button
                      key={font}
                      onClick={() => update('font_family', font)}
                      className={`px-4 py-3 rounded-lg border-2 text-sm transition-all ${
                        form.font_family === font
                          ? 'border-[#B8956E] bg-[#B8956E]/10 text-[#B8956E] font-semibold'
                          : 'border-gray-200 hover:border-gray-300 text-gray-700'
                      }`}
                      style={{ fontFamily: font }}
                    >
                      {font}
                    </button>
                  ))}
                </div>
              </div>

              {/* Layout */}
              <div>
                <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Layout className="h-4 w-4 text-[#B8956E]" />
                  {language === 'ar' ? 'تخطيط الموقع' : 'Layout Style'}
                </h3>
                <div className="grid grid-cols-3 gap-3 mb-6">
                  {LAYOUTS.map((l) => (
                    <button
                      key={l.value}
                      onClick={() => update('layout_style', l.value)}
                      className={`px-4 py-3 rounded-lg border-2 text-sm transition-all ${
                        form.layout_style === l.value
                          ? 'border-[#B8956E] bg-[#B8956E]/10 text-[#B8956E] font-semibold'
                          : 'border-gray-200 hover:border-gray-300 text-gray-700'
                      }`}
                    >
                      {language === 'ar' ? l.labelAr : l.labelEn}
                    </button>
                  ))}
                </div>

                <p className="text-sm font-medium text-gray-700 mb-3">
                  {language === 'ar' ? 'تخطيط الـ Hero' : 'Hero Layout'}
                </p>
                <div className="grid grid-cols-3 gap-3 mb-6">
                  {HERO_LAYOUTS.map((h) => (
                    <button
                      key={h.value}
                      onClick={() => update('hero_layout', h.value)}
                      className={`px-4 py-3 rounded-lg border-2 text-sm transition-all ${
                        form.hero_layout === h.value
                          ? 'border-[#B8956E] bg-[#B8956E]/10 text-[#B8956E] font-semibold'
                          : 'border-gray-200 hover:border-gray-300 text-gray-700'
                      }`}
                    >
                      {language === 'ar' ? h.labelAr : h.labelEn}
                    </button>
                  ))}
                </div>

                <p className="text-sm font-medium text-gray-700 mb-3">
                  {language === 'ar' ? 'عدد أعمدة المنتجات' : 'Product Grid Columns'}
                </p>
                <div className="flex gap-3">
                  {[2, 3, 4].map((n) => (
                    <button
                      key={n}
                      onClick={() => update('grid_columns', n)}
                      className={`w-14 h-12 rounded-lg border-2 text-sm font-bold transition-all ${
                        form.grid_columns === n
                          ? 'border-[#B8956E] bg-[#B8956E]/10 text-[#B8956E]'
                          : 'border-gray-200 hover:border-gray-300 text-gray-700'
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>

              {/* Animations */}
              <div>
                <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-[#B8956E]" />
                  {language === 'ar' ? 'الحركات والتأثيرات' : 'Animations'}
                </h3>
                <label className="flex items-center gap-3 mb-4 cursor-pointer">
                  <div
                    onClick={() => update('enable_animations', !form.enable_animations)}
                    className={`relative w-12 h-6 rounded-full transition-colors ${
                      form.enable_animations ? 'bg-[#B8956E]' : 'bg-gray-300'
                    }`}
                  >
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                      form.enable_animations ? 'translate-x-7' : 'translate-x-1'
                    }`} />
                  </div>
                  <span className="text-sm text-gray-700">
                    {language === 'ar' ? 'تفعيل الحركات' : 'Enable animations'}
                  </span>
                </label>

                {form.enable_animations && (
                  <div className="flex gap-3">
                    {(['slow', 'medium', 'fast'] as const).map((speed) => (
                      <button
                        key={speed}
                        onClick={() => update('animation_speed', speed)}
                        className={`px-5 py-2 rounded-lg border-2 text-sm transition-all ${
                          form.animation_speed === speed
                            ? 'border-[#B8956E] bg-[#B8956E]/10 text-[#B8956E] font-semibold'
                            : 'border-gray-200 hover:border-gray-300 text-gray-700'
                        }`}
                      >
                        {language === 'ar'
                          ? speed === 'slow' ? 'بطيء' : speed === 'medium' ? 'متوسط' : 'سريع'
                          : speed.charAt(0).toUpperCase() + speed.slice(1)}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Live Preview */}
              <div className="border-t pt-6">
                <p className="text-sm font-medium text-gray-700 mb-3">
                  {language === 'ar' ? 'معاينة الألوان' : 'Color Preview'}
                </p>
                <div className="rounded-xl overflow-hidden border border-gray-200">
                  <div
                    className="h-14 flex items-center px-6 gap-4"
                    style={{ backgroundColor: form.secondary_color || '#1A1815' }}
                  >
                    <span className="text-white font-bold text-lg">{form.site_name || 'Store Name'}</span>
                  </div>
                  <div
                    className="h-24 flex items-center justify-center"
                    style={{ backgroundColor: form.background_color || '#FFFFFF' }}
                  >
                    <button
                      className="px-6 py-2 rounded-lg text-white text-sm font-medium"
                      style={{ backgroundColor: form.primary_color || '#B8956E' }}
                    >
                      {language === 'ar' ? 'تسوق الآن' : 'Shop Now'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── Templates ─ */}
          {active === 'templates' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h3 className="text-base font-semibold text-gray-900">
                    {language === 'ar' ? 'القوالب الجاهزة' : 'Ready-made Templates'}
                  </h3>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {language === 'ar'
                      ? 'اختر قالباً وسيتم تطبيق الألوان والخطوط والتخطيط تلقائياً'
                      : 'Pick a template to auto-apply colors, fonts, and layout'}
                  </p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {TEMPLATES.map((tpl) => (
                  <div
                    key={tpl.id}
                    className={`relative rounded-xl border-2 overflow-hidden cursor-pointer transition-all hover:shadow-md ${
                      form.template_id === tpl.id
                        ? 'border-[#B8956E] shadow-md'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => applyTemplate(tpl)}
                  >
                    <div className="flex h-16">
                      {tpl.preview.map((color, i) => (
                        <div key={i} className="flex-1" style={{ backgroundColor: color }} />
                      ))}
                    </div>

                    <div className="p-4 flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-gray-900">
                          {language === 'ar' ? tpl.nameAr : tpl.name}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {language === 'ar' ? tpl.descAr : tpl.desc}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {tpl.font} · {tpl.layout} · {tpl.grid} cols
                        </p>
                      </div>
                      {form.template_id === tpl.id ? (
                        <div className="w-8 h-8 rounded-full bg-[#B8956E] flex items-center justify-center flex-shrink-0">
                          <Check className="h-4 w-4 text-white" />
                        </div>
                      ) : (
                        <button className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs text-gray-600 hover:border-[#B8956E] hover:text-[#B8956E] transition-colors flex-shrink-0">
                          {language === 'ar' ? 'تطبيق' : 'Apply'}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-amber-50 border border-amber-100 rounded-lg p-4 text-sm text-amber-800">
                {language === 'ar'
                  ? '💡 بعد تطبيق القالب، يمكنك تعديل أي لون أو خط من قسم "الألوان والخطوط"'
                  : '💡 After applying a template, you can tweak any color or font in the "Theme Builder" tab'}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}