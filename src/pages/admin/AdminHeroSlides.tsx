import React, { useState, useEffect } from 'react';
import { useI18n } from '../../lib/i18n';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { ImageUploader } from '../../components/admin/ImageUploader';
import toast from 'react-hot-toast';
import { Plus, Trash2, Save, Edit2, ArrowUp, ArrowDown } from 'lucide-react';

interface HeroSlide {
  id: string;
  title: string;
  title_ar: string;
  subtitle: string;
  subtitle_ar: string;
  description: string;
  description_ar: string;
  image_url: string;
  button_text: string;
  button_text_ar: string;
  button_link: string;
  is_active: boolean;
  sort_order: number;
}

export function AdminHeroSlides() {
  const { language } = useI18n();
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [form, setForm] = useState<Partial<HeroSlide>>({
    title: '',
    title_ar: '',
    subtitle: '',
    subtitle_ar: '',
    description: '',
    description_ar: '',
    image_url: '',
    button_text: '',
    button_text_ar: '',
    button_link: '/shop',
    is_active: true,
    sort_order: 0,
  });

  useEffect(() => { fetchSlides(); }, []);

  async function fetchSlides() {
    const { data, error } = await supabase
      .from('hero_slides')
      .select('*')
      .order('sort_order', { ascending: true });
    
    if (!error) setSlides(data || []);
    setLoading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title || !form.title_ar || !form.subtitle || !form.subtitle_ar) {
      toast.error(language === 'ar' ? 'يرجى ملء الحقول المطلوبة' : 'Please fill required fields');
      return;
    }

    setSaving(true);
    
    try {
      if (editingId) {
        const { error } = await supabase
          .from('hero_slides')
          .update(form)
          .eq('id', editingId);
        
        if (error) throw error;
        toast.success(language === 'ar' ? 'تم التحديث بنجاح' : 'Updated successfully');
        setEditingId(null);
      } else {
        const { error } = await supabase
          .from('hero_slides')
          .insert([{
            ...form,
            sort_order: slides.length,
          }]);
        
        if (error) throw error;
        toast.success(language === 'ar' ? 'تمت الإضافة بنجاح' : 'Added successfully');
      }
      
      setForm({
        title: '',
        title_ar: '',
        subtitle: '',
        subtitle_ar: '',
        description: '',
        description_ar: '',
        image_url: '',
        button_text: '',
        button_text_ar: '',
        button_link: '/shop',
        is_active: true,
        sort_order: 0,
      });
      fetchSlides();
    } catch (error: any) {
      toast.error(error.message || 'Operation failed');
    } finally {
      setSaving(false);
    }
  }

  async function handleEdit(slide: HeroSlide) {
    setEditingId(slide.id);
    setForm({ ...slide });
  }

  async function handleDelete(id: string) {
    if (window.confirm(language === 'ar' ? 'هل أنت متأكد من الحذف؟' : 'Are you sure?')) {
      await supabase.from('hero_slides').delete().eq('id', id);
      toast.success(language === 'ar' ? 'تم الحذف' : 'Deleted');
      fetchSlides();
    }
  }

  async function moveSlide(index: number, direction: 'up' | 'down') {
    const newSlides = [...slides];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (newIndex < 0 || newIndex >= newSlides.length) return;
    
    [newSlides[index], newSlides[newIndex]] = [newSlides[newIndex], newSlides[index]];
    
    // تحديث الـ sort_order
    const updates = newSlides.map((slide, idx) => ({
      id: slide.id,
      sort_order: idx,
    }));
    
    await supabase
      .from('hero_slides')
      .upsert(updates);
    
    fetchSlides();
  }

  if (loading) return <div className="p-8 text-center">جاري التحميل...</div>;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{language === 'ar' ? 'إدارة سلايدر الصفحة الرئيسية' : 'Manage Hero Slider'}</h1>
          <p className="text-gray-500 mt-1">{language === 'ar' ? 'أضف أو عدل شرائح العرض الرئيسية' : 'Add or edit hero slides'}</p>
        </div>
      </div>

      {/* نموذج الإضافة/التعديل */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          {editingId ? <Edit2 className="h-5 w-5 text-[#B8956E]" /> : <Plus className="h-5 w-5 text-[#B8956E]" />}
          {editingId ? (language === 'ar' ? 'تعديل شريحة' : 'Edit Slide') : (language === 'ar' ? 'إضافة شريحة جديدة' : 'Add New Slide')}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <Input 
              label={language === 'ar' ? 'العنوان (عربي) *' : 'Title (Arabic) *'} 
              value={form.title_ar || ''} 
              onChange={(e) => setForm({...form, title_ar: e.target.value})} 
              required 
            />
            <Input 
              label={language === 'ar' ? 'العنوان (English) *' : 'Title (English) *'} 
              value={form.title || ''} 
              onChange={(e) => setForm({...form, title: e.target.value})} 
              required 
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <Input 
              label={language === 'ar' ? 'العنوان الفرعي (عربي) *' : 'Subtitle (Arabic) *'} 
              value={form.subtitle_ar || ''} 
              onChange={(e) => setForm({...form, subtitle_ar: e.target.value})} 
              required 
            />
            <Input 
              label={language === 'ar' ? 'العنوان الفرعي (English) *' : 'Subtitle (English) *'} 
              value={form.subtitle || ''} 
              onChange={(e) => setForm({...form, subtitle: e.target.value})} 
              required 
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <textarea
              label={language === 'ar' ? 'الوصف (عربي)' : 'Description (Arabic)'}
              value={form.description_ar || ''}
              onChange={(e) => setForm({...form, description_ar: e.target.value})}
              className="w-full h-24 p-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#B8956E]"
              placeholder={language === 'ar' ? 'اكتب الوصف هنا...' : 'Enter description...'}
            />
            <textarea
              label={language === 'ar' ? 'الوصف (English)' : 'Description (English)'}
              value={form.description || ''}
              onChange={(e) => setForm({...form, description: e.target.value})}
              className="w-full h-24 p-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#B8956E]"
              placeholder="Enter description..."
            />
          </div>
          
          <ImageUploader 
            bucket="site-media" 
            multiple={false} 
            label={language === 'ar' ? 'صورة الشريحة *' : 'Slide Image *'} 
            value={form.image_url ? [form.image_url] : []} 
            onChange={(urls) => setForm({...form, image_url: urls[0] || ''})} 
          />

          <div className="grid md:grid-cols-2 gap-4">
            <Input 
              label={language === 'ar' ? 'نص الزر (عربي)' : 'Button Text (Arabic)'} 
              value={form.button_text_ar || ''} 
              onChange={(e) => setForm({...form, button_text_ar: e.target.value})} 
            />
            <Input 
              label={language === 'ar' ? 'نص الزر (English)' : 'Button Text (English)'} 
              value={form.button_text || ''} 
              onChange={(e) => setForm({...form, button_text: e.target.value})} 
            />
          </div>

          <Input 
            label={language === 'ar' ? 'رابط الزر' : 'Button Link'} 
            value={form.button_link || '/shop'} 
            onChange={(e) => setForm({...form, button_link: e.target.value})} 
            placeholder="/shop"
          />
          
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={(e) => setForm({...form, is_active: e.target.checked})}
              className="w-4 h-4 rounded border-gray-300 text-[#B8956E] focus:ring-[#B8956E]"
            />
            <span className="text-sm text-gray-700">{language === 'ar' ? 'شريحة نشطة' : 'Active Slide'}</span>
          </div>
          
          <div className="flex gap-2">
            <Button type="submit" disabled={saving}>
              <Save className="h-4 w-4 mr-2" />
              {saving ? (language === 'ar' ? 'جارٍ الحفظ...' : 'Saving...') : (editingId ? (language === 'ar' ? 'تحديث الشريحة' : 'Update Slide') : (language === 'ar' ? 'إضافة الشريحة' : 'Add Slide'))}
            </Button>
            {editingId && (
              <Button 
                type="button" 
                onClick={() => {
                  setEditingId(null);
                  setForm({
                    title: '',
                    title_ar: '',
                    subtitle: '',
                    subtitle_ar: '',
                    description: '',
                    description_ar: '',
                    image_url: '',
                    button_text: '',
                    button_text_ar: '',
                    button_link: '/shop',
                    is_active: true,
                    sort_order: 0,
                  });
                }}
                variant="outline"
              >
                {language === 'ar' ? 'إلغاء' : 'Cancel'}
              </Button>
            )}
          </div>
        </form>
      </div>

      {/* قائمة الشرائح الحالية */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-100 font-semibold text-gray-700">
          {language === 'ar' ? 'الشرائح الحالية' : 'Current Slides'} ({slides.length})
        </div>
        {slides.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            {language === 'ar' ? 'لا توجد شرائح مضافة بعد' : 'No slides added yet'}
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {slides.map((slide, index) => (
              <div key={slide.id} className="p-4 flex items-start gap-4 hover:bg-gray-50 transition-colors">
                {slide.image_url ? (
                  <img src={slide.image_url} alt={slide.title} className="w-32 h-20 object-cover rounded-lg border border-gray-200" />
                ) : (
                  <div className="w-32 h-20 bg-gray-100 rounded-lg flex items-center justify-center">
                    <span className="text-xs text-gray-400">No Image</span>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900">{slide.title_ar}</p>
                  <p className="text-sm text-gray-500">{slide.title}</p>
                  <p className="text-xs text-gray-400 mt-1">{slide.subtitle_ar} | {slide.subtitle}</p>
                </div>
                <div className="flex items-center gap-1">
                  <button 
                    onClick={() => moveSlide(index, 'up')}
                    disabled={index === 0}
                    className="p-1.5 text-gray-600 hover:bg-gray-100 rounded disabled:opacity-30"
                  >
                    <ArrowUp className="h-4 w-4" />
                  </button>
                  <button 
                    onClick={() => moveSlide(index, 'down')}
                    disabled={index === slides.length - 1}
                    className="p-1.5 text-gray-600 hover:bg-gray-100 rounded disabled:opacity-30"
                  >
                    <ArrowDown className="h-4 w-4" />
                  </button>
                  <button 
                    onClick={() => handleEdit(slide)} 
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button 
                    onClick={() => handleDelete(slide.id)} 
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}