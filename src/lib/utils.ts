import { clsx, type ClassValue } from 'clsx';

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatPrice(price: number, currency = 'EGP', symbol = 'E£'): string {
  return `${symbol}${price.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `CLK-${timestamp}-${random}`;
}

export function getWhatsAppUrl(
  phone: string,
  product: { name: string; name_ar: string },
  variant?: { size: string; color: string } | null,
  quantity: number = 1,
  price: number = 0,
  lang: 'en' | 'ar' = 'en'
): string {
  const productName = lang === 'ar' ? product.name_ar : product.name;
  let message = lang === 'ar'
    ? `مرحباً، أريد طلب:\nالمنتج: ${productName}`
    : `Hello, I want to order:\nProduct: ${productName}`;

  if (variant) {
    message += lang === 'ar'
      ? `\nالمقاس: ${variant.size}\nاللون: ${variant.color}`
      : `\nSize: ${variant.size}\nColor: ${variant.color}`;
  }

  message += lang === 'ar'
    ? `\nالكمية: ${quantity}\nالسعر: ${formatPrice(price)}`
    : `\nQuantity: ${quantity}\nPrice: ${formatPrice(price)}`;

  const encodedMessage = encodeURIComponent(message);
  const cleanPhone = phone.replace(/\D/g, '');
  return `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
}

interface WhatsAppCartLine {
  name: string;
  name_ar: string;
  size?: string;
  color?: string;
  quantity: number;
  price: number;
}

/**
 * Builds a wa.me link carrying the full cart (one line per item, with size/color
 * when available) plus the order total — used by the "Order via WhatsApp" button
 * on the cart page as a checkout alternative for customers who prefer to order
 * directly through chat rather than filling a checkout form.
 */
export function getWhatsAppCartUrl(
  phone: string,
  items: WhatsAppCartLine[],
  total: number,
  lang: 'en' | 'ar' = 'en'
): string {
  const lines = items.map((item, index) => {
    const name = lang === 'ar' ? item.name_ar : item.name;
    let line = `${index + 1}. ${name} ×${item.quantity}`;
    const details: string[] = [];
    if (item.size) details.push(lang === 'ar' ? `مقاس ${item.size}` : `Size ${item.size}`);
    if (item.color) details.push(lang === 'ar' ? `لون ${item.color}` : `Color ${item.color}`);
    if (details.length) line += ` (${details.join(', ')})`;
    line += ` — ${formatPrice(item.price * item.quantity)}`;
    return line;
  });

  const header = lang === 'ar'
    ? `مرحباً، أريد طلب المنتجات التالية:\n`
    : `Hello, I'd like to order the following:\n`;

  const footer = lang === 'ar'
    ? `\n\nالإجمالي: ${formatPrice(total)}`
    : `\n\nTotal: ${formatPrice(total)}`;

  const message = header + lines.join('\n') + footer;
  const encodedMessage = encodeURIComponent(message);
  const cleanPhone = phone.replace(/\D/g, '');
  return `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.substring(0, length) + '...';
}

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export function getSizeSortValue(size: string): number {
  const sizeMap: Record<string, number> = {
    'Extra Small': 1,
    'XS': 1,
    'Small': 2,
    'S': 2,
    'Medium': 3,
    'M': 3,
    'Large': 4,
    'L': 4,
    'Extra Large': 5,
    'XL': 5,
    'XXL': 6,
    '2XL': 6,
    'XXXL': 7,
    '3XL': 7,
  };

  if (sizeMap[size]) return sizeMap[size];

  const numeric = parseFloat(size);
  if (!isNaN(numeric)) return numeric;

  return 99;
}

export function formatDate(date: string | Date, locale: string = 'en-US'): string {
  const d = new Date(date);
  return d.toLocaleDateString(locale === 'ar' ? 'ar-EG' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function getDiscountPercentage(price: number, compareAtPrice: number): number {
  if (!compareAtPrice || compareAtPrice <= price) return 0;
  return Math.round(((compareAtPrice - price) / compareAtPrice) * 100);
}

export function getProductStatus(
  stock: number,
  isNew: boolean,
  isBestseller: boolean,
  isFeatured: boolean,
  price: number,
  compareAtPrice: number | null
): string[] {
  const statuses: string[] = [];
  if (stock === 0) statuses.push('out-of-stock');
  if (isNew) statuses.push('new');
  if (isBestseller) statuses.push('bestseller');
  if (compareAtPrice && compareAtPrice > price) statuses.push('sale');
  return statuses;
}