// src/components/home/NewArrivalsSlider.tsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion'; 
import { supabase } from '../../lib/supabase';
import { useI18n } from '../../lib/i18n';
import { ArrowRight, Star, Sparkles, ShoppingBag } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  name_ar: string;
  slug: string;
  price: number;
  old_price?: number;
  images: string[];
}

export function NewArrivalsSlider() {
  const { language } = useI18n();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchNewArrivals() {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('id, name, name_ar, slug, price, old_price, images')
          .eq('is_new', true)
          .eq('is_active', true)
          .order('created_at', { ascending: false })
          .limit(8);

        if (!error && data) setProducts(data);
      } catch (err) {
        console.error('Error fetching new arrivals:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchNewArrivals();
  }, []);

  if (loading || products.length === 0) return null;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1 } 
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } 
    }
  };

  return (
    <section className="py-16 md:py-24 bg-gray-50 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 md:px-6 relative z-10">
        
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-black rounded-full">
              <Sparkles className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 font-display">
                {language === 'ar' ? 'وصل حديثاً' : 'New Arrivals'}
              </h2>
              <p className="text-gray-500 mt-1 text-sm md:text-base">
                {language === 'ar' ? 'أحدث الماركات العالمية بين يديك' : 'The latest global brands at your fingertips'}
              </p>
            </div>
          </div>
          
          <Link 
            to="/shop?filter=new" 
            className="group inline-flex items-center gap-2 text-gray-900 font-semibold hover:text-amber-600 transition-colors"
          >
            {language === 'ar' ? 'عرض الكل' : 'View All'}
            <ArrowRight className={`w-4 h-4 transition-transform group-hover:translate-x-1 ${language === 'ar' ? 'rtl:-translate-x-1 rtl:group-hover:translate-x-0' : ''}`} />
          </Link>
        </motion.div>

        {/* Products Grid */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8"
        >
          {products.map((product) => {
            const productName = language === 'ar' ? product.name_ar : product.name;
            const imageUrl = product.images?.[0] || 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600';

            return (
              <motion.div key={product.id} variants={itemVariants}>
                <Link 
                  to={`/product/${product.slug}`}
                  className="group relative bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-xl hover:border-gray-200 transition-all duration-500 block h-full"
                >
                  {/* Image Area */}
                  <div className="relative aspect-[4/5] overflow-hidden bg-gray-100">
                    <img 
                      src={imageUrl} 
                      alt={productName}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                      loading="lazy"
                    />
                    
                    {/* NEW Badge */}
                    <div className="absolute top-4 right-4 bg-black text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full shadow-md">
                      {language === 'ar' ? 'جديد' : 'NEW'}
                    </div>

                    {/* Quick Action Button (Appears on Hover) */}
                    <div className="absolute bottom-4 left-4 right-4 translate-y-12 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                      <button className="w-full bg-white/90 backdrop-blur-sm text-black font-semibold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-black hover:text-white transition-colors shadow-lg">
                        <ShoppingBag className="w-4 h-4" />
                        {language === 'ar' ? 'أضف للسلة' : 'Add to Cart'}
                      </button>
                    </div>
                  </div>

                  {/* Info Area */}
                  <div className="p-5">
                    <h3 className="text-gray-900 font-semibold text-base mb-2 line-clamp-1 group-hover:text-amber-600 transition-colors">
                      {productName}
                    </h3>
                    
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex flex-col">
                        {product.old_price && product.old_price > product.price && (
                          <span className="text-xs text-gray-400 line-through mb-0.5">
                            {product.old_price.toLocaleString()} EGP
                          </span>
                        )}
                        <span className="text-lg font-bold text-gray-900">
                          {product.price.toLocaleString()} <span className="text-xs font-normal text-gray-500">EGP</span>
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-md">
                        <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                        <span className="text-xs font-semibold text-gray-700">4.8</span>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Mobile View All Button */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-10 text-center md:hidden"
        >
          <Link 
            to="/shop?filter=new"
            className="inline-flex items-center justify-center gap-2 w-full px-6 py-4 bg-black text-white rounded-xl font-bold hover:bg-gray-800 transition-colors"
          >
            {language === 'ar' ? 'عرض كل المنتجات الجديدة' : 'View All New Products'}
            <ArrowRight className={`w-4 h-4 ${language === 'ar' ? 'rotate-180' : ''}`} />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}