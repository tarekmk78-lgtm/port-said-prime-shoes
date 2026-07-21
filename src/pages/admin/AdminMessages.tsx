import React, { useEffect, useState } from 'react';
import { useI18n } from '../../lib/i18n';
import { supabase } from '../../lib/supabase';
import { ContactMessage } from '../../types';
import { formatDate } from '../../lib/utils';
import { Mail, MailOpen, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

export function AdminMessages() {
  const { language } = useI18n();
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<ContactMessage[]>([]);

  useEffect(() => {
    fetchMessages();
  }, []);

  async function fetchMessages() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('contact_messages')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  }

  async function markRead(message: ContactMessage) {
    if (message.is_read) return;
    await supabase.from('contact_messages').update({ is_read: true }).eq('id', message.id);
    setMessages((prev) => prev.map((m) => (m.id === message.id ? { ...m, is_read: true } : m)));
  }

  async function deleteMessage(id: string) {
    if (!confirm(language === 'ar' ? 'حذف هذه الرسالة؟' : 'Delete this message?')) return;
    try {
      const { error } = await supabase.from('contact_messages').delete().eq('id', id);
      if (error) throw error;
      setMessages((prev) => prev.filter((m) => m.id !== id));
      toast.success(language === 'ar' ? 'تم الحذف' : 'Deleted');
    } catch (error) {
      console.error(error);
    }
  }

  const unreadCount = messages.filter((m) => !m.is_read).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          {language === 'ar' ? 'رسائل التواصل' : 'Contact Messages'}
        </h1>
        <p className="text-gray-500 mt-1">
          {language === 'ar'
            ? `${unreadCount} رسالة غير مقروءة من ${messages.length}`
            : `${unreadCount} unread of ${messages.length}`}
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-gray-400">{language === 'ar' ? 'جارٍ التحميل...' : 'Loading...'}</div>
        ) : messages.length === 0 ? (
          <div className="p-10 text-center text-gray-400">
            <Mail className="h-8 w-8 mx-auto mb-3" />
            {language === 'ar' ? 'لا توجد رسائل بعد' : 'No messages yet'}
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {messages.map((message) => (
              <div
                key={message.id}
                onClick={() => markRead(message)}
                className={`p-5 flex items-start gap-4 cursor-pointer hover:bg-gray-50 ${!message.is_read ? 'bg-gold/5' : ''}`}
              >
                <div className="mt-1">
                  {message.is_read ? (
                    <MailOpen className="h-5 w-5 text-gray-300" />
                  ) : (
                    <Mail className="h-5 w-5 text-gold" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-3">
                    <p className={`font-medium ${!message.is_read ? 'text-gray-900' : 'text-gray-600'}`}>
                      {message.name}
                      <span className="text-gray-400 font-normal ms-2 text-sm">{message.email}</span>
                    </p>
                    <span className="text-xs text-gray-400 flex-shrink-0">{formatDate(message.created_at, language)}</span>
                  </div>
                  <p className="text-gray-500 mt-1 text-sm leading-relaxed">{message.message}</p>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); deleteMessage(message.id); }}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-md flex-shrink-0"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
