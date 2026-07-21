import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useI18n } from '../../lib/i18n';
import { useAuth } from '../../lib/auth-context';
import { supabase } from '../../lib/supabase';
import { Button } from '../ui/Button';
import { Star } from 'lucide-react';
import toast from 'react-hot-toast';

interface ReviewFormProps {
  productId: string;
  onSubmitted?: () => void;
}

export function ReviewForm({ productId, onSubmitted }: ReviewFormProps) {
  const { language } = useI18n();
  const { user } = useAuth();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!user) {
    return (
      <div className="bg-gray-50 rounded-lg p-6 text-center mb-6">
        <p className="text-gray-600 mb-3">
          {language === 'ar' ? 'سجّل دخولك لتتمكن من إضافة تقييم' : 'Sign in to write a review'}
        </p>
        <Link to="/login" className="text-gold font-medium hover:underline">
          {language === 'ar' ? 'تسجيل الدخول' : 'Sign In'}
        </Link>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="bg-green-50 border border-green-100 rounded-lg p-6 text-center mb-6">
        <p className="text-green-800 font-medium">
          {language === 'ar'
            ? 'شكراً لك! تقييمك قيد المراجعة وسيظهر بعد الموافقة عليه'
            : 'Thank you! Your review is pending approval and will appear once reviewed.'}
        </p>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (rating === 0) {
      toast.error(language === 'ar' ? 'من فضلك اختر تقييماً بالنجوم' : 'Please select a star rating');
      return;
    }
    setSubmitting(true);
    try {
      const { error } = await supabase.from('reviews').insert({
        product_id: productId,
        user_id: user.id,
        rating,
        title: title.trim() || (language === 'ar' ? 'تقييم' : 'Review'),
        comment: comment.trim(),
      });
      if (error) throw error;
      setSubmitted(true);
      onSubmitted?.();
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || (language === 'ar' ? 'حدث خطأ، حاول مرة أخرى' : 'Something went wrong'));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-gray-50 rounded-lg p-6 mb-6">
      <h4 className="font-medium mb-4">
        {language === 'ar' ? 'أضف تقييمك' : 'Write a review'}
      </h4>

      <div className="flex items-center gap-1 mb-4" onMouseLeave={() => setHoverRating(0)}>
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setRating(star)}
            onMouseEnter={() => setHoverRating(star)}
            className="p-0.5"
          >
            <Star
              className={`h-7 w-7 transition-colors ${
                star <= (hoverRating || rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'
              }`}
            />
          </button>
        ))}
      </div>

      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder={language === 'ar' ? 'عنوان مختصر (اختياري)' : 'Short title (optional)'}
        className="w-full h-11 px-4 mb-3 rounded-md border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-gold"
      />
      <textarea
        required
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        rows={3}
        placeholder={language === 'ar' ? 'شاركنا تجربتك مع المنتج...' : 'Share your experience with this product...'}
        className="w-full px-4 py-3 mb-4 rounded-md border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-gold resize-none"
      />

      <Button type="submit" disabled={submitting}>
        {submitting
          ? (language === 'ar' ? 'جارٍ الإرسال...' : 'Submitting...')
          : (language === 'ar' ? 'إرسال التقييم' : 'Submit Review')}
      </Button>
    </form>
  );
}
