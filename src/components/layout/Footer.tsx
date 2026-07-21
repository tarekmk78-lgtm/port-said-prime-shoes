import React from 'react';
import { Link } from 'react-router-dom';
import { useI18n } from '../../lib/i18n';
import { useAuth } from '../../lib/auth-context';
import { useSettings } from '../../lib/settings-context';
import { Facebook, Instagram, Twitter, Youtube, Mail, Phone, MapPin, Send } from 'lucide-react';

export function Footer() {
  const { t, language } = useI18n();
  const { isAdmin } = useAuth();
  const { settings } = useSettings();

  return (
    <footer className="bg-ink text-white">
      <div className="border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <span className="eyebrow text-[#D9BB96]">{t('footer.newsletter')}</span>
              <p className="text-white/55 mt-2">{t('footer.newsletterText')}</p>
            </div>
            <form className="flex w-full md:w-auto gap-2">
              <input 
                type="email" 
                placeholder={t('auth.email')} 
                className="flex-1 md:w-72 h-12 px-4 bg-white/5 rounded-sm border border-white/15 focus:outline-none text-white placeholder:text-white/40" 
                style={{ '--tw-ring-color': 'var(--color-primary)' } as React.CSSProperties} 
              />
              <button 
                type="submit" 
                className="h-12 px-6 text-ink font-semibold rounded-sm transition-colors flex items-center gap-2" 
                style={{ backgroundColor: 'var(--color-primary)' }}
              >
                <Send className="h-4 w-4" />
                <span className="hidden md:inline">{t('footer.subscribe')}</span>
              </button>
            </form>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12">
          <div>
            <h2 className="font-display text-2xl font-semibold mb-2">
              {language === 'ar' ? 'بورسعيد برايم شوز' : 'Port Said Prime Shoes'}
            </h2>
            <p className="text-[10px] uppercase tracking-widest3 text-[#D9BB96] mb-5">
              {language === 'ar' ? 'تأسست في بورسعيد' : 'Est. in Port Said'}
            </p>
            <p className="text-white/55 mb-6 leading-relaxed">
              {language === 'ar' ? 'اكتشف الأحذية الفاخرة المصممة للراحة والأناقة' : 'Discover premium footwear crafted for comfort and style'}
            </p>
            <div className="flex gap-3">
              {[Facebook, Instagram, Twitter, Youtube].map((Icon, i) => (
                <a 
                  key={i} 
                  href="#" 
                  className="h-10 w-10 rounded-full bg-white/10 transition-colors flex items-center justify-center hover:text-ink" 
                  style={{ ['--hover-bg' as string]: 'var(--color-primary)' }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-primary)')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)')}
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-widest2 mb-5 text-white/90">
              {t('footer.quickLinks')}
            </h3>
            <nav className="space-y-3.5">
              {[
                ['/', t('nav.home')], 
                ['/shop', t('nav.shop')], 
                ['/categories', t('nav.categories')], 
                ['/offers', t('nav.sales')], 
                ['/about', t('nav.about')], 
                ['/contact', t('nav.contact')]
              ].map(([to, label]) => (
                <Link 
                  key={to} 
                  to={to} 
                  className="block text-white/55 hover:text-[#D9BB96] transition-colors"
                >
                  {label}
                </Link>
              ))}
            </nav>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-widest2 mb-5 text-white/90">
              {t('footer.customerService')}
            </h3>
            <nav className="space-y-3.5">
              {[
                ['/privacy', t('footer.privacyPolicy')], 
                ['/terms', t('footer.termsConditions')], 
                ['/returns', t('footer.returnPolicy')], 
                ['/shipping', t('footer.shippingInfo')], 
                ['/faq', t('footer.faq')]
              ].map(([to, label]) => (
                <Link 
                  key={to} 
                  to={to} 
                  className="block text-white/55 hover:text-[#D9BB96] transition-colors"
                >
                  {label}
                </Link>
              ))}
            </nav>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-widest2 mb-5 text-white/90">
              {t('footer.contactUs')}
            </h3>
            <div className="space-y-4">
              {/* العنوان - ديناميكي */}
              <div className="flex items-start gap-3">
                <MapPin 
                  className="h-5 w-5 flex-shrink-0 mt-0.5" 
                  style={{ color: 'var(--color-primary)' }} 
                />
                <p className="text-white/55">
                  {language === 'ar' 
                    ? (settings?.contact_address || 'بورسعيد، مصر')
                    : (settings?.contact_address_en || 'Port Said, Egypt')}
                </p>
              </div>

              {/* التليفون - ديناميكي */}
              <div className="flex items-center gap-3">
                <Phone 
                  className="h-5 w-5 flex-shrink-0" 
                  style={{ color: 'var(--color-primary)' }} 
                />
                <a 
                  href={`tel:${settings?.contact_phone || '+20123456789'}`} 
                  className="text-white/55 hover:text-[#D9BB96] transition-colors"
                >
                  {settings?.contact_phone || '+20 123 456 789'}
                </a>
              </div>

              {/* الإيميل - ديناميكي */}
              <div className="flex items-center gap-3">
                <Mail 
                  className="h-5 w-5 flex-shrink-0" 
                  style={{ color: 'var(--color-primary)' }} 
                />
                <a 
                  href={`mailto:${settings?.contact_email || 'info@clarksportsaid.com'}`} 
                  className="text-white/55 hover:text-[#D9BB96] transition-colors"
                >
                  {settings?.contact_email || 'info@clarksportsaid.com'}
                </a>
              </div>
            </div>

            {isAdmin && (
              <Link 
                to="/admin" 
                className="inline-block mt-6 text-sm text-[#D9BB96] hover:underline"
              >
                {t('admin.dashboard')} →
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="stitch-divider--dark" />
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-white/45 text-sm text-center md:text-left">
            © {new Date().getFullYear()} Port Said Prime Shoes. {t('footer.copyright')}
          </p>
          <div className="flex items-center gap-4">
            <img 
              loading="lazy" 
              decoding="async" 
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Visa_Inc._logo.svg/200px-Visa_Inc._logo.svg.png" 
              alt="Visa" 
              className="h-6 object-contain opacity-50" 
            />
            <img 
              loading="lazy" 
              decoding="async" 
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Mastercard-logo.svg/200px-Mastercard-logo.svg.png" 
              alt="Mastercard" 
              className="h-6 object-contain opacity-50" 
            />
          </div>
        </div>
      </div>
    </footer>
  );
}