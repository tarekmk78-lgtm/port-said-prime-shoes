import { useEffect, useState } from 'react';
import { useI18n } from '../../lib/i18n';
import { supabase } from '../../lib/supabase';
import { Banner } from '../../types';
import { Button } from '../../components/ui/Button';
import { ImageUploader } from '../../components/admin/ImageUploader';
import { Input } from '../../components/ui/Input';
import toast from 'react-hot-toast';
import { Image as ImageIcon, Upload } from 'lucide-react';

export function AdminCMS() {
  const { language } = useI18n();
  const [loading, setLoading] = useState(true);
  const [banners, setBanners] = useState<Banner[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const { data: bannersData, error } = await supabase
        .from('banners')
        .select('*')
        .order('sort_order', { ascending: true });
        
      if (error) throw error;
      setBanners(bannersData || []);
    } catch (error) {
      console.error('Error fetching banners:', error);
      toast.error(language === 'ar' ? 'فشل في تحميل البانرز' : 'Failed to load banners');
    } finally {
      setLoading(false);
    }
  };

  const handleBannerUpdate = async (bannerId: string, field: string, value: string | boolean) => {
    try {
      const { error } = await supabase
        .from('banners')
        .update({ [field]: value, updated_at: new Date().toISOString() })
        .eq('id', bannerId);

      if (error) throw error;
      // ملاحظة: يمكن إزالة toast هنا لتجنب الإزعاج عند كل حرف، أو تركه كما هو
    } catch (error) {
      toast.error(language === 'ar' ? 'حدث خطأ في التحديث' : 'Update error');
    }
  };

  const handleAddBanner = async () => {
    try {
      const { error } = await supabase.from('banners').insert({
        title: 'New Banner',
        title_ar: 'بانر جديد',
        image_url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800',
        position: 'promo',
        is_active: true,
        sort_order: banners.length + 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      if (error) throw error;
      toast.success(language === 'ar' ? 'تمت إضافة البانر' : 'Banner added');
      fetchData();
    } catch (error) {
      toast.error(language === 'ar' ? 'حدث خطأ' : 'Error');
    }
  };

  const handleDeleteBanner = async (bannerId: string) => {
    if (!confirm(language === 'ar' ? 'هل أنت متأكد من حذف هذا البانر؟' : 'Are you sure you want to delete this banner?')) return;
    try {
      const { error } = await supabase.from('banners').delete().eq('id', bannerId);
      if (error) throw error;
      toast.success(language === 'ar' ? 'تم الحذف بنجاح' : 'Deleted successfully');
      fetchData();
    } catch (error) {
      toast.error(language === 'ar' ? 'حدث خطأ' : 'Error');
    }
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {language === 'ar' ? 'إدارة البانرز والميديا' : 'Banners & Media Management'}
          </h1>
          <p className="text-gray-500 mt-1 text-sm">
            {language === 'ar' 
              ? 'إدارة البانرات الإعلانية (ملاحظة: إدارة هيرو الصفحة الرئيسية تتم من صفحة "عروض Hero")' 
              : 'Manage promotional banners (Note: Main Hero is managed in "Hero Slides" page)'}
          </p>
        </div>
        <Button onClick={handleAddBanner}>
          <Upload className="h-4 w-4 mr-2" />
          {language === 'ar' ? 'إضافة بانر جديد' : 'Add New Banner'}
        </Button>
      </div>

      {/* Banners List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 space-y-6">
          {banners.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <ImageIcon className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p>{language === 'ar' ? 'لا توجد بانرات حالياً' : 'No banners yet'}</p>
            </div>
          ) : (
            banners.map((banner) => (
              <div key={banner.id} className="border border-gray-200 rounded-lg p-5 space-y-4 hover:shadow-md transition-shadow">
                <div className="grid md:grid-cols-2 gap-4">
                  <Input
                    label={language === 'ar' ? 'العنوان (English)' : 'Title (EN)'}
                    value={banner.title || ''}
                    onChange={(e) => handleBannerUpdate(banner.id, 'title', e.target.value)}
                    placeholder="Banner Title"
                  />
                  <Input
                    label={language === 'ar' ? 'العنوان (عربي)' : 'Title (AR)'}
                    value={banner.title_ar || ''}
                    onChange={(e) => handleBannerUpdate(banner.id, 'title_ar', e.target.value)}
                    placeholder="عنوان البانر"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {language === 'ar' ? 'صورة البانر' : 'Banner Image'}
                  </label>
                  <ImageUploader
                    bucket="site-media"
                    multiple={false}
                    value={banner.image_url ? [banner.image_url] : []}
                    onChange={(urls) => handleBannerUpdate(banner.id, 'image_url', urls[0] || '')}
                  />
                </div>

                <div className="flex flex-wrap gap-4 items-center pt-2 border-t border-gray-100">
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium text-gray-700">
                      {language === 'ar' ? 'الموقع:' : 'Position:'}
                    </label>
                    <select
                      value={banner.position || 'promo'}
                      onChange={(e) => handleBannerUpdate(banner.id, 'position', e.target.value)}
                      className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#B8956E]"
                    >
                      <option value="promo">Promo (منتصف الصفحة)</option>
                      <option value="category">Category (صفحة الأقسام)</option>
                      <option value="footer">Footer (أسفل الموقع)</option>
                    </select>
                  </div>

                  <label className="flex items-center gap-2 cursor-pointer bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200">
                    <input
                      type="checkbox"
                      checked={banner.is_active ?? true}
                      onChange={(e) => handleBannerUpdate(banner.id, 'is_active', e.target.checked)}
                      className="rounded border-gray-300 text-[#B8956E] focus:ring-[#B8956E]"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      {language === 'ar' ? 'مفعل' : 'Active'}
                    </span>
                  </label>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteBanner(banner.id)}
                    className="text-red-600 hover:bg-red-50 hover:text-red-700 mr-auto"
                  >
                    {language === 'ar' ? 'حذف' : 'Delete'}
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}