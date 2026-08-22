import React, { useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useI18n } from '../lib/i18n';
import { Product, Category } from '../types';
import { supabase } from '../lib/supabase';
import { ProductCard } from '../components/product/ProductCard';
import { ProductGridSkeleton } from '../components/ui/Skeleton';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { useSEO } from '../lib/seo';

const PRODUCTS_PER_PAGE = 12;

// قائمة الماركات لعرض الأسماء بشكل صحيح
const BRANDS = [
  { id: 'clarks', name: 'Clarks', name_ar: 'كلاركس' },
  { id: 'ecco', name: 'ECCO', name_ar: 'إيكو' },
  { id: 'timberland', name: 'Timberland', name_ar: 'تيمبرلاند' },
  { id: 'cat', name: 'CAT', name_ar: 'كاتربيلر' },
  { id: 'skechers', name: 'Skechers', name_ar: 'سكيتشرز' },
  { id: 'loropiana', name: 'Loro Piana', name_ar: 'لورو بيانا' },
  { id: 'calvinklein', name: 'Calvin Klein', name_ar: 'كالفين كلاين' },
  { id: 'hushpuppies', name: 'Hush Puppies', name_ar: 'هاتش بابس' },
];

export function ShopPage() {
  const { language } = useI18n();
  const [searchParams, setSearchParams] = useSearchParams();
  
  useSEO({
    title: language === 'ar' ? 'المتجر' : 'Shop',
    description: language === 'ar' ? 'تصفح كل أحذية بورسعيد برايم شوز' : "Browse Port Said Prime Shoes's full footwear collection",
    url: '/shop',
  });

  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [page, setPage] = useState(1);
  
  const categoryFilter = searchParams.get('category') || '';
  const brandFilter = searchParams.get('brand') || ''; // ✅ إضافة فلتر الماركة
  const filterType = searchParams.get('filter') || '';
  const sortBy = searchParams.get('sort') || 'newest';
  const priceMin = searchParams.get('priceMin') || '';
  const priceMax = searchParams.get('priceMax') || '';

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        let query = supabase
          .from('products')
          .select('*, categories()')
          .eq('is_active', true);

        // ✅ فلتر الماركة
        if (brandFilter) {
          query = query.eq('brand', brandFilter);
        }

        if (categoryFilter) {
          const { data: catData } = await supabase
            .from('categories')
            .select('id')
            .eq('slug', categoryFilter)
            .single();
          if (catData) {
            query = query.eq('category_id', catData.id);
          }
        }

        if (filterType === 'new') {
          query = query.eq('is_new', true);
        } else if (filterType === 'bestseller') {
          query = query.eq('is_bestseller', true);
        } else if (filterType === 'featured') {
          query = query.eq('is_featured', true);
        } else if (filterType === 'sale') {
          query = query.not('compare_at_price', 'is', null).gt('compare_at_price', 0);
        } else if (filterType) {
          query = query.or(`name.ilike.%${filterType}%,name_ar.ilike.%${filterType}%,description.ilike.%${filterType}%,description_ar.ilike.%${filterType}%`);
        }

        if (priceMin) query = query.gte('price', parseFloat(priceMin));
        if (priceMax) query = query.lte('price', parseFloat(priceMax));

        if (sortBy === 'newest') {
          query = query.order('created_at', { ascending: false });
        } else if (sortBy === 'price-asc') {
          query = query.order('price', { ascending: true });
        } else if (sortBy === 'price-desc') {
          query = query.order('price', { ascending: false });
        } else if (sortBy === 'popular') {
          query = query.order('rating', { ascending: false });
        }

        const { data: productsData, error } = await query;
        if (error) throw error;
        setProducts(productsData || []);

        const { data: categoriesData } = await supabase
          .from('categories')
          .select('*')
          .eq('is_active', true)
          .order('name');
        setCategories(categoriesData || []);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [categoryFilter, brandFilter, filterType, sortBy, priceMin, priceMax]); // ✅ إضافة brandFilter هنا

  const filteredProducts = useMemo(() => {
    if (!searchQuery) return products;
    const query = searchQuery.toLowerCase();
    return products.filter(
      (product) =>
        product.name.toLowerCase().includes(query) ||
        product.name_ar.includes(query) ||
        product.description.toLowerCase().includes(query) ||
        product.description_ar.includes(query)
    );
  }, [products, searchQuery]);

  const paginatedProducts = useMemo(() => {
    const start = (page - 1) * PRODUCTS_PER_PAGE;
    return filteredProducts.slice(start, start + PRODUCTS_PER_PAGE);
  }, [filteredProducts, page]);

  const totalPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      searchParams.set('search', searchQuery.trim());
    } else {
      searchParams.delete('search');
    }
    setSearchParams(searchParams);
  };

  const updateFilter = (key: string, value: string) => {
    if (value) {
      searchParams.set(key, value);
    } else {
      searchParams.delete(key);
    }
    setSearchParams(searchParams);
    setPage(1);
  };

  const clearFilters = () => {
    setSearchParams(new URLSearchParams());
    setSearchQuery('');
    setPage(1);
  };

  const hasActiveFilters = categoryFilter || brandFilter || filterType || priceMin || priceMax;

  // ✅ تحديث العنوان الفرعي ليشمل الماركة
  const getSubtitle = () => {
    if (brandFilter) {
      const brand = BRANDS.find(b => b.id === brandFilter);
      const brandName = language === 'ar' ? (brand?.name_ar || brandFilter) : (brand?.name || brandFilter);
      return language === 'ar' ? `جميع منتجات ماركة ${brandName}` : `All ${brandName} Products`;
    }
    if (filterType) {
      if (filterType === 'new') return language === 'ar' ? 'وصل حديثاً' : 'New Arrivals';
      if (filterType === 'bestseller') return language === 'ar' ? 'الأكثر مبيعاً' : 'Bestsellers';
      if (filterType === 'featured') return language === 'ar' ? 'مميزة' : 'Featured';
      if (filterType === 'sale') return language === 'ar' ? 'عروض وخصومات' : 'On Sale';
      return language === 'ar' ? `نتائج البحث عن: ${filterType}` : `Results for: ${filterType}`;
    }
    if (searchQuery) {
      return language === 'ar' ? `نتائج البحث عن: ${searchQuery}` : `Results for: ${searchQuery}`;
    }
    return language === 'ar' ? `استكشف ${products.length} منتج` : `Explore ${products.length} products`;
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* Page header banner */}
      <div className="bg-[#1c1917] py-14 md:py-20">
        <div className="max-w-7xl mx-auto px-4 md:px-6 text-center">
          <span className="text-[#d4a017] text-sm tracking-[0.2em] uppercase font-semibold">
            {language === 'ar' ? 'كل المجموعات' : 'Full collection'}
          </span>
          <h1 className="font-display text-3xl md:text-4xl font-semibold text-white mt-3">
            {brandFilter ? (BRANDS.find(b => b.id === brandFilter)?.name || 'Brand') : (language === 'ar' ? 'المتجر' : 'Shop')}
          </h1>
          <p className="text-white/55 mt-3">{getSubtitle()}</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-12">
        {/* Filters Bar */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <form onSubmit={handleSearch} className="flex-1">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 rtl:right-4 rtl:left-auto" />
              <input
                type="text"
                placeholder={language === 'ar' ? 'ابحث عن المنتجات...' : 'Search products...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-12 pl-12 pr-4 rounded-sm border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#B8956E] focus:border-transparent"
              />
            </div>
          </form>
          <div className="flex gap-2">
            <select
              value={sortBy}
              onChange={(e) => updateFilter('sort', e.target.value)}
              className="h-11 px-4 rounded-sm border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#B8956E]"
            >
              <option value="newest">{language === 'ar' ? 'الأحدث' : 'Newest'}</option>
              <option value="price-asc">{language === 'ar' ? 'السعر: من الأقل' : 'Price: Low to High'}</option>
              <option value="price-desc">{language === 'ar' ? 'السعر: من الأعلى' : 'Price: High to Low'}</option>
              <option value="popular">{language === 'ar' ? 'الأكثر شعبية' : 'Most Popular'}</option>
            </select>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`h-11 px-4 rounded-sm border flex items-center gap-2 transition-colors ${
                showFilters || hasActiveFilters
                  ? 'bg-[#B8956E] text-white border-[#B8956E]'
                  : 'bg-white border-gray-200 hover:border-[#B8956E]'
              }`}
            >
              <SlidersHorizontal className="h-4 w-4" />
              <span className="hidden md:inline">{language === 'ar' ? 'تصفية' : 'Filters'}</span>
            </button>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white rounded-sm border border-gray-200 p-6 mb-8"
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* Brand Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {language === 'ar' ? 'الماركة' : 'Brand'}
                </label>
                <select
                  value={brandFilter}
                  onChange={(e) => updateFilter('brand', e.target.value)}
                  className="w-full h-10 px-3 rounded border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#B8956E]"
                >
                  <option value="">{language === 'ar' ? 'جميع الماركات' : 'All Brands'}</option>
                  {BRANDS.map((b) => (
                    <option key={b.id} value={b.id}>
                      {language === 'ar' ? b.name_ar : b.name}
                    </option>
                  ))}
                </select>
              </div>
              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {language === 'ar' ? 'الفئة' : 'Category'}
                </label>
                <select
                  value={categoryFilter}
                  onChange={(e) => updateFilter('category', e.target.value)}
                  className="w-full h-10 px-3 rounded border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#B8956E]"
                >
                  <option value="">{language === 'ar' ? 'جميع الفئات' : 'All Categories'}</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.slug}>
                      {language === 'ar' ? cat.name_ar : cat.name}
                    </option>
                  ))}
                </select>
              </div>
              {/* Filter Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {language === 'ar' ? 'نوع المنتج' : 'Product Type'}
                </label>
                <select
                  value={filterType}
                  onChange={(e) => updateFilter('filter', e.target.value)}
                  className="w-full h-10 px-3 rounded border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#B8956E]"
                >
                  <option value="">{language === 'ar' ? 'الكل' : 'All'}</option>
                  <option value="new">{language === 'ar' ? 'وصل حديثاً' : 'New Arrivals'}</option>
                  <option value="bestseller">{language === 'ar' ? 'الأكثر مبيعاً' : 'Bestsellers'}</option>
                  <option value="featured">{language === 'ar' ? 'مميزة' : 'Featured'}</option>
                  <option value="sale">{language === 'ar' ? 'عروض' : 'On Sale'}</option>
                </select>
              </div>
              {/* Price Min/Max combined for space or keep separate */}
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">{language === 'ar' ? 'من' : 'From'}</label>
                  <input type="number" value={priceMin} onChange={(e) => updateFilter('priceMin', e.target.value)} placeholder="0" className="w-full h-10 px-3 rounded border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#B8956E]" />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">{language === 'ar' ? 'إلى' : 'To'}</label>
                  <input type="number" value={priceMax} onChange={(e) => updateFilter('priceMax', e.target.value)} placeholder="10000" className="w-full h-10 px-3 rounded border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#B8956E]" />
                </div>
              </div>
            </div>
            {hasActiveFilters && (
              <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-200">
                <button onClick={clearFilters} className="text-sm text-gray-500 hover:text-red-600 flex items-center gap-1">
                  <X className="h-4 w-4" />
                  {language === 'ar' ? 'مسح الفلاتر' : 'Clear Filters'}
                </button>
              </div>
            )}
          </motion.div>
        )}

        {/* Active Filters Tags */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2 mb-6">
            {brandFilter && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-[#B8956E]/10 text-[#B8956E] rounded-full text-sm">
                {BRANDS.find(b => b.id === brandFilter)?.name_ar || BRANDS.find(b => b.id === brandFilter)?.name || brandFilter}
                <button onClick={() => updateFilter('brand', '')}><X className="h-3 w-3" /></button>
              </span>
            )}
            {categoryFilter && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-[#B8956E]/10 text-[#B8956E] rounded-full text-sm">
                {language === 'ar' ? categories.find((c) => c.slug === categoryFilter)?.name_ar : categories.find((c) => c.slug === categoryFilter)?.name}
                <button onClick={() => updateFilter('category', '')}><X className="h-3 w-3" /></button>
              </span>
            )}
            {filterType && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-[#B8956E]/10 text-[#B8956E] rounded-full text-sm">
                {filterType === 'new' && (language === 'ar' ? 'وصل حديثاً' : 'New')}
                {filterType === 'bestseller' && (language === 'ar' ? 'الأكثر مبيعاً' : 'Bestsellers')}
                {filterType === 'featured' && (language === 'ar' ? 'مميزة' : 'Featured')}
                {filterType === 'sale' && (language === 'ar' ? 'عروض' : 'On Sale')}
                {!['new', 'bestseller', 'featured', 'sale'].includes(filterType) && filterType}
                <button onClick={() => updateFilter('filter', '')}><X className="h-3 w-3" /></button>
              </span>
            )}
          </div>
        )}

        {/* Products Grid */}
        {loading ? (
          <ProductGridSkeleton count={12} />
        ) : paginatedProducts.length > 0 ? (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {paginatedProducts.map((product, index) => (
                <ProductCard key={product.id} product={product} index={index} />
              ))}
            </div>
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-12">
                <button onClick={() => setPage(page - 1)} disabled={page === 1} className="px-4 py-2 rounded-sm border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                  {language === 'ar' ? 'السابق' : 'Previous'}
                </button>
                <div className="flex gap-1">
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) pageNum = i + 1;
                    else if (page <= 3) pageNum = i + 1;
                    else if (page >= totalPages - 2) pageNum = totalPages - 4 + i;
                    else pageNum = page - 2 + i;
                    return (
                      <button key={pageNum} onClick={() => setPage(pageNum)} className={`w-10 h-10 rounded-sm transition-colors ${page === pageNum ? 'bg-[#B8956E] text-white' : 'bg-white border border-gray-200 hover:bg-gray-50'}`}>
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                <button onClick={() => setPage(page + 1)} disabled={page === totalPages} className="px-4 py-2 rounded-sm border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                  {language === 'ar' ? 'التالي' : 'Next'}
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg font-display">
              {language === 'ar' ? 'لا توجد منتجات تطابق بحثك' : 'No products found matching your criteria'}
            </p>
            {hasActiveFilters && (
              <button onClick={clearFilters} className="mt-4 text-[#B8956E] hover:underline">
                {language === 'ar' ? 'مسح الفلاتر وعرض كل المنتجات' : 'Clear filters and view all products'}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}