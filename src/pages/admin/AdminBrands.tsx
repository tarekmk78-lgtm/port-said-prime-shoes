import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import toast from 'react-hot-toast';
import { Plus, Trash2, Edit2, Award } from 'lucide-react';

interface Brand {
  id: string;
  name: string;
  name_ar: string;
  name_en: string;
  slug: string;
  is_active: boolean;
}

export function AdminBrands() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    name_ar: '',
    name_en: '',
    is_active: true,
  });

  useEffect(() => {
    fetchBrands();
  }, []);

  const fetchBrands = async () => {
    try {
      console.log('Fetching brands from Supabase...');
      const { data, error } = await supabase
        .from('brands')
        .select('*')
        .order('name', { ascending: true });

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      
      console.log('Brands data:', data);
      setBrands(data || []);
      
      if (!data || data.length === 0) {
        console.warn('No brands found in database');
      }
    } catch (error) {
      console.error('Error fetching brands:', error);
      toast.error('فشل في تحميل الماركات: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const slug = formData.name_en.toLowerCase().replace(/\s+/g, '-') || 
                 formData.name.toLowerCase().replace(/\s+/g, '-');

    try {
      if (editingId) {
        const { error } = await supabase
          .from('brands')
          .update({
            name: formData.name,
            name_ar: formData.name_ar,
            name_en: formData.name_en,
            is_active: formData.is_active,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingId);
          
        if (error) throw error;
        toast.success('تم تحديث الماركة بنجاح');
      } else {
        const { error } = await supabase
          .from('brands')
          .insert([{
            name: formData.name,
            name_ar: formData.name_ar,
            name_en: formData.name_en,
            slug: slug,
            is_active: formData.is_active,
            created_at: new Date().toISOString()
          }]);
          
        if (error) throw error;
        toast.success('تم إضافة الماركة بنجاح');
      }
      
      setShowForm(false);
      setEditingId(null);
      setFormData({ name: '', name_ar: '', name_en: '', is_active: true });
      fetchBrands();
    } catch (error) {
      console.error('Error saving brand:', error);
      toast.error('فشل في حفظ الماركة');
    }
  };

  const handleEdit = (brand: Brand) => {
    setFormData({
      name: brand.name,
      name_ar: brand.name_ar,
      name_en: brand.name_en,
      is_active: brand.is_active,
    });
    setEditingId(brand.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذه الماركة؟')) return;
    
    try {
      const { error } = await supabase.from('brands').delete().eq('id', id);
      if (error) throw error;
      toast.success('تم حذف الماركة بنجاح');
      fetchBrands();
    } catch (error) {
      console.error('Error deleting brand:', error);
      toast.error('فشل في حذف الماركة');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#B8956E]"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">إدارة الماركات</h1>
        <Button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          {showForm ? 'إلغاء' : 'إضافة ماركة جديدة'}
        </Button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-6 space-y-6">
          <h2 className="text-xl font-semibold mb-4">
            {editingId ? 'تعديل الماركة' : 'إضافة ماركة جديدة'}
          </h2>

          <Input
            label="الاسم (عربي)"
            value={formData.name_ar}
            onChange={(e) => setFormData({ ...formData, name_ar: e.target.value })}
            required
            placeholder="مثال: نايكي"
          />
          
          <Input
            label="الاسم (English)"
            value={formData.name_en}
            onChange={(e) => setFormData({ ...formData, name_en: e.target.value })}
            required
            placeholder="Example: Nike"
          />
          
          <Input
            label="الاسم العام"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            placeholder="Nike"
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              نشط
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="w-4 h-4"
              />
              <span>ماركة نشطة</span>
            </label>
          </div>

          <div className="flex gap-4">
            <Button type="submit" className="flex-1">
              {editingId ? 'تحديث' : 'إضافة'}
            </Button>
            <Button type="button" variant="outline" onClick={() => {
              setShowForm(false);
              setEditingId(null);
            }}>
              إلغاء
            </Button>
          </div>
        </form>
      )}

      <div className="grid gap-4">
        {brands.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-xl">
            <Award className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">لا توجد ماركات حالياً</p>
            <Button onClick={() => setShowForm(true)} className="mt-4">
              أضف أول ماركة
            </Button>
          </div>
        ) : (
          brands.map((brand) => (
            <div key={brand.id} className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center">
                    <Award className="h-6 w-6 text-[#B8956E]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">
                      {brand.name_ar} / {brand.name_en}
                    </h3>
                    <p className="text-sm text-gray-500">Slug: {brand.slug}</p>
                    <span className={`inline-block mt-1 px-2 py-1 rounded text-xs ${
                      brand.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {brand.is_active ? 'نشط' : 'غير نشط'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEdit(brand)}
                    className="p-2 rounded-lg hover:bg-blue-50 text-blue-600"
                  >
                    <Edit2 className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(brand.id)}
                    className="p-2 rounded-lg hover:bg-red-50 text-red-600"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}