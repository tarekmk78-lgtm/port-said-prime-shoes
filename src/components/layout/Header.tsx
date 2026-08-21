import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useI18n } from '../../lib/i18n';
import { useAuth } from '../../lib/auth-context';
import { useCart } from '../../lib/cart-context';
import { useWhatsAppNumber } from '../../lib/settings-context';
import { Search, ShoppingBag, Heart, User, Menu, X, ChevronDown, Phone, Sparkles } from 'lucide-react';

const NAV_LINKS = [
  { to: '/', key: 'nav.home' },
  { to: '/shop', key: 'nav.shop' },
  { to: '/categories', key: 'nav.categories' },
  { to: '/shop?filter=new', key: 'nav.newArrivals' },
  { to: '/offers', key: 'nav.sales' },
  { to: '/about', key: 'nav.about' },
  { to: '/contact', key: 'nav.contact' },
];

function formatPhone(phone: string): string {
  if (!phone) return '';
  const cleaned = phone.replace(/\s|-|\(|\)/g, '');
  if (cleaned.startsWith('0')) {
    return '+20' + cleaned.substring(1);
  }
  return cleaned;
}

export function Header() {
  const { t, language, setLanguage, isRTL } = useI18n();
  const { user, signOut, isAdmin } = useAuth();
  const { itemCount } = useCart();
  const whatsappNumber = useWhatsAppNumber();
  const navigate = useNavigate();
  
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const accountMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (accountMenuRef.current && !accountMenuRef.current.contains(e.target as Node)) {
        setIsAccountMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setIsSearchOpen(false);
    }
  };

  const toggleLanguage = () => setLanguage(language === 'en' ? 'ar' : 'en');
  const brandName = language === 'ar' ? 'PRIME' : 'PRIME';
  const brandSubName = language === 'ar' ? 'بورسعيد برايم شوز' : 'Port Said Prime Shoes';

  const displayPhone = whatsappNumber ? whatsappNumber.replace(/\s/g, '') : '';
  const phoneHref = formatPhone(displayPhone);

  return (
    <>
      {/* 1. Top Announcement Bar (محدث ليعكس هوية الاستيراد) */}
      <div className={`hidden md:block bg-black text-white text-xs overflow-hidden transition-all duration-500 ${isScrolled ? 'h-0 opacity-0' : 'h-10 opacity-100'}`}>
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-10 flex items-center justify-between">
          <p className="tracking-wide font-medium flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            {language === 'ar' ? 'أحذية عالمية مستوردة بأعلى جودة' : 'Premium Imported Global Footwear'}
          </p>
          <div className="flex items-center gap-5">
            <a href={`tel:${phoneHref}`} className="flex items-center gap-1.5 hover:text-amber-500 transition-colors">
              <Phone className="h-3.5 w-3.5" />
              {displayPhone}
            </a>
            <button onClick={toggleLanguage} className="hover:text-amber-500 transition-colors font-medium uppercase tracking-wider border-l border-white/20 pl-5 rtl:border-r rtl:border-l-0 rtl:pl-0 rtl:pr-5">
              {language === 'en' ? 'العربية' : 'English'}
            </button>
          </div>
        </div>
      </div>

      {/* 2. Main Header */}
      <header className={`sticky top-0 z-50 transition-all duration-300 border-b ${isScrolled ? 'bg-white/95 backdrop-blur-md border-gray-100 shadow-sm py-3' : 'bg-white border-transparent py-4'}`}>
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="flex items-center justify-between gap-4">
            
            {/* Mobile Menu Button */}
            <button className="lg:hidden p-2 -ml-2 text-gray-900" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>

            {/* Logo */}
            <Link to="/" className="flex-shrink-0 flex flex-col items-start">
              <span className="font-display text-2xl md:text-3xl font-black tracking-tighter text-gray-900 leading-none">
                {brandName}
              </span>
              <span className="text-[10px] uppercase tracking-[0.2em] text-gray-500 mt-1 font-medium">
                {brandSubName}
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-8">
              {NAV_LINKS.map((link) => (
                <Link 
                  key={link.key} 
                  to={link.to} 
                  className="relative text-sm font-semibold text-gray-700 hover:text-black transition-colors group py-1"
                >
                  {t(link.key)}
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-amber-600 transition-all duration-300 group-hover:w-full rtl:left-auto rtl:right-0"></span>
                </Link>
              ))}
            </nav>

            {/* Actions (Search, Wishlist, Cart, Account) */}
            <div className="flex items-center gap-1 md:gap-2">
              <button onClick={() => setIsSearchOpen(true)} className="p-2.5 rounded-full hover:bg-gray-100 text-gray-700 hover:text-black transition-colors">
                <Search className="h-5 w-5" />
              </button>
              
              <Link to="/wishlist" className="p-2.5 rounded-full hover:bg-gray-100 text-gray-700 hover:text-black transition-colors hidden sm:block">
                <Heart className="h-5 w-5" />
              </Link>
              
              <Link to="/cart" className="p-2.5 rounded-full hover:bg-gray-100 text-gray-700 hover:text-black transition-colors relative">
                <ShoppingBag className="h-5 w-5" />
                {itemCount > 0 && (
                  <span className="absolute top-1 right-1 h-4.5 w-4.5 bg-black text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
                    {itemCount > 9 ? '9+' : itemCount}
                  </span>
                )}
              </Link>

              {user ? (
                <div className="relative" ref={accountMenuRef}>
                  <button onClick={() => setIsAccountMenuOpen((v) => !v)} className="p-2.5 rounded-full hover:bg-gray-100 text-gray-700 hover:text-black transition-colors flex items-center gap-1">
                    <User className="h-5 w-5" />
                    <ChevronDown className={`h-3 w-3 hidden md:block transition-transform duration-200 ${isAccountMenuOpen ? 'rotate-180' : ''}`} />
                  </button>
                  
                  <AnimatePresence>
                    {isAccountMenuOpen && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }} 
                        animate={{ opacity: 1, y: 0 }} 
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute right-0 rtl:right-auto rtl:left-0 top-full mt-2 w-56 bg-white rounded-xl border border-gray-100 shadow-xl py-2 z-50 overflow-hidden"
                      >
                        <Link to="/account" onClick={() => setIsAccountMenuOpen(false)} className="block px-5 py-3 text-sm text-gray-700 hover:bg-gray-50 hover:text-black transition-colors">
                          {t('nav.account')}
                        </Link>
                        {isAdmin && (
                          <Link to="/admin" onClick={() => setIsAccountMenuOpen(false)} className="block px-5 py-3 text-sm text-gray-700 hover:bg-gray-50 hover:text-black transition-colors border-t border-gray-50">
                            {t('admin.dashboard')}
                          </Link>
                        )}
                        <button onClick={() => { setIsAccountMenuOpen(false); signOut(); }} className="block w-full text-left rtl:text-right px-5 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors border-t border-gray-50 mt-1">
                          {t('nav.logout')}
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <Link to="/login" className="p-2.5 rounded-full hover:bg-gray-100 text-gray-700 hover:text-black transition-colors">
                  <User className="h-5 w-5" />
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* 3. Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[60] lg:hidden">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
            <motion.div
              initial={{ x: isRTL ? '100%' : '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: isRTL ? '100%' : '-100%' }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className={`absolute top-0 ${isRTL ? 'right-0' : 'left-0'} bottom-0 w-80 max-w-[85vw] bg-white shadow-2xl`}
            >
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between p-5 border-b border-gray-100">
                  <div className="flex flex-col">
                    <span className="font-display text-xl font-black text-gray-900">PRIME</span>
                    <span className="text-[9px] uppercase tracking-widest text-gray-500">Port Said Shoes</span>
                  </div>
                  <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <X className="h-6 w-6 text-gray-600" />
                  </button>
                </div>
                
                <nav className="flex-1 overflow-y-auto py-4">
                  {NAV_LINKS.map((link) => (
                    <Link 
                      key={link.key} 
                      to={link.to} 
                      className="block px-6 py-4 text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-black border-b border-gray-50 transition-colors" 
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {t(link.key)}
                    </Link>
                  ))}
                  
                  {isAdmin && (
                    <Link to="/admin" className="block px-6 py-4 text-base font-bold text-amber-600 hover:bg-amber-50 border-b border-gray-50 transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
                      {t('admin.dashboard')}
                    </Link>
                  )}
                  
                  {user ? (
                    <>
                      <Link to="/account" className="block px-6 py-4 text-base font-medium text-gray-700 hover:bg-gray-50 border-t border-gray-100 mt-2" onClick={() => setIsMobileMenuOpen(false)}>
                        {t('nav.account')}
                      </Link>
                      <button onClick={() => { setIsMobileMenuOpen(false); signOut(); }} className="block w-full text-left rtl:text-right px-6 py-4 text-base font-medium text-red-600 hover:bg-red-50 transition-colors">
                        {t('nav.logout')}
                      </button>
                    </>
                  ) : (
                    <Link to="/login" className="block px-6 py-4 text-base font-medium text-gray-700 hover:bg-gray-50 border-t border-gray-100 mt-2" onClick={() => setIsMobileMenuOpen(false)}>
                      {t('nav.login')}
                    </Link>
                  )}
                </nav>
                
                <div className="p-5 border-t border-gray-100 bg-gray-50">
                  <button onClick={toggleLanguage} className="w-full h-12 rounded-lg border border-gray-200 text-sm font-bold uppercase tracking-wider text-gray-700 hover:bg-black hover:text-white hover:border-black transition-all duration-300 flex items-center justify-center gap-2">
                    {language === 'en' ? 'العربية' : 'English'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 4. Search Overlay */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="fixed inset-0 z-[70] bg-black/70 backdrop-blur-sm flex items-start justify-center pt-24 p-4" 
            onClick={() => setIsSearchOpen(false)}
          >
            <motion.div 
              initial={{ y: -20, opacity: 0 }} 
              animate={{ y: 0, opacity: 1 }} 
              exit={{ y: -20, opacity: 0 }} 
              className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden" 
              onClick={(e) => e.stopPropagation()}
            >
              <form onSubmit={handleSearch} className="relative">
                <Search className="absolute left-5 rtl:left-auto rtl:right-5 top-1/2 -translate-y-1/2 h-6 w-6 text-gray-400" />
                <input 
                  type="text" 
                  value={searchQuery} 
                  onChange={(e) => setSearchQuery(e.target.value)} 
                  placeholder={t('shop.search') || 'ابحث عن حذاء، ماركة، أو تصنيف...'} 
                  className="w-full h-20 pl-16 pr-5 rtl:pl-5 rtl:pr-16 text-xl font-medium focus:outline-none text-gray-900 placeholder-gray-400" 
                  autoFocus 
                />
                <button type="button" onClick={() => setIsSearchOpen(false)} className="absolute right-5 rtl:right-auto rtl:left-5 top-1/2 -translate-y-1/2 p-2 hover:bg-gray-100 rounded-full transition-colors">
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}