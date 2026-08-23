import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from './supabase';
import { useAuth } from './auth-context';
import { Product, ProductVariant } from '../types';
import toast from 'react-hot-toast'; // ✅ تمت إضافة مكتبة التنبيهات

interface CartItem {
  id: string;
  product_id: string;
  product?: any;
  variant_id?: string;
  variant?: any;
  quantity: number;
  price: number;
}

interface CartContextType {
  items: CartItem[];
  loading: boolean;
  subtotal: number;
  discount: number;
  total: number;
  itemCount: number;
  addItem: (product: Product, variant: ProductVariant | null, quantity?: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  applyCoupon: (code: string) => Promise<{ success: boolean; message: string }>;
  removeCoupon: () => void;
  couponCode: string | null;
  couponDiscount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [couponCode, setCouponCode] = useState<string | null>(null);
  const [couponDiscount, setCouponDiscount] = useState(0);

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => {
    const price = item.variant?.price_adjustment
      ? item.price + item.variant.price_adjustment
      : item.price;
    return sum + price * item.quantity;
  }, 0);
  const discount = couponDiscount;
  const total = subtotal - discount;

  useEffect(() => {
    if (user) {
      fetchCartItems(user.id);
    } else {
      const savedCart = localStorage.getItem('cart');
      if (savedCart) {
        try {
          setItems(JSON.parse(savedCart));
        } catch (e) {
          localStorage.removeItem('cart');
        }
      }
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!user) {
      localStorage.setItem('cart', JSON.stringify(items));
    }
  }, [items, user]);

  const fetchCartItems = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('cart_items')
        .select(`
          *,
          products (*, categories (*)),
          product_variants (*)
        `)
        .eq('user_id', userId);

      if (error) throw error;

      const cartItems: CartItem[] = (data || []).map((item: any) => ({
        id: item.id,
        product_id: item.product_id,
        product: item.products,
        variant_id: item.variant_id,
        variant: item.product_variants,
        quantity: item.quantity,
        price: item.price,
      }));

      setItems(cartItems);
    } catch (error) {
      console.error('Error fetching cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const addItem = async (product: Product, variant: ProductVariant | null, quantity = 1) => {
    // ✅ منتجات كتير مفيهاش مقاسات/ألوان (variants) خالص، فمينفعش نمنع
    // الإضافة للسلة في الحالة دي. الشرط القديم كان بيرفض أي منتج من غير
    // variant حتى لو الصفحة نفسها سمحت بالإضافة - وده كان بيمنع "إضافة للسلة"
    // نهائياً على أي منتج مفيهوش variants.

    const existingIndex = items.findIndex(
      (item) => item.product_id === product.id && item.variant_id === (variant?.id ?? undefined)
    );

    if (existingIndex > -1) {
      const newQuantity = items[existingIndex].quantity + quantity;
      await updateQuantity(items[existingIndex].id, newQuantity);
      toast.success('تم تحديث الكمية في السلة');
      return;
    }

    // ✅ حساب السعر الصحيح بما فيه تعديل السعر للمقاس (لو موجود variant)
    const priceAdjustment = variant ? ((variant as ProductVariant & { price_adjustment?: number }).price_adjustment ?? 0) : 0;
    const finalPrice = product.price + priceAdjustment;

    const newItem: CartItem = {
      id: crypto.randomUUID(),
      product_id: product.id,
      product,
      variant_id: variant?.id,
      variant: variant ?? undefined,
      quantity,
      price: finalPrice,
    };

    if (user) {
      try {
        const insertPayload: Record<string, any> = {
          user_id: user.id,
          product_id: product.id,
          quantity,
          price: finalPrice,
        };
        // ✅ منبعتش variant_id خالص لو المنتج مفيهوش variant، بدل ما نبعت null
        // ممكن يعمل مشكلة لو العمود عنده NOT NULL/foreign key constraint
        if (variant?.id) {
          insertPayload.variant_id = variant.id;
        }

        const { data, error } = await supabase
          .from('cart_items')
          .insert(insertPayload)
          .select()
          .single();

        if (error) throw error;
        if (data) newItem.id = data.id;
        
      } catch (error) {
        console.error('Error adding to cart:', error);
        toast.error('حدث خطأ أثناء الحفظ في قاعدة البيانات');
        return; // إيقاف التنفيذ إذا فشل الحفظ
      }
    }

    setItems([...items, newItem]);
    toast.success('تمت إضافة المنتج للسلة بنجاح');
  };

  const removeItem = async (itemId: string) => {
    if (user) {
      try {
        await supabase.from('cart_items').delete().eq('id', itemId);
      } catch (error) {
        console.error('Error removing from cart:', error);
      }
    }
    setItems(items.filter((item) => item.id !== itemId));
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    if (quantity < 1) {
      await removeItem(itemId);
      return;
    }

    if (user) {
      try {
        await supabase
          .from('cart_items')
          .update({ quantity, updated_at: new Date().toISOString() })
          .eq('id', itemId);
      } catch (error) {
        console.error('Error updating cart:', error);
      }
    }

    setItems(
      items.map((item) =>
        item.id === itemId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = async () => {
    if (user) {
      try {
        await supabase.from('cart_items').delete().eq('user_id', user.id);
      } catch (error) {
        console.error('Error clearing cart:', error);
      }
    }
    setItems([]);
    setCouponCode(null);
    setCouponDiscount(0);
  };

  const applyCoupon = async (code: string): Promise<{ success: boolean; message: string }> => {
    try {
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .eq('code', code.toUpperCase()) // ✅ جعل الكود أحرف كبيرة لتجنب أخطاء المطابقة
        .eq('is_active', true)
        .single();

      if (error || !data) {
        return { success: false, message: 'كود الخصم غير صحيح' };
      }

      const now = new Date();
      const startsAt = new Date(data.starts_at);
      const expiresAt = new Date(data.expires_at);

      if (now < startsAt || now > expiresAt) {
        return { success: false, message: 'كود الخصم منتهي الصلاحية' };
      }

      if (data.max_uses && data.uses_count >= data.max_uses) {
        return { success: false, message: 'تم استخدام هذا الكود بالحد الأقصى' };
      }

      if (data.min_order_amount && subtotal < data.min_order_amount) {
        return {
          success: false,
          message: `الحد الأدنى للطلب لتفعيل الكود هو ${data.min_order_amount} ج.م`
        };
      }

      let discountAmount = 0;
      if (data.type === 'percentage') {
        discountAmount = (subtotal * data.value) / 100;
      } else {
        discountAmount = data.value;
      }

      setCouponCode(code.toUpperCase());
      setCouponDiscount(discountAmount);
      return { success: true, message: 'تم تطبيق كود الخصم بنجاح' };
    } catch (error) {
      return { success: false, message: 'حدث خطأ أثناء تطبيق الكود' };
    }
  };

  const removeCoupon = () => {
    setCouponCode(null);
    setCouponDiscount(0);
  };

  return (
    <CartContext.Provider
      value={{
        items,
        loading,
        subtotal,
        discount,
        total,
        itemCount,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        applyCoupon,
        removeCoupon,
        couponCode,
        couponDiscount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}