import React, { useState, useEffect } from 'react';
import { useI18n } from '../../lib/i18n';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { ImageUploader } from '../../components/admin/ImageUploader';
import toast from 'react-hot-toast';
import { Plus, Trash2, Save, Image as ImageIcon } from 'lucide-react';

export function AdminHeroSlides() {
  const { language } = useI18n();
  const [slides, setSlides] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [form, setForm] = useState({
    image_url: '',
    title_ar: '',
    title_en: '',
    subtitle_ar: '',
    subtitle_en: '',
    link: '/shop',
    btn_ar: 'تسوق الآن',
    btn_en: 'Shop Now',
    sort_order: 0,
  });

  useEffect(() => { fetchSlides(); }, []);

  async function fetchSlides() {
    const { data, error } = await supabase.from('hero_slides').select('*').order('sort_order', { ascending: true });
    if (!error) setSlides(data || []);
    setLoading(false);
  }

  async function handleAddSlide(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const { error } = await supabase.from('hero_slides').insert([form]);
    if (error) {
      toast.error(language === 'ar' ? 'فشل الحفظ' : 'Save failed');
    } else {
      toast.success(language === 'ar' ? 'تمت إضافة الشريحة بنجاح' : 'Slide added successfully');
      setForm({ image_url: '', title_ar: '', title_en: '', subtitle_ar: '', subtitle_en: '', link: '/shop', btn_ar: 'تسوق الآن', btn_en: 'Shop Now', sort_order: 0 });
      fetchSlides();
    }
    setSaving(false);
  }

  async function handleDelete(id: string) {
    if (window.confirm(language === 'ar' ? 'هل أنت متأكد من الحذف؟' : 'Are you sure?')) {
      await supabase.from('hero_slides').delete().eq('id', id);
      toast.success(language === 'ar' ? 'تم الحذف' : 'Deleted');
      fetchSlides();
    }
  }

  if (loading) return <div className="p-8 text-center">جاري التحميل...</div>;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{language === 'ar' ? 'إدارة شرائح الهيرو' : 'Manage Hero Slides'}</h1>
          <p className="text-gray-500 mt-1">{language === 'ar' ? 'أضف أو عدل الصور والنصوص التي تظهر في أعلى الصفحة الرئيسية' : 'Add or edit images and text for the homepage hero section'}</p>
        </div>
      </div>

      {/* نموذج الإضافة */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Plus className="h-5 w-5 text-[#B8956E]" />
          {language === 'ar' ? 'إضافة شريحة جديدة' : 'Add New Slide'}
        </h2>
        <form onSubmit={handleAddSlide} className="space-y-4">
          <ImageUploader 
            bucket="site-media" 
            multiple={false} 
            label={language === 'ar' ? 'صورة الشريحة' : 'Slide Image'} 
            value={form.image_url ? [form.image_url] : []} 
            onChange={(urls) => setForm({...form, image_url: urls[0] || ''})} 
          />
          <div className="grid md:grid-cols-2 gap-4">
            <Input label="العنوان (عربي)" value={form.title_ar} onChange={(e) => setForm({...form, title_ar: e.target.value})} required />
            <Input label="العنوان (English)" value={form.title_en} onChange={(e) => setForm({...form, title_en: e.target.value})} required />
            <Input label="العنوان الفرعي (عربي)" value={form.subtitle_ar} onChange={(e) => setForm({...form, subtitle_ar: e.target.value})} />
            <Input label="العنوان الفرعي (English)" value={form.subtitle_en} onChange={(e) => setForm({...form, subtitle_en: e.target.value})} />
            <Input label="رابط الزر (Link)" value={form.link} onChange={(e) => setForm({...form, link: e.target.value})} />
            <Input label="ترتيب العرض (Sort Order)" type="number" value={form.sort_order} onChange={(e) => setForm({...form, sort_order: Number(e.target.value)})} />
          </div>
          <Button type="submit" disabled={saving} className="w-full md:w-auto">
            <Save className="h-4 w-4 mr-2" />
            {saving ? (language === 'ar' ? 'جارٍ الحفظ...' : 'Saving...') : (language === 'ar' ? 'حفظ الشريحة' : 'Save Slide')}
          </Button>
        </form>
      </div>

      {/* قائمة الشرائح الحالية */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-100 font-semibold text-gray-700">
          {language === 'ar' ? 'الشرائح الحالية' : 'Current Slides'}
        </div>
        {slides.length === 0 ? (
          <div className="p-8 text-center text-gray-500 flex flex-col items-center gap-2">
            <ImageIcon className="h-8 w-8 text-gray-300" />
            {language === 'ar' ? 'لا توجد شرائح مضافة بعد' : 'No slides added yet'}
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {slides.map((slide) => (
              <div key={slide.id} className="p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors">
                <img src={slide.image_url} alt="slide" className="w-20 h-20 object-cover rounded-lg border border-gray-200" />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 truncate">{slide.title_ar}</p>
                  <p className="text-sm text-gray-500 truncate">{slide.title_en}</p>
                  <p className="text-xs text-[#B8956E] mt-1">{slide.link}</p>
                </div>
                <button 
                  onClick={() => handleDelete(slide.id)} 
                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  title={language === 'ar' ? 'حذف' : 'Delete'}
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}