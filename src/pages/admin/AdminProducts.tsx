import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useI18n } from '../../lib/i18n';
import { supabase } from '../../lib/supabase';
import { Product, Category } from '../../types';
import { formatPrice } from '../../lib/utils';
import { Button } from '../../components/ui/Button';
import toast from 'react-hot-toast';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Sparkles,
} from 'lucide-react';

export function AdminProducts() {
  const { language } = useI18n();
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  // ✅ دالة مساعدة لبناء رابط الصورة الصحيح من Supabase Storage
  const getImageUrl = (imagePath: string | undefined) => {
    if (!imagePath) return 'https://placehold.co/48?text=No+Image';
    
    // لو الرابط كامل بالفعل (يبدأ بـ http) ارجعه كما هو
    if (imagePath.startsWith('http')) return imagePath;
    
    // ✅ تم وضع رابط مشروعك الصحيح هنا
    const SUPABASE_URL = 'https://poemsrlqhbweazwzmvau.supabase.co'; 
    const BUCKET_NAME = 'product-images'; 
    
    // تنظيف المسار من أي slashes زائدة
    const cleanPath = imagePath.replace(/^\/+|\/+$/g, '');
    
    return `${SUPABASE_URL}/storage/v1/object/public/${BUCKET_NAME}/${cleanPath}`;
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*, categories(*)')
        .order('created_at', { ascending: false });

      if (!error) {
        setProducts(data || []);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    const { data } = await supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('name');
    setCategories(data || []);
  };

  const toggleProductStatus = async (product: Product) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ is_active: !product.is_active })
        .eq('id', product.id);

      if (error) throw error;

      toast.success(
        language === 'ar' ? 'تم التحديث بنجاح' : 'Status updated successfully'
      );
      fetchProducts();
    } catch (error) {
      toast.error(language === 'ar' ? 'حدث خطأ' : 'An error occurred');
    }
  };

  const toggleNewArrival = async (product: Product) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ is_new: !product.is_new })
        .eq('id', product.id);

      if (error) throw error;

      toast.success(
        language === 'ar' 
          ? (product.is_new ? 'تم الإزالة من وصل حديثاً' : 'تمت الإضافة إلى وصل حديثاً')
          : (product.is_new ? 'Removed from New Arrivals' : 'Added to New Arrivals')
      );
      fetchProducts();
    } catch (error) {
      toast.error(language === 'ar' ? 'حدث خطأ' : 'An error occurred');
    }
  };

  const deleteProduct = async (productId: string) => {
    if (!confirm(language === 'ar' ? 'هل أنت متأكد؟' : 'Are you sure?')) return;

    try {
      await supabase.from('products').delete().eq('id', productId);
      toast.success(language === 'ar' ? 'تم الحذف بنجاح' : 'Product deleted');
      fetchProducts();
    } catch (error) {
      toast.error(language === 'ar' ? 'حدث خطأ' : 'An error occurred');
    }
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.name_ar.includes(searchQuery) ||
      product.sku.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      !selectedCategory || product.category_id === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#B8956E]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">
          {language === 'ar' ? 'إدارة المنتجات' : 'Products Management'}
        </h1>
        <Link to="/admin/products/new">
          <Button>
            <Plus className="h-4 w-4 me-2" />
            {language === 'ar' ? 'إضافة منتج' : 'Add Product'}
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 rtl:left-auto rtl:right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={language === 'ar' ? 'بحث...' : 'Search products...'}
              className="w-full h-10 pl-10 pr-4 rtl:pr-10 rtl:pl-4 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#B8956E]"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="h-10 px-4 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#B8956E]"
          >
            <option value="">
              {language === 'ar' ? 'جميع الفئات' : 'All Categories'}
            </option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {language === 'ar' ? cat.name_ar : cat.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left rtl:text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {language === 'ar' ? 'المنتج' : 'Product'}
                </th>
                <th className="px-6 py-4 text-left rtl:text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {language === 'ar' ? 'الفئة' : 'Category'}
                </th>
                <th className="px-6 py-4 text-left rtl:text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {language === 'ar' ? 'السعر' : 'Price'}
                </th>
                <th className="px-6 py-4 text-left rtl:text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {language === 'ar' ? 'المخزون' : 'Stock'}
                </th>
                <th className="px-6 py-4 text-left rtl:text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {language === 'ar' ? 'وصل حديثاً' : 'New Arrival'}
                </th>
                <th className="px-6 py-4 text-left rtl:text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {language === 'ar' ? 'الحالة' : 'Status'}
                </th>
                <th className="px-6 py-4 text-right rtl:text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {language === 'ar' ? 'إجراءات' : 'Actions'}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredProducts.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      {/* ✅ تم استخدام الدالة الجديدة هنا لعرض الصور بشكل صحيح */}
                      <img 
                        src={getImageUrl(product.images?.[0])}
                        alt={product.name}
                        className="w-12 h-12 rounded-lg object-cover bg-gray-100"
                      />
                      <div>
                        <p className="font-medium text-gray-900">
                          {language === 'ar' ? product.name_ar : product.name}
                        </p>
                        <p className="text-sm text-gray-500">{product.sku}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-500">
                    {product.category &&
                      (language === 'ar'
                        ? product.category.name_ar
                        : product.category.name)}
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-gray-900">
                        {formatPrice(product.price)}
                      </p>
                      {product.compare_at_price && (
                        <p className="text-sm text-gray-400 line-through">
                          {formatPrice(product.compare_at_price)}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        product.stock_quantity > 10
                          ? 'bg-green-100 text-green-700'
                          : product.stock_quantity > 0
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {product.stock_quantity}
                    </span>
                  </td>
                  
                  <td className="px-6 py-4">
                    <button
                      onClick={() => toggleNewArrival(product)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                        product.is_new
                          ? 'bg-[#d48a9f]/20 text-[#d48a9f] border border-[#d48a9f]/30'
                          : 'bg-gray-100 text-gray-500 border border-gray-200 hover:bg-gray-200'
                      }`}
                    >
                      <Sparkles className={`w-3.5 h-3.5 ${product.is_new ? 'fill-current' : ''}`} />
                      {product.is_new
                        ? language === 'ar' ? 'نشط' : 'Active'
                        : language === 'ar' ? 'غير نشط' : 'Inactive'}
                    </button>
                  </td>

                  <td className="px-6 py-4">
                    <button
                      onClick={() => toggleProductStatus(product)}
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        product.is_active
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {product.is_active
                        ? language === 'ar'
                          ? 'نشط'
                          : 'Active'
                        : language === 'ar'
                        ? 'معطل'
                        : 'Inactive'}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-right rtl:text-left">
                    <div className="flex items-center justify-end rtl:justify-start gap-2">
                      <Link to={`/admin/products/${product.id}`}>
                        <Button variant="ghost" size="icon">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteProduct(product.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">
              {language === 'ar' ? 'لا توجد منتجات' : 'No products found'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}