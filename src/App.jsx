import { Menu, Search, Heart, ShoppingBag, ArrowLeft, CheckCircle, Truck, ShieldCheck, Headphones, Phone, Mail, MapPin } from 'lucide-react';

function App() {
  const categories = [
    { name: 'رسمي', desc: 'أحذية رسمية كلاسيكية', img: 'https://images.unsplash.com/photo-1614252369475-531eba835eb1?w=1200&q=80', large: true },
    { name: 'كاجوال', desc: 'أحذية يومية مريحة', img: 'https://images.unsplash.com/photo-1549298916-b23d1d5995a6?w=600&q=80' },
    { name: 'سنيكرز', desc: 'تصميم عصري رياضي', img: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=600&q=80' },
    { name: 'بوت', desc: 'للشتاء والمغامرات', img: 'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=600&q=80' },
    { name: 'لوفر', desc: 'أناقة بدون أربطة', img: 'https://images.unsplash.com/photo-1533867617858-e7b97e060509?w=600&q=80' },
    { name: 'صندل', desc: 'راحة الصيف', img: 'https://images.unsplash.com/photo-1603487742131-4160ec999306?w=600&q=80' },
  ];

  const products = [
    { name: 'حذاء كلاسيك أسود', price: '850', oldPrice: null, img: 'https://images.unsplash.com/photo-1614252369475-531eba835eb1?w=400&q=80', badge: 'جديد' },
    { name: 'حذاء كاجوال بني', price: '750', oldPrice: null, img: 'https://images.unsplash.com/photo-1549298916-b23d1d5995a6?w=400&q=80' },
    { name: 'سنيكرز رياضي', price: '650', oldPrice: '950', img: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=400&q=80', badge: '-30%' },
    { name: 'بوت شتوي', price: '1,200', oldPrice: null, img: 'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=400&q=80' },
  ];

  return (
    <div className="min-h-screen bg-[#fafaf9] text-[#1c1917]" dir="rtl">
      
      {/* الشريط العلوي */}
      <div className="bg-[#1c1917] text-white text-xs py-3 text-center overflow-hidden">
        <div className="animate-marquee whitespace-nowrap inline-block">
          🚚 شحن مجاني للطلبات فوق 500 جنيه • ✅ ضمان استرجاع 30 يوم • 👟 جلد طبيعي 100% • 💎 نعل رابر مريح • صناعة فيتنامي • 
          🚚 شحن مجاني للطلبات فوق 500 جنيه • ✅ ضمان استرجاع 30 يوم • 👟 جلد طبيعي 100% • 💎 نعل رابر مريح • صناعة فيتنامي •
        </div>
      </div>

      {/* الهيدر */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md shadow-sm">
        <nav className="container mx-auto px-4 lg:px-8 h-20 flex items-center justify-between">
          <button className="lg:hidden p-2 hover:bg-gray-100 rounded-lg">
            <Menu className="w-6 h-6" />
          </button>
          
          <div className="text-right">
            <h1 className="font-serif text-2xl lg:text-3xl font-bold text-[#1c1917] tracking-tight">PORT SAID</h1>
            <p className="text-xs text-[#d4a017] font-semibold tracking-wider">PRIME SHOES</p>
          </div>

          <div className="hidden lg:flex items-center gap-8">
            {['الرئيسية', 'المتجر', 'الفئات', 'وصل حديثاً', 'العروض'].map((item) => (
              <a key={item} href="#" className="text-sm font-medium text-[#44403c] hover:text-[#d4a017] transition-colors relative group">
                {item}
                <span className="absolute -bottom-1 right-0 w-0 h-0.5 bg-[#d4a017] transition-all group-hover:w-full"></span>
              </a>
            ))}
          </div>

          <div className="flex items-center gap-2 lg:gap-4">
            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <Search className="w-5 h-5 text-[#44403c]" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <Heart className="w-5 h-5 text-[#44403c]" />
            </button>
            <button className="relative p-2 hover:bg-gray-100 rounded-full transition-colors">
              <ShoppingBag className="w-5 h-5 text-[#44403c]" />
              <span className="absolute -top-1 -right-1 bg-[#d4a017] text-white text-[10px] rounded-full flex items-center justify-center w-5 h-5 font-bold">
                1
              </span>
            </button>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="relative min-h-[600px] lg:min-h-[700px] flex items-center overflow-hidden bg-gradient-to-br from-[#fafaf9] via-white to-[#fef9f0]">
        <div className="container mx-auto px-4 lg:px-8 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            
            <div className="space-y-8">
              <div className="flex items-center gap-3">
                <div className="w-16 h-[2px] bg-[#d4a017]"></div>
                <p className="text-sm tracking-[0.2em] text-[#78716c] uppercase font-semibold">
                  هدفنا · هو ثقتكم
                </p>
              </div>
              
              <h1 className="font-serif text-5xl md:text-7xl font-bold leading-[0.95] text-[#1c1917]">
                أحذية
                <br />
                <span className="italic font-light text-[#d4a017]">فاخرة</span>
              </h1>
              
              <p className="text-lg text-[#57534e] max-w-lg leading-relaxed">
                اكتشف تشكيلتنا الفاخرة من الأحذية المصنوعة يدوياً من أجود أنواع الجلد الطبيعي. راحة وأناقة لا تُضاهى.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <button className="group px-10 py-5 bg-[#1c1917] text-white font-semibold rounded-lg hover:bg-[#d4a017] transition-all duration-300 shadow-lg flex items-center justify-center gap-2">
                  <span>تسوق الآن</span>
                  <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                </button>
                
                <button className="px-10 py-5 border-2 border-[#1c1917] text-[#1c1917] font-semibold rounded-lg hover:bg-[#1c1917] hover:text-white transition-all duration-300">
                  استكشف المجموعة
                </button>
              </div>

              <div className="flex flex-wrap gap-6 pt-8 border-t border-[#e7e5e4]">
                <div className="flex items-center gap-2 text-sm text-[#57534e]">
                  <CheckCircle className="w-5 h-5 text-[#d4a017]" />
                  <span>جلد طبيعي 100%</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-[#57534e]">
                  <CheckCircle className="w-5 h-5 text-[#d4a017]" />
                  <span>صناعة فيتنامي</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-[#57534e]">
                  <CheckCircle className="w-5 h-5 text-[#d4a017]" />
                  <span>نعل رابر مريح</span>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="relative aspect-[4/5] overflow-hidden rounded-2xl shadow-2xl">
                <img 
                  src="https://images.unsplash.com/photo-1614252369475-531eba835eb1?w=1000&q=80" 
                  alt="Premium Shoe"
                  className="w-full h-full object-cover img-zoom"
                />
                <div className="absolute -bottom-8 -left-8 bg-white p-6 rounded-xl shadow-2xl hidden md:block">
                  <p className="text-xs text-[#78716c] mb-1 font-semibold">تبدأ من</p>
                  <p className="font-serif text-4xl font-bold text-[#1c1917]">850 ج.م</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Marquee */}
      <div className="bg-[#1c1917] text-white py-8 overflow-hidden">
        <div className="flex animate-marquee whitespace-nowrap">
          <span className="text-4xl font-serif mx-8">جلد طبيعي</span>
          <span className="text-4xl font-serif mx-8 text-[#d4a017]">•</span>
          <span className="text-4xl font-serif mx-8">صناعة فيتنامي</span>
          <span className="text-4xl font-serif mx-8 text-[#d4a017]">•</span>
          <span className="text-4xl font-serif mx-8">راحة طوال اليوم</span>
          <span className="text-4xl font-serif mx-8 text-[#d4a017]">•</span>
          <span className="text-4xl font-serif mx-8">تصميم عصري</span>
          <span className="text-4xl font-serif mx-8 text-[#d4a017]">•</span>
          <span className="text-4xl font-serif mx-8">جلد طبيعي</span>
          <span className="text-4xl font-serif mx-8 text-[#d4a017]">•</span>
          <span className="text-4xl font-serif mx-8">صناعة فيتنامي</span>
          <span className="text-4xl font-serif mx-8 text-[#d4a017]">•</span>
        </div>
      </div>

      {/* Categories */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex items-end justify-between mb-16">
            <div>
              <p className="text-sm tracking-[0.3em] text-[#78716c] uppercase mb-4 font-semibold">التصنيفات</p>
              <h2 className="font-serif text-5xl font-bold text-[#1c1917]">الفئات</h2>
            </div>
            <a href="#" className="hidden md:flex items-center gap-2 text-sm font-semibold text-[#44403c] hover:text-[#d4a017] transition-colors border-b-2 border-[#1c1917] hover:border-[#d4a017] pb-1">
              عرض الكل
              <ArrowLeft className="w-4 h-4" />
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {categories.map((cat, idx) => (
              <div key={idx} className={`group cursor-pointer ${cat.large ? 'lg:col-span-2 lg:row-span-2' : ''}`}>
                <div className={`relative overflow-hidden rounded-2xl ${cat.large ? 'aspect-square' : 'aspect-[4/3]'}`}>
                  <img src={cat.img} className="w-full h-full object-cover img-zoom" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
                  <div className="absolute bottom-0 right-0 p-8 text-white">
                    <h3 className="font-serif text-3xl font-bold mb-2">{cat.name}</h3>
                    <p className="text-sm text-white/80 mb-4">{cat.desc}</p>
                    <span className="inline-flex items-center gap-2 text-sm font-semibold border-b-2 border-[#d4a017] pb-1">
                      استكشف الآن
                      <ArrowLeft className="w-4 h-4" />
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Products */}
      <section className="py-24 bg-[#fafaf9]">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-sm tracking-[0.3em] text-[#78716c] uppercase mb-4 font-semibold">الأحدث</p>
            <h2 className="font-serif text-5xl font-bold text-[#1c1917] mb-4">وصل حديثاً</h2>
            <p className="text-[#57534e] max-w-2xl mx-auto">اكتشف أحدث تشكيلاتنا من الأحذية الفاخرة</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {products.map((product, idx) => (
              <div key={idx} className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
                <div className="relative aspect-[3/4] overflow-hidden bg-[#f5f5f4]">
                  <img src={product.img} className="w-full h-full object-cover img-zoom" />
                  {product.badge && (
                    <span className={`absolute top-4 right-4 text-white text-xs px-3 py-1 rounded-full font-semibold ${product.badge.includes('%') ? 'bg-red-500' : 'bg-[#d4a017]'}`}>
                      {product.badge}
                    </span>
                  )}
                  <button className="absolute top-4 left-4 p-2 bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-[#d4a017] hover:text-white">
                    <Heart className="w-4 h-4" />
                  </button>
                </div>
                <div className="p-5">
                  <h3 className="font-semibold text-[#1c1917] mb-2 text-lg">{product.name}</h3>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xl font-bold text-[#d4a017]">{product.price} ج.م</span>
                      {product.oldPrice && (
                        <span className="text-sm text-[#a8a29e] line-through mr-2">{product.oldPrice} ج.م</span>
                      )}
                    </div>
                    <button className="p-2 bg-[#f5f5f4] rounded-full hover:bg-[#d4a017] hover:text-white transition-colors">
                      <ShoppingBag className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <button className="px-10 py-4 bg-[#1c1917] text-white font-semibold rounded-lg hover:bg-[#d4a017] transition-colors shadow-lg">
              عرض جميع المنتجات
            </button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 bg-white border-t border-[#e7e5e4]">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center group">
              <div className="w-20 h-20 mx-auto mb-6 flex items-center justify-center bg-[#fef3d6] rounded-full group-hover:bg-[#d4a017] transition-colors duration-300">
                <Truck className="w-10 h-10 text-[#d4a017] group-hover:text-white transition-colors" />
              </div>
              <h3 className="font-serif text-2xl font-bold mb-3 text-[#1c1917]">شحن لجميع محافظات مصر </h3>
              <p className="text-[#57534e]">للطلبات فوق 500 جنيه</p>
            </div>

            <div className="text-center group">
              <div className="w-20 h-20 mx-auto mb-6 flex items-center justify-center bg-[#fef3d6] rounded-full group-hover:bg-[#d4a017] transition-colors duration-300">
                <ShieldCheck className="w-10 h-10 text-[#d4a017] group-hover:text-white transition-colors" />
              </div>
              <h3 className="font-serif text-2xl font-bold mb-3 text-[#1c1917]">ضمان الجودة</h3>
              <p className="text-[#57534e]">استرجاع خلال 30 يوم</p>
            </div>

            <div className="text-center group">
              <div className="w-20 h-20 mx-auto mb-6 flex items-center justify-center bg-[#fef3d6] rounded-full group-hover:bg-[#d4a017] transition-colors duration-300">
                <Headphones className="w-10 h-10 text-[#d4a017] group-hover:text-white transition-colors" />
              </div>
              <h3 className="font-serif text-2xl font-bold mb-3 text-[#1c1917]">دعم متميز</h3>
              <p className="text-[#57534e]">خدمة عملاء 24/7</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#1c1917] text-white">
        <div className="bg-[#d4a017] py-16">
          <div className="container mx-auto px-4 lg:px-8 text-center">
            <h3 className="font-serif text-3xl md:text-4xl font-bold mb-4">اشترك في نشرتنا البريدية</h3>
            <p className="text-white/90 mb-8 text-lg">واحصل على خصم 10% على أول طلب</p>
            <div className="max-w-md mx-auto flex gap-2">
              <input type="email" placeholder="اكتب إيميلك" className="flex-1 px-6 py-4 rounded-lg text-[#1c1917] focus:outline-none focus:ring-2 focus:ring-[#1c1917]" />
              <button className="px-8 py-4 bg-[#1c1917] text-white rounded-lg hover:bg-[#292524] transition-colors font-semibold">
                اشترك
              </button>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            <div>
              <h4 className="font-serif text-2xl font-bold mb-4">PORT SAID</h4>
              <p className="text-white/70 text-sm leading-relaxed mb-6">
                أحذية فاخرة مصنوعة يدوياً من الجلد الطبيعي. جودة عالمية بأسعار مناسبة.
              </p>
              <div className="flex gap-4">
                <a href="#" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-[#d4a017] transition-colors text-sm font-bold">
                  f
                </a>
                <a href="#" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-[#d4a017] transition-colors text-sm font-bold">
                  in
                </a>
                <a href="#" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-[#d4a017] transition-colors text-sm font-bold">
                  X
                </a>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-lg mb-6">روابط سريعة</h4>
              <ul className="space-y-3 text-sm text-white/70">
                <li><a href="#" className="hover:text-[#d4a017] transition-colors">المتجر</a></li>
                <li><a href="#" className="hover:text-[#d4a017] transition-colors">الفئات</a></li>
                <li><a href="#" className="hover:text-[#d4a017] transition-colors">العروض</a></li>
                <li><a href="#" className="hover:text-[#d4a017] transition-colors">من نحن</a></li>
                <li><a href="#" className="hover:text-[#d4a017] transition-colors">تواصل معنا</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-lg mb-6">خدمة العملاء</h4>
              <ul className="space-y-3 text-sm text-white/70">
                <li><a href="#" className="hover:text-[#d4a017] transition-colors">الشحن والتوصيل</a></li>
                <li><a href="#" className="hover:text-[#d4a017] transition-colors">الاسترجاع والاستبدال</a></li>
                <li><a href="#" className="hover:text-[#d4a017] transition-colors">الأسئلة الشائعة</a></li>
                <li><a href="#" className="hover:text-[#d4a017] transition-colors">سياسة الخصوصية</a></li>
                <li><a href="#" className="hover:text-[#d4a017] transition-colors">الشروط والأحكام</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-lg mb-6">تواصل معنا</h4>
              <ul className="space-y-3 text-sm text-white/70">
                <li className="flex items-start gap-2">
                  <MapPin className="w-5 h-5 text-[#d4a017] mt-0.5" />
                  <span>بورسعيد، مصر</span>
                </li>
                <li className="flex items-center gap-2">
                  <Phone className="w-5 h-5 text-[#d4a017]" />
                  <span>+20 123 456 7890</span>
                </li>
                <li className="flex items-center gap-2">
                  <Mail className="w-5 h-5 text-[#d4a017]" />
                  <span>info@portsaidprime.com</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 py-6">
          <div className="container mx-auto px-4 lg:px-8 text-center text-sm text-white/50">
            <p>© 2026 Port Said Prime Shoes. جميع الحقوق محفوظة.</p>
          </div>
        </div>
      </footer>

    </div>
  )
}

export default App