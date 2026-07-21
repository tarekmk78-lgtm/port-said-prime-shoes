import React from 'react';
import { MessageCircle } from 'lucide-react';
import { useI18n } from '../../lib/i18n';
import { useWhatsAppNumber } from '../../lib/settings-context';

/**
 * Site-wide floating WhatsApp button for general inquiries (not tied to a
 * specific product/cart). Pinned to the bottom-left of the screen — a fixed
 * screen position rather than a logical (RTL-aware) one — since react-hot-toast
 * is pinned bottom-right in both languages and the two shouldn't overlap.
 */
export function WhatsAppButton() {
  const { language } = useI18n();
  const whatsappNumber = useWhatsAppNumber();

  const message =
    language === 'ar'
      ? 'مرحباً، أريد الاستفسار عن منتجاتكم'
      : "Hello, I'd like to ask about your products";

  const href = `https://wa.me/${whatsappNumber.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={language === 'ar' ? 'تواصل معنا عبر واتساب' : 'Chat with us on WhatsApp'}
      className="fixed bottom-6 left-6 z-40 w-14 h-14 rounded-full bg-green-600 hover:bg-green-700 text-white shadow-lg flex items-center justify-center transition-transform hover:scale-105"
    >
      <MessageCircle className="h-7 w-7" />
    </a>
  );
}
