import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useI18n } from '../../lib/i18n';
import { supabase } from '../../lib/supabase';
import { formatPrice } from '../../lib/utils';
import {
  Package,
  ShoppingCart,
  Users,
  DollarSign,
  TrendingUp,
  TrendingDown,
  ArrowRight,
} from 'lucide-react';

interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  totalCustomers: number;
  recentOrders: any[];
  topProducts: any[];
}

export function AdminDashboard() {
  const { language } = useI18n();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalRevenue: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalCustomers: 0,
    recentOrders: [],
    topProducts: [],
  });

  useEffect(() => {
    async function fetchStats() {
      try {
        // 1. عدد الطلبات
        const { count: ordersCount } = await supabase
          .from('orders')
          .select('*', { count: 'exact', head: true });

        // 2. إجمالي الإيرادات (للطلبات المدفوعة فقط)
        const { data: ordersData } = await supabase
          .from('orders')
          .select('total')
          .eq('payment_status', 'paid');

        const totalRevenue = ordersData?.reduce((sum, order) => sum + Number(order.total || 0), 0) || 0;

        // 3. عدد المنتجات
        const { count: productsCount } = await supabase
          .from('products')
          .select('*', { count: 'exact', head: true });

        // 4. عدد العملاء (مع معالجة خطأ في حال عدم وجود جدول profiles)
        let customersCount = 0;
        try {
          const { count } = await supabase
            .from('profiles')
            .select('*', { count: 'exact', head: true })
            .eq('role', 'customer');
          customersCount = count || 0;
        } catch (err) {
          console.warn('Profiles table might be missing, defaulting customers to 0');
        }

        // 5. آخر الطلبات (تم إزالة profiles(*) لتجنب خطأ 400)
        const { data: recentOrders } = await supabase
          .from('orders')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(5);

        // 6. أفضل المنتجات
        const { data: topProducts } = await supabase
          .from('products')
          .select('*')
          .order('reviews_count', { ascending: false })
          .limit(5);

        setStats({
          totalRevenue,
          totalOrders: ordersCount || 0,
          totalProducts: productsCount || 0,
          totalCustomers: customersCount,
          recentOrders: recentOrders || [],
          topProducts: topProducts || [],
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  const statCards = [
    {
      label: language === 'ar' ? 'إجمالي الإيرادات' : 'Total Revenue',
      value: formatPrice(stats.totalRevenue),
      icon: DollarSign,
      change: '+12.5%',
      isPositive: true,
    },
    {
      label: language === 'ar' ? 'إجمالي الطلبات' : 'Total Orders',
      value: stats.totalOrders.toString(),
      icon: ShoppingCart,
      change: '+8.2%',
      isPositive: true,
    },
    {
      label: language === 'ar' ? 'إجمالي المنتجات' : 'Total Products',
      value: stats.totalProducts.toString(),
      icon: Package,
      change: '+3',
      isPositive: true,
    },
    {
      label: language === 'ar' ? 'إجمالي العملاء' : 'Total Customers',
      value: stats.totalCustomers.toString(),
      icon: Users,
      change: '+15.3%',
      isPositive: true,
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#B8956E]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          {language === 'ar' ? 'لوحة التحكم' : 'Dashboard'}
        </h1>
        <p className="text-gray-500 mt-1">
          {language === 'ar'
            ? 'مرحباً بك في لوحة التحكم'
            : 'Welcome to your admin dashboard'}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-xl shadow-sm p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-[#B8956E]/10 rounded-lg">
                <stat.icon className="h-6 w-6 text-[#B8956E]" />
              </div>
              <span
                className={`flex items-center text-sm font-medium ${
                  stat.isPositive ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {stat.isPositive ? (
                  <TrendingUp className="h-4 w-4 mr-1" />
                ) : (
                  <TrendingDown className="h-4 w-4 mr-1" />
                )}
                {stat.change}
              </span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
            <p className="text-gray-500 text-sm">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Recent Orders & Top Products */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Recent Orders */}
        <div className="bg-white rounded-xl shadow-sm">
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">
              {language === 'ar' ? 'آخر الطلبات' : 'Recent Orders'}
            </h2>
            <Link
              to="/admin/orders"
              className="text-sm text-[#B8956E] hover:underline flex items-center gap-1"
            >
              {language === 'ar' ? 'عرض الكل' : 'View All'}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="divide-y divide-gray-100">
            {stats.recentOrders.length > 0 ? (
              stats.recentOrders.map((order) => (
                <div key={order.id} className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{order.order_number}</p>
                    <p className="text-sm text-gray-500">
                      {language === 'ar' ? 'طلب جديد' : 'New Order'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">
                      {formatPrice(order.total)}
                    </p>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        order.status === 'delivered'
                          ? 'bg-green-100 text-green-700'
                          : order.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {order.status === 'pending' ? (language === 'ar' ? 'قيد الانتظار' : 'Pending') : 
                       order.status === 'delivered' ? (language === 'ar' ? 'تم التوصيل' : 'Delivered') : 
                       (language === 'ar' ? 'قيد المعالجة' : 'Processing')}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="p-4 text-center text-gray-500">
                {language === 'ar' ? 'لا توجد طلبات' : 'No orders yet'}
              </p>
            )}
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-xl shadow-sm">
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">
              {language === 'ar' ? 'أفضل المنتجات' : 'Top Products'}
            </h2>
            <Link
              to="/admin/products"
              className="text-sm text-[#B8956E] hover:underline flex items-center gap-1"
            >
              {language === 'ar' ? 'عرض الكل' : 'View All'}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="divide-y divide-gray-100">
            {stats.topProducts.length > 0 ? (
              stats.topProducts.map((product) => (
                <div key={product.id} className="p-4 flex items-center gap-4">
                  <img 
                    loading="lazy" 
                    decoding="async"
                    src={product.images?.[0] || 'https://placehold.co/48'}
                    alt={language === 'ar' ? product.name_ar : product.name}
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">
                      {language === 'ar' ? product.name_ar : product.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {product.reviews_count || 0}{' '}
                      {language === 'ar' ? 'تقييم' : 'reviews'}
                    </p>
                  </div>
                  <p className="font-medium text-gray-900">
                    {formatPrice(product.price)}
                  </p>
                </div>
              ))
            ) : (
              <p className="p-4 text-center text-gray-500">
                {language === 'ar' ? 'لا توجد منتجات' : 'No products yet'}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}