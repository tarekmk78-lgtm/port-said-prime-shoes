import React, { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useI18n } from '../../lib/i18n';
import { useAuth } from '../../lib/auth-context';
import {
  LayoutDashboard,
  Package,
  FolderOpen,
  ShoppingCart,
  Users,
  Star,
  Image,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Award,
} from 'lucide-react';

export function AdminLayout() {
  const { t, language } = useI18n();
  const { user, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const menuItems = [
    { path: '/admin', icon: LayoutDashboard, label: t('admin.dashboard') },
    { path: '/admin/products', icon: Package, label: t('admin.products') },
    { path: '/admin/categories', icon: FolderOpen, label: t('admin.categories') },
    { path: '/admin/brands', icon: Award, label: language === 'ar' ? 'الماركات' : 'Brands' },
    { path: '/admin/orders', icon: ShoppingCart, label: t('admin.orders') },
    { path: '/admin/customers', icon: Users, label: t('admin.customers') },
    { path: '/admin/reviews', icon: Star, label: language === 'ar' ? 'التقييمات' : 'Reviews' },
    { path: '/admin/media', icon: Image, label: language === 'ar' ? 'الصور والمحتوى' : 'Media & Content' },
    { path: '/admin/settings', icon: Settings, label: t('admin.settings') },
  ];

  const isActive = (path: string) => {
    if (path === '/admin') return location.pathname === '/admin';
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white border-b h-16 flex items-center justify-between px-4">
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 rounded-md hover:bg-gray-100"
        >
          {isSidebarOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
        <h1 className="font-bold text-lg">
          {language === 'ar' ? 'لوحة التحكم' : 'Admin Dashboard'}
        </h1>
        <div className="w-10" />
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 right-0 z-30 h-full w-64 bg-[#1A1815] text-white flex flex-col transform transition-transform duration-300 lg:translate-x-0 ${
          isSidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Logo */}
        <div className="h-16 lg:h-20 flex items-center justify-center border-b border-white/10 flex-shrink-0">
          <Link to="/" className="text-xl font-bold">
            {language === 'ar' ? 'بورسعيد برايم شوز' : 'Port Said Prime Shoes'}
          </Link>
        </div>

        {/* Nav - scrollable */}
        <nav className="flex-1 overflow-y-auto py-4">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setIsSidebarOpen(false)}
              className={`flex items-center gap-3 px-6 py-3 transition-colors ${
                isActive(item.path)
                  ? 'bg-[#B8956E] text-white'
                  : 'text-gray-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <item.icon className="h-5 w-5" />
              <span>{item.label}</span>
              {isActive(item.path) && (
                <ChevronRight className="h-4 w-4 ms-auto rotate-180" />
              )}
            </Link>
          ))}
        </nav>

        {/* Bottom Actions */}
        <div className="flex-shrink-0 p-4 border-t border-white/10 space-y-1">
          <Link
            to="/"
            className="flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/5"
          >
            <ChevronRight className="h-4 w-4" />
            <span>{language === 'ar' ? 'العودة للمتجر' : 'Back to Store'}</span>
          </Link>
          <button
            onClick={async () => {
              await signOut();
              navigate('/');
            }}
            className="flex items-center gap-2 w-full px-4 py-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/5"
          >
            <LogOut className="h-5 w-5" />
            <span>{t('nav.logout')}</span>
          </button>
        </div>
      </aside>

      {/* Overlay */}
      {isSidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 z-20 bg-black/50"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="lg:mr-64 pt-16 lg:pt-0 min-h-screen">
        <div className="p-4 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}