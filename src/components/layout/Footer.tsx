import React from 'react';
import { Link } from 'react-router-dom';
import { useI18n } from '../../lib/i18n';
import { useAuth } from '../../lib/auth-context';
import { useSettings } from '../../lib/settings-context';
import { Facebook, Instagram, Twitter, Youtube, Mail, Phone, MapPin, Send, ArrowRight } from 'lucide-react';

export function Footer() {
  const { t, language } = useI18n();
  const { isAdmin } = useAuth();
  const { settings } = useSettings();

  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-black text-white pt-16 pb-8">
      
      {/* 1. Newsletter Section */}
      <div className="border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-12">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="max-w-xl">
              <h3 className="text-2xl md:text-3xl font-bold font-display mb-3">
                {language === 'ar' ? 'انضم إلى عالم الفخامة' : 'Join the World of Luxury'}
              </h3>
              <p className="text-gray-400">
                {language === 'ar' 
                  ? 'اشترك في نشرتنا البريدية للحصول على أحدث العروض والمجموعات الحصرية.' 
                  : 'Subscribe to our newsletter for the latest offers and exclusive collections.'}
              </p>
            </div>
            <form className="flex w-full lg:w-auto gap-3">
              <input 
                type="email" 
                placeholder={language === 'ar' ? 'أدخل بريدك الإلكتروني' : 'Enter your email'} 
                className="flex-1 lg:w-80 h-12 px-5 bg-white/5 rounded-full border border-white/10 focus:outline-none focus:border-amber-500 text-white placeholder:text-gray-500 transition-colors"
              />
              <button 
                type="submit" 
                className="h-12 px-8 bg-amber-500 text-black font-bold rounded-full hover:bg-amber-400 transition-colors flex items-center gap-2"
              >
                <span className="hidden md:inline">{language === 'ar' ? 'اشترك' : 'Subscribe'}</span>
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* 2. Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
          
          {/* Brand Info */}
          <div className="lg:col-span-1">
            <h2 className="font-display text-2xl font-black tracking-tighter mb-2">
              PRIME
            </h2>
            <p className="text-[10px] uppercase tracking-[0.2em] text-amber-500 mb-6 font-semibold">
              {language === 'ar' ? 'بورسعيد برايم شوز' : 'Port Said Prime Shoes'}
            </p>
            <p className="text-gray-400 mb-8 leading-relaxed text-sm">
              {language === 'ar' 
                ? 'نستورد لك أفضل الماركات العالمية بضمان الأصالة والجودة العالية، لنقدم لك تجربة تسوق فاخرة.' 
                : 'We import the best global brands with guaranteed authenticity and high quality, offering you a luxury shopping experience.'}
            </p>
            <div className="flex gap-3">
              {[Facebook, Instagram, Twitter, Youtube].map((Icon, i) => (
                <a 
                  key={i} 
                  href="#" 
                  className="h-10 w-10 rounded-full bg-white/5 border border-white/10 transition-all duration-300 flex items-center justify-center text-gray-400 hover:bg-amber-500 hover:text-black hover:border-amber-500"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider mb-6 text-white">
              {t('footer.quickLinks') || (language === 'ar' ? 'روابط سريعة' : 'Quick Links')}
            </h3>
            <nav className="space-y-4">
              {[
                ['/', t('nav.home') || (language === 'ar' ? 'الرئيسية' : 'Home')], 
                ['/shop', t('nav.shop') || (language === 'ar' ? 'المتجر' : 'Shop')], 
                ['/categories', t('nav.categories') || (language === 'ar' ? 'التصنيفات' : 'Categories')], 
                ['/offers', t('nav.sales') || (language === 'ar' ? 'العروض' : 'Offers')], 
                ['/about', t('nav.about') || (language === 'ar' ? 'من نحن' : 'About Us')]
              ].map(([to, label]) => (
                <Link 
                  key={to} 
                  to={to} 
                  className="block text-gray-400 hover:text-amber-500 transition-colors text-sm flex items-center gap-2 group"
                >
                  <ArrowRight className="h-3 w-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 rtl:rotate-180" />
                  {label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider mb-6 text-white">
              {t('footer.customerService') || (language === 'ar' ? 'خدمة العملاء' : 'Customer Service')}
            </h3>
            <nav className="space-y-4">
              {[
                ['/privacy', t('footer.privacyPolicy') || (language === 'ar' ? 'سياسة الخصوصية' : 'Privacy Policy')], 
                ['/terms', t('footer.termsConditions') || (language === 'ar' ? 'الشروط والأحكام' : 'Terms & Conditions')], 
                ['/returns', t('footer.returnPolicy') || (language === 'ar' ? 'سياسة الاسترجاع' : 'Return Policy')], 
                ['/shipping', t('footer.shippingInfo') || (language === 'ar' ? 'معلومات الشحن' : 'Shipping Info')], 
                ['/faq', t('footer.faq') || (language === 'ar' ? 'الأسئلة الشائعة' : 'FAQ')]
              ].map(([to, label]) => (
                <Link 
                  key={to} 
                  to={to} 
                  className="block text-gray-400 hover:text-amber-500 transition-colors text-sm flex items-center gap-2 group"
                >
                  <ArrowRight className="h-3 w-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 rtl:rotate-180" />
                  {label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider mb-6 text-white">
              {t('footer.contactUs') || (language === 'ar' ? 'تواصل معنا' : 'Contact Us')}
            </h3>
            <div className="space-y-5">
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center flex-shrink-0">
                  <MapPin className="h-5 w-5 text-amber-500" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white mb-1">
                    {language === 'ar' ? 'العنوان' : 'Address'}
                  </p>
                  <p className="text-gray-400 text-sm">
                    {language === 'ar' 
                      ? (settings?.contact_address || 'بورسعيد، مصر')
                      : (settings?.contact_address_en || 'Port Said, Egypt')}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center flex-shrink-0">
                  <Phone className="h-5 w-5 text-amber-500" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white mb-1">
                    {language === 'ar' ? 'الهاتف' : 'Phone'}
                  </p>
                  <a 
                    href={`tel:${settings?.contact_phone || '+201007526286'}`} 
                    className="text-gray-400 text-sm hover:text-amber-500 transition-colors"
                  >
                    {settings?.contact_phone || '+20 100 752 6286'}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center flex-shrink-0">
                  <Mail className="h-5 w-5 text-amber-500" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white mb-1">
                    {language === 'ar' ? 'البريد الإلكتروني' : 'Email'}
                  </p>
                  <a 
                    href={`mailto:${settings?.contact_email || 'info@portsaidprimeshoes.com'}`} 
                    className="text-gray-400 text-sm hover:text-amber-500 transition-colors"
                  >
                    {settings?.contact_email || 'info@portsaidprimeshoes.com'}
                  </a>
                </div>
              </div>
            </div>

            {isAdmin && (
              <Link 
                to="/admin" 
                className="inline-flex items-center gap-2 mt-8 text-sm text-amber-500 hover:text-amber-400 transition-colors font-semibold"
              >
                {t('admin.dashboard') || 'Admin Dashboard'} →
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* 3. Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <p className="text-gray-500 text-sm text-center md:text-left">
              © {currentYear} Port Said Prime Shoes. {t('footer.copyright') || (language === 'ar' ? 'جميع الحقوق محفوظة.' : 'All rights reserved.')}
            </p>
            
            <div className="flex items-center gap-4 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
              <img 
                loading="lazy" 
                src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Visa_Inc._logo.svg/200px-Visa_Inc._logo.svg.png" 
                alt="Visa" 
                className="h-6 object-contain" 
              />
              <img 
                loading="lazy" 
                src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Mastercard-logo.svg/200px-Mastercard-logo.svg.png" 
                alt="Mastercard" 
                className="h-6 object-contain" 
              />
              <img 
                loading="lazy" 
                src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/b0/Apple_Pay_logo.svg/200px-Apple_Pay_logo.svg.png" 
                alt="Apple Pay" 
                className="h-6 object-contain" 
              />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}