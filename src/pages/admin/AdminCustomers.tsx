import React, { useEffect, useState } from 'react';
import { useI18n } from '../../lib/i18n';
import { supabase } from '../../lib/supabase';
import { formatPrice, formatDate } from '../../lib/utils';
import { Modal } from '../../components/ui/Modal';
import { Search, Mail, Phone, ShieldCheck, User, X } from 'lucide-react';

interface CustomerRow {
  id: string;
  email: string;
  full_name: string;
  phone: string | null;
  role: 'customer' | 'admin';
  created_at: string;
  orders_count: number;
  total_spent: number;
}

export function AdminCustomers() {
  const { language } = useI18n();
  const [loading, setLoading] = useState(true);
  const [customers, setCustomers] = useState<CustomerRow[]>([]);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<CustomerRow | null>(null);
  const [selectedOrders, setSelectedOrders] = useState<any[]>([]);

  useEffect(() => {
    fetchCustomers();
  }, []);

  async function fetchCustomers() {
    setLoading(true);
    try {
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;

      const { data: orders } = await supabase.from('orders').select('user_id, total');

      const rows: CustomerRow[] = (profiles || []).map((p: any) => {
        const userOrders = (orders || []).filter((o: any) => o.user_id === p.id);
        return {
          id: p.id,
          email: p.email,
          full_name: p.full_name || '—',
          phone: p.phone,
          role: p.role,
          created_at: p.created_at,
          orders_count: userOrders.length,
          total_spent: userOrders.reduce((sum: number, o: any) => sum + Number(o.total || 0), 0),
        };
      });

      setCustomers(rows);
    } catch (error) {
      console.error('Error fetching customers:', error);
    } finally {
      setLoading(false);
    }
  }

  async function openCustomer(customer: CustomerRow) {
    setSelected(customer);
    const { data } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', customer.id)
      .order('created_at', { ascending: false });
    setSelectedOrders(data || []);
  }

  const filtered = customers.filter((c) => {
    const q = search.toLowerCase();
    return c.full_name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          {language === 'ar' ? 'العملاء' : 'Customers'}
        </h1>
        <p className="text-gray-500 mt-1">
          {language === 'ar' ? `${customers.length} عميل مسجّل` : `${customers.length} registered customers`}
        </p>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 rtl:left-auto rtl:right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={language === 'ar' ? 'بحث بالاسم أو البريد...' : 'Search name or email...'}
          className="w-full h-10 pl-9 pr-3 rtl:pr-9 rtl:pl-3 rounded-md border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-gold"
        />
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-gray-400">{language === 'ar' ? 'جارٍ التحميل...' : 'Loading...'}</div>
        ) : filtered.length === 0 ? (
          <div className="p-10 text-center text-gray-400">
            <User className="h-8 w-8 mx-auto mb-3" />
            {language === 'ar' ? 'لا يوجد عملاء' : 'No customers found'}
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th className="px-4 py-3 text-left rtl:text-right">{language === 'ar' ? 'العميل' : 'Customer'}</th>
                <th className="px-4 py-3 text-left rtl:text-right">{language === 'ar' ? 'الدور' : 'Role'}</th>
                <th className="px-4 py-3 text-left rtl:text-right">{language === 'ar' ? 'الطلبات' : 'Orders'}</th>
                <th className="px-4 py-3 text-left rtl:text-right">{language === 'ar' ? 'إجمالي الإنفاق' : 'Total Spent'}</th>
                <th className="px-4 py-3 text-left rtl:text-right">{language === 'ar' ? 'تاريخ التسجيل' : 'Joined'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((customer) => (
                <tr
                  key={customer.id}
                  onClick={() => openCustomer(customer)}
                  className="hover:bg-gray-50 cursor-pointer"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gold/10 text-gold flex items-center justify-center font-semibold">
                        {customer.full_name?.[0]?.toUpperCase() || '?'}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{customer.full_name}</p>
                        <p className="text-sm text-gray-500">{customer.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {customer.role === 'admin' ? (
                      <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-gold/10 text-gold font-medium">
                        <ShieldCheck className="h-3 w-3" />
                        Admin
                      </span>
                    ) : (
                      <span className="text-xs px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 font-medium">
                        {language === 'ar' ? 'عميل' : 'Customer'}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-700">{customer.orders_count}</td>
                  <td className="px-4 py-3 font-medium text-gray-900">{formatPrice(customer.total_spent)}</td>
                  <td className="px-4 py-3 text-gray-500">{formatDate(customer.created_at, language)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Modal isOpen={!!selected} onClose={() => setSelected(null)} size="lg" showClose={false}>
        {selected && (
          <div>
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-gold/10 text-gold flex items-center justify-center font-semibold text-xl">
                  {selected.full_name?.[0]?.toUpperCase() || '?'}
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">{selected.full_name}</h2>
                  <p className="text-sm text-gray-500 flex items-center gap-1.5"><Mail className="h-3.5 w-3.5" />{selected.email}</p>
                  {selected.phone && (
                    <p className="text-sm text-gray-500 flex items-center gap-1.5 mt-0.5"><Phone className="h-3.5 w-3.5" />{selected.phone}</p>
                  )}
                </div>
              </div>
              <button onClick={() => setSelected(null)} className="p-1 hover:bg-gray-100 rounded-full">
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-500">{language === 'ar' ? 'عدد الطلبات' : 'Orders'}</p>
                <p className="text-xl font-bold text-gray-900">{selected.orders_count}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-500">{language === 'ar' ? 'إجمالي الإنفاق' : 'Total spent'}</p>
                <p className="text-xl font-bold text-gray-900">{formatPrice(selected.total_spent)}</p>
              </div>
            </div>

            <h3 className="text-sm font-semibold text-gray-700 mb-3">
              {language === 'ar' ? 'سجل الطلبات' : 'Order history'}
            </h3>
            <div className="divide-y divide-gray-100 max-h-64 overflow-y-auto">
              {selectedOrders.length > 0 ? (
                selectedOrders.map((order) => (
                  <div key={order.id} className="py-3 flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{order.order_number}</p>
                      <p className="text-sm text-gray-500">{formatDate(order.created_at, language)}</p>
                    </div>
                    <p className="font-medium text-gray-900">{formatPrice(order.total)}</p>
                  </div>
                ))
              ) : (
                <p className="text-gray-400 text-sm py-4">{language === 'ar' ? 'لا توجد طلبات' : 'No orders yet'}</p>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
