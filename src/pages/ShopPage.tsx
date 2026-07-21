import React, { useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useI18n } from '../lib/i18n';
import { Product, Category } from '../types';
import { supabase } from '../lib/supabase';
import { ProductCard } from '../components/product/ProductCard';
import { ProductGridSkeleton } from '../components/ui/Skeleton';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Search, SlidersHorizontal, X, ChevronDown } from 'lucide-react';
import { useSEO } from '../lib/seo';

const PRODUCTS_PER_PAGE = 12;

export function ShopPage() {
  const { language } = useI18n();
  const [searchParams, setSearchParams] = useSearchParams();
  
  useSEO({
    title: language === 'ar' ? 'المتجر' : 'Shop',
    description:
      language === 'ar'
        ? 'تصفح كل أحذية بورسعيد برايم شوز — رجالي،وأحدث المجموعات'
        : "Browse Port Said Prime Shoes's full footwear collection — men's, women's, sport, and the latest arrivals",
    url: '/shop',
  });

  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [page, setPage] = useState(1);
  
  const categoryFilter = searchParams.get('category') || '';
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

        // ✅ معالجة الفلتر - سواء predefined أو نص (زي صيف، شتاء)
        if (filterType === 'new') {
          query = query.eq('is_new', true);
        } else if (filterType === 'bestseller') {
          query = query.eq('is_bestseller', true);
        } else if (filterType === 'featured') {
          query = query.eq('is_featured', true);
        } else if (filterType === 'sale') {
          query = query.not('compare_at_price', 'is', null).gt('compare_at_price', 0);
        } else if (filterType) {
          // ✅ لو الفلتر نص (زي "صيف"، "شتاء") - ابحث في الاسم والوصف
          query = query.or(`name.ilike.%${filterType}%,name_ar.ilike.%${filterType}%,description.ilike.%${filterType}%,description_ar.ilike.%${filterType}%`);
        }

        if (priceMin) {
          query = query.gte('price', parseFloat(priceMin));
        }
        if (priceMax) {
          query = query.lte('price', parseFloat(priceMax));
        }

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
  }, [categoryFilter, filterType, sortBy, priceMin, priceMax]);

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

  const hasActiveFilters = categoryFilter || filterType || priceMin || priceMax;

  // ✅ تحديد العنوان الفرعي حسب الفلتر
  const getSubtitle = () => {
    if (filterType) {
      if (filterType === 'new') {
        return language === 'ar' ? 'وصل حديثاً' : 'New Arrivals';
      }
      if (filterType === 'bestseller') {
        return language === 'ar' ? 'الأكثر مبيعاً' : 'Bestsellers';
      }
      if (filterType === 'featured') {
        return language === 'ar' ? 'مميزة' : 'Featured';
      }
      if (filterType === 'sale') {
        return language === 'ar' ? 'عروض وخصومات' : 'On Sale';
      }
      // لو نص (زي صيف، شتاء)
      return language === 'ar' 
        ? `نتائج البحث عن: ${filterType}`
        : `Results for: ${filterType}`;
    }
    if (searchQuery) {
      return language === 'ar'
        ? `نتائج البحث عن: ${searchQuery}`
        : `Results for: ${searchQuery}`;
    }
    return language === 'ar'
      ? `استكشف ${products.length} منتج`
      : `Explore ${products.length} products`;
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* Page header banner */}
      <div className="bg-ink py-14 md:py-20">
        <div className="max-w-7xl mx-auto px-4 md:px-6 text-center">
          <span className="eyebrow justify-center text-gold-light">
            {language === 'ar' ? 'كل المجموعات' : 'Full collection'}
          </span>
          <h1 className="font-display text-3xl md:text-4xl font-semibold text-white mt-3">
            {language === 'ar' ? 'المتجر' : 'Shop'}
          </h1>
          {/* ✅ العنوان الديناميكي */}
          <p className="text-white/55 mt-3">
            {getSubtitle()}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-12">
        {/* Filters Bar */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          {/* Search */}
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
          {/* Sort & Filter Buttons */}
          <div className="flex gap-2">
            <Select
              value={sortBy}
              onChange={(e) => updateFilter('sort', e.target.value)}
              options={[
                { value: 'newest', label: language === 'ar' ? 'الأحدث' : 'Newest' },
                { value: 'price-asc', label: language === 'ar' ? 'السعر: من الأقل' : 'Price: Low to High' },
                { value: 'price-desc', label: language === 'ar' ? 'السعر: من الأعلى' : 'Price: High to Low' },
                { value: 'popular', label: language === 'ar' ? 'الأكثر شعبية' : 'Most Popular' },
              ]}
            />
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`h-11 px-4 rounded-sm border flex items-center gap-2 transition-colors ${
                showFilters || hasActiveFilters
                  ? 'bg-[#B8956E] text-white border-[#B8956E]'
                  : 'bg-white border-gray-200 hover:border-[#B8956E]'
              }`}
            >
              <SlidersHorizontal className="h-4 w-4" />
              <span className="hidden md:inline">
                {language === 'ar' ? 'تصفية' : 'Filters'}
              </span>
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
              {/* Price Min */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {language === 'ar' ? 'السعر من' : 'Price From'}
                </label>
                <input
                  type="number"
                  value={priceMin}
                  onChange={(e) => updateFilter('priceMin', e.target.value)}
                  placeholder="0"
                  className="w-full h-10 px-3 rounded border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#B8956E]"
                />
              </div>
              {/* Price Max */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {language === 'ar' ? 'السعر إلى' : 'Price To'}
                </label>
                <input
                  type="number"
                  value={priceMax}
                  onChange={(e) => updateFilter('priceMax', e.target.value)}
                  placeholder="10000"
                  className="w-full h-10 px-3 rounded border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#B8956E]"
                />
              </div>
            </div>
            {hasActiveFilters && (
              <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-200">
                <button
                  onClick={clearFilters}
                  className="text-sm text-gray-500 hover:text-red-600 flex items-center gap-1"
                >
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
            {categoryFilter && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-[#B8956E]/10 text-[#B8956E] rounded-full text-sm">
                {language === 'ar'
                  ? categories.find((c) => c.slug === categoryFilter)?.name_ar
                  : categories.find((c) => c.slug === categoryFilter)?.name}
                <button onClick={() => updateFilter('category', '')}>
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {filterType && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-[#B8956E]/10 text-[#B8956E] rounded-full text-sm">
                {filterType === 'new' && (language === 'ar' ? 'وصل حديثاً' : 'New')}
                {filterType === 'bestseller' && (language === 'ar' ? 'الأكثر مبيعاً' : 'Bestsellers')}
                {filterType === 'featured' && (language === 'ar' ? 'مميزة' : 'Featured')}
                {filterType === 'sale' && (language === 'ar' ? 'عروض' : 'On Sale')}
                {/* لو نص */}
                {!['new', 'bestseller', 'featured', 'sale'].includes(filterType) && filterType}
                <button onClick={() => updateFilter('filter', '')}>
                  <X className="h-3 w-3" />
                </button>
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
                <button
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                  className="px-4 py-2 rounded-sm border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {language === 'ar' ? 'السابق' : 'Previous'}
                </button>
                <div className="flex gap-1">
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (page <= 3) {
                      pageNum = i + 1;
                    } else if (page >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = page - 2 + i;
                    }
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setPage(pageNum)}
                        className={`w-10 h-10 rounded-sm transition-colors ${
                          page === pageNum
                            ? 'bg-[#B8956E] text-white'
                            : 'bg-white border border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                <button
                  onClick={() => setPage(page + 1)}
                  disabled={page === totalPages}
                  className="px-4 py-2 rounded-sm border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {language === 'ar' ? 'التالي' : 'Next'}
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg font-display">
              {language === 'ar' ? 'لا توجد منتجات' : 'No products found'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}