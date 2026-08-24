import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useI18n } from '../../lib/i18n';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import toast from 'react-hot-toast';
import { Plus, Trash2, Edit2, Video, Image as ImageIcon, MoveUp, MoveDown } from 'lucide-react';

interface ImageUploaderProps {
  onUpload: (url: string) => void;
  currentImage?: string;
}

function ImageUploader({ onUpload, currentImage = '' }: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(currentImage);

  useEffect(() => {
    setPreview(currentImage);
  }, [currentImage]);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);

    try {
      const fileName = `${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
      const { data, error } = await supabase.storage
        .from('media')
        .upload(fileName, file, { upsert: true });

      if (error) throw error;

      const publicUrl = `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/media/${data?.path ?? fileName}`;
      setPreview(publicUrl);
      onUpload(publicUrl);
      toast.success('تم رفع الصورة بنجاح');
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('فشل في رفع الصورة');
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  return (
    <div className="space-y-3">
      {preview && (
        <div className="w-full h-40 overflow-hidden rounded-lg border border-gray-200 bg-gray-100">
          <img src={preview} alt="Preview" className="w-full h-full object-cover" />
        </div>
      )}

      <label className="inline-flex cursor-pointer items-center rounded-lg border border-[#B8956E] bg-[#B8956E] px-4 py-2 text-sm font-medium text-white hover:bg-[#a77d55]">
        <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
        {uploading ? 'جارٍ الرفع...' : 'اختر صورة'}
      </label>
    </div>
  );
}

interface HeroSlide {
  id: string;
  title_ar: string;
  title_en: string;
  subtitle_ar: string;
  subtitle_en: string;
  media_type: 'image' | 'video';
  media_url: string;
  video_url: string;
  button_text_ar: string;
  button_text_en: string;
  button_link: string;
  display_order: number;
  is_active: boolean;
}

export function AdminHeroSlides() {
  const { language } = useI18n();
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState<Partial<HeroSlide>>({
    title_ar: '',
    title_en: '',
    subtitle_ar: '',
    subtitle_en: '',
    media_type: 'image',
    media_url: '',
    video_url: '',
    button_text_ar: '',
    button_text_en: '',
    button_link: '',
    display_order: 0,
    is_active: true,
  });

  useEffect(() => {
    fetchSlides();
  }, []);

  const fetchSlides = async () => {
    try {
      const { data, error } = await supabase
        .from('hero_slides')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;
      setSlides(data || []);
    } catch (error) {
      console.error('Error fetching slides:', error);
      toast.error('فشل في تحميل العروض');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingId) {
        const { error } = await supabase
          .from('hero_slides')
          .update({ ...formData, updated_at: new Date().toISOString() })
          .eq('id', editingId);

        if (error) throw error;
        toast.success('تم تحديث العرض بنجاح');
      } else {
        const { error } = await supabase
          .from('hero_slides')
          .insert([{ ...formData, created_at: new Date().toISOString() }]);

        if (error) throw error;
        toast.success('تم إضافة العرض بنجاح');
      }

      resetForm();
      fetchSlides();
    } catch (error) {
      console.error('Error saving slide:', error);
      toast.error('فشل في حفظ العرض');
    }
  };

  const handleEdit = (slide: HeroSlide) => {
    setFormData(slide);
    setEditingId(slide.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا العرض؟')) return;

    try {
      const { error } = await supabase.from('hero_slides').delete().eq('id', id);
      if (error) throw error;
      toast.success('تم حذف العرض بنجاح');
      fetchSlides();
    } catch (error) {
      console.error('Error deleting slide:', error);
      toast.error('فشل في حذف العرض');
    }
  };

  const handleMoveUp = async (index: number) => {
    if (index === 0) return;
    
    const updatedSlides = [...slides];
    const temp = updatedSlides[index];
    updatedSlides[index] = updatedSlides[index - 1];
    updatedSlides[index - 1] = temp;

    updatedSlides.forEach((slide, idx) => {
      slide.display_order = idx;
    });

    setSlides(updatedSlides);
    
    // تحديث في قاعدة البيانات
    await Promise.all(
      updatedSlides.map((slide) =>
        supabase
          .from('hero_slides')
          .update({ display_order: slide.display_order })
          .eq('id', slide.id)
      )
    );
  };

  const handleMoveDown = async (index: number) => {
    if (index === slides.length - 1) return;
    
    const updatedSlides = [...slides];
    const temp = updatedSlides[index];
    updatedSlides[index] = updatedSlides[index + 1];
    updatedSlides[index + 1] = temp;

    updatedSlides.forEach((slide, idx) => {
      slide.display_order = idx;
    });

    setSlides(updatedSlides);
    
    await Promise.all(
      updatedSlides.map((slide) =>
        supabase
          .from('hero_slides')
          .update({ display_order: slide.display_order })
          .eq('id', slide.id)
      )
    );
  };

  const resetForm = () => {
    setFormData({
      title_ar: '',
      title_en: '',
      subtitle_ar: '',
      subtitle_en: '',
      media_type: 'image',
      media_url: '',
      video_url: '',
      button_text_ar: '',
      button_text_en: '',
      button_link: '',
      display_order: slides.length,
      is_active: true,
    });
    setEditingId(null);
    setShowForm(false);
  };

  const handleMediaUpload = (url: string) => {
    setFormData({ ...formData, media_url: url });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#B8956E]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">إدارة عروض الـ Hero</h1>
        <Button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          {showForm ? 'إلغاء' : 'إضافة عرض جديد'}
        </Button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-6 space-y-6">
          <h2 className="text-xl font-semibold mb-4">
            {editingId ? 'تعديل العرض' : 'إضافة عرض جديد'}
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            <Input
              label="العنوان (العربية)"
              value={formData.title_ar || ''}
              onChange={(e) => setFormData({ ...formData, title_ar: e.target.value })}
              required
            />
            <Input
              label="العنوان (English)"
              value={formData.title_en || ''}
              onChange={(e) => setFormData({ ...formData, title_en: e.target.value })}
            />
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Textarea
              label="الوصف القصير (العربية)"
              value={formData.subtitle_ar || ''}
              onChange={(e) => setFormData({ ...formData, subtitle_ar: e.target.value })}
              rows={2}
            />
            <Textarea
              label="الوصف القصير (English)"
              value={formData.subtitle_en || ''}
              onChange={(e) => setFormData({ ...formData, subtitle_en: e.target.value })}
              rows={2}
            />
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">نوع الوسائط</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    value="image"
                    checked={formData.media_type === 'image'}
                    onChange={(e) => setFormData({ ...formData, media_type: e.target.value as 'image' })}
                    className="w-4 h-4"
                  />
                  <ImageIcon className="h-5 w-5" />
                  <span>صورة</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    value="video"
                    checked={formData.media_type === 'video'}
                    onChange={(e) => setFormData({ ...formData, media_type: e.target.value as 'video' })}
                    className="w-4 h-4"
                  />
                  <Video className="h-5 w-5" />
                  <span>فيديو</span>
                </label>
              </div>
            </div>

            {formData.media_type === 'video' && (
              <Input
                label="رابط الفيديو (YouTube أو Vimeo)"
                value={formData.video_url || ''}
                onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                placeholder="https://www.youtube.com/watch?v=..."
              />
            )}
          </div>

          {formData.media_type === 'image' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">صورة العرض</label>
              <ImageUploader onUpload={handleMediaUpload} currentImage={formData.media_url || ''} />
            </div>
          )}

          <div className="grid md:grid-cols-3 gap-6">
            <Input
              label="نص الزر (العربية)"
              value={formData.button_text_ar || ''}
              onChange={(e) => setFormData({ ...formData, button_text_ar: e.target.value })}
            />
            <Input
              label="نص الزر (English)"
              value={formData.button_text_en || ''}
              onChange={(e) => setFormData({ ...formData, button_text_en: e.target.value })}
            />
            <Input
              label="رابط الزر"
              value={formData.button_link || ''}
              onChange={(e) => setFormData({ ...formData, button_link: e.target.value })}
              placeholder="/shop"
            />
          </div>

          <div className="flex gap-4">
            <Button type="submit" className="flex-1">
              {editingId ? 'تحديث' : 'إضافة'}
            </Button>
            <Button type="button" variant="outline" onClick={resetForm}>
              إلغاء
            </Button>
          </div>
        </form>
      )}

      {/* قائمة العروض */}
      <div className="grid gap-4">
        {slides.map((slide, index) => (
          <div key={slide.id} className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-start gap-6">
              {/* المعاينة */}
              <div className="w-32 h-24 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                {slide.media_type === 'image' ? (
                  <img src={slide.media_url} alt="Slide" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-800">
                    <Video className="h-8 w-8 text-white" />
                  </div>
                )}
              </div>

              {/* المعلومات */}
              <div className="flex-1">
                <h3 className="font-semibold text-lg">
                  {language === 'ar' ? slide.title_ar : slide.title_en || slide.title_ar}
                </h3>
                <p className="text-gray-600 text-sm mt-1">
                  {language === 'ar' ? slide.subtitle_ar : slide.subtitle_en || slide.subtitle_ar}
                </p>
                <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    {slide.media_type === 'image' ? <ImageIcon className="h-4 w-4" /> : <Video className="h-4 w-4" />}
                    {slide.media_type === 'image' ? 'صورة' : 'فيديو'}
                  </span>
                  <span className={`px-2 py-1 rounded ${slide.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                    {slide.is_active ? 'نشط' : 'غير نشط'}
                  </span>
                </div>
              </div>

              {/* الأزرار */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleMoveUp(index)}
                  disabled={index === 0}
                  className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="تحريك لأعلى"
                >
                  <MoveUp className="h-5 w-5" />
                </button>
                <button
                  onClick={() => handleMoveDown(index)}
                  disabled={index === slides.length - 1}
                  className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="تحريك لأسفل"
                >
                  <MoveDown className="h-5 w-5" />
                </button>
                <button
                  onClick={() => handleEdit(slide)}
                  className="p-2 rounded-lg hover:bg-blue-50 text-blue-600"
                >
                  <Edit2 className="h-5 w-5" />
                </button>
                <button
                  onClick={() => handleDelete(slide.id)}
                  className="p-2 rounded-lg hover:bg-red-50 text-red-600"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {slides.length === 0 && (
          <div className="text-center py-12 bg-gray-50 rounded-xl">
            <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">لا توجد عروض حالياً</p>
            <Button onClick={() => setShowForm(true)} className="mt-4">
              أضف أول عرض
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}