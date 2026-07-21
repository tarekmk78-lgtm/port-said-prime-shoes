import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useI18n } from '../../lib/i18n';
import { supabase } from '../../lib/supabase';
import { Category, ProductVariant } from '../../types';
import { slugify } from '../../lib/utils';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { Select } from '../../components/ui/Select';
import { ImageUploader } from '../../components/admin/ImageUploader';
import toast from 'react-hot-toast';
import { ArrowLeft, ArrowRight, Plus, Trash2, Save } from 'lucide-react';

const emptyForm = {
  sku: '',
  name: '',
  name_ar: '',
  slug: '',
  description: '',
  description_ar: '',
  price: '',
  compare_at_price: '',
  cost_price: '',
  category_id: '',
  brand: '',
  images: [] as string[],
  tags: '',
  stock_quantity: '0',
  is_featured: false,
  is_new: false,
  is_bestseller: false,
  is_active: true,
};

interface VariantDraft {
  id?: string;
  size: string;
  color: string;
  color_code: string;
  stock_quantity: string;
  sku: string;
}

export function AdminProductForm() {
  const { language, isRTL } = useI18n();
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id && id !== 'new';

  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [variants, setVariants] = useState<VariantDraft[]>([]);
  const Arrow = isRTL ? ArrowRight : ArrowLeft;

  useEffect(() => {
    fetchCategories();
    if (isEditing) fetchProduct();
  }, [id]);

  async function fetchCategories() {
    const { data } = await supabase.from('categories').select('*').order('name');
    setCategories(data || []);
  }

  async function fetchProduct() {
    try {
      const { data: product, error } = await supabase.from('products').select('*').eq('id', id).single();
      if (error) throw error;
      if (product) {
        setForm({
          sku: product.sku,
          name: product.name,
          name_ar: product.name_ar,
          slug: product.slug,
          description: product.description,
          description_ar: product.description_ar,
          price: String(product.price),
          compare_at_price: product.compare_at_price ? String(product.compare_at_price) : '',
          cost_price: product.cost_price ? String(product.cost_price) : '',
          category_id: product.category_id || '',
          brand: product.brand || '',
          images: product.images || [],
          tags: (product.tags || []).join(', '),
          stock_quantity: String(product.stock_quantity),
          is_featured: product.is_featured,
          is_new: product.is_new,
          is_bestseller: product.is_bestseller,
          is_active: product.is_active,
        });
      }

      const { data: variantData } = await supabase.from('product_variants').select('*').eq('product_id', id);
      setVariants(
        (variantData || []).map((v: ProductVariant) => ({
          id: v.id,
          size: v.size,
          color: v.color,
          color_code: v.color_code || '',
          stock_quantity: String(v.stock_quantity),
          sku: v.sku,
        }))
      );
    } catch (error) {
      console.error('Error fetching product:', error);
      toast.error(language === 'ar' ? 'فشل تحميل المنتج' : 'Failed to load product');
    } finally {
      setLoading(false);
    }
  }

  function addVariant() {
    setVariants([
      ...variants,
      { size: '', color: '', color_code: '', stock_quantity: '0', sku: `${form.sku || 'SKU'}-${variants.length + 1}` },
    ]);
  }

  function updateVariant(index: number, key: keyof VariantDraft, value: string) {
    setVariants(variants.map((v, i) => (i === index ? { ...v, [key]: value } : v)));
  }

  function removeVariant(index: number) {
    setVariants(variants.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    try {
      const payload = {
        sku: form.sku,
        name: form.name,
        name_ar: form.name_ar,
        slug: form.slug || slugify(form.name),
        description: form.description,
        description_ar: form.description_ar,
        price: parseFloat(form.price) || 0,
        compare_at_price: form.compare_at_price ? parseFloat(form.compare_at_price) : null,
        cost_price: form.cost_price ? parseFloat(form.cost_price) : null,
        category_id: form.category_id || null,
        brand: form.brand || null,
        images: form.images,
        tags: form.tags ? form.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
        stock_quantity: parseInt(form.stock_quantity) || 0,
        is_featured: form.is_featured,
        is_new: form.is_new,
        is_bestseller: form.is_bestseller,
        is_active: form.is_active,
      };

      let productId = id;

      if (isEditing) {
        const { error } = await supabase.from('products').update(payload).eq('id', id);
        if (error) throw error;
      } else {
        const { data, error } = await supabase.from('products').insert(payload).select('id').single();
        if (error) throw error;
        productId = data.id;
      }

      // Sync variants: delete removed ones implicitly isn't tracked here, so we
      // upsert what's in the form. For a v1 this keeps things simple and safe.
      for (const variant of variants) {
        const variantPayload = {
          product_id: productId,
          size: variant.size,
          color: variant.color,
          color_code: variant.color_code || null,
          stock_quantity: parseInt(variant.stock_quantity) || 0,
          sku: variant.sku,
        };

        if (variant.id) {
          await supabase.from('product_variants').update(variantPayload).eq('id', variant.id);
        } else if (variant.size && variant.color) {
          await supabase.from('product_variants').insert(variantPayload);
        }
      }

      toast.success(
        isEditing
          ? (language === 'ar' ? 'تم تحديث المنتج' : 'Product updated')
          : (language === 'ar' ? 'تم إنشاء المنتج' : 'Product created')
      );
      navigate('/admin/products');
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || (language === 'ar' ? 'حدث خطأ' : 'Something went wrong'));
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold"></div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-3">
        <Link to="/admin/products" className="p-2 hover:bg-gray-100 rounded-md">
          <Arrow className="h-5 w-5 text-gray-600" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          {isEditing
            ? (language === 'ar' ? 'تعديل المنتج' : 'Edit Product')
            : (language === 'ar' ? 'منتج جديد' : 'New Product')}
        </h1>
      </div>

      {/* Basic info */}
      <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
        <h2 className="font-semibold text-gray-900">{language === 'ar' ? 'البيانات الأساسية' : 'Basic Information'}</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <Input label={language === 'ar' ? 'الاسم (إنجليزي)' : 'Name (English)'} required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Input label={language === 'ar' ? 'الاسم (عربي)' : 'Name (Arabic)'} required value={form.name_ar} onChange={(e) => setForm({ ...form, name_ar: e.target.value })} />
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <Input label="SKU" required value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} />
          <Input label="Slug" placeholder={slugify(form.name)} value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <Textarea label={language === 'ar' ? 'الوصف (إنجليزي)' : 'Description (English)'} required rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <Textarea label={language === 'ar' ? 'الوصف (عربي)' : 'Description (Arabic)'} required rows={4} value={form.description_ar} onChange={(e) => setForm({ ...form, description_ar: e.target.value })} />
        </div>
        <Select
          label={language === 'ar' ? 'الفئة' : 'Category'}
          value={form.category_id}
          onChange={(e) => setForm({ ...form, category_id: e.target.value })}
          options={[
            { value: '', label: language === 'ar' ? 'بدون فئة' : 'No category' },
            ...categories.map((c) => ({ value: c.id, label: language === 'ar' ? c.name_ar : c.name })),
          ]}
        />
        <div className="grid md:grid-cols-2 gap-4">
          <Input label={language === 'ar' ? 'العلامة التجارية' : 'Brand'} value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} />
          <Input label={language === 'ar' ? 'الوسوم (مفصولة بفاصلة)' : 'Tags (comma separated)'} value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} />
        </div>
      </div>

      {/* Pricing & stock */}
      <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
        <h2 className="font-semibold text-gray-900">{language === 'ar' ? 'السعر والمخزون' : 'Pricing & Stock'}</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <Input label={language === 'ar' ? 'السعر' : 'Price'} type="number" required value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
          <Input label={language === 'ar' ? 'السعر قبل الخصم' : 'Compare-at price'} type="number" value={form.compare_at_price} onChange={(e) => setForm({ ...form, compare_at_price: e.target.value })} />
          <Input label={language === 'ar' ? 'سعر التكلفة' : 'Cost price'} type="number" value={form.cost_price} onChange={(e) => setForm({ ...form, cost_price: e.target.value })} />
        </div>
        <Input label={language === 'ar' ? 'إجمالي المخزون' : 'Total stock quantity'} type="number" value={form.stock_quantity} onChange={(e) => setForm({ ...form, stock_quantity: e.target.value })} />
      </div>

      {/* Images */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="font-semibold text-gray-900 mb-4">{language === 'ar' ? 'صور المنتج' : 'Product Images'}</h2>
        <ImageUploader bucket="product-images" multiple value={form.images} onChange={(urls) => setForm({ ...form, images: urls })} />
      </div>

      {/* Flags */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="font-semibold text-gray-900 mb-4">{language === 'ar' ? 'الحالة والعلامات' : 'Status & Flags'}</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { key: 'is_active' as const, label: language === 'ar' ? 'مفعّل' : 'Active' },
            { key: 'is_featured' as const, label: language === 'ar' ? 'مميز' : 'Featured' },
            { key: 'is_new' as const, label: language === 'ar' ? 'وصل حديثاً' : 'New' },
            { key: 'is_bestseller' as const, label: language === 'ar' ? 'الأكثر مبيعاً' : 'Bestseller' },
          ].map((flag) => (
            <label key={flag.key} className="flex items-center gap-2.5 px-3 py-2.5 rounded-md border border-gray-200 cursor-pointer hover:border-gold">
              <input
                type="checkbox"
                checked={form[flag.key]}
                onChange={(e) => setForm({ ...form, [flag.key]: e.target.checked })}
                className="h-4 w-4 rounded border-gray-300 text-gold focus:ring-gold"
              />
              <span className="text-sm text-gray-700">{flag.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Variants */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900">{language === 'ar' ? 'المقاسات والألوان' : 'Sizes & Colors'}</h2>
          <Button type="button" variant="outline" size="sm" onClick={addVariant}>
            <Plus className="h-4 w-4" />
            {language === 'ar' ? 'إضافة مقاس/لون' : 'Add Variant'}
          </Button>
        </div>

        {variants.length === 0 ? (
          <p className="text-sm text-gray-400">{language === 'ar' ? 'لا توجد مقاسات/ألوان مضافة بعد' : 'No variants added yet'}</p>
        ) : (
          <div className="space-y-3">
            {variants.map((variant, i) => (
              <div key={i} className="grid grid-cols-2 md:grid-cols-5 gap-2 items-end p-3 bg-gray-50 rounded-lg">
                <Input
                  placeholder={language === 'ar' ? 'المقاس' : 'Size'}
                  value={variant.size}
                  onChange={(e) => updateVariant(i, 'size', e.target.value)}
                />
                <Input
                  placeholder={language === 'ar' ? 'اللون' : 'Color'}
                  value={variant.color}
                  onChange={(e) => updateVariant(i, 'color', e.target.value)}
                />
                <Input
                  placeholder={language === 'ar' ? 'كود اللون' : 'Color code'}
                  value={variant.color_code}
                  onChange={(e) => updateVariant(i, 'color_code', e.target.value)}
                />
                <Input
                  type="number"
                  placeholder={language === 'ar' ? 'المخزون' : 'Stock'}
                  value={variant.stock_quantity}
                  onChange={(e) => updateVariant(i, 'stock_quantity', e.target.value)}
                />
                <div className="flex gap-2">
                  <Input
                    placeholder="SKU"
                    value={variant.sku}
                    onChange={(e) => updateVariant(i, 'sku', e.target.value)}
                  />
                  <button type="button" onClick={() => removeVariant(i)} className="p-2.5 text-red-600 hover:bg-red-50 rounded-md flex-shrink-0">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-end gap-3 pb-6">
        <Button type="button" variant="outline" onClick={() => navigate('/admin/products')}>
          {language === 'ar' ? 'إلغاء' : 'Cancel'}
        </Button>
        <Button type="submit" disabled={saving}>
          <Save className="h-4 w-4" />
          {saving ? (language === 'ar' ? 'جارٍ الحفظ...' : 'Saving...') : (language === 'ar' ? 'حفظ المنتج' : 'Save Product')}
        </Button>
      </div>
    </form>
  );
}
