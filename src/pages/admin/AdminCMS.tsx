import { CategorySelector } from '../../components/admin/CategorySelector';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useI18n } from '../../lib/i18n';
import { supabase } from '../../lib/supabase';
import { Banner } from '../../types';
import { Button } from '../../components/ui/Button';
import { ImageUploader } from '../../components/admin/ImageUploader';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import toast from 'react-hot-toast';
import {
  Image as ImageIcon,
  Save,
  Video,
  Monitor,
  Upload,
} from 'lucide-react';

export function AdminCMS() {
  const { language } = useI18n();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [heroData, setHeroData] = useState({
    hero_title: '',
    hero_title_ar: '',
    hero_subtitle: '',
    hero_subtitle_ar: '',
    hero_video_url: '',
    hero_image_url: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const { data: settingsData } = await supabase
        .from('settings')
        .select('*')
        .limit(1)
        .single();

      if (settingsData) {
        setHeroData({
          hero_title: settingsData.hero_title || '',
          hero_title_ar: settingsData.hero_title_ar || '',
          hero_subtitle: settingsData.hero_subtitle || '',
          hero_subtitle_ar: settingsData.hero_subtitle_ar || '',
          hero_video_url: settingsData.hero_video_url || '',
          hero_image_url: settingsData.hero_image_url || '',
        });
      }

      const { data: bannersData } = await supabase
        .from('banners')
        .select('*')
        .order('sort_order', { ascending: true });
      setBanners(bannersData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveHero = async () => {
  setSaving(true);
  try {
    const { data: existingSettings, error: fetchError } = await supabase
      .from('settings')
      .select('id')
      .limit(1)
      .single();

    if (fetchError) throw fetchError;

    const updateData = {
      hero_title: heroData.hero_title,
      hero_title_ar: heroData.hero_title_ar,
      hero_subtitle: heroData.hero_subtitle,
      hero_subtitle_ar: heroData.hero_subtitle_ar,
      hero_video_url: heroData.hero_video_url,
      hero_image_url: heroData.hero_image_url,
      hero_link_type: heroData.hero_link_type || 'shop',
      hero_filter: heroData.hero_filter || '',
      hero_custom_url: heroData.hero_custom_url || '',
      updated_at: new Date().toISOString(),
    };

    if (existingSettings?.id) {
      const { error } = await supabase
        .from('settings')
        .update(updateData)
        .eq('id', existingSettings.id);
      if (error) throw error;
    } else {
      const { error } = await supabase
        .from('settings')
        .insert([{ ...updateData, created_at: new Date().toISOString() }]);
      if (error) throw error;
    }

    toast.success(language === 'ar' ? 'تم الحفظ بنجاح' : 'Settings saved successfully');
    await fetchData();
  } catch (error) {
    console.error('Save error:', error);
    toast.error(language === 'ar' ? 'حدث خطأ' : 'An error occurred');
  } finally {
    setSaving(false);
  }
};

  const handleBannerUpdate = async (
    bannerId: string,
    field: string,
    value: string | boolean
  ) => {
    try {
      const { error } = await supabase
        .from('banners')
        .update({ [field]: value, updated_at: new Date().toISOString() })
        .eq('id', bannerId);

      if (error) throw error;
      toast.success(language === 'ar' ? 'تم التحديث' : 'Updated');
      fetchData();
    } catch (error) {
      toast.error(language === 'ar' ? 'حدث خطأ' : 'Error');
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
      toast.success(language === 'ar' ? 'تمت الإضافة' : 'Added');
      fetchData();
    } catch (error) {
      toast.error(language === 'ar' ? 'حدث خطأ' : 'Error');
    }
  };

  const handleDeleteBanner = async (bannerId: string) => {
    if (!confirm(language === 'ar' ? 'هل أنت متأكد؟' : 'Sure?')) return;
    try {
      await supabase.from('banners').delete().eq('id', bannerId);
      toast.success(language === 'ar' ? 'تم الحذف' : 'Deleted');
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
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          {language === 'ar' ? 'إدارة المحتوى' : 'Content Management'}
        </h1>
      </div>

   {/* Hero Section */}
<div className="bg-white rounded-xl shadow-sm">
  <div className="flex items-center gap-2 p-6 border-b border-gray-100">
    <Monitor className="h-5 w-5 text-[#B8956E]" />
    <h2 className="text-lg font-semibold">Hero Section</h2>
  </div>

  <div className="p-6 space-y-6">
    {/* العناوين */}
    <div className="grid md:grid-cols-2 gap-6">
      <Input
        label={language === 'ar' ? 'العنوان الرئيسي (EN)' : 'Main Title (EN)'}
        value={heroData.hero_title}
        onChange={(e) => setHeroData({ ...heroData, hero_title: e.target.value })}
      />
      <Input
        label={language === 'ar' ? 'العنوان الرئيسي (AR)' : 'Main Title (AR)'}
        value={heroData.hero_title_ar}
        onChange={(e) => setHeroData({ ...heroData, hero_title_ar: e.target.value })}
      />
    </div>

    <div className="grid md:grid-cols-2 gap-6">
      <Textarea
        label={language === 'ar' ? 'الوصف (EN)' : 'Subtitle (EN)'}
        value={heroData.hero_subtitle}
        onChange={(e) => setHeroData({ ...heroData, hero_subtitle: e.target.value })}
        rows={3}
      />
      <Textarea
        label={language === 'ar' ? 'الوصف (AR)' : 'Subtitle (AR)'}
        value={heroData.hero_subtitle_ar}
        onChange={(e) => setHeroData({ ...heroData, hero_subtitle_ar: e.target.value })}
        rows={3}
      />
    </div>

    {/* ✅ إعدادات الروابط */}
    <div className="border-t pt-6 space-y-4">
      <h3 className="text-lg font-semibold flex items-center gap-2">
        <Link className="h-5 w-5 text-[#B8956E]" />
        {language === 'ar' ? 'إعدادات الروابط' : 'Link Settings'}
      </h3>

      <div className="grid md:grid-cols-2 gap-4">
        {/* نوع الرابط للزر الرئيسي */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">
            {language === 'ar' ? 'رابط زر "تسوق الآن"' : '"Shop Now" Button Link'}
          </label>
          <select
            value={heroData.hero_link_type || 'shop'}
            onChange={(e) => setHeroData({ ...heroData, hero_link_type: e.target.value })}
            className="w-full px-3 py-2 border border-gray-200 rounded"
          >
            <option value="shop">{language === 'ar' ? 'المتجر (كل المنتجات)' : 'Shop (All Products)'}</option>
            <option value="category">{language === 'ar' ? 'فئة معينة' : 'Specific Category'}</option>
            <option value="offers">{language === 'ar' ? 'العروض والخصومات' : 'Offers & Sales'}</option>
            <option value="search">{language === 'ar' ? 'بحث عن منتجات' : 'Search Products'}</option>
            <option value="url">{language === 'ar' ? 'رابط مخصص' : 'Custom URL'}</option>
          </select>
        </div>

        {/* الفلتر أو البحث */}
        {(heroData.hero_link_type === 'search' || heroData.hero_link_type === 'shop') && (
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              {heroData.hero_link_type === 'search' 
                ? (language === 'ar' ? 'كلمة البحث' : 'Search Term')
                : (language === 'ar' ? 'فلتر المنتجات' : 'Product Filter')}
            </label>
            <Input
              value={heroData.hero_filter || ''}
              onChange={(e) => setHeroData({ ...heroData, hero_filter: e.target.value })}
              placeholder={language === 'ar' ? 'مثال: صيف 2026' : 'Example: Summer 2026'}
            />
            <p className="text-xs text-gray-500 mt-1">
              {language === 'ar' 
                ? 'سيتم البحث عن المنتجات التي تحتوي على هذا النص'
                : 'Products containing this text will be shown'}
            </p>
          </div>
        )}

        {/* اختيار الفئة */}
        {heroData.hero_link_type === 'category' && (
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              {language === 'ar' ? 'اختر الفئة' : 'Select Category'}
            </label>
            <CategorySelector
              value={heroData.hero_filter}
              onChange={(id) => setHeroData({ ...heroData, hero_filter: id })}
            />
          </div>
        )}

        {/* الرابط المخصص */}
        {heroData.hero_link_type === 'url' && (
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              {language === 'ar' ? 'الرابط' : 'URL'}
            </label>
            <Input
              value={heroData.hero_custom_url || ''}
              onChange={(e) => setHeroData({ ...heroData, hero_custom_url: e.target.value })}
              placeholder="https://..."
            />
          </div>
        )}
      </div>
    </div>

    {/* الفيديو والصورة */}
    <div className="grid md:grid-cols-2 gap-6">
      <div>
        <label className="block text-sm font-medium mb-2">Video URL</label>
        <input
          type="text"
          value={heroData.hero_video_url}
          onChange={(e) => setHeroData({ ...heroData, hero_video_url: e.target.value })}
          placeholder="https://youtube.com/..."
          className="w-full px-4 py-2 border rounded-lg"
        />
      </div>

      <ImageUploader
        bucket="site-media"
        label={language === 'ar' ? 'صورة الخلفية' : 'Background Image'}
        multiple={false}
        value={heroData.hero_image_url ? [heroData.hero_image_url] : []}
        onChange={(urls) => setHeroData({ ...heroData, hero_image_url: urls[0] || '' })}
      />
    </div>

    <Button onClick={handleSaveHero} isLoading={saving}>
      <Save className="h-4 w-4 mr-2" />
      {language === 'ar' ? 'حفظ التغييرات' : 'Save Changes'}
    </Button>
  </div>
</div>

      {/* Banners */}
      <div className="bg-white rounded-xl shadow-sm">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5 text-[#B8956E]" />
            <h2 className="text-lg font-semibold">Banners</h2>
          </div>
          <Button onClick={handleAddBanner}>
            <Upload className="h-4 w-4 mr-2" />
            {language === 'ar' ? 'إضافة بانر' : 'Add Banner'}
          </Button>
        </div>

        <div className="p-6 space-y-4">
          {banners.map((banner) => (
            <div key={banner.id} className="border border-gray-200 rounded-lg p-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <Input
                  value={banner.title || ''}
                  onChange={(e) => handleBannerUpdate(banner.id, 'title', e.target.value)}
                  placeholder="Title (EN)"
                />
                <Input
                  value={banner.title_ar || ''}
                  onChange={(e) => handleBannerUpdate(banner.id, 'title_ar', e.target.value)}
                  placeholder="العنوان (AR)"
                />
              </div>

              <ImageUploader
                bucket="site-media"
                multiple={false}
                value={banner.image_url ? [banner.image_url] : []}
                onChange={(urls) => handleBannerUpdate(banner.id, 'image_url', urls[0] || '')}
              />

              <div className="flex gap-4 items-center">
                <select
                  value={banner.position || 'promo'}
                  onChange={(e) => handleBannerUpdate(banner.id, 'position', e.target.value)}
                  className="px-3 py-2 border border-gray-200 rounded"
                >
                  <option value="hero">Hero</option>
                  <option value="promo">Promo</option>
                  <option value="category">Category</option>
                </select>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={banner.is_active ?? true}
                    onChange={(e) => handleBannerUpdate(banner.id, 'is_active', e.target.checked)}
                  />
                  <span>Active</span>
                </label>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteBanner(banner.id)}
                  className="text-red-600 hover:bg-red-50"
                >
                  Delete
                </Button>
              </div>
            </div>
          ))}
          {banners.length === 0 && (
            <p className="text-center text-gray-500 py-8">No banners yet</p>
          )}
        </div>
      </div>
    </div>
  );
}