import React, { useEffect, useState } from 'react';
import { useI18n } from '../../lib/i18n';
import { supabase } from '../../lib/supabase';
import { Order } from '../../types';
import { formatPrice, formatDate } from '../../lib/utils';
import { Button } from '../../components/ui/Button';
import toast from 'react-hot-toast';
import { Eye, Search, ChevronDown } from 'lucide-react';

export function AdminOrders() {
  const { language } = useI18n();
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      // ✅ التصحيح: إزالة profiles(*) واستبدالها بـ user_id فقط
      const { data, error } = await supabase
        .from('orders')
        .select('*')  // بدون join مع profiles
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching orders:', error);
        return;
      }

      setOrders(data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', orderId);

      if (error) throw error;
      toast.success(language === 'ar' ? 'تم التحديث' : 'Status updated');
      fetchOrders();
    } catch (error) {
      toast.error(language === 'ar' ? 'حدث خطأ' : 'An error occurred');
    }
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.order_number.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = !statusFilter || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-700',
    confirmed: 'bg-blue-100 text-blue-700',
    processing: 'bg-purple-100 text-purple-700',
    shipped: 'bg-indigo-100 text-indigo-700',
    delivered: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
    refunded: 'bg-gray-100 text-gray-700',
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#B8956E]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">
          {language === 'ar' ? 'إدارة الطلبات' : 'Orders Management'}
        </h1>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={language === 'ar' ? 'بحث بالرقم...' : 'Search by number...'}
              className="w-full h-10 pl-10 pr-4 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#B8956E]"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-10 px-4 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#B8956E]"
          >
            <option value="">{language === 'ar' ? 'جميع الحالات' : 'All Status'}</option>
            <option value="pending">{language === 'ar' ? 'قيد الانتظار' : 'Pending'}</option>
            <option value="confirmed">{language === 'ar' ? 'مؤكد' : 'Confirmed'}</option>
            <option value="processing">{language === 'ar' ? 'قيد التجهيز' : 'Processing'}</option>
            <option value="shipped">{language === 'ar' ? 'تم الشحن' : 'Shipped'}</option>
            <option value="delivered">{language === 'ar' ? 'تم التسليم' : 'Delivered'}</option>
            <option value="cancelled">{language === 'ar' ? 'ملغي' : 'Cancelled'}</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">
                  {language === 'ar' ? 'رقم الطلب' : 'Order'}
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">
                  {language === 'ar' ? 'العميل' : 'Customer'}
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">
                  {language === 'ar' ? 'التاريخ' : 'Date'}
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">
                  {language === 'ar' ? 'الإجمالي' : 'Total'}
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">
                  {language === 'ar' ? 'الحالة' : 'Status'}
                </th>
                <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase">
                  {language === 'ar' ? 'إجراءات' : 'Actions'}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <p className="font-medium text-gray-900">{order.order_number}</p>
                    <p className="text-sm text-gray-500">{order.id.substring(0, 8)}...</p>
                  </td>
                  <td className="px-6 py-4">
                    {/* ✅ عرض user_id بدلاً من profiles */}
                    <p className="font-medium text-gray-900">
                      {order.user_id ? order.user_id.substring(0, 8) + '...' : 'Guest'}
                    </p>
                    <p className="text-sm text-gray-500">User ID</p>
                  </td>
                  <td className="px-6 py-4 text-gray-500">
                    {formatDate(order.created_at, language)}
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-900">
                    {formatPrice(order.total)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="relative">
                      <select
                        value={order.status}
                        onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                        className={`appearance-none px-3 py-1.5 pr-8 rounded-lg text-sm font-medium cursor-pointer ${
                          statusColors[order.status]
                        }`}
                      >
                        <option value="pending">{language === 'ar' ? 'قيد الانتظار' : 'Pending'}</option>
                        <option value="confirmed">{language === 'ar' ? 'مؤكد' : 'Confirmed'}</option>
                        <option value="processing">{language === 'ar' ? 'قيد التجهيز' : 'Processing'}</option>
                        <option value="shipped">{language === 'ar' ? 'تم الشحن' : 'Shipped'}</option>
                        <option value="delivered">{language === 'ar' ? 'تم التسليم' : 'Delivered'}</option>
                        <option value="cancelled">{language === 'ar' ? 'ملغي' : 'Cancelled'}</option>
                      </select>
                      <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none" />
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Button variant="ghost" size="icon">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredOrders.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">
              {language === 'ar' ? 'لا توجد طلبات' : 'No orders found'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}