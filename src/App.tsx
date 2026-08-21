import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { I18nProvider } from './lib/i18n';
import { AuthProvider, useAuth } from './lib/auth-context';
import { CartProvider } from './lib/cart-context';
import { WishlistProvider } from './lib/wishlist-context';
import { SettingsProvider } from './lib/settings-context';
import { Toaster } from 'react-hot-toast';
import { Layout } from './components/layout/Layout';
import { AdminLayout } from './components/layout/AdminLayout';
import { ScrollToTop } from './components/ScrollToTop';
import { HomePage } from './pages/HomePage';

const ShopPage = lazy(() => import('./pages/ShopPage').then((m) => ({ default: m.ShopPage })));
const ProductPage = lazy(() => import('./pages/ProductPage').then((m) => ({ default: m.ProductPage })));
const CategoriesPage = lazy(() => import('./pages/CategoriesPage').then((m) => ({ default: m.CategoriesPage })));
const AboutPage = lazy(() => import('./pages/AboutPage').then((m) => ({ default: m.AboutPage })));
const ContactPage = lazy(() => import('./pages/ContactPage').then((m) => ({ default: m.ContactPage })));
const OffersPage = lazy(() => import('./pages/OffersPage').then((m) => ({ default: m.OffersPage })));
const CartPage = lazy(() => import('./pages/CartPage').then((m) => ({ default: m.CartPage })));
const WishlistPage = lazy(() => import('./pages/WishlistPage').then((m) => ({ default: m.WishlistPage })));
const LoginPage = lazy(() => import('./pages/LoginPage').then((m) => ({ default: m.LoginPage })));
const RegisterPage = lazy(() => import('./pages/RegisterPage').then((m) => ({ default: m.RegisterPage })));
const WhatsAppCheckout = lazy(() => import('./pages/WhatsAppCheckout').then((m) => ({ default: m.WhatsAppCheckout })));

const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard').then((m) => ({ default: m.AdminDashboard })));
const AdminProducts = lazy(() => import('./pages/admin/AdminProducts').then((m) => ({ default: m.AdminProducts })));
const AdminProductForm = lazy(() => import('./pages/admin/AdminProductForm').then((m) => ({ default: m.AdminProductForm })));
const AdminCategories = lazy(() => import('./pages/admin/AdminCategories').then((m) => ({ default: m.AdminCategories })));
const AdminOrders = lazy(() => import('./pages/admin/AdminOrders').then((m) => ({ default: m.AdminOrders })));
const AdminCustomers = lazy(() => import('./pages/admin/AdminCustomers').then((m) => ({ default: m.AdminCustomers })));
const AdminReviews = lazy(() => import('./pages/admin/AdminReviews').then((m) => ({ default: m.AdminReviews })));
const AdminCMS = lazy(() => import('./pages/admin/AdminCMS').then((m) => ({ default: m.AdminCMS })));
const AdminSettings = lazy(() => import('./pages/admin/AdminSettings').then((m) => ({ default: m.AdminSettings })));
const AdminHeroSlides = lazy(() => import('./pages/admin/AdminHeroSlides').then((m) => ({ default: m.AdminHeroSlides }))); // ✅ تمت الإضافة

const queryClient = new QueryClient();

function ProtectedRoute({ children, adminOnly = false }: { children: React.ReactNode; adminOnly?: boolean }) {
  const { user, session, loading, isAdmin } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#B8956E]"></div>
      </div>
    );
  }
  if (!session) {
    return <Navigate to="/login" replace />;
  }
  if (adminOnly && !isAdmin) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
}

function PageLoader() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="animate-spin rounded-full h-9 w-9 border-2 border-gray-200 border-t-[#B8956E]"></div>
    </div>
  );
}

function AppRoutes() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="shop" element={<ShopPage />} />
          <Route path="product/:slug" element={<ProductPage />} />
          <Route path="categories" element={<CategoriesPage />} />
          <Route path="offers" element={<OffersPage />} />
          <Route path="cart" element={<CartPage />} />
          <Route path="wishlist" element={<WishlistPage />} />
          <Route path="about" element={<AboutPage />} />
          <Route path="contact" element={<ContactPage />} />
          <Route path="checkout/whatsapp" element={<WhatsAppCheckout />} />
        </Route>
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
        <Route path="forgot-password" element={<LoginPage />} />
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute adminOnly>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="products/new" element={<AdminProductForm />} />
          <Route path="products/:id" element={<AdminProductForm />} />
          <Route path="categories" element={<AdminCategories />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="customers" element={<AdminCustomers />} />
          <Route path="reviews" element={<AdminReviews />} />
          <Route path="media" element={<AdminCMS />} />
          <Route path="settings" element={<AdminSettings />} />
          <Route path="hero" element={<AdminHeroSlides />} /> {/* ✅ تمت الإضافة */}
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ScrollToTop />
        <I18nProvider>
          <AuthProvider>
            <SettingsProvider>
              <CartProvider>
                <WishlistProvider>
                  <AppRoutes />
                  <Toaster
                    position="bottom-right"
                    toastOptions={{
                      duration: 3000,
                      style: { background: '#1A1815', color: '#fff', borderRadius: '8px' },
                      success: { iconTheme: { primary: '#22C55E', secondary: '#fff' } },
                      error: { iconTheme: { primary: '#EF4444', secondary: '#fff' } },
                    }}
                  />
                </WishlistProvider>
              </CartProvider>
            </SettingsProvider>
          </AuthProvider>
        </I18nProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;