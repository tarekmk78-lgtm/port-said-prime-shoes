// src/components/home/NewArrivalsSlider.tsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion'; // ✅ إضافة المكتبة
import { supabase } from '../../lib/supabase';
import { useI18n } from '../../lib/i18n';
import { ArrowRight, Star, Sparkles } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  name_ar: string;
  slug: string;
  price: number;
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
          .select('id, name, name_ar, slug, price, images')
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

  // ✅ إعدادات الأنيميشن
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1 } // ظهور متتابع لكل كارت
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" }
    }
  };

  return (
    <section className="py-16 bg-[#1a1a1a] relative overflow-hidden">
      {/* خلفية زخرفية خفيفة */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#d48a9f] rounded-full blur-[120px]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 relative z-10">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex items-center justify-between mb-10"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#d48a9f]/20 rounded-full">
              <Sparkles className="w-6 h-6 text-[#d48a9f]" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-white font-display">
              {language === 'ar' ? 'وصل حديثاً' : 'New Arrivals'}
            </h2>
          </div>
          
          <Link 
            to="/shop?filter=new" 
            className="hidden md:flex items-center gap-2 text-[#d48a9f] hover:text-white transition-colors font-medium"
          >
            {language === 'ar' ? 'عرض الكل' : 'View All'}
            <ArrowRight className={`w-4 h-4 ${language === 'ar' ? 'rotate-180' : ''}`} />
          </Link>
        </motion.div>

        {/* Slider Container with Animation */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {products.map((product) => (
            <motion.div key={product.id} variants={itemVariants}>
              <Link 
                to={`/product/${product.slug}`}
                className="group relative bg-[#222] rounded-xl overflow-hidden border border-white/5 hover:border-[#d48a9f]/30 transition-all duration-300 hover:-translate-y-1 block h-full"
              >
                {/* Image Area */}
                <div className="relative aspect-square overflow-hidden bg-[#2a2a2a]">
                  <img 
                    src={product.images?.[0]} 
                    alt={language === 'ar' ? product.name_ar : product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  
                  {/* NEW Badge */}
                  <div className="absolute top-3 left-3 bg-gradient-to-r from-[#d48a9f] to-[#c07a8e] text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg animate-pulse">
                    {language === 'ar' ? 'جديد' : 'NEW'}
                  </div>
                </div>

                {/* Info Area */}
                <div className="p-4">
                  <h3 className="text-white font-bold text-lg mb-2 truncate font-display">
                    {language === 'ar' ? product.name_ar : product.name}
                  </h3>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-[#d48a9f] font-bold text-xl">
                      {product.price.toLocaleString()} EGP
                    </span>
                    
                    <div className="flex text-yellow-500">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={14} fill="currentColor" />
                      ))}
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>

        {/* Mobile View All Button */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 text-center md:hidden"
        >
          <Link 
            to="/shop?filter=new"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#d48a9f] text-white rounded-full font-bold"
          >
            {language === 'ar' ? 'عرض كل المنتجات الجديدة' : 'View All New Products'}
          </Link>
        </motion.div>
      </div>
    </section>
  );
}