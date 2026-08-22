import React, { useState } from 'react';
import { useI18n } from '../lib/i18n';
import { supabase } from '../lib/supabase';
import { MapPin, Phone, Mail, Clock, Send, MessageCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useSEO } from '../lib/seo';

export function ContactPage() {
  const { language } = useI18n();
  const whatsappNumber = '+20123456789';

  useSEO({
    title: language === 'ar' ? 'تواصل معنا' : 'Contact Us',
    description:
      language === 'ar'
        ? 'تواصل مع فريق بورسعيد برايم شوز لأي استفسار عن المنتجات أو الطلبات'
        : 'Get in touch with the Port Said Prime Shoes team for any product or order questions',
    url: '/contact',
  });
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', message: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const { error } = await supabase.from('contact_messages').insert({
        name: form.name,
        email: form.email,
        message: form.message,
      });
      if (error) throw error;
      toast.success(language === 'ar' ? 'تم إرسال رسالتك بنجاح' : 'Your message has been sent');
      setForm({ name: '', email: '', message: '' });
    } catch (error: any) {
      console.error('Error sending message:', error);
      toast.error(
        error.message?.includes('relation') || error.code === '42P01'
          ? (language === 'ar'
              ? 'الجدول غير موجود بعد — راجع ملف migrations/004_contact_messages.sql'
              : 'Table not found yet — run migrations/004_contact_messages.sql first')
          : (language === 'ar' ? 'حدث خطأ، حاول مرة أخرى' : 'Something went wrong, please try again')
      );
    } finally {
      setSubmitting(false);
    }
  };

  const info = [
    {
      icon: MapPin,
      title: language === 'ar' ? 'العنوان' : 'Address',
      text: language === 'ar' ? 'بورسعيد، مصر' : 'Port Said, Egypt',
    },
    {
      icon: Phone,
      title: language === 'ar' ? 'الهاتف' : 'Phone',
      text: '+20 123 456 789',
      href: 'tel:+20123456789',
    },
    {
      icon: Mail,
      title: language === 'ar' ? 'البريد الإلكتروني' : 'Email',
      text: 'info@clarksportsaid.com',
      href: 'mailto:info@clarksportsaid.com',
    },
    {
      icon: Clock,
      title: language === 'ar' ? 'ساعات العمل' : 'Working hours',
      text: language === 'ar' ? 'يومياً 10ص - 10م' : 'Daily 10am – 10pm',
    },
  ];

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* Hero banner */}
      <div className="bg-ink py-14 md:py-20">
        <div className="max-w-7xl mx-auto px-4 md:px-6 text-center">
          <span className="eyebrow justify-center text-gold-light">
            {language === 'ar' ? 'نحن هنا من أجلك' : "We're here for you"}
          </span>
          <h1 className="font-display text-3xl md:text-4xl font-semibold text-white mt-3">
            {language === 'ar' ? 'تواصل معنا' : 'Contact Us'}
          </h1>
          <p className="text-white/55 mt-3 max-w-xl mx-auto">
            {language === 'ar'
              ? 'لأي استفسار عن المنتجات، الطلبات، أو المقاسات، فريقنا في خدمتك'
              : 'For any question about products, orders, or sizing — our team is ready to help'}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-12 md:py-20">
        <div className="grid lg:grid-cols-5 gap-10 lg:gap-16">
          {/* Info column */}
          <div className="lg:col-span-2">
            <h2 className="font-display text-2xl font-semibold text-ink mb-6">
              {language === 'ar' ? 'بيانات التواصل' : 'Get in touch'}
            </h2>
            <div className="space-y-6 mb-10">
              {info.map((item, i) => (
                <div key={i} className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-full border border-gold/30 flex items-center justify-center flex-shrink-0">
                    <item.icon className="h-5 w-5 text-gold" strokeWidth={1.75} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">{item.title}</p>
                    {item.href ? (
                      <a href={item.href} className="text-ink font-medium hover:text-gold transition-colors">
                        {item.text}
                      </a>
                    ) : (
                      <p className="text-ink font-medium">{item.text}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="stitch-divider mb-8" />

            <a
              href={`https://wa.me/${whatsappNumber.replace(/\D/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 px-6 py-3.5 bg-green-600 text-white font-semibold rounded-sm hover:bg-green-700 transition-colors"
            >
              <MessageCircle className="h-5 w-5" />
              {language === 'ar' ? 'تواصل عبر واتساب' : 'Chat on WhatsApp'}
            </a>
          </div>

          {/* Form column */}
          <div className="lg:col-span-3">
            <div className="bg-white border border-hairline rounded-sm p-6 md:p-10">
              <h2 className="font-display text-2xl font-semibold text-ink mb-6">
                {language === 'ar' ? 'أرسل رسالة' : 'Send a message'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {language === 'ar' ? 'الاسم الكامل' : 'Full name'}
                  </label>
                  <input
                    required
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full h-12 px-4 rounded-sm border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {language === 'ar' ? 'البريد الإلكتروني' : 'Email'}
                  </label>
                  <input
                    required
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full h-12 px-4 rounded-sm border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {language === 'ar' ? 'رسالتك' : 'Message'}
                  </label>
                  <textarea
                    required
                    rows={5}
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    className="w-full px-4 py-3 rounded-sm border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent resize-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-2.5 px-7 py-3.5 bg-gold text-ink font-semibold rounded-sm hover:bg-gold-light transition-colors disabled:opacity-50"
                >
                  <Send className="h-4 w-4" />
                  {submitting
                    ? (language === 'ar' ? 'جارٍ الإرسال...' : 'Sending...')
                    : (language === 'ar' ? 'إرسال الرسالة' : 'Send Message')}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Map placeholder */}
      <div className="h-72 md:h-96 bg-gray-200 relative overflow-hidden">
        <iframe
          title="map"
          className="w-full h-full border-0"
          loading="lazy"
          src="https://www.google.com/maps?q=Port+Said,+Egypt&output=embed"
        />
      </div>
    </div>
  );
}
