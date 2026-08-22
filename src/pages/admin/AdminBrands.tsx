import React, { useState, useEffect } from 'react';
import { useI18n } from '../../lib/i18n';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { ImageUploader } from '../../components/admin/ImageUploader';
import toast from 'react-hot-toast';
import { Plus, Trash2, Save, Edit2, Image as ImageIcon } from 'lucide-react';

interface Brand {
  id: string;
  name: string;
  name_ar: string;
  logo_url: string;
  slug: string;
  is_active: boolean;
  sort_order: number;
}

export function AdminBrands() {
  const { language } = useI18n();
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [form, setForm] = useState({
    name: '',
    name_ar: '',
    logo_url: '',
    slug: '',
    sort_order: 0,
    is_active: true,
  });

  useEffect(() => { fetchBrands(); }, []);

  async function fetchBrands() {
    const { data, error } = await supabase
      .from('brands')
      .select('*')
      .order('sort_order', { ascending: true });
    
    if (!error) setBrands(data || []);
    setLoading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.name_ar || !form.slug) {
      toast.error(language === 'ar' ? 'يرجى ملء الحقول المطلوبة' : 'Please fill required fields');
      return;
    }

    setSaving(true);
    
    if (editingId) {
      // تحديث ماركة موجودة
      const { error } = await supabase
        .from('brands')
        .update(form)
        .eq('id', editingId);
      
      if (error) {
        toast.error(language === 'ar' ? 'فشل التحديث' : 'Update failed');
      } else {
        toast.success(language === 'ar' ? 'تم تحديث الماركة بنجاح' : 'Brand updated successfully');
        setEditingId(null);
      }
    } else {
      // إضافة ماركة جديدة
      const { error } = await supabase
        .from('brands')
        .insert([form]);
      
      if (error) {
        toast.error(language === 'ar' ? 'فشل الإضافة' : 'Add failed');
      } else {
        toast.success(language === 'ar' ? 'تمت إضافة الماركة بنجاح' : 'Brand added successfully');
      }
    }
    
    setForm({ name: '', name_ar: '', logo_url: '', slug: '', sort_order: 0, is_active: true });
    fetchBrands();
    setSaving(false);
  }

  async function handleEdit(brand: Brand) {
    setEditingId(brand.id);
    setForm({
      name: brand.name,
      name_ar: brand.name_ar,
      logo_url: brand.logo_url || '',
      slug: brand.slug,
      sort_order: brand.sort_order,
      is_active: brand.is_active,
    });
  }

  async function handleDelete(id: string) {
    if (window.confirm(language === 'ar' ? 'هل أنت متأكد من الحذف؟' : 'Are you sure?')) {
      await supabase.from('brands').delete().eq('id', id);
      toast.success(language === 'ar' ? 'تم الحذف' : 'Deleted');
      fetchBrands();
    }
  }

  const generateSlug = (name: string) => {
    return name.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  if (loading) return <div className="p-8 text-center">جاري التحميل...</div>;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{language === 'ar' ? 'إدارة الماركات' : 'Manage Brands'}</h1>
          <p className="text-gray-500 mt-1">{language === 'ar' ? 'أضف أو عدل الماركات المعروضة في الموقع' : 'Add or edit brands displayed on the website'}</p>
        </div>
      </div>

      {/* نموذج الإضافة/التعديل */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          {editingId ? <Edit2 className="h-5 w-5 text-[#B8956E]" /> : <Plus className="h-5 w-5 text-[#B8956E]" />}
          {editingId ? (language === 'ar' ? 'تعديل ماركة' : 'Edit Brand') : (language === 'ar' ? 'إضافة ماركة جديدة' : 'Add New Brand')}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <Input 
              label={language === 'ar' ? 'الاسم (عربي)' : 'Name (Arabic)'} 
              value={form.name_ar} 
              onChange={(e) => setForm({...form, name_ar: e.target.value})} 
              required 
            />
            <Input 
              label={language === 'ar' ? 'الاسم (English)' : 'Name (English)'} 
              value={form.name} 
              onChange={(e) => {
                const value = e.target.value;
                setForm({
                  ...form, 
                  name: value,
                  slug: form.slug || generateSlug(value)
                });
              }} 
              required 
            />
          </div>
          
          <Input 
            label={language === 'ar' ? 'الرابط (Slug)' : 'Slug'} 
            value={form.slug} 
            onChange={(e) => setForm({...form, slug: e.target.value})} 
            required 
            placeholder="e.g., clarks, ecco, skechers"
          />
          
          <ImageUploader 
            bucket="brands" 
            multiple={false} 
            label={language === 'ar' ? 'شعار الماركة' : 'Brand Logo'} 
            value={form.logo_url ? [form.logo_url] : []} 
            onChange={(urls) => setForm({...form, logo_url: urls[0] || ''})} 
          />
          
          <div className="grid md:grid-cols-2 gap-4">
            <Input 
              label={language === 'ar' ? 'ترتيب العرض' : 'Sort Order'} 
              type="number"
              value={form.sort_order} 
              onChange={(e) => setForm({...form, sort_order: Number(e.target.value)})} 
            />
            <label className="flex items-center gap-2 mt-8">
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={(e) => setForm({...form, is_active: e.target.checked})}
                className="w-4 h-4 rounded border-gray-300 text-[#B8956E] focus:ring-[#B8956E]"
              />
              <span className="text-sm text-gray-700">{language === 'ar' ? 'ماركة نشطة' : 'Active Brand'}</span>
            </label>
          </div>
          
          <div className="flex gap-2">
            <Button type="submit" disabled={saving}>
              <Save className="h-4 w-4 mr-2" />
              {saving ? (language === 'ar' ? 'جارٍ الحفظ...' : 'Saving...') : (editingId ? (language === 'ar' ? 'تحديث الماركة' : 'Update Brand') : (language === 'ar' ? 'إضافة الماركة' : 'Add Brand'))}
            </Button>
            {editingId && (
              <Button 
                type="button" 
                onClick={() => {
                  setEditingId(null);
                  setForm({ name: '', name_ar: '', logo_url: '', slug: '', sort_order: 0, is_active: true });
                }}
                variant="outline"
              >
                {language === 'ar' ? 'إلغاء' : 'Cancel'}
              </Button>
            )}
          </div>
        </form>
      </div>

      {/* قائمة الماركات الحالية */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-100 font-semibold text-gray-700">
          {language === 'ar' ? 'الماركات الحالية' : 'Current Brands'}
        </div>
        {brands.length === 0 ? (
          <div className="p-8 text-center text-gray-500 flex flex-col items-center gap-2">
            <ImageIcon className="h-8 w-8 text-gray-300" />
            {language === 'ar' ? 'لا توجد ماركات مضافة بعد' : 'No brands added yet'}
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {brands.map((brand) => (
              <div key={brand.id} className="p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors">
                {brand.logo_url ? (
                  <img src={brand.logo_url} alt={brand.name} className="w-16 h-16 object-contain rounded-lg border border-gray-200 p-2" />
                ) : (
                  <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                    <span className="text-xs text-gray-400">{brand.name.substring(0, 2).toUpperCase()}</span>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900">{brand.name}</p>
                  <p className="text-sm text-gray-500">{brand.name_ar}</p>
                  <p className="text-xs text-gray-400 mt-1">Slug: {brand.slug}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded-full text-xs ${brand.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                    {brand.is_active ? (language === 'ar' ? 'نشط' : 'Active') : (language === 'ar' ? 'غير نشط' : 'Inactive')}
                  </span>
                  <button 
                    onClick={() => handleEdit(brand)} 
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button 
                    onClick={() => handleDelete(brand.id)} 
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