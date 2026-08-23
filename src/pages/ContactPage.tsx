import React, { useState } from 'react';
import { useI18n } from '../lib/i18n';
import { useSettings } from '../lib/settings-context';
import { supabase } from '../lib/supabase';
import { Phone, Mail, MapPin, Clock, MessageCircle, Send } from 'lucide-react';
import toast from 'react-hot-toast';

export function ContactPage() {
  const { language } = useI18n();
  const { settings, loading } = useSettings(); // ✅ جلب الإعدادات من الـ Context
  
  const [sending, setSending] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });

  const handleWhatsAppClick = () => {
    const phoneNumber = (settings?.whatsapp_number || '201007526286').replace(/[^0-9]/g, '');
    const message = language === 'ar' 
      ? 'مرحباً، أريد التواصل معكم'
      : 'Hello, I would like to contact you';
    
    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);

    try {
      // ملاحظة: تأكد من وجود جدول contact_messages في قاعدة البيانات
      // أو يمكنك تغيير هذا الجزء ليرسل البيانات مباشرة للواتساب إذا لم يكن الجدول موجوداً
      const { error } = await supabase
        .from('contact_messages')
        .insert({
          name: formData.name,
          email: formData.email,
          message: formData.message,
          created_at: new Date().toISOString(),
        });

      if (error) throw error;

      toast.success(language === 'ar' ? 'تم إرسال رسالتك بنجاح' : 'Message sent successfully');
      setFormData({ name: '', email: '', message: '' });
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error(language === 'ar' ? 'حدث خطأ أثناء الإرسال' : 'Error sending message');
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#B8956E]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 md:px-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold text-center mb-12">
          {language === 'ar' ? 'بيانات التواصل' : 'Contact Information'}
        </h1>

        {/* Contact Info Cards */}
        <div className="space-y-6 mb-12">
          {/* Phone */}
          <div className="bg-white rounded-xl shadow-sm p-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center">
                <Phone className="h-6 w-6 text-[#B8956E]" />
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">{language === 'ar' ? 'الهاتف' : 'Phone'}</p>
                <p className="text-lg font-semibold text-gray-900">{settings?.contact_phone || '+20 100 752 6286'}</p>
              </div>
            </div>
          </div>

          {/* Email */}
          <div className="bg-white rounded-xl shadow-sm p-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center">
                <Mail className="h-6 w-6 text-[#B8956E]" />
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">{language === 'ar' ? 'البريد الإلكتروني' : 'Email'}</p>
                <p className="text-lg font-semibold text-gray-900">{settings?.contact_email || 'tarekmk78@gmail.com'}</p>
              </div>
            </div>
          </div>

          {/* Address */}
          <div className="bg-white rounded-xl shadow-sm p-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center">
                <MapPin className="h-6 w-6 text-[#B8956E]" />
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">{language === 'ar' ? 'العنوان' : 'Address'}</p>
                <p className="text-lg font-semibold text-gray-900">
                  {language === 'ar' ? (settings?.contact_address || 'بورسعيد، مصر') : (settings?.contact_address_en || 'Port Said, Egypt')}
                </p>
              </div>
            </div>
          </div>

          {/* Hours */}
          <div className="bg-white rounded-xl shadow-sm p-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center">
                <Clock className="h-6 w-6 text-[#B8956E]" />
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">{language === 'ar' ? 'ساعات العمل' : 'Working Hours'}</p>
                <p className="text-lg font-semibold text-gray-900">
                  {language === 'ar' ? 'يومياً 10 ص - 10 م' : 'Daily 10 AM - 10 PM'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* WhatsApp Button */}
        <button
          onClick={handleWhatsAppClick}
          className="w-full bg-green-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2 mb-12"
        >
          <MessageCircle className="h-6 w-6" />
          {language === 'ar' ? 'تواصل عبر واتساب' : 'Contact via WhatsApp'}
        </button>

        {/* Contact Form */}
        <div className="bg-white rounded-xl shadow-sm p-6 md:p-8">
          <h2 className="text-2xl font-bold text-center mb-8">
            {language === 'ar' ? 'أرسل رسالة' : 'Send a Message'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {language === 'ar' ? 'الاسم الكامل' : 'Full Name'}
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B8956E]"
                placeholder={language === 'ar' ? 'أدخل اسمك' : 'Enter your name'}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {language === 'ar' ? 'البريد الإلكتروني' : 'Email'}
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B8956E]"
                placeholder={language === 'ar' ? 'أدخل بريدك' : 'Enter your email'}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {language === 'ar' ? 'الرسالة' : 'Message'}
              </label>
              <textarea
                required
                rows={4}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B8956E]"
                placeholder={language === 'ar' ? 'اكتب رسالتك' : 'Write your message'}
              />
            </div>

            <button
              type="submit"
              disabled={sending}
              className="w-full bg-[#B8956E] text-white py-4 rounded-lg font-bold text-lg hover:bg-[#9e7d58] transition-colors flex items-center justify-center gap-2 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              <Send className="h-5 w-5" />
              {sending 
                ? (language === 'ar' ? 'جارٍ الإرسال...' : 'Sending...')
                : (language === 'ar' ? 'إرسال الرسالة' : 'Send Message')
              }
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}