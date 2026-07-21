import React, { useEffect, useState } from 'react';
import { useI18n } from '../../lib/i18n';
import { supabase } from '../../lib/supabase';
import { formatDate } from '../../lib/utils';
import toast from 'react-hot-toast';
import { Star, Check, X, Trash2, MessageSquareText } from 'lucide-react';

interface ReviewRow {
  id: string;
  product_id: string;
  rating: number;
  title: string;
  comment: string;
  is_approved: boolean;
  created_at: string;
  profiles?: { full_name: string; email: string } | null;
  products?: { name: string; name_ar: string } | null;
}

type FilterTab = 'pending' | 'approved' | 'all';

export function AdminReviews() {
  const { language } = useI18n();
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState<ReviewRow[]>([]);
  const [tab, setTab] = useState<FilterTab>('pending');

  useEffect(() => {
    fetchReviews();
  }, []);

  async function fetchReviews() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('*, profiles(full_name, email), products(name, name_ar)')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setReviews(data || []);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  }

  async function setApproval(id: string, value: boolean) {
    try {
      const { error } = await supabase.from('reviews').update({ is_approved: value }).eq('id', id);
      if (error) throw error;
      toast.success(
        value
          ? (language === 'ar' ? 'تمت الموافقة على التقييم' : 'Review approved')
          : (language === 'ar' ? 'تم إلغاء الموافقة' : 'Review unapproved')
      );
      fetchReviews();
    } catch (error: any) {
      toast.error(error.message || (language === 'ar' ? 'حدث خطأ' : 'Something went wrong'));
    }
  }

  async function handleDelete(id: string) {
    if (!confirm(language === 'ar' ? 'حذف هذا التقييم؟' : 'Delete this review?')) return;
    try {
      const { error } = await supabase.from('reviews').delete().eq('id', id);
      if (error) throw error;
      toast.success(language === 'ar' ? 'تم الحذف' : 'Deleted');
      fetchReviews();
    } catch (error: any) {
      toast.error(error.message || (language === 'ar' ? 'فشل الحذف' : 'Delete failed'));
    }
  }

  const filtered = reviews.filter((r) => {
    if (tab === 'pending') return !r.is_approved;
    if (tab === 'approved') return r.is_approved;
    return true;
  });

  const pendingCount = reviews.filter((r) => !r.is_approved).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          {language === 'ar' ? 'تقييمات العملاء' : 'Customer Reviews'}
        </h1>
        <p className="text-gray-500 mt-1">
          {language === 'ar'
            ? `${pendingCount} تقييم في انتظار المراجعة`
            : `${pendingCount} review${pendingCount === 1 ? '' : 's'} awaiting moderation`}
        </p>
      </div>

      <div className="flex gap-2">
        {(['pending', 'approved', 'all'] as FilterTab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              tab === t ? 'bg-gold text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            {t === 'pending'
              ? (language === 'ar' ? 'قيد الانتظار' : 'Pending')
              : t === 'approved'
              ? (language === 'ar' ? 'معتمد' : 'Approved')
              : (language === 'ar' ? 'الكل' : 'All')}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm">
        {loading ? (
          <div className="p-10 text-center text-gray-400">{language === 'ar' ? 'جارٍ التحميل...' : 'Loading...'}</div>
        ) : filtered.length === 0 ? (
          <div className="p-10 text-center text-gray-400">
            <MessageSquareText className="h-8 w-8 mx-auto mb-3" />
            {language === 'ar' ? 'لا توجد تقييمات' : 'No reviews here'}
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filtered.map((review) => (
              <div key={review.id} className="p-5 flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-gold/10 text-gold flex items-center justify-center font-semibold flex-shrink-0">
                  {(review.profiles?.full_name || 'U')[0]?.toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div>
                      <p className="font-medium text-gray-900">{review.profiles?.full_name || 'User'}</p>
                      <p className="text-xs text-gray-500">
                        {language === 'ar' ? review.products?.name_ar : review.products?.name} ·{' '}
                        {formatDate(review.created_at, language)}
                      </p>
                    </div>
                    <span
                      className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                        review.is_approved ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                      }`}
                    >
                      {review.is_approved
                        ? (language === 'ar' ? 'معتمد' : 'Approved')
                        : (language === 'ar' ? 'قيد الانتظار' : 'Pending')}
                    </span>
                  </div>

                  <div className="flex items-center gap-0.5 my-1.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`h-3.5 w-3.5 ${s <= review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                      />
                    ))}
                  </div>

                  <p className="font-medium text-gray-900 text-sm">{review.title}</p>
                  <p className="text-gray-600 text-sm mt-0.5">{review.comment}</p>

                  <div className="flex items-center gap-2 mt-3">
                    {!review.is_approved ? (
                      <button
                        onClick={() => setApproval(review.id, true)}
                        className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md bg-green-600 text-white hover:bg-green-700"
                      >
                        <Check className="h-3.5 w-3.5" />
                        {language === 'ar' ? 'موافقة' : 'Approve'}
                      </button>
                    ) : (
                      <button
                        onClick={() => setApproval(review.id, false)}
                        className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200"
                      >
                        <X className="h-3.5 w-3.5" />
                        {language === 'ar' ? 'إلغاء الموافقة' : 'Unapprove'}
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(review.id)}
                      className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md bg-red-50 text-red-600 hover:bg-red-100"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      {language === 'ar' ? 'حذف' : 'Delete'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
