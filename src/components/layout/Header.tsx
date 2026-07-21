import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useI18n } from '../../lib/i18n';
import { useAuth } from '../../lib/auth-context';
import { useCart } from '../../lib/cart-context';
import { useWhatsAppNumber } from '../../lib/settings-context'; // ✅ إضافة
import { Search, ShoppingBag, Heart, User, Menu, X, ChevronDown, Phone } from 'lucide-react';

const NAV_LINKS = [
  { to: '/', key: 'nav.home' },
  { to: '/shop', key: 'nav.shop' },
  { to: '/categories', key: 'nav.categories' },
  { to: '/shop?filter=new', key: 'nav.newArrivals' },
  { to: '/offers', key: 'nav.sales' },
  { to: '/about', key: 'nav.about' },
  { to: '/contact', key: 'nav.contact' },
];

// ✅ دالة لتنسيق رقم الهاتف
function formatPhone(phone: string): string {
  if (!phone) return '';
  // إزالة كل المسافات والرموز
  const cleaned = phone.replace(/\s|-|\(|\)/g, '');
  // إذا كان يبدأ بـ 0، حوله لصيغة دولية
  if (cleaned.startsWith('0')) {
    return '+20' + cleaned.substring(1);
  }
  return cleaned;
}

export function Header() {
  const { t, language, setLanguage, isRTL } = useI18n();
  const { user, signOut, isAdmin } = useAuth();
  const { itemCount } = useCart();
  const whatsappNumber = useWhatsAppNumber(); // ✅ جلب الرقم من الـ Context
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
  const brandName = language === 'ar' ? 'بورسعيد برايم شوز' : 'Port Said Prime Shoes';

  // ✅ تنسيق الرقم للعرض
  const displayPhone = whatsappNumber ? whatsappNumber.replace(/\s/g, '') : '';
  const phoneHref = formatPhone(displayPhone);

  return (
    <>
      <div className={`hidden md:block bg-ink text-white/70 text-xs overflow-hidden transition-all duration-300 ${isScrolled ? 'h-0' : 'h-9'}`}>
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-9 flex items-center justify-between">
          <p className="tracking-wide">
            {language === 'ar' ? 'جلد طبيعي · خياطة يدوية · توصيل لكل محافظات مصر' : 'Genuine leather · Hand-stitched · Delivery across Egypt'}
          </p>
          <div className="flex items-center gap-5">
            {/* ✅ استخدام الرقم من الـ Context */}
            <a 
              href={`tel:${phoneHref}`} 
              className="flex items-center gap-1.5 hover:text-[#D9BB96] transition-colors"
            >
              <Phone className="h-3.5 w-3.5" />
              {displayPhone}
            </a>
            <button onClick={toggleLanguage} className="hover:text-[#D9BB96] transition-colors font-medium uppercase tracking-widest2">
              {language === 'en' ? 'العربية' : 'English'}
            </button>
          </div>
        </div>
      </div>

      <header className={`sticky top-0 z-50 transition-all duration-300 border-b ${isScrolled ? 'bg-white/95 backdrop-blur-md border-hairline shadow-sm py-2.5' : 'bg-white border-transparent py-4'}`}>
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="flex items-center justify-between gap-4">
            <button className="lg:hidden p-2 -ml-2 text-ink" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>

            <Link to="/" className="flex-shrink-0">
              <span className="font-display text-xl md:text-2xl font-semibold tracking-tight text-ink">{brandName}</span>
              <span className="hidden md:block text-[10px] uppercase tracking-widest3 text-clay mt-0.5">
                {language === 'ar' ? 'تأسست في بورسعيد' : 'Est. in Port Said'}
              </span>
            </Link>

            <nav className="hidden lg:flex items-center gap-8">
              {NAV_LINKS.map((link) => (
                <Link key={link.key} to={link.to} className="text-sm font-medium text-ink/80 hover:text-primary transition-colors">
                  {t(link.key)}
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-1 md:gap-2">
              <button onClick={() => setIsSearchOpen(true)} className="p-2 rounded-full hover:bg-gray-100 text-ink transition-colors">
                <Search className="h-5 w-5" />
              </button>
              <Link to="/wishlist" className="p-2 rounded-full hover:bg-gray-100 text-ink transition-colors">
                <Heart className="h-5 w-5" />
              </Link>
              <Link to="/cart" className="p-2 rounded-full hover:bg-gray-100 text-ink transition-colors relative">
                <ShoppingBag className="h-5 w-5" />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 text-white text-[11px] font-bold rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--color-primary)' }}>
                    {itemCount > 9 ? '9+' : itemCount}
                  </span>
                )}
              </Link>

              {user ? (
                <div className="relative" ref={accountMenuRef}>
                  <button onClick={() => setIsAccountMenuOpen((v) => !v)} className="p-2 rounded-full hover:bg-gray-100 text-ink transition-colors flex items-center gap-1">
                    <User className="h-5 w-5" />
                    <ChevronDown className="h-3 w-3 hidden md:block" />
                  </button>
                  {isAccountMenuOpen && (
                    <div className="absolute right-0 rtl:right-auto rtl:left-0 top-full mt-2 w-48 bg-white rounded-md border border-hairline shadow-medium py-2 z-50">
                      <Link to="/account" onClick={() => setIsAccountMenuOpen(false)} className="block px-4 py-2 text-sm text-ink/80 hover:bg-gray-50">{t('nav.account')}</Link>
                      {isAdmin && (
                        <Link to="/admin" onClick={() => setIsAccountMenuOpen(false)} className="block px-4 py-2 text-sm text-ink/80 hover:bg-gray-50">{t('admin.dashboard')}</Link>
                      )}
                      <button onClick={() => { setIsAccountMenuOpen(false); signOut(); }} className="block w-full text-left rtl:text-right px-4 py-2 text-sm text-ink/80 hover:bg-gray-50">
                        {t('nav.logout')}
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link to="/login" className="p-2 rounded-full hover:bg-gray-100 text-ink transition-colors">
                  <User className="h-5 w-5" />
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[60] lg:hidden">
            <div className="absolute inset-0 bg-ink/60" onClick={() => setIsMobileMenuOpen(false)} />
            <motion.div
              initial={{ x: isRTL ? '100%' : '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: isRTL ? '100%' : '-100%' }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className={`absolute top-0 ${isRTL ? 'right-0' : 'left-0'} bottom-0 w-80 max-w-[85vw] bg-white shadow-xl`}
            >
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between p-5 border-b border-hairline">
                  <span className="font-display text-lg font-semibold text-ink">{brandName}</span>
                  <button onClick={() => setIsMobileMenuOpen(false)}><X className="h-6 w-6" /></button>
                </div>
                <nav className="flex-1 overflow-y-auto py-2">
                  {NAV_LINKS.map((link) => (
                    <Link key={link.key} to={link.to} className="block px-6 py-3.5 text-base text-ink/80 hover:bg-gray-50 border-b border-hairline/60" onClick={() => setIsMobileMenuOpen(false)}>
                      {t(link.key)}
                    </Link>
                  ))}
                  {isAdmin && (
                    <Link to="/admin" className="block px-6 py-3.5 text-base font-medium hover:bg-gray-50" style={{ color: 'var(--color-primary)' }} onClick={() => setIsMobileMenuOpen(false)}>
                      {t('admin.dashboard')}
                    </Link>
                  )}
                  {user ? (
                    <>
                      <Link to="/account" className="block px-6 py-3.5 text-base text-ink/80 hover:bg-gray-50 border-t border-hairline/60" onClick={() => setIsMobileMenuOpen(false)}>{t('nav.account')}</Link>
                      <button onClick={() => { setIsMobileMenuOpen(false); signOut(); }} className="block w-full text-left rtl:text-right px-6 py-3.5 text-base text-red-600 hover:bg-gray-50">{t('nav.logout')}</button>
                    </>
                  ) : (
                    <Link to="/login" className="block px-6 py-3.5 text-base text-ink/80 hover:bg-gray-50 border-t border-hairline/60" onClick={() => setIsMobileMenuOpen(false)}>{t('nav.login')}</Link>
                  )}
                </nav>
                <div className="p-5 border-t border-hairline">
                  <button onClick={toggleLanguage} className="w-full h-11 rounded-sm border border-hairline text-sm font-medium uppercase tracking-widest2 text-ink transition-colors" style={{ '--hover-color': 'var(--color-primary)' } as React.CSSProperties}>
                    {language === 'en' ? 'العربية' : 'English'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isSearchOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[60] bg-ink/60 flex items-start justify-center pt-24 p-4" onClick={() => setIsSearchOpen(false)}>
            <motion.div initial={{ y: -16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -16, opacity: 0 }} className="w-full max-w-2xl bg-white rounded-sm shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
              <form onSubmit={handleSearch} className="relative">
                <Search className="absolute left-5 rtl:left-auto rtl:right-5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder={t('shop.search')} className="w-full h-16 pl-14 pr-5 rtl:pl-5 rtl:pr-14 text-lg focus:outline-none" autoFocus />
                <button type="button" onClick={() => setIsSearchOpen(false)} className="absolute right-5 rtl:right-auto rtl:left-5 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded">
                  <X className="h-5 w-5 text-gray-400" />
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}