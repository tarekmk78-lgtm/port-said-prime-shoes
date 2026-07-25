export interface User {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  avatar: string | null;
  avatar_url: string | null;
  date_of_birth: string | null;
  gender: string | null;
  email_verified: boolean;
  phone_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProductVariant {
  id: string;
  product_id: string;
  size: string;
  color: string;
  color_code: string | null;
  price: number | null;
  stock_quantity: number;
  sku: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  name_ar: string;
  slug: string;
  description: string | null;
  description_ar: string | null;
  image_url: string | null;
  parent_id: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at?: string;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  name_ar: string;
  slug: string;
  description: string;
  description_ar: string;
  price: number;
  compare_at_price: number | null;
  cost_price: number | null;
  category_id: string;
  category?: Category;  // ✅ أضفنا الخاصية دي
  brand: string | null;
  images: string[];
  tags: string[];
  is_featured: boolean;
  is_new: boolean;
  is_bestseller: boolean;
  is_active: boolean;
  stock_quantity: number;
  rating: number;
  reviews_count: number;
  variants?: ProductVariant[];  // ✅ أضفنا الخاصية دي
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  order_number: string;
  user_id: string;
  status: string;
  payment_status: string;
  shipping_address: any;
  billing_address: any;
  subtotal: number;
  discount: number;
  shipping_cost: number;
  tax: number;
  total: number;
  coupon_code: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  variant_id: string;
  quantity: number;
  price: number;
  total: number;
}

export interface Review {
  id: string;
  product_id: string;
  user_id: string;
  rating: number;
  title: string;
  comment: string;
  is_verified: boolean;
  is_approved: boolean;
  created_at: string;
  user?: {  // ✅ أضفنا الخاصية دي
    id?: string;
    full_name?: string;
    name?: string;
    avatar_url?: string;
  };
}

export interface CartItem {
  id: string;
  user_id: string | null;
  session_id: string | null;
  product_id: string;
  variant_id: string;
  quantity: number;
  price: number;
  created_at: string;
  updated_at: string;
}

export interface Address {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  phone: string;
  address_line1: string;
  address_line2: string | null;
  city: string;
  state: string | null;
  postal_code: string;
  country: string;
  is_default: boolean;
}

export interface Coupon {
  id: string;
  code: string;
  type: string;
  value: number;
  min_order_amount: number | null;
  max_uses: number | null;
  uses_count: number;
  starts_at: string;
  expires_at: string;
  is_active: boolean;
}

export interface Banner {
  id: string;
  title: string;
  title_ar: string;
  subtitle: string | null;
  subtitle_ar: string | null;
  image_url: string;
  video_url: string | null;
  link_url: string | null;
  button_text: string | null;
  button_text_ar: string | null;
  position: string;
  sort_order: number;
  is_active: boolean;
  starts_at: string | null;
  ends_at: string | null;
}

export interface Settings {
  id: string;
  site_name: string;
  site_name_ar: string;
  tagline: string | null;
  tagline_ar: string | null;
  logo_url: string | null;
  favicon_url: string | null;
  hero_title: string;
  hero_title_ar: string;
  hero_subtitle: string;
  hero_subtitle_ar: string;
  hero_video_url: string | null;
  hero_image_url: string | null;
  primary_color: string;
  secondary_color: string;
  contact_email: string;
  contact_phone: string;
  whatsapp_number: string;
  address: string;
  address_ar: string;
  social_facebook: string | null;
  social_instagram: string | null;
  social_twitter: string | null;
  social_youtube: string | null;
  meta_title: string;
  meta_title_ar: string;
  meta_description: string;
  meta_description_ar: string;
  currency: string;
  currency_symbol: string;
  shipping_cost: number;
  free_shipping_threshold: number;
  tax_rate: number;
}