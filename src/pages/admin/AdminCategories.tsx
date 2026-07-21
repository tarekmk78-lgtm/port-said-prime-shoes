import React, { useEffect, useState } from 'react';
import { useI18n } from '../../lib/i18n';
import { supabase } from '../../lib/supabase';
import { Category } from '../../types';
import { slugify } from '../../lib/utils';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { Modal } from '../../components/ui/Modal';
import { ImageUploader } from '../../components/admin/ImageUploader';
import toast from 'react-hot-toast';
import { Plus, Pencil, Trash2, GripVertical, FolderOpen } from 'lucide-react';

const emptyForm = {
  name: '',
  name_ar: '',
  slug: '',
  description: '',
  description_ar: '',
  image_url: '',
  is_active: true,
  sort_order: 0,
};

export function AdminCategories() {
  const { language } = useI18n();
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  async function fetchCategories() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('sort_order');
      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error(error);
      toast.error(language === 'ar' ? 'فشل تحميل الفئات' : 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  }

  function openCreate() {
    setEditingId(null);
    setForm({ ...emptyForm, sort_order: categories.length });
    setIsModalOpen(true);
  }

  function openEdit(category: Category) {
    setEditingId(category.id);
    setForm({
      name: category.name,
      name_ar: category.name_ar,
      slug: category.slug,
      description: category.description || '',
      description_ar: category.description_ar || '',
      image_url: category.image_url || '',
      is_active: category.is_active,
      sort_order: category.sort_order,
    });
    setIsModalOpen(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form, slug: form.slug || slugify(form.name) };

      if (editingId) {
        const { error } = await supabase.from('categories').update(payload).eq('id', editingId);
        if (error) throw error;
        toast.success(language === 'ar' ? 'تم تحديث الفئة' : 'Category updated');
      } else {
        const { error } = await supabase.from('categories').insert(payload);
        if (error) throw error;
        toast.success(language === 'ar' ? 'تم إنشاء الفئة' : 'Category created');
      }

      setIsModalOpen(false);
      fetchCategories();
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || (language === 'ar' ? 'حدث خطأ' : 'Something went wrong'));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm(language === 'ar' ? 'حذف هذه الفئة؟' : 'Delete this category?')) return;
    try {
      const { error } = await supabase.from('categories').delete().eq('id', id);
      if (error) throw error;
      toast.success(language === 'ar' ? 'تم الحذف' : 'Deleted');
      fetchCategories();
    } catch (error: any) {
      toast.error(error.message || (language === 'ar' ? 'فشل الحذف — تأكد ألا توجد منتجات مرتبطة' : 'Delete failed — check linked products'));
    }
  }

  async function toggleActive(category: Category) {
    try {
      const { error } = await supabase
        .from('categories')
        .update({ is_active: !category.is_active })
        .eq('id', category.id);
      if (error) throw error;
      fetchCategories();
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {language === 'ar' ? 'التصنيفات' : 'Categories'}
          </h1>
          <p className="text-gray-500 mt-1">
            {language === 'ar' ? 'إدارة فئات المنتجات وترتيبها' : 'Manage and order your product categories'}
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" />
          {language === 'ar' ? 'فئة جديدة' : 'New Category'}
        </Button>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-gray-400">{language === 'ar' ? 'جارٍ التحميل...' : 'Loading...'}</div>
        ) : categories.length === 0 ? (
          <div className="p-10 text-center text-gray-400">
            <FolderOpen className="h-8 w-8 mx-auto mb-3" />
            {language === 'ar' ? 'لا توجد فئات بعد' : 'No categories yet'}
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th className="px-4 py-3 text-left rtl:text-right w-10"></th>
                <th className="px-4 py-3 text-left rtl:text-right">{language === 'ar' ? 'الفئة' : 'Category'}</th>
                <th className="px-4 py-3 text-left rtl:text-right">Slug</th>
                <th className="px-4 py-3 text-left rtl:text-right">{language === 'ar' ? 'الحالة' : 'Status'}</th>
                <th className="px-4 py-3 text-right rtl:text-left">{language === 'ar' ? 'إجراءات' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {categories.map((category) => (
                <tr key={category.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-300">
                    <GripVertical className="h-4 w-4" />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img loading="lazy" decoding="async"
                        src={category.image_url || 'https://placehold.co/40'}
                        className="w-10 h-10 rounded-md object-cover bg-gray-100"
                        alt=""
                      />
                      <div>
                        <p className="font-medium text-gray-900">{category.name}</p>
                        <p className="text-sm text-gray-500">{category.name_ar}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{category.slug}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleActive(category)}
                      className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                        category.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {category.is_active
                        ? (language === 'ar' ? 'مفعّلة' : 'Active')
                        : (language === 'ar' ? 'غير مفعّلة' : 'Inactive')}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-right rtl:text-left">
                    <div className="flex items-center justify-end rtl:justify-start gap-2">
                      <button onClick={() => openEdit(category)} className="p-2 hover:bg-gray-100 rounded-md text-gray-600">
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button onClick={() => handleDelete(category.id)} className="p-2 hover:bg-red-50 rounded-md text-red-600">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        size="lg"
        title={editingId ? (language === 'ar' ? 'تعديل الفئة' : 'Edit Category') : (language === 'ar' ? 'فئة جديدة' : 'New Category')}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label={language === 'ar' ? 'الاسم (إنجليزي)' : 'Name (English)'}
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <Input
              label={language === 'ar' ? 'الاسم (عربي)' : 'Name (Arabic)'}
              required
              value={form.name_ar}
              onChange={(e) => setForm({ ...form, name_ar: e.target.value })}
            />
          </div>
          <Input
            label="Slug"
            placeholder={slugify(form.name) || 'auto-generated'}
            value={form.slug}
            onChange={(e) => setForm({ ...form, slug: e.target.value })}
          />
          <ImageUploader
            bucket="category-images"
            label={language === 'ar' ? 'صورة الفئة' : 'Category Image'}
            multiple={false}
            value={form.image_url ? [form.image_url] : []}
            onChange={(urls) => setForm({ ...form, image_url: urls[0] || '' })}
          />
          <div className="grid grid-cols-2 gap-4">
            <Textarea
              label={language === 'ar' ? 'الوصف (إنجليزي)' : 'Description (English)'}
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
            <Textarea
              label={language === 'ar' ? 'الوصف (عربي)' : 'Description (Arabic)'}
              rows={3}
              value={form.description_ar}
              onChange={(e) => setForm({ ...form, description_ar: e.target.value })}
            />
          </div>
          <div className="flex items-center gap-3">
            <input
              id="is_active"
              type="checkbox"
              checked={form.is_active}
              onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
              className="h-4 w-4 rounded border-gray-300 text-gold focus:ring-gold"
            />
            <label htmlFor="is_active" className="text-sm text-gray-700">
              {language === 'ar' ? 'الفئة مفعّلة وتظهر في المتجر' : 'Category is active and visible in store'}
            </label>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              {language === 'ar' ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button type="submit" disabled={saving}>
              {saving
                ? (language === 'ar' ? 'جارٍ الحفظ...' : 'Saving...')
                : (language === 'ar' ? 'حفظ' : 'Save')}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
